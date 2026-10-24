# Uttar Pradesh first: implementation plan

## Goal
Complete Uttar Pradesh coverage first, then roll the same repeatable workflow out to other states and union territories.

## Current verified baseline
- The PWA supports exam selection, mock-test UI, timer, scoring and question-bank loader.
- `question-banks/up-tgt.json` contains a 15-question bilingual authored-practice pilot. Its answer-key status is marked `needs_review`, so it is not production-verified and must not be represented as official PYQ.
- The exam catalogue contains many categories, but a catalogue entry is not proof of content availability.
- Official UPPSC previous-paper list: https://uppsc.up.nic.in/OuterPages/PreQuesPapers.aspx?ID=PrevQues
- Full source and per-exam status list: `docs/UP_EXAM_ROLLOUT_REGISTRY.md`.

## Phase A — Source and catalog (this change)
- Add a source directory for UPPSC, UPSSSC, UP Police Board, UPTET/UPJASE, UP D.El.Ed and UP B.Ed.
- Clearly label source links and state that a linked PDF is not yet extracted into the question bank.
- Maintain per-exam readiness statuses.

## Phase B — Exam-specific question banks
Build a separate bank for every exam/stage/subject/year. For each paper, extract the actual questions, preserve source references, verify answers against official keys, and record review status. Original/AI practice must be visibly distinct from official PYQ.

## Phase C — QA gates
Use the question-bank validator in GitHub Actions. Add content review, app smoke tests and checks that question count, selected exam, subject/year filters and result screens work correctly.

## Phase D — 10,000 questions per exam
Only count unique questions that pass schema and answer review. Do not pad with duplicate questions or label authored practice as PYQ. The UI should report actual counts, not the target.

## Phase E — Repeat for all states/UTs
After UP's source and content workflow is stable, apply the same source-first registry, bank, review and test process state by state.

## Status: quiz engine and smoke tests

- `quiz-engine.js` holds the DOM-free quiz rules (exam → category mapping, subject/year filters, duplicate removal, 10/50/100 eligibility, timer minutes, question selection, scoring). The UI in `app.js` and the tests both use it, and a future server-side attempt API can reuse it.
- Scoring uses a marking scheme. The default is still `+1 / 0 / 0`. Exam patterns or individual questions can set `marks` and `negativeMarks`. History entries now store `marks`, `maxMarks`, `scoringVersion` and `verified: false`, so local scores can be told apart from future server-verified ones.
- Submitting goes through a one-time guard, so the timer running out and a manual submit can't record the same attempt twice.
- Fixed: exams with "Police" in the name were matched as Banking because `/lic/` matched inside "Police". Short bank acronyms now have to match as whole words.
- `npm test` runs the smoke tests in `tests/`, and they run in CI through `.github/workflows/test.yml`.
