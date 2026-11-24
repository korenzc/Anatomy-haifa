import { useMemo, useState } from 'react';
import { liveCourses as courses, parts as allParts, type CourseInfo, type LectureInfo } from '../content';
import {
  dueCount,
  examSession,
  lectureLearnSession,
  lecturePartsSession,
  lecturePracticeSession,
  lectureTestMin,
  lectureTestSession,
  mistakesPool,
  mistakesSession,
  partsSession,
  practiceSession,
  type Session,
} from '../lib/session';
import { strength } from '../lib/srs';
import { activeCourse, lessonSizeFor } from '../lib/path';
import { getState, useStore, type PersistedState } from '../lib/store';
import { IconBrain, IconCards, IconChevron, IconPuzzle, IconShuffle, IconTarget } from '../components/Icons';
import { flashConfig, lectureCards, lectureDecks, loadMissed, type FlashConfig, type FlashDeck, type FlashDir } from '../lib/flash';
import { Bar, Rich, Screen, SendMaterial, Sheet, ToggleRow } from '../components/ui';

const items = (l: LectureInfo) => [...l.termList, ...l.factList];

/** Mastery 0..1: how strongly each item is remembered, not just how many were seen. */
function mastery(s: PersistedState, ids: string[]) {
  return ids.length ? ids.reduce((n, id) => n + strength(s.cards[id]), 0) / (ids.length * 5) : 0;
}

export function PracticeScreen({
  start,
  startFlash,
  toast,
}: {
  start: (s: Session) => void;
  startFlash: (c: FlashConfig) => void;
  toast: (m: string) => void;
}) {
  const state = useStore((s) => s);
  const due = dueCount(state);
  const mistakes = useMemo(() => mistakesPool(state).length, [state]);
  const learned = Object.keys(state.cards).filter((k) => !k.startsWith('p:')).length;
  const partsKnown = Object.keys(state.cards).filter((k) => k.startsWith('p:')).length;
  const [lecture, setLecture] = useState<LectureInfo | null>(null);
  const [flashLecture, setFlashLecture] = useState<LectureInfo | null>(null);
  const many = courses.length > 1;
  // the subject chosen on the path comes first, so subjects don't blur together
  const active = activeCourse(state);
  const ordered = [...courses].sort((a, b) => Number(b.id === active.id) - Number(a.id === active.id));

  const go = (s: Session | null, empty: string) => (s ? start(s) : toast(empty));

  return (
    <Screen title="תרגול" subtitle="תרגול חופשי — לא תלוי במסלול ואף פעם לא נחסם.">
      <button
        className="continue-card press"
        style={{ ['--hue' as string]: 265 }}
        onClick={() => go(practiceSession(getState()), 'עוד אין מה לתרגל — התחילו שלב במסלול או למדו משהו חדש מהמצגות.')}
      >
        <div>
          <div className="k">מותאם אישית · חזרה מרווחת{many ? ' · מכל הקורסים' : ''}</div>
          <div className="t">תרגול חכם</div>
          <div className="k">{due > 0 ? `${due} פריטים מחכים לחזרה` : learned ? 'הכול מעודכן — חיזוק החלשים' : 'ממתין לחומר הראשון'}</div>
        </div>
        <span className="go">
          <IconBrain />
        </span>
      </button>

      {ordered.map((c) => (
        <CourseSection key={c.id} course={c} many={many} state={state} onLecture={setLecture} onFlash={setFlashLecture} go={go} />
      ))}

      <div className="section-header">תרגולים ממוקדים</div>
      <div className="list">
        <button className="row with-icon" onClick={() => go(mistakesSession(getState()), 'אין טעויות לחזור עליהן 👏')}>
          <span className="row-icon" style={{ background: 'var(--red)' }}>
            <IconTarget width={18} />
          </span>
          <div className="row-main">
            <div className="row-title">חזרה על טעויות</div>
            <div className="row-sub">מה שטעיתם בו, החלש קודם</div>
          </div>
          <span className="row-trail">
            <span className="num">{mistakes}</span>
            <IconChevron className="chev flip" />
          </span>
        </button>
        {allParts.length > 0 && (
          <button className="row with-icon" onClick={() => go(partsSession(getState()), 'צריך להכיר לפחות 4 חלקי מילים — למדו עוד שלב.')}>
            <span className="row-icon" style={{ background: 'var(--purple)' }}>
              <IconPuzzle width={18} />
            </span>
            <div className="row-main">
              <div className="row-title">קידומות, שורשים וסיומות</div>
              <div className="row-sub">הלבנים שמהן בנויות כל המילים</div>
            </div>
            <span className="row-trail">
              <span className="num">{partsKnown}</span>
              <IconChevron className="chev flip" />
            </span>
          </button>
        )}
        <button className="row with-icon" onClick={() => go(examSession(getState()), 'מבחן מעורב נפתח אחרי 8 פריטים שלמדתם.')}>
          <span className="row-icon" style={{ background: 'var(--orange)' }}>
            <IconShuffle width={18} />
          </span>
          <div className="row-main">
            <div className="row-title">מבחן מעורב</div>
            <div className="row-sub">20 שאלות מכל מה שלמדתם{many ? ', מכל הקורסים' : ''}, בלי משוב עד הסוף</div>
          </div>
          <span className="row-trail">
            <IconChevron className="chev flip" />
          </span>
        </button>
      </div>

      <div className="section-header">חומר לכולם</div>
      <SendMaterial />
      <p className="section-footer">כל הרצאה שעולה נבנית רק מהשקפים שלה, ונפתחת לכל הסטודנטים.</p>

      <LectureSheet
        lecture={lecture}
        onClose={() => setLecture(null)}
        start={start}
        toast={toast}
        onFlash={(l) => {
          setLecture(null);
          setTimeout(() => setFlashLecture(l), 280);
        }}
      />
      <FlashSheet
        lecture={flashLecture}
        onClose={() => setFlashLecture(null)}
        onStart={(c) => {
          setFlashLecture(null);
          startFlash(c);
        }}
      />
    </Screen>
  );
}

