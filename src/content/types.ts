/**
 * Content schema.
 *
 * Courses (src/content/courses/<course>/) are made of lectures, one per slide deck.
 * A lecture teaches two kinds of items:
 *  - terms: medical words built from parts (the lexicon, src/content/lexicon.ts),
 *  - facts: question → answer cards written straight from the slides (any subject).
 * Only material that appears in the slides belongs here.
 * `npm run validate` checks everything (parts join to words, ids are unique, …).
 */

export type PartType = 'prefix' | 'root' | 'suffix';

export interface WordPart {
  type: PartType;
  /**
   * Every spelling of this part as it appears *inside words*, without hyphens.
   * For roots list the bare root and the combining form, e.g. ['cardi', 'cardio'].
   * The first item is the canonical one.
   */
  forms: string[];
  /** Short English meaning, e.g. 'heart' */
  en: string;
  /** Short Hebrew meaning, e.g. 'לב' */
  he: string;
  /** Optional Hebrew tip / example (one short sentence) */
  note?: string;
}

export interface Term {
  /** The English term, lowercase (abbreviations keep their dots: 'b.i.d.') */
  word: string;
  /**
   * The forms that build this word, in order. Must join to `word` exactly.
   * e.g. pericarditis -> ['peri', 'card', 'itis'].
   * Omit for words that are not built from parts (vertigo, stat, ...).
   * If two parts share a spelling (ile = ileum root, -ile suffix), write 'form#key'
   * with the part's key, e.g. ['febr', 'ile#ile_adj'].
   */
  parts?: string[];
  /** Hebrew meaning, short (shown as the answer). May include the Hebrew name, e.g. 'היפוגליקמיה (סוכר נמוך בדם)'. */
  he: string;
  /**
   * The meaning alone, without the Hebrew name, for questions: 'סוכר נמוך בדם'.
   * Needed whenever `he` sounds like the English word, otherwise the question gives the answer away.
   */
  meaning?: string;
  /** Literal English definition, e.g. 'inflammation around the heart' */
  en: string;
  /** Optional Hebrew explanation: 1–2 sentences of clinical context. */
  explain?: string;
  /** For abbreviations / Latin phrases: the origin, e.g. 'bis in die' */
  latin?: string;
  /** 1 = core, 2 = common, 3 = advanced. Lessons are ordered by level. */
  level?: 1 | 2 | 3;
}

/** A short teaching card (shown in the lecture's intro lesson). */
export interface Concept {
  /** Hebrew title, e.g. 'ארבעת חלקי המילה' */
  title: string;
  /** Hebrew body, 1–4 short sentences. Latin words are fine (auto-isolated). */
  body: string;
  /** Optional worked example: a lexicon word, shown split into colour-coded parts */
  example?: string;
}

/** A multiple-choice question about concepts/rules (not tied to one term). */
export interface QuizItem {
  /** Hebrew question */
  q: string;
  /** 2–4 options (Hebrew or English) */
  options: string[];
  /** index of the correct option */
  answer: number;
  /** Hebrew explanation shown after answering */
  explain?: string;
}

/**
 * One thing to remember from a slide, as a question and a short answer.
 * Progress is keyed by `f:<lectureId>/<id>`, so never change an id once published.
 */
export interface Fact {
  /** kebab-case, unique within the lecture */
  id: string;
  /** Hebrew question / cue, e.g. 'איזה אברון מייצר ATP?' */
  q: string;
  /** Short answer (Hebrew or English), e.g. 'המיטוכונדריה' */
  a: string;
  /**
   * Plausible wrong answers for multiple choice (same kind as `a`). Optional: without them
   * the other facts' answers in the lecture are used, so write them when those would be silly.
   */
  wrong?: string[];
  /** Hebrew explanation shown after answering (1–2 sentences, from the slides) */
  explain?: string;
  /** slide number in the deck, shown as a reference */
  slide?: number;
  /** short name of the deck, only when a lecture combines more than one (shown next to the slide number) */
  deck?: string;
  /** optional image from the slide, path under public/ (e.g. '/slides/cell-bio/3.webp') */
  img?: string;
  /** show `img` with the question itself (only when the question asks about the figure and its labels don't give the answer away); otherwise it appears after answering */
  imgFirst?: boolean;
}

export interface Lecture {
  /** stable id, unique across all courses — progress is keyed by it */
  id: string;
  /** Hebrew title */
  title: string;
  /** where it comes from (slide deck name) */
  source: string;
  /** short Hebrew subtitle on the path */
  subtitle: string;
  icon: string;
  /** OKLCH hue for the lecture's colour */
  hue: number;
  /** the day the lecture went live (YYYY-MM-DD) — shown under "מה חדש" for a few weeks */
  added?: string;
  /** the latest content update after that: day (YYYY-MM-DD) + a short Hebrew note of what changed */
  updated?: { date: string; note: string };
  /** Hebrew intro paragraph */
  intro?: string;
  /** concept cards + rules quiz: the lecture's opening lesson */
  concepts?: Concept[];
  quiz?: QuizItem[];
  /** lexicon words (the `word` field) taught in this lecture, e.g. 'pericarditis' */
  words?: string[];
  /** lexicon part keys taught in this lecture, e.g. 'peri', 'itis' */
  parts?: string[];
  /** question → answer cards from the slides */
  facts?: Fact[];
  /**
   * Places where the slides are wrong or misleading — shown to students
   * so they know what the correct answer is.
   */
  corrections?: { slide: number; says: string; correct: string }[];
}

/** A course of the year (e.g. anatomy). Its lectures form one learning path. */
export interface Course {
  /** kebab-case, stable forever */
  id: string;
  /** Hebrew title, e.g. 'אנטומיה' */
  title: string;
  /** short Hebrew subtitle */
  subtitle: string;
  icon: string;
  hue: number;
  /** 1 = סמסטר א׳, 2 = סמסטר ב׳ */
  semester?: 1 | 2;
  /** in teaching order; empty until the course's first deck arrives */
  lectures: Lecture[];
}
