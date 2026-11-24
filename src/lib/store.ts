/**
 * Tiny persisted store (localStorage) with useSyncExternalStore.
 * Everything the student does lives here; export/import moves it between devices.
 */
import { useSyncExternalStore } from 'react';
import { review, gradeFor, type StoredCard } from './srs';
import { dayDiff, todayKey } from './text';

interface ItemStats {
  seen: number;
  correct: number;
  wrong: number;
  lastWrong?: number;
  lastSeen?: number;
}

export interface Settings {
  dailyGoal: number; // XP per day
  sound: boolean;
  haptics: boolean;
  speech: boolean;
  theme: 'system' | 'light' | 'dark';
  /** the student chose the look themselves (until then the app stays light) */
  themePicked?: boolean;
  /** the course shown on the path tab ('' = the first one) */
  course: string;
}

export interface PersistedState {
  version: 1;
  cards: Record<string, StoredCard>;
  stats: Record<string, ItemStats>;
  /** checkpoint id → best score (0..1) and whether passed */
  checkpoints: Record<string, { passed: boolean; best: number; at: number }>;
  xp: number;
  /** YYYY-MM-DD → xp earned that day */
  days: Record<string, number>;
  /** YYYY-MM-DD → answers given / correct that day (first graded attempts; feeds the leaderboard) */
  daily: Record<string, { a: number; c: number }>;
  settings: Settings;
  createdAt: number;
}

// Storage key predates the rename; keep it so existing progress survives.
const KEY = 'shoresh:v1';

const defaultSettings: Settings = { dailyGoal: 30, sound: true, haptics: true, speech: true, theme: 'light', course: '' };

const fresh = (): PersistedState => ({
  version: 1,
  cards: {},
  stats: {},
  checkpoints: {},
  xp: 0,
  days: {},
  daily: {},
  settings: { ...defaultSettings },
  createdAt: Date.now(),
});

const isNum = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x);
const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);

function validCard(c: unknown): c is StoredCard {
  if (!isObj(c)) return false;
  return (
    isNum(c.due) &&
    isNum(c.stability) &&
    isNum(c.difficulty) &&
    isNum(c.reps) &&
    isNum(c.lapses) &&
    isNum(c.state) &&
    isNum(c.scheduled_days ?? 0) &&
    isNum(c.elapsed_days ?? 0) &&
    isNum(c.learning_steps ?? 0) &&
    (c.last_review === undefined || c.last_review === null || isNum(c.last_review))
  );
}

function validStats(x: unknown): x is ItemStats {
  return isObj(x) && isNum(x.seen) && isNum(x.correct) && isNum(x.wrong);
}

function sanitizeDaily(o: unknown): PersistedState['daily'] {
  const out: PersistedState['daily'] = {};
  if (!isObj(o)) return out;
  for (const [d, v] of Object.entries(o)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || !isObj(v) || !isNum(v.a) || !isNum(v.c) || v.a < 0 || v.c < 0) continue;
    const a = Math.floor(v.a);
    if (a === 0) continue;
    out[d] = { a, c: Math.min(Math.floor(v.c), a) };
  }
  return out;
}

/**
 * Accept only well-formed data (imports and old/corrupted localStorage).
 * Invalid entries are dropped one by one, so a single bad card never blanks the app.
 */
export function sanitize(raw: unknown): PersistedState | null {
  if (!isObj(raw) || raw.version !== 1 || !isObj(raw.cards)) return null;
  const base = fresh();
  const pick = <T,>(o: unknown, ok: (v: unknown) => v is T): Record<string, T> =>
    isObj(o) ? Object.fromEntries(Object.entries(o).filter(([, v]) => ok(v))) as Record<string, T> : {};
  const cards = pick(raw.cards, validCard);
  for (const c of Object.values(cards)) {
    c.scheduled_days ??= 0;
    c.elapsed_days ??= 0;
    c.learning_steps ??= 0;
    if (c.last_review === null) delete c.last_review;
  }
  const settings = isObj(raw.settings) ? raw.settings : {};
  const goal = Number(settings.dailyGoal);
  const theme = settings.theme;
  return {
    version: 1,
    cards,
    stats: pick(raw.stats, validStats),
    checkpoints: pick(raw.checkpoints, (v): v is PersistedState['checkpoints'][string] => isObj(v) && typeof v.passed === 'boolean' && isNum(v.best)),
    days: Object.fromEntries(Object.entries(pick(raw.days, (v): v is number => isNum(v) && v >= 0)).filter(([d]) => /^\d{4}-\d{2}-\d{2}$/.test(d))),
    daily: sanitizeDaily(raw.daily),
    xp: isNum(raw.xp) && raw.xp >= 0 ? Math.floor(raw.xp) : 0,
    settings: {
      dailyGoal: Number.isFinite(goal) ? Math.min(200, Math.max(10, Math.round(goal / 10) * 10)) : base.settings.dailyGoal,
      sound: typeof settings.sound === 'boolean' ? settings.sound : base.settings.sound,
      haptics: typeof settings.haptics === 'boolean' ? settings.haptics : base.settings.haptics,
      speech: typeof settings.speech === 'boolean' ? settings.speech : base.settings.speech,
      // 'system' used to be the default; nobody had picked it on purpose, so it becomes light until they choose
      theme: theme === 'light' || theme === 'dark' || (theme === 'system' && settings.themePicked === true) ? theme : 'light',
      ...(settings.themePicked === true ? { themePicked: true } : {}),
      course: typeof settings.course === 'string' && /^[a-z0-9-]{0,40}$/.test(settings.course) ? settings.course : '',
    },
    createdAt: isNum(raw.createdAt) ? raw.createdAt : base.createdAt,
  };
}

