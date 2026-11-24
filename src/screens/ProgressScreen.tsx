import { useMemo, useRef, useState } from 'react';
import { courseItems, liveCourses as courses, facts, termById, terms } from '../content';
import { retrievability, strength } from '../lib/srs';
import { exportState, importState, resetAll, streakOf, updateSettings, useStore } from '../lib/store';
import { todayKey } from '../lib/text';
import { IconChevron, IconFlame } from '../components/Icons';
import { Bar, Dots, Screen, Segmented, ToggleRow, Rich } from '../components/ui';
import { TermSheet, PartSheet } from './DictionaryScreen';
import type { PartInfo, TermInfo } from '../content';

const DAYS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];

export function ProgressScreen({ toast }: { toast: (m: string) => void }) {
  const state = useStore((s) => s);
  const { settings } = state;
  const streak = streakOf(state.days);
  const today = state.days[todayKey()] ?? 0;
  const [term, setTerm] = useState<TermInfo | null>(null);
  const [part, setPart] = useState<PartInfo | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const week = useMemo(() => {
    const out: { label: string; xp: number; today: boolean }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      out.push({ label: DAYS[d.getDay()], xp: state.days[todayKey(d)] ?? 0, today: i === 0 });
    }
    return out;
  }, [state.days]);
  const maxXp = Math.max(state.settings.dailyGoal, ...week.map((w) => w.xp));

  const learned = terms.filter((t) => state.cards[t.id]);
  const learnedFacts = facts.filter((f) => state.cards[f.id]);
  const mastered = [...learned, ...learnedFacts].filter((t) => strength(state.cards[t.id]) >= 4).length;
  const perCourse = courses.map((c) => {
    const { terms: ts, facts: fs } = courseItems(c);
    const ids = [...ts, ...fs].map((x) => x.id);
    return {
      c,
      total: ids.length,
      seen: ids.filter((id) => state.cards[id]).length,
      strong: ids.filter((id) => state.cards[id] && strength(state.cards[id]) >= 4).length,
    };
  });
  const weakest = useMemo(
    () =>
      learned
        .filter((t) => (state.stats[t.id]?.wrong ?? 0) > 0 || retrievability(state.cards[t.id]) < 0.85)
        .sort((a, b) => retrievability(state.cards[a.id]) - retrievability(state.cards[b.id]))
        .slice(0, 8),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state],
  );
  const totals = Object.values(state.stats).reduce((a, s) => ({ c: a.c + s.correct, n: a.n + s.seen }), { c: 0, n: 0 });

  const doExport = async () => {
    const data = exportState();
    const blob = new Blob([data], { type: 'application/json' });
    const file = new File([blob], `somatomi-backup-${todayKey()}.json`, { type: 'application/json' });
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'גיבוי התקדמות' });
        return;
      }
    } catch {
      /* user cancelled share — fall back to download */
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = file.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast('קובץ הגיבוי הורד');
  };

  const doImport = async (f: File | undefined) => {
    if (!f) return;
    const ok = importState(await f.text());
    toast(ok ? 'ההתקדמות שוחזרה ✓' : 'הקובץ לא תקין');
  };

  return (
    <Screen title="התקדמות">
      <div className="big-stats">
        <div className="card big-stat">
          <div className="v num" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <IconFlame width={28} height={28} /> {streak}
          </div>
          <div className="l">ימי רצף</div>
        </div>
        <div className="card big-stat" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="ring" style={{ ['--p' as string]: Math.min(1, today / settings.dailyGoal) }}>
            <span className="num">{Math.min(100, Math.round((today / settings.dailyGoal) * 100))}%</span>
          </div>
          <div>
            <div className="v num" style={{ fontSize: 'var(--fs-title3)' }}>
              {today}/{settings.dailyGoal}
            </div>
            <div className="l">יעד יומי</div>
          </div>
        </div>
        <div className="card big-stat">
          <div className="v num">{learned.length + learnedFacts.length}</div>
          <div className="l">פריטים שלמדתי · {mastered} שולטים</div>
        </div>
        <div className="card big-stat">
          <div className="v num">{totals.n ? Math.round((totals.c / totals.n) * 100) : 0}%</div>
          <div className="l">דיוק כולל · {state.xp} נק׳</div>
        </div>
      </div>

      <div className="section-header">השבוע</div>
      <div className="card">
        <div className="week" aria-label="נקודות בשבעת הימים האחרונים">
          {week.map((w, i) => (
            <div className="col" key={i}>
              <div className={`b ${w.xp ? '' : 'zero'}`} style={{ height: `${Math.max(3, (w.xp / maxXp) * 80)}px`, opacity: w.today ? 1 : 0.75 }} title={`${w.xp}`} />
              <div className="d" style={w.today ? { color: 'var(--label)', fontWeight: 700 } : undefined}>
                {w.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section-header">לפי קורס</div>
      <div className="list">
        {perCourse.map(({ c, total, seen, strong }) => (
          <div className="row with-icon" key={c.id}>
            <span className="row-icon" style={{ background: `oklch(0.62 0.17 ${c.hue})` }} aria-hidden>
              {c.icon}
            </span>
            <div className="row-main">
              <div className="row-title">{c.title}</div>
              <div style={{ marginTop: 5 }}>
                <Bar value={total ? seen / total : 0} color={`oklch(0.62 0.17 ${c.hue})`} />
              </div>
              <div className="row-sub">
                <bdi dir="ltr" className="num">{seen}/{total}</bdi> נלמדו · {strong} שולטים · {c.lectures.length} הרצאות
              </div>
            </div>
          </div>
        ))}
      </div>

      {weakest.length > 0 && (
        <>
          <div className="section-header">המילים שהכי צריכות חיזוק</div>
          <div className="list">
            {weakest.map((t) => (
              <button className="row" key={t.id} onClick={() => setTerm(termById.get(t.id) ?? null)}>
                <div className="row-main">
                  <div className="dict-term">
                    <Segmented term={t} />
                  </div>
                  <div className="row-sub"><Rich>{t.he}</Rich></div>
                </div>
                <span className="row-trail">
                  <Dots value={strength(state.cards[t.id])} />
                  <IconChevron className="chev flip" />
                </span>
              </button>
            ))}
          </div>
          <p className="section-footer">האלגוריתם (FSRS) מעריך כמה סביר שתזכרו כל מילה, ומחזיר אותה רגע לפני שהיא נשכחת.</p>
        </>
      )}

      <div className="section-header">הגדרות</div>
      <div className="list">
        <div className="row">
          <div className="row-main">יעד יומי (נקודות)</div>
          <div className="stepper" dir="ltr">
            <button aria-label="הפחתה" onClick={() => updateSettings({ dailyGoal: Math.max(10, settings.dailyGoal - 10) })}>
              −
            </button>
            <button aria-label="הוספה" onClick={() => updateSettings({ dailyGoal: Math.min(200, settings.dailyGoal + 10) })}>
              +
            </button>
          </div>
          <span className="num" style={{ minWidth: 28, textAlign: 'center', fontWeight: 600 }}>
            {settings.dailyGoal}
          </span>
        </div>
        <ToggleRow checked={settings.sound} onChange={(v) => updateSettings({ sound: v })} label="צלילים" />
        <ToggleRow checked={settings.haptics} onChange={(v) => updateSettings({ haptics: v })} label="רטט" />
        <ToggleRow checked={settings.speech} onChange={(v) => updateSettings({ speech: v })} label="הגייה באנגלית" />
        <div className="row">
          <div className="row-main">מראה</div>
          <div className="segmented" style={{ margin: 0, width: 190 }} role="radiogroup">
            <span
              className="thumb"
              aria-hidden
              style={{
                width: 'calc(33.333% - 1.33px)',
                insetInlineStart: 2,
                transform: `translateX(calc(-100% * ${['system', 'light', 'dark'].indexOf(settings.theme)}))`,
              }}
            />
            {(
              [
                ['system', 'אוטו׳'],
                ['light', 'בהיר'],
                ['dark', 'כהה'],
              ] as const
            ).map(([v, l]) => (
              <button
                key={v}
                role="radio"
                aria-checked={settings.theme === v}
                onClick={() => updateSettings({ theme: v, themePicked: true })}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="section-header">גיבוי ומעבר בין מכשירים</div>
      <div className="list">
        <button className="row" onClick={doExport}>
          <div className="row-main" style={{ color: 'var(--accent-text)' }}>
            ייצוא ההתקדמות לקובץ
          </div>
        </button>
        <button className="row" onClick={() => fileRef.current?.click()}>
          <div className="row-main" style={{ color: 'var(--accent-text)' }}>
            ייבוא מקובץ גיבוי
          </div>
        </button>
      </div>
      <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => {
          void doImport(e.target.files?.[0]);
          e.target.value = ''; // allow importing the same file again
        }} />
      <p className="section-footer">ההתקדמות נשמרת במכשיר הזה, וגם בחשבון אם הצטרפתם לטבלה. כדי להמשיך בטלפון אחר, היכנסו שם לטבלה עם השם והקוד, או ייצאו קובץ ופתחו אותו שם עם "ייבוא".</p>

      <div className="section-header">איפוס</div>
      <div className="list">
        <button
          className="row hold"
          onPointerDown={(e) => {
            const el = e.currentTarget;
            const id = setTimeout(() => {
              resetAll();
              try {
                navigator.vibrate?.(30);
              } catch {
                /* unsupported */
              }
              toast('ההתקדמות אופסה');
            }, 1600);
            const cancel = () => {
              clearTimeout(id);
              el.removeEventListener('pointerup', cancel);
              el.removeEventListener('pointerleave', cancel);
              el.removeEventListener('pointercancel', cancel);
            };
            el.addEventListener('pointerup', cancel);
            el.addEventListener('pointerleave', cancel);
            el.addEventListener('pointercancel', cancel);
          }}
          onContextMenu={(e) => e.preventDefault()}
          onClick={(e) => {
            // keyboard / assistive tech can't "hold": confirm instead
            if (e.detail === 0 && window.confirm('לאפס את כל ההתקדמות? אי אפשר לבטל.')) {
              resetAll();
              toast('ההתקדמות אופסה');
            }
          }}
        >
          <span className="fill" aria-hidden />
          <span style={{ position: 'relative' }}>החזיקו לחוץ כדי לאפס הכול</span>
        </button>
      </div>
      <p className="section-footer" style={{ paddingBottom: 12 }}>
        אנטומיה · נבנה עם אלגוריתם חזרה מרווחת FSRS. התוכן נבדק, אבל אם מצאתם טעות — ספרו לנו.
      </p>
      <p className="credit">נעשה באהבה ע״י קורן</p>

      <TermSheet term={term} onClose={() => setTerm(null)} onPart={(p) => { setTerm(null); setTimeout(() => setPart(p), 280); }} />
      <PartSheet part={part} onClose={() => setPart(null)} onTerm={(t) => { setPart(null); setTimeout(() => setTerm(t), 280); }} />
    </Screen>
  );
}
