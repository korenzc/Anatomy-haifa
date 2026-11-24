/**
 * Exercise generators. Each exercise targets one item (term, part or fact) and is graded once.
 * Words: teach → mc-meaning → mc-term / part-meaning → build → type (recognition → recall).
 * Facts: teach → multiple choice / true-false → typed answer when it is a short English word.
 */
import {
  facts as allFacts,
  formIndex,
  isBuildable,
  parts as allParts,
  partByKey,
  terms as allTerms,
  partAt,
  type Concept,
  type FactInfo,
  type QuizItem,
  type PartInfo,
  type PartType,
  type TermInfo,
} from '../content';
import { sample, shuffle, uniqueBy } from './random';

export type Exercise =
  | { kind: 'teach-part'; key: string; part: PartInfo }
  | { kind: 'teach-term'; key: string; term: TermInfo }
  | { kind: 'mc-meaning'; key: string; term: TermInfo; options: TermInfo[] }
  | { kind: 'mc-term'; key: string; term: TermInfo; options: TermInfo[] }
  | { kind: 'part-meaning'; key: string; part: PartInfo; options: PartInfo[] }
  | { kind: 'build'; key: string; term: TermInfo; tiles: Tile[] }
  | { kind: 'type'; key: string; term: TermInfo }
  /** An unseen word made of known parts: read the parts, infer the meaning (transfer). Not graded into FSRS. */
  | { kind: 'decode'; key: string; term: TermInfo; options: TermInfo[] }
  | { kind: 'match'; key: string; terms: TermInfo[] }
  /** A teaching card about how medical words are built */
  | { kind: 'concept'; key: string; concept: Concept; n: number; total: number }
  /** A rules question; options are shuffled, `answer` is the index into `options` */
  | { kind: 'quiz'; key: string; item: QuizItem; options: string[]; answer: number }
  /** A new fact from the slides */
  | { kind: 'teach-fact'; key: string; fact: FactInfo }
  /** The fact's question; `options` are answers, `answer` indexes the right one */
  | { kind: 'mc-fact'; key: string; fact: FactInfo; options: string[]; answer: number }
  /** The question with a proposed answer: right or wrong? */
  | { kind: 'tf-fact'; key: string; fact: FactInfo; shown: string; truth: boolean }
  /** Type the (short, English) answer */
  | { kind: 'type-fact'; key: string; fact: FactInfo };

export interface Tile {
  form: string;
  type: PartType;
}

let seq = 0;
const k = (kind: string, id: string) => `${kind}:${id}:${++seq}`;

/** The item an exercise grades (null for teaching cards and matching). */
export function itemOf(ex: Exercise): string | null {
  switch (ex.kind) {
    case 'teach-part':
    case 'teach-term':
    case 'teach-fact':
    case 'match':
    case 'decode':
    case 'concept':
    case 'quiz':
      return null;
    case 'part-meaning':
      return ex.part.id;
    case 'mc-fact':
    case 'tf-fact':
    case 'type-fact':
      return ex.fact.id;
    default:
      return ex.term.id;
  }
}

const EN_STOP = new Set(['the', 'and', 'from', 'with', 'for', 'into', 'pertaining', 'condition', 'process', 'state', 'study', 'one', 'two', 'blood', 'body', 'cell', 'cells', 'makes']);
const HE_STOP = new Set(['של', 'או', 'עם', 'על', 'את', 'מצב', 'הקשור', 'דבר']);
const enWords = (x: string) => x.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 2 && !EN_STOP.has(w));
// strip a one-letter Hebrew prefix (ה/ב/ל/ו) so "הלב" matches "לב"
const heWords = (x: string) =>
  x.split(/[\s,()/\-–]+/).map((w) => (w.length > 2 ? w.replace(/^[הבלו]/, '') : w)).filter((w) => w.length >= 2 && !HE_STOP.has(w));
const overlap = (a: string[], b: string[]) => a.filter((w) => b.includes(w)).length;

