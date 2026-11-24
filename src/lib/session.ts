/**
 * Session builders (what to ask) + a pure reducer (how a session advances).
 *
 * Learning mode: immediate feedback; a missed item comes back 3–5 exercises later
 * until it is answered correctly once (successive relearning).
 * Test mode (checkpoints): no per-item reveal, no retries, full review at the end.
 */
import { courseById, courseItems, factById, facts as allFacts, itemExists, partByKey, terms as allTerms, termById, type FactInfo, type LectureInfo, type TermInfo } from '../content';
import { lessonSizeFor, PASS_SCORE, type PathNode } from './path';
import { decodableTerms, exerciseFor, exerciseForFact, itemOf, mk, newPartsOf, typeable, typeableFact, type Exercise } from './exercises';
import { retrievability, strength } from './srs';
import { sample, shuffle, uniqueBy } from './random';
import type { PersistedState } from './store';

type SessionKind = 'intro' | 'lesson' | 'learn' | 'practice' | 'mistakes' | 'parts' | 'checkpoint' | 'jump' | 'exam';

export type Outcome = 'correct' | 'typo' | 'wrong';

/** Something a student learns and reviews: a word or a fact from the slides. */
export type Item = TermInfo | FactInfo;
export const isTerm = (x: Item): x is TermInfo => x.id.startsWith('t:');
export const itemById = (id: string): Item | undefined => termById.get(id) ?? factById.get(id);

interface AnswerRecord {
  key: string;
  exercise: Exercise;
  outcome: Outcome;
  /** what the student answered (display text) */
  given?: string;
  retry: boolean;
}

export interface Session {
  kind: SessionKind;
  title: string;
  mode: 'learn' | 'test';
  queue: Exercise[];
  index: number;
  /** first graded outcome per item id — this is what FSRS receives */
  firstOutcome: Record<string, Outcome>;
  answers: AnswerRecord[];
  node?: PathNode;
  startedAt: number;
}

const isKnown = (s: PersistedState) => (id: string) => !!s.cards[id];
const R = (s: PersistedState, id: string) => retrievability(s.cards[id]);
const S = (s: PersistedState, id: string) => strength(s.cards[id]);

function base(kind: SessionKind, title: string, queue: Exercise[], mode: 'learn' | 'test' = 'learn', node?: PathNode): Session {
  return { kind, title, mode, queue, index: 0, firstOutcome: {}, answers: [], node, startedAt: Date.now() };
}

/** Every word and fact of a course (or of all courses). */
export function itemsOf(courseId?: string): Item[] {
  const c = courseId ? courseById.get(courseId) : undefined;
  if (!c) return [...allTerms, ...allFacts];
  const { terms, facts } = courseItems(c);
  return [...terms, ...facts];
}

const lectureItems = (l: LectureInfo): Item[] => [...l.termList, ...l.factList];

/** Items due for review (or weakest), most-forgotten first. */
function reviewQueue<T extends Item>(s: PersistedState, pool: T[], now = Date.now()): T[] {
  return pool
    .filter((t) => s.cards[t.id])
    .map((t) => ({ t, due: s.cards[t.id].due <= now, r: R(s, t.id) }))
    .sort((a, b) => Number(b.due) - Number(a.due) || a.r - b.r)
    .map((x) => x.t);
}

/** Words and facts due now (parts are reviewed inside them); old ids of removed material don't count. */
export function dueCount(s: PersistedState, courseId?: string, now = Date.now()): number {
  const inCourse = (id: string) => !courseId || itemById(id)?.courseId === courseId;
  return Object.entries(s.cards).filter(([id, c]) => c.due <= now && !id.startsWith('p:') && itemExists(id) && inCourse(id)).length;
}

export function mistakesPool(s: PersistedState, courseId?: string): Item[] {
  return itemsOf(courseId)
    .filter((t) => s.cards[t.id] && (s.stats[t.id]?.wrong ?? 0) > 0)
    .sort((a, b) => R(s, a.id) - R(s, b.id));
}

const itemExercise = (x: Item, s: PersistedState) => (isTerm(x) ? exerciseFor(x, S(s, x.id)) : exerciseForFact(x, S(s, x.id)));

