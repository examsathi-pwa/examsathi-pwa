# Central Exam Mock Test Completion Tracker

Last checked: 2026-11-11

Scope: all 32 entries in `exam-catalog.js` under `centralExams`.

## Release rule
A central exam is complete only when it has a dedicated exam-specific bank, a verified or clearly provisional exam blueprint, bilingual questions where applicable, four plausible options, answer explanations, provenance, duplicate checks, and enough distinct questions for the advertised mock lengths. Do not label authored practice as official PYQ. Do not count questions borrowed from another exam as an exam-specific completed bank.

## Current inventory

| Exam | Current dedicated bank | Current questions | Status |
|---|---:|---:|---|
| UPSC Civil Services | central-exam-starters.json | 10 local + shared foundation pool | Starter only; needs UPSC Prelims GS-specific expansion |
| UPSC CAPF | central-exam-starters.json | 10 local + shared foundation pool | Starter only; needs CAPF-specific expansion |
| SSC CGL | ssc-cgl.json | 1,000 | Existing dedicated bank; review blueprint, balance and answer quality |
| SSC CHSL | ssc-chsl.json | 33 | Incomplete; expand to dedicated 100+ bank |
| SSC MTS | ssc-mts.json | 24 | Incomplete; expand to dedicated 100+ bank |
| SSC GD | central-exam-starters.json | 10 local + shared foundation pool | Starter only; needs GD-specific expansion |
| SSC CPO | central-exam-starters.json | 10 local + shared foundation pool | Starter only; needs CPO-specific expansion |
| Railway NTPC | railway-ntpc.json | 15 | Incomplete; expand to dedicated 100+ bank |
| Railway Group D | railway-group-d.json | 16 | Incomplete; expand to dedicated 100+ bank |
| RRB ALP | central-exam-starters.json | 10 local + shared foundation pool | Starter only; needs ALP technical + CBT blueprint |
| RRB JE | central-exam-starters.json | 10 local + shared foundation pool | Starter only; needs discipline-specific technical banks |
| CTET | ctet.json | 108 | Dedicated CDP bank exists; Paper I/II subject modules and expert answer review remain |
| UGC NET | central-exam-starters.json | 10 local + shared foundation pool | Starter only; needs Paper I + subject-wise Paper II modules |
| NDA | central-exam-starters.json | 10 local + shared foundation pool | Starter only; needs Mathematics + GAT blueprint |
| CDS | central-exam-starters.json | 10 local + shared foundation pool | Starter only; needs English + GK + Mathematics modules |
| AFCAT | central-exam-starters.json | 10 local + shared foundation pool | Starter only; needs AFCAT-specific modules |
| Indian Army Agniveer | central-exam-starters.json | 10 local + shared foundation pool | Starter only; trade/category blueprint required |
| Indian Navy | central-exam-starters.json | 10 local + shared foundation pool | Starter only; entry-specific syllabus required |
| Indian Coast Guard | central-exam-starters.json | 10 local + shared foundation pool | Starter only; Navik/Yantrik-specific modules required |
| SSC JE | central-exam-starters.json | 10 local + shared foundation pool | Starter only; Civil/Mechanical/Electrical technical modules required |
| SSC Stenographer | central-exam-starters.json | 10 local + shared foundation pool | Starter only; reasoning, GA and English modules required |
| SSC Selection Post | central-exam-starters.json | 10 local + shared foundation pool | Starter only; Matric/Higher Secondary/Graduate level separation required |
| UPSC Engineering Services | central-exam-starters.json | 10 local + shared foundation pool | Starter only; discipline-specific Prelims/ Mains modules required |
| UPSC Combined Medical Services | central-exam-starters.json | 10 local + shared foundation pool | Starter only; medical subject blueprint required |
| UPSC Indian Forest Service | central-exam-starters.json | 10 local + shared foundation pool | Starter only; Prelims + optional subject blueprint required |
| RRB Technician | central-exam-starters.json | 10 local + shared foundation pool | Starter only; grade/trade-specific technical modules required |
| RRB Paramedical | central-exam-starters.json | 10 local + shared foundation pool | Starter only; post-wise paramedical syllabus required |
| KVS Recruitment | central-exam-starters.json | 10 local + shared foundation pool | Starter only; post-wise pedagogy/subject modules required |
| NVS Recruitment | central-exam-starters.json | 10 local + shared foundation pool | Starter only; post-wise pedagogy/subject modules required |
| CSIR UGC NET | central-exam-starters.json | 10 local + shared foundation pool | Starter only; subject-specific science modules required |
| EPFO Recruitment | central-exam-starters.json | 10 local + shared foundation pool | Starter only; EO/AO and APFC pattern needs separate treatment |
| ESIC Recruitment | central-exam-starters.json | 10 local + shared foundation pool | Starter only; post-specific syllabus required |

## Work order
1. Complete the four short dedicated banks first: SSC CHSL, SSC MTS, Railway NTPC and Railway Group D.
2. Audit SSC CGL and CTET dedicated banks.
3. Build the remaining 26 starter-only exams as dedicated, exam-specific banks; where an exam has multiple streams/trades/subjects, keep separate papers instead of mixing them.
4. Run duplicate, schema, answer-index and bilingual checks; run GitHub validation and Pages deployment before announcing release.

## Honesty note
The shared foundation pool is useful for basic practice but does not make a specialist exam mock complete. A bank stays marked incomplete until its exam-specific syllabus and paper structure are covered. The counts above are inventory counts, not a claim that every bank is reviewed or publication-ready.
