# אנטומיה חיפה — rules for every Claude working here

The app belongs to Koren (GitHub: `korenzc`). Friends he adds as collaborators on GitHub may work on it too, with the same rights (since 24.11.2026). Assume whoever you work for is not a programmer: explain everything in plain Hebrew, no jargon, and do the git work for them.

It started on 24.11.2026 as a copy of Ethan's app **לדבר רפואית** (`ethankol/ledaber-refuit`), with the old content, the leaderboard, the class chat, the account backup and the address move taken out. It is a separate project now: nothing here touches Ethan's app, and nothing from there is pulled in automatically.

**Start here:** read `docs/APP-MAP.md` — a map of how the app is built (screens, logic, content, styles, traps). **Whenever you change something it describes, update the map in the same change.**

**What the app is for:** focused prep for the quizzes in **theoretical anatomy (אנטומיה עיונית)**. Keep it light: the minimum practice that works, scaled to how much material a deck has, and nothing ever blocks a student (every lecture opens on its own, practice is always free). Radiological anatomy (אנטומיה רדיולוגית) may come later as its own course.

## Subjects (src/content/courses/)
| id | Title | Covers |
|---|---|---|
| `intro` | מבואות | nerves, muscle, connective tissue, epithelium, terminology, joints… |
| `upper-limb` | גפה עליונה | arm, forearm, hand |
| `spine-back-skull` | עמוד שדרה, גב וגולגולת | |
| `head-face-neck` | ראש, פנים וצוואר | |

A subject with no lectures is hidden from students until its first deck arrives.

## Publishing
`main` is the live site: https://anatomy-haifa.vercel.app (Vercel builds every commit on `main`). **Everyone publishes straight to `main`**, Koren and the friends he added alike; nobody waits for anyone's approval (Koren's decision, 24.11.2026).

Every task, whoever you work for:
1. **Start from the latest `main`** (`git checkout main && git pull`): someone else may have changed the app since your last session. Read `docs/APP-MAP.md` again if it changed.
2. Make the change. **One change per commit**, with a clear message saying what and why, so the others can follow.
3. Run the checks below. All three must pass. Check the changed screens at phone width.
4. Push to `main`. If the push is refused because someone else pushed meanwhile: `git pull` (a merge, never `--force`), fix any conflict, run the checks again, push.
5. About two minutes later, open the live site and check the change is there. If it is not, look at the latest deployment in the repo's Actions/Deployments; on Vercel's free plan a private repo may refuse to deploy commits by anyone but the project owner. If that happens, tell the person in plain words and tell Koren; the fix (an automatic "publish" commit in Koren's name, like Ethan's `.github/workflows/publish-koren.yml`) needs his OK.
6. Tell the person it is live, in plain Hebrew.

For a bigger or risky change you may still use a branch `claude/<short-name>` + a pull request, check its Vercel preview link at phone width, and merge it yourself (merge commit). Never rewrite or delete someone else's work to make yours fit; if two changes really clash, ask.

## Where things go
| What | Where |
|---|---|
| Study material (questions, terms) | `src/content/courses/<course>/NN-*.ts`, terms in `src/content/lexicon.ts`. Format in README.md |
| Data shapes (types) | `src/content/types.ts` |
| Logic without UI | `src/lib/<topic>.ts`, one topic per file |
| Tests for logic | `src/lib/__tests__/` (they run on test-only content in `src/content/test-fixtures/`, never shipped) |
| A whole tab / screen | `src/screens/<Name>Screen.tsx` |
| Reusable UI pieces | `src/components/ui.tsx`; bigger views get their own file in `src/components/` |
| Exercise types | `src/components/exercises.tsx` (UI) + `src/lib/exercises.ts` (logic) |
| Styles | `src/styles/app.css`, using the existing CSS variables |
| Icons | `src/components/Icons.tsx` |
| Images / audio | `public/` (slide figures in `public/slides/<lecture-id>/`) |

Logic goes in `src/lib/`, screens only show things. Reuse what exists before writing new pieces. Keep changes focused. Match the surrounding style (Hebrew UI text, right-to-left).

## New material (slides)
Whenever a deck arrives, use the `add-lecture` skill (`.claude/skills/add-lecture/`): cheap helper agents read the slides in parallel chunks; the main model checks, cuts to what matters for the quiz, simplifies, and fits it in. Every new lecture gets an `added` date (later changes an `updated` note). The "מה חדש" card was removed from the home screen (Koren, 24.11.2026); keep the dates and `content/features.ts` entries anyway, in case it comes back.

## Look and feel
Light and airy by default (`#f5f7fc` background, `#4c7dff` accent, pastel cards); dark mode is soft charcoal, not black. Any change to how the app looks or feels: load the `emil-design-eng` skill first and build by its rules (for motion also `animate` / `review-animations`).

## Do not break
- **Lecture, fact and course `id`s are permanent.** Everyone's progress is saved under them. Never rename or remove one.
- **Saved progress** (`src/lib/store.ts`, kept in the browser). If its shape changes, existing users' data must still load. Never wipe it.
- **Content only from the slides.** Every fact must come from the deck, with its slide number. No outside knowledge.
- Phone first (iPhone, Hebrew, right-to-left). Check every screen at phone width, light and dark.
- The "send material" buttons open WhatsApp to Koren (`src/lib/share.ts`). Keep that number there only.
- No paid services, accounts, keys or secrets without asking Koren. Avoid new packages unless there is no reasonable way without one.

## Checks before every publish
```bash
npm run validate   # content checker
npm run typecheck
npm test
```
All three must pass.