/**
 * New words: teach → quick check right after the next card. Then one short second round, so every word is
 * met about twice and never more: building from parts for a third of the lesson (the longest words), one
 * matching board for the rest, one question on a new part. Spaced practice takes it from there.
 */
function termLesson(ts: TermInfo[], s: PersistedState): Exercise[] {
  if (!ts.length) return [];
  const known = isKnown(s);
  const q: Exercise[] = [];
  const taught = new Set<string>();
  // Introduce at most 2 parts with their own card (the ones this lesson reuses most);
  // the rest are taught inside the word cards' breakdown — keeps lessons short.
  const uses = (key: string) => ts.filter((t) => t.partKeys.includes(key)).length;
  const newParts = newPartsOf(ts, known)
    .sort((a, b) => uses(b.key) - uses(a.key))
    .slice(0, 2);
  ts.forEach((t, i) => {
    const fresh = t.partKeys.map((k) => partByKey.get(k)!).filter((p) => p && newParts.includes(p) && !taught.has(p.key));
    if (t.partKeys.length >= 2 && fresh.length === 0 && t.partKeys.every((k) => known(`p:${k}`) || taught.has(k))) {
      // every part is already known → let them predict the meaning first (generation effect)
      q.push(mk.decode(t));
    } else {
      fresh.forEach((p) => {
        q.push(mk.teachPart(p));
        taught.add(p.key);
      });
    }
    q.push(mk.teachTerm(t));
    if (i > 0) q.push(mk.mcMeaning(ts[i - 1]));
  });
  q.push(mk.mcMeaning(ts[ts.length - 1]));

  const built = shuffle(ts.filter((t) => t.parts && t.parts.length >= 2))
    .sort((a, b) => (b.parts?.length ?? 0) - (a.parts?.length ?? 0))
    .slice(0, Math.ceil(ts.length / 3));
  const second: Exercise[] = built.map((t) => mk.build(t));
  if (newParts.length) second.push(mk.partMeaning(sample(newParts, 1)[0]));
  const rest = uniqueBy(
    ts.filter((t) => !built.includes(t)),
    (t) => t.meaning,
  );
  q.push(...shuffle(second));
  if (rest.length >= 4) q.push(mk.match(rest.slice(0, 6)));
  return q;
}

/** New facts: each card, then a question on the previous one; then a harder round on a third of them. */
function factLesson(fs: FactInfo[]): Exercise[] {
  if (!fs.length) return [];
  const q: Exercise[] = [];
  fs.forEach((f, i) => {
    q.push(mk.teachFact(f));
    if (i > 0) q.push(mk.mcFact(fs[i - 1]));
  });
  q.push(mk.mcFact(fs[fs.length - 1]));
  const ordered = [...shuffle(fs.filter(typeableFact)), ...shuffle(fs.filter((f) => !typeableFact(f)))];
  q.push(...shuffle(ordered.slice(0, Math.ceil(fs.length / 3)).map((f) => (typeableFact(f) ? mk.typeFact(f) : mk.tfFact(f)))));
  return q;
}

/** A lesson that introduces `ts` and `fs`. */
export function lessonExercises(ts: TermInfo[], s: PersistedState, fs: FactInfo[] = []): Exercise[] {
  return [...termLesson(ts, s), ...factLesson(fs)];
}

/** A lecture's intro lesson: concept cards, each pair followed by a rules question, the rest at the end. */
export function introSession(node: Extract<PathNode, { kind: 'intro' }>): Session {
  const cs = node.unit.concepts ?? [];
  const qs = shuffle(node.unit.quiz ?? []);
  const q: Exercise[] = [];
  let qi = 0;
  cs.forEach((c, i) => {
    q.push(mk.concept(c, i + 1, cs.length));
    if (i % 2 === 1 && qi < qs.length) q.push(mk.quiz(qs[qi++]));
  });
  while (qi < qs.length) q.push(mk.quiz(qs[qi++]));
  return base('intro', `${node.unit.title} · מבוא`, q, 'learn', node);
}

