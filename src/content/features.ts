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

export const features: Feature[] = [];
