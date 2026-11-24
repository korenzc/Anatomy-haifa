import { useEffect, useMemo, useRef, useState } from 'react';
import { facts as allFacts, formLabel, partAt, termById, terms as allTerms, termsWithPart, type FactInfo, type TermInfo } from '../content';
import type { Exercise } from '../lib/exercises';
import { shuffle } from '../lib/random';
import type { Outcome } from '../lib/session';
import { judgeTyped } from '../lib/text';
import { overlayOpen } from '../lib/back';
import { feedbackWrong, tick } from '../lib/feedback';
import { IconSparkle } from './Icons';
import { Chip, Legend, PartChip, PartsTable, Segmented, SpeakButton, T, typeName, Rich } from './ui';

export interface CheckResult {
  outcome: Outcome;
  given?: string;
}

/** Each exercise reports whether it can be checked, and how. The footer button calls `check`. */
export interface ExerciseProps<E extends Exercise = Exercise> {
  ex: E;
  /** after checking, the exercise shows the reveal state (learn mode only) */
  revealed: boolean;
  testMode: boolean;
  bind: (ready: boolean, check: () => CheckResult) => void;
  /** for exercises that finish themselves (match) */
  done: (r: CheckResult) => void;
}

const KEYS = ['1', '2', '3', '4'];

/** ?e2e marks correct answers in the DOM so automated UI tests can play a perfect game. */
const E2E = typeof location !== 'undefined' && new URLSearchParams(location.search).has('e2e');

// ------------------------------------------------------------------ teaching cards

export function TeachTerm({ ex }: { ex: Extract<Exercise, { kind: 'teach-term' }> }) {
  const t = ex.term;
  return (
    <div className="teach">
      <span className="teach-badge">מילה חדשה</span>
      <div className="card teach-card">
        <div className="term-line">
          <div className="ex-term">
            <Segmented term={t} />
          </div>
          <SpeakButton word={t.word} />
        </div>
        <div className="teach-meaning"><Rich>{t.he}</Rich></div>
        <div className="teach-en">
          <T>{t.en}</T>
        </div>
        {t.latin && (
          <div className="teach-en">
            <T>
              <i>{t.latin}</i>
            </T>
          </div>
        )}
        <PartsTable term={t} />
      </div>
      {t.explain && <p className="explain">💡 <Rich>{t.explain}</Rich></p>}
      {t.parts && t.parts.length > 0 && <Legend />}
    </div>
  );
}