/** One course: its lectures (progress = mastery), flashcards, and — with several courses — its own practice. */
function CourseSection({
  course: c,
  many,
  state,
  onLecture,
  onFlash,
  go,
}: {
  course: CourseInfo;
  many: boolean;
  state: PersistedState;
  onLecture: (l: LectureInfo) => void;
  onFlash: (l: LectureInfo) => void;
  go: (s: Session | null, empty: string) => void;
}) {
  const color = `oklch(0.62 0.17 ${c.hue})`;
  const due = many ? dueCount(state, c.id) : 0;
  return (
    <section aria-label={c.title}>
      <div className="section-header">
        {c.icon} {c.title}
      </div>
      <div className="list">
        {many && (
          <button className="row with-icon" onClick={() => go(practiceSession(getState(), 12, c.id), 'עוד לא למדתם כלום בקורס הזה.')}>
            <span className="row-icon" style={{ background: color }} aria-hidden>
              <IconBrain width={18} />
            </span>
            <div className="row-main">
              <div className="row-title">תרגול חכם בקורס</div>
              <div className="row-sub">{due > 0 ? `${due} מחכים לחזרה` : 'חזרה מרווחת רק על הקורס הזה'}</div>
            </div>
            <IconChevron className="chev flip" />
          </button>
        )}
        {c.lectures.map((l) => {
          const xs = items(l);
          const seen = xs.filter((t) => state.cards[t.id]).length;
          return (
            <button className="row with-icon" key={l.id} onClick={() => onLecture(l)}>
              <span className="row-icon" style={{ background: color }} aria-hidden>
                {l.icon}
              </span>
              <div className="row-main">
                <div className="row-title">
                  הרצאה {l.n}: {l.title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
                  <div style={{ flex: 1 }}>
                    <Bar value={mastery(state, xs.map((x) => x.id))} color={color} />
                  </div>
                  <bdi dir="ltr" className="row-sub num" style={{ marginTop: 0 }}>
                    {seen}/{xs.length}
                  </bdi>
                </div>
              </div>
              <IconChevron className="chev flip" />
            </button>
          );
        })}
        {c.lectures.map((l) => {
          const n = lectureCards(l, 'all').length;
          return n ? (
            <button className="row with-icon" key={`flash-${l.id}`} onClick={() => onFlash(l)}>
              <span className="row-icon" style={{ background: 'var(--green)' }} aria-hidden>
                <IconCards width={18} />
              </span>
              <div className="row-main">
                <div className="row-title">כרטיסיות: הרצאה {l.n}</div>
                <div className="row-sub">
                  <span className="num">{n}</span> כרטיסיות · הופכים ובודקים את עצמכם
                </div>
              </div>
              <IconChevron className="chev flip" />
            </button>
          ) : null;
        })}
      </div>
      <p className="section-footer">רק מה שמופיע במצגות. הפס מראה שליטה: כמה חזק כל פריט זכור, לא רק כמה ראיתם.</p>
    </section>
  );
}

function LectureSheet({
  lecture,
  onClose,
  start,
  toast,
  onFlash,
}: {
  lecture: LectureInfo | null;
  onClose: () => void;
  start: (s: Session) => void;
  toast: (m: string) => void;
  onFlash: (l: LectureInfo) => void;
}) {
  const [last, setLast] = useState(lecture);
  if (lecture && lecture !== last) setLast(lecture);
  const l = lecture ?? last;
  const state = useStore((s) => s);
  if (!l) return null;
  const xs = items(l);
  const learned = xs.filter((t) => state.cards[t.id]).length;
  const min = lectureTestMin(l);
  const run = (s: Session | null, msg: string) => {
    onClose();
    if (s) start(s);
    else toast(msg);
  };
  return (
    <Sheet open={!!lecture} onOpenChange={(o) => !o && onClose()} label={l.title}>
      <div className="sheet-title">{l.title}</div>
      <p className="hint" style={{ marginTop: 0, marginBottom: 12 }}>
        <Rich>{l.source}</Rich>
        {l.termList.length > 0 && (
          <>
            {' '}
            · <span className="num">{l.termList.length}</span> מונחים
          </>
        )}
        {l.partList.length > 0 && (
          <>
            {' '}
            · <span className="num">{l.partList.length}</span> חלקי מילים
          </>
        )}
        {l.factList.length > 0 && (
          <>
            {' '}
            · <span className="num">{l.factList.length}</span> שאלות מהשקפים
          </>
        )}
        {' '}
        · למדתם <bdi dir="ltr" className="num">{learned}/{xs.length}</bdi>
      </p>
      <div style={{ display: 'grid', gap: 8 }}>
        <button className="btn btn-primary press" onClick={() => run(lectureLearnSession(l, getState()), 'למדתם את כל החומר מהמצגת 🎉')}>
          {learned < xs.length ? `ללמוד ${Math.min(lessonSizeFor(xs.length), xs.length - learned)} חדשים מהמצגת` : 'כל החומר נלמד ✓'}
        </button>
        <button className="btn btn-secondary press" onClick={() => onFlash(l)}>
          כרטיסיות
        </button>
        {l.partList.length >= 4 && (
          <button className="btn btn-secondary press" onClick={() => run(lecturePartsSession(l, getState()), 'אין מספיק חלקי מילים במצגת הזו.')}>
            קידומות, שורשים וסיומות מהמצגת
          </button>
        )}
        <button className="btn btn-secondary press" onClick={() => run(lecturePracticeSession(l, getState()), 'עוד לא למדתם כלום מהמצגת.')}>
          לתרגל את מה שלמדתי
        </button>
        <button className="btn btn-secondary press" onClick={() => run(lectureTestSession(l, getState()), `המבחן נפתח אחרי ${min} פריטים מהמצגת.`)}>
          מבחן על המצגת
        </button>
      </div>
      {l.factList.length > 0 && (
        <>
          <div className="section-header" style={{ paddingInline: 4 }}>
            סיכום המצגת
          </div>
          <div className="list">
            {l.factList.map((f) => (
              <div className="row" key={f.id} style={{ alignItems: 'flex-start' }}>
                <div className="row-main">
                  <div className="row-sub" style={{ marginTop: 0 }}>
                    <Rich>{f.q}</Rich>
                  </div>
                  <div className="row-title" style={{ fontSize: 'var(--fs-subhead)' }}>
                    <Rich>{f.a}</Rich>
                  </div>
                </div>
                {f.slide && (
                  <span style={{ color: 'var(--label-2)', fontSize: 'var(--fs-footnote)' }}>
                    שקף <bdi className="num">{f.slide}</bdi>
                    {f.deck && <> · <bdi>{f.deck}</bdi></>}
                  </span>
                )}
              </div>
            ))}
          </div>
        </>
      )}
      {l.corrections && l.corrections.length > 0 && (
        <>
          <div className="section-header" style={{ paddingInline: 4 }}>
            שימו לב: תיקונים למצגת
          </div>
          <div className="list">
            {l.corrections.map((c, i) => (
              <div className="row" key={i} style={{ alignItems: 'flex-start' }}>
                <span className="num" style={{ color: 'var(--label-2)', minWidth: 56, fontSize: 'var(--fs-footnote)' }}>
                  שקופית {c.slide}
                </span>
                <div className="row-main">
                  <div className="row-sub" style={{ marginTop: 0, textDecoration: 'line-through' }}>
                    <Rich>{c.says}</Rich>
                  </div>
                  <div className="row-title" style={{ fontSize: 'var(--fs-subhead)' }}>
                    <Rich>{c.correct}</Rich>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="section-footer">כך תענו נכון במבחן — האפליקציה מלמדת את הגרסה המדויקת.</p>
        </>
      )}
    </Sheet>
  );
}

/** A two- or three-way choice styled as an iOS segmented control. */
function Choice<V extends string>({ value, options, onChange, label }: { value: V; options: [V, string][]; onChange: (v: V) => void; label: string }) {
  const idx = Math.max(0, options.findIndex(([v]) => v === value));
  const n = options.length;
  return (
    <div className="segmented" role="radiogroup" aria-label={label}>
      <span
        className="thumb"
        aria-hidden
        style={{ width: `calc(${100 / n}% - ${4 / n}px)`, insetInlineStart: 2, transform: `translateX(calc(-100% * ${idx}))` }}
      />
      {options.map(([v, l]) => (
        <button key={v} role="radio" aria-checked={value === v} onClick={() => onChange(v)}>
          {l}
        </button>
      ))}
    </div>
  );
}

const DECK_NAME: Record<FlashDeck, string> = { terms: 'מונחים', parts: 'חלקי מילים', facts: 'שאלות', all: 'הכול' };

function FlashSheet({ lecture, onClose, onStart }: { lecture: LectureInfo | null; onClose: () => void; onStart: (c: FlashConfig) => void }) {
  const [last, setLast] = useState(lecture);
  if (lecture && lecture !== last) setLast(lecture);
  const l = lecture ?? last;
  const [pick, setDeck] = useState<FlashDeck>('terms');
  const [dir, setDir] = useState<FlashDir>('en-he');
  const [onlyMissed, setOnlyMissed] = useState(false);
  if (!l) return null;
  const decks = lectureDecks(l);
  const deck = decks.includes(pick) ? pick : decks[0];
  const all = lectureCards(l, deck);
  const missedSet = loadMissed(l.id);
  const missed = all.filter((c) => missedSet.has(c.id)).length;
  const useMissed = onlyMissed && missed > 0;
  const count = useMissed ? missed : all.length;
  return (
    <Sheet open={!!lecture} onOpenChange={(o) => !o && onClose()} label="כרטיסיות">
      <div className="sheet-title">כרטיסיות</div>
      <p className="hint" style={{ marginTop: 0, marginBottom: 14 }}>
        <Rich>{l.title}</Rich>. הקישו כדי להפוך, וסמנו אם ידעתם. מה שלא ידעתם חוזר בסוף הסבב. הכרטיסיות לא משנות את ההתקדמות במסלול.
      </p>
      {decks.length > 1 && (
        <>
          <div className="section-header" style={{ paddingInline: 4, marginTop: 0 }}>
            מה לתרגל
          </div>
          <Choice label="מה לתרגל" value={deck} onChange={setDeck} options={decks.map((d) => [d, DECK_NAME[d]])} />
        </>
      )}
      <div className="section-header" style={{ paddingInline: 4, marginTop: 4 }}>
        בצד הקדמי
      </div>
      <Choice
        label="בצד הקדמי"
        value={dir}
        onChange={setDir}
        options={
          deck === 'facts'
            ? [
                ['en-he', 'שאלה'],
                ['he-en', 'תשובה'],
              ]
            : [
                ['en-he', 'אנגלית'],
                ['he-en', 'עברית'],
              ]
        }
      />
      {missed > 0 && (
        <div className="list" style={{ marginBottom: 14 }}>
          <ToggleRow checked={onlyMissed} onChange={setOnlyMissed} label={`רק מה שלא ידעתי (${missed})`} />
        </div>
      )}
      <button className="btn btn-primary press" style={{ marginTop: 6 }} onClick={() => onStart(flashConfig(l, deck, dir, useMissed))}>
        להתחיל · <span className="num">{count}</span> כרטיסיות
      </button>
    </Sheet>
  );
}
