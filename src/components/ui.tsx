import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Drawer } from 'vaul';
import { formLabel, partAt, type PartInfo, type PartType, type TermInfo } from '../content';
import { canSpeak, speak } from '../lib/speech';
import { useBack } from '../lib/back';
import { useStore } from '../lib/store';
import { IconChevron, IconSend, IconSparkle, IconSpeaker, IconTip } from './Icons';
import { agoLabel, NEWS_DAYS, type FeatureNews, type NewsItem } from '../lib/news';
import { sendMaterialLink } from '../lib/share';
import { tipsNewestFirst, type Tip } from '../content/tips';
import { dayDiff, todayKey } from '../lib/text';

/** English term inside Hebrew UI: isolated LTR so "-itis" never becomes "itis-". */
export const T = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <bdi dir="ltr" lang="en" className={`term ${className}`}>
    {children}
  </bdi>
);

/**
 * Hebrew text that may contain English: every Latin run (words, abbreviations like b.i.d.,
 * parts like -itis, "38°C") is isolated as LTR so punctuation and parentheses stay put.
 */
const LATIN_CORE =
  /(?:[0-9][0-9.,]*°?\s?)?[A-Za-z\u00C0-\u024F][A-Za-z0-9\u00C0-\u024F\u0300-\u036F.\-/'’°%\u00B7]*(?:\s+[A-Za-z0-9\u00C0-\u024F][A-Za-z0-9\u00C0-\u024F\u0300-\u036F.\-/'’°%]*)*/g;
const HEBREW_LETTER = /[\u05D0-\u05EA]/;

type Piece = { text: string; latin: boolean };

/** Split mixed text into Hebrew and Latin pieces. */
function splitLatin(text: string): Piece[] {
  const out: Piece[] = [];
  let last = 0;
  for (const m of text.matchAll(LATIN_CORE)) {
    let start = m.index!;
    let run = m[0];
    // a hyphen glued to a Hebrew prefix letter ("ב-supine") stays Hebrew; a free one ("-itis") is part of the term
    if (text[start - 1] === '-' && !HEBREW_LETTER.test(text[start - 2] ?? '')) {
      start -= 1;
      run = '-' + run;
    }
    // a trailing period belongs to the sentence, unless the run is a dotted abbreviation (b.i.d., q.4.h.)
    while (/[.,]$/.test(run) && !/[.][^.\s]+\.$/.test(run) && !/^[A-Za-z][a-z]{0,3}\.$/.test(run)) run = run.slice(0, -1);
    // trailing hyphen + Hebrew ("DVT-ים") belongs to the Hebrew side
    if (run.endsWith('-') && HEBREW_LETTER.test(text[start + run.length] ?? '')) run = run.slice(0, -1);
    if (start > last) out.push({ text: text.slice(last, start), latin: false });
    out.push({ text: run, latin: true });
    last = start + run.length;
  }
  if (last < text.length) out.push({ text: text.slice(last), latin: false });
  return out;
}

export function Rich({ children }: { children: string | undefined | null }) {
  if (!children) return null;
  const pieces = splitLatin(children);
  if (pieces.length === 1 && !pieces[0].latin) return <>{children}</>;
  return (
    <>
      {pieces.map((p, i) =>
        p.latin ? (
          <bdi key={i} dir="ltr" lang="en">
            {p.text}
          </bdi>
        ) : (
          p.text
        ),
      )}
    </>
  );
}

export const Chip = ({ type, children }: { type: PartType; children: ReactNode }) => (
  <span className={`chip ${type}`} dir="ltr" lang="en">
    {children}
  </span>
);

export const PartChip = ({ part }: { part: PartInfo }) => <Chip type={part.type}>{part.label}</Chip>;

/** gastr·o·enter·itis, colour-coded by part type; <wbr> lets long terms wrap at the joints. */
export function Segmented({ term }: { term: TermInfo }) {
  if (!term.parts?.length) return <T>{term.word}</T>;
  return (
    <T>
      {term.parts.map((f, i) => (
        <span key={i}>
          {i > 0 && <wbr />}
          <span className={`seg ${partAt(term, i)?.type ?? 'root'}`}>{f}</span>
        </span>
      ))}
    </T>
  );
}

