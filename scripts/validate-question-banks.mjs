import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dir = path.join(root, 'question-banks');
const files = fs.readdirSync(dir).filter((name) => name.endsWith('.json') && !name.startsWith('_'));
let errors = 0;
let total = 0;
const seenIds = new Set();
const seenPrompts = new Map();

function fail(file, where, message) {
  console.error(`FAIL ${file} ${where}: ${message}`);
  errors++;
}

for (const file of files) {
  let bank;
  try {
    bank = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
  } catch (error) {
    fail(file, '$', `invalid JSON: ${error.message}`);
    continue;
  }
  if (!bank.examName || !Array.isArray(bank.tests) || !bank.tests.length) {
    fail(file, '$', 'examName and non-empty tests[] are required');
    continue;
  }
  let bankCount = 0;
  for (const [ti, test] of bank.tests.entries()) {
    const where = `tests[${ti}]`;
    if (!Array.isArray(test.questions) || !test.questions.length) {
      fail(file, where, 'questions[] must not be empty');
      continue;
    }
    for (const [qi, q] of test.questions.entries()) {
      total++;
      bankCount++;
      const at = `${where}.questions[${qi}]`;
      const prompt = String(q.hi || q.en || '').trim();
      const optionsHi = Array.isArray(q.optionsHi) ? q.optionsHi : [];
      const optionsEn = Array.isArray(q.optionsEn) ? q.optionsEn : [];
      const options = optionsHi.length ? optionsHi : optionsEn;
      if (!q.hi && !q.en) fail(file, at, 'Hindi or English question text required');
      if (options.length !== 4) fail(file, at, 'exactly four answer options required');
      if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= options.length) fail(file, at, 'answer must be a valid zero-based option index');
      if (!q.whyHi && !q.whyEn) fail(file, at, 'Hindi or English explanation required');
      if (!q.subject || !q.topic) fail(file, at, 'subject and topic required');
      if (!q.provenance?.kind || !q.provenance?.questionId) fail(file, at, 'provenance.kind and provenance.questionId required');
      if (q.provenance?.answerKeyStatus !== 'verified') {
        console.warn(`REVIEW ${file} ${at}: answerKeyStatus is ${q.provenance?.answerKeyStatus || 'unset'}`);
      }
      const id = q.provenance?.questionId;
      if (id && seenIds.has(id)) fail(file, at, `duplicate questionId: ${id}`);
      if (id) seenIds.add(id);
      const key = prompt.toLocaleLowerCase().replace(/\s+/g, ' ').trim();
      if (key && seenPrompts.has(key)) fail(file, at, `duplicate prompt also in ${seenPrompts.get(key)}`);
      if (key) seenPrompts.set(key, `${file} ${at}`);
    }
  }
  console.log(`OK ${file}: ${bankCount} questions (target ${bank.targetQuestions || 'not set'})`);
}
console.log(`Validated ${files.length} banks / ${total} questions; errors: ${errors}`);
if (errors) process.exitCode = 1;