function lessonSession(node: Extract<PathNode, { kind: 'lesson' }>, s: PersistedState): Session {
  const items: Item[] = [...node.terms, ...node.facts];
  // a stage already studied is practised, not taught again: no teaching cards the second time
  const queue = items.every((x) => s.cards[x.id]) ? practiceExercises(items, s) : lessonExercises(node.terms, s, node.facts);
  return base('lesson', `${node.unit.title} · שלב ${node.n}`, queue, 'learn', node);
}

function practiceExercises(xs: Item[], s: PersistedState): Exercise[] {
  return shuffle(xs).map((x) => itemExercise(x, s));
}

/** Smart practice: what is due (or weakest), across all courses or one. */
export function practiceSession(s: PersistedState, n = 12, courseId?: string): Session | null {
  const xs = reviewQueue(s, itemsOf(courseId)).slice(0, n);
  if (!xs.length) return null;
  const q = practiceExercises(xs, s);
  if (xs.some(isTerm)) {
    // weakest 2 parts as well
    const weakParts = Object.keys(s.cards)
      .filter((id) => id.startsWith('p:'))
      .sort((a, b) => R(s, a) - R(s, b))
      .slice(0, 2)
      .map((id) => partByKey.get(id.slice(2)))
      .filter((p) => !!p);
    q.splice(Math.floor(q.length / 2), 0, ...weakParts.map((p) => mk.partMeaning(p)));
    const transfer = sample(decodableTerms(isKnown(s), isKnown(s)), 1);
    if (transfer.length && q.length > 6) q.splice(q.length - 2, 0, mk.decode(transfer[0]));
  }
  return base('practice', courseId ? `תרגול · ${courseById.get(courseId)?.title}` : 'תרגול חכם', q);
}

export function mistakesSession(s: PersistedState, n = 10, courseId?: string): Session | null {
  const xs = mistakesPool(s, courseId).slice(0, n);
  if (!xs.length) return null;
  return base('mistakes', 'חזרה על טעויות', practiceExercises(xs, s));
}

export function partsSession(s: PersistedState, n = 12): Session | null {
  const ids = Object.keys(s.cards).filter((id) => id.startsWith('p:'));
  const ps = ids
    .sort((a, b) => R(s, a) - R(s, b))
    .slice(0, n)
    .map((id) => partByKey.get(id.slice(2)))
    .filter((p) => !!p);
  if (ps.length < 4) return null;
  return base('parts', 'חלקי מילים', shuffle(ps).map((p) => mk.partMeaning(p)));
}

/** Harder formats for tests; for words ~25% transfer questions on unseen-but-decodable words. */
function testExercises(xs: Item[], s: PersistedState): Exercise[] {
  const ts = xs.filter(isTerm);
  const fs = xs.filter((x): x is FactInfo => !isTerm(x));
  const q = shuffle(ts).map((t, i) => {
    const r = (i * 7919) % 10; // spread formats evenly, order is shuffled anyway
    if (t.parts && t.parts.length >= 2 && r < 4) return mk.build(t);
    if (typeable(t) && r < 6) return mk.type(t);
    return r < 8 ? mk.mcTerm(t) : mk.mcMeaning(t);
  });
  const fq = shuffle(fs).map((f, i) => (typeableFact(f) && i % 3 === 0 ? mk.typeFact(f) : i % 4 === 3 ? mk.tfFact(f) : mk.mcFact(f)));
  const seen = (id: string) => !!s.cards[id] || ts.some((t) => t.id === id);
  const transfer = ts.length ? sample(decodableTerms(isKnown(s), seen), Math.round(ts.length / 4)) : [];
  return shuffle([...q, ...fq, ...transfer.map((t) => mk.decode(t))]);
}

/** Most items a lecture test asks about: 15 for the mid-lecture test, 20 for the final one. */
const TEST_CAP = { mid: 15, final: 20 };

/** Pick up to `cap` items, leaning towards mistakes, never-studied items and the weakest memories (with some randomness). */
function pickForTest(xs: Item[], cap: number, s: PersistedState): Item[] {
  if (xs.length <= cap) return xs;
  const need = (x: Item) => ((s.stats[x.id]?.wrong ?? 0) > 0 ? 0 : s.cards[x.id] ? R(s, x.id) : 0.3) + Math.random() * 0.25;
  return xs
    .map((x) => ({ x, k: need(x) }))
    .sort((a, b) => a.k - b.k)
    .slice(0, cap)
    .map((e) => e.x);
}

