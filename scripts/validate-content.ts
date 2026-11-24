/**
 * Content validator. Run: npm run validate
 * Fails (exit 1) on any error so a broken word or slide question never reaches the app.
 *
 * Checks the lexicon (src/content/lexicon.ts: word parts and terms) and every course
 * (src/content/courses/…: lectures, concept cards, quizzes and slide facts), and that the
 * lexicon holds only what some lecture teaches — nothing that isn't in the slides.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { courses } from '../src/content/courses';
import fixture from '../src/content/courses/e2e-fixture';
import { parts, terms } from '../src/content/lexicon';
import type { Concept, Course, QuizItem } from '../src/content/types';
import { audioSlug, speakable } from '../src/lib/audio';

const errors: string[] = [];
const warnings: string[] = [];
const HEB = /[֐-׿]/;
const FORM = /^[a-z]+$/;
const ID = /^[a-z0-9-]+$/;

// ---------- word parts ----------
const formIndex = new Map<string, string[]>(); // form → part keys
for (const [key, p] of Object.entries(parts)) {
  const where = `part "${key}"`;
  if (!['prefix', 'root', 'suffix'].includes(p.type)) errors.push(`${where}: bad type ${p.type}`);
  if (!p.forms?.length) errors.push(`${where}: no forms`);
  if (p.forms?.[0] !== key.split('_')[0]) errors.push(`${where}: key must equal forms[0] ("${p.forms?.[0]}"), optionally with a _suffix`);
  if (!p.en) errors.push(`${where}: missing en`);
  if (!p.he || !HEB.test(p.he)) errors.push(`${where}: missing/invalid he`);
  for (const f of p.forms ?? []) {
    if (!FORM.test(f)) errors.push(`${where}: form "${f}" must be lowercase a-z only (no hyphens)`);
    formIndex.set(f, [...(formIndex.get(f) ?? []), key]);
  }
}

// ---------- terms ----------
const words = new Set<string>();
const partsUsedByTerms = new Set<string>();
for (const t of terms) {
  const where = `term "${t.word}"`;
  if (!t.word) { errors.push('term without word'); continue; }
  if (t.word !== t.word.trim()) errors.push(`${where}: whitespace around word`);
  if (words.has(t.word.toLowerCase())) errors.push(`${where}: duplicate`);
  words.add(t.word.toLowerCase());
  if (!t.he || !HEB.test(t.he)) errors.push(`${where}: missing/invalid he`);
  if (!t.en) errors.push(`${where}: missing en`);
  if (t.explain && !HEB.test(t.explain)) errors.push(`${where}: explain should be Hebrew`);
  if (t.level && ![1, 2, 3].includes(t.level)) errors.push(`${where}: level must be 1|2|3`);
  if (!t.parts?.length) continue;
  const forms = t.parts.map((r) => r.split('#')[0]);
  if (forms.join('') !== t.word) errors.push(`${where}: parts [${forms.join(' + ')}] join to "${forms.join('')}"`);
  const keys = t.parts.map((ref) => {
    const [f, key] = ref.split('#');
    if (key) {
      if (!parts[key]) errors.push(`${where}: "${ref}" — no part with key "${key}"`);
      else if (!parts[key].forms.includes(f)) errors.push(`${where}: "${ref}" — part "${key}" has no form "${f}"`);
      return key;
    }
    const ks = formIndex.get(f) ?? [];
    if (!ks.length) errors.push(`${where}: part "${f}" is not in the lexicon`);
    if (ks.length > 1) errors.push(`${where}: "${f}" is ambiguous (${ks.join(', ')}) — write "${f}#<key>"`);
    return ks[0];
  });
  keys.forEach((k, i) => {
    const p = k ? parts[k] : undefined;
    if (!p) return;
    partsUsedByTerms.add(k!);
    if (p.type === 'prefix' && i !== 0 && parts[keys[i - 1]!]?.type !== 'prefix') warnings.push(`${where}: prefix "${forms[i]}" is not at the start`);
    if (p.type === 'suffix' && i !== keys.length - 1 && parts[keys[i + 1]!]?.type !== 'suffix') warnings.push(`${where}: suffix "${forms[i]}" is not at the end`);
  });
}

// ---------- courses ----------
function checkConcepts(owner: string, concepts: Concept[] | undefined, quiz: QuizItem[] | undefined) {
  (concepts ?? []).forEach((c, i) => {
    const where = `${owner} concept #${i + 1}`;
    if (!c.title || !HEB.test(c.title)) errors.push(`${where}: missing/invalid Hebrew title`);
    if (!c.body || !HEB.test(c.body)) errors.push(`${where}: missing/invalid Hebrew body`);
    if (c.example && !words.has(c.example.toLowerCase())) errors.push(`${where}: example "${c.example}" is not a lexicon word`);
  });
  (quiz ?? []).forEach((q, i) => {
    const where = `${owner} quiz #${i + 1}`;
    if (!q.q || !HEB.test(q.q)) errors.push(`${where}: missing/invalid Hebrew question`);
    if (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 4) errors.push(`${where}: needs 2–4 options`);
    else if (new Set(q.options).size !== q.options.length) errors.push(`${where}: duplicate options`);
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= (q.options?.length ?? 0)) errors.push(`${where}: answer index out of range`);
  });
  if (quiz?.length && !concepts?.length) warnings.push(`${owner}: has a quiz but no concept cards`);
}

const taughtWords = new Set<string>();
const taughtParts = new Set<string>();
const courseIds = new Set<string>();
const lectureIds = new Set<string>();
let nLectures = 0;
let nFacts = 0;

function checkCourse(c: Course, shipped = true) {
  const cw = `course "${c.id}"`;
  if (!ID.test(c.id)) errors.push(`${cw}: id must be kebab-case`);
  if (courseIds.has(c.id)) errors.push(`${cw}: duplicate course id`);
  courseIds.add(c.id);
  if (!c.title || !HEB.test(c.title)) errors.push(`${cw}: Hebrew title required`);
  if (!c.icon) errors.push(`${cw}: missing icon`);
  if (typeof c.hue !== 'number') errors.push(`${cw}: missing hue`);
  if (c.semester !== undefined && ![1, 2].includes(c.semester)) errors.push(`${cw}: semester must be 1 or 2`);
  for (const l of c.lectures) {
    if (shipped) nLectures++;
    const where = `lecture "${l.id}"`;
    // lecture ids key everyone's saved progress (checkpoints, fact cards) — they must never change
    if (!ID.test(l.id)) errors.push(`${where}: id must be kebab-case`);
    if (lectureIds.has(l.id)) errors.push(`${where}: duplicate lecture id (ids are global across courses)`);
    lectureIds.add(l.id);
    if (!HEB.test(l.title)) errors.push(`${where}: Hebrew title required`);
    if (!l.icon) errors.push(`${where}: missing icon`);
    if (typeof l.hue !== 'number') errors.push(`${where}: missing hue`);
    // dates feed the "מה חדש" section on the path
    const DAY = /^\d{4}-\d{2}-\d{2}$/;
    if (shipped && !l.added) warnings.push(`${where}: no \`added\` date — it won't show under "מה חדש"`);
    if (l.added && !DAY.test(l.added)) errors.push(`${where}: added must be YYYY-MM-DD`);
    if (l.updated && (!DAY.test(l.updated.date) || !HEB.test(l.updated.note))) errors.push(`${where}: updated needs a YYYY-MM-DD date and a Hebrew note`);
    for (const w of l.words ?? []) {
      if (!words.has(w.toLowerCase())) errors.push(`${where}: word "${w}" is not in the lexicon`);
      taughtWords.add(w.toLowerCase());
    }
    for (const k of l.parts ?? []) {
      if (!parts[k]) errors.push(`${where}: part "${k}" is not in the lexicon`);
      taughtParts.add(k);
    }
    if (new Set(l.words).size !== (l.words ?? []).length) errors.push(`${where}: duplicate words`);
    if (new Set(l.parts).size !== (l.parts ?? []).length) errors.push(`${where}: duplicate parts`);
    checkConcepts(where, l.concepts, l.quiz);

    const fids = new Set<string>();
    for (const f of l.facts ?? []) {
      if (shipped) nFacts++;
      const fw = `${where} fact "${f.id}"`;
      if (!ID.test(f.id)) errors.push(`${fw}: id must be kebab-case`);
      if (fids.has(f.id)) errors.push(`${fw}: duplicate fact id`);
      fids.add(f.id);
      if (!f.q || !HEB.test(f.q)) errors.push(`${fw}: question must be Hebrew`);
      if (!f.a?.trim()) errors.push(`${fw}: empty answer`);
      if (f.explain && !HEB.test(f.explain)) errors.push(`${fw}: explain should be Hebrew`);
      if (f.slide !== undefined && (!Number.isInteger(f.slide) || f.slide < 1)) errors.push(`${fw}: slide must be a positive integer`);
      for (const w of f.wrong ?? []) if (w.trim().toLowerCase() === f.a.trim().toLowerCase()) errors.push(`${fw}: a wrong option equals the answer`);
      if (f.img && !existsSync(resolve(import.meta.dirname, '../public', f.img.replace(/^\//, '')))) errors.push(`${fw}: image ${f.img} not found in public/`);
    }
    // multiple choice needs 3 distractors: the fact's own `wrong`, else other answers in the course
    const courseFacts = c.lectures.reduce((n, x) => n + (x.facts?.length ?? 0), 0);
    for (const f of l.facts ?? [])
      if ((f.wrong?.length ?? 0) + courseFacts - 1 < 3) warnings.push(`${where} fact "${f.id}": fewer than 3 wrong options available — add \`wrong\``);
    for (const x of l.corrections ?? []) if (!HEB.test(x.correct)) errors.push(`${where}: correction for slide ${x.slide} should be Hebrew`);
    if (!(l.words?.length || l.facts?.length || l.concepts?.length)) warnings.push(`${where}: nothing to learn yet`);
  }
}
for (const c of courses) checkCourse(c);
if (!courses.some((c) => c.id === fixture.id)) checkCourse(fixture, false);

// the lexicon is only what the slides teach
for (const t of terms) if (!taughtWords.has(t.word.toLowerCase())) errors.push(`term "${t.word}": not in any lecture — remove it or add it to the lecture whose slides show it`);
for (const k of Object.keys(parts))
  if (!taughtParts.has(k) && !partsUsedByTerms.has(k)) errors.push(`part "${k}": not used by any lecture or term — remove it`);

// recordings (npm run audio) — a missing one falls back to the phone's own voice, so only warn
const audioIndexFile = resolve(import.meta.dirname, '../public/audio/index.json');
const audioIndex: Record<string, string> = existsSync(audioIndexFile) ? JSON.parse(readFileSync(audioIndexFile, 'utf8')) : {};
const noAudio = terms.filter((t) => audioIndex[audioSlug(t.word)] !== speakable(t.word)).map((t) => t.word);
if (noAudio.length) warnings.push(`${noAudio.length} terms have no up-to-date recording (${noAudio.slice(0, 5).join(', ')}${noAudio.length > 5 ? '…' : ''}) — run npm run audio`);

for (const w of warnings) console.warn('⚠️  ' + w);
for (const e of errors) console.error('❌ ' + e);
console.log(
  `\n${courses.length} courses (${courses.filter((c) => !c.lectures.length).length} waiting for slides) · ${nLectures} lectures · ${Object.keys(parts).length} parts · ${terms.length} terms · ${nFacts} facts · ${errors.length} errors · ${warnings.length} warnings`,
);
process.exit(errors.length ? 1 : 0);
