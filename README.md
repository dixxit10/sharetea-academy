# Sharetea Academy — Spark / GitHub Pages

## Zero-billing deployment
- Firebase project: `sharetea-academy` **must remain on Spark (no billing account)**.
- Firebase Authentication: enable Anonymous.
- Firestore: use the **Cloud Firestore**, not Realtime Database, Rules tab.
- Copy the complete `firestore.rules` into Cloud Firestore Rules and Publish. The current deny-all rules must be replaced before the site can use the database.
- Push `docs/` and `firestore.rules` to a GitHub repository. GitHub > Settings > Pages > Deploy from a branch > main > `/docs`.
- Open the Pages URL. In Firebase Authentication > Settings > Authorized domains, add the Pages host (e.g. `username.github.io`) if needed for Anonymous Auth.
- Set your shared access code in `docs/app.js`, `const TEAM_CODE`. This is only a casual gate; it is **publicly readable** in a static site.
- No Functions, Hosting, Blaze, paid APIs, or card required. Spark quotas can stop service when exhausted; zero-billing is only guaranteed if you never attach a billing account or upgrade.

## Important behavior and limits
- Quick Match looks for an opposite-role waiting room; otherwise it creates one. Create/Join Room use six-digit codes. The first player can invite another teammate using the code.
- Firestore client transactions prevent two users from claiming the same waiting room, but this is a lightweight practice tool, not a tamper-resistant game backend.
- Rooms have an `expiresAt` field; there is no automatic server-side deletion. Periodically remove old room documents manually if desired. Waiting rooms heartbeat every 45 seconds; disconnected waiting rooms are ignored after two minutes.
- Answer logs are **write-only** from the browser. Admins can inspect/export via Firebase Console or Admin SDK. Anonymous auth may persist the UID locally; no local score history is stored.
- Leaderboards are public to anonymously authenticated users; answer records are not. No server-side verification of scores. Score publishing is optional.
- The current demo question bank has 12 items. Edit `docs/questions.json` to customize. Both players must load the same question bank version.
- The roleplay Customer receives 20 participation XP per round, Staff gets 100 XP per correct answer. Compare rankings within modes/roles with care.
- Data writes/reads count against Firebase Spark free quotas. GitHub Pages also has usage limits.

## Administrator export
Use the Firebase Console Firestore Data tab for small data sets, or `admin/export.mjs` with a local Firebase service-account JSON (never commit the JSON to GitHub):
```
cd admin
npm install
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json node export.mjs
```
On Windows PowerShell:
```
$env:GOOGLE_APPLICATION_CREDENTIALS='C:\\secure\\service-account.json'
node export.mjs
```
Outputs four CSVs in `admin/exports/`. Service-account keys are sensitive. Keep them offline and outside the repository.

## Troubleshooting
- `Missing or insufficient permissions`: publish `firestore.rules` to **Cloud Firestore**, check Anonymous Auth, and reload.
- `The query requires an index`: use the Firebase Console link in the browser error to create a composite index for `scores` (`mode` ascending, `score` descending). Index creation is supported on Spark.
- Do not paste Firestore rules into Realtime Database Rules; they use different languages.


## v3: Editable question bank and chat UI

Edit **`docs/data/questions.json`** only to add or change questions. The file contains a `version` string and `questions` array. Duplicate one object inside the array, assign a unique `id`, update `customerMessage`, `options` (each with stable unique `id`), `correctAnswerId`, `customerReaction`, `explanation`, `modes`, and `enabled`. Keep JSON commas and quotes valid. The `modes` values are `simulator`, `rush`, `roleplay`. Increment `version` when modifying questions.

Simulator randomly selects up to five questions without repetition. Rush Hour shuffles questions and repeats only after the deck is exhausted. Roleplay room host selects one shared randomized deck. Answer option positions are randomized; answer IDs remain stable for reporting.

The chat UI uses red outgoing staff bubbles, white incoming customer bubbles. Solo results render immediately even if Firebase saving is delayed or fails.

**Deployment:** upload `docs/`, `admin/`, `firestore.rules`, and README to the root of the existing GitHub repository. GitHub Pages remains `main` → `/docs`. The existing Firestore rules may remain unchanged for this v3 update.

**Testing:** try Customer Simulator in a fresh/private browser session, verify results; check the browser DevTools Console if `Connection failed` appears. Anonymous Auth must be enabled in Firebase. Quick Match and private rooms require two separate anonymous browser sessions.

**Security / limits:** client-side shared access code is not secret. This is a casual training app; client-submitted scores can be forged. Spark has quotas; exceeding them can suspend operations, but do not enable billing. This project does not use Cloud Functions.
