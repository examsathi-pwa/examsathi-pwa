# ExamSathi India Exam Data Source Registry

Status: source inventory / ingestion plan, not a claim that all questions have been collected.
Last reviewed: 2026-10-24.

## Data integrity rules
1. A catalogue entry is not a question bank. Never render a test unless it has real questions.
2. Preserve provenance: source URL/title, exam, paper, year, shift/set, language, retrieval date, answer-key status and reuse rights.
3. Distinguish `official_pyq`, `official_answer_key`, `practice_ai` and `mock`. Never label AI practice as PYQ.
4. Do not bypass logins, CAPTCHAs, candidate-specific response sheets or access controls.
5. Store official paper links/metadata first; re-host text only where reuse is permitted or independently verified.
6. Unknown answer = null, not a guess. Validate every import and answer key.
7. Preserve descriptive questions; do not force every paper into MCQ format.
8. Report actual imported/verified counts by exam and source.

## Canonical question record
```json
{
  "id": "stable-source-derived-id",
  "examId": "ssc-cgl",
  "examName": "SSC CGL",
  "authority": "Staff Selection Commission",
  "paper": "Tier-I",
  "year": 2025,
  "date": null,
  "shift": null,
  "set": null,
  "language": "hi",
  "subject": "General Awareness",
  "topic": null,
  "type": "mcq",
  "questionHi": "...",
  "questionEn": null,
  "optionsHi": ["...", "...", "...", "..."],
  "optionsEn": null,
  "answerIndex": null,
  "explanationHi": null,
  "provenance": {
    "kind": "official_pyq",
    "sourceUrl": "https://...",
    "sourceTitle": "...",
    "retrievedAt": "YYYY-MM-DD",
    "answerKeyStatus": "unverified",
    "reuseStatus": "review_required"
  }
}
```

## Central / national official starting points

| Exam family | Official source | Caveat |
|---|---|---|
| UPSC CSE, IFS, CDS, NDA, CAPF, CMS, Engineering Services, Geo-Scientist and other UPSC exams | https://www.upsc.gov.in/examinations/previous-question-papers | Public listing includes descriptive and optional papers. |
| SSC CGL, CHSL, MTS, GD, JE, CPO, Stenographer, Selection Posts, Hindi Translator | https://ssc.gov.in/home/answer-key and https://ssc.gov.in/ | Response sheets/keys can be time-limited or login-based; record access and reuse status. |
| CTET | https://ctet.nic.in/archive/ | Archive lists previous question papers and final answer keys. |
| NTA: UGC-NET, JEE Main, NEET-UG, CUET, CSIR-NET and other NTA exams | https://nta.ac.in/ | Verify each exam/session portal; availability varies. |
| IBPS PO, CSA/Clerk, SO, RRB | https://www.ibps.in/index.php/crp-updates/ and https://www.ibps.in/index.php/faq/ | IBPS FAQ says it does not provide question papers/answer keys. Do not claim official PYQs without an authorized source; keep licensed practice separate. |
| RRB NTPC, Group D, ALP, Technician, JE, RPF | https://www.rrbcdg.gov.in/ | Check the exact regional RRB/CEN notice; response sheets/keys may be time-limited. |
| GATE | https://gate2026.iitg.ac.in/ | Record the year-specific organizing institute and official archive URL. |
| Teacher recruitment/TET | CTET above plus each official state education/teacher recruitment authority | TET, teacher recruitment and subject papers are separate exam families. |
| Other defence recruitment | Relevant official service portal; NDA/CDS via UPSC above | Do not mix coaching memory-based sets with official papers. |

## State and Union Territory coverage checklist
For every app-catalogue exam, identify the responsible PSC, staff selection/recruitment board, police board, teacher board or department. Verify the exact official paper/answer-key page before ingestion; do not guess URLs or treat a homepage as evidence of PYQ availability.

- Andhra Pradesh
- Arunachal Pradesh
- Assam
- Bihar
- Chhattisgarh
- Goa
- Gujarat
- Haryana
- Himachal Pradesh
- Jharkhand
- Karnataka
- Kerala
- Madhya Pradesh
- Maharashtra
- Manipur
- Meghalaya
- Mizoram
- Nagaland
- Odisha
- Punjab
- Rajasthan
- Sikkim
- Tamil Nadu
- Telangana
- Tripura
- Uttar Pradesh
- Uttarakhand
- West Bengal
- Andaman and Nicobar Islands
- Chandigarh
- Dadra and Nagar Haveli and Daman and Diu
- Delhi (NCT)
- Jammu and Kashmir
- Ladakh
- Lakshadweep
- Puducherry

Track each authority as: `not_checked`, `checked_no_public_papers`, `official_papers_found`, `login_or_time_limited`, `reuse_review_required`, or `ingested_and_validated`.

## App integration requirements
- Keep imported question banks separate from sample content, e.g. `data/question-banks/<exam-id>/<year>-<paper>.json`.
- Load by selected exam ID, not broad category alone.
- Empty state must say “इस परीक्षा का सत्यापित प्रश्न बैंक अभी उपलब्ध नहीं है” and link to the official source; never silently show unrelated sample questions.
- Show question count and source status before starting a test.
- Test exam selection, filters, language, answer indexes, empty-bank state, and provenance labels.
- Reject missing text/options, invalid answer indexes, duplicate IDs and missing provenance in validation.
- Mark a bank verified only after human review of questions and answer key.

## First ingestion batches
1. Public official archives with clear access: UPSC and CTET.
2. SSC and RRB: inventory public paper/key metadata and respect access/time-window restrictions.
3. NTA: inventory each exam and session from official portals.
4. State PSCs/recruitment boards: build state-by-state official link inventory, then ingest only verified sources.
5. Banking: IBPS official notices separately; use licensed or clearly labelled independently authored practice content where official papers are not provided.

## Acceptance criteria for “all India exam data”
- Every catalogue exam has a source-status row, even when no public paper exists.
- Every imported question has provenance and content/reuse status.
- Counts are reported by exam, year, paper, language and verification status.
- The app never presents another exam's questions as selected-exam PYQs.
- Source inventory must not be reported as completed question-bank ingestion.
