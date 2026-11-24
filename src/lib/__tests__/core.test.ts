import { describe, expect, it } from 'vitest';
import { courseById, courses, factById, liveCourses, facts, lectures, partAt, partByKey, terms, termById } from '../../content';
import { terms as lexiconTerms } from '../../content/lexicon';
import { buildTiles, distractorTerms, exerciseForFact, factDistractors, itemOf, mk } from '../exercises';
import { activeCourse, lessonCountFor, pathOf, pathProgress, isUnlocked, SECTIONS } from '../path';
import {
  answer,
  advance,
  checkpointSession,
  dueCount,
  introSession,
  isFinished,
  lessonExercises,
  lectureLearnSession,
  practiceSession,
  summarize,
  type Session,
} from '../session';
import { review, strength, Rating, retrievability } from '../srs';
import { sanitize, streakOf, type PersistedState } from '../store';
import { judgeTyped } from '../text';
import { audioSlug, speakable } from '../audio';

const empty = (): PersistedState => sanitize({ version: 1, cards: {} })!;
const PATH = pathOf('terminology');

describe('content', () => {
  it('every term resolves to real parts that spell the word', () => {
    for (const t of terms) {
      if (!t.parts) continue;
      expect(t.parts.join(''), t.word).toBe(t.word);
      t.parts.forEach((f, i) => {
        const p = partAt(t, i);
        expect(p, `${t.word}: ${f}`).toBeTruthy();
        expect(p!.forms).toContain(f);
      });
    }
  });
  it('teaches only what the lectures list: every lexicon word has a home lecture', () => {
    expect(terms.length).toBe(lexiconTerms.length);
    expect(new Set(terms.map((t) => t.id)).size).toBe(terms.length);
    for (const t of terms) expect(lectures.find((l) => l.id === t.lectureId)?.words, t.word).toContain(t.word);
  });
  it('the e2e fixture course exists only in test builds', () => {
    expect(courseById.get('e2e-fixture')).toBeTruthy();
    expect(courses[0].id).toBe('terminology');
  });
});

describe('typed answers', () => {
  it('is exact for short words and tolerant for long ones', () => {
    expect(judgeTyped('stat', 'stat')).toBe('exact');
    expect(judgeTyped('stst', 'stat')).toBe('wrong');
    expect(judgeTyped('gastritis', 'gastritis')).toBe('exact');
    expect(judgeTyped('gastritus', 'gastritis')).toBe('typo');
    expect(judgeTyped('pericarditis', 'pericarditis')).toBe('exact');
    expect(judgeTyped('pericardtis', 'pericarditis')).toBe('typo');
    expect(judgeTyped('hepatitis', 'gastritis')).toBe('wrong');
    expect(judgeTyped('B.I.D.', 'b.i.d.')).toBe('exact');
  });
  it('never accepts another real term as a typo', () => {
    expect(judgeTyped('ilium', 'ileum', ['ileum', 'ilium'])).toBe('wrong');
  });
});

describe('srs', () => {
  it('schedules a correct answer further out than a wrong one', () => {
    const now = new Date('2026-01-01T10:00:00Z');
    const good = review(undefined, Rating.Good, now);
    const bad = review(undefined, Rating.Again, now);
    expect(good.due).toBeGreaterThan(bad.due);
    expect(strength(good)).toBeGreaterThan(0);
    expect(retrievability(good, now)).toBeGreaterThan(0.9);
  });
  it('does not throw when the last review is in the future (clock set back)', () => {
    const ahead = review(undefined, Rating.Good, new Date('2026-03-10T10:00:00Z'));
    const again = review(ahead, Rating.Good, new Date('2026-03-01T10:00:00Z'));
    expect(again.due).toBeGreaterThan(Date.parse('2026-03-10T10:00:00Z'));
    expect(again.reps).toBe(2);
  });
});

describe('streak', () => {
  it('counts consecutive days ending today or yesterday', () => {
    expect(streakOf({ '2026-03-01': 5, '2026-03-02': 3, '2026-03-03': 1 }, '2026-03-03')).toBe(3);
    expect(streakOf({ '2026-03-01': 5, '2026-03-02': 3 }, '2026-03-03')).toBe(2);
    expect(streakOf({ '2026-03-01': 5 }, '2026-03-03')).toBe(0);
    expect(streakOf({}, '2026-03-03')).toBe(0);
  });
});

