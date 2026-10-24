# ExamSathi Question Data Implementation Plan

## Goal
Build toward 10,000 unique, validated questions for each listed exam. The target is a backlog goal, not a claim that every bank already contains 10,000 questions.

## Phase 1 — Audit and safe loading
- Count question records per existing test and exam.
- Keep each exam's dedicated bank separate; never silently substitute another exam's questions.
- Validate required text, four options, answer index, explanation, subject/topic and provenance.
- Display actual available counts and clearly label demo/practice content.

## Phase 2 — Pilot bank
- Start with UP TGT Science because the current app already includes this exam.
- Publish original practice questions in topic batches, starting with a small reviewable batch.
- Mark all authored questions as authored practice; do not label them as official PYQs.
- Check correctness, duplicates, language fields and answer indices before merging.

## Phase 3 — Content pipeline
- Use the JSON format in question-banks/_template.json.
- Maintain source URL/title and reuse status for sourced content; use original provenance for newly authored questions.
- Add batch-level validation and duplicate detection before publication.
- Track progress per exam: validated count, target 10,000, subject/topic coverage, source type and review status.

## Phase 4 — App integration and QA
- Confirm the selected exam loads only its own bank.
- Test language toggle, subject/year filters, 10/50/100-question selection, timer, scoring and review.
- Test missing/invalid bank behavior and service-worker cache refresh.
- Run the deployed PWA on desktop and mobile after each merge.

## Phase 5 — Scale across India
- Expand by priority: Central/SSC, Railway, Banking, Teaching, then state/UT recruitment exams.
- Create a separate file per exact exam name/slug; do not share a generic bank as if it were exam-specific.
- Publish in reviewed batches until each bank reaches 10,000 unique validated questions.
- Show progress honestly; no bank is marked complete until its validated unique count reaches 10,000.

## Acceptance criteria
- No cross-exam question leakage.
- Every published question has an answer, explanation, subject/topic and provenance.
- Duplicate and schema checks pass.
- UI shows actual count and test length never exceeds available questions.
- Official PYQ and original/AI-assisted practice are visibly distinguished.
