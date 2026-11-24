/** Normalize an English answer: lowercase, trim, collapse spaces, drop dots/hyphens for comparison. */
const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[.\-\s]+/g, '')
    .trim();

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

export type TypedVerdict = 'exact' | 'typo' | 'wrong';

/**
 * Typo tolerance: exact for ≤4 letters, 1 edit for 5–8, 2 edits for ≥9.
 * Never accept an answer that is (at least as close to) another real term — ileum ≠ ilium.
 */
export function judgeTyped(input: string, answer: string, otherWords: readonly string[] = []): TypedVerdict {
  const a = normalize(input);
  const b = normalize(answer);
  if (!a) return 'wrong';
  if (a === b) return 'exact';
  const d = levenshtein(a, b);
  const allowed = b.length >= 9 ? 2 : b.length >= 5 ? 1 : 0;
  if (d > allowed) return 'wrong';
  for (const w of otherWords) {
    const o = normalize(w);
    if (o !== b && levenshtein(a, o) <= d) return 'wrong';
  }
  return 'typo';
}

export const todayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function dayDiff(a: string, b: string) {
  const [y1, m1, d1] = a.split('-').map(Number);
  const [y2, m2, d2] = b.split('-').map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 864e5);
}