describe('path', () => {
  const unitNodes = (id: string) => PATH.filter((n) => n.unit.id === id);
  it('covers every lecture term exactly once and ends with a final test', () => {
    const lessonTerms = PATH.flatMap((n) => (n.kind === 'lesson' ? n.terms.map((t) => t.id) : []));
    const lectureTerms = new Set(lectures.filter((l) => l.courseId === 'terminology').flatMap((l) => l.termList.map((t) => t.id)));
    expect(lessonTerms.length).toBe(lectureTerms.size);
    expect(new Set(lessonTerms)).toEqual(lectureTerms);
    expect(PATH[PATH.length - 1].kind).toBe('checkpoint');
  });
  it('lesson count scales with the lecture size', () => {
    expect(lessonCountFor(154)).toBe(14);
    expect(lessonCountFor(107)).toBe(12);
    expect(lessonCountFor(20)).toBe(2);
    expect(lessonCountFor(6)).toBe(1);
    expect(lessonCountFor(12)).toBe(1);
    expect(lessonCountFor(0)).toBe(1);
  });
  it('every lecture has one final test, plus one mid test only when it has more than 6 lessons', () => {
    for (const sec of SECTIONS.filter((x) => x.courseId === 'terminology')) {
      const nodes = unitNodes(sec.id);
      const lessons = nodes.filter((n) => n.kind === 'lesson');
      const tests = nodes.filter((n) => n.kind === 'checkpoint');
      expect(lessons.length).toBe(lessonCountFor(sec.terms.length + sec.facts.length));
      expect(tests.map((t) => t.id)).toEqual(lessons.length > 6 ? [`${sec.id}:T1`, `${sec.id}:final`] : [`${sec.id}:final`]);
      expect(nodes[nodes.length - 1].id).toBe(`${sec.id}:final`);
      if (tests.length === 2) {
        const mid = tests[0];
        expect(mid.index - nodes[0].index).toBeGreaterThan(0);
        expect(nodes.filter((n) => n.index < mid.index && n.kind === 'lesson').length).toBe(Math.floor(lessons.length / 2));
      }
    }
  });
  it('real lectures stay short', () => {
    for (const sec of SECTIONS.filter((x) => x.courseId === 'terminology')) {
      expect(unitNodes(sec.id).length).toBeLessThanOrEqual(18);
    }
  });
  it('locks ahead within a lecture, and a passed test completes everything before it', () => {
    const s = empty();
    let p = pathProgress(s, PATH);
    expect(p.current).toBe(0);
    expect(p.frontier).toBe(0);
    if (PATH[0].kind === 'intro') s.checkpoints[PATH[0].id] = { passed: true, best: 1, at: 0 };
    const first = PATH.findIndex((n) => n.kind === 'lesson');
    for (const t of PATH[first].terms) s.cards[t.id] = review(undefined, Rating.Good);
    p = pathProgress(s, PATH);
    expect(p.done[first]).toBe(true);
    expect(p.frontier).toBe(first + 1);
    // learning a far-away lesson early does not skip the lessons before it
    const far = PATH.findIndex((n, i) => i > first + 4 && n.kind === 'lesson' && n.unit.id === PATH[first].unit.id);
    for (const t of PATH[far].terms) s.cards[t.id] = review(undefined, Rating.Good);
    expect(pathProgress(s, PATH).frontier).toBe(first + 1);
    expect(isUnlocked(far, pathProgress(s, PATH))).toBe(true); // already studied, so it counts as done
    // passing the mid test completes everything before it, and unlocks the node after it
    const cp = PATH.findIndex((n) => n.id.endsWith(':T1'));
    s.checkpoints[PATH[cp].id] = { passed: true, best: 1, at: 0 };
    p = pathProgress(s, PATH);
    expect(p.done.slice(0, cp + 1).every(Boolean)).toBe(true);
    expect(p.frontier).toBe(cp + 1);
    expect(isUnlocked(cp + 1, p)).toBe(true);
  });
  it('lectures unlock independently, and passing lecture 1 does not touch lecture 2', () => {
    const l1 = SECTIONS.find((x) => x.courseId === 'terminology' && x.lecture === 1)!;
    const l2 = SECTIONS.find((x) => x.courseId === 'terminology' && x.lecture === 2)!;
    const n2 = unitNodes(l2.id);
    const n1 = unitNodes(l1.id);
    const s = empty();
    let p = pathProgress(s, PATH);
    expect(isUnlocked(n2[0].index, p)).toBe(true);
    expect(isUnlocked(n2[1].index, p)).toBe(false);
    const before = n2.map((n) => [p.done[n.index], isUnlocked(n.index, p)]);
    s.checkpoints[`${l1.id}:final`] = { passed: true, best: 1, at: 5 };
    p = pathProgress(s, PATH);
    expect(n1.every((n) => p.done[n.index])).toBe(true);
    expect(n2.map((n) => [p.done[n.index], isUnlocked(n.index, p)])).toEqual(before);
  });
  it('"continue" follows the most recently studied lecture', () => {
    const l1 = SECTIONS.find((x) => x.courseId === 'terminology' && x.lecture === 1)!;
    const l2 = SECTIONS.find((x) => x.courseId === 'terminology' && x.lecture === 2)!;
    const s = empty();
    expect(PATH[pathProgress(s, PATH).current].unit.id).toBe(l1.id);
    const lesson2 = unitNodes(l2.id).find((n) => n.kind === 'lesson')!;
    for (const t of lesson2.terms) {
      s.cards[t.id] = review(undefined, Rating.Good);
      s.stats[t.id] = { seen: 1, correct: 1, wrong: 0, lastSeen: 1000 };
    }
    for (const f of lesson2.facts) {
      s.cards[f.id] = review(undefined, Rating.Good);
      s.stats[f.id] = { seen: 1, correct: 1, wrong: 0, lastSeen: 1000 };
    }
    let p = pathProgress(s, PATH);
    expect(PATH[p.current].unit.id).toBe(l2.id);
    expect(p.done[p.current]).toBe(false);
    expect(isUnlocked(p.current, p)).toBe(true);
    // later activity in lecture 1 moves "continue" back
    const first1 = unitNodes(l1.id).find((n) => n.kind === 'lesson')!;
    const t0 = first1.terms[0] ?? first1.facts[0];
    s.stats[t0.id] = { seen: 1, correct: 1, wrong: 0, lastSeen: 2000 };
    p = pathProgress(s, PATH);
    expect(PATH[p.current].unit.id).toBe(l1.id);
    // a finished lecture is skipped
    s.checkpoints[`${l1.id}:final`] = { passed: true, best: 1, at: 3000 };
    p = pathProgress(s, PATH);
    expect(PATH[p.current].unit.id).toBe(l2.id);
  });
});

