import { useDeferredValue, useMemo, useState } from 'react';
import { courseById, liveCourses as courses, facts, lectureById, lectures, partByKey, parts, terms, termsWithPart, type FactInfo, type PartInfo, type TermInfo } from '../content';
import { strength } from '../lib/srs';
import { getState, useStore } from '../lib/store';
import { activeCourse } from '../lib/path';
import { IconChevron, IconClose, IconSearch } from '../components/Icons';
import { Dots, Legend, PartChip, PartsTable, Screen, Segmented, Sheet, SpeakButton, T, typeName, Rich } from '../components/ui';

type Mode = 'terms' | 'parts' | 'facts';

const norm = (s: string) => s.toLowerCase().replace(/[.\-\s/]/g, '');

const MODES: [Mode, string][] = (
  [
    ['terms', 'מונחים', terms.length],
    ['parts', 'חלקי מילים', parts.length],
    ['facts', 'שאלות', facts.length],
  ] as const
)
  .filter(([, , n]) => n > 0)
  .map(([m, l]) => [m, l]);

const countLabel = [
  terms.length && `${terms.length} מונחים`,
  parts.length && `${parts.length} חלקי מילים`,
  facts.length && `${facts.length} שאלות מהשקפים`,
]
  .filter(Boolean)
  .join(' · ');

