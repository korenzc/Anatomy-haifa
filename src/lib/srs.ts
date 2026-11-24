/**
 * Spaced repetition on top of FSRS (ts-fsrs).
 * Every term ('t:word') and word part ('p:key') has its own FSRS card.
 * The app never asks for self-grading — the outcome of the *first* attempt
 * at an item in a session becomes the rating:
 *   wrong → Again · right with a typo / after a hint → Hard · right → Good
 */
import { createEmptyCard, fsrs, Rating, State, type Card, type Grade } from 'ts-fsrs';

export { Rating };

const scheduler = fsrs({
  request_retention: 0.9,
  maximum_interval: 365,
  enable_fuzz: true,
  // Lessons already drill new words several times; schedule in whole days.
  enable_short_term: false,
});

/** JSON-safe card: dates as epoch ms */
export interface StoredCard {
  due: number;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  state: State;
  last_review?: number;
}

const toStored = (c: Card): StoredCard => ({
  due: c.due.getTime(),
  stability: c.stability,
  difficulty: c.difficulty,
  elapsed_days: c.elapsed_days,
  scheduled_days: c.scheduled_days,
  learning_steps: c.learning_steps,
  reps: c.reps,
  lapses: c.lapses,
  state: c.state,
  last_review: c.last_review ? c.last_review.getTime() : undefined,
});

const fromStored = (s: StoredCard): Card => ({
  ...s,
  due: new Date(s.due),
  last_review: s.last_review ? new Date(s.last_review) : undefined,
});

export function review(stored: StoredCard | undefined, grade: Grade, now = new Date()): StoredCard {
  // A phone clock that jumped back (or a backup from a device whose clock ran ahead) leaves the last
  // review "in the future"; ts-fsrs throws on a negative gap, which would break the whole lesson.
  if (stored?.last_review && now.getTime() < stored.last_review) now = new Date(stored.last_review);
  const card = stored ? fromStored(stored) : createEmptyCard(now);
  return toStored(scheduler.next(card, now, grade).card);
}

/** Probability (0–1) the student still remembers the item right now. */
export function retrievability(stored: StoredCard | undefined, now = new Date()): number {
  if (!stored || stored.state === State.New) return 0;
  return scheduler.get_retrievability(fromStored(stored), now, false);
}

/**
 * 0–5 strength for UI (dots / bars), from FSRS stability (days until recall drops to 90%).
 * 0 = never studied.
 */
export function strength(s: StoredCard | undefined): number {
  if (!s || s.reps === 0) return 0;
  const st = s.stability;
  if (st < 1.5) return 1;
  if (st < 4) return 2;
  if (st < 10) return 3;
  if (st < 30) return 4;
  return 5;
}

export function gradeFor(outcome: 'correct' | 'typo' | 'wrong'): Grade {
  return outcome === 'wrong' ? Rating.Again : outcome === 'typo' ? Rating.Hard : Rating.Good;
}