export function TeachPart({ ex }: { ex: Extract<Exercise, { kind: 'teach-part' }> }) {
  const p = ex.part;
  const family = termsWithPart(p.key).slice(0, 6);
  return (
    <div className="teach">
      <span className="teach-badge">{p.type === 'root' ? 'שורש חדש' : `${typeName[p.type]} חדשה`}</span>
      <div className="card teach-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2.25rem', marginBottom: 6 }}>
          <PartChip part={p} />
        </div>
        <div className="teach-meaning"><Rich>{p.he}</Rich></div>
        <div className="teach-en" style={{ textAlign: 'center' }}>
          <T>{p.en}</T>
        </div>
        {p.forms.length > 1 && (
          <div className="hint">
            מופיע גם כ:{' '}
            {p.forms.map((f) => (
              <span key={f} style={{ marginInlineEnd: 6 }}>
                <Chip type={p.type}>{formLabel(f)}</Chip>
              </span>
            ))}
          </div>
        )}
      </div>
      {p.note && <p className="explain">💡 <Rich>{p.note}</Rich></p>}
      {family.length > 0 && (
        <div>
          <div className="section-header" style={{ padding: '4px 4px 6px' }}>
            מילים שתפגשו עם החלק הזה
          </div>
          <div className="family">
            {family.map((t) => (
              <Segmented key={t.id} term={t} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ multiple choice

type MCEx = Extract<Exercise, { kind: 'mc-meaning' | 'mc-term' | 'decode' | 'part-meaning' }>;

export function MultipleChoice({ ex, revealed, testMode, bind }: ExerciseProps<MCEx>) {
  const [sel, setSel] = useState<number | null>(null);
  const options = ex.options as Array<{ id: string; he: string; meaning?: string; word?: string; label?: string }>;
  const correctIdx = options.findIndex((o) => o.id === (ex.kind === 'part-meaning' ? ex.part.id : ex.term.id));
  const optionText = (o: (typeof options)[number]) => (ex.kind === 'mc-term' ? <T>{o.word}</T> : <Rich>{o.meaning ?? o.he}</Rich>);
  const givenText = (i: number) => (ex.kind === 'mc-term' ? options[i].word : options[i].meaning ?? options[i].he);

  useEffect(() => {
    bind(sel !== null, () => ({ outcome: sel === correctIdx ? 'correct' : 'wrong', given: sel !== null ? givenText(sel) : undefined }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel]);

  useEffect(() => {
    if (revealed) return;
    const onKey = (e: KeyboardEvent) => {
      const i = KEYS.indexOf(e.key);
      if (i >= 0 && i < options.length && !overlayOpen()) setSel(i);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [revealed, options.length]);

  return (
    <>
      {ex.kind === 'mc-meaning' && (
        <>
          <div className="ex-kicker">מה פירוש המונח?</div>
          <div className="term-line" style={{ marginBottom: 22 }}>
            <div className="ex-term" style={{ fontSize: `${Math.max(20, Math.min(32, Math.floor(270 / (0.52 * ex.term.word.length))))}px` }}>
              <T>{ex.term.word}</T>
            </div>
            <SpeakButton word={ex.term.word} />
          </div>
        </>
      )}
      {ex.kind === 'decode' && (
        <>
          <div className="ex-kicker">
            <IconSparkle width={16} height={16} /> מילה שעוד לא למדתם — פענחו לפי החלקים
          </div>
          <div className="term-line" style={{ marginBottom: 22 }}>
            <div className="ex-term">
              <Segmented term={ex.term} />
            </div>
            <SpeakButton word={ex.term.word} />
          </div>
        </>
      )}
      {ex.kind === 'mc-term' && (
        <>
          <div className="ex-kicker">איזה מונח מתאים?</div>
          <div className="ex-prompt"><Rich>{ex.term.meaning}</Rich></div>
        </>
      )}
      {ex.kind === 'part-meaning' && (
        <>
          <div className="ex-kicker">מה פירוש ה{typeName[ex.part.type]}?</div>
          <div style={{ fontSize: '2.25rem', marginBottom: 22 }}>
            <PartChip part={ex.part} />
          </div>
        </>
      )}
      <div className="options" role="radiogroup">
        {options.map((o, i) => {
          const state = revealed && !testMode ? (i === correctIdx ? 'correct' : i === sel ? 'wrong' : '') : '';
          return (
            <button
              key={o.id}
              role="radio"
              aria-checked={sel === i}
              aria-pressed={sel === i}
              className={`option press ${state}`}
              data-correct={E2E && i === correctIdx ? '' : undefined}
              disabled={revealed}
              onPointerDown={() => !revealed && setSel(i)}
              onClick={() => !revealed && setSel(i)}
            >
              <span className="key" aria-hidden>
                {i + 1}
              </span>
              <span>{optionText(o)}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

// ------------------------------------------------------------------ build from parts

export function Build({ ex, revealed, bind }: ExerciseProps<Extract<Exercise, { kind: 'build' }>>) {
  const [placed, setPlaced] = useState<number[]>([]);
  const assembled = placed.map((i) => ex.tiles[i].form).join('');
  useEffect(() => {
    bind(placed.length > 0, () => ({
      outcome: assembled === ex.term.word ? 'correct' : 'wrong',
      given: placed.map((i) => formLabel(ex.tiles[i].form, ex.tiles[i].type)).join(' + '),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placed]);

  const add = (i: number) => {
    if (revealed || placed.includes(i)) return;
    tick();
    setPlaced((p) => [...p, i]);
  };
  const remove = (i: number) => !revealed && setPlaced((p) => p.filter((x) => x !== i));

  return (
    <>
      <div className="ex-kicker hard">תרגיל קשה · הרכיבו את המונח</div>
      <div className="ex-prompt"><Rich>{ex.term.meaning}</Rich></div>
      <div className="slots-preview" aria-live="polite">
        {placed.map((i, k) => (
          <span key={k} className={`seg ${ex.tiles[i].type}`}>
            {ex.tiles[i].form}
          </span>
        ))}
      </div>
      <div className="slots" aria-label="המילה שהרכבתם">
        {placed.length === 0 && <span style={{ color: 'var(--label-2)', direction: 'rtl' }}>הקישו על החלקים לפי הסדר</span>}
        {placed.map((i) => (
          <button key={i} className={`tile placed press ${ex.tiles[i].type}`} onClick={() => remove(i)} disabled={revealed}>
            {formLabel(ex.tiles[i].form, ex.tiles[i].type)}
          </button>
        ))}
      </div>
      <div className="tiles">
        {ex.tiles.map((tile, i) => (
          <button
            key={i}
            className={`tile press ${tile.type} ${placed.includes(i) ? 'used' : ''}`}
            data-order={E2E ? orderOf(ex.term.parts ?? [], ex.tiles, i) : undefined}
            onClick={() => add(i)}
            disabled={revealed}
            aria-hidden={placed.includes(i)}
          >
            {formLabel(tile.form, tile.type)}
          </button>
        ))}
      </div>
    </>
  );
}

/** position of tile i in the correct answer (e2e only), or -1 for decoys */
function orderOf(forms: string[], tiles: { form: string }[], i: number) {
  const used = new Set<number>();
  for (let k = 0; k < forms.length; k++) {
    const j = tiles.findIndex((t, idx) => !used.has(idx) && t.form === forms[k]);
    used.add(j);
    if (j === i) return k;
  }
  return -1;
}

// ------------------------------------------------------------------ typed recall

const allWords = allTerms.map((t) => t.word);

export function TypeAnswer({ ex, revealed, bind }: ExerciseProps<Extract<Exercise, { kind: 'type' }>>) {
  const [value, setValue] = useState('');
  const [hint, setHint] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const id = setTimeout(() => input.current?.focus({ preventScroll: true }), 250);
    return () => clearTimeout(id);
  }, []);
  useEffect(() => {
    bind(value.trim().length > 0, () => {
      const v = judgeTyped(value, ex.term.word, allWords);
      const outcome: Outcome = v === 'wrong' ? 'wrong' : v === 'typo' || hint ? 'typo' : 'correct';
      return { outcome, given: value.trim() };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, hint]);

  return (
    <>
      <div className="ex-kicker hard">תרגיל קשה · כתבו את המונח באנגלית</div>
      <div className="ex-prompt"><Rich>{ex.term.meaning}</Rich></div>
      <input
        ref={input}
        data-answer={E2E ? ex.term.word : undefined}
        className="type-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={revealed}
        dir="ltr"
        lang="en"
        inputMode="text"
        autoCapitalize="none"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="done"
        aria-label="המונח באנגלית"
        placeholder="type the term…"
      />
      {ex.term.parts && ex.term.parts.length > 1 && (
        <div className="hint">
          {hint ? (
            <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              רמז:{' '}
              {ex.term.parts.map((_, i) => {
                const p = partAt(ex.term, i);
                return p ? (
                  <Chip key={i} type={p.type}>
                    <Rich>{p.he}</Rich>
                  </Chip>
                ) : null;
              })}
            </span>
          ) : (
            !revealed && (
              <button className="btn-plain" onClick={() => setHint(true)}>
                צריכים רמז? הציגו את פירוש החלקים
              </button>
            )
          )}
        </div>
      )}
    </>
  );
}

// ------------------------------------------------------------------ matching pairs

export function Match({ ex, done }: ExerciseProps<Extract<Exercise, { kind: 'match' }>>) {
  const left = useMemo(() => shuffle(ex.terms), [ex]);
  const right = useMemo(() => shuffle(ex.terms), [ex]);
  const [selL, setSelL] = useState<string | null>(null);
  const [selR, setSelR] = useState<string | null>(null);
  const [ok, setOk] = useState<string[]>([]);
  const [bad, setBad] = useState<string[]>([]);
  const mistakes = useRef(0);

  useEffect(() => {
    if (!selL || !selR) return;
    if (selL === selR) {
      tick();
      const next = [...ok, selL];
      setOk(next);
      setSelL(null);
      setSelR(null);
      if (next.length === ex.terms.length) setTimeout(() => done({ outcome: mistakes.current ? 'typo' : 'correct' }), 350);
    } else {
      mistakes.current++;
      feedbackWrong();
      setBad([`L${selL}`, `R${selR}`]);
      const id = setTimeout(() => {
        setBad([]);
        setSelL(null);
        setSelR(null);
      }, 420);
      return () => clearTimeout(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selL, selR]);

  const item = (t: TermInfo, side: 'L' | 'R') => {
    const sel = side === 'L' ? selL : selR;
    const set = side === 'L' ? setSelL : setSelR;
    return (
      <button
        key={side + t.id}
        data-id={E2E ? t.id : undefined}
        className={`match-item press ${side === 'L' ? 'term-side' : ''} ${ok.includes(t.id) ? 'ok' : ''} ${bad.includes(side + t.id) ? 'bad' : ''}`}
        aria-pressed={sel === t.id}
        onClick={() => set(t.id)}
      >
        {side === 'L' ? <T>{t.word}</T> : <Rich>{t.meaning}</Rich>}
      </button>
    );
  };

  return (
    <>
      <div className="ex-kicker">התאימו כל מונח לפירוש שלו</div>
      <div className="ex-prompt">התאמת זוגות</div>
      <div className="match">
        <div className="match-col">{left.map((t) => item(t, 'L'))}</div>
        <div className="match-col">{right.map((t) => item(t, 'R'))}</div>
      </div>
    </>
  );
}

// ------------------------------------------------------------------ feedback body

export function AnswerReveal({ term }: { term: TermInfo }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>
          <Segmented term={term} />
        </span>
        <span>= <Rich>{term.he}</Rich></span>
      </div>
      <PartsTable term={term} />
      {term.explain && <p style={{ marginTop: 10, color: 'var(--label-2)' }}>💡 <Rich>{term.explain}</Rich></p>}
    </div>
  );
}

// ------------------------------------------------------------------ concepts & rules quiz

export function ConceptCard({ ex }: { ex: Extract<Exercise, { kind: 'concept' }> }) {
  const example = ex.concept.example ? termById.get(`t:${ex.concept.example}`) : undefined;
  return (
    <div className="teach">
      <span className="teach-badge">
        איך זה עובד · <bdi className="num">{ex.n}/{ex.total}</bdi>
      </span>
      <div className="card teach-card">
        <div className="teach-meaning" style={{ marginTop: 0 }}>
          <Rich>{ex.concept.title}</Rich>
        </div>
        <p style={{ marginTop: 10, fontSize: 'var(--fs-body)' }}>
          <Rich>{ex.concept.body}</Rich>
        </p>
        {example && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '0.5px solid var(--separator)' }}>
            <div className="term-line">
              <div className="ex-term" style={{ fontSize: '1.6rem' }}>
                <Segmented term={example} />
              </div>
              <SpeakButton word={example.word} />
            </div>
            <div style={{ fontWeight: 600, marginTop: 4 }}>
              <Rich>{example.he}</Rich>
            </div>
            <PartsTable term={example} />
          </div>
        )}
      </div>
      {example?.parts && <Legend />}
    </div>
  );
}

export function QuizChoice({ ex, revealed, testMode, bind }: ExerciseProps<Extract<Exercise, { kind: 'quiz' }>>) {
  const [sel, setSel] = useState<number | null>(null);
  useEffect(() => {
    bind(sel !== null, () => ({ outcome: sel === ex.answer ? 'correct' : 'wrong', given: sel !== null ? ex.options[sel] : undefined }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel]);
  useEffect(() => {
    if (revealed) return;
    const onKey = (e: KeyboardEvent) => {
      const i = KEYS.indexOf(e.key);
      if (i >= 0 && i < ex.options.length && !overlayOpen()) setSel(i);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [revealed, ex.options.length]);
  return (
    <>
      <div className="ex-kicker">שאלה על הכללים</div>
      <div className="ex-prompt">
        <Rich>{ex.item.q}</Rich>
      </div>
      <div className="options" role="radiogroup">
        {ex.options.map((o, i) => {
          const state = revealed && !testMode ? (i === ex.answer ? 'correct' : i === sel ? 'wrong' : '') : '';
          return (
            <button
              key={i}
              role="radio"
              aria-checked={sel === i}
              aria-pressed={sel === i}
              className={`option press ${state}`}
              data-correct={E2E && i === ex.answer ? '' : undefined}
              disabled={revealed}
              onPointerDown={() => !revealed && setSel(i)}
              onClick={() => !revealed && setSel(i)}
            >
              <span className="key" aria-hidden>
                {i + 1}
              </span>
              <span>
                <Rich>{o}</Rich>
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

// ------------------------------------------------------------------ facts from the slides

/** "שקף 12" — where in the deck this comes from ("שקף 12 · Heart Scan" when the lecture has more than one deck). */
export const SlideRef = ({ f }: { f: FactInfo }) =>
  f.slide ? (
    <span className="slide-ref">
      שקף <bdi className="num">{f.slide}</bdi>
      {f.deck && <> · <bdi>{f.deck}</bdi></>}
    </span>
  ) : null;

/**
 * The slide figure. On a question it appears only once the student has answered (anatomy figures
 * usually carry the answer in their labels), unless the question is about the figure (`imgFirst`).
 */
const FactImage = ({ f, revealed = true }: { f: FactInfo; revealed?: boolean }) =>
  f.img && (revealed || f.imgFirst) ? <img className="fact-img" src={f.img} alt="" loading="lazy" decoding="async" /> : null;

export function TeachFact({ ex }: { ex: Extract<Exercise, { kind: 'teach-fact' }> }) {
  const f = ex.fact;
  return (
    <div className="teach">
      <span className="teach-badge">
        חדש מהמצגת <SlideRef f={f} />
      </span>
      <div className="card teach-card">
        <FactImage f={f} />
        <div className="fact-q">
          <Rich>{f.q}</Rich>
        </div>
        <div className="teach-meaning fact-a">
          <Rich>{f.a}</Rich>
        </div>
      </div>
      {f.explain && <p className="explain">💡 <Rich>{f.explain}</Rich></p>}
    </div>
  );
}

/** Pick with the number keys 1–4; returns the selected index. */
function useChoice(n: number, revealed: boolean) {
  const [sel, setSel] = useState<number | null>(null);
  useEffect(() => {
    if (revealed) return;
    const onKey = (e: KeyboardEvent) => {
      const i = KEYS.indexOf(e.key);
      if (i >= 0 && i < n && !overlayOpen()) setSel(i);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [revealed, n]);
  return [sel, setSel] as const;
}

function Options({
  options,
  answer,
  sel,
  setSel,
  revealed,
  testMode,
}: {
  options: string[];
  answer: number;
  sel: number | null;
  setSel: (i: number) => void;
  revealed: boolean;
  testMode: boolean;
}) {
  return (
    <div className="options" role="radiogroup">
      {options.map((o, i) => {
        const state = revealed && !testMode ? (i === answer ? 'correct' : i === sel ? 'wrong' : '') : '';
        return (
          <button
            key={i}
            role="radio"
            aria-checked={sel === i}
            aria-pressed={sel === i}
            className={`option press ${state}`}
            data-correct={E2E && i === answer ? '' : undefined}
            disabled={revealed}
            onPointerDown={() => !revealed && setSel(i)}
            onClick={() => !revealed && setSel(i)}
          >
            <span className="key" aria-hidden>
              {i + 1}
            </span>
            <span>
              <Rich>{o}</Rich>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function FactChoice({ ex, revealed, testMode, bind }: ExerciseProps<Extract<Exercise, { kind: 'mc-fact' }>>) {
  const [sel, setSel] = useChoice(ex.options.length, revealed);
  useEffect(() => {
    bind(sel !== null, () => ({ outcome: sel === ex.answer ? 'correct' : 'wrong', given: sel !== null ? ex.options[sel] : undefined }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel]);
  return (
    <>
      <div className="ex-kicker">
        מה התשובה? <SlideRef f={ex.fact} />
      </div>
      <FactImage f={ex.fact} revealed={revealed} />
      <div className="ex-prompt">
        <Rich>{ex.fact.q}</Rich>
      </div>
      <Options options={ex.options} answer={ex.answer} sel={sel} setSel={setSel} revealed={revealed} testMode={testMode} />
    </>
  );
}

const TF = ['נכון', 'לא נכון'];

export function TrueFalse({ ex, revealed, testMode, bind }: ExerciseProps<Extract<Exercise, { kind: 'tf-fact' }>>) {
  const [sel, setSel] = useChoice(2, revealed);
  const answer = ex.truth ? 0 : 1;
  useEffect(() => {
    bind(sel !== null, () => ({ outcome: sel === answer ? 'correct' : 'wrong', given: sel !== null ? TF[sel] : undefined }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel]);
  return (
    <>
      <div className="ex-kicker">
        נכון או לא נכון? <SlideRef f={ex.fact} />
      </div>
      <FactImage f={ex.fact} revealed={revealed} />
      <div className="ex-prompt">
        <Rich>{ex.fact.q}</Rich>
      </div>
      <div className="card tf-claim">
        <span className="hint">התשובה המוצעת</span>
        <div className="teach-meaning" style={{ marginTop: 2 }}>
          <Rich>{ex.shown}</Rich>
        </div>
      </div>
      <Options options={TF} answer={answer} sel={sel} setSel={setSel} revealed={revealed} testMode={testMode} />
    </>
  );
}

export function TypeFact({ ex, revealed, bind }: ExerciseProps<Extract<Exercise, { kind: 'type-fact' }>>) {
  const [value, setValue] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const others = useMemo(() => allFacts.filter((f) => f.courseId === ex.fact.courseId && f.id !== ex.fact.id).map((f) => f.a), [ex]);
  useEffect(() => {
    const id = setTimeout(() => input.current?.focus({ preventScroll: true }), 250);
    return () => clearTimeout(id);
  }, []);
  useEffect(() => {
    bind(value.trim().length > 0, () => {
      const v = judgeTyped(value, ex.fact.a, others);
      return { outcome: v === 'exact' ? 'correct' : v, given: value.trim() };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <>
      <div className="ex-kicker hard">
        תרגיל קשה · כתבו את התשובה באנגלית <SlideRef f={ex.fact} />
      </div>
      <FactImage f={ex.fact} revealed={revealed} />
      <div className="ex-prompt">
        <Rich>{ex.fact.q}</Rich>
      </div>
      <input
        ref={input}
        data-answer={E2E ? ex.fact.a : undefined}
        className="type-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={revealed}
        dir="ltr"
        lang="en"
        inputMode="text"
        autoCapitalize="none"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="done"
        aria-label="התשובה באנגלית"
        placeholder="type the answer…"
      />
    </>
  );
}

/** The right answer to a fact, for feedback and reviews. */
export function FactReveal({ fact, full }: { fact: FactInfo; full?: boolean }) {
  return (
    <div>
      <p>
        <strong>
          <Rich>{fact.a}</Rich>
        </strong>
        {full && (
          <span style={{ color: 'var(--label-2)' }}>
            {' '}
            · <Rich>{fact.q}</Rich>
          </span>
        )}
      </p>
      {full && fact.explain && (
        <p style={{ marginTop: 8, color: 'var(--label-2)' }}>
          💡 <Rich>{fact.explain}</Rich>
        </p>
      )}
    </div>
  );
}
