/**
 * Big app features for "מה חדש" (shown next to new lectures for NEWS_DAYS days).
 * Add one whenever a big feature ships (new tab, screen or way to use the app), in the same change.
 */
export interface Feature {
  id: string; // permanent
  date: string; // YYYY-MM-DD, the day it went live
  icon: string;
  /** OKLCH hue for the icon's background */
  hue: number;
  title: string;
  /** one short, inviting sentence */
  note: string;
  /** the tab it opens */
  tab: 'path' | 'practice' | 'dictionary' | 'progress';
}

export const features: Feature[] = [
  {
    id: 'intro',
    date: '2026-11-24',
    icon: '🦴',
    hue: 250,
    title: 'מקצוע חדש: מבואות',
    note: 'שלד ומינוחים, רקמת חיבור, רקמת השריר ומערכת העצבים. מתחילים מכאן.',
    tab: 'path',
  },
  {
    id: 'head-face-neck',
    date: '2026-11-24',
    icon: '🧠',
    hue: 300,
    title: 'מקצוע חדש: ראש, פנים וצוואר',
    note: 'ההרצאה הראשונה כבר כאן: העין וארובת העין.',
    tab: 'path',
  },
  {
    id: 'lecture-tiles',
    date: '2026-11-24',
    icon: '🧩',
    hue: 250,
    title: 'מסלול מסודר בריבועים',
    note: 'כל הרצאה היא ריבוע. נכנסים אליה ונפתח המסלול שלה, בלי לגלול בלי סוף.',
    tab: 'path',
  },
  {
    id: 'upper-limb',
    date: '2026-11-24',
    icon: '💪',
    hue: 20,
    title: 'מקצוע חדש: גפה עליונה',
    note: '11 הרצאות מהמצגות: עצמות, מפרקים, שרירים, עצבים וכלי דם, עם האיורים מהשקפים.',
    tab: 'path',
  },
  {
    id: 'spine-back-skull',
    date: '2026-11-24',
    icon: '💀',
    hue: 150,
    title: 'מקצוע חדש: עמוד שדרה, גב וגולגולת',
    note: 'עמוד השדרה והגב, והגולגולת: עצמות, תפרים, ומה עובר בכל פתח.',
    tab: 'path',
  },
];