export function DictionaryScreen() {
  const [q, setQ] = useState('');
  const query = useDeferredValue(q);
  const [pickMode, setMode] = useState<Mode>('terms');
  const mode = MODES.some(([m]) => m === pickMode) ? pickMode : (MODES[0]?.[0] ?? 'terms');
  // starts on the subject chosen on the path (with one subject, that one); "הכול" stays one tap away
  const [course, setCourse] = useState<string | null>(() => activeCourse(getState()).id);
  const [lecture, setLecture] = useState<string | null>(null);
  const [term, setTerm] = useState<TermInfo | null>(null);
  const [part, setPart] = useState<PartInfo | null>(null);
  const cards = useStore((s) => s.cards);
  const c = course ? courseById.get(course) : undefined;

  const list = useMemo(() => {
    const n = norm(query);
    const qt = query.trim();
    const lecs = lecture ? lectures.filter((l) => l.id === lecture) : c ? c.lectures : null;
    const scope = lecs && new Set(lecs.flatMap((l) => [...l.termList, ...l.partList, ...l.factList].map((x) => x.id)));
    const inScope = (id: string) => !scope || scope.has(id);
    if (mode === 'terms')
      return terms.filter((t) => inScope(t.id) && (!n || norm(t.word).includes(n) || t.he.includes(qt) || t.meaning.includes(qt) || norm(t.en).includes(n)));
    if (mode === 'facts') return facts.filter((f) => inScope(f.id) && (!qt || f.q.includes(qt) || f.a.toLowerCase().includes(qt.toLowerCase())));
    return parts.filter(
      (p) => inScope(p.id) && (!n || p.forms.some((f) => f.includes(n)) || p.he.includes(qt) || norm(p.en).includes(n)),
    );
  }, [query, mode, lecture, c]);

  const idx = Math.max(0, MODES.findIndex(([m]) => m === mode));
  const filtered = lecture || (courses.length > 1 && course);

  return (
    <Screen title="מילון" subtitle={countLabel}>
      <div className="search">
        <IconSearch />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="חיפוש באנגלית או בעברית"
          dir="rtl"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
          aria-label="חיפוש"
        />
        {q && (
          <button className="clear press" onClick={() => setQ('')} aria-label="ניקוי החיפוש">
            <IconClose />
          </button>
        )}
      </div>
      {MODES.length > 1 && (
        <div className="segmented" role="tablist">
          <span
            className="thumb"
            style={{ width: `calc(${100 / MODES.length}% - ${4 / MODES.length}px)`, insetInlineStart: 2, transform: `translateX(calc(-100% * ${idx}))` }}
          />
          {MODES.map(([m, l]) => (
            <button key={m} role="tab" aria-selected={mode === m} onClick={() => setMode(m)}>
              {l}
            </button>
          ))}
        </div>
      )}
      {courses.length > 1 && (
        <div className="hscroll" role="toolbar" aria-label="סינון לפי קורס">
          <button
            className="filter press"
            aria-pressed={!course}
            onClick={() => {
              setCourse(null);
              setLecture(null);
            }}
          >
            כל הקורסים
          </button>
          {courses.map((x) => (
            <button
              key={x.id}
              className="filter press"
              aria-pressed={course === x.id}
              onClick={() => {
                setCourse(course === x.id ? null : x.id);
                setLecture(null);
              }}
            >
              {x.icon} {x.title}
            </button>
          ))}
        </div>
      )}
      {c && c.lectures.length > 1 && (
        <div className="hscroll" role="toolbar" aria-label="סינון לפי הרצאה">
          <button className="filter press" aria-pressed={!lecture} onClick={() => setLecture(null)}>
            כל ההרצאות
          </button>
          {c.lectures.map((l) => (
            <button key={l.id} className="filter press" aria-pressed={lecture === l.id} onClick={() => setLecture(lecture === l.id ? null : l.id)}>
              {l.icon} הרצאה {l.n}
            </button>
          ))}
        </div>
      )}

      {list.length === 0 ? (
        <div className="empty">
          <IconSearch width={44} height={44} style={{ color: 'var(--label-3)' }} />
          <div style={{ fontSize: 'var(--fs-headline)', fontWeight: 600, color: 'var(--label)', margin: '8px 0 4px' }}>
            אין תוצאות ל־"<bdi>{q}</bdi>"
          </div>
          {filtered && (
            <button
              className="btn btn-sm btn-secondary press"
              style={{ marginTop: 8 }}
              onClick={() => {
                setLecture(null);
                if (courses.length > 1) setCourse(null);
              }}
            >
              חיפוש בכל החומר
            </button>
          )}
        </div>
      ) : (
        <div className="list">
          {mode === 'terms'
            ? (list as TermInfo[]).slice(0, 400).map((t) => (
                <button className="row" key={t.id} onClick={() => setTerm(t)}>
                  <div className="row-main">
                    <div className="dict-term">
                      <Segmented term={t} />
                    </div>
                    <div className="row-sub"><Rich>{t.he}</Rich></div>
                  </div>
                  <span className="row-trail">
                    {cards[t.id] && <Dots value={strength(cards[t.id])} />}
                    <IconChevron className="chev flip" />
                  </span>
                </button>
              ))
            : mode === 'facts'
              ? (list as FactInfo[]).map((f) => (
                  <div className="row" key={f.id} style={{ alignItems: 'flex-start' }}>
                    <div className="row-main">
                      <div className="row-sub" style={{ marginTop: 0 }}>
                        <Rich>{f.q}</Rich>
                      </div>
                      <div className="row-title">
                        <Rich>{f.a}</Rich>
                      </div>
                    </div>
                    <span className="row-trail">
                      {cards[f.id] && <Dots value={strength(cards[f.id])} />}
                      {f.slide && <span>שקף <bdi className="num">{f.slide}</bdi>{f.deck && <> · <bdi>{f.deck}</bdi></>}</span>}
                    </span>
                  </div>
                ))
              : (list as PartInfo[]).map((p) => (
                <button className="row" key={p.key} onClick={() => setPart(p)}>
                  <PartChip part={p} />
                  <div className="row-main">
                    <div className="row-title"><Rich>{p.he}</Rich></div>
                    <div className="row-sub">
                      {typeName[p.type]} · <T>{p.en}</T>
                    </div>
                  </div>
                  <span className="row-trail">
                    <span className="num">{termsWithPart(p.key).length}</span>
                    <IconChevron className="chev flip" />
                  </span>
                </button>
              ))}
        </div>
      )}
      {mode === 'terms' && list.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <Legend />
        </div>
      )}

      <TermSheet
        term={term}
        onClose={() => setTerm(null)}
        onPart={(p) => {
          setTerm(null);
          setTimeout(() => setPart(p), 280);
        }}
      />
      <PartSheet
        part={part}
        onClose={() => setPart(null)}
        onTerm={(t) => {
          setPart(null);
          setTimeout(() => setTerm(t), 280);
        }}
      />
    </Screen>
  );
}

/** Keeps content mounted while the sheet animates out. */
function useSticky<T>(v: T | null): T | null {
  const [last, setLast] = useState(v);
  if (v && v !== last) setLast(v);
  return v ?? last;
}

