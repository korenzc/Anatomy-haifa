import { useEffect, useMemo, useRef, useState } from 'react';
import { activeCourse, isUnlocked, nodeSize, PASS_SCORE, pathOf, pathProgress, SECTIONS, type PathNode } from '../lib/path';
import { examSession, practiceSession, sessionForNode, testSize, type Session } from '../lib/session';
import { liveCourses } from '../content';
import { getState, streakOf, updateSettings, useStore } from '../lib/store';
import { todayKey } from '../lib/text';
import { IconBolt, IconBook, IconCheck, IconChevron, IconFlame, IconLock, IconStar, IconTrophy } from '../components/Icons';
import { Screen, Segmented, SendMaterial, Sheet, Rich, TipsCorner, WhatsNew } from '../components/ui';
import { recentFeatures, recentNews, type NewsItem } from '../lib/news';
import type { Feature } from '../content/features';

/** Short label under a path node. */
function nodeLabel(n: PathNode) {
  if (n.kind === 'intro') return 'מבוא';
  if (n.kind === 'lesson') return `שלב ${n.n}`;
  return n.last ? 'מבחן סיום' : 'מבחן ביניים';
}

/** "5 מילים" when a node is all words, else "5 פריטים"; a test says how many questions it asks. */
function itemsLabel(n: PathNode) {
  if (n.kind === 'checkpoint') return `כ־${testSize(n)} שאלות`; // plus a few decode questions on words
  return n.facts.length ? `${nodeSize(n)} פריטים` : `${n.terms.length} מילים`;
}

/** Zig-zag offsets for the winding path (px, flipped for RTL by using logical direction). */
const WIGGLE = [0, 34, 52, 34, 0, -34, -52, -34];

