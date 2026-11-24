/**
 * The learning paths: one per course. Each lecture → stages (~9 new items each, scaled to the lecture's size)
 * → one final test (plus one mid-lecture test for big lectures). Lectures unlock independently.
 *
 * Progress is *derived*, so adding material to a lecture never corrupts anyone's progress:
 *  - a lesson is done when all of its items have been studied (have an FSRS card),
 *  - a checkpoint is done when it was passed (stored by id).
 * A passed checkpoint completes everything before it *in its own lecture*, so content added later can only
 * affect the stretch after the last passed checkpoint.
 */
import { courses, liveCourses, type CourseInfo, type FactInfo, type LectureInfo, type TermInfo } from '../content';

import type { PersistedState } from './store';

export const PASS_SCORE = 0.8;
/** Aim for ~9 items per lesson. */
const ITEMS_PER_LESSON = 9;
const MAX_LESSONS = 14;
/** Lectures with more lessons than this get a mid-lecture test as well as the final one. */
const MAX_LESSONS_FOR_FINAL_ONLY = 6;

/** Lessons in a lecture of `items` items: round(items / 9), between 1 and 14 (154 → 14, 107 → 12, 20 → 2, 6 → 1). */
export const lessonCountFor = (items: number) => Math.min(MAX_LESSONS, Math.max(1, Math.round(items / ITEMS_PER_LESSON)));
/** Items per lesson for a lecture of `items` items (rounded up). */
export const lessonSizeFor = (items: number) => Math.ceil(items / lessonCountFor(items));

/** A stretch of a course's path: one lecture. */
export type Section = Pick<LectureInfo, 'title' | 'subtitle' | 'icon' | 'hue' | 'intro' | 'concepts' | 'quiz'> & {
  /** 'lecture-<lectureId>' — node and checkpoint ids hang off it */
  id: string;
  courseId: string;
  lectureId: string;
  /** 1-based lecture number in its course */
  lecture: number;
  terms: TermInfo[];
  facts: FactInfo[];
};

/** Every course's lectures, in order. Each course is its own path; they unlock independently. */
export const SECTIONS: Section[] = courses.flatMap((c) =>
  c.lectures.map((l) => ({
    id: `lecture-${l.id}`,
    courseId: c.id,
    lectureId: l.id,
    title: l.title,
    subtitle: l.subtitle,
    icon: l.icon,
    hue: l.hue,
    intro: l.intro,
    concepts: l.concepts,
    quiz: l.quiz,
    lecture: l.n,
    terms: l.termList,
    facts: l.factList,
  })),
);

interface NodeBase {
  id: string;
  unit: Section;
  /** position in its course's path */
  index: number;
  n: number;
  terms: TermInfo[];
  facts: FactInfo[];
}

export type PathNode =
  | (NodeBase & { kind: 'intro' })
  | (NodeBase & { kind: 'lesson' })
  | (NodeBase & { kind: 'checkpoint'; last: boolean });

/** How many items (words + facts) a node covers. */
export const nodeSize = (n: PathNode) => n.terms.length + n.facts.length;

/** Split into k near-equal chunks. */
function chunk<T>(arr: T[], k: number): T[][] {
  const out: T[][] = [];
  let p = 0;
  for (let i = 0; i < k; i++) {
    const n = Math.floor(arr.length / k) + (i < arr.length % k ? 1 : 0);
    out.push(arr.slice(p, p + n));
    p += n;
  }
  return out.filter((c) => c.length);
}

type Item = { term: TermInfo } | { fact: FactInfo };
const split = (items: Item[]) => ({
  terms: items.flatMap((x) => ('term' in x ? [x.term] : [])),
  facts: items.flatMap((x) => ('fact' in x ? [x.fact] : [])),
});

