import { animate, AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { TermInfo } from '../content';
import { feedbackComplete, feedbackCorrect, feedbackWrong } from '../lib/feedback';
import type { Exercise } from '../lib/exercises';
import { addXp, recordAnswer, saveCheckpoint } from '../lib/store';
import { advance, answer, current, isFinished, isTeaching, isTerm, summarize, type Outcome, type Session, type SessionSummary } from '../lib/session';
import { PASS_SCORE } from '../lib/path';
import { AnswerReveal, Build, ConceptCard, FactChoice, FactReveal, Match, MultipleChoice, QuizChoice, TeachFact, TeachPart, TeachTerm, TrueFalse, TypeAnswer, TypeFact, type CheckResult } from './exercises';
import { IconCheck, IconClose } from './Icons';
import { Bar, PartChip, Segmented, Sheet, T, Rich } from './ui';

const PRAISE = ['מצוין!', 'נכון!', 'יפה מאוד!', 'בדיוק!', 'כל הכבוד!'];

interface Props {
  initial: Session;
  onExit: () => void;
  registerBack?: (fn: (() => boolean) | null) => void;
  /** start another session from the results screen */
  onAgain?: (s: Session) => void;
  retry?: () => Session | null;
}

export function SessionView({ initial, onExit, retry, onAgain, registerBack }: Props) {
  const [session, setSession] = useState(initial);
  const [revealed, setRevealed] = useState<null | { outcome: Outcome; given?: string; ex: Exercise }>(null);
  const [ready, setReady] = useState(false);
  const [confirmQuit, setConfirmQuit] = useState(false);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const checkRef = useRef<() => CheckResult>(() => ({ outcome: 'wrong' }));
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);

  // Keep the revealed answer visible above the feedback banner.
  useLayoutEffect(() => {
    const el = feedbackRef.current;
    const root = rootRef.current;
    if (!el || !root) return;
    const set = () => root.style.setProperty('--fb-h', `${el.offsetHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  });

  const ex = current(session);
  const teaching = !!ex && isTeaching(ex);

  const bind = useCallback((r: boolean, check: () => CheckResult) => {
    setReady(r);
    checkRef.current = check;
  }, []);

  const finish = useCallback((s: Session) => {
    const sum = summarize(s);
    addXp(sum.xp);
    if ((s.kind === 'checkpoint' || s.kind === 'jump') && s.node) saveCheckpoint(s.node.id, sum.score, !!sum.passed);
    if (s.kind === 'intro' && s.node) saveCheckpoint(s.node.id, sum.score, true);
    setSummary(sum);
  }, []);

  const next = useCallback(
    (s: Session) => {
      const n = advance(s);
      setRevealed(null);
      setReady(false);
      if (isFinished(n)) finish(n);
      setSession(n);
    },
    [finish],
  );

  const submit = useCallback(
    (r: CheckResult) => {
      if (!ex) return;
      const { session: s, record } = answer(session, r.outcome, r.given);
      if (record) recordAnswer(record.id, record.outcome);
      if (session.mode === 'test' || ex.kind === 'match') {
        // tests: no per-item reveal (delayed feedback at the end)
        next(s);
        return;
      }
      if (r.outcome === 'wrong') feedbackWrong();
      else feedbackCorrect();
      setSession(s);
      setRevealed({ outcome: r.outcome, given: r.given, ex });
    },
    [ex, session, next],
  );

  // ignore a second tap/Enter that lands within the same beat (double-tap would skip feedback)
  const lastPress = useRef(0);
  const primary = () => {
    if (!ex) return;
    const now = performance.now();
    if (now - lastPress.current < 250) return;
    lastPress.current = now;
    if (teaching) return next(session);
    if (revealed) return next(session);
    if (ready) submit(checkRef.current());
  };

  // Enter = check / continue
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !summary && !confirmQuit) {
        e.preventDefault();
        if (!e.repeat) primary();
      }
      if (e.key === 'Escape' && !summary) setConfirmQuit((v) => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // Hardware/browser back: on the results screen it exits, mid-session it asks first.
  useEffect(() => {
    registerBack?.(() => {
      if (summary) {
        onExit();
        return false;
      }
      setConfirmQuit(true);
      return true;
    });
    return () => registerBack?.(null);
  }, [summary, onExit, registerBack]);

  const exit = onExit;

  const progress = session.queue.length ? session.index / session.queue.length : 0;

  if (summary) {
    return (
      <div className="session" dir="rtl">
        <Results
          session={session}
          summary={summary}
          onDone={exit}
          onRetry={
            retry
              ? () => {
                  const s = retry();
                  if (s) onAgain?.(s);
                }
              : undefined
          }
        />
      </div>
    );
  }

  const label = teaching ? 'המשך' : revealed ? 'המשך' : 'בדיקה';

  return (
    <div className="session" dir="rtl" ref={rootRef} data-revealed={revealed ? '' : undefined}>
      <div className="session-top">
        <button className="icon-btn" onClick={() => setConfirmQuit(true)} aria-label="יציאה">
          <IconClose />
        </button>
        <Bar value={progress} />
      </div>
      <div className="session-body">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={ex?.key}
            initial={reduce ? { opacity: 0 } : { opacity: 0, transform: 'translateX(-16px)' }}
            animate={{ opacity: 1, transform: 'translateX(0px)' }}
            exit={
              reduce
                ? { opacity: 0, transition: { duration: 0.12 } }
                : { opacity: 0, transform: 'translateX(12px)', transition: { duration: 0.12, ease: [0.23, 1, 0.32, 1] } }
            }
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
          >
            {session.mode === 'test' && session.index === 0 && (
              <p className="hint" style={{ marginBottom: 10 }}>
                במבחן אין משוב אחרי כל שאלה — בסוף תראו את כל התשובות. עוברים ב־{Math.round(PASS_SCORE * 100)}%.
              </p>
            )}
            {ex && <ExerciseBody ex={ex} revealed={!!revealed} testMode={session.mode === 'test'} bind={bind} done={submit} />}
          </motion.div>
        </AnimatePresence>
      </div>
      {ex?.kind !== 'match' && (
        <div className="session-foot">
          <button className="btn btn-primary press" disabled={!!revealed || (!teaching && !ready)} onClick={primary}>
            {label}
          </button>
        </div>
      )}

      <AnimatePresence>
        {revealed && (
          <motion.div
            ref={feedbackRef}
            className={`feedback ${revealed.outcome === 'wrong' ? 'bad' : 'ok'}`}
            initial={reduce ? { opacity: 0 } : { transform: 'translateY(100%)' }}
            animate={reduce ? { opacity: 1 } : { transform: 'translateY(0%)' }}
            exit={reduce ? { opacity: 0 } : { transform: 'translateY(100%)', transition: { duration: 0.18, ease: [0.23, 1, 0.32, 1] } }}
            transition={{ duration: 0.36, ease: [0.32, 0.72, 0, 1] }}
            role="status"
            aria-live="assertive"
          >
            <div className="feedback-inner">
              <Feedback revealed={revealed} />
              <button className="btn btn-primary press" onClick={primary} autoFocus>
                המשך
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Sheet open={confirmQuit} onOpenChange={setConfirmQuit} label="יציאה">
        <div style={{ textAlign: 'center', padding: '6px 0 4px' }}>
          <div style={{ fontSize: 44 }}>🫀</div>
          <div className="sheet-title">רגע, לצאת באמצע?</div>
          <p className="hint" style={{ marginBottom: 18 }}>
            מה שכבר עניתם נשמר באלגוריתם החזרות. השלב עצמו יסומן כגמור רק כשמסיימים אותו.
          </p>
          <button className="btn btn-primary press" onClick={() => setConfirmQuit(false)}>
            להמשיך ללמוד
          </button>
          <button className="btn btn-plain press" style={{ color: 'var(--red-text)', marginTop: 6 }} onClick={exit}>
            יציאה
          </button>
        </div>
      </Sheet>
    </div>
  );
}

function ExerciseBody({ ex, ...rest }: { ex: Exercise; revealed: boolean; testMode: boolean; bind: (r: boolean, c: () => CheckResult) => void; done: (r: CheckResult) => void }) {
  switch (ex.kind) {
    case 'teach-term':
      return <TeachTerm ex={ex} />;
    case 'teach-part':
      return <TeachPart ex={ex} />;
    case 'mc-meaning':
    case 'mc-term':
    case 'decode':
    case 'part-meaning':
      return <MultipleChoice ex={ex} {...rest} />;
    case 'build':
      return <Build ex={ex} {...rest} />;
    case 'type':
      return <TypeAnswer ex={ex} {...rest} />;
    case 'match':
      return <Match ex={ex} {...rest} />;
    case 'concept':
      return <ConceptCard ex={ex} />;
    case 'quiz':
      return <QuizChoice ex={ex} {...rest} />;
    case 'teach-fact':
      return <TeachFact ex={ex} />;
    case 'mc-fact':
      return <FactChoice ex={ex} {...rest} />;
    case 'tf-fact':
      return <TrueFalse ex={ex} {...rest} />;
    case 'type-fact':
      return <TypeFact ex={ex} {...rest} />;
  }
}

function Feedback({ revealed }: { revealed: { outcome: Outcome; given?: string; ex: Exercise } }) {
  const { outcome, ex, given } = revealed;
  const ok = outcome !== 'wrong';
  const [praise] = useState(() => PRAISE[Math.floor(Math.random() * PRAISE.length)]);
  const term = 'term' in ex ? (ex.term as TermInfo) : null;
  const fact = 'fact' in ex ? ex.fact : null;
  return (
    <>
      <div className="feedback-head">
        <span className="feedback-icon">{ok ? <IconCheck /> : <IconClose />}</span>
        {ok ? (outcome === 'typo' ? 'כמעט מושלם' : praise) : 'לא בדיוק'}
      </div>
      <div className="feedback-body">
        {outcome === 'typo' && (ex.kind === 'type' || ex.kind === 'type-fact') && (
          <p style={{ marginBottom: 8 }}>
            כתבתם <T>{given}</T> — האיות הנכון: <T className="seg root">{term?.word ?? fact?.a}</T>
          </p>
        )}
        {!ok && given && ex.kind !== 'part-meaning' && ex.kind !== 'tf-fact' && (
          <p style={{ marginBottom: 8, color: 'var(--label-2)' }}>
            עניתם: <span dir="auto">{given}</span>
          </p>
        )}
        {ex.kind === 'quiz' ? (
          <>
            {!ok && (
              <p style={{ marginBottom: 6 }}>
                התשובה הנכונה: <strong><Rich>{ex.options[ex.answer]}</Rich></strong>
              </p>
            )}
            {ex.item.explain && (
              <p style={{ color: 'var(--label-2)' }}>
                💡 <Rich>{ex.item.explain}</Rich>
              </p>
            )}
          </>
        ) : fact ? (
          <>
            {ex.kind === 'tf-fact' && (
              <p style={{ marginBottom: 6 }}>
                {ex.truth ? 'זו אכן התשובה הנכונה.' : 'זו לא התשובה הנכונה.'}
              </p>
            )}
            {(!ok || ex.kind === 'tf-fact') && <p style={{ marginBottom: 6 }}>התשובה הנכונה:</p>}
            <FactReveal fact={fact} full={!ok} />
            {ok && fact.explain && (
              <p style={{ marginTop: 6, color: 'var(--label-2)' }}>
                💡 <Rich>{fact.explain}</Rich>
              </p>
            )}
          </>
        ) : ex.kind === 'part-meaning' ? (
          <p>
            <PartChip part={ex.part} /> = <Rich>{ex.part.he}</Rich> · <T>{ex.part.en}</T>
          </p>
        ) : (
          term && (ok ? <ShortReveal term={term} /> : <AnswerReveal term={term} />)
        )}
      </div>
    </>
  );
}

const ShortReveal = ({ term }: { term: TermInfo }) => (
  <p>
    <strong style={{ fontSize: '1.1rem' }}>
      <Segmented term={term} />
    </strong>{' '}
    = <Rich>{term.he}</Rich>
  </p>
);

// ------------------------------------------------------------------ results

function Results({ session, summary, onDone, onRetry }: { session: Session; summary: SessionSummary; onDone: () => void; onRetry?: () => void }) {
  const reduce = useReducedMotion();
  const test = session.mode === 'test';
  const failed = summary.passed === false;
  const pct = Math.round(summary.score * 100);
  // passing a lecture's final test = the whole lecture is done
  const node = session.node;
  const lectureDone = !failed && test && node?.kind === 'checkpoint' && node.last ? node.unit : null;
  const emoji = lectureDone ? <img src="/boar.png" alt="" width={72} height={96} /> : failed ? '💪' : summary.score === 1 ? '🏆' : test ? '🎓' : '🎉';
  const title = lectureDone
    ? 'כל הכבוד!'
    : failed
      ? 'עוד קצת ועוברים'
      : test
        ? 'עברתם את המבחן!'
        : summary.score === 1
          ? 'מושלם!'
          : 'סיימתם!';
  const sub = lectureDone
    ? `סיימתם את כל החומר של הרצאה ${lectureDone.lecture}: ${lectureDone.title}${lectureDone.terms.length ? ` — ${lectureDone.terms.length} מונחים` : ''}. מכאן התרגול החכם ישמור עליו טרי עד המבחן.`
    : failed
      ? `קיבלתם ${pct}% — צריך ${Math.round(PASS_SCORE * 100)}% כדי לעבור. אפשר לנסות שוב מתי שרוצים, וגם לתרגל בינתיים בחופשיות.`
      : test
        ? 'השלב הבא במסלול נפתח.'
        : 'החומר נכנס לאלגוריתם החזרות — הוא יחזיר כל פריט בדיוק כשצריך.';
  const item = (i: number) =>
    reduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: i * 0.05 } }
      : {
          initial: { opacity: 0, transform: 'translateY(10px) scale(0.98)' },
          animate: { opacity: 1, transform: 'translateY(0px) scale(1)' },
          transition: { type: 'spring' as const, duration: 0.5, bounce: 0.25, delay: 0.08 + i * 0.06 },
        };
  // sound + haptic land on the frame the emoji spring settles (Apple: harmony)
  useEffect(() => {
    if (failed) return;
    const id = setTimeout(feedbackComplete, 220);
    return () => clearTimeout(id);
  }, [failed]);
  const reviewed = test ? session.answers.filter((a) => !a.retry && a.exercise.kind !== 'match') : [];

  return (
    <>
      <div className="session-body">
        {lectureDone && !reduce && <Confetti />}
        <div className="results">
          <motion.div
            className="results-emoji"
            initial={reduce ? { opacity: 0 } : { opacity: 0, transform: 'scale(0.6) rotate(-12deg)' }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, transform: 'scale(1) rotate(0deg)' }}
            transition={reduce ? { duration: 0.2 } : { type: 'spring', duration: 0.6, bounce: 0.45 }}
          >
            {emoji}
          </motion.div>
          <motion.div className="results-title" {...item(1)}>
            {title}
          </motion.div>
          <motion.p className="results-sub" {...item(2)}>
            {sub}
          </motion.p>
          <motion.div className="stat-grid" {...item(3)}>
            <div className="stat" style={{ ['--c' as string]: 'var(--orange)', ['--c-text' as string]: 'var(--orange-text)' }}>
              <div className="l">נקודות</div>
              <div className="v num">
                +<CountUp value={summary.xp} />
              </div>
            </div>
            <div
              className="stat"
              style={{ ['--c' as string]: failed ? 'var(--red)' : 'var(--green)', ['--c-text' as string]: failed ? 'var(--red-text)' : 'var(--green-text)' }}
            >
              <div className="l">דיוק</div>
              <div className="v num">
                <CountUp value={pct} />%
              </div>
            </div>
            <div className="stat" style={{ ['--c' as string]: 'var(--blue)', ['--c-text' as string]: 'var(--blue-text)' }}>
              <div className="l">זמן</div>
              <div className="v num">
                {Math.floor(summary.seconds / 60)}:{String(summary.seconds % 60).padStart(2, '0')}
              </div>
            </div>
          </motion.div>
          {summary.transferAsked > 0 && (
            <motion.p className="hint" {...item(4)}>
              ✨ פענחתם {summary.transferCorrect} מתוך {summary.transferAsked} מילים שלא למדתם — רק לפי החלקים.
            </motion.p>
          )}
          {reviewed.length > 0 && (
            <motion.div className="review-list" {...item(5)}>
              <div className="section-header">כל התשובות</div>
              <div className="list">
                {reviewed.map((a, i) => {
                  const ex = a.exercise;
                  const t = 'term' in ex ? (ex.term as TermInfo) : null;
                  const f = 'fact' in ex ? ex.fact : null;
                  const ok = a.outcome !== 'wrong';
                  return (
                    <div className="row" key={i}>
                      <span style={{ color: ok ? 'var(--green-text)' : 'var(--red-text)', width: 20, flex: 'none' }}>
                        {ok ? <IconCheck width={18} /> : <IconClose width={18} />}
                      </span>
                      <div className="row-main">
                        <div className="row-title">
                          {ex.kind === 'part-meaning' ? <PartChip part={ex.part} /> : f ? <Rich>{f.q}</Rich> : t && <Segmented term={t} />}
                          {ex.kind === 'decode' && <span className="row-sub"> · פענוח</span>}
                        </div>
                        <div className="row-sub">
                          <Rich>{ex.kind === 'part-meaning' ? ex.part.he : f ? f.a : t?.he}</Rich>
                          {!ok && a.given && (
                            <>
                              {' '}
                              · עניתם: <span dir="auto">{a.given}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
          {!test && summary.missed.length > 0 && (
            <motion.div className="review-list" {...item(5)}>
              <div className="section-header">כדאי לחזור על</div>
              <div className="list">
                {summary.missed.map((t) => (
                  <div className="row" key={t.id}>
                    <div className="row-main">
                      <div className="row-title">{isTerm(t) ? <Segmented term={t} /> : <Rich>{t.q}</Rich>}</div>
                      <div className="row-sub">
                        <Rich>{isTerm(t) ? t.he : t.a}</Rich>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <div className="session-foot" style={{ display: 'grid', gap: 6 }}>
        {failed && onRetry && (
          <button className="btn btn-primary press" onClick={onRetry}>
            לנסות שוב
          </button>
        )}
        <button className={`btn ${failed && onRetry ? 'btn-plain' : 'btn-primary'} press`} onClick={onDone} autoFocus>
          {failed ? 'חזרה' : 'המשך'}
        </button>
      </div>
    </>
  );
}


/** Counts up once on the results screen; writes to the DOM, not React state. */
function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    el.textContent = '0';
    const controls = animate(0, value, {
      duration: 0.7,
      delay: 0.3,
      ease: [0.23, 1, 0.32, 1],
      onUpdate: (v) => (el.textContent = String(Math.round(v))),
    });
    return () => controls.stop();
  }, [value, reduce]);
  return <span ref={ref}>{value}</span>;
}

/** Rare moment (a whole lecture done): word-part-coloured confetti, CSS transform/opacity only. */
function Confetti() {
  const [bits] = useState(() =>
    Array.from({ length: 28 }, (_, i) => ({
      x: Math.round((Math.random() * 2 - 1) * 150),
      y: Math.round(-90 - Math.random() * 160),
      r: Math.round((Math.random() * 2 - 1) * 360),
      c: ['var(--prefix)', 'var(--root)', 'var(--suffix)', 'var(--yellow)'][i % 4],
      d: Math.round(Math.random() * 120),
    })),
  );
  return (
    <div className="confetti" aria-hidden>
      {bits.map((b, i) => (
        <i
          key={i}
          style={{
            background: b.c,
            animationDelay: `${b.d}ms`,
            ['--x' as string]: `${b.x}px`,
            ['--y' as string]: `${b.y}px`,
            ['--r' as string]: `${b.r}deg`,
          }}
        />
      ))}
    </div>
  );
}
