# App map — how אנטומיה חיפה is built

Practice app for **theoretical anatomy (אנטומיה עיונית)**, owned by Koren (`korenzc/anatomy-haifa`). Started 24.11.2026 as a copy of Ethan's לדבר רפואית (`ethankol/ledaber-refuit`) with its content, leaderboard, class chat, account backup and address move removed. Mascot: the owl in a white coat (`public/owl.png`); app icons `icon-192/512.png`, `icon-maskable-512.png`, `apple-touch-icon.png`, `favicon.png`.

Read this first in every new chat, before opening code. **Keep it true:** any change that adds/moves/renames a file, changes how a feature works, or adds a rule → update this file in the same change.

Last updated: 24.11.2026 (מבואות 4 lectures + eye & orbit; path tab as lecture tiles; before that גפה עליונה: 11 lectures from 12 decks, 247 terms, ~600 facts, slide figures; a question's figure shows after answering; before that the copy itself).

## In one paragraph
A phone-first PWA (React 19 + TypeScript + Vite). Content is TypeScript files compiled into the app. Every student's progress lives in their browser (localStorage key `shoresh:v1`, kept from the original app; harmless since every address has its own storage), with export/import to a file in the Progress tab. No server, no accounts. Spaced repetition is FSRS (`ts-fsrs`). Visits are counted by Vercel Web Analytics if turned on in the Vercel project (script tag in `index.html`). Every commit on `main` deploys to the live site on Vercel.

## The four tabs (src/App.tsx → src/screens/)
| Tab | File | What it shows |
|---|---|---|
| מסלול | `PathScreen.tsx` | **Two levels ("a path inside a path", Koren 24.11.2026), so the tab stays short:** the home level = stats pills → **subject row** (only subjects with slides; hidden while only one has slides) → **מה חדש** → **פינת הטיפים** (only when `content/tips.ts` has tips) → "continue" card → a **3-column grid of small lecture tiles (Koren asked for 3 per row)** (icon, lecture number, title, progress bar, ✓ when the lecture is done, "עכשיו" on the current one). A tile opens **that lecture's winding path** (`LecturePath`) with a "כל ההרצאות ב…" pill to go back; the phone's Back does the same (`useBack`), the grid's scroll position comes back, and the open lecture survives tab switches (`sessionStorage` `path-lecture`). Inside a lecture the home-level cards are hidden. A מה חדש row opens its lecture. Node tap → `NodeSheet`. With no material at all it shows "עוד לא עלו מצגות" + the send-material button. |
| תרגול | `PracticeScreen.tsx` | smart practice (due items), per-subject/per-lecture learn·practice·test·flashcards, mistakes, mixed exam, **send-material card**. Never blocked by the path. |
| מילון | `DictionaryScreen.tsx` | search terms (he/en), filter by subject/lecture, term & part sheets. |
| התקדמות | `ProgressScreen.tsx` | streak, week chart, per-subject progress, weakest items, **settings** (goal, sound, haptics, speech, look), backup to a file, reset, small credit line at the bottom. |

Overlays (full screen, from App.tsx): `components/SessionView.tsx` (a lesson/test; exercises from `components/exercises.tsx`) and `components/FlashcardsView.tsx`.

## Content (src/content/)
- `courses/index.ts` — the subjects in display order: `intro` (מבואות), `upper-limb` (גפה עליונה), `spine-back-skull` (עמוד שדרה, גב וגולגולת), `head-face-neck` (ראש, פנים וצוואר). A subject with `lectures: []` is never shown. `activeCourse` (path.ts) = the saved choice if it has slides, else the first subject with slides.
- `courses/<course>/index.ts` — the `Course`; `courses/<course>/NN-*.ts` — one `Lecture` = one slide deck.
- `lexicon.ts` — terms (only what some lecture teaches): anatomy structure names without `parts`, `he`/`meaning` = what the structure is, from the slides. A term belongs to the first lecture that lists it; later lectures just list it in `words`. `meaning` must not contain the word itself (it is the question).
- `courses/intro/` (מבואות, first = everyone's default) — 4 lectures: skeleton, terminology & joints; connective tissue (bone, cartilage, blood, lymph); muscle tissue; nervous system. Two more intro decks are still to come (too heavy to upload).
- `courses/head-face-neck/` — so far 1 lecture: eye and orbit (a second-year deck Koren sent with the intro ones).
- `courses/upper-limb/` — 11 lectures in teaching order: bones (shoulder & arm, forearm & hand), joints (shoulder & elbow, forearm & hand), muscles (shoulder & arm, forearm, hand), brachial plexus & axilla, nerves of arm & forearm (cubital fossa), wrist & hand innervation, vessels (two decks: 'Arteries' + 'Artery summary', so facts carry `deck`). Figures in `public/slides/<lecture-id>/<slide>.webp` (`<deck#>-<slide>` for the two-deck lecture).
- `tips.ts` — the tips corner (`{ id, date, author, title, body }`), empty for now.
- `features.ts` — big app features for **מה חדש**; every big new feature gets an entry.
- `types.ts` — the schema. Lecture fields: `id` (permanent!), `added` / `updated` (feed מה חדש), `concepts`+`quiz` (intro node), `words`, `parts`, `facts` (slide Q→A with `slide` number; `deck` when a lecture combines two decks; `img` = a slide figure as a small `.webp` in `public/slides/<lecture>/`; on a question it appears only **after answering**, because anatomy figures carry the answer in their labels; `imgFirst: true` shows it with the question, for questions about the figure itself), `corrections`.
- `index.ts` — turns raw content into `CourseInfo`/`LectureInfo`/`TermInfo`/`FactInfo` with ids: terms `t:word`, parts `p:key`, facts `f:lectureId/factId`.
- `test-fixtures/` — test-only content (see Logic → `__tests__`).
- `scripts/validate-content.ts` (`npm run validate`) — checks everything.
- How to add a deck: `.claude/skills/add-lecture/SKILL.md`.

## Logic (src/lib/, no UI)
| File | Job |
|---|---|
| `path.ts` | Builds each course's path: per lecture an optional intro node, lessons sized to the lecture (~9 items each), a mid test only in big lectures (`:T1`) and a final test (`:final`). `pathProgress` = done/open per node, **each lecture unlocks on its own**; `current` follows the lecture the student touched last. Progress is *derived* from cards, so adding content never corrupts it. |
| `session.ts` | What a lesson/test/practice asks (session builders) + the reducer (`answer`, `advance`, `summarize`). Lessons stay under 3 cards+questions per item and ask about each word at most twice (quick check, then build for a third of the words or one match board for the rest); a stage already studied replays as practice, without the teaching cards. Tests sample ≤15 (mid) / ≤20 (final) items. |
| `exercises.ts` | Exercise makers (`mk.*`) and which format fits an item's strength. Wrong answers are the *closest* ones (shared rare parts, shared meaning words in Hebrew/English, same lecture, same kind: organ / clinical), with a penalty for words used as wrong answers lately; part options never share a meaning word with the right one (that would make two right answers). |
| `srs.ts` | FSRS wrapper: `review`, `strength`, `retrievability`. |
| `store.ts` | The persisted state + `sanitize` (accepts old/corrupt data); `daily` = answers/correct per day. Shape changes must keep old data loading. `theme` defaults to light; `themePicked` marks a user's own choice. |
| `news.ts` | `recentNews()` — lectures added/updated in the last 21 days, and `recentFeatures()` — big app features from `content/features.ts`; both feed מה חדש (a feature row opens its tab). |
| `share.ts` | WhatsApp link to Koren with a ready message, for "send us material". |
| `flash.ts` | Flashcard decks (never touch FSRS). |
| `speech.ts`, `audio.ts` | Pronunciation: recordings in `public/audio/` (`npm run audio`; run it after every new lecture, `npm run validate` warns about words without one), else the phone's voice. Plays **only when the speaker button is tapped**, never on its own. |
| `feedback.ts`, `back.ts`, `text.ts`, `random.ts` | sounds/haptics, Back button for overlays, answer matching + dates, shuffling. |
| `__tests__/` | vitest; uses the made-up course `courses/e2e-fixture.ts` and the old terminology course + lexicon from לדבר רפואית in `content/test-fixtures/` (both only in test mode, never in the site). |

## UI building blocks
- `components/ui.tsx` — `Screen` (iOS large title), `Sheet` (Vaul bottom sheet), `Rich` (Hebrew text with isolated English), `Segmented` (colour-coded word parts), `Bar`, `Dots`, `ToggleRow`, `SendMaterial`, `WhatsNew`, `TipsCorner`. Look here before writing a new piece of UI.
- `components/Icons.tsx` — all icons (24×24 stroke SVGs).
- `styles/app.css` — one stylesheet. Tokens at the top (`--accent`, `--grouped-bg`, …), redefined for dark twice (system dark and `data-theme='dark'` — change both). Per-lecture colour = `--hue` (OKLCH). Palette since 21.10.2026: light and airy (`#f5f7fc` background, `#4c7dff` accent, pastel cards); dark mode is soft charcoal `#15171c`, not black.

## Rules that bite
- Lecture/fact/course ids are permanent (progress is keyed by them). Path node ids: `lecture-<id>:intro`, `:L<n>`, `:T1`, `:final`.
- Content only from the slides, with slide numbers.
- Every phone-visible change: check at 375px wide, light and dark.
- UI changes follow the `emil-design-eng` skill (`.claude/skills/`).
- Anything that reacts to a tap must do something: `.row` only darkens on tap when it is a `<button>`. A cut-off list always offers a way to see the rest.
- Progress lives only in the phone's browser; `main.tsx` asks for persistent storage so the browser doesn't clear it. Students move it between phones with the backup file.
- Leftovers from the original app that are unused here: leaderboard/chat CSS in `app.css`, `IconTrophy`. Safe to delete when touching those files.