/** How many words use each part: a rare shared part (glyc) says more than a common ending (-ia). */
const partUses = new Map<string, number>();
/** The parts each part is combined with (hyper and hypo both go with tension, glyc…). */
const partners = new Map<string, Set<string>>();
for (const t of allTerms)
  for (const key of t.partKeys) {
    partUses.set(key, (partUses.get(key) ?? 0) + 1);
    const set = partners.get(key) ?? new Set<string>();
    t.partKeys.forEach((o) => o !== key && set.add(o));
    partners.set(key, set);
  }
const sharedParts = (a: TermInfo, b: TermInfo) =>
  a.partKeys.filter((key) => b.partKeys.includes(key)).reduce((sum, key) => sum + Math.min(1, 5 / (partUses.get(key) ?? 1)), 0);

/**
 * Wrong answers that were shown lately (across questions in the app). A word that just served as a
 * wrong answer is pushed back so the same few words don't come up in every question.
 */
const recent: string[] = [];
const remember = (ids: string[]) => {
  recent.push(...ids);
  recent.splice(0, Math.max(0, recent.length - 18));
};
const recentCount = (id: string) => recent.filter((x) => x === id).length;

/** A rough kind of word, so an organ is offered among organs and a symptom among symptoms. */
const kindOf = (t: TermInfo) =>
  /\b(organ|tube|gland|bone|canal|cord|passage|vertebra)\b/.test(t.en) || t.explain?.startsWith('שייך')
    ? 'body'
    : t.explain?.startsWith('בשפת היומיום')
      ? 'clinical'
      : 'other';

/** Two answers that mean the same thing (one contains the other) would both be right. */
const sameAnswer = (a: string, b: string) => {
  const [x, y] = [a.trim(), b.trim()];
  return x === y || x.includes(y) || y.includes(x);
};

/**
 * Distractor terms: the closest wrong answers, so a question tests real knowledge, not elimination.
 * Closeness = shared word parts (hypotension vs hypertension), shared meaning words in Hebrew or English
 * (אוטם שריר הלב vs מחלת שריר הלב), then the same lecture. A little randomness, and a penalty for
 * words used as wrong answers lately, keep the same words from coming back in every question.
 */
