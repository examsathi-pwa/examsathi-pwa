// Pure, DOM-free quiz engine. Shared by the PWA UI and the Node smoke tests,
// and shaped so a future server-side attempt API can reuse the same scoring rules.

export const SCORING_VERSION = 'local-v1';

// Matches the current PWA behaviour: +1 correct, no negative marking.
// Exam-specific patterns should pass their own scheme instead of editing this default.
export const DEFAULT_MARKING = Object.freeze({ correct: 1, wrong: 0, unanswered: 0 });

const DEFAULT_SUBJECTS = Object.freeze({
  'UP TGT': 'Science',
  'SSC': 'General Awareness',
  'Railway': 'Mathematics',
  'UP Police': 'General Knowledge',
  'CTET': 'Child Development & Pedagogy',
  'Banking': 'Banking Awareness',
});

export function defaultSubject(category) {
  return DEFAULT_SUBJECTS[category] || 'General';
}

export function categoryForExam(examName, section) {
  const n = String(examName || '').toLowerCase();
  if (/ctet/.test(n)) return 'CTET';
  if (section === 'banking' || /bank|\b(ibps|sbi|rbi|nabard|lic|sebi|sidbi|niacl|uiic|gic)\b/.test(n)) return 'Banking';
  if (/railway|rrb|ntpc|group\s*d|alp|technician|paramedical/.test(n)) return 'Railway';
  if (/police|constable|sub.?inspector|\bsi\b|capf|agniveer|army|navy|coast guard|nda|cds|afcat/.test(n)) return 'UP Police';
  if (/tgt|pgt|teacher|tet|kvs|nvs|dsssb/.test(n)) return 'UP TGT';
  return 'SSC';
}

export function normalizeTestQuestions(test) {
  return (test?.questions || []).map(q => ({
    ...q,
    category: test.category,
    subject: q.subject || test.subject || defaultSubject(test.category),
    year: q.year || test.year || null,
    sourceTest: test.hi,
  }));
}

export function filterQuestions(questions, { subject = 'All', year = 'All' } = {}) {
  return questions.filter(q =>
    (subject === 'All' || q.subject === subject) &&
    (year === 'All' || String(q.year) === String(year)));
}

export function questionFingerprint(q) {
  const norm = s => String(s ?? '').normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();
  const options = (q?.optionsEn || q?.optionsHi || []).map(norm).join('|');
  return `${norm(q?.en || q?.hi)}::${options}`;
}

export function uniqueQuestions(questions) {
  const seen = new Set();
  return questions.filter(q => {
    const key = questionFingerprint(q);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// A 10/50/100 preset is only enabled when enough eligible unique questions exist (blueprint §7, §17).
export function countOptionState(requested, eligible) {
  const n = Number(requested);
  if (!(n > 0)) return { value: 0, enabled: eligible > 0, eligible };
  return { value: n, enabled: eligible >= n, eligible };
}

export function resolveQuestionCount(requested, eligible) {
  const n = Number(requested);
  if (!(n > 0) || n > eligible) return eligible;
  return n;
}

// Chosen minutes win; otherwise one minute per question (existing "auto" timing).
export function resolveMinutes(chosenMinutes, questionCount) {
  const m = Number(chosenMinutes);
  if (m > 0) return m;
  return Math.max(1, questionCount);
}

export function shuffle(items, random = Math.random) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function selectQuestions(questions, count, random = Math.random) {
  const pool = uniqueQuestions(questions);
  return shuffle(pool, random).slice(0, resolveQuestionCount(count, pool.length));
}

function markingFor(question, scheme) {
  return {
    correct: Number.isFinite(question?.marks) ? question.marks : scheme.correct,
    wrong: -Math.abs(Number.isFinite(question?.negativeMarks) ? question.negativeMarks : scheme.wrong),
    unanswered: scheme.unanswered,
  };
}

const round2 = n => Math.round(n * 100) / 100;

// Per-question awarded marks always sum to the reported score.
export function scoreAttempt(questions, answers, scheme = DEFAULT_MARKING) {
  const marking = { ...DEFAULT_MARKING, ...scheme };
  let correct = 0, wrong = 0, skipped = 0, score = 0, maxScore = 0;
  const perQuestion = questions.map((q, i) => {
    const m = markingFor(q, marking);
    const selected = answers?.[i] ?? null;
    maxScore += m.correct;
    let status, awarded;
    if (selected === null) { status = 'skipped'; awarded = m.unanswered; skipped++; }
    else if (selected === q.answer) { status = 'correct'; awarded = m.correct; correct++; }
    else { status = 'wrong'; awarded = m.wrong; wrong++; }
    score += awarded;
    return { index: i, selected, answer: q.answer, status, awarded: round2(awarded) };
  });
  const total = questions.length;
  const attempted = correct + wrong;
  return {
    scoringVersion: SCORING_VERSION,
    marking,
    total, correct, wrong, skipped, attempted,
    score: round2(score),
    maxScore: round2(maxScore),
    pct: total ? Math.round(correct / total * 100) : 0,
    accuracy: attempted ? Math.round(correct / attempted * 100) : 0,
    perQuestion,
  };
}

// Guards submit so timer expiry and a manual submit can never record the same attempt twice.
export function once(fn) {
  let done = false;
  return (...args) => {
    if (done) return undefined;
    done = true;
    return fn(...args);
  };
}
