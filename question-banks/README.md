# Question banks

The app can load a dedicated bank at `question-banks/<exam-slug>.json`, where the slug is the lowercase exam name with non-alphanumeric characters replaced by hyphens (for example, `SSC CGL` -> `ssc-cgl.json`).

Copy `_template.json`, replace the exam metadata and add reviewed questions. Every question must include provenance. The loader rejects malformed banks and invalid answer indexes.

`targetQuestions: 10000` is a target, not a claim that the bank currently contains 10,000 questions. Only actual questions count. Keep official PYQs separate from authored/AI practice and record source and reuse status. Do not create duplicate filler questions to meet the target.


## Permanent quality and set rules

Read [QUALITY-STANDARD.md](./QUALITY-STANDARD.md) before adding or publishing any exam bank. Every exam must have its own verified blueprint and dedicated bank. The app builds 20 sets at 10, 50 or 100 questions only when enough distinct questions exist under the selected filters. It never fills missing slots with duplicate filler; overlap across separate sets may occur and must be disclosed. Difficulty tags and source provenance are required for banks marked with a quality standard version. Existing legacy banks are being migrated without misrepresenting their current review status.