export function PathScreen({ start, openTab }: { start: (s: Session) => void; openTab?: (t: Feature['tab']) => void }) {
  const state = useStore((s) => s);
  const course = activeCourse(state);
  const path = pathOf(course.id);
  const progress = useMemo(() => pathProgress(state, path), [state, path]);
  const [openNode, setOpenNode] = useState<PathNode | null>(null);
  const currentRef = useRef<HTMLButtonElement>(null);
  const streak = streakOf(state.days);
  const todayXp = state.days[todayKey()] ?? 0;

  // Bring the current node into view on open — only when it's below the fold.
  useEffect(() => {
    const el = currentRef.current;
    if (el && el.getBoundingClientRect().bottom > window.innerHeight - 90) el.scrollIntoView({ block: 'center' });
  }, [course.id]);

  const cur = path[progress.current];
  const news = useMemo(() => recentNews(), []);
  const featureNews = useMemo(() => recentFeatures(), []);
  const openNews = (n: NewsItem) => {
    updateSettings({ course: n.course.id });
    // wait for the course's path to render, then bring the lecture into view
    requestAnimationFrame(() => document.getElementById(`lecture-${n.lecture.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };
  const learnedCount = Object.keys(state.cards).filter((k) => !k.startsWith('p:')).length;

  const launch = (node: PathNode, jump = false) => {
    setOpenNode(null);
    const s = getState();
    start(sessionForNode(node, s, jump));
  };

  return (
    <Screen title="מסלול" brand>
      <div className="stats-row">
        <span className="pill">
          <IconFlame /> <span className="num">{streak}</span> ימים
        </span>
        <span className="pill">
          <IconBolt /> <bdi dir="ltr" className="num">{todayXp}/{state.settings.dailyGoal}</bdi> היום
        </span>
        <span className="pill">
          <IconBook width={18} height={18} style={{ color: 'var(--blue)' }} /> <span className="num">{learnedCount}</span> נלמדו
        </span>
      </div>

      {/* only subjects that already have slides; with a single subject there is nothing to choose */}
      {liveCourses.length > 1 && (
        <nav className="subjects" aria-label="מקצועות">
          {liveCourses.map((c) => (
            <button
              key={c.id}
              className="subject press"
              style={{ ['--hue' as string]: c.hue }}
              aria-pressed={c.id === course.id}
              onClick={() => updateSettings({ course: c.id })}
            >
              <span aria-hidden>{c.icon}</span>
              {c.title}
              {news.some((n) => n.course.id === c.id) && <span className="subject-dot" aria-label="יש חדש" />}
            </button>
          ))}
        </nav>
      )}

      <WhatsNew items={news} onOpen={openNews} showCourse={liveCourses.length > 1} features={featureNews} onOpenFeature={(f) => openTab?.(f.feature.tab)} />
      <TipsCorner />

      {cur ? (
        <button className="continue-card press" style={{ ['--hue' as string]: cur.unit.hue }} onClick={() => launch(cur)}>
          <div>
            <div className="k">
              {cur.unit.icon} {cur.unit.title}
            </div>
            <div className="t">{cur.kind === 'checkpoint' ? nodeLabel(cur) : `המשך: ${nodeLabel(cur)}`}</div>
            <div className="k">
              {cur.kind === 'intro'
                ? 'כרטיסי הסבר · שאלות קצרות'
                : cur.kind === 'lesson'
                  ? cur.facts.length ? `${nodeSize(cur)} פריטים חדשים` : `${cur.terms.length} מילים חדשות`
                  : `${itemsLabel(cur)} · עוברים ב־${PASS_SCORE * 100}%`}
            </div>
          </div>
          <span className="go">
            <IconChevron className="flip" width={22} height={22} strokeWidth={3} />
          </span>
        </button>
      ) : !course.lectures.length ? (
        <div className="card" style={{ padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 44 }}>{course.icon}</div>
          <div className="sheet-title">עוד לא עלו מצגות ל{course.title}</div>
          <p className="hint" style={{ marginBottom: liveCourses.length ? 14 : 0 }}>
            כשהמצגות של הקורס יעלו, כל מצגת תהפוך כאן להרצאה במסלול — רק עם מה שמופיע בשקפים.
          </p>
          <SendMaterial course={course.title} compact />
        </div>
      ) : (
        <div className="card" style={{ padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 44 }}>🎓</div>
          <div className="sheet-title">סיימתם את כל ההרצאות שעלו ב{course.title}!</div>
          <p className="hint" style={{ marginBottom: 14 }}>
            עכשיו זה הזמן לחזק לקראת המבחן. התרגול החכם יחזיר כל פריט בדיוק לפני שהוא נשכח.
          </p>
          <button
            className="btn btn-primary press"
            onClick={() => {
              const s = examSession(getState(), 30, course.id) ?? practiceSession(getState(), 12, course.id);
              if (s) start(s);
            }}
          >
            מבחן תרגול על כל הקורס
          </button>
        </div>
      )}

      {SECTIONS.filter((u) => u.courseId === course.id).map((u, si) => {
        const nodes = path.filter((n) => n.unit.id === u.id);
        const items = [...u.terms, ...u.facts];
        const total = items.length;
        const learned = items.filter((t) => state.cards[t.id]).length;
        let w = 0;
        return (
          <section key={u.id} id={u.id} className="unit" style={{ ['--hue' as string]: u.hue }} aria-label={u.title}>
            {si === 0 && <h2 className="path-group">{course.icon} {course.title}</h2>}
            <div className="unit-head">
              <span className="unit-glyph" aria-hidden>
                {u.icon}
              </span>
              <div style={{ minWidth: 0 }}>
                <div className="unit-kicker">הרצאה {u.lecture}</div>
                <div className="unit-title">{u.title}</div>
                <div className="unit-sub">{u.subtitle}</div>
              </div>
              <div className="unit-meta">
                <bdi dir="ltr" className="num">{learned}/{total}</bdi>
                <br />
                {u.facts.length ? 'פריטים' : 'מילים'}
              </div>
            </div>
            <div className="nodes">
              {nodes.map((n) => {
                const done = progress.done[n.index];
                const open = isUnlocked(n.index, progress);
                const isCur = n.index === progress.current;
                const dx = WIGGLE[w++ % WIGGLE.length];
                const cls = ['node', n.kind, done ? 'done' : open ? 'open' : 'locked', isCur ? 'current' : ''].join(' ');
                return (
                  <button
                    key={n.id}
                    ref={isCur ? currentRef : undefined}
                    className={cls}
                    style={{ transform: `translateX(${dx}px)` }}
                    onClick={() => setOpenNode(n)}
                    aria-label={`${nodeLabel(n)}${done ? ', הושלם' : open ? '' : ', נעול'}`}
                  >
                    {isCur && <span className="node-bubble">{n.kind === 'checkpoint' ? 'מבחן!' : 'התחילו'}</span>}
                    <span className="node-disc">
                      {done ? (
                        n.kind === 'checkpoint' ? <IconTrophy /> : <IconCheck />
                      ) : !open ? (
                        <IconLock />
                      ) : n.kind === 'checkpoint' ? (
                        <IconTrophy />
                      ) : n.kind === 'intro' ? (
                        <IconBook />
                      ) : (
                        <IconStar />
                      )}
                    </span>
                    <span className="node-label">{nodeLabel(n)}</span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}

      <NodeSheet node={openNode} onClose={() => setOpenNode(null)} onStart={launch} progress={progress} />
    </Screen>
  );
}

function NodeSheet({
  node,
  onClose,
  onStart,
  progress,
}: {
  node: PathNode | null;
  onClose: () => void;
  onStart: (n: PathNode, jump?: boolean) => void;
  progress: ReturnType<typeof pathProgress>;
}) {
  const [last, setLast] = useState(node);
  const [all, setAll] = useState(false);
  if (node && node !== last) {
    setLast(node);
    setAll(false);
  }
  const n = node ?? last;
  const best = useStore((s) => (n ? s.checkpoints[n.id]?.best : undefined));
  if (!n) return null;
  const done = progress.done[n.index];
  const open = isUnlocked(n.index, progress);
  const cap = all ? Infinity : n.kind === 'lesson' ? 8 : 6;
  return (
    <Sheet open={!!node} onOpenChange={(o) => !o && onClose()} label={nodeLabel(n)}>
      <div style={{ ['--hue' as string]: n.unit.hue }}>
        <div className="hint" style={{ marginTop: 0 }}>
          {n.unit.icon} {n.unit.title}
        </div>
        <div className="sheet-title">
          {n.kind === 'checkpoint' ? (n.last ? 'מבחן סיום הרצאה' : 'מבחן ביניים') : n.kind === 'intro' ? `מבוא: ${n.unit.title}` : nodeLabel(n)}
        </div>
        <p className="hint" style={{ marginBottom: 14 }}>
          {n.kind === 'intro'
            ? `${n.unit.concepts?.length ?? 0} כרטיסי הסבר קצרים ו־${n.unit.quiz?.length ?? 0} שאלות על הכללים. כדאי להתחיל כאן — אחר כך כל מילה תתפרק לבד.`
            : n.kind === 'lesson'
            ? done
              ? 'כבר למדתם את השלב הזה. אפשר לעבור עליו שוב — זה רק יחזק את הזיכרון.'
              : n.facts.length
                ? 'לומדים את החומר מהשקפים, ואז מתרגלים: שאלות בחירה, נכון/לא נכון והשלמה.'
                : 'לומדים את המילים, ואז מתרגלים: זיהוי, הרכבה מחלקים והתאמה.'
            : `${itemsLabel(n)} ${n.last ? 'מכל ההרצאה' : 'מהשלבים שלפניו'}. עוברים ב־${PASS_SCORE * 100}%.${best ? ` השיא שלכם: ${Math.round(best * 100)}%.` : ''}`}
        </p>
        {n.unit.intro && (n.kind === 'intro' || (n.kind === 'lesson' && n.n === 1 && !n.unit.concepts?.length)) && <p className="explain" style={{ marginBottom: 14 }}><Rich>{n.unit.intro}</Rich></p>}
        <div className="list" style={{ marginBottom: 16 }} hidden={!nodeSize(n) || n.kind === 'checkpoint'}>
          {n.terms.slice(0, cap).map((t) => (
            <div className="row" key={t.id}>
              <div className="row-main">
                <div className="row-title">
                  <Segmented term={t} />
                </div>
                <div className="row-sub"><Rich>{t.he}</Rich></div>
              </div>
            </div>
          ))}
          {n.facts.slice(0, Math.max(0, cap - n.terms.length)).map((f) => (
            <div className="row" key={f.id}>
              <div className="row-main">
                <div className="row-title"><Rich>{f.q}</Rich></div>
                <div className="row-sub"><Rich>{f.a}</Rich></div>
              </div>
            </div>
          ))}
          {nodeSize(n) > cap && (
            <button className="row row-more" onClick={() => setAll(true)}>
              הצגת כל {nodeSize(n)} {n.facts.length ? 'הפריטים' : 'המילים'}
              <IconChevron className="chev down" width={16} height={16} />
            </button>
          )}
        </div>
        {open || done ? (
          <button className="btn btn-primary press" onClick={() => onStart(n)}>
            {done ? (n.kind === 'intro' ? 'לעבור שוב על המבוא' : 'לתרגל שוב') : n.kind === 'checkpoint' ? 'התחלת מבחן' : n.kind === 'intro' ? 'התחלת המבוא' : 'התחלת שלב'}
          </button>
        ) : n.kind === 'checkpoint' ? (
          <>
            <button className="btn btn-primary press" onClick={() => onStart(n, true)}>
              קפיצה לכאן
            </button>
            <p className="hint" style={{ textAlign: 'center' }}>
              כבר מכירים את החומר? עברו את מבחן הקפיצה וכל השלבים עד כאן ייפתחו.
            </p>
          </>
        ) : (
          <>
            <button className="btn btn-secondary press" onClick={() => onStart(n)}>
              ללמוד בכל זאת
            </button>
            <p className="hint" style={{ textAlign: 'center' }}>
              השלב עוד לא נפתח במסלול, אבל שום דבר לא חסום — אפשר ללמוד אותו כבר עכשיו.
            </p>
          </>
        )}
      </div>
    </Sheet>
  );
}
