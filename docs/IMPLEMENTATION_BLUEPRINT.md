# ExamSathi — Complete Implementation Blueprint
Version: 1.0  
Target repository: `examsathi-pwa/examsathi-pwa`  
Strategy: Preserve the existing lightweight PWA, migrate incrementally, and add a secure backend before enabling cloud sync, AI, admin publishing, or payments.

## 1. Product vision
ExamSathi is a bilingual (Hindi/English) exam-preparation platform for:
- State government exams: all 28 states and 8 union territories, with exam families maintained as a catalogue.
- Central government: UPSC, SSC, Railways/RRB, Defence, central departments and other verified recruitment bodies.
- Banking/finance/insurance: SBI, IBPS, RBI, NABARD, LIC and other relevant exams.
- Teaching: CTET, state TETs, TGT/PGT/PRT, KVS/NVS and state recruitment boards.
- Shared learning tools: mock tests, full-length mocks, test series, verified previous-year papers, notes, e-library, AI doubt solver, AI-generated practice content, progress analytics, bookmarks and notifications.

Important product rule: a catalogue entry is not proof that a vacancy is currently open or that question content exists. Store exam identity, official recruiting body, source links, last verification date, and content status separately.

## 2. Existing repository baseline
The current repository is a static, vanilla-JavaScript PWA:
- `index.html`, `style.css`, `app.js`, `data.js`, `exam-catalog.js`, `firebase-config.js`, `manifest.webmanifest`, service worker and static assets.
- Mock-test questions are imported from `data.js`; exam catalogues are in `exam-catalog.js`.
- Test history is currently browser-local; OTP needs Firebase configuration.
- Premium test access, secure payments, protected admin publishing, cloud database and AI backend are not yet production implementations.
- The catalogue includes broad placeholders and only a small sample question bank. Do not label placeholders as verified live exams or actual PYQs.

Migration principle: do not rewrite the PWA in one large change. Preserve current working UI and quiz flow while extracting reusable modules and adding backend capability behind feature flags.

## 3. Navigation / information architecture
Primary navigation:
1. Home / Dashboard
2. Explore Exams
   - State/UT → recruiting body → exam → post/subject → syllabus
   - Central → exam family → exam
   - Banking & Insurance → institution → exam
   - Teaching → CTET/TET/TGT/PGT/PRT/KVS/NVS and state boards
3. Mock Tests
   - Quick practice (10 questions)
   - Mini mock (50 questions)
   - Full mock (100 or official exam length)
   - Subject/topic test
   - Previous-year paper mode
4. Test Series
   - Free sample series, premium series, scheduled series, full-length series
5. Study Notes
   - Exam → subject → topic → notes, revision sheet, downloadable PDF
6. Previous Year Papers
   - Exam → year → shift/paper → source/answer key/solution
7. E-Library
   - Books, official/public-domain material, licensed resources, saved items
8. AI Study
   - Doubt solver, image question solver, notes summarizer, quiz generator, study planner
9. My Learning
   - Attempts, scores, bookmarks, weak topics, downloads and plan
10. Admin / Content Operations (role-protected; never visible as a public control)

Mobile bottom navigation should prioritize Home, Exams, Practice, Library and My Learning. Admin should be a separate protected route.

## 4. Exam catalogue model
Use data-driven catalogue records, not hard-coded exam-specific UI logic.

Exam fields:
- id, slug, canonical_name, aliases, category (state/central/banking/teaching/insurance/defence/other)
- country, state_or_ut_code (nullable), recruiting_body, exam_level
- official_homepage_url, official_notification_url, official_syllabus_url, official_previous_papers_url
- languages[], status (catalogue_only/upcoming/open/closed/archived/needs_verification)
- last_verified_at, verified_by, notes, created_at, updated_at

Maintain separate entities for recruiting bodies, exam cycles, posts, subjects, syllabus units, paper patterns and question sets. An exam catalogue page may exist even if no mock is published; display a clear empty state rather than starting an empty test.

## 5. Recommended architecture
Keep the PWA frontend. Add a backend API and database; avoid putting privileged credentials in browser code.

Frontend:
- Existing vanilla JS PWA initially; gradually split `app.js` into modules: API client, catalogue, quiz engine, results, auth, library, AI UI.
- Bilingual UI, responsive layout, accessible controls, offline shell caching.
- Do not cache private API responses or premium content in the service worker by default.

