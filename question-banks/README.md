# Question banks

The app can load a dedicated bank at `question-banks/<exam-slug>.json`, where the slug is the lowercase exam name with non-alphanumeric characters replaced by hyphens (for example, `SSC CGL` -> `ssc-cgl.json`).

Copy `_template.json`, replace the exam metadata and add reviewed questions. Every question must include provenance. The loader rejects malformed banks and invalid answer indexes.

`targetQuestions: 10000` is a target, not a claim that the bank currently contains 10,000 questions. Only actual questions count. Keep official PYQs separate from authored/AI practice and record source and reuse status. Do not create duplicate filler questions to meet the target.
