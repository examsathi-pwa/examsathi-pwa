import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dir = path.join(root, 'question-banks');
const files = fs.readdirSync(dir).filter((name) => name.endsWith('.json') && !name.startsWith('_'));
let errors = 0;
let total = 0;
const seenIds = new Set();

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
  const examName = bank.examName || bank.exam;
  if (!examName || !Array.isArray(bank.tests) || !bank.tests.length) {
    fail(file, '$', 'examName (or exam) and non-empty tests[] are required');
    continue;
  }
  let bankCount = 0;
  for (const [ti, test] of bank.tests.entries()) {
    const where = `tests[${ti}]`;
    if (!Array.isArray(test.questions) || !test.questions.length) {
      fail(file, where, 'questions[] must not be empty');
      continue;
    }
    const promptsInThisTest = new Set();
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
      if (!q.provenance?.kind) fail(file, at, 'provenance.kind required');
      if (bank.qualityStandardVersion && !q.provenance?.questionId) fail(file, at, 'provenance.questionId required by quality standard');
      if (q.provenance?.questionId) {
        if (seenIds.has(q.provenance.questionId)) fail(file, at, `duplicate questionId: ${q.provenance.questionId}`);
        seenIds.add(q.provenance.questionId);
      } else {
        console.warn(`REVIEW ${file} ${at}: stable questionId not yet migrated`);
      }
      if (bank.qualityStandardVersion && !['easy', 'moderate', 'hard'].includes(q.difficulty)) {
        fail(file, at, 'difficulty must be easy, moderate or hard under the quality standard');
      } else if (!q.difficulty) {
        console.warn(`REVIEW ${file} ${at}: difficulty tag not yet migrated`);
      }
      if (q.provenance?.answerKeyStatus !== 'verified') {
        console.warn(`REVIEW ${file} ${at}: answerKeyStatus is ${q.provenance?.answerKeyStatus || 'unset'}`);
      }
      const key = prompt.toLocaleLowerCase().replace(/\s+/g, ' ').trim();
      if (key && promptsInThisTest.has(key)) fail(file, at, 'duplicate prompt inside the same test');
      if (key) promptsInThisTest.add(key);
    }
  }
  console.log(`OK ${file}: ${bankCount} questions (target ${bank.targetQuestions || 'not set'})`);
}
console.log(`Validated ${files.length} banks / ${total} questions; errors: ${errors}`);
if (errors) process.exitCode = 1;