export function PartsTable({ term }: { term: TermInfo }) {
  if (!term.parts?.length) return null;
  return (
    <div className="parts-table">
      {term.parts.map((f, i) => {
        const p = partAt(term, i);
        if (!p) return null;
        return (
          <div className="pt" key={i}>
            <Chip type={p.type}>{formLabel(f, p.type)}</Chip>
            <span>
              <Rich>{p.he}</Rich> · <T className="muted">{p.en}</T>
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Plays only on tap: students often practise where sound isn't allowed. */
export function SpeakButton({ word }: { word: string }) {
  const enabled = useStore((s) => s.settings.speech);
  if (!canSpeak() || !enabled) return null;
  return (
    <button className="speak press" onClick={() => speak(word, true)} aria-label="השמע הגייה">
      <IconSpeaker />
    </button>
  );
}

export function Dots({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <span className="dots" aria-label={`חוזק ${value} מתוך ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <i key={i} className={i < value ? 'on' : ''} />
      ))}
    </span>
  );
}

export const Bar = ({ value, color }: { value: number; color?: string }) => (
  <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value * 100)}>
    <i style={{ transform: `scaleX(${Math.max(0, Math.min(1, value))})`, background: color }} />
  </div>
);

export function Sheet({
  open,
  onOpenChange,
  children,
  label,
  dismissible = true,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  children: ReactNode;
  label: string;
  /** false: only a button inside can close it (no swipe, overlay tap or Back) */
  dismissible?: boolean;
}) {
  useBack(open, () => {
    if (!dismissible) return true;
    onOpenChange(false);
    return false;
  });
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} dismissible={dismissible}>
      <Drawer.Portal>
        <Drawer.Overlay className="sheet-overlay" />
        <Drawer.Content className="sheet" aria-describedby={undefined} dir="rtl">
          <div className="sheet-grabber" />
          <Drawer.Title className="visually-hidden">{label}</Drawer.Title>
          <div className="sheet-body">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

/** iOS large title that collapses into the nav bar once scrolled past. */
export function Screen({ title, subtitle, trailing, brand, children }: { title: string; subtitle?: ReactNode; trailing?: ReactNode; brand?: boolean; children: ReactNode }) {
  const sentinel = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setScrolled(!e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <>
      <header className="navbar" data-scrolled={scrolled}>
        <div className="navbar-inner">
          <span className="navbar-title">{title}</span>
          {trailing && <div className="navbar-trailing">{trailing}</div>}
        </div>
      </header>
      <div className="screen">
        <h1 className="large-title">
          {title}
          {brand && <img className="brand-owl" src="/boar.png" alt="" width={33} height={44} />}
        </h1>
        <div ref={sentinel} style={{ height: 1, marginTop: -1 }} />
        {subtitle && <p className="subtitle">{subtitle}</p>}
        {children}
      </div>
    </>
  );
}

/** Settings row where the whole 48pt row flips the switch (HIG hit target). */
export function ToggleRow({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button className="row" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}>
      <div className="row-main">{label}</div>
      <span className="toggle" aria-checked={checked} aria-hidden />
    </button>
  );
}

export const typeName: Record<PartType, string> = { prefix: 'קידומת', root: 'שורש', suffix: 'סיומת' };

export const Legend = () => (
  <div className="legend" aria-hidden>
    <span>
      <i style={{ background: 'var(--prefix)' }} />
      קידומת
    </span>
    <span>
      <i style={{ background: 'var(--root)' }} />
      שורש
    </span>
    <span>
      <i style={{ background: 'var(--suffix)' }} />
      סיומת
    </span>
  </div>
);

/** "יש לכם חומר?" — opens WhatsApp to Koren with the message ready; the student attaches the file. */
export function SendMaterial({ course, compact = false }: { course?: string; compact?: boolean }) {
  return (
    <a className={`send-material press${compact ? ' compact' : ''}`} href={sendMaterialLink(course)} target="_blank" rel="noopener noreferrer">
      <span className="send-material-icon" aria-hidden>
        <IconSend width={20} height={20} />
      </span>
      <span className="row-main">
        <span className="send-material-t">{compact ? 'יש לכם את המצגות? שלחו לנו' : 'יש לכם חומר שחסר כאן?'}</span>
        {!compact && <span className="send-material-k">מצגת של הרצאה שעוד לא כאן? שלחו בוואטסאפ ונעלה אותה לכולם</span>}
      </span>
      <IconChevron className="chev flip" />
    </a>
  );
}

/** How many "מה חדש" rows the home screen shows; the rest sit behind "הכול". */
const NEWS_SHOWN = 2;

/** "מה חדש": big app features and lectures that went live or changed lately. Short on the home screen, full list in a sheet. */
export function WhatsNew({
  items,
  onOpen,
  showCourse,
  features = [],
  onOpenFeature,
}: {
  items: NewsItem[];
  onOpen: (n: NewsItem) => void;
  showCourse: boolean;
  features?: FeatureNews[];
  onOpenFeature?: (f: FeatureNews) => void;
}) {
  const [all, setAll] = useState(false);
  const rows = [
    ...features.map((f) => ({
      key: `f:${f.feature.id}`,
      hue: f.feature.hue,
      icon: f.feature.icon,
      tag: 'חדש באפליקציה',
      tagClass: 'feature',
      meta: agoLabel(f.ago),
      title: f.feature.title,
      note: f.feature.note,
      open: () => onOpenFeature?.(f),
    })),
    ...items.map((n) => ({
      key: n.lecture.id,
      hue: n.lecture.hue,
      icon: n.lecture.icon,
      tag: n.kind === 'new' ? 'הרצאה חדשה' : 'עודכן',
      tagClass: n.kind,
      meta: `${showCourse ? `${n.course.title} · ` : ''}${agoLabel(n.ago)}`,
      title: n.lecture.title,
      note: n.note,
      open: () => onOpen(n),
    })),
  ];
  if (!rows.length) return null;
  const row = (r: (typeof rows)[number], full: boolean) => (
    <button
      key={r.key}
      className="news-row press"
      style={{ ['--hue' as string]: r.hue }}
      onClick={() => {
        setAll(false);
        r.open();
      }}
    >
      <span className="news-glyph" aria-hidden>
        {r.icon}
      </span>
      <span className="row-main">
        <span className="news-k">
          <span className={`news-tag ${r.tagClass}`}>{r.tag}</span>
          {r.meta}
        </span>
        <span className="news-t">{r.title}</span>
        {full && r.note && (
          <span className="news-note">
            <Rich>{r.note}</Rich>
          </span>
        )}
      </span>
      <IconChevron className="chev flip" />
    </button>
  );
  const more = rows.length - NEWS_SHOWN;
  return (
    <section className="news" aria-label="מה חדש">
      <div className="news-head">
        <IconSparkle width={18} height={18} />
        מה חדש
        {more > 0 && (
          <button className="news-all press" onClick={() => setAll(true)} aria-haspopup="dialog">
            הכול ({rows.length})
          </button>
        )}
      </div>
      {rows.slice(0, NEWS_SHOWN).map((r) => row(r, false))}
      <Sheet open={all} onOpenChange={setAll} label="מה חדש">
        <div className="sheet-title">מה חדש</div>
        <div className="news-list">{rows.map((r) => row(r, true))}</div>
      </Sheet>
    </section>
  );
}

/** "28.10.2026" style date for older tips. */
const tipDate = (d: string) => d.split('-').reverse().join('.');
export function tipWhen(date: string, today = todayKey()): string {
  const ago = dayDiff(date, today);
  return ago >= 0 && ago <= NEWS_DAYS ? agoLabel(ago) : tipDate(date);
}

function TipBody({ tip }: { tip: Tip }) {
  return (
    <>
      <span className="tip-k">
        {tip.author} · {tipWhen(tip.date)}
      </span>
      <span className="tip-t">{tip.title}</span>
      <span className="tip-b">{tip.body}</span>
    </>
  );
}

/** "פינת הטיפים": the newest tip from Ethan / Koren; "כל הטיפים" opens the rest when there is more than one. */
export function TipsCorner() {
  const [all, setAll] = useState(false);
  const list = tipsNewestFirst();
  if (!list.length) return null;
  return (
    <section className="tip" aria-label="פינת הטיפים">
      <div className="tip-head">
        <IconTip width={18} height={18} />
        פינת הטיפים
      </div>
      <button className="tip-card tip-short press" onClick={() => setAll(true)} aria-haspopup="dialog">
        <TipBody tip={list[0]} />
      </button>
      {list.length > 1 && (
        <button className="tip-all press" onClick={() => setAll(true)} aria-haspopup="dialog">
          כל הטיפים
          <IconChevron className="chev flip" />
        </button>
      )}
      <Sheet open={all} onOpenChange={setAll} label={list.length > 1 ? 'כל הטיפים' : 'פינת הטיפים'}>
        <div className="sheet-title">{list.length > 1 ? 'כל הטיפים' : 'פינת הטיפים'}</div>
        <div className="tip-list">
          {list.map((t) => (
            <div key={t.id} className="tip-card card">
              <TipBody tip={t} />
            </div>
          ))}
        </div>
      </Sheet>
    </section>
  );
}