describe('exercises', () => {
  it('build tiles contain the answer plus decoys', () => {
    const t = termById.get('t:pericarditis') ?? terms.find((x) => (x.parts?.length ?? 0) >= 3)!;
    const tiles = buildTiles(t);
    for (const f of t.parts!) expect(tiles.map((x) => x.form)).toContain(f);
    expect(tiles.length).toBeGreaterThan(t.parts!.length);
  });
  it('distractors are different words with different meanings', () => {
    for (const t of terms.slice(0, 80)) {
      const d = distractorTerms(t);
      expect(d).toHaveLength(3);
      for (const x of d) {
        expect(x.id).not.toBe(t.id);
        expect(x.he).not.toBe(t.he);
      }
    }
  });
});

describe('session', () => {
  const lesson = PATH.find((n) => n.kind === 'lesson') as Extract<(typeof PATH)[number], { kind: 'lesson' }>;
  it('a lesson teaches every new word and tests each one', () => {
    const q = lessonExercises(lesson.terms, empty());
    for (const t of lesson.terms) {
      expect(q.some((e) => e.kind === 'teach-term' && e.term.id === t.id)).toBe(true);
      expect(q.some((e) => 'term' in e && e.kind !== 'teach-term' && e.term.id === t.id)).toBe(true);
    }
  });
  it('lessons stay lean: under 3 cards+questions per item (teach cards included), for every real lesson', () => {
    for (const n of pathOf('terminology')) {
      if (n.kind !== 'lesson') continue;
      const q = lessonExercises(n.terms, empty(), n.facts);
      expect(q.length, n.id).toBeLessThan(3 * (n.terms.length + n.facts.length));
    }
  });
  it('no word is asked about more than twice in its own lesson (match board counts once)', () => {
    for (const n of pathOf('terminology')) {
      if (n.kind !== 'lesson') continue;
      const asked = new Map<string, number>();
      for (const e of lessonExercises(n.terms, empty(), n.facts)) {
        const ids = e.kind === 'match' ? e.terms.map((t) => t.id) : 'term' in e && e.kind !== 'teach-term' && e.kind !== 'decode' ? [e.term.id] : [];
        ids.forEach((id) => asked.set(id, (asked.get(id) ?? 0) + 1));
      }
      for (const [id, c] of asked) expect(c, `${n.id} ${id}`).toBeLessThanOrEqual(2);
    }
  });
  it('tests ask about at most 15 (mid) or 20 (final) items, whole-lecture for the final', () => {
    for (const n of PATH.filter((x) => x.kind === 'checkpoint')) {
      if (n.kind !== 'checkpoint') continue;
      for (const jump of [false, true]) {
        const ids = new Set(checkpointSession(n, empty(), jump).queue.flatMap((e) => { const id = itemOf(e); return id ? [id] : []; }));
        const cap = n.last ? 20 : 15;
        // transfer ("decode") questions add up to a quarter more words on top of the sampled items
        expect(ids.size, n.id).toBeLessThanOrEqual(cap + Math.ceil(cap / 4));
        if (n.last) for (const id of ids) expect([...n.terms, ...n.facts].some((x) => x.id === id) || id.startsWith('t:')).toBe(true);
      }
    }
  });
  it('"learn new" takes a lesson-sized bite of the lecture', () => {
    const l = lectures[0];
    const q = lectureLearnSession(l, empty())!;
    const taught = q.queue.filter((e) => e.kind === 'teach-term' || e.kind === 'teach-fact').length;
    expect(taught).toBeLessThanOrEqual(Math.ceil((l.termList.length + l.factList.length) / lessonCountFor(l.termList.length + l.factList.length)));
    expect(taught).toBeGreaterThan(5);
  });
  it('re-queues a wrong answer in learn mode and only records the first attempt', () => {
    const t = lesson.terms[0];
    let s: Session = { kind: 'practice', title: '', mode: 'learn', queue: [mk.mcMeaning(t), mk.mcMeaning(lesson.terms[1])], index: 0, firstOutcome: {}, answers: [], startedAt: Date.now() };
    const r1 = answer(s, 'wrong');
    expect(r1.record).toEqual({ id: t.id, outcome: 'wrong' });
    expect(r1.session.queue.length).toBe(3);
    s = advance(r1.session);
    s = advance(answer(s, 'correct').session);
    const r3 = answer(s, 'correct'); // the retry
    expect(r3.record).toBeUndefined();
    s = advance(r3.session);
    expect(isFinished(s)).toBe(true);
    const sum = summarize(s);
    expect(sum.graded).toBe(2);
    expect(sum.correct).toBe(1);
    expect(sum.missed.map((m) => m.id)).toEqual([t.id]);
  });
  it('checkpoint tests do not re-queue and pass at 80%', () => {
    const cp = PATH.find((n) => n.kind === 'checkpoint') as Extract<(typeof PATH)[number], { kind: 'checkpoint' }>;
    let s = checkpointSession(cp, empty());
    const n = s.queue.length;
    let i = 0;
    while (!isFinished(s)) {
      const ex = s.queue[s.index];
      const isDecode = ex.kind === 'decode';
      s = advance(answer(s, isDecode || i++ % 10 !== 0 ? 'correct' : 'wrong').session);
    }
    expect(s.queue.length).toBe(n);
    const sum = summarize(s);
    expect(sum.passed).toBe(sum.score >= 0.8);
  });
});

