# Uttar Pradesh ExamSathi rollout registry

**Purpose:** Track Uttar Pradesh exam coverage without confusing a listed exam with a completed question bank.

## Status definitions
- `catalog_only`: exam appears in the selector; no dedicated question bank is confirmed.
- `source_linked`: official recruiting/exam authority link is present.
- `bank_started`: a dedicated bank exists, but it is a pilot and may need review.
- `verified_pyq`: question text and answer have been checked against the official paper/answer key.
- `ready`: required content, filters, scoring and QA have passed.

Do not label an exam ready until the bank has real unique questions, source provenance, answer review and a passing app test. 10,000 is a target per exam, not current content.

## Official source directory

| Exam family | Official source | Current content status |
|---|---|---|
| UPPSC PCS / Upper Subordinate | https://uppsc.up.nic.in/OuterPages/PreQuesPapers.aspx?ID=PrevQues | source_linked; PDF extraction and answer verification pending |
| UPPSC Assistant Prosecution Officer (APO) | https://uppsc.up.nic.in/OuterPages/PreQuesPapers.aspx?ID=PrevQues | source_linked; dedicated bank pending |
| UPPSC Assistant Professor / Lecturer / GIC | https://uppsc.up.nic.in/OuterPages/PreQuesPapers.aspx?ID=PrevQues | source_linked; subject-wise banks pending |
| UPPSC Assistant Teacher TGT Grade | https://uppsc.up.nic.in/OuterPages/PreQuesPapers.aspx?ID=PrevQues | bank_started; current 15-question UP TGT pilot is original practice, not official PYQ |
| UPPSC Computer Assistant / other commission posts | https://uppsc.up.nic.in/OuterPages/PreQuesPapers.aspx?ID=PrevQues | source_linked; dedicated banks pending |
| UPSSSC PET | https://upsssc.gov.in/ | source_linked; dedicated bank pending |
| UPSSSC Lekhpal | https://upsssc.gov.in/ | source_linked; dedicated bank pending |
| UPSSSC VDO / Gram Panchayat Adhikari | https://upsssc.gov.in/ | source_linked; dedicated bank pending |
| UPSSSC Junior Assistant / Stenographer / Clerk | https://upsssc.gov.in/ | source_linked; post-wise banks pending |
| UPSSSC Forest Guard / Enforcement Constable / technical posts | https://upsssc.gov.in/ | source_linked; post-wise banks pending |
| UP Police Constable / SI / other police posts | https://uppbpb.gov.in/ | source_linked; dedicated bank pending |
| UPTET | https://updeled.gov.in/ | source_linked; paper-wise bank pending |
| UP Junior Aided Selection Exam (UPJASE) | https://updeled.gov.in/ | source_linked; dedicated bank pending |
| UP D.El.Ed admission | https://updeled.gov.in/ | source_linked; admission practice content pending |
| UP B.Ed JEE | https://www.bujhansi.ac.in/ | source_linked; year-wise content pending |
| UP technical / JE / Polytechnic recruitments | https://jeecup.admissions.nic.in/ | source_linked; exam-specific source verification needed |
| UP teacher recruitments (KVS/NVS are central, not UP state) | Confirm each recruiting authority before classifying | Do not mix central exams into UP-state PYQ banks |

## Minimum acceptance checklist for each exam

- [ ] Exact exam, stage, subject, year and shift identified.
- [ ] Official source URL and source title stored per question/paper.
- [ ] Official PYQ separated from original/AI practice.
- [ ] Every answer checked against official key or a reviewed solution.
- [ ] Hindi/English text and all options checked.
- [ ] Duplicate IDs and duplicate prompts rejected by CI.
- [ ] 10/50/100-question controls only enable when enough unique questions exist.
- [ ] Test timer, navigation, submit, scoring, explanation and results checked.
- [ ] Question counts displayed from actual loaded bank.
- [ ] 10,000-question target is met only by 10,000 unique, reviewed questions; no filler or fabricated PYQ.

## Rollout order

1. UPPSC official paper inventory and extraction: PCS, TGT Grade, Lecturer/GIC, APO, Assistant Professor and other available papers.
2. UPSSSC: PET, Lekhpal, VDO, Junior Assistant/Stenographer and post-wise recruitments.
3. UP Police: Constable, SI and other notified posts.
4. Teacher eligibility/admissions: UPTET, UPJASE, D.El.Ed and UP B.Ed JEE.
5. Other state recruitment boards; then repeat the same source-first process for each state/UT.

This registry is a work tracker, not a claim that every listed exam already has a complete bank.
