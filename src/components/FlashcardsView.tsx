import { AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform, type PanInfo } from 'motion/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { FlashCard, FlashConfig } from '../lib/flash';
import { loadMissed, saveMissed } from '../lib/flash';
import { feedbackComplete, tick } from '../lib/feedback';
import { shuffle } from '../lib/random';
import { overlayOpen } from '../lib/back';
import { addXp } from '../lib/store';
import { IconCheck, IconClose, IconUndo } from './Icons';
import { Bar, PartsTable, Rich, Segmented, SpeakButton, T, typeName } from './ui';

const SWIPE = 90;

interface Step {
  knew: boolean;
  wasMissed: boolean;
}

export function FlashcardsView({ config, onExit }: { config: FlashConfig; onExit: () => void }) {
  const reduce = useReducedMotion();
  const [deck, setDeck] = useState(config.cards);
  const [round, setRound] = useState(1);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<string[]>([]);
  const [missed, setMissed] = useState<string[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [exitDir, setExitDir] = useState(1);
  const persisted = useRef(loadMissed(config.lectureId));
  const rewarded = useRef(new Set<number>());

  const done = i >= deck.length;
  const card = deck[i];

  const rate = (knew: boolean) => {
    if (!card) return;
    const set = persisted.current;
    const wasMissed = set.has(card.id);
    if (knew) set.delete(card.id);
    else set.add(card.id);
    saveMissed(config.lectureId, set);
    setSteps((s) => [...s, { knew, wasMissed }]);
    (knew ? setKnown : setMissed)((a) => [...a, card.id]);
    setExitDir(knew ? 1 : -1);
    setFlipped(false);
    setI((n) => n + 1);
    tick();
  };

  const undo = () => {
    const last = steps[steps.length - 1];
    const prev = deck[i - 1];
    if (!last || !prev) return;
    const set = persisted.current;
    if (last.wasMissed) set.add(prev.id);
    else set.delete(prev.id);
    saveMissed(config.lectureId, set);
    setSteps((s) => s.slice(0, -1));
    (last.knew ? setKnown : setMissed)((a) => a.slice(0, -1));
    setExitDir(0);
    setFlipped(false);
    setI((n) => n - 1);
  };

  const startRound = (cards: FlashCard[]) => {
    setDeck(shuffle(cards));
    setRound((r) => r + 1);
    setI(0);
    setKnown([]);
    setMissed([]);
    setSteps([]);
    setFlipped(false);
  };

  // finishing a round: points for what you knew (once per round) and the completion chime
  useEffect(() => {
    if (!done || rewarded.current.has(round)) return;
    rewarded.current.add(round);
    if (known.length) addXp(known.length);
    feedbackComplete();
  }, [done, round, known.length]);

  // keyboard: Space/Enter flip, → knew, ← didn't, Backspace undo, Escape close
  const keys = useRef<(e: KeyboardEvent) => void>(() => {});
  keys.current = (e) => {
    if (overlayOpen() || e.repeat) return;
    if (e.key === 'Escape') onExit();
    else if (done) return;
    else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      setFlipped((f) => !f);
    } else if (e.key === 'ArrowRight') rate(true);
    else if (e.key === 'ArrowLeft') rate(false);
    else if (e.key === 'Backspace') undo();
  };
  useEffect(() => {
    const h = (e: KeyboardEvent) => keys.current(e);
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const total = deck.length;

  return (
    <div className="session flash" dir="rtl">
      <div className="session-top">
        <button className="icon-btn" onClick={onExit} aria-label="סגירה">
          <IconClose />
        </button>
        <Bar value={total ? i / total : 0} />
        <bdi dir="ltr" className="flash-count num" aria-label={`כרטיס ${Math.min(i + 1, total)} מתוך ${total}`}>
          {Math.min(i + 1, total)}/{total}
        </bdi>
        <button className="icon-btn" onClick={undo} disabled={!steps.length || done} aria-label="ביטול הכרטיס הקודם">
          <IconUndo className="flip" />
        </button>
      </div>

      {done ? (
        <Summary
          round={round}
          known={known.length}
          missed={missed.length}
          reduce={!!reduce}
          onMissed={() => startRound(deck.filter((c) => missed.includes(c.id)))}
          onAll={() => startRound(config.cards)}
          onExit={onExit}
        />
      ) : (
        <>
          <div className="session-body flash-body">
            <div className="flash-stage">
              <AnimatePresence initial={false} custom={exitDir}>
                <SwipeCard
                  key={`${round}:${i}:${card.id}`}
                  card={card}
                  dir={config.dir}
                  flipped={flipped}
                  reduce={!!reduce}
                  onFlip={() => setFlipped((f) => !f)}
                  onSwipe={rate}
                />
              </AnimatePresence>
            </div>
            {round === 1 && i === 0 && (
              <p className="hint flash-hint">הקישו על הכרטיס כדי להפוך אותו. אפשר גם להחליק: ימינה אם ידעתם, שמאלה אם לא.</p>
            )}
          </div>
          <div className="session-foot flash-actions">
            <button className="btn flash-btn yes press" onClick={() => rate(true)}>
              <IconCheck width={20} height={20} /> ידעתי
            </button>
            <button className="btn flash-btn no press" onClick={() => rate(false)}>
              <IconClose width={18} height={18} /> לא ידעתי
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const exitVariants = {
  exit: (d: number) =>
    d === 0
      ? { opacity: 0, transition: { duration: 0.12 } }
      : { x: d * 520, rotate: d * 14, opacity: 0, transition: { duration: 0.32, ease: [0.23, 1, 0.32, 1] as const } },
};

function SwipeCard({
  card,
  dir,
  flipped,
  reduce,
  onFlip,
  onSwipe,
}: {
  card: FlashCard;
  dir: FlashConfig['dir'];
  flipped: boolean;
  reduce: boolean;
  onFlip: () => void;
  onSwipe: (knew: boolean) => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-240, 240], [-10, 10]);
  const yes = useTransform(x, [20, SWIPE], [0, 1]);
  const no = useTransform(x, [-SWIPE, -20], [1, 0]);
  const dragged = useRef(false);

  const end = (_: unknown, info: PanInfo) => {
    const dx = info.offset.x + info.velocity.x * 0.15;
    if (dx > SWIPE) onSwipe(true);
    else if (dx < -SWIPE) onSwipe(false);
  };

  return (
    <motion.div
      className="flash-swipe"
      style={reduce ? undefined : { x, rotate }}
      drag={reduce ? false : 'x'}
      dragSnapToOrigin
      dragElastic={0.9}
      onDragStart={() => (dragged.current = true)}
      onDragEnd={end}
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1, transition: { duration: 0.22, ease: [0.23, 1, 0.32, 1] } }}
      variants={reduce ? undefined : exitVariants}
      exit={reduce ? { opacity: 0, transition: { duration: 0.12 } } : 'exit'}
    >
      <div
        className="flash-card"
        data-flipped={flipped ? '' : undefined}
        role="button"
        tabIndex={0}
        aria-label={flipped ? 'הצד האחורי של הכרטיס — הקישו כדי להפוך בחזרה' : 'הקישו כדי לראות את התשובה'}
        onClick={() => {
          if (dragged.current) {
            dragged.current = false;
            return;
          }
          onFlip();
        }}
      >
        <div className="flash-face front" aria-hidden={flipped}>
          <Front card={card} dir={dir} />
        </div>
        <div className="flash-face back" aria-hidden={!flipped}>
          <Back card={card} dir={dir} />
        </div>
      </div>
      {!reduce && (
        <>
          <motion.span className="flash-stamp yes" style={{ opacity: yes }} aria-hidden>
            ידעתי
          </motion.span>
          <motion.span className="flash-stamp no" style={{ opacity: no }} aria-hidden>
            לא ידעתי
          </motion.span>
        </>
      )}
    </motion.div>
  );
}

/** Keeps taps on inner controls (the speaker) from flipping or dragging the card. */
const Inert = ({ children }: { children: ReactNode }) => (
  <span onClick={(e) => e.stopPropagation()} onPointerDownCapture={(e) => e.stopPropagation()}>
    {children}
  </span>
);

function Front({ card, dir }: { card: FlashCard; dir: FlashConfig['dir'] }) {
  const { term: t, part: p, fact: f } = card;
  if (f)
    return dir === 'en-he' ? (
      <>
        <div className="flash-kicker">מה התשובה?</div>
        <div className="flash-he">
          <Rich>{f.q}</Rich>
        </div>
      </>
    ) : (
      <>
        <div className="flash-kicker">על איזו שאלה זו התשובה?</div>
        <div className="flash-he">
          <Rich>{f.a}</Rich>
        </div>
      </>
    );
  if (t)
    return dir === 'en-he' ? (
      <>
        <div className="flash-kicker">מה פירוש המונח?</div>
        <div className="flash-word" style={{ fontSize: `${Math.max(20, Math.min(36, Math.floor(200 / (0.52 * t.word.length))))}px` }}>
          <T>{t.word}</T>
        </div>
        <Inert>
          <SpeakButton word={t.word} />
        </Inert>
      </>
    ) : (
      <>
        <div className="flash-kicker">מה המונח באנגלית?</div>
        <div className="flash-he">
          <Rich>{t.meaning}</Rich>
        </div>
      </>
    );
  if (!p) return null;
  return dir === 'en-he' ? (
    <>
      <div className="flash-kicker">{typeName[p.type]} · מה הפירוש?</div>
      <span className={`chip ${p.type} flash-chip`}>{p.label}</span>
    </>
  ) : (
    <>
      <div className="flash-kicker">{p.type === 'root' ? 'איזה שורש?' : `איזו ${typeName[p.type]}?`}</div>
      <div className="flash-he">
        <Rich>{p.he}</Rich>
      </div>
    </>
  );
}

function Back({ card, dir }: { card: FlashCard; dir: FlashConfig['dir'] }) {
  const { term: t, part: p, fact: f } = card;
  if (f)
    return (
      <>
        {dir === 'he-en' && (
          <div className="flash-kicker">
            <Rich>{f.q}</Rich>
          </div>
        )}
        <div className="teach-meaning">
          <Rich>{f.a}</Rich>
        </div>
        {f.slide && <div className="teach-en">שקף <bdi className="num">{f.slide}</bdi>{f.deck && <> · <bdi>{f.deck}</bdi></>}</div>}
        {f.explain && (
          <p className="explain">
            💡 <Rich>{f.explain}</Rich>
          </p>
        )}
      </>
    );
  if (t)
    return (
      <>
        <div className="flash-word sm">
          <Segmented term={t} />
        </div>
        <div className="teach-meaning">
          <Rich>{t.he}</Rich>
        </div>
        <div className="teach-en">
          <T>{t.en}</T>
        </div>
        <PartsTable term={t} />
        {t.explain && (
          <p className="explain">
            💡 <Rich>{t.explain}</Rich>
          </p>
        )}
      </>
    );
  if (!p) return null;
  return (
    <>
      <span className={`chip ${p.type} flash-chip sm`}>{p.label}</span>
      <div className="teach-meaning">
        <Rich>{p.he}</Rich>
      </div>
      <div className="teach-en">
        {typeName[p.type]} · <T>{p.en}</T>
      </div>
      {p.note && (
        <p className="explain">
          💡 <Rich>{p.note}</Rich>
        </p>
      )}
      {card.examples && card.examples.length > 0 && (
        <div className="flash-examples">
          <div className="flash-kicker">מהמצגת</div>
          {card.examples.map((e) => (
            <div key={e.id} className="flash-example">
              <span className="dict-term">
                <Segmented term={e} />
              </span>
              <span className="row-sub">
                <Rich>{e.he}</Rich>
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function Summary({
  round,
  known,
  missed,
  reduce,
  onMissed,
  onAll,
  onExit,
}: {
  round: number;
  known: number;
  missed: number;
  reduce: boolean;
  onMissed: () => void;
  onAll: () => void;
  onExit: () => void;
}) {
  const total = known + missed;
  const perfect = missed === 0;
  return (
    <>
      <div className="session-body">
        <div className="results">
          <motion.div
            className="results-emoji"
            initial={reduce ? { opacity: 0 } : { opacity: 0, transform: 'scale(0.6)' }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, transform: 'scale(1)' }}
            transition={reduce ? { duration: 0.2 } : { type: 'spring', duration: 0.6, bounce: 0.45 }}
          >
            {perfect ? <img src="/mascot.png" alt="" width={114} height={96} /> : '💪'}
          </motion.div>
          <div className="results-title">{perfect ? (round === 1 ? 'ידעתם הכול!' : 'עכשיו ידעתם הכול!') : `ידעתם ${known} מתוך ${total}`}</div>
          <p className="results-sub">
            {perfect
              ? 'כל הכרטיסיות בסבב הזה סומנו "ידעתי". מעולה לפני המבחן.'
              : missed === 1
                ? 'נשאר כרטיס אחד לחזור עליו. הוא נשמר, ואפשר להמשיך ממנו גם בפעם הבאה.'
                : `נשארו ${missed} כרטיסיות לחזור עליהן. הן נשמרות, ואפשר להמשיך מהן גם בפעם הבאה.`}
          </p>
          <div className="stat-grid flash-stats">
            <div className="stat" style={{ ['--c' as string]: 'var(--green)', ['--c-text' as string]: 'var(--green-text)' }}>
              <div className="l">ידעתי</div>
              <div className="v num">{known}</div>
            </div>
            <div className="stat" style={{ ['--c' as string]: 'var(--red)', ['--c-text' as string]: 'var(--red-text)' }}>
              <div className="l">לא ידעתי</div>
              <div className="v num">{missed}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="session-foot" style={{ display: 'grid', gap: 8 }}>
        {perfect ? (
          <>
            <button className="btn btn-primary press" onClick={onExit}>
              סיום
            </button>
            <button className="btn btn-secondary press" onClick={onAll}>
              כל החפיסה שוב
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-primary press" onClick={onMissed}>
              {missed === 1 ? 'לחזור על הכרטיס שלא ידעתי' : `לחזור על ${missed} שלא ידעתי`}
            </button>
            <button className="btn btn-secondary press" onClick={onAll}>
              כל החפיסה מחדש
            </button>
            <button className="btn btn-plain press" onClick={onExit}>
              סיום
            </button>
          </>
        )}
      </div>
    </>
  );
}
