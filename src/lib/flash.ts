import { termsWithPart, type FactInfo, type LectureInfo, type PartInfo, type TermInfo } from '../content';
import { shuffle } from './random';

export type FlashDeck = 'terms' | 'parts' | 'facts' | 'all';
export type FlashDir = 'en-he' | 'he-en';

export interface FlashCard {
  id: string;
  term?: TermInfo;
  part?: PartInfo;
  fact?: FactInfo;
  /** for a part: words from the same lecture that use it */
  examples?: TermInfo[];
}

export interface FlashConfig {
  lectureId: string;
  title: string;
  cards: FlashCard[];
  dir: FlashDir;
}

/**
 * Flashcards are free self-study: they never touch the spaced-repetition cards or the path.
 * The only thing remembered is which cards were marked "didn't know", per lecture, so the
 * next round can start from them. Per-device convenience, so plain localStorage is enough.
 */
const KEY = 'shoresh:flash';

function readAll(): Record<string, string[]> {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  } catch {
    return {};
  }
}

export function loadMissed(lectureId: string): Set<string> {
  const ids = readAll()[lectureId];
  return new Set(Array.isArray(ids) ? ids.filter((x) => typeof x === 'string') : []);
}

export function saveMissed(lectureId: string, ids: Set<string>) {
  try {
    const all = readAll();
    all[lectureId] = [...ids];
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* storage unavailable — the round still works */
  }
}

/** The decks a lecture has material for, in display order ('all' only when it mixes kinds). */
export function lectureDecks(l: LectureInfo): FlashDeck[] {
  const kinds: FlashDeck[] = [];
  if (l.termList.length) kinds.push('terms');
  if (l.partList.length) kinds.push('parts');
  if (l.factList.length) kinds.push('facts');
  return kinds.length > 1 ? [...kinds, 'all'] : kinds;
}

export function lectureCards(l: LectureInfo, deck: FlashDeck): FlashCard[] {
  const words = new Set(l.words);
  const has = (d: FlashDeck) => deck === d || deck === 'all';
  const terms: FlashCard[] = has('terms') ? l.termList.map((t) => ({ id: t.id, term: t })) : [];
  const parts: FlashCard[] = has('parts')
    ? l.partList.map((p) => ({ id: p.id, part: p, examples: termsWithPart(p.key).filter((t) => words.has(t.word)).slice(0, 3) }))
    : [];
  const facts: FlashCard[] = has('facts') ? l.factList.map((f) => ({ id: f.id, fact: f })) : [];
  return [...terms, ...parts, ...facts];
}

export function flashConfig(l: LectureInfo, deck: FlashDeck, dir: FlashDir, onlyMissed: boolean): FlashConfig {
  let cards = lectureCards(l, deck);
  if (onlyMissed) {
    const missed = loadMissed(l.id);
    cards = cards.filter((c) => missed.has(c.id));
  }
  return { lectureId: l.id, title: l.title, cards: shuffle(cards), dir };
}
