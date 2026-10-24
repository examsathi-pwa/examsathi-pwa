# ExamSathi PWA v1

## What works now
- Responsive Hindi/English interface, categories, free MCQ tests, question navigation, countdown, auto-submit, explanations, and device-local results.
- PWA manifest, offline cache after first online load.
- Premium test is deliberately locked: NO payment collection or paid entitlement is implemented.
- Phone OTP integration is included but **requires your own Firebase configuration**; without setup OTP does not work.

## Launch free on GitHub Pages
1. Create a GitHub account and a **public** repository (e.g. `examsathi-pwa`).
2. Upload all files from this folder to the repository root, including `index.html`.
3. Open repository Settings > Pages > Build and deployment > Deploy from a branch > `main` / root > Save.
4. Wait for the HTTPS URL shown under Pages. Open it on Android Chrome; choose Add to Home screen / Install app.
5. Alternative: Netlify Drop supports uploading the folder for a free HTTPS preview, subject to provider limits.

## Set up real SMS OTP (not enabled by default)
1. Firebase Console > create a project > add a Web app > copy the public `firebaseConfig` fields into `firebase-config.js`.
2. Authentication > Sign-in method > enable Phone. Configure SMS region policy and authorized domains. Add the actual Pages hostname (e.g. `yourname.github.io`) to authorized domains. Phone sign-in requires reCAPTCHA and provider-side setup.
3. For development use Firebase test phone numbers; never publish test OTP credentials. Real SMS phone authentication may require billing, quotas and/or an eligible paid plan, depending on current Firebase policies. **Do not assume real OTP is free.**
4. Test OTP on the actual deployed HTTPS site, not a `file://` page. Do not commit Firebase admin keys or service account secrets.
5. Configure a privacy policy and obtain appropriate consent for phone-number processing before production launch.

## Paid tests (future phase)
- Do not accept payments yet. Add authenticated entitlement checks using trusted backend code and a verified payment provider, plus payment/refund policies.
- Never unlock premium using only a client-side flag. Use server-side purchase verification.
- For digital content sold in a Play Store-distributed app, Google Play billing rules may apply. Review the latest policy before launch.

## Production work still needed
- Firebase/other database with protected question management and admin panel.
- Secure, server-validated scores for leaderboard and rankings.
- Accessibility, tests, legal/privacy disclosures, security and payment setup.
- Create proper 192x192 and 512x512 PNG icons for widest install compatibility (SVG icon included for demo).
- Android AAB packaging and Google Play Console compliance are separate steps; this ZIP is a PWA, **not an APK/AAB**.

## Update content
Edit `data.js`. Add categories and tests with bilingual fields. Keep each `answer` a zero-based index (0–3). Version the service worker cache when deploying changes.


## Version 2: State, Central and Banking exam selectors
- State Exams: 28 states and 8 union territories, with a starter directory of common exam families.
- Central Exams and Banking Exams are separate dropdown sections.
- Select a state and exam to filter the available mock tests.
- Exam names are categories, **not claims of current notifications or available mock tests**. Many categories do not have questions yet and display an empty state.
- To add a real test, edit `data.js` and extend filtering in `app.js`, or implement an admin backend.
- Existing demo mock tests remain available for matching categories (UP TGT, UP Police Constable, SSC, Railway, CTET, Banking).
- Phone OTP still needs Firebase configuration. Payments are not live.
- Check current exam names and recruiting bodies against official notifications before publishing them as active vacancies.


## v3 notes / महत्वपूर्ण
- 28 states and 8 union territories listed, plus central and banking sections.
- Common recruitment streams are generic browsing placeholders. This is **not** a verified exhaustive list of every recruitment, vacancy or exam in each state.
- Exam options without uploaded question banks show a safe empty state; they do not launch an empty test.
- History storage failures/corrupt records fall back safely.
- Real SMS OTP requires Firebase credentials and authorized hosting domain; payments require separate secure backend and gateway.
- Before deploying, replace the old files completely, and reload the PWA to update the service worker cache.
- Test in Chrome on Android and desktop; no application can be guaranteed crash-free on every device.