describe('intro lessons and lectures', () => {
  it('lectures open the path; sections with concepts start with an intro node', () => {
    expect(SECTIONS[0].lecture).toBe(1);
    expect(PATH[0].unit.id).toBe(SECTIONS[0].id);
    for (const sec of SECTIONS) {
      const nodes = pathOf(sec.courseId).filter((n) => n.unit.id === sec.id);
      expect(nodes[0].kind === 'intro').toBe(!!sec.concepts?.length);
    }
    const intro = PATH.find((n) => n.kind === 'intro');
    if (!intro || intro.kind !== 'intro') return;
    const s = introSession(intro);
    const quizzes = s.queue.filter((e) => e.kind === 'quiz');
    expect(quizzes.length).toBe(intro.unit.quiz?.length ?? 0);
    for (const q of quizzes) {
      if (q.kind !== 'quiz') continue;
      expect(q.options[q.answer]).toBe(q.item.options[q.item.answer]);
    }
    // a wrong quiz answer comes back later in the session
    let cur = s;
    while (cur.queue[cur.index].kind !== 'quiz') cur = advance(cur);
    const before = cur.queue.length;
    expect(answer(cur, 'wrong').session.queue.length).toBe(before + 1);
  });
  it('lecture word and part lists resolve to real content', () => {
    for (const l of lectures) {
      expect(l.termList.length).toBe(l.words?.length ?? 0);
      expect(l.partList.length).toBe(l.parts?.length ?? 0);
    }
  });
});

