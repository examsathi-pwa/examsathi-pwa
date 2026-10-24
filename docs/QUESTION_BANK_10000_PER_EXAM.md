# ExamSathi: 10,000 Questions per Exam — Data Policy

## Product rule
Target a minimum of 10,000 distinct, validated practice questions for every exam in the catalogue. The target is per exam, not one shared pool reused across unrelated exams. A bank may be released in batches; never display the target as achieved until the count is actually met.

## What counts toward the target
- Official previous-year questions (PYQ), only when the paper/source is traceable and reuse is allowed.
- Independently authored or AI-assisted practice questions, clearly labelled as practice and not as PYQ.
- Exam-pattern mock questions, clearly labelled as mock.
- Translated variants count as the same underlying question unless they test a genuinely different concept.
- Exact duplicates, near-duplicates, invalid answers, and questions with unsupported answer keys do not count.

## Syllabus rule
1. If the official syllabus is available, map questions to it first.
2. If the syllabus is unavailable, use a clearly labelled provisional topic map based on the exam's official notification and relevant subject standards; record the source and review status.
3. If practice beyond the syllabus is desired, keep it in a separate `beyond_syllabus` section. Never mix it into a syllabus-only mock without a visible setting/label.
4. Do not invent official syllabus coverage or describe an out-of-syllabus question as exam-relevant without evidence.

## Minimum metadata per question
- stable ID; exam ID; language; subject; topic; difficulty
- question text; options (when MCQ); correct answer; explanation
- origin type: `official_pyq`, `authored_practice`, `ai_practice_reviewed`, `mock`
- source URL/title and year/shift/paper for PYQs
- answer-key status, reviewer status, rights/reuse status
- syllabus mapping status and whether in-syllabus or beyond-syllabus

## Quality gates
- Validate answer index and required fields.
- Deduplicate exact and semantic duplicates.
- Verify facts, calculations, units, language and explanations.
- For AI-generated content, require automated checks plus human review before marking reviewed.
- Questions whose correct answer is uncertain remain quarantined and are not published.
- Do not generate thousands of questions by copying/rephrasing a tiny seed set or by cycling the same questions.

## Batch plan
1. Build the complete exam catalogue and stable exam IDs.
2. Create an official source/status registry for each exam.
3. Start with 500 reviewed questions per exam family as a pilot; verify the importer, deduplication and review workflow.
4. Scale in controlled batches (e.g. 500–1,000 per subject/topic) toward 10,000 distinct questions per exam.
5. Publish the real count and reviewed count on each exam page. Show an empty/partial-bank state honestly.
6. Add automated checks that fail a release when an exam bank claims 10,000 but has fewer than 10,000 unique, valid records.

## Implementation note
Do not place a fabricated 10,000-question array in the frontend source. Store versioned question-bank files or database records and load only the selected exam's bank. Keep demo data isolated from exam-specific banks. The catalogue name alone must never make a question eligible for a test.
