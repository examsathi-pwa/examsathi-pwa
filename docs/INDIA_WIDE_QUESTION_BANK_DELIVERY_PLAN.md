# ExamSathi India-wide question-bank delivery plan

Status: implementation specification. This document is not a claim that all listed exams or question sets are already populated.

## 1. Product requirement

- Cover the 28 Indian states and 8 Union Territories (36 jurisdictions).
- Include central/national recruitment examinations and banking examinations in separate catalog sections.
- Every exam that is published as supported must have at least 20 distinct sets.
- Each set is backed by up to 100 unique questions. The candidate can choose 10, 50, or 100 questions from that set when enough questions are available.
- A set must never silently borrow questions from a different exam.
- Keep exam-level combined papers and official subject/paper-wise examinations separate.

## 2. Combined versus subject-wise structure

### Combined examination
For an exam whose notified paper combines multiple areas, each set follows that exam's notified structure. For example, a combined general paper may contain General Awareness, Reasoning, Quantitative Aptitude, Language, and state-specific GK in the correct exam-specific proportions. Do not assume the same proportions for every exam.

### Subject-wise examination
For teacher, lecturer, technical, specialist, and other subject-paper examinations, store questions under the exact notified subject and paper. The interface should show subject-wise sets and must not mix Physics questions into Chemistry, or one teaching subject into another. Where an exam has both a common paper and an optional/subject paper, publish separate common-paper and subject-paper set groups.

### Multiple papers
If the official scheme has Paper I, Paper II, prelims, mains, language papers, or separate technical papers, model them explicitly. Do not flatten them into one generic test.

## 3. Set and question targets

For each exam:
- Minimum release target: 20 distinct sets.
- Each set target: 100 unique questions.
- Candidate-facing sizes: 10 / 50 / 100 questions.
- Therefore, a fully populated 20-set exam bank contains 2,000 unique questions.
- For subject-wise exams, distribute the 20 exam sets across the officially notified subjects and papers. Subject coverage and set counts must be visible; do not imply 20 sets exist for every subject unless that is actually populated.
- If a future product decision requires 20 sets per subject, that is a larger target and should be tracked separately.

Do not create 20 copies of one small question list with shuffled order and call them separate sets. Question overlap between sets should be prevented by default; any intentional revision/reuse must be explicitly marked.

## 4. Question record format

Every question should include:
- stable unique ID;
- Hindi and English question text where available;
- four Hindi and English options;
- zero-based correct answer index;
- concise Hindi and English explanation;
- exam ID, paper ID, subject, topic, difficulty;
- provenance kind: `official_pyq`, `original_practice`, or `mock`;
- source title and source URL for official PYQs;
- year, shift, paper and page only when verified;
- reviewer/verification status.

Never label generated or authored practice material as an official previous-year question. If a source PDF or official key cannot be verified, classify it as original practice or leave it unpublished until reviewed.

## 5. Data model

Each `question-banks/<exam-slug>.json` file should contain:
- exam identity and jurisdiction;
- recruiting authority and official notification/syllabus URL;
- exam mode: `combined`, `subject_wise`, or `mixed_papers`;
- papers and subject metadata;
- a `tests` array with at least 20 distinct set records before the exam is marked fully populated;
- per-test subject/paper mapping and up to 100 questions;
- provenance and release status.

The current app loader already loads a dedicated question-bank JSON file per exam and the app has 10/50/100 controls that are disabled when too few unique filtered questions exist. The next UI/data-engineering step is to expose set groups and subject/paper grouping explicitly, while preserving the current no-cross-exam-mixing rule.

## 6. India-wide catalog coverage

### States
Andhra Pradesh, Arunachal Pradesh, Assam, Bihar, Chhattisgarh, Goa, Gujarat, Haryana, Himachal Pradesh, Jharkhand, Karnataka, Kerala, Madhya Pradesh, Maharashtra, Manipur, Meghalaya, Mizoram, Nagaland, Odisha, Punjab, Rajasthan, Sikkim, Tamil Nadu, Telangana, Tripura, Uttar Pradesh, Uttarakhand, West Bengal.

### Union Territories
Andaman and Nicobar Islands, Chandigarh, Dadra and Nagar Haveli and Daman and Diu, Delhi, Jammu and Kashmir, Ladakh, Lakshadweep, Puducherry.

### Common state recruitment families to verify per jurisdiction
- State civil services / combined competitive examinations;
- subordinate services / staff selection / Group B, C and D;
- police constable and sub-inspector;
- teacher eligibility tests and teacher recruitment;
- revenue, patwari, lekhpal and other land-record posts;
- health, nursing, pharmacy and allied services;
- forest, engineering, technical and judicial services;
- state university and higher-education recruitment.

These are discovery families, not a claim that every jurisdiction conducts every listed exam. Add an exam only after identifying the actual recruiting authority and a current or archived official syllabus/notification. Do not add generic placeholders as if they were active examinations.

### Central and national exam families
UPSC civil services and other UPSC examinations; SSC CGL, CHSL, MTS, GD, CPO, JE, Stenographer and Selection Post; Railway RRB NTPC, Group D, ALP, JE, Technician and Paramedical; CTET, UGC NET and CSIR UGC NET; defence recruitment examinations; KVS/NVS and other central teacher recruitment; EPFO/ESIC and other central recruitment where the notified exam scheme is available.

### Banking and financial recruitment
IBPS PO, Clerk/CSA, SO and RRB; SBI PO, Clerk and SO; RBI Grade B and Assistant; NABARD; SEBI; SIDBI; LIC; NIACL/UIIC/GIC and other insurer recruitment. Each post's prelims, mains, professional knowledge, descriptive and language papers must follow its own official scheme.

## 7. Verification and release gates

An exam bank can be marked:
- `catalogued`: exam and recruiting authority identified;
- `syllabus_verified`: official syllabus/paper scheme recorded;
- `building`: question sets being prepared;
- `reviewed`: answer keys, explanations, duplicates and source records checked;
- `published_partial`: only the actually available sets are shown;
- `complete_20_sets`: at least 20 distinct sets are populated and validated.

The interface must show actual available set and question counts. Never display a 20-set or 2,000-question claim until the data exists and passes validation.

## 8. Delivery order

1. Correct and normalize the national/state/UT exam catalog and authority references.
2. Complete the current pilot banks and test the set/subject selection UI.
3. Build central exams and banking exams in verified batches.
4. Build state exams region by region, starting with high-demand exams, then remaining state/UT authorities.
5. For each exam, publish only reviewed sets; continue adding sets until the 20-set target is reached.
6. Add authenticated PYQs only from traceable official papers/answer keys.
7. Keep OTP work paused as requested; question-bank work takes priority.

## 9. Definition of done

An exam is complete only when:
- the authority and syllabus/paper scheme are recorded;
- combined/subject-wise mode is correct;
- at least 20 unique sets are present;
- each advertised 10/50/100 option has enough distinct eligible questions;
- no question has missing options, invalid answer index, or missing explanation/provenance;
- duplicate checks and subject/paper mapping pass;
- official PYQ claims have traceable source metadata;
- Hindi/English display and mock-test scoring are checked.