export function distractorTerms(t: TermInfo, n = 3, pool: TermInfo[] = allTerms, rnd = Math.random): TermInfo[] {
  const tEn = enWords(t.en);
  const tHe = heWords(t.meaning);
  const scored = pool
    .filter((x) => x.id !== t.id && x.he !== t.he && x.en !== t.en && !sameAnswer(x.meaning, t.meaning))
    .map((x) => {
      const score =
        3 * sharedParts(x, t) +
        1.5 * overlap(enWords(x.en), tEn) +
        1.5 * overlap(heWords(x.meaning), tHe) +
        (x.lectureId === t.lectureId ? 1 : x.courseId === t.courseId ? 0.5 : 0) +
        // a phrase among phrases, a single word among single words
        (x.word.includes(' ') === t.word.includes(' ') ? 0.5 : 0) +
        (kindOf(x) === kindOf(t) ? 1.5 : 0) -
        2 * recentCount(x.id) +
        rnd() * 1.5;
      return { x, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((e) => e.x);
  const out = uniqueBy(scored, (x) => x.meaning).slice(0, n);
  remember(out.map((x) => x.id));
  return out;
}

/**
 * Distractor parts: same kind (prefix / root / suffix), preferring parts used in the same company
 * (hyper ↔ hypo, tachy ↔ brady). Parts whose meaning shares a word with the target are left out:
 * short meanings that overlap ("מעל, יתר" / "על, מעל") would make two answers right.
 */
function distractorParts(p: PartInfo, n = 3, rnd = Math.random): PartInfo[] {
  const pEn = enWords(p.en);
  const pHe = heWords(p.he);
  const mine = partners.get(p.key) ?? new Set<string>();
  const scored = allParts
    .filter((x) => x.key !== p.key && !sameAnswer(x.he, p.he) && !overlap(heWords(x.he), pHe) && !overlap(enWords(x.en), pEn))
    .map((x) => ({
      x,
      score:
        (x.type === p.type ? 3 : 0) +
        Math.min(3, [...(partners.get(x.key) ?? [])].filter((o) => mine.has(o)).length) -
        2 * recentCount(x.id) +
        rnd() * 2,
    }))
    .sort((a, b) => b.score - a.score)
    .map((e) => e.x);
  const out = uniqueBy(scored, (x) => x.he).slice(0, n);
  remember(out.map((x) => x.id));
  return out;
}

/** Tiles for the build exercise: the word's forms + same-type decoys. */
export function buildTiles(t: TermInfo): Tile[] {
  const forms = t.parts ?? [];
  const own: Tile[] = forms.map((f, i) => ({ form: f, type: partAt(t, i)?.type ?? 'root' }));
  const meanings = new Set(forms.map((_, i) => partAt(t, i)?.en));
  const decoys: Tile[] = [];
  const taken = (f: string) => forms.includes(f) || decoys.some((d) => d.form === f);
  for (const tile of own) {
    const cand = shuffle([...formIndex.entries()].filter(([form, p]) => p.type === tile.type && !taken(form) && !meanings.has(p.en)));
    // same combining-vowel shape so the trailing "o" is not a giveaway
    const shape = (s: string) => /o$/.test(s);
    const c = cand.find(([form]) => shape(form) === shape(tile.form)) ?? cand[0];
    if (c) decoys.push({ form: c[0], type: c[1].type });
  }
  if (forms.length <= 2) {
    const c = sample([...formIndex.entries()].filter(([f]) => !taken(f)), 1);
    decoys.push(...c.map(([form, p]) => ({ form, type: p.type })));
  }
  return shuffle([...own, ...decoys]);
}

const norm = (x: string) => x.trim().toLowerCase();
const latin = (x: string) => /^[^\u0590-\u05FF]*$/.test(x);

/**
 * Wrong answers for a fact: its own `wrong` list first, then other facts' answers from the
 * same lecture, then the same course — answers in the same script first (an English answer
 * among Hebrew ones would give itself away).
 */
export function factDistractors(f: FactInfo, n = 3): string[] {
  const own = shuffle(f.wrong ?? []);
  const others = (pool: FactInfo[]) =>
    shuffle(pool.filter((x) => x.id !== f.id).map((x) => x.a)).sort((a, b) => Number(latin(b) === latin(f.a)) - Number(latin(a) === latin(f.a)));
  const lecture = others(allFacts.filter((x) => x.lectureId === f.lectureId));
  const course = others(allFacts.filter((x) => x.courseId === f.courseId && x.lectureId !== f.lectureId));
  return uniqueBy([...own, ...lecture, ...course], norm)
    .filter((a) => norm(a) !== norm(f.a))
    .slice(0, n);
}

/** Short English answers (a word or two) can be typed. */
export const typeableFact = (f: FactInfo) => /^[a-z][a-z' -]{1,22}$/i.test(f.a.trim());

export const mk = {
  teachPart: (p: PartInfo): Exercise => ({ kind: 'teach-part', key: k('tp', p.key), part: p }),
  teachTerm: (t: TermInfo): Exercise => ({ kind: 'teach-term', key: k('tt', t.id), term: t }),
  mcMeaning: (t: TermInfo, pool?: TermInfo[]): Exercise => ({
    kind: 'mc-meaning',
    key: k('mm', t.id),
    term: t,
    options: shuffle([t, ...distractorTerms(t, 3, pool)]),
  }),
  mcTerm: (t: TermInfo, pool?: TermInfo[]): Exercise => ({
    kind: 'mc-term',
    key: k('mt', t.id),
    term: t,
    options: shuffle([t, ...distractorTerms(t, 3, pool)]),
  }),
  partMeaning: (p: PartInfo): Exercise => ({
    kind: 'part-meaning',
    key: k('pm', p.key),
    part: p,
    options: shuffle([p, ...distractorParts(p)]),
  }),
  build: (t: TermInfo): Exercise =>
    isBuildable(t) ? { kind: 'build', key: k('b', t.id), term: t, tiles: buildTiles(t) } : mk.mcTerm(t),
  type: (t: TermInfo): Exercise => ({ kind: 'type', key: k('ty', t.id), term: t }),
  decode: (t: TermInfo): Exercise => ({
    kind: 'decode',
    key: k('dc', t.id),
    term: t,
    options: shuffle([t, ...distractorTerms(t, 3)]),
  }),
  match: (ts: TermInfo[]): Exercise => ({ kind: 'match', key: k('ma', ts.map((t) => t.id).join()), terms: ts }),
  concept: (c: Concept, n: number, total: number): Exercise => ({ kind: 'concept', key: k('co', String(n)), concept: c, n, total }),
  teachFact: (f: FactInfo): Exercise => ({ kind: 'teach-fact', key: k('tf', f.id), fact: f }),
  mcFact: (f: FactInfo): Exercise => {
    const options = shuffle([f.a, ...factDistractors(f)]);
    return { kind: 'mc-fact', key: k('mf', f.id), fact: f, options, answer: options.indexOf(f.a) };
  },
  tfFact: (f: FactInfo, rnd = Math.random): Exercise => {
    const [wrong] = factDistractors(f, 1);
    const truth = !wrong || rnd() < 0.5;
    return { kind: 'tf-fact', key: k('tff', f.id), fact: f, shown: truth ? f.a : wrong, truth };
  },
  typeFact: (f: FactInfo): Exercise => (typeableFact(f) ? { kind: 'type-fact', key: k('tyf', f.id), fact: f } : mk.mcFact(f)),
  quiz: (item: QuizItem): Exercise => {
    const order = shuffle(item.options.map((_, i) => i));
    return { kind: 'quiz', key: k('qz', item.q.slice(0, 12)), item, options: order.map((i) => item.options[i]), answer: order.indexOf(item.answer) };
  },
};

/** Abbreviations and long phrases are poor typing targets. */
const typeable = (t: TermInfo) => /^[a-z]+$/.test(t.word) && t.word.length <= 16;

/**
 * Pick an exercise for a term given how well it's known (0–5 strength).
 * Weak → recognition; medium → reverse / build; strong → typed recall.
 */
export function exerciseFor(t: TermInfo, strength: number, rnd = Math.random): Exercise {
  const r = rnd();
  if (strength <= 1) return r < 0.6 ? mk.mcMeaning(t) : isBuildable(t) ? mk.build(t) : mk.mcTerm(t);
  if (strength <= 3) {
    if (r < 0.35) return mk.mcTerm(t);
    if (r < 0.7 && isBuildable(t)) return mk.build(t);
    if (typeable(t) && r < 0.85) return mk.type(t);
    return mk.mcMeaning(t);
  }
  if (typeable(t) && r < 0.55) return mk.type(t);
  return isBuildable(t) && r < 0.8 ? mk.build(t) : mk.mcTerm(t);
}

/** Pick an exercise for a fact given how well it's known (0–5 strength). */
export function exerciseForFact(f: FactInfo, strength: number, rnd = Math.random): Exercise {
  const r = rnd();
  if (strength <= 1) return r < 0.7 ? mk.mcFact(f) : mk.tfFact(f);
  if (strength <= 3) {
    if (typeableFact(f) && r < 0.3) return mk.typeFact(f);
    return r < 0.75 ? mk.mcFact(f) : mk.tfFact(f);
  }
  if (typeableFact(f) && r < 0.55) return mk.typeFact(f);
  return r < 0.8 ? mk.mcFact(f) : mk.tfFact(f);
}

/** Parts of a term that the student hasn't met yet (for teaching cards). */
export function newPartsOf(ts: TermInfo[], known: (id: string) => boolean): PartInfo[] {
  const out: PartInfo[] = [];
  for (const t of ts)
    for (const key of t.partKeys) {
      const p = partByKey.get(key);
      if (p && !known(p.id) && !out.includes(p)) out.push(p);
    }
  return out;
}

/** Unseen buildable terms whose every part the student already knows — for transfer questions. */
export function decodableTerms(knownPart: (id: string) => boolean, seenTerm: (id: string) => boolean): TermInfo[] {
  return allTerms.filter(
    (t) => isBuildable(t) && !seenTerm(t.id) && t.partKeys.every((key) => knownPart(`p:${key}`)),
  );
}

export { typeable };