/** How many items a path test asks (it samples, it doesn't ask the whole range). */
export const testSize = (node: Extract<PathNode, { kind: 'checkpoint' }>) =>
  Math.min(node.terms.length + node.facts.length, node.last ? TEST_CAP.final : TEST_CAP.mid);

export function checkpointSession(node: Extract<PathNode, { kind: 'checkpoint' }>, s: PersistedState, jump = false): Session {
  // a jump test stays inside the node's own lecture (its items already cover the earlier lessons)
  const xs = pickForTest([...node.terms, ...node.facts], node.last ? TEST_CAP.final : TEST_CAP.mid, s);
  const title = jump ? 'מבחן קפיצה' : node.last ? `מבחן סיום · ${node.unit.title}` : `מבחן ביניים · ${node.unit.title}`;
  return base(jump ? 'jump' : 'checkpoint', title, testExercises(xs, s), 'test', node);
}

/** Mixed exam across everything learned in a course (interleaved). */
export function examSession(s: PersistedState, n = 20, courseId?: string): Session | null {
  const learned = itemsOf(courseId).filter((t) => s.cards[t.id]);
  if (learned.length < 8) return null;
  return base('exam', 'מבחן מעורב', testExercises(sample(learned, n), s), 'test');
}

/** The session a path node opens. */
export function sessionForNode(node: PathNode, s: PersistedState, jump = false): Session {
  if (node.kind === 'intro') return introSession(node);
  if (node.kind === 'lesson') return lessonSession(node, s);
  return checkpointSession(node, s, jump);
}

// ---------- lecture material ----------

/** Learn the next new items of a lecture: words in level order, then the slide facts. */
export function lectureLearnSession(l: LectureInfo, s: PersistedState, n = lessonSizeFor(lectureItems(l).length)): Session | null {
  const ts = l.termList.filter((t) => !s.cards[t.id]).sort((a, b) => a.level - b.level).slice(0, n);
  const fs = l.factList.filter((f) => !s.cards[f.id]).slice(0, n - ts.length);
  if (!ts.length && !fs.length) return null;
  return base('learn', 'חדש מהמצגת', lessonExercises(ts, s, fs));
}

export function lecturePracticeSession(l: LectureInfo, s: PersistedState, n = 12): Session | null {
  const xs = reviewQueue(s, lectureItems(l)).slice(0, n);
  if (!xs.length) return null;
  return base('practice', 'תרגול חומר המצגת', practiceExercises(xs, s));
}

/** The lecture's prefixes, roots and suffixes: new ones are taught first, then everything is quizzed. */
export function lecturePartsSession(l: LectureInfo, s: PersistedState, n = 12): Session | null {
  if (l.partList.length < 4) return null;
  const ps = l.partList
    .map((p) => ({ p, r: s.cards[p.id] ? R(s, p.id) : -1 }))
    .sort((a, b) => a.r - b.r)
    .slice(0, n)
    .map((x) => x.p);
  const fresh = ps.filter((p) => !s.cards[p.id]).slice(0, 4);
  const q: Exercise[] = [];
  fresh.forEach((p) => q.push(mk.teachPart(p)));
  q.push(...shuffle(ps).map((p) => mk.partMeaning(p)));
  return base('parts', 'חלקי המילים מהמצגת', q);
}

/** Smallest lecture test: 8 items studied, or the whole lecture if it is shorter. */
export const lectureTestMin = (l: LectureInfo) => Math.max(1, Math.min(8, lectureItems(l).length));

/** A test on the lecture material already studied, like an exam: feedback at the end. */
export function lectureTestSession(l: LectureInfo, s: PersistedState, n = 20): Session | null {
  const learned = lectureItems(l).filter((t) => s.cards[t.id]);
  if (learned.length < lectureTestMin(l)) return null;
  return base('exam', 'מבחן על המצגת', testExercises(sample(learned, n), s), 'test');
}

// ---------- reducer ----------

