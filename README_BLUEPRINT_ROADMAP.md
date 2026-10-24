# Blueprint-aligned implementation notes

Reference: [Implementation Blueprint](https://github.com/examsathi-pwa/examsathi-pwa/blob/docs/examsathi-implementation-blueprint/docs/IMPLEMENTATION_BLUEPRINT.md)

## Current milestone
- Preserve the lightweight vanilla-JavaScript PWA and existing mock-test flow.
- Keep catalogue-only exams distinct from exams that actually have question-bank content.
- Keep official previous-year-paper links distinct from model practice questions.
- Improve exam category mapping and clear stale subject/year filters after a selection changes.
- Refresh the service-worker cache after app changes.

## Current limitations
- The present static PWA still uses browser-local demo questions and result history.
- A server API, database-backed attempts, protected admin publishing, verified payment entitlements and server-side AI are not implemented yet.
- TGT/PGT subject catalogue visibility does not mean every subject already has a question bank.
- 10/50/100-question tests must use only the eligible unique questions actually available.

## Next phases
1. Add smoke tests for exam switching, language changes, question count, timer expiry and result totals.
2. Normalize exam-catalogue metadata; mark records as catalogue-only until official sources are verified.
3. Expand a reviewed starter question bank for UP TGT/PGT, CTET, UP Police, SSC and Railway.
4. Add a source registry and PYQ metadata before any year-wise paper is labeled verified.
5. Decide the backend/database/auth stack before server-backed attempts or admin tools.