function buildPath(sections: Section[]): PathNode[] {
  const nodes: PathNode[] = [];
  for (const unit of sections) {
    // words by level (stable), then the slide facts in slide order
    const items: Item[] = [
      ...[...unit.terms].sort((a, b) => a.level - b.level).map((term) => ({ term })),
      ...unit.facts.map((fact) => ({ fact })),
    ];
    const lessons = chunk(items, lessonCountFor(items.length));
    let ln = 0;
    if (unit.concepts?.length) nodes.push({ kind: 'intro', id: `${unit.id}:intro`, unit, index: nodes.length, n: 0, terms: [], facts: [] });
    // test ids are new (T1 / final) so old saved checkpoint passes (C1, C2…) never mark them passed
    const midAt = lessons.length > MAX_LESSONS_FOR_FINAL_ONLY ? Math.floor(lessons.length / 2) : -1;
    lessons.forEach((lesson, g) => {
      ln++;
      nodes.push({ kind: 'lesson', id: `${unit.id}:L${ln}`, unit, index: nodes.length, n: ln, ...split(lesson) });
      if (g + 1 === midAt) {
        nodes.push({ kind: 'checkpoint', id: `${unit.id}:T1`, unit, index: nodes.length, n: 1, ...split(lessons.slice(0, midAt).flat()), last: false });
      }
    });
    if (lessons.length) {
      nodes.push({ kind: 'checkpoint', id: `${unit.id}:final`, unit, index: nodes.length, n: midAt > 0 ? 2 : 1, ...split(lessons.flat()), last: true });
    }
  }
  return nodes;
}

/** courseId → that course's path */
export const PATHS = new Map<string, PathNode[]>(courses.map((c) => [c.id, buildPath(SECTIONS.filter((s) => s.courseId === c.id))]));

export const pathOf = (courseId: string): PathNode[] => PATHS.get(courseId) ?? [];

/**
 * The course shown on the path tab: the saved choice if it has slides, else the first course with slides
 * (שילוב מערכות א׳, first in courses/index.ts, is everyone's default). Courses waiting for slides are never shown.
 */
export function activeCourse(s: PersistedState): CourseInfo {
  return liveCourses.find((c) => c.id === s.settings.course) ?? liveCourses[0] ?? courses[0];
}


function isNodeDone(node: PathNode, s: PersistedState): boolean {
  if (node.kind === 'lesson') return node.terms.every((t) => !!s.cards[t.id]) && node.facts.every((f) => !!s.cards[f.id]);
  return !!s.checkpoints[node.id]?.passed; // intro lessons and checkpoints
}

export interface PathProgress {
  done: boolean[];
  /** reachable (unlocked, not done yet) nodes — each lecture opens on its own */
  open: boolean[];
  frontier: number; // furthest reachable node of the lecture `current` is in
  current: number; // the node "continue" opens (or path.length when everything is done)
}

/** Latest time the student worked on a lecture (item reviews or test attempts), 0 if never. */
function lastWorked(unit: Section, s: PersistedState): number {
  let t = 0;
  for (const x of [...unit.terms, ...unit.facts]) t = Math.max(t, s.stats[x.id]?.lastSeen ?? 0);
  for (const [id, c] of Object.entries(s.checkpoints)) if (id.startsWith(`${unit.id}:`)) t = Math.max(t, c.at ?? 0); // imported files may lack `at`
  return t;
}

export function pathProgress(s: PersistedState, path: PathNode[]): PathProgress {
  const done = path.map((n) => isNodeDone(n, s));
  const open = path.map(() => false);
  const ranges: { unit: Section; from: number; to: number; frontier: number }[] = [];
  for (let i = 0; i < path.length; ) {
    let j = i;
    while (j + 1 < path.length && path[j + 1].unit.id === path[i].unit.id) j++;
    // A passed checkpoint (incl. a "jump here" test) completes every node before it — in this lecture only.
    let passedLater = false;
    for (let k = j; k >= i; k--) {
      if (done[k] && path[k].kind === 'checkpoint') passedLater = true;
      else if (passedLater) done[k] = true;
    }
    // Reach extends through contiguous done nodes; learning a far lesson early (free practice)
    // does not skip the test before it.
    let reach = i - 1;
    for (let k = i; k <= j && done[k] && k === reach + 1; k++) reach = k;
    const frontier = Math.min(reach + 1, j);
    for (let k = i; k <= frontier; k++) open[k] = true;
    ranges.push({ unit: path[i].unit, from: i, to: j, frontier });
    i = j + 1;
  }
  // Continue where the student last worked; if that lecture is finished (or nothing was studied), the first unfinished one.
  const unfinished = ranges.filter((r) => done.slice(r.from, r.to + 1).some((d) => !d));
  let pick = unfinished[0];
  let latest = 0;
  for (const r of unfinished) {
    const t = lastWorked(r.unit, s);
    if (t > latest) {
      latest = t;
      pick = r;
    }
  }
  if (!pick) return { done, open, frontier: path.length - 1, current: path.length };
  return { done, open, frontier: pick.frontier, current: done.findIndex((d, i) => !d && i >= pick.from && i <= pick.to) };
}

export const isUnlocked = (i: number, p: PathProgress) => p.done[i] || p.open[i];