Backend:
- HTTPS API (for example Node.js/TypeScript or a managed backend's server functions).
- PostgreSQL recommended for relational exam/question/test data; managed auth may use Firebase Auth or equivalent.
- Object storage for PDFs/images, with private signed URLs where required.
- Background worker for AI content generation, PDF processing, moderation and notifications.
- AI provider called only from server-side code; secret API keys must never be shipped to the PWA.
- Payments, entitlements, leaderboard scores and admin authorization must be verified server-side.

Suggested services:
- Auth & profile
- Exam catalogue
- Content/question bank
- Test assembly and attempt engine
- Result/analytics
- Notes and document library
- AI orchestration
- Subscription/entitlements
- Admin audit & moderation
- Notification delivery

## 6. Database schema (logical model)
Use UUID primary keys, UTC timestamps, foreign keys, indexes and soft-archive fields where appropriate.

### Core catalogue
- `users(id, auth_provider_uid, display_name, email, phone_e164, preferred_language, created_at, updated_at)`
- `user_roles(user_id, role, granted_by, created_at)` — roles: learner, editor, reviewer, admin, super_admin.
- `states(id, code, name_en, name_hi, region_type)` — 28 states + 8 UT records.
- `recruiting_bodies(id, name, acronym, official_url, state_id nullable)`
- `exams(id, slug, canonical_name, name_hi, name_en, category, state_id nullable, body_id, level, status, official_urls_json, last_verified_at, created_at, updated_at)`
- `exam_cycles(id, exam_id, cycle_label, notification_url, syllabus_url, start_date nullable, end_date nullable, status, verified_at)`
- `subjects(id, slug, name_hi, name_en)`
- `topics(id, subject_id, parent_topic_id nullable, name_hi, name_en, syllabus_reference)`
- `exam_subjects(exam_id, subject_id, cycle_id nullable, weightage nullable)`
- `exam_patterns(id, exam_id, cycle_id nullable, question_count, duration_seconds, marks_correct, marks_wrong, marks_unanswered, sections_json, effective_from, source_url, verified_at)`

### Questions and assessment
- `questions(id, exam_id nullable, subject_id, topic_id nullable, language, question_type, stem, options_json, answer_key_json, explanation, difficulty, marks, negative_marks, origin_type, source_url nullable, source_title nullable, source_year nullable, source_paper nullable, license_status, ai_generated, verification_status, reviewer_id nullable, duplicate_fingerprint, created_by, created_at, updated_at)`
- `question_translations(question_id, language, stem, options_json, explanation)`
- `question_tags(question_id, tag)`
- `test_templates(id, exam_id, title, access_tier, mode, duration_seconds, question_count, marking_scheme_json, selection_rules_json, published_at, status, version)`
- `test_template_questions(template_id, question_id, position nullable, section_key nullable)`
- `test_series(id, exam_id, title, description, access_tier, start_at nullable, end_at nullable, status)`
- `test_series_items(series_id, template_id, position, unlock_at nullable)`
- `test_attempts(id, user_id, template_id, status, started_at, submitted_at, expires_at, time_spent_seconds, score, max_score, correct_count, wrong_count, skipped_count, answer_snapshot_json, scoring_version)`
- `attempt_answers(id, attempt_id, question_id, selected_answer_json, is_correct, awarded_marks, time_spent_seconds, marked_for_review, answered_at)`
- `result_analytics(id, attempt_id, subject_id nullable, topic_id nullable, accuracy, time_spent_seconds, score)`
- `bookmarks(id, user_id, item_type, item_id, created_at)`
- `question_reports(id, user_id, question_id, reason, details, status, resolved_by nullable, resolved_at nullable)`

### Notes, library and AI
- `learning_resources(id, title, title_hi, resource_type, exam_id nullable, subject_id nullable, topic_id nullable, language, access_tier, storage_key nullable, external_url nullable, license_status, source_url, status, published_at, version)`
- `resource_versions(id, resource_id, version, storage_key, change_summary, created_by, created_at)`
- `ai_jobs(id, user_id nullable, job_type, input_reference_json, model_name, prompt_version, status, usage_json, error_code nullable, created_at, completed_at)`
- `ai_doubts(id, user_id, question_text, image_storage_key nullable, answer_text, citations_json, safety_flags_json, feedback_rating nullable, created_at)`
- `ai_content_drafts(id, job_id, exam_id nullable, subject_id nullable, topic_id nullable, draft_type, payload_json, source_references_json, validation_json, status, reviewer_id nullable, published_resource_id nullable, created_at, reviewed_at nullable)`
- `study_plans(id, user_id, exam_id, target_date nullable, plan_json, created_at, updated_at)`
- `user_topic_progress(user_id, topic_id, mastery_score, attempts_count, last_practiced_at, updated_at)`

### Freemium, billing and operations
- `plans(id, code, name, price_minor_units, currency, billing_period, feature_limits_json, active)`
- `subscriptions(id, user_id, plan_id, provider, provider_subscription_id, status, current_period_start, current_period_end, cancel_at_period_end)`
- `payments(id, user_id, provider, provider_payment_id, amount_minor_units, currency, status, receipt_reference, created_at)`
- `entitlements(id, user_id, feature_code, source_type, source_id, starts_at, ends_at, status)`
- `usage_events(id, user_id nullable, feature_code, units, cost_estimate, created_at)`
- `notifications(id, user_id nullable, type, title, body, target_url, scheduled_at, sent_at, status)`
- `admin_audit_logs(id, actor_user_id, action, entity_type, entity_id, before_json, after_json, created_at)`
- `source_registry(id, source_name, official_url, source_type, terms_url, allowed_use, checked_at, notes)`

Add indexes for exam/category/status, question exam+subject+topic+verification status, source/year, test attempt user+date, and unique duplicate fingerprints. Define retention and deletion policies for personal data.

## 7. Mock Test Engine rules
- Use exam pattern records, not one global time/marking rule.
- Support 10/50/100 questions only when enough eligible unique questions exist; otherwise show the available count and a clear explanation.
- Official full mocks use the verified pattern and cycle. Store the pattern/scoring version on each attempt so historic results remain reproducible.
- Question selection filters by exam, cycle, subject, topic, language, difficulty, verification status, license permission and access tier.
- Start an attempt on the server for logged-in users; save periodic answer snapshots; validate final submission on the server.
- Persist selected answer, review flag and elapsed time per question. Auto-submit at expiry, with idempotent submit handling.
- Score according to each question/test's configured positive, negative and unanswered marks. Do not hard-code negative marking.
- Results: score, maximum score, correct/wrong/skipped, accuracy, time spent, subject/topic breakdown, explanations and retry actions.
- Prevent duplicate questions within an attempt; randomize options only when answer mapping can be safely preserved.
- Offline demo tests may remain local, but clearly label them as local practice and do not treat local scores as verified rankings.

## 8. AI-generated content pipeline
AI may draft notes, practice MCQs, explanations, summaries and study plans. AI output must not be published automatically.

Pipeline:
1. Admin/editor selects exam, cycle, subject, topic, language, difficulty, count and allowed source material.
2. Retrieve approved syllabus and permitted reference documents; record URLs, titles, dates and page/section references.
3. Generate structured JSON against a strict schema.
4. Validate required fields, option count, answer index, language, marks, citations, duplicate fingerprint and syllabus mapping.
5. Run deterministic checks and a second-pass critique; flag uncertain, time-sensitive or disputed answers.
6. Create draft in review queue; reviewer checks correctness and source evidence.
7. Publish only after reviewer approval; retain prompt/model/version and source metadata.
8. Support user reports, unpublish/rollback, version history and correction notices.

AI content labels:
- AI draft (not published)
- Reviewed practice question
- Verified official PYQ (only with source evidence and rights to reproduce)
- Model practice paper (never mislabel as actual PYQ)

AI must not invent an official source, year, shift or answer key. If source evidence is missing, publish as original practice content only after review. Avoid copying entire copyrighted books or papers without permission; use official links where redistribution is not permitted.

## 9. AI Doubt Solver
- Inputs: typed question, optional image, language, exam/subject context.
- OCR/image parsing extracts text and options; show extracted text for correction when confidence is low.
- Answer with steps, final answer, concept explanation and related practice questions.
- Use approved notes/syllabus resources as retrieval context; cite source titles/pages/links when available.
- If evidence is insufficient, say so and ask a clarifying question rather than guessing.
- Add rate limits, daily quotas by plan, abuse protection, token/cost logging, feedback and escalation/reporting.
- Do not expose internal prompts, API keys or other users' conversations. Define data retention and consent before production.

## 10. Study Notes and E-Library
Resource types: short notes, detailed notes, formula sheets, revision sheets, flashcards, chapter quizzes, PDFs, books and official reference links.
- Metadata: exam, cycle, subject, topic, language, source, author/reviewer, license, version, access tier, file size and publication date.
- Search by exam/subject/topic/year/language; filter free/premium.
- Use secure storage and signed URLs for protected resources. Do not assume public web PDFs are free to redistribute.
- Allow bookmarking and offline downloads only where licensing and access rules permit.
- AI summaries must link back to source material and be reviewed before being represented as authoritative notes.

## 11. Previous Year Papers (PYQ)
For each paper record exam, cycle/year, shift/paper, language, official source URL, answer-key URL, publication date, rights/license status and verification status.
- Link to official source when the file cannot lawfully be hosted.
- Clearly distinguish official paper, memory-based paper, model paper and AI-generated practice.
- Preserve answer-key corrections and revised keys as versions.
- Never fabricate missing year-wise papers just to fill the library.

## 12. Free + Premium policy
Suggested launch split (adjust after costs and user feedback):
Free:
- Exam catalogue and basic syllabus pages
- Daily limited practice and selected mock tests
- Selected notes and public official source links
- Small daily AI doubt quota or limited AI trial
- Basic result history and bookmarks

Premium:
- Full-length exam-specific test series
- Expanded mock limits and detailed analytics
- Premium reviewed notes/resources where licensed
- Higher AI doubt/notes-generation quotas
- Personalized study plans and advanced weak-topic practice

Implementation rules:
- Keep a central feature-entitlement matrix; do not scatter checks through UI.
- UI may display lock states, but every protected API/resource must check entitlement on the server.
- Use a verified payment provider, server-side webhook signature verification, idempotency keys, refund/cancellation handling and receipts.
- Do not unlock premium from a client-side boolean or localStorage value.
- Before launch, verify applicable app-store billing rules, taxes, privacy disclosures and consumer/refund terms.
- Do not enable real payments until production security review is complete.

## 13. Admin Panel and editorial workflow
Roles:
- Super admin: users, roles, plans, all content and system settings.
- Admin: catalogue, content, publishing, reports and analytics.
- Editor: create/import/edit drafts.
- Reviewer: verify questions, sources and AI drafts.
- Support: limited user/report support without access to secrets.

Admin modules:
1. Dashboard: pending drafts, reports, published content, AI usage/cost, exam coverage.
2. Exam catalogue: create/edit/archive exam, official URLs, cycle and last verification.
3. Question bank: bulk CSV/JSON import, schema validation, duplicate detection, preview and bulk status updates.
4. Review queue: answer/source verification, comments, approve/reject/request revision.
5. Notes/library: upload, rights/licensing, tagging, versioning and publish.
6. Test builder: pattern, question selection, duration, marks, sections and access tier.
7. Test series: sequence, schedule and unlock rules.
8. PYQ registry: year/shift/source/answer-key validation.
9. AI jobs: usage, failures, drafts, prompt versions and cost limits.
10. User reports and audit log.
11. Feature flags and release controls.

All privileged actions require server authorization and an audit record. Never rely on hiding admin buttons in the frontend.

## 14. Security, privacy and reliability
- Enforce role-based access control and row-level policies where supported.
- Keep secrets in server environment variables; never commit AI, payment or admin private keys.
- Validate inputs, rate-limit auth/AI/import endpoints, sanitize rendered content and protect against upload abuse.
- Use signed file URLs, file type/size checks and malware scanning where available.
- Collect minimum personal data; publish privacy policy, consent, retention, deletion and support contact before real user rollout.
- Back up database and resources; test restoration.
- Use structured logs, error tracking and alerting without recording OTPs, secrets or unnecessary personal content.
- Version database migrations and roll back safely.
- Keep the existing PWA service-worker cache versioned; avoid stale app.js/data.js after deployments.

## 15. Migration from the current static PWA
Phase 0 — Baseline and safety
- Create a release tag/backup and work on a feature branch.
- Inventory all root files, current quiz behaviour, service worker, exam catalogue, localStorage keys and Firebase setup.
- Add automated smoke tests before refactoring.

Phase 1 — Extract frontend modules
- Split current `app.js` responsibilities into catalogue, filters, quiz engine, scoring, history, auth and rendering modules.
- Keep `data.js` as demo/fallback data temporarily.
- Add a single repository/API interface so UI does not care whether content is local or remote.
- Preserve current HTML/CSS and existing PWA install path.

Phase 2 — Backend and database
- Choose a managed PostgreSQL/API stack or secure server backend.
- Add versioned migrations, auth mapping and roles.
- Import existing `exam-catalog.js` into catalogue tables after normalization.
- Import `data.js` sample questions with origin type `demo`, not PYQ.
- Add import logs and reject malformed rows.

Phase 3 — Server-backed mock tests
- Build test assembly, attempt start/save/submit and scoring APIs.
- Migrate result history: offer a one-time, user-consented local-history import; validate records and mark imported scores as client-reported/unverified.
- Keep offline sample practice as fallback when offline; sync only when authenticated and safe.

Phase 4 — Notes, library and verified PYQ
- Create source registry and licensing fields first.
- Add resource storage/search and exam/topic tagging.
- Start with official external links and a small reviewed content set.

Phase 5 — AI and review queue
- Add server-side AI provider, quota enforcement, job queue, structured generation and reviewer workflow.
- AI draft generation remains off by default until cost limits and quality checks pass.

Phase 6 — Freemium and payment
- Add plans and entitlements; first test with sandbox purchases.
- Enable production billing only after webhook, refunds, expiry, cancellation and access tests pass.

Phase 7 — Release
- Test mobile and desktop, slow network, offline, interrupted tests, expiry, duplicate submit, language switch, admin permissions, accessibility and backups.
- Roll out via feature flags, monitor errors, then expand exam/content coverage.

## 16. Suggested API contract
Examples (exact routes may vary by chosen backend):
- `GET /api/exams?category=state&state=UP`
- `GET /api/exams/:slug/syllabus`
- `GET /api/questions?examId=&subjectId=&topicId=&language=` (admin or permitted practice use only)
- `POST /api/attempts` — create attempt using a published template
- `PUT /api/attempts/:id/answers/:questionId` — save answer/review flag
- `POST /api/attempts/:id/submit` — server scoring, idempotent
- `GET /api/attempts/:id/result`
- `GET /api/resources?examId=&subjectId=&topicId=&language=`
- `POST /api/ai/doubt` — authenticated, quota-limited
- `POST /api/admin/ai-jobs` — editor/reviewer permissions
- `POST /api/admin/questions/import`
- `POST /api/billing/webhook` — verified provider signature only

Never expose answer keys for secure competitive mocks before submission if the product requires server-side test integrity.

## 17. Quality gates and acceptance criteria
Catalogue:
- Every listed exam has category, canonical name, recruiting body and source/verification metadata.
- Unverified or catalogue-only entries are clearly labeled.

Question bank:
- Every published MCQ has valid options, answer, explanation or configured rationale policy, subject/topic and verification state.
- Duplicate detection works; no AI draft is auto-published.
- Official PYQs have a verifiable source and legal reuse status.

Mock engine:
- 10/50/100 controls only enable when enough eligible unique questions exist.
- Timer expiry auto-submits once; reload/reconnect does not create duplicate results.
- Marks, negative marking, section rules and skipped answers match the selected pattern version.
- Result totals equal the sum of per-question scores.

Freemium:
- Server denies expired or unauthorized premium access even if client state is modified.
- Payment webhook retries are idempotent; refund/cancellation updates entitlement.

Admin/AI:
- Non-admin users cannot call admin endpoints.
- All content edits/publishing have audit records.
- AI quotas, timeouts, malformed JSON and provider failures are handled gracefully.

PWA:
- Install, refresh, cache update, mobile navigation, bilingual interface and offline demo practice work.
- Existing working features remain usable during staged migration.

## 18. Launch scope recommendation
Do not attempt to populate every exam with hundreds of questions before the platform works. Launch in this order:
1. Catalogue for all states/UTs + Central + Banking + Teaching, with truthful content-status labels.
2. A verified, useful starter set for a limited group of high-demand exams.
3. Complete mock engine and admin content pipeline.
4. Notes/PYQ/library for those exams.
5. AI doubt solver and AI-generated reviewed practice.
6. Expand exam-by-exam using coverage metrics and user feedback.

Recommended first content pilot: UP TGT/PGT, CTET, UP Police, SSC CGL/CHSL, Railway NTPC/Group D, SBI/IBPS. This is a pilot only, not a claim that every paper is already available.

## 19. Open decisions before production implementation
- Backend choice: managed PostgreSQL platform vs custom Node.js API.
- Authentication: finish Firebase phone auth or choose another supported provider.
- AI provider/model and per-user budget.
- Payment provider and app-store distribution plan.
- Content licensing and editorial review capacity.
- Data retention, privacy policy and support workflow.

## 20. Definition of done for first production milestone
A user can choose an exam, see the verified syllabus/content status, take a server-backed timed mock, submit once, review explanations and history, bookmark material, and use a quota-limited AI doubt solver. An authorized editor can create a question or AI draft, attach source evidence, send it for review, and publish it. Premium remains securely locked until entitlement verification and payment testing are complete.
