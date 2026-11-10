import { categories, tests } from '../data.js';

let errors = 0;
let totalQuestions = 0;
const ids = new Set();

function fail(where, message) {
  console.error(`FAIL ${where}: ${message}`);
  errors++;
}

if (!Array.isArray(categories) || categories.length === 0) {
  fail('categories', 'expected a non-empty category array');
}
if (!Array.isArray(tests) || tests.length === 0) {
  fail('tests', 'expected a non-empty test array');
  process.exit(1);
}

for (const [ti, test] of tests.entries()) {
  const where = `tests[${ti}]`;
  if (!test.id || typeof test.id !== 'string') fail(where, 'test id is required');
  else if (ids.has(test.id)) fail(where, `duplicate test id: ${test.id}`);
  else ids.add(test.id);

  if (!test.category) fail(where, 'category is required');
  if (!Array.isArray(test.questions)) {
    fail(where, 'questions must be an array');
    continue;
  }
  if (!test.paid && test.questions.length === 0) {
    fail(where, 'free test must contain at least one question');
  }

  for (const [qi, q] of test.questions.entries()) {
    totalQuestions++;
    const at = `${where}.questions[${qi}]`;
    if (!q.hi && !q.en) fail(at, 'Hindi or English question text is required');

    const hi = Array.isArray(q.optionsHi) ? q.optionsHi : [];
    const en = Array.isArray(q.optionsEn) ? q.optionsEn : [];
    const options = hi.length ? hi : en;
    if (options.length !== 4) fail(at, 'exactly four answer options are required');
    if (hi.length && hi.length !== 4) fail(at, 'optionsHi must contain exactly four options');
    if (en.length && en.length !== 4) fail(at, 'optionsEn must contain exactly four options');
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) {
      fail(at, 'answer must be a zero-based option index from 0 to 3');
    }
    if (!q.whyHi && !q.whyEn) fail(at, 'Hindi or English explanation is required');
  }
}

console.log(`Validated ${categories.length} categories, ${tests.length} tests and ${totalQuestions} app questions; errors: ${errors}`);
if (errors) process.exitCode = 1;
