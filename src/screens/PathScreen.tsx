import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useBack } from '../lib/back';
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
  const reduce = useReducedMotion();
  // the path tab is a grid of lecture tiles; a tile opens that lecture's own path (kept across tab switches)
  const sections = SECTIONS.filter((u) => u.courseId === course.id);
  const [lectureId, setLectureIdRaw] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem('path-lecture');
    } catch {
      return null;
    }
  });
  const setLectureId = (id: string | null) => {
    setLectureIdRaw(id);
    try {
      if (id) sessionStorage.setItem('path-lecture', id);
      else sessionStorage.removeItem('path-lecture');
    } catch {
      /* ignore */
    }
  };
  const section = sections.find((u) => u.id === lectureId) ?? null;
  const gridScroll = useRef(0);
  const openLecture = (id: string) => {
    gridScroll.current = document.querySelector('.scroller')?.scrollTop ?? 0;
    setLectureId(id);
    requestAnimationFrame(() => document.querySelector('.scroller')?.scrollTo({ top: 0 }));
  };
  const closeLecture = () => {
    setLectureId(null);
    requestAnimationFrame(() => document.querySelector('.scroller')?.scrollTo({ top: gridScroll.current }));
  };
  useBack(section !== null, () => (closeLecture(), false));
  const currentRef = useRef<HTMLButtonElement>(null);
  const streak = streakOf(state.days);
  const todayXp = state.days[todayKey()] ?? 0;

  // Bring the current node into view on open — only when it's below the fold.
  useEffect(() => {
    const el = currentRef.current;
    if (el && el.getBoundingClientRect().bottom > window.innerHeight - 90) el.scrollIntoView({ block: 'center' });
  }, [course.id, section?.id]);

  const cur = path[progress.current];
  const news = useMemo(() => recentNews(), []);
  const featureNews = useMemo(() => recentFeatures(), []);
  const openNews = (n: NewsItem) => {
    updateSettings({ course: n.course.id });
    openLecture(`lecture-${n.lecture.id}`);
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
      {!section && liveCourses.length > 1 && (
        <nav className="subjects" aria-label="מקצועות">
          {liveCourses.map((c) => (
            <button
              key={c.id}
              className="subject press"
              style={{ ['--hue' as string]: c.hue }}
              aria-pressed={c.id === course.id}
              onClick={() => {
                updateSettings({ course: c.id });
                setLectureId(null);
              }}
            >
              <span aria-hidden>{c.icon}</span>
              {c.title}
              {news.some((n) => n.course.id === c.id) && <span className="subject-dot" aria-label="יש חדש" />}
            </button>
          ))}
        </nav>
      )}

      {!section && (
        <>
      <WhatsNew items={news} onOpen={openNews} showCourse={liveCourses.length > 1} features={featureNews} onOpenFeature={(f) => openTab?.(f.feature.tab)} />
      <TipsCorner />
        </>
      )}

      {section ? null : cur ? (
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

      {section ? (
        <motion.div
          key={section.id}
          initial={reduce ? { opacity: 0 } : { opacity: 0, transform: 'translateY(8px)' }}
          animate={{ opacity: 1, transform: 'translateY(0px)' }}
          transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
        >
          <button className="lecture-back press" onClick={closeLecture}>
            <IconChevron width={18} height={18} strokeWidth={2.6} />
            כל ההרצאות ב{course.title}
          </button>
          <LecturePath u={section} path={path} progress={progress} state={state} currentRef={currentRef} onNode={setOpenNode} />
        </motion.div>
      ) : (
        sections.length > 0 && (
          <section aria-label={course.title}>
            <h2 className="path-group">
              {course.icon} {course.title}
            </h2>
            <div className="lecture-grid">
              {sections.map((u) => {
                const items = [...u.terms, ...u.facts];
                const learned = items.filter((t) => state.cards[t.id]).length;
                const nodes = path.filter((n) => n.unit.id === u.id);
                const finished = nodes.length > 0 && nodes.every((n) => progress.done[n.index]);
                const isCur = cur?.unit.id === u.id;
                return (
                  <button
                    key={u.id}
                    className="lecture-tile press"
                    style={{ ['--hue' as string]: u.hue }}
                    onClick={() => openLecture(u.id)}
                    aria-label={`הרצאה ${u.lecture}: ${u.title}${finished ? ', הושלמה' : ''}`}
                  >
                    <span className="lecture-tile-top">
                      <span className="unit-glyph" aria-hidden>
                        {u.icon}
                      </span>
                      {finished ? (
                        <span className="lecture-tile-badge done" aria-hidden>
                          <IconCheck width={12} height={12} strokeWidth={3} />
                        </span>
                      ) : isCur ? (
                        <span className="lecture-tile-badge">עכשיו</span>
                      ) : null}
                    </span>
                    <span className="unit-kicker">הרצאה {u.lecture}</span>
                    <span className="lecture-tile-title">{u.title}</span>
                    <span className="lecture-tile-bar" aria-hidden>
                      <span style={{ transform: `scaleX(${items.length ? learned / items.length : 0})` }} />
                    </span>
                    <bdi dir="ltr" className="lecture-tile-count num">
                      {learned}/{items.length}
                    </bdi>
                  </button>
                );
              })}
            </div>
          </section>
        )
      )}

      <NodeSheet node={openNode} onClose={() => setOpenNode(null)} onStart={launch} progress={progress} />
    </Screen>
  );
}

/** One lecture's winding path: its header and nodes. */
function LecturePath({
  u,
  path,
  progress,
  state,
  currentRef,
  onNode,
}: {
  u: (typeof SECTIONS)[number];
  path: PathNode[];
  progress: ReturnType<typeof pathProgress>;
  state: ReturnType<typeof getState>;
  currentRef: React.RefObject<HTMLButtonElement | null>;
  onNode: (n: PathNode) => void;
}) {
  const nodes = path.filter((n) => n.unit.id === u.id);
  const items = [...u.terms, ...u.facts];
  const learned = items.filter((t) => state.cards[t.id]).length;
  return (
    <section id={u.id} className="unit" style={{ ['--hue' as string]: u.hue }} aria-label={u.title}>
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
          <bdi dir="ltr" className="num">
            {learned}/{items.length}
          </bdi>
          <br />
          {u.facts.length ? 'פריטים' : 'מילים'}
        </div>
      </div>
      <div className="nodes">
        {nodes.map((n, w) => {
          const done = progress.done[n.index];
          const open = isUnlocked(n.index, progress);
          const isCur = n.index === progress.current;
          const dx = WIGGLE[w % WIGGLE.length];
          const cls = ['node', n.kind, done ? 'done' : open ? 'open' : 'locked', isCur ? 'current' : ''].join(' ');
          return (
            <button
              key={n.id}
              ref={isCur ? currentRef : undefined}
              className={cls}
              style={{ transform: `translateX(${dx}px)` }}
              onClick={() => onNode(n)}
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
