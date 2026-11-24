---
name: add-lecture
description: Turn a new slide deck (PDF/PPTX/images) into a lecture in the אנטומיה חיפה app — deep understanding of the slides by cheap helper agents, then the main model checks, simplifies and fits it into the app. Use whenever new material arrives ("הנה מצגת חדשה", "תעלה את ההרצאה", a file from WhatsApp, "יש חומר חדש"), for a new lecture or an update to an existing one.
---

# Adding a lecture from a slide deck

**The goal of the app is focused prep for the quizzes on each lecture.** Everything in a lecture must come from its slides, be understood deeply, and be cut to what a student needs for the quiz — the minimum, or a bit more if the deck is dense. Read `docs/APP-MAP.md` and `README.md` ("הוספת מצגת לקורס קיים") first.

## 0. Which course, and how students see it
- Koren just sends the decks (often many at once, as a ZIP). Match each deck to one of the four subjects in `src/content/courses/index.ts` (`intro` מבואות, `upper-limb` גפה עליונה, `spine-back-skull` עמוד שדרה, גב וגולגולת, `head-face-neck` ראש, פנים וצוואר) and say which you picked. Order lectures inside a subject in teaching order (deck numbers / dates in the file names).
- Add the lecture file in that subject's folder and list it in its `lectures`. A subject that isn't in the list (e.g. radiological anatomy later) gets a new folder + an entry in `courses/index.ts`; never rename an existing id.
- Students only see subjects with at least one lecture. From the second subject on, a row of subjects appears on the path. `intro` is first in `courses/index.ts`, so it is the default.
- The first lecture of a new subject: besides `added`, add a short entry to `src/content/features.ts` ("מקצוע חדש: …", tab `path`).
- Many decks at once: do them one subject at a time, run the checks after each subject, and publish each subject as it is done so students get material early.

## 1. Split the deck for cheap helpers (scouts/builders, not the main model)
- Convert the deck to text + slide images once (e.g. `pdftotext -layout`, or PPTX → PDF with LibreOffice, `pdftoppm -r 80` for images) into the scratchpad, never into the repo.
- Cut it into chunks of ~10–15 slides. Dispatch one cheap helper per chunk **in parallel** (`scout` for reading/extracting, `builder` if it should also draft TypeScript). Each helper gets: the chunk, the course name, and this brief:
  - For every slide: what it teaches in 1–2 plain Hebrew sentences, and why it matters (is it likely on a quiz?).
  - Every medical term with its parts (prefix/root/suffix) exactly as the slides show them, Hebrew meaning, English definition.
  - Candidate facts as question → short answer, **with the slide number**. Hebrew question; answer short (Hebrew or the English term). 3 plausible wrong answers of the same kind.
  - Anything on the slides that looks wrong or contradicts another slide → list it (slide, what it says, what is correct and why).
  - Mark each item `core` (quiz-worthy), `useful`, or `skip` (decoration, repetition, admin slides).
  - Nothing from outside knowledge. If a slide is unclear, say so instead of guessing.

## Anatomy lectures: facts first
These lectures are built mainly from `facts`. Use `words`/`parts` only where the slides themselves break a term into parts (e.g. in the terminology intro deck). The quiz on each deck is multiple choice, so the facts should practice exactly that. What makes a good fact:
- **Understanding over recall.** Mix the kinds: what does X do / where does it happen, why does X lead to Y, what happens if X is missing or blocked, what is the difference between X and Y, which step comes first / next in a process, which of the statements is correct, what does this diagram (slide image) show. Not just "what is the name of…".
- **One idea per question**, short Hebrew, the scientific term in English where the slides use English (as on the quiz).
- **Wrong answers matter most.** Always write `wrong` (3 options) of the same kind and length as the answer, taken from the same lecture (neighbouring organelles, the other enzyme, the opposite direction, a step out of order). No joke options, no "all of the above", nothing a student can rule out without knowing the material.
- **`explain` on almost every fact:** one or two sentences of *why*, from the slides, so a wrong answer teaches something.
- **Processes and mechanisms** (e.g. a nerve's course, a muscle's origin → insertion → innervation → action): one fact per step + one or two "what comes after X" facts, so the order is learned.
- **Diagrams:** when a slide's figure is the point (a labelled bone, a plexus, a cross-section), save it as a small `.webp` under `public/slides/<lecture-id>/` and set `img`, asking about what it shows.
- **Numbers and formulas** only when the slide stresses them; keep the answer short and the wrong options close (same unit, nearby values).
- `concepts` (4–8 cards) carry the big picture of the deck in teaching order; the facts then drill it.
- Size: same rule as always, quiz-worthy items only. A typical 40-slide anatomy deck ends up around 25–60 facts. For muscles, ask the things the quiz asks: origin, insertion, innervation, action, and which muscles share a nerve or a compartment.
- Brief the helpers in step 1 with this section too, so their candidate facts already follow it.

## 2. Main model: understand, cut, simplify
- Read all helper reports together. Merge duplicates across chunks, fix contradictions, and check doubtful items against the slide images yourself.
- Keep `core` items, add `useful` ones only while the lecture stays focused. Rough guide: a short deck → 10–30 items; a dense one → up to ~100. The path scales on its own (~9 items per lesson, max 14 lessons, mid test only in big lectures), so fewer, sharper items = fewer steps for students.
- Simplify the wording: short Hebrew questions, one idea per fact, `explain` only when it truly helps. Write 4–8 `concepts` cards (the big ideas, in teaching order) + a few `quiz` questions on rules for the intro node.
- Adapt to the app: words that already exist in `lexicon.ts` are reused (just list them in `words`), new parts get added once, ids are kebab-case and **never** reuse or rename an existing id. Use `corrections` for real slide mistakes.
- Set `added: 'YYYY-MM-DD'` (today) on a new lecture so it shows under "מה חדש". For a content update to an existing lecture set `updated: { date, note }` with a short Hebrew note of what changed.

## 3. Check and ship
- `npm run validate && npm run typecheck && npm test` must pass.
- Open the app at phone width: the lecture appears under "מה חדש", its first node is open, a lesson and the final test work.
- Proofread every Hebrew string yourself (helpers' Hebrew is checked by you, never shipped raw).
- Update `docs/APP-MAP.md` if anything structural changed, then follow `CLAUDE.md` for publishing.