export const current = (s: Session): Exercise | undefined => s.queue[s.index];
export const isTeaching = (ex: Exercise) => ex.kind === 'teach-part' || ex.kind === 'teach-term' || ex.kind === 'teach-fact' || ex.kind === 'concept';
const isHard = (ex: Exercise) => ex.kind === 'build' || ex.kind === 'type' || ex.kind === 'type-fact';

/**
 * Apply an answer. Returns the new session and, if this is the first graded attempt at an item,
 * the item id + outcome to send to FSRS.
 */
export function answer(
  s: Session,
  outcome: Outcome,
  given?: string,
): { session: Session; record?: { id: string; outcome: Outcome } } {
  const ex = current(s);
  if (!ex) return { session: s };
  const id = itemOf(ex);
  const retry = s.answers.some((a) => a.key === ex.key) || (!!id && id in s.firstOutcome);
  const answers = [...s.answers, { key: ex.key, exercise: ex, outcome, given, retry }];
  let queue = s.queue;
  if (outcome === 'wrong' && s.mode === 'learn' && (id || ex.kind === 'decode' || ex.kind === 'quiz')) {
    const again = retryExercise(ex);
    const at = Math.min(queue.length, s.index + 3 + Math.floor(Math.random() * 3));
    queue = [...queue.slice(0, at), again, ...queue.slice(at)];
  }
  const firstOutcome = id && !(id in s.firstOutcome) ? { ...s.firstOutcome, [id]: outcome } : s.firstOutcome;
  const record = id && !(id in s.firstOutcome) ? { id, outcome } : undefined;
  return { session: { ...s, queue, answers, firstOutcome }, record };
}

/** A missed item comes back in a (usually easier) format. */
function retryExercise(ex: Exercise): Exercise {
  switch (ex.kind) {
    case 'part-meaning':
      return mk.partMeaning(ex.part);
    case 'quiz':
      return mk.quiz(ex.item);
    case 'decode':
    case 'mc-meaning':
      return mk.mcMeaning(ex.term);
    case 'mc-term':
      return mk.mcTerm(ex.term);
    case 'build':
      return mk.build(ex.term);
    case 'type':
      return ex.term.parts && ex.term.parts.length >= 2 ? mk.build(ex.term) : mk.mcTerm(ex.term);
    case 'mc-fact':
    case 'tf-fact':
    case 'type-fact':
      return mk.mcFact(ex.fact);
    default:
      return ex;
  }
}

export const advance = (s: Session): Session => ({ ...s, index: s.index + 1 });
export const isFinished = (s: Session) => s.index >= s.queue.length;

export interface SessionSummary {
  graded: number;
  correct: number;
  score: number; // 0..1, first attempts only, transfer excluded
  transferAsked: number;
  transferCorrect: number;
  xp: number;
  missed: Item[];
  passed?: boolean;
  seconds: number;
}

export function summarize(s: Session): SessionSummary {
  const first = s.answers.filter((a) => !a.retry && !isTeaching(a.exercise));
  const scored = first.filter((a) => a.exercise.kind !== 'decode' && a.exercise.kind !== 'match');
  const correct = scored.filter((a) => a.outcome !== 'wrong').length;
  const transfer = first.filter((a) => a.exercise.kind === 'decode');
  const score = scored.length ? correct / scored.length : 1;
  const missedIds = new Set(scored.filter((a) => a.outcome === 'wrong').map((a) => itemOf(a.exercise)!));
  const missed = [...missedIds].map(itemById).filter((t): t is Item => !!t);
  const hardBonus = scored.filter((a) => a.outcome !== 'wrong' && isHard(a.exercise)).length;
  const perfect = scored.length > 0 && correct === scored.length;
  const passed = s.mode === 'test' && s.node ? score >= PASS_SCORE : undefined;
  const xp = correct + hardBonus + transfer.filter((a) => a.outcome !== 'wrong').length + 5 + (perfect ? 5 : 0) + (passed ? 10 : 0);
  return {
    graded: scored.length,
    correct,
    score,
    transferAsked: transfer.length,
    transferCorrect: transfer.filter((a) => a.outcome !== 'wrong').length,
    xp,
    missed,
    passed,
    seconds: Math.round((Date.now() - s.startedAt) / 1000),
  };
}
