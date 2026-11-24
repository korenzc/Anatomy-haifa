/**
 * Lists every term whose recording is missing or out of date, as JSON lines {file, slug, text},
 * for make_audio.py. public/audio/index.json remembers what each file says, so changing how a
 * term is spoken (src/lib/audio.ts) re-records just that term. Run through `npm run audio`;
 * pass --all to re-record everything.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { terms } from '../src/content/lexicon';
import { audioSlug, speakable } from '../src/lib/audio';

const root = resolve(import.meta.dirname, '..');
const outDir = join(root, 'public/audio');
const indexFile = join(outDir, 'index.json');
const all = process.argv.includes('--all');
const index: Record<string, string> = existsSync(indexFile) ? JSON.parse(readFileSync(indexFile, 'utf8')) : {};

const seen = new Map<string, string>();
for (const t of terms) {
  const slug = audioSlug(t.word);
  const prev = seen.get(slug);
  if (prev !== undefined && prev !== t.word) throw new Error(`audio file name clash: "${prev}" and "${t.word}"`);
  seen.set(slug, t.word);
}

for (const [slug, word] of seen) {
  const file = join(outDir, `${slug}.mp3`);
  const text = speakable(word);
  if (all || !existsSync(file) || index[slug] !== text) console.log(JSON.stringify({ file, slug, text }));
}
