import { courses as rawCourses } from './courses';
import { parts as lexParts, terms as lexTerms } from './lexicon';
import type { Concept, Course, Fact, Lecture, PartType, QuizItem, Term, WordPart } from './types';

export type { Concept, Course, Fact, Lecture, PartType, QuizItem };

export interface PartInfo extends WordPart {
  key: string;
  id: string; // 'p:key'
  /** Display label: 'peri-', 'cardi/o', '-itis' */
  label: string;
}

export interface TermInfo extends Term {
  id: string; // 't:word'
  /** the first lecture (and its course) that teaches the word */
  lectureId: string;
  courseId: string;
  level: 1 | 2 | 3;
  /** plain forms (any '#key' disambiguation stripped); joins to `word` */
  parts?: string[];
  /** canonical part keys, aligned with `parts` */
  partKeys: string[];
  /** what questions show: `meaning`, or `he` when it has no Hebrew name in it */
  meaning: string;
}

export interface FactInfo extends Omit<Fact, 'id'> {
  id: string; // 'f:lectureId/factId'
  lectureId: string;
  courseId: string;
}

export interface LectureInfo extends Lecture {
  courseId: string;
  /** 1-based position in its course */
  n: number;
  termList: TermInfo[];
  partList: PartInfo[];
  factList: FactInfo[];
}

export interface CourseInfo extends Omit<Course, 'lectures'> {
  lectures: LectureInfo[];
}

function partLabel(p: Pick<WordPart, 'type' | 'forms'>): string {
  const [first] = p.forms;
  if (p.type === 'prefix') return `${first}-`;
  if (p.type === 'suffix') return `-${first}`;
  const cv = p.forms.find((f) => f.length === first.length + 1 && f.startsWith(first) && /[aeiou]$/.test(f));
  return cv ? `${first}/${cv.slice(-1)}` : first;
}

/** Label for a specific form as it appears inside a word (for tiles): 'peri-', 'card', '-itis'. */
export function formLabel(form: string, type: PartType | undefined = formIndex.get(form)?.type): string {
  if (type === 'prefix') return `${form}-`;
  if (type === 'suffix') return `-${form}`;
  return form;
}

// ---------- the lexicon: word parts and terms ----------

export const parts: PartInfo[] = [];
export const partByKey = new Map<string, PartInfo>();
export const formIndex = new Map<string, PartInfo>();

for (const [key, p] of Object.entries(lexParts)) {
  const info: PartInfo = { ...p, key, id: `p:${key}`, label: partLabel(p) };
  parts.push(info);
  partByKey.set(key, info);
  for (const f of p.forms) if (!formIndex.has(f)) formIndex.set(f, info);
}

// a word belongs to the first lecture that lists it
const homeOf = new Map<string, { lectureId: string; courseId: string }>();
for (const c of rawCourses)
  for (const l of c.lectures) for (const w of l.words ?? []) if (!homeOf.has(w)) homeOf.set(w, { lectureId: l.id, courseId: c.id });

export const terms: TermInfo[] = [];
export const termById = new Map<string, TermInfo>();
for (const t of lexTerms) {
  const id = `t:${t.word}`;
  const home = homeOf.get(t.word);
  if (termById.has(id) || !home) continue; // not in any lecture: not taught
  const refs = (t.parts ?? []).map((r) => r.split('#'));
  const partKeys = refs.map(([f, key]) => key ?? formIndex.get(f)?.key ?? f);
  const forms = refs.map(([f]) => f);
  const info: TermInfo = { ...t, id, ...home, level: t.level ?? 2, parts: t.parts ? forms : undefined, partKeys, meaning: t.meaning ?? t.he };
  terms.push(info);
  termById.set(id, info);
}

/** Terms that use a given part key — the "word family". */
const familyIndex = new Map<string, TermInfo[]>();
for (const t of terms) for (const k of new Set(t.partKeys)) familyIndex.set(k, [...(familyIndex.get(k) ?? []), t]);
export const termsWithPart = (key: string) => familyIndex.get(key) ?? [];

export const isBuildable = (t: TermInfo) => (t.parts?.length ?? 0) >= 2;

/** The part behind the i-th form of a term. */
export const partAt = (t: TermInfo, i: number): PartInfo | undefined => partByKey.get(t.partKeys[i]);

// ---------- courses, lectures and facts ----------

export const facts: FactInfo[] = [];
export const factById = new Map<string, FactInfo>();

export const courses: CourseInfo[] = rawCourses.map((c) => ({
  ...c,
  lectures: c.lectures.map((l, i) => {
    const factList = (l.facts ?? []).map((f) => ({ ...f, id: `f:${l.id}/${f.id}`, lectureId: l.id, courseId: c.id }));
    for (const f of factList) {
      facts.push(f);
      factById.set(f.id, f);
    }
    return {
      ...l,
      courseId: c.id,
      n: i + 1,
      termList: (l.words ?? []).map((w) => termById.get(`t:${w}`)).filter((t): t is TermInfo => !!t),
      partList: (l.parts ?? []).map((k) => partByKey.get(k)).filter((p): p is PartInfo => !!p),
      factList,
    };
  }),
}));

export const courseById = new Map(courses.map((c) => [c.id, c]));
/** Courses that have at least one deck — the rest are listed on the path as "waiting for slides". */
export const liveCourses: CourseInfo[] = courses.filter((c) => c.lectures.length);
export const lectures: LectureInfo[] = courses.flatMap((c) => c.lectures);
export const lectureById = new Map(lectures.map((l) => [l.id, l]));

/** Does an item id (t:/p:/f:) still exist in the content? Old progress can point at removed items. */
export const itemExists = (id: string) => termById.has(id) || factById.has(id) || (id.startsWith('p:') && partByKey.has(id.slice(2)));

/** Everything a course teaches, as item ids (for per-course progress). */
export function courseItems(c: CourseInfo): { terms: TermInfo[]; facts: FactInfo[]; parts: PartInfo[] } {
  const uniq = <T,>(xs: T[]) => [...new Set(xs)];
  return {
    terms: uniq(c.lectures.flatMap((l) => l.termList)),
    facts: c.lectures.flatMap((l) => l.factList),
    parts: uniq(c.lectures.flatMap((l) => l.partList)),
  };
}
