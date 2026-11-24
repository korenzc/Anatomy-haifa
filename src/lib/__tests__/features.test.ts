import { describe, expect, it } from 'vitest';
import { features } from '../../content/features';
import { NEWS_DAYS, recentFeatures } from '../news';

describe('app features under "מה חדש"', () => {
  it('have unique ids, real dates and no misspelled owner name', () => {
    expect(new Set(features.map((f) => f.id)).size).toBe(features.length);
    for (const f of features) {
      expect(f.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(`${f.title} ${f.note}`).not.toContain('אתן');
    }
  });
  it.skipIf(features.length === 0)('show for NEWS_DAYS days after going live, newest first', () => {
    const d = features[0].date;
    expect(recentFeatures(d).length).toBeGreaterThan(0);
    expect(recentFeatures('2000-01-01')).toEqual([]);
    const later = new Date(`${d}T12:00:00Z`);
    later.setUTCDate(later.getUTCDate() + NEWS_DAYS + 1);
    expect(recentFeatures(later.toISOString().slice(0, 10)).some((f) => f.feature.id === features[0].id)).toBe(false);
    const ag = recentFeatures(d).map((f) => f.ago);
    expect([...ag].sort((a, b) => a - b)).toEqual(ag);
  });
});
