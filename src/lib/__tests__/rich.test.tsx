import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Rich } from '../../components/ui';

const html = (s: string) => renderToStaticMarkup(<Rich>{s}</Rich>);

describe('Rich (bidi isolation of Latin runs inside Hebrew)', () => {
  it('keeps Hebrew prefix hyphens and sentence periods on the Hebrew side', () => {
    expect(html('בשכיבה ב-supine')).toBe('בשכיבה ב-<bdi dir="ltr" lang="en">supine</bdi>');
    expect(html('סיכון ל-DVT.')).toBe('סיכון ל-<bdi dir="ltr" lang="en">DVT</bdi>.');
    expect(html('גידול כזה נקרא sarcoma.')).toBe('גידול כזה נקרא <bdi dir="ltr" lang="en">sarcoma</bdi>.');
    expect(html('נוטלים q.4.h. בלבד')).toContain('<bdi dir="ltr" lang="en">q.4.h.</bdi>');
    expect(html('כתוב tab. על המרשם')).toContain('<bdi dir="ltr" lang="en">tab.</bdi>');
    expect(html('מילים כמו gastritis, hepatitis ועוד')).toBe('מילים כמו <bdi dir="ltr" lang="en">gastritis</bdi>, <bdi dir="ltr" lang="en">hepatitis</bdi> ועוד');
  });
  it('isolates English words, phrases and parts', () => {
    expect(html('בצילום חזה: retrocardiac opacity = צל')).toContain('<bdi dir="ltr" lang="en">retrocardiac opacity</bdi>');
    expect(html('הסיומת -itis פירושה דלקת')).toContain('<bdi dir="ltr" lang="en">-itis</bdi>');
    expect(html('נוטלים b.i.d. אחרי האוכל')).toContain('<bdi dir="ltr" lang="en">b.i.d.</bdi>');
    expect(html('חום מעל 38°C')).toContain('38°C</bdi>');
  });
  it('keeps a word split with middle dots (tachy·card·ia) as one isolate so it is not shown reversed', () => {
    expect(html('לפני תנועה: card/cardi (tachy·card·ia, cardi·ac)')).toContain('<bdi dir="ltr" lang="en">tachy·card·ia</bdi>');
    expect(html('לפני תנועה: card/cardi (tachy·card·ia, cardi·ac)')).toContain('<bdi dir="ltr" lang="en">cardi·ac</bdi>');
  });
  it('leaves pure Hebrew alone', () => {
    expect(html('דלקת קרום הלב')).toBe('דלקת קרום הלב');
    expect(html('')).toBe('');
  });
  it('keeps Hebrew punctuation outside the isolate', () => {
    const out = html('(מלשון ectopic) — מחוץ למקום.');
    expect(out).toContain('(מלשון <bdi dir="ltr" lang="en">ectopic</bdi>) — מחוץ למקום.');
  });
});
