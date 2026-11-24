/**
 * Pre-recorded pronunciations live in public/audio/<slug>.mp3 (made by `npm run audio`).
 * Shared by the app and the generator script, so both agree on file names and on what is said.
 */

/** Said as a whole word rather than by the rules below. */
const SAY: Record<string, string> = { 'syr.': 'syrup' };

/**
 * What to say for a term, the way it is read aloud on the ward:
 * dotted and all-caps abbreviations letter by letter ("b.i.d." → "B I D", "NPO" → "N P O",
 * "DDx" → "D D X"), c̄ / s̄ as "c bar" / "s bar", shortened words as words ("tab.", "ad lib.").
 */
export function speakable(word: string): string {
  if (SAY[word]) return SAY[word];
  const bar = word.normalize('NFD').match(/^([a-z])̄$/i);
  if (bar) return `${bar[1]} bar`;
  const spell = (s: string) => s.toUpperCase().split('').join(' ');
  return word
    .split(' ')
    .map((tok) => {
      const t = tok.replace(/\.$/, '');
      if (t.includes('.')) return t.split('.').map(spell).join(' ');
      if (/^[A-Z]{2,}$/.test(t) || /^[A-Z]+x$/.test(t)) return spell(t);
      return t;
    })
    .join(' ');
}

export const audioSlug = (word: string) =>
  word
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const audioUrl = (word: string) => `/audio/${audioSlug(word)}.mp3`;
