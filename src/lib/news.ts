/**
 * "מה חדש": lectures that went live or were updated lately, newest first.
 * Driven by each lecture's `added` / `updated` dates (src/content/courses/…).
 */
import { courses, type CourseInfo, type LectureInfo } from '../content';
import { features, type Feature } from '../content/features';
import { dayDiff, todayKey } from './text';

/** How long a lecture stays under "מה חדש". */
export const NEWS_DAYS = 21;

export interface NewsItem {
  lecture: LectureInfo;
  course: CourseInfo;
  kind: 'new' | 'updated';
  date: string;
  /** days since `date` (0 = today) */
  ago: number;
  note?: string;
}

export function recentNews(today = todayKey()): NewsItem[] {
  const out: NewsItem[] = [];
  for (const course of courses)
    for (const lecture of course.lectures) {
      const u = lecture.updated;
      const item: Omit<NewsItem, 'ago'> | null =
        u && (!lecture.added || u.date > lecture.added)
          ? { lecture, course, kind: 'updated', date: u.date, note: u.note }
          : lecture.added
            ? { lecture, course, kind: 'new', date: lecture.added }
            : null;
      if (!item) continue;
      const ago = dayDiff(item.date, today);
      if (ago >= 0 && ago <= NEWS_DAYS) out.push({ ...item, ago });
    }
  return out.sort((a, b) => a.ago - b.ago);
}

export interface FeatureNews {
  feature: Feature;
  ago: number;
}

/** Big app features that went live lately, newest first. */
export function recentFeatures(today = todayKey()): FeatureNews[] {
  return features
    .map((feature) => ({ feature, ago: dayDiff(feature.date, today) }))
    .filter((f) => f.ago >= 0 && f.ago <= NEWS_DAYS)
    .sort((a, b) => a.ago - b.ago);
}

/** 'היום', 'אתמול', 'לפני 5 ימים' */
export function agoLabel(days: number): string {
  if (days === 0) return 'היום';
  if (days === 1) return 'אתמול';
  if (days === 2) return 'שלשום';
  return `לפני ${days} ימים`;
}
