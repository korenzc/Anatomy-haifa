import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;
const base = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;

export const IconPath = (p: P) => (
  <svg {...base} {...p}><path d="M6 21c0-4 3-5 6-6s6-2 6-6" /><circle cx="18" cy="5" r="2.2" fill="currentColor" stroke="none" /><circle cx="6" cy="21" r="0.1" /><path d="M4 4h5v5H4z" fill="currentColor" stroke="none" opacity=".9" /></svg>
);
export const IconPractice = (p: P) => (
  <svg {...base} {...p}><path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 4v5h-5" /><path d="M12 8v4l3 2" /></svg>
);
export const IconBook = (p: P) => (
  <svg {...base} {...p}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" /><path d="M9 8h6" /></svg>
);
export const IconChart = (p: P) => (
  <svg {...base} {...p}><path d="M5 20V11" /><path d="M12 20V4" /><path d="M19 20v-6" /></svg>
);
export const IconClose = (p: P) => (
  <svg {...base} strokeWidth={2.4} {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>
);
export const IconCheck = (p: P) => (
  <svg {...base} strokeWidth={3} {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);
export const IconSpeaker = (p: P) => (
  <svg {...base} {...p}><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor" /><path d="M16.5 8.5a5 5 0 0 1 0 7" /><path d="M19 6a8.5 8.5 0 0 1 0 12" /></svg>
);
export const IconLock = (p: P) => (
  <svg {...base} {...p}><rect x="5" y="11" width="14" height="10" rx="2.5" fill="currentColor" stroke="none" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
);
export const IconStar = (p: P) => (
  <svg {...base} {...p}><path d="M12 3.5l2.6 5.3 5.9.9-4.25 4.1 1 5.85L12 16.9l-5.25 2.75 1-5.85L3.5 9.7l5.9-.9z" fill="currentColor" /></svg>
);
export const IconFlame = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden {...p}><path fill="#FF9230" d="M12 2c1 3.5 5 5.5 5 11a5 5 0 0 1-10 0c0-2.5 1-4 2-5 .2 2 1 3 2 3.5C10.5 8.5 11 5 12 2z" /><path fill="#FFCC00" d="M12 12c.6 1.6 2.5 2.4 2.5 4.5a2.5 2.5 0 0 1-5 0c0-1.3.7-2 1.3-2.6.2.8.6 1.3 1.2 1.5-.3-1.3-.4-2.3 0-3.4z" /></svg>
);
export const IconBolt = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden {...p}><path fill="#FFCC00" d="M13.5 2L4 13.5h6.5L9 22l10-12h-6.6z" /></svg>
);
export const IconChevron = (p: P) => (
  <svg {...base} strokeWidth={2.5} {...p}><path d="M9 6l6 6-6 6" /></svg>
);
export const IconTrophy = (p: P) => (
  <svg {...base} {...p}><path d="M8 4h8v5a4 4 0 0 1-8 0z" fill="currentColor" /><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7" /></svg>
);
export const IconSearch = (p: P) => (
  <svg {...base} {...p}><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.2-4.2" /></svg>
);
export const IconSparkle = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden {...p}><path fill="currentColor" d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8zM19 15l.9 2.6 2.6.9-2.6.9L19 22l-.9-2.6-2.6-.9 2.6-.9z" /></svg>
);
export const IconBrain = (p: P) => (
  <svg {...base} {...p}><path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a2 2 0 0 0-3-1z" /><path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1" /></svg>
);
export const IconTarget = (p: P) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" fill="currentColor" /></svg>
);
export const IconPuzzle = (p: P) => (
  <svg {...base} {...p}><path d="M10 4a2 2 0 0 1 4 0v2h4v4h-2a2 2 0 0 0 0 4h2v4h-4v-2a2 2 0 0 0-4 0v2H6v-4h2a2 2 0 0 0 0-4H6V6h4z" /></svg>
);
export const IconShuffle = (p: P) => (
  <svg {...base} {...p}><path d="M16 4h4v4M4 20l16-16M20 16v4h-4M15 15l5 5M4 4l5 5" /></svg>
);
export const IconUndo = (p: P) => (
  <svg {...base} {...p}><path d="M9 14L4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" /></svg>
);
export const IconCards = (p: P) => (
  <svg {...base} {...p}><rect x="7" y="3" width="13" height="17" rx="2.5" /><path d="M4 7.5v11A2.5 2.5 0 0 0 6.5 21H15" /></svg>
);
export const IconSend = (p: P) => (
  <svg {...base} {...p}><path d="M12 16V4" /><path d="M7 9l5-5 5 5" /><path d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" /></svg>
);
export const IconTip = (p: P) => (
  <svg {...base} {...p}><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" /></svg>
);
export const IconChat = (p: P) => (
  <svg {...base} {...p}><path d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-7l-5 4v-4H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill="currentColor" fillOpacity=".16" /><path d="M8 9h8M8 12.5h5" /></svg>
);
export const IconArrowUp = (p: P) => (
  <svg {...base} strokeWidth={2.6} {...p}><path d="M12 19V5" /><path d="M5.5 11.5L12 5l6.5 6.5" /></svg>
);
/** iOS share symbol: a tray with an arrow out of it. */
export const IconShare = (p: P) => (
  <svg {...base} {...p}><path d="M12 3v12" /><path d="M8 7l4-4 4 4" /><path d="M8 10H6.5A1.5 1.5 0 0 0 5 11.5v8A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5v-8a1.5 1.5 0 0 0-1.5-1.5H16" /></svg>
);
/** "Add to Home Screen": a plus inside a rounded square. */
export const IconAddSquare = (p: P) => (
  <svg {...base} {...p}><rect x="3.5" y="3.5" width="17" height="17" rx="4" /><path d="M12 8v8M8 12h8" /></svg>
);