describe('courses and slide facts', () => {
  const course = courseById.get('e2e-fixture')!;
  const path = pathOf(course.id);
  const fact = factById.get('f:e2e-facts/q1')!;
  it('each course has its own path, covering every fact once', () => {
    expect(path.length).toBeGreaterThan(0);
    expect(path.every((n) => n.unit.courseId === course.id)).toBe(true);
    const lessonFacts = path.flatMap((n) => (n.kind === 'lesson' ? n.facts.map((f) => f.id) : []));
    expect(new Set(lessonFacts)).toEqual(new Set(facts.filter((f) => f.courseId === course.id).map((f) => f.id)));
    expect(lessonFacts.length).toBe(new Set(lessonFacts).size);
  });
  it('courses progress independently and the chosen course is remembered', () => {
    const s = empty();
    for (const f of path[0].facts) s.cards[f.id] = review(undefined, Rating.Good);
    expect(pathProgress(s, path).done[0]).toBe(true);
    expect(pathProgress(s, PATH).current).toBe(0);
    expect(activeCourse(s).id).toBe('terminology');
    s.settings.course = course.id;
    expect(activeCourse(s).id).toBe(course.id);
    s.settings.course = 'deleted-course';
    expect(activeCourse(s).id).toBe('terminology');
  });
  it('the whole year is listed; a course waiting for slides is never shown and has an empty path', () => {
    for (const id of ['intro', 'upper-limb', 'spine-back-skull', 'head-face-neck']) expect(courseById.get(id), id).toBeTruthy();
    expect(liveCourses.every((c) => c.lectures.length)).toBe(true);
    const waiting = courses.find((c) => !c.lectures.length)!;
    expect(liveCourses).not.toContain(waiting);
    expect(pathOf(waiting.id)).toEqual([]);
    const s = empty();
    s.settings.course = waiting.id; // e.g. picked before empty courses were hidden
    expect(activeCourse(s).id).toBe('terminology');
    expect(pathProgress(s, pathOf(waiting.id)).current).toBe(0);
  });
  it('fact exercises: distractors never include the answer, and grading keys on the fact', () => {
    const d = factDistractors(fact);
    expect(d).toHaveLength(3);
    expect(d).not.toContain(fact.a);
    expect(new Set(d).size).toBe(3);
    const en = factById.get('f:e2e-facts/en')!;
    expect([...factDistractors(en)].sort()).toEqual(['check', 'exam', 'trial']); // its own `wrong` options come first
    for (const strength of [0, 1, 2, 3, 4, 5]) {
      const ex = exerciseForFact(fact, strength, () => 0.3);
      expect(itemOf(ex)).toBe(fact.id);
    }
    expect(itemOf(mk.teachFact(fact))).toBeNull();
    const tf = mk.tfFact(fact, () => 0.9);
    expect(tf.kind === 'tf-fact' && (tf.truth ? tf.shown === fact.a : tf.shown !== fact.a)).toBe(true);
  });
  it('a lesson teaches each fact before asking it', () => {
    const fs = path.find((n) => n.kind === 'lesson')!.facts;
    const q = lessonExercises([], empty(), fs);
    for (const f of fs) {
      const taught = q.findIndex((e) => e.kind === 'teach-fact' && e.fact.id === f.id);
      const asked = q.findIndex((e) => itemOf(e) === f.id);
      expect(taught).toBeGreaterThanOrEqual(0);
      expect(asked).toBeGreaterThan(taught);
    }
  });
  it('practice and due counts stay inside a course and ignore removed content', () => {
    const s = empty();
    const past = review(undefined, Rating.Again, new Date('2026-01-01'));
    s.cards[fact.id] = past;
    s.cards['t:removed-word'] = past; // progress from material that is no longer in the slides
    s.cards['f:gone/x'] = past;
    expect(dueCount(s)).toBe(1);
    expect(dueCount(s, course.id)).toBe(1);
    expect(dueCount(s, 'terminology')).toBe(0);
    const ps = practiceSession(s, 12, course.id)!;
    expect(ps.queue.every((e) => { const id = itemOf(e); return !id || id.startsWith('f:e2e-facts/'); })).toBe(true);
    expect(practiceSession(s, 12, 'terminology')).toBeNull();
  });
});