export const STORAGE_KEY = KEY;

/** False when the saved progress could not be read or understood: the account backup then stays untouched. */
let storageOk = true;
export const storageReadable = () => storageOk;

function load(): PersistedState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = sanitize(JSON.parse(raw));
      if (s) return s;
      storageOk = false;
    }
  } catch {
    /* private mode / corrupted — start fresh */
    storageOk = false;
  }
  return fresh();
}

let state: PersistedState = load();
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* quota / private mode: keep in memory */
  }
}

function setState(fn: (s: PersistedState) => PersistedState) {
  state = fn(state);
  persist();
  listeners.forEach((l) => l());
}

export const getState = () => state;

export function useStore<T>(selector: (s: PersistedState) => T): T {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => selector(state),
    () => selector(state),
  );
}

// ---------- actions ----------

/** Record the first graded attempt at an item in a session. */
export function recordAnswer(id: string, outcome: 'correct' | 'typo' | 'wrong', now = new Date()) {
  setState((s) => {
    const prev = s.stats[id] ?? { seen: 0, correct: 0, wrong: 0 };
    const ok = outcome !== 'wrong';
    const day = todayKey(now);
    const d = s.daily[day] ?? { a: 0, c: 0 };
    return {
      ...s,
      daily: { ...s.daily, [day]: { a: d.a + 1, c: d.c + (ok ? 1 : 0) } },
      cards: { ...s.cards, [id]: review(s.cards[id], gradeFor(outcome), now) },
      stats: {
        ...s.stats,
        [id]: {
          seen: prev.seen + 1,
          correct: prev.correct + (ok ? 1 : 0),
          wrong: prev.wrong + (ok ? 0 : 1),
          lastWrong: ok ? prev.lastWrong : now.getTime(),
          lastSeen: now.getTime(),
        },
      },
    };
  });
}

export function addXp(n: number) {
  const day = todayKey();
  setState((s) => ({ ...s, xp: s.xp + n, days: { ...s.days, [day]: (s.days[day] ?? 0) + n } }));
}

export function saveCheckpoint(id: string, score: number, passed: boolean) {
  setState((s) => {
    const prev = s.checkpoints[id];
    return {
      ...s,
      checkpoints: {
        ...s.checkpoints,
        [id]: { passed: passed || !!prev?.passed, best: Math.max(score, prev?.best ?? 0), at: Date.now() },
      },
    };
  });
}

export const updateSettings = (patch: Partial<Settings>) =>
  setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));

export const resetAll = () => setState(() => ({ ...fresh(), settings: state.settings }));

export function importState(json: string): boolean {
  try {
    const next = sanitize(JSON.parse(json));
    if (!next) return false;
    setState(() => next);
    return true;
  } catch {
    return false;
  }
}

export const exportState = () => JSON.stringify(state);

/**
 * Combine two copies of one student's progress (e.g. the old site address and the new one).
 * Never loses work: each item keeps its most recent review, counts keep the larger value.
 * Repeats of the same old copy change nothing.
 */
export function mergeStates(a: PersistedState, b: PersistedState): PersistedState {
  const maxBy = <T,>(x: Record<string, T>, y: Record<string, T>, newer: (p: T, q: T) => boolean): Record<string, T> => {
    const out = { ...x };
    for (const [k, v] of Object.entries(y)) if (!(k in out) || newer(v, out[k])) out[k] = v;
    return out;
  };
  const daily = { ...a.daily };
  for (const [d, v] of Object.entries(b.daily)) {
    const p = daily[d];
    daily[d] = p ? { a: Math.max(p.a, v.a), c: Math.max(p.c, v.c) } : v;
  }
  const checkpoints = { ...a.checkpoints };
  for (const [k, v] of Object.entries(b.checkpoints)) {
    const p = checkpoints[k];
    checkpoints[k] = p ? { passed: p.passed || v.passed, best: Math.max(p.best, v.best), at: Math.max(p.at, v.at) } : v;
  }
  const aEmpty = !Object.keys(a.cards).length;
  return {
    version: 1,
    cards: maxBy(a.cards, b.cards, (q, p) => (q.last_review ?? 0) > (p.last_review ?? 0) || ((q.last_review ?? 0) === (p.last_review ?? 0) && q.reps > p.reps)),
    stats: maxBy(a.stats, b.stats, (q, p) => q.seen > p.seen),
    checkpoints,
    xp: Math.max(a.xp, b.xp),
    days: maxBy(a.days, b.days, (q, p) => q > p),
    daily,
    // a copy with no practice yet hasn't really chosen settings
    settings: aEmpty ? b.settings : a.settings,
    createdAt: Math.min(a.createdAt, b.createdAt),
  };
}

/** Merge progress brought from elsewhere into this phone's copy. */
export function mergeIn(raw: unknown): boolean {
  const other = sanitize(raw);
  if (!other) return false;
  setState((s) => mergeStates(s, other));
  return true;
}

// ---------- derived ----------

/** Consecutive days (ending today, or yesterday if today not yet done) with XP > 0. */
export function streakOf(days: Record<string, number>, today = todayKey()): number {
  const active = Object.keys(days)
    .filter((d) => days[d] > 0)
    .sort()
    .reverse();
  if (!active.length) return 0;
  const gap = dayDiff(active[0], today);
  if (gap > 1) return 0;
  let n = 1;
  for (let i = 1; i < active.length; i++) {
    if (dayDiff(active[i], active[i - 1]) === 1) n++;
    else break;
  }
  return n;
}

