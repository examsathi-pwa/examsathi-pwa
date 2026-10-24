import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  categoryForExam, normalizeTestQuestions, filterQuestions, uniqueQuestions,
  countOptionState, resolveQuestionCount, resolveMinutes, selectQuestions,
  scoreAttempt, once, DEFAULT_MARKING,
} from '../quiz-engine.js';
import { tests as demoTests } from '../data.js';

const q = (id, answer = 0, extra = {}) => ({
  hi: `प्रश्न ${id}`, en: `Question ${id}`,
  optionsHi: ['क', 'ख', 'ग', 'घ'], optionsEn: ['A', 'B', 'C', 'D'],
  answer, ...extra,
});
const seeded = (seed = 42) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

test('exam switching maps exams to the right demo category', () => {
  assert.equal(categoryForExam('CTET Paper 1', 'central'), 'CTET');
  assert.equal(categoryForExam('IBPS PO', 'banking'), 'Banking');
  assert.equal(categoryForExam('Anything', 'banking'), 'Banking');
  assert.equal(categoryForExam('RRB NTPC', 'central'), 'Railway');
  assert.equal(categoryForExam('UP Police Constable', 'state'), 'UP Police');
  assert.equal(categoryForExam('UP TGT', 'state'), 'UP TGT');
  assert.equal(categoryForExam('UP PGT', 'state'), 'UP TGT');
  assert.equal(categoryForExam('SSC CGL', 'central'), 'SSC');
});

test('normalized questions inherit subject/year from their test', () => {
  const [a, b] = normalizeTestQuestions({ category: 'SSC', hi: 'टेस्ट', year: 2023, questions: [q(1), q(2, 0, { subject: 'Maths', year: 2021 })] });
  assert.equal(a.subject, 'General Awareness');
  assert.equal(a.year, 2023);
  assert.equal(b.subject, 'Maths');
  assert.equal(b.year, 2021);
});

test('subject and year filters combine', () => {
  const qs = [q(1, 0, { subject: 'Hindi', year: 2022 }), q(2, 0, { subject: 'Hindi', year: 2023 }), q(3, 0, { subject: 'Science', year: 2022 })];
  assert.equal(filterQuestions(qs).length, 3);
  assert.equal(filterQuestions(qs, { subject: 'Hindi' }).length, 2);
  assert.equal(filterQuestions(qs, { subject: 'Hindi', year: '2022' }).length, 1);
});

test('duplicate questions are removed before counting or selecting', () => {
  const qs = [q(1), { ...q(1), hi: 'अलग अनुवाद' }, q(2), q(3)];
  assert.equal(uniqueQuestions(qs).length, 3);
  const picked = selectQuestions(qs, 0, seeded());
  assert.equal(new Set(picked.map(x => x.en)).size, picked.length);
});

test('10/50/100 presets only enable with enough eligible unique questions', () => {
  assert.deepEqual(countOptionState(10, 9), { value: 10, enabled: false, eligible: 9 });
  assert.equal(countOptionState(10, 10).enabled, true);
  assert.equal(countOptionState(50, 49).enabled, false);
  assert.equal(countOptionState(100, 100).enabled, true);
  assert.equal(countOptionState(0, 0).enabled, false);
  assert.equal(countOptionState(0, 3).enabled, true);
});

test('question count never exceeds what is available', () => {
  assert.equal(resolveQuestionCount(0, 7), 7);
  assert.equal(resolveQuestionCount(10, 7), 7);
  assert.equal(resolveQuestionCount(10, 40), 10);
  const pool = Array.from({ length: 60 }, (_, i) => q(i));
  assert.equal(selectQuestions(pool, 50, seeded()).length, 50);
  assert.equal(selectQuestions(pool, 100, seeded()).length, 60);
});

test('timer uses chosen minutes or one minute per question', () => {
  assert.equal(resolveMinutes('0', 10), 10);
  assert.equal(resolveMinutes('', 0), 1);
  assert.equal(resolveMinutes('30', 100), 30);
});

test('timer expiry and manual submit only record once', () => {
  let calls = 0;
  const submit = once(() => ++calls);
  submit(true);
  submit(false);
  submit(true);
  assert.equal(calls, 1);
});

test('default scoring keeps current behaviour (+1, no negative)', () => {
  const qs = [q(1, 0), q(2, 1), q(3, 2), q(4, 3)];
  const r = scoreAttempt(qs, [0, 0, null, 3]);
  assert.deepEqual([r.correct, r.wrong, r.skipped], [2, 1, 1]);
  assert.equal(r.score, 2);
  assert.equal(r.maxScore, 4);
  assert.equal(r.pct, 50);
  assert.equal(r.accuracy, 67);
  assert.deepEqual(r.marking, DEFAULT_MARKING);
});

test('negative marking is configurable per scheme and per question', () => {
  const qs = [q(1, 0), q(2, 1), q(3, 2), q(4, 3, { marks: 2, negativeMarks: 0.5 })];
  const r = scoreAttempt(qs, [0, 0, null, 1], { correct: 1, wrong: 0.25, unanswered: 0 });
  assert.equal(r.score, 1 - 0.25 - 0.5);
  assert.equal(r.maxScore, 5);
  assert.deepEqual(r.perQuestion.map(p => p.status), ['correct', 'wrong', 'skipped', 'wrong']);
});

test('result totals equal the sum of per-question scores', () => {
  const random = seeded(7);
  for (let run = 0; run < 25; run++) {
    const qs = Array.from({ length: 30 }, (_, i) => q(i, Math.floor(random() * 4)));
    const answers = qs.map(() => (random() < 0.2 ? null : Math.floor(random() * 4)));
    const r = scoreAttempt(qs, answers, { correct: 2, wrong: 0.66, unanswered: 0 });
    const sum = Math.round(r.perQuestion.reduce((s, p) => s + p.awarded, 0) * 100) / 100;
    assert.equal(r.score, sum);
    assert.equal(r.correct + r.wrong + r.skipped, r.total);
  }
});

test('every bundled demo question has a valid answer index', () => {
  for (const t of demoTests) {
    for (const item of t.questions || []) {
      const opts = item.optionsEn || item.optionsHi;
      assert.ok(Array.isArray(opts) && opts.length >= 2, `${t.id}: options missing`);
      assert.ok(Number.isInteger(item.answer) && item.answer >= 0 && item.answer < opts.length, `${t.id}: bad answer for "${item.en}"`);
    }
  }
});

test('service worker precaches the quiz engine', () => {
  const sw = fs.readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
  assert.match(sw, /'\.\/quiz-engine\.js'/);
});