describe('sanitize (imports / corrupted storage)', () => {
  it('drops malformed entries instead of crashing', () => {
    const good = review(undefined, Rating.Good, new Date('2026-01-01'));
    const s = sanitize({
      version: 1,
      cards: { 't:cardiology': null, 't:gastritis': good, 't:x': { due: 'soon' } },
      stats: { a: null, b: { seen: 1, correct: 1, wrong: 0 } },
      days: { '2026-01-01': -5, '2026-01-02': 7 },
      xp: 'lots',
      settings: { dailyGoal: 99999, theme: 'purple', sound: 'yes' },
    })!;
    expect(Object.keys(s.cards)).toEqual(['t:gastritis']);
    expect(Object.keys(s.stats)).toEqual(['b']);
    expect(s.days).toEqual({ '2026-01-02': 7 });
    expect(sanitize({ version: 1, cards: {}, days: { bad: 5, '2026-01-02': 1 } })!.days).toEqual({ '2026-01-02': 1 });
    expect(s.xp).toBe(0);
    expect(s.settings.dailyGoal).toBe(200);
    expect(s.settings.theme).toBe('light');
    expect(s.settings.sound).toBe(true);
    expect(s.settings.course).toBe('');
    expect(sanitize({ version: 1, cards: {}, settings: { course: 'anatomy' } })!.settings.course).toBe('anatomy');
    expect(sanitize({ version: 1, cards: {}, settings: { course: '<script>' } })!.settings.course).toBe('');
    expect(sanitize({ version: 2, cards: {} })).toBeNull();
    expect(sanitize('nope')).toBeNull();
  });
});

describe('pronunciation', () => {
  it('reads abbreviations the way they are said aloud', () => {
    expect(speakable('b.i.d.')).toBe('B I D');
    expect(speakable('q.4.h.')).toBe('Q 4 H');
    expect(speakable('NPO')).toBe('N P O');
    expect(speakable('DDx')).toBe('D D X');
    expect(speakable('c̄')).toBe('c bar');
    expect(speakable('ad lib.')).toBe('ad lib');
    expect(speakable('tab.')).toBe('tab');
    expect(speakable('syr.')).toBe('syrup');
    expect(speakable('cardiomyopathy')).toBe('cardiomyopathy');
  });
  it('gives every term its own recording file', () => {
    const slugs = new Map<string, string>();
    for (const t of terms) {
      const s = audioSlug(t.word);
      expect(s).toMatch(/^[a-z0-9-]+$/);
      expect(slugs.get(s) ?? t.word).toBe(t.word);
      slugs.set(s, t.word);
    }
  });
});

describe('quiz meanings do not give the word away', () => {
  it('questions show the meaning without the Hebrew name', () => {
    const t = termById.get('t:hypoglycemia')!;
    expect(t.he).toContain('היפוגליקמיה');
    expect(t.meaning).toBe('סוכר נמוך בדם');
    expect(termById.get('t:hypertension')!.meaning).toBe('יתר לחץ דם'); // falls back to he
  });
  it('distractors are close: a heart attack is offered among heart words, not random organs', () => {
    const t = termById.get('t:myocardial infarction')!;
    const pool = terms.filter((x) => x.courseId === 'terminology');
    for (let i = 0; i < 10; i++) expect(distractorTerms(t, 3, pool).some((x) => x.meaning.includes('לב'))).toBe(true);
  });
  it('part distractors never overlap the target meaning (two right answers)', () => {
    for (const p of [...new Set(terms.flatMap((t) => t.partKeys))].slice(0, 60)) {
      const ex = mk.partMeaning(partByKey.get(p)!);
      if (ex.kind !== 'part-meaning') continue;
      // generic words ("מצב") and fragments ("ל-") don't make two answers mean the same; the app ignores them too
      const words = (x: string) => x.split(/[\s,()]+/).filter((w) => w.length > 1 && w !== 'מצב' && !w.endsWith('-'));
      for (const o of ex.options) if (o !== ex.part) expect(words(o.he).filter((w) => words(ex.part.he).includes(w)), `${p} / ${o.key}`).toEqual([]);
    }
  });
  it('distractors never share the target meaning (quadriplegia / tetraplegia)', () => {
    const t = termById.get('t:quadriplegia')!;
    for (let i = 0; i < 20; i++) expect(distractorTerms(t, 3, terms).map((x) => x.meaning)).not.toContain(t.meaning);
  });
});