export function TermSheet({ term, onClose, onPart }: { term: TermInfo | null; onClose: () => void; onPart: (p: PartInfo) => void }) {
  const t = useSticky(term);
  const card = useStore((s) => (t ? s.cards[t.id] : undefined));
  const stats = useStore((s) => (t ? s.stats[t.id] : undefined));
  if (!t) return null;
  const l = lectureById.get(t.lectureId);
  const c = courseById.get(t.courseId);
  return (
    <Sheet open={!!term} onOpenChange={(o) => !o && onClose()} label={t.word}>
      <div className="hint" style={{ marginTop: 0 }}>
        {c?.icon} {c?.title}
        {l && ` · הרצאה ${l.n}`}
      </div>
      <div className="term-line" style={{ margin: '4px 0 6px' }}>
        <div className="ex-term">
          <Segmented term={t} />
        </div>
        <SpeakButton word={t.word} />
      </div>
      <div className="teach-meaning" style={{ marginTop: 0 }}>
        <Rich>{t.he}</Rich>
      </div>
      <div className="teach-en">
        <T>{t.en}</T>
      </div>
      {t.latin && (
        <div className="teach-en">
          <T>
            <i>{t.latin}</i>
          </T>
        </div>
      )}
      {t.parts && t.parts.length > 0 && (
        <div className="card" style={{ padding: '0 14px 14px', marginTop: 12 }}>
          <PartsTable term={t} />
        </div>
      )}
      {t.explain && (
        <p className="explain" style={{ marginTop: 12 }}>
          💡 <Rich>{t.explain}</Rich>
        </p>
      )}
      {t.partKeys.some((k) => termsWithPart(k).length > 1) && (
        <>
          <div className="section-header" style={{ paddingInline: 4 }}>
            משפחות מילים
          </div>
          <div className="list">
            {[...new Set(t.partKeys)].map((k) => {
              const p = partByKey.get(k);
              if (!p || termsWithPart(k).length < 2) return null;
              return (
                <button className="row" key={k} onClick={() => onPart(p)}>
                  <PartChip part={p} />
                  <div className="row-main">
                    <div className="row-sub" style={{ marginTop: 0 }}>
                      עוד <span className="num">{termsWithPart(k).length - 1}</span> מילים עם <Rich>{p.he}</Rich>
                    </div>
                  </div>
                  <IconChevron className="chev flip" />
                </button>
              );
            })}
          </div>
        </>
      )}
      <div className="section-header" style={{ paddingInline: 4 }}>
        ההתקדמות שלי
      </div>
      <div className="list">
        <div className="row">
          <div className="row-main">חוזק בזיכרון</div>
          <span className="row-trail">{card ? <Dots value={strength(card)} /> : 'עוד לא נלמד'}</span>
        </div>
        {card && (
          <div className="row">
            <div className="row-main">חזרה הבאה</div>
            <span className="row-trail">{formatDue(card.due)}</span>
          </div>
        )}
        {stats && (
          <div className="row">
            <div className="row-main">תשובות נכונות</div>
            <span className="row-trail num">
              {stats.correct}/{stats.seen}
            </span>
          </div>
        )}
      </div>
    </Sheet>
  );
}

export function PartSheet({ part, onClose, onTerm }: { part: PartInfo | null; onClose: () => void; onTerm: (t: TermInfo) => void }) {
  const p = useSticky(part);
  if (!p) return null;
  const fam = termsWithPart(p.key);
  return (
    <Sheet open={!!part} onOpenChange={(o) => !o && onClose()} label={p.label}>
      <div style={{ textAlign: 'center', paddingTop: 6 }}>
        <div style={{ fontSize: '2rem' }}>
          <PartChip part={p} />
        </div>
        <div className="teach-meaning"><Rich>{p.he}</Rich></div>
        <div className="teach-en" style={{ textAlign: 'center' }}>
          {typeName[p.type]} · <T>{p.en}</T>
        </div>
      </div>
      {p.note && (
        <p className="explain" style={{ marginTop: 12 }}>
          💡 <Rich>{p.note}</Rich>
        </p>
      )}
      <div className="section-header" style={{ paddingInline: 4 }}>
        {fam.length} מילים עם החלק הזה
      </div>
      <div className="list">
        {fam.map((t) => (
          <button className="row" key={t.id} onClick={() => onTerm(t)}>
            <div className="row-main">
              <div className="dict-term">
                <Segmented term={t} />
              </div>
              <div className="row-sub"><Rich>{t.he}</Rich></div>
            </div>
            <IconChevron className="chev flip" />
          </button>
        ))}
      </div>
    </Sheet>
  );
}

function formatDue(ms: number) {
  const days = Math.round((ms - Date.now()) / 864e5);
  if (days <= 0) return 'היום';
  if (days === 1) return 'מחר';
  if (days < 30) return `בעוד ${days} ימים`;
  return `בעוד ${Math.round(days / 30)} חודשים`;
}
