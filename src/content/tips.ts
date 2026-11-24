/** "פינת הטיפים": a mini-blog by the app's maker. Newest is shown on the Path tab; the rest under "כל הטיפים". */
export interface Tip {
  id: string; // permanent
  date: string; // YYYY-MM-DD
  author: 'קורן';
  title: string;
  body: string;
}

export const tips: Tip[] = [];

/** Newest first. */
export const tipsNewestFirst = (): Tip[] => [...tips].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
