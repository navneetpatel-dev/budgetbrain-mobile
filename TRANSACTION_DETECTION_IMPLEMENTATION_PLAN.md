# Automatic Transaction Detection — Implementation Plan

This plan closes **every gap** in `TRANSACTION_DETECTION_GAP_ANALYSIS.md` (the "gap doc") across all four repos, and sets performance budgets for the database, backend and mobile background work.

- Gap IDs (`P0-3`, `E1`, `W3`, `AD2`, `§6.4`, …) refer to the gap doc.
- Task IDs look like `T<phase>.<n>`.
- §13 is the **traceability matrix**: every gap ID → the task(s) that close it. A gap isn't closed until its task's acceptance criteria pass.

| Repo | Short name |
|---|---|
| `navneetpatel-dev/budgetbrain-mobile` | **mobile** |
| `navneetpatel-dev/budgetbrain-backend` | **backend** |
| `navneetpatel-dev/budgetbrain-web` | **web** |
| `navneetpatel-dev/budgetbrain-admin` | **admin** |
| `navneetpatel-dev/budgetbrain-detection-core` (new) | **core** |

---

## 1. Decisions to sign off before starting

**Status: all eight signed off on 2026-09-24 as recommended (T0.1 done).**

Each has a recommendation. The plan below assumes the recommendation; if you choose differently, only the listed tasks change.

| # | Decision | Recommendation | Why | Affects |
|---|---|---|---|---|
| D-1 | How to model refunds and transfers in `transactions` | Add `'refund'` and `'transfer'` to the `type` enum, plus `transfer_group_id`, `refund_of_transaction_id` and `subtype` columns | Existing `type = 'income'` / `'expense'` queries then leave refunds and transfers out automatically, so income stops being inflated without touching every query's logic; net expense = expense − refund is computed on the server only | T1.1, T1.2, T1.17, T6.4 |
| D-2 | How to share the parser between mobile, backend and web | New public repo **core**: pure TypeScript, zero runtime dependencies except `@noble/hashes`, consumed as a git-tag dependency (`github:navneetpatel-dev/budgetbrain-detection-core#vX.Y.Z`); move to npm later if wanted | One implementation, so no drift (fixes W3's two-parser problem); works across separate repos without a monorepo | T0.2 and all of Phase 3 |
| D-3 | Native SMS access | Our own **Expo local module** (`mobile/modules/sms-detector`, Kotlin, `expo-modules-core`) plus a config plugin, rather than an unmaintained community library | Full control over the manifest receiver, native pre-filter, WorkManager coalescing and memory; survives Expo SDK upgrades | Phase 2 |
| D-4 | Local store on mobile | **`expo-sqlite`** (WAL mode, prepared statements). Redux keeps only small settings | redux-persist rewrites the whole JSON blob on every change, which is CPU-heavy for fingerprints and queues; SQLite gives indexed lookups | T2.8 |
| D-5 | Consent for template learning uploads (§6.6) | **Off by default**; a separate opt-in toggle | Privacy (spec §22) | T7.4 |
| D-6 | First open-banking market | India **Account Aggregator** (Setu or Finvu), because it's the current user base | Structured data, best accuracy | T8.3 |
| D-7 | Commercial merchant enrichment | Build the adapter, **disabled by default**, server-side only | Spec §22 forbids sending financial data out by default | T4.7 |
| D-8 | SWIFT BIC directory licence | Seed from free sources first (GLEIF, central-bank registers, IFSC dataset, NPCI); buy SWIFT only if coverage is short | Cost | T4.2 |

---

## 2. Target architecture

```text
ANDROID DEVICE (mobile)                                   BACKEND
──────────────────────                                    ───────
SMS_RECEIVED ─┐   NotificationListener ─┐
              ▼                          ▼
   [Native pre-filter] sender header ∈ pack sender set?  (O(1), no JS)
              │ yes + has currency/digit token
              ▼
   [Native candidate queue] (tiny SQLite, deleted after processing)
              │ WorkManager unique work, 45 s coalescing delay
              ▼
   [Headless JS drain]  ── core.processBatch(messages, pack, userCtx)
      eligibility → template | tokenizer → roles → classify → own-account
      → merchant → category → confidence → validate → dedup (local)
              ▼
   [Local store: expo-sqlite]  detected_local (lifecycle + sync_state)
              ▼
   [Sync manager] ≤100 items/request, backoff ─────────► POST /detected-transactions/sync
                                                          validate v2 + server confidence
                                                          INSERT … ON CONFLICT DO NOTHING
                                                          bulk createTransactions (balances,
                                                          budgets, audit, search) in one tx
                                                          post-commit jobs (BullMQ)
Knowledge pack (signed, per country) ◄──── CDN/S3 ◄──── pack builder job ◄── KB tables ◄── Admin CRUD
Web: review inbox, rules, settings, ingest (paste/email/CSV) ─► /detected-transactions/* (web API)
Admin: dashboards (rollup tables), catalog CRUD, kill switches, diagnostics, template queue
```

---

## 3. Performance and efficiency budgets

These targets are **acceptance criteria** (verified in T9.2), not aspirations.

### 3.1 Mobile (background SMS processing)

| Area | Design rule | Budget / target |
|---|---|---|
| Non-financial SMS | Native pre-filter only; **no JS runtime start** | 0 JS executions; < 1 ms native time per SMS |
| Burst handling | One WorkManager unique work (`KEEP` policy, 45 s initial delay) drains the whole queue in one headless run | ≤ 1 headless start per burst |
| Headless run | Separate lightweight entry (`index.headless.ts`): imports only core, the SQLite store, the API client and settings. No React tree, no Redux store, no UI libraries; uses the network only through the sync manager | Wall time ≤ 3 s for 20 messages; process exits when the task resolves |
| Per-message CPU | Knowledge pack **precompiled once per run**: `Map`/`Set` lookups for senders and aliases, one combined regex per lexicon class, templates indexed by institution id; message bodies truncated to 1,000 chars; all regexes checked by `eslint-plugin-regexp` / safe-regex (no catastrophic backtracking) | p95 ≤ 5 ms per message on a mid-range device (Snapdragon 6-series class) |
| Memory | Country pack loaded lazily from file (compact JSON, target ≤ 500 KB uncompressed per country); no arrays of messages kept in memory beyond the current batch (50) | No heap growth across runs; headless peak measured and recorded in T9.2 |
| Storage I/O | expo-sqlite in WAL mode; prepared statements; one write transaction per batch; fingerprints table indexed with a 180-day TTL cleanup (weekly) | ≤ 2 write transactions per headless run |
| Catch-up scan | ContentResolver query with a **projection** (`_id, address, body, date, sub_id`), `date > watermark` selection, `ORDER BY date ASC`, pages of 200, sender filter applied **natively** before crossing the bridge; watermark stored per SIM | Never rescans already-seen messages; periodic run ≤ 4 times/day with `requiresBatteryNotLow` |
| Network | One request per ≤ 100 items, gzip; only when NetInfo reports a connection; exponential backoff (30 s → 30 min); **never one request per SMS** | ≤ 1 request per headless run |
| Hashing | `@noble/hashes/sha256` (audited, synchronous) replaces the hand-rolled SHA-256 | < 0.1 ms per fingerprint |
| Pack download | Only on unmetered network or while charging, with ETag / 304; delta updates | 0 bytes when unchanged |
| Redux | Only small settings persisted; no fingerprints, queues or lists | Persisted blob ≤ 5 KB for this slice |
| Notifications | Grouped (one summary notification per headless run), `VISIBILITY_PRIVATE` by default | ≤ 1 notification per run |

### 3.2 Backend

| Area | Design rule | Target |
|---|---|---|
| `/sync` query count | Constant per batch: one ownership query for categories, one for accounts, one for rules, one bulk `INSERT … ON CONFLICT DO NOTHING RETURNING`, one bulk transaction insert, one aggregated balance `UPDATE … FROM (VALUES …)` per batch, one budget-alert check per affected category | ≤ 10 queries per 100-item batch, independent of item count |
| Duplicates | Unique index plus `ON CONFLICT`: no check-then-insert, no race | 0 unique-violation 500s |
| Latency | Side effects that don't change money (push notifications, stats) go to BullMQ after commit | p95 ≤ 300 ms for a 100-item batch |
| Reads | `getSyncState` is one `COUNT(*) FILTER (…)` query, cached in Redis for 30 s and invalidated on sync | 1 query, or 0 on cache hit |
| Knowledge pack | Pre-built files on S3/CDN with ETag; the API only redirects or streams, no DB access per request | 0 DB queries per pack request |
| Admin stats | Rollup tables updated hourly and incrementally from a watermark; admin never scans raw tables | Dashboard ≤ 5 indexed queries |
| Money | `DECIMAL(15,2)` in the DB; decimal **string** on the wire; no floats in business logic | — |
| Retention | Cron purges rejected/ignored detected rows after 90 days, diagnostics after 180 days, skeleton submissions after aggregation | Table growth bounded |

### 3.3 Database indexes (new or changed)

| Table | Index | Purpose |
|---|---|---|
| `detected_transactions` | keep `UNIQUE (user_id, dedup_fingerprint)` | Dedup (D1) |
| `detected_transactions` | keep the partial index `(user_id, created_at DESC) WHERE status='pending_review'` | Review inbox |
| `detected_transactions` | add `(user_id, status, transaction_date DESC)` | Detected list / filters (R5, W8) |
| `transactions` | add `(user_id, date, amount)` if not covered by `20260924000000-add-performance-composite-indexes` | Manual-duplicate window query (D4) |
| `transactions` | add partial `(user_id, transfer_group_id) WHERE transfer_group_id IS NOT NULL` | Transfer pairing |
| `merchant_category_rules` | replace `UNIQUE (user_id, merchant)` with `UNIQUE (user_id, merchant_key)` where `merchant_key = lower(normalized)` | Case-insensitive rules (L6) |
| `kb_institution_senders` | `UNIQUE (country, channel, sender_key)` | Sender lookup at pack build |
| `kb_merchant_aliases` | `UNIQUE (alias_key, country)` + `pg_trgm` GIN on `alias_key` (admin search only) | Alias management |
| `detection_skeleton_submissions` | `UNIQUE (skeleton_hash, user_hash)` | k-anonymity counting |
| `detection_daily_stats` | `PRIMARY KEY (day, country, institution_id, source, status)` | Dashboard rollups |
| `detection_diagnostics_daily` | `PRIMARY KEY (user_id, day, stage, reason_code, institution_id)` | Support diagnostics |

---

## 4. Phase 0 — Foundations

| Task | Repo | Work | Acceptance criteria |
|---|---|---|---|
| **T0.1** | all | Sign off D-1…D-8 (§1) | Decisions recorded in this file |
| **T0.2** | core (new) | Create `budgetbrain-detection-core`: TS strict, ESM + CJS builds, `sideEffects: false`, vitest, eslint with a regexp-safety plugin, CI. Move the shared types (`RawIncomingMessage`, `ProcessedTransaction`, statuses, reason codes) here so `mobile/shared/services/sms` no longer imports feature code (A2) | The package installs from a git tag in mobile, backend and web; zero runtime dependencies except `@noble/hashes` |
| **T0.3** | core | **Golden corpus**: `corpus/<country>/<institution>/*.json` with `{sender, body, receivedAt, locale, expected}`, where every body is anonymized (fake names, digits and references). Seed it with all 13 sample messages from gap-doc §4, with their **correct** expected output, plus at least 200 messages across the top 30 Indian institutions and at least 20 per non-IN market before that market launches | CI runs the corpus; any regression fails the build |
| **T0.4** | core | Knowledge-pack schema (JSON Schema): version, country, generatedAt, Ed25519 signature, and sections for institutions, senders, lexicons, templates, merchants, aliases, currencies, rails, taxonomy, MCC map, kill switches | Schema validated in CI; the sample pack signs and verifies |
| **T0.5** | core + mobile + backend | Performance harness: a core micro-benchmark (Node + Hermes), an Android macrobenchmark script (Perfetto trace for a headless run), backend load test (k6/autocannon) for `/sync` | Baseline numbers recorded in this file |

### Phase 0 status (2026-09-24)

`budgetbrain-detection-core` v0.1.0 is built and committed locally (tag `v0.1.0`). **It isn't on GitHub yet:** this session's GitHub integration can't create repositories. Once an empty `navneetpatel-dev/budgetbrain-detection-core` exists, it gets pushed as-is.

| Task | Status | Result |
|---|---|---|
| T0.1 | ✅ Done | Decisions signed off (§1) |
| T0.2 | ✅ Done, not yet pushed | Package with ESM + CJS builds, strict TS, vitest (82 tests), eslint including `eslint-plugin-regexp` backtracking rules, CI on Node 20 and 22. Contains the shared types, money helpers (integer minor units, ISO 4217 minor-unit table) and fingerprint v2. **Verified to install and run in mobile (jest-expo), backend (CommonJS, TS 5.7, Node `require`) and web (TS 6)**, and the fingerprint test vector is identical on all three. Moving the mobile SMS services onto these types (A2) happens when mobile adopts the package in T1.13 / T2.1 |
| T0.3 | 🟡 Framework done; corpus partly filled | Case format, validator, runner and regression baseline (`corpus/baseline.json`), plus `scripts/anonymize-message.ts` for converting real messages. **40 cases:** all 13 gap-doc §4 messages with corrected expectations, and 27 synthetic cases covering every reason code and behaviour (OTP footer, mandates, collect requests, multiple amounts, lakh grouping, Hindi, USD, reversal, cashback, ATM, card-bill legs, own-account transfers, email source). **Still open:** the plan's 200+ field messages across the top 30 Indian institutions need real messages from test devices, anonymized with the script; synthetic cases can't stand in for real bank formats |
| T0.4 | ✅ Done | Pack types, JSON Schema (draft 2020-12), cross-reference validator (a test keeps it in step with the schema), canonical-JSON Ed25519 signing with key ids for rotation, and a signed sample India pack (6 institutions, 10 senders, 21 lexicons, 2 templates, 6 merchants, 11 aliases) using a public **test-only** key |
| T0.5 | 🟡 Harness done; device and server runs pending | Core benchmark results below. The Perfetto trace (`perf/android/`) needs the native module from T2.1, and the k6 test (`perf/backend/sync-load.k6.js`) needs the rewritten `/sync` from T1.6; both get run and recorded at those tasks |

**Deviation from D-2:** the package also uses `@noble/curves` (Ed25519, same audited author and no other dependencies) alongside `@noble/hashes`. Both are **bundled into the build**, so consumers install zero runtime dependencies and the CommonJS backend doesn't need `require(esm)`.

**Baseline (Node 22, 4-core Xeon 2.1 GHz, 40 corpus messages):**

| Benchmark | Mean | p95 | p99 |
|---|---|---|---|
| fingerprint v2 (SHA-256) | 8.9 µs | 12 µs | 33 µs |
| parseDecimalToMinor | 0.5 µs | 0.7 µs | 0.9 µs |
| pack canonicalJson (IN sample) | 0.20 ms | 0.43 ms | 0.74 ms |
| pack validate (IN sample) | 0.05 ms | 0.07 ms | 0.46 ms |
| pack verify signature + validate (IN sample) | 2.0 ms | 2.7 ms | 3.5 ms |
| current mobile v1 engines, whole message | 15 µs | 29 µs | 56 µs |

The v1 engines are fast because they do very little, not because they're right (gap doc §4). The Phase 3 parser's budget is p95 ≤ 1 ms/message in Node (T3.14) and ≤ 5 ms on a mid-range phone (§3.1). Pack verification runs once per downloaded pack, not per message.

---

## 5. Phase 1 — Stop wrong records (ship first, before native work)

### Backend

| Task | Work | Closes | Acceptance criteria |
|---|---|---|---|
| **T1.1** | Migration: `transactions.type` enum adds `refund` and `transfer`; new nullable columns `subtype` (`cashback`, `reversal`, `card_bill`, `p2p`, `self_transfer`, `wallet_topup`), `refund_of_transaction_id` (FK, self), `transfer_group_id` (UUID), `source` (`manual`, `detected`, `import`, `open_banking`), `detected_transaction_id` (FK). `detected_transactions` adds `institution_id` (nullable until Phase 4), `subtype`, `payment_method`, `review_reason`. Model and type updates | P0-4, C3, C4, C6, X6 (column), S6 (server states) | Migration up/down tested on a copy of production data; existing rows unchanged |
| **T1.2** | Update **every aggregate** to the new types. Income = `type='income'` (refunds excluded automatically). Expenses = `expense − refund` (server-side). Transfers excluded from income, expense, savings and budgets. The list to change: `expenses.service` (`getTotalIncome`, `getTotalExpenses`, `getTransactionsSummary`, category breakdown, trends, weekly comparison, no-spend streak), dashboard, reports and exports (exceljs, pdfkit), budgets and budget alerts, net-worth, AI insights, anomaly detection, recurring detection, recap/digest, search | P0-4, W5 (server), spec rules 3–5 | A unit test per aggregate with a fixture of 1 expense, 1 refund, 1 transfer pair, 1 income; `grep "type.*'income'\|'expense'"` reviewed file by file |
| **T1.3** | The detection service creates transactions **only** through a new `expenses.service.createTransactionsBulk(userId, items, {transaction, source:'detected'})`. It locks each affected account once and applies the **aggregated** balance delta; transfers move balance between the two own accounts; refunds add to the balance. It runs budget alerts once per affected category after the batch, writes an audit log per transaction (`TRANSACTION_CREATE`, `actor = system:detection`), builds `searchVector`, sets `paymentMethod` from the detected rail, and resolves `incomeSourceId` for income when a rule exists | P0-5, AD5, X5 (server) | Integration test: balance, budget alert, audit row and search hit for an auto-created transaction |
| **T1.4** | **Validation v2** (`serverValidation.engine.ts`): bulk ownership check of `categoryId` and `financialAccountId` (one `IN` query each); a direction × type matrix (`DEBIT`: expense / transfer; `CREDIT`: income / refund / transfer); `transactionType` **required** (remove the `.default('expense')`); date ≥ now − 400 days and ≤ now + 1 day; currency in the ISO 4217 table; `metadata` limited to an allowed set of keys and ≤ 2 KB; compare the client fingerprint with the recomputed one (count mismatches, don't trust) | P0-6 | Unit tests per rule; foreign category → `validation_error` |
| **T1.5** | **Server confidence**: the client sends evidence flags (template matched, institution verified, amount role unique, direction unambiguous, merchant known, date extracted) instead of just a score. The server recomputes the tier with core's `scoreEvidence()` and uses `min(client, server)`. Auto-create only if the server tier is high **and** the institution is verified **and** no kill switch applies **and** the user's `autoAddHighConfidence` is on | F3, P0-6 | Sending `confidence: 1` with weak evidence → `pending_review` |
| **T1.6** | **Rewrite `/sync`**: validate all → one ownership pass → one rules pass → `INSERT INTO detected_transactions … ON CONFLICT (user_id, dedup_fingerprint) DO NOTHING RETURNING id, dedup_fingerprint` → `createTransactionsBulk` for the high-tier rows that were inserted → one DB transaction per batch. Per-item results for **every** item (`created` / `already_synced` / `validation_error` / `needs_review`); `Idempotency-Key` header cached in Redis for 24 h | D2, D6 (server), S3 (server) | Two concurrent identical batches → exactly one row each, no 500; query count ≤ 10 (asserted in the test by counting Sequelize queries) |
| **T1.7** | A dedicated `detectionSyncRateLimiter` (Redis token bucket: 60 requests/min, 100 items/request, 2,000 items/day per user) instead of `integrationsRateLimiter` (15/min) | S4 (server) | Load test: 20 batches in 1 minute succeed |
| **T1.8** | `rejectPending` only allows `pending_review`. New `POST /detected-transactions/:id/undo` for `auto_approved` / `user_confirmed`: deletes the created transaction through `deleteTransaction` (reverts the balance) and sets status `rejected`. New `DELETE /detected-transactions/:id` for review items | R4, R5 (server), spec rule 18 | Undo restores the account balance exactly |
| **T1.9** | Rules: add a `merchant_key` column (lowercase normalized) and a unique index; **always** look up the user rule by key; the user rule overrides the client's catalog category unless the client marks `categorySource: 'user'` (an explicit choice on this item) | L1, L6 (server), spec rule 8 | A user rule beats a catalog hint in a test |
| **T1.10** | A detected-transaction DTO serializer for all detection endpoints: `amount` as a decimal string, flattened `categoryName`, `confidence` as a number, `institution` name, `reviewReason`, server `id` | P0-7 (server), R3 | Contract test shared with mobile (a JSON fixture in core) |
| **T1.11** | `getSyncState` as one aggregate query + Redis cache (30 s TTL, invalidated by `/sync`) | performance | 1 query |

### Mobile

| Task | Work | Closes | Acceptance criteria |
|---|---|---|---|
| **T1.12** | Remove **both** `/transactions` offline fallbacks in `transactionPipeline.service.ts:214-244`. Interim until T2.8: a dedicated detection retry queue (AsyncStorage, capped at 500 items) that retries `/detected-transactions/sync` in batches | P0-3 | Offline refund stays a refund; pending items never become transactions without review |
| **T1.13** | Review row: parse the amount with core's `parseMoney()` (string → minor units → display through `formatCurrency`); use `category.name` / `categoryName` from the DTO; confidence colours from `CONFIDENCE_THRESHOLDS` | P0-7, R3, F5 | Review screen renders a server fixture without crashing (component test) |
| **T1.14** | Historical sync: chunks of ≤ 100, handles per-item results, reports real counts. Live pipeline: batching (flush after 2 s idle or 20 items) instead of one request per SMS | S3, S4, D6 | A 250-item scan makes 3 requests, all synced |
| **T1.15** | Fix the 2 lint errors (`set-state-in-effect`) and the 8 warnings; stable `availableCategories` (read categories from the query cache inside the pipeline, not a default `[]` argument); row press opens **details** instead of confirming | Q4, A5, R2 | `npm run lint` passes with 0 errors |
| **T1.16** | Interim kill switch: `GET /detection/config` (backend, Redis-cached) → `{enabled, autoCreateEnabled, minAppVersion}` read at start and before each batch | AD3 (interim) | The server can disable auto-create without an app release |
| **T1.17** | Mobile `shared/types` `Transaction.type` adds `refund` and `transfer`; the transaction list, detail and filters display them (refund shown as a credit on its category, transfer as a neutral ⇄ row); forms allow choosing them | C6 (mobile), W5 (mobile part) | Snapshot/component tests for the three types |

---

## 6. Phase 2 — Native access layer and background processing (mobile)

| Task | Work | Closes | Acceptance criteria |
|---|---|---|---|
| **T2.1** | `modules/sms-detector` Expo local module (Kotlin) + `plugins/withSmsDetector.js`. The plugin adds the manifest `BroadcastReceiver` for `android.provider.Telephony.SMS_RECEIVED` (exported, `BROADCAST_SMS` permission guard), `RECEIVE_SMS` / `READ_SMS`, the `HeadlessJsTaskService`, and the WorkManager dependency. JS API: `getPermissionStatus()`, `requestPermissions()`, `drainQueue(limit)`, `scanInbox({sinceMs, limit, simSlot})`, `setSenderFilter(fileUri)`, `setEnabled(bool)` | P0-1, A1 | Works in a dev client and an EAS build on Android 10–15; Expo Go keeps the graceful no-op |
| **T2.2** | Native pre-filter inside the receiver: normalize the sender (strip the operator/route prefix such as `XX-`, uppercase), exact lookup in a `HashSet` loaded lazily from the pack's `senders.bin` / `senders.json`, plus a cheap currency-or-digit scan. Only matching SMS are queued. The filter data comes from the pack (eligibility stage 0), so the access layer has no hardcoded business rules | A2, performance §3.1 | Profiled: non-matching SMS < 1 ms and no JS start |
| **T2.3** | Native candidate queue: a tiny app-private SQLite table `(id, sender, body, received_at, sub_id, msg_id)`. Rows are deleted as soon as JS acknowledges them; bodies older than 7 days are purged even if never processed | privacy §22, S1 | Queue is empty after a drain |
| **T2.4** | WorkManager `OneTimeWorkRequest`, unique name `sms-detect-drain`, `ExistingWorkPolicy.KEEP`, 45 s initial delay → starts `HeadlessJsTaskService` with the task `TransactionDetectionDrain` (30 s timeout). The foreground app drains immediately when active | P0-2 | Killed app + 5 SMS in 10 s → one headless run → 5 processed, 1 sync request |
| **T2.5** | `index.headless.ts`: `AppRegistry.registerHeadlessTask` with lazy `require` of core, the store, the sync manager and the auth token reader (`secureStorage`); no React, no Redux store, and Sentry initialized minimally with a scrubber | performance §3.1 | Bundle graph check: the headless entry doesn't import `src/app/**` or UI libraries |
| **T2.6** | Catch-up scan: on app start/resume and a periodic WorkManager job (every 6 h, `requiresBatteryNotLow`), `scanInbox` from the per-SIM watermark, paged 200, native sender filter. On a fresh install, the initial watermark = `max(server sync-state latestSyncedTransactionDate, now − chosen scan range)` | P0-2, A4, S8 | No duplicate processing across restarts; a fresh install doesn't rescan what the server already has |
| **T2.7** | Pass `msg_id`, `sub_id` (SIM), sender, date and body to JS; `RawIncomingMessage.id` and `simSlot` filled for both live and inbox messages | A3 | The SIM filter excludes the other SIM's messages in a test |
| **T2.8** | Local store (`expo-sqlite`): `detected_local(id, server_id, fingerprint UNIQUE, payload_json, lifecycle, sync_state, review_reason, created_at, updated_at)`, `fingerprints(fp PRIMARY KEY, seen_at)`, `detection_counters(day, stage, reason, institution_id, count)`. Remove `recentFingerprints` from Redux (migrate existing ones) | S1, S2, S5, D5, P0-3 (final), performance | Detected items are visible offline immediately; the Redux slice has no arrays |
| **T2.9** | Sync manager (`features/transaction-detection/services/syncManager.service.ts`): drains `sync_state='pending'` in chunks of 100, backs off exponentially, runs on NetInfo reconnect, applies per-item results (stores `server_id`, marks `synced` / `needs_review` / `validation_error`), invalidates money queries once per batch | S2, D6, Q1, R6 | Unit tests with a mocked API for every result status |
| **T2.10** | Lifecycle state machine (in core, persisted locally): `RECEIVED → ELIGIBLE → PARSED → CLASSIFIED → VALIDATED → DEDUP_CHECKED → CREATED → SYNC_PENDING → SYNCED`, with the side states `NEEDS_REVIEW`, `PARSE_FAILED → IGNORED`, `DUPLICATE → IGNORED`, `INELIGIBLE → IGNORED`. Each has a reason code; no message text is stored | S6, S7 | Every corpus message ends in exactly one terminal state with a reason code |
| **T2.11** | Google Play compliance: SMS permission declaration text, a demo video checklist, and a **`noSms` build variant** (the config plugin toggles off SMS) in case Play rejects the declaration; `BUILD_APK.md` updated | P0-1 (release) | Both variants build |
| **T2.12** | Notifications: one grouped summary per run, `VISIBILITY_PRIVATE` (hide amount on the lock screen, toggle in settings), deep link with the server id (or local id until synced, resolved by the store) | P6, R6 | Tap opens the exact item |

---

## 7. Phase 3 — Parser v2 in core

All pure functions with no I/O. The pack is passed in precompiled form. Each task adds corpus cases.

| Task | Work | Closes | Acceptance criteria |
|---|---|---|---|
| **T3.1** | `processMessage(msg, pack, userCtx)` and `processBatch(...)`, returning `{lifecycle, reasonCode, candidate?, evidence}`. `userCtx` = rules, own instruments, recent-transaction digest, settings. No Redux or store access | Q1, Q2 | Runs unchanged in Node (backend) and Hermes (mobile) |
| **T3.2** | Sender and institution resolver: parse DLT and alphanumeric headers → exact lookup → `institution_id` + `verified`; content second signal (bank name, IFSC/BIC/sort code); unknown sender → `verified=false` (cannot exceed the medium tier) | E2, E5, X6, §6.3 | `FINOTE` → unknown; `VM-HDFCBK` → HDFC Bank verified |
| **T3.3** | Eligibility v2: strip **safety footers** before OTP matching; lexicon classes per language (OTP, promo, non-transaction notices, failed, future/request/mandate); Unicode-aware word boundaries; "transferred / added / withdrawn" included | E1, E2, E3, E4, P4, §6.4c | Gap-doc §4 rows 7, 8 and 10 produce the expected results |
| **T3.4** | Tokenizer: MONEY (ISO 4217 codes and symbols, locale number grammar, lakh grouping, zero-decimal currencies, `Rs.1250.5`), MASKED_ACCOUNT, REFERENCE (UTR/RRN/UPI/IMPS/NEFT/SEPA/ACH shapes including `Ref No`), DATE (day/month order from the institution's country, then device locale; calendar dates **without** `toISOString()`), VPA/wallet/phone, BALANCE/LIMIT phrases | X1, X3, X7, X8, §6.4a, §6.7 | `05/09/26` from an IN bank → 2026-09-05; `23-Sep-26` → 2026-09-23; `$`, `€`, `£` detected |
| **T3.5** | Role assignment: the amount is the MONEY token next to a movement verb and not a balance or limit. **More than one candidate → `NEEDS_REVIEW` (`multiple_amounts`)**; mixed debit and credit wording without a clear winner → `NEEDS_REVIEW` (`ambiguous_direction`); "credit card" treated as a noun phrase, not a credit signal; future/request/mandate → `IGNORED` | X2, E6, E7, E8, spec §27 | Corpus cases for each reason code |
| **T3.6** | Template engine: masked-skeleton builder (shared with T7.4), templates indexed by `institution_id`, field maps, template version recorded in the evidence | §6.4d | A template hit gives exact fields and the evidence flag `templateMatched` |
| **T3.7** | Classifier v2: a type matrix from lexicons + **own-instruments registry** (counterparty is one of the user's own accounts, cards, wallets, VPAs or IBAN masks → transfer) + **transfer pairing** (own DEBIT and own CREDIT with the same amount within 3 days → one `transfer_group_id`) + card-bill rule + P2P detection (personal names, phone numbers, personal VPAs) + subtypes (cashback separate from refund) + refund-to-original candidate (same merchant and amount within 90 days → `refund_of_transaction_id` suggestion) | C1, C2, C3, C4, §6.8 | Gap-doc §4 rows 4, 5 and 11 → transfer; row 13 → ignored |
| **T3.8** | Merchant normalizer and resolver: rail/processor prefix removal, store and terminal number removal, global legal-suffix list, NFKC and case fold, VPA handle → PSP; **strict** matching (exact alias; fuzzy only with Jaro-Winkler ≥ 0.92 + token-set agreement + same country or global brand + never across different Wikidata ids or domains); otherwise the cleaned raw name as its own merchant | X4, M1, §6.5 | `local kirana store` → "Local Kirana Store" (no brand); `VPA swiggy@icici. Avl` → Swiggy with a clean raw name |
| **T3.9** | Category resolver: standard taxonomy + per-user mapping; order: user rule → merchant KB → MCC → context lexicon → Other. Categories only for expense and refund; income uses income-source rules; transfers get no category. No substring matching of category names | C5, L7, §6.9 | Tests per tier |
| **T3.10** | Confidence v2 (`scoreEvidence`): template matched, verified institution, unique amount role, unambiguous direction, known merchant (catalog, not just any string), date **extracted** (not fallback), reference present; penalties for fuzzy merchant or fallback date; per-field reliability `{amount, date, merchant, direction}`: `high` / `medium` / `low` | F1, F2, M2 | Gap-doc §4 row 12 (no merchant, fallback date) → not high unless template matched |
| **T3.11** | Fingerprint v2: `sha256(userId, institutionId, accountTail, amountMinor, currency, direction, reference ?? (date + receivedAt minute bucket))` using `@noble/hashes`; **type and merchant excluded**; the backend computes it with the same core function | D3, D7 | Same message via SMS and via a notification → same fingerprint |
| **T3.12** | Manual-duplicate matcher: client checks a local digest of the last 30 days of transactions (amount, date, type, account); the server checks authoritatively with the `(user_id, date, amount)` index within ±1 day. A match → `NEEDS_REVIEW` (`possible_manual_duplicate`), never a silent drop | D4 | A manually entered ₹450 and a detected ₹450 the same day → review item |
| **T3.13** | Validator v2, run **before** the duplicate check (spec order) | S7 | Lifecycle order asserted in tests |
| **T3.14** | Hot-path optimization: `compilePack()` builds a `Map`/`Set` + combined `RegExp` per lexicon class once; no per-message regex construction; body truncated to 1,000 chars; benchmark in CI | performance §3.1 | Core benchmark p95 ≤ 1 ms/message in Node; Hermes measured in T9.2 |
| **T3.15** | Replace the mobile engines with core: delete `src/features/transaction-detection/engines/*` and `constants/institutionKeywords.ts` / `merchantCatalog.ts`; the pipeline service becomes a thin adapter (store I/O + core call) | Q1, Q2, Q3 | Mobile tests are green; no duplicated engine code remains |

---

## 8. Phase 4 — Knowledge base and knowledge packs

| Task | Repo | Work | Closes | Acceptance criteria |
|---|---|---|---|---|
| **T4.1** | backend | Migrations: `kb_institutions`, `kb_institution_senders`, `kb_lexicons (language, class, phrases jsonb, version)`, `kb_templates (institution_id, skeleton, field_map, status, version)`, `kb_merchants (canonical_name, wikidata_id, domain, country, taxonomy_code, mcc)`, `kb_merchant_aliases`, `kb_mcc_categories`, `kb_category_taxonomy`, `kb_currencies`, `kb_payment_rails`, `kb_pack_versions`, `kb_kill_switches`. Every catalog row has `status` (`draft` / `review` / `published`) and `version`; indexes per §3.3 | AD2, §6.1–6.5, §6.9 | Migrations up/down; models; seed fixture |
| **T4.2** | backend | Idempotent seed importers run as BullMQ jobs: ISO 4217, ISO 18245 MCC, GLEIF, RBI bank list + IFSC dataset, NPCI UPI handles, India DLT headers, FDIC/NCUA, FCA, ECB MFI list, BCB PIX participants, Name Suggestion Index + Wikidata brands, and SWIFT if D-8 says so. Each importer records source, licence and fetch date | §6.3, §6.5, §6.7 | Re-running an importer creates no duplicates; coverage report per country |
| **T4.3** | backend | Pack builder: on publish (or nightly), build a global core pack + one pack per country (minified JSON + brotli), a compact `senders` file for the native pre-filter, Ed25519 signature, deltas since each of the last 5 versions; upload to S3; `GET /detection/knowledge-pack?country=&since=` returns a CDN URL with ETag | §6.2 | 304 when unchanged; the signature verifies in core |
| **T4.4** | mobile | Pack manager: a bundled baseline pack in the app for first run; background update only on unmetered network or while charging; signature check; atomic file swap; keep the last good pack; exports the sender file to the native module (T2.2) | §6.2, Q3 | A corrupted download is rejected and the last good pack stays active |
| **T4.5** | mobile + core | Remove all hardcoded bank and merchant lists (after T3.15) and use the pack | Q3, M1, E5 | `grep` finds no bank or merchant regex lists in mobile |
| **T4.6** | backend + core | Kill switches in the pack and `/detection/config`: per institution, template, country, pack version and app version; core respects them (`IGNORED`, `kill_switch`) | AD3 | Flipping a switch stops auto-create within one config refresh |
| **T4.7** | backend | Optional merchant-enrichment adapter interface (Plaid Enrich / Ntropy / …), **disabled by default** (D-7), server-side only, sends only the normalized merchant string, results cached in `kb_merchant_aliases` as `source='enrichment'` | §6.5 | Off by default; no request leaves the server when disabled |

---

## 9. Phase 5 — Learning, review and correction UX (mobile)

| Task | Work | Closes | Acceptance criteria |
|---|---|---|---|
| **T5.1** | Review screen: **Confirm / Edit / Delete** on each item; an Edit sheet for category, merchant, type (expense / refund / transfer / income), account and note; the review inbox merges local `NEEDS_REVIEW` items (offline) with server pending items; shows the review reason | R1, S5, spec §25 | Component and hook tests; works offline |
| **T5.2** | Learning only when the user **changed** the category (or type or merchant) from what was detected; correct `categoryName`; a single write path (backend confirm/edit does the learning; remove the extra client `POST /rules` call) | L3, L4 | Confirming without a change creates no rule |
| **T5.3** | Rules sync: fetch `GET /detected-transactions/rules` (ETag) on login and daily, merge into the local store, normalized `merchant_key` on both sides | L2, L6 | A reinstall restores the rules |
| **T5.4** | Backend `updateTransaction` hook: when `detected_transaction_id` is set and the category, type or merchant changes, update the detected row and upsert the user rule (same rules as T5.2). Mobile and web edit screens need no special code | L5, spec §26 | Editing an auto-detected transaction in the normal edit screen creates the rule |
| **T5.5** | A "Detected" filter / tab: auto-approved items, transfers (with the paired legs), confirmed items; **Undo** (T1.8) | R5 | Transfers are visible and undoable |
| **T5.6** | Transaction list: an "auto-detected" badge + a "needs review" chip; tapping the chip opens the review item | R7 | Visual check on iOS and Android |
| **T5.7** | Settings: persist `autoAddHighConfidence` in the settings slice **and** server-side (respected by T1.5); a "My accounts" registry (account and card tails, wallet ids, own VPAs), which replaces excluded account tails as the source for transfer detection; "Delete my detected data" (local store + `DELETE /detected-transactions/me`); disabling the feature clears the local store, queue and fingerprints | F4, P7, §6.8 | Toggle off → no auto-create (test); delete clears both sides |
| **T5.8** | Permission explainer rewrite: which messages are read, which fields are extracted (amount, date, merchant, masked account, reference), what is stored where (on the device vs on the server; never the message text), how to disable and delete, and that iOS isn't supported (offer email / import); the claim about ignoring personal messages rephrased to match the real behaviour | P4, P5, spec §23 | Copy reviewed against the spec checklist |
| **T5.9** | Upload minimization: only the **cleaned** merchant name leaves the device (never the raw capture); `institution_id` instead of the raw sender | P3, X6 | Payload test: no raw message fragments |

---

## 10. Phase 6 — Web app and legacy consolidation

| Task | Repo | Work | Closes | Acceptance criteria |
|---|---|---|---|---|
| **T6.1** | backend | Mount the detection routes on the web API (`src/web/routes.ts`) using the same shared controllers and validators, with the rate limits from T1.7 | W2 | Web e2e can list pending items |
| **T6.2** | backend | `POST /detected-transactions/ingest` (text / email / file): parses **server-side with core**, discards the raw text after parsing (never persisted or logged), and results go through the T1.6 sync path with `source` = `pasted_sms` / `email` / `csv` / `ofx` / … | W3, W4, P2 | The request body never reaches the DB (test checks all tables for the raw text) |
| **T6.3** | backend + web + mobile | Retire the legacy `/integrations/sms` and `/integrations/email` endpoints and `parse.service.ts`: move the web and mobile Integrations screens to `ingest`; migration moves pending `parsed_transactions` rows into `detected_transactions`, then **nulls `raw_content`** and drops the table in a later release | P2, W3 | No code path stores raw messages |
| **T6.4** | web | Review inbox page (Confirm / Edit / Delete), Detected tab with Undo, rules manager (view / edit / delete), auto-tracking status page (enabled devices, last sync, pending count, "delete my detected data"), source and status filters and an auto-detected badge in the transaction list, and `Transaction.type` refund/transfer display in lists, dashboards and reports | W1, W5, W6, W7, W8 | Web tests + manual pass |
| **T6.5** | backend + web | Statement import (CSV with column mapping, OFX/QFX, QIF, MT940, CAMT.053) through `ingest` with streaming parsing (no full file in memory), a preview before commit, and dedup through fingerprints | W4, §6.10 | A 10k-row CSV imports with flat memory usage |

---

## 11. Phase 7 — Admin, diagnostics and learning loop

| Task | Repo | Work | Closes | Acceptance criteria |
|---|---|---|---|---|
| **T7.1** | mobile + backend | Diagnostics: the device aggregates `(day, stage, reason_code, institution_id, count)` from `detection_counters` and uploads once a day with the sync; the backend upserts `detection_diagnostics_daily`. No text, no amounts | AD4, AD1 | Support sees "3 messages from HDFC ignored: `otp_marker`" |
| **T7.2** | backend | Hourly incremental rollup into `detection_daily_stats` (from `detected_transactions` using a `created_at` watermark): counts by status, source, institution, country, auto-approve / review / reject / duplicate / undo rates, correction rate per template | AD1 | Dashboard queries only rollup tables |
| **T7.3** | backend + admin | Admin pages and APIs: a detection dashboard; catalog CRUD for institutions, senders, lexicons, templates, merchants, aliases, MCC and taxonomy with draft → review → publish and version history; a kill-switch console; a user-detail "Detection" tab (settings, counts, rules, diagnostics); feature usage includes auto-tracking adoption | AD1, AD2, AD3, AD4, §6.11 | Admin e2e: publish an alias → it appears in the next pack |
| **T7.4** | core + mobile + backend + admin | Template learning (opt-in, D-5): the device uploads `{institution_id / sender header, country, language, skeleton_hash, skeleton, corrected_field}`; the backend stores `detection_skeleton_submissions` with `user_hash = HMAC(userId, secret)`; a k-anonymity view (≥ 10 distinct users) feeds the admin "unrecognised shapes" queue → map fields → publish template → corpus sample required | AD6, §6.6 | Nothing below k is visible to admins |
| **T7.5** | backend + admin | Alias crowd-learning: aliases confirmed by ≥ k users become candidates for global aliases in the admin queue; personal rules always win | §6.6, spec rule 8 | Test: a personal rule overrides a global alias |
| **T7.6** | backend + admin | Privacy tooling: user export and delete include `detected_transactions`, `merchant_category_rules`, diagnostics and skeleton submissions; retention cron (rejected or ignored > 90 days, diagnostics > 180 days); an admin view of deletion requests | AD7, P7 | Delete-account test leaves no detection rows |
| **T7.7** | backend | Audit actions `DETECTION_AUTO_CREATE`, `DETECTION_CONFIRM`, `DETECTION_REJECT`, `DETECTION_UNDO`, `KB_PUBLISH`, `KILL_SWITCH_CHANGE` shown on the admin audit page | AD5 | Rows are visible in admin |

---

## 12. Phase 8 — More sources, then Phase 9 — hardening and release

| Task | Repo | Work | Closes | Acceptance criteria |
|---|---|---|---|---|
| **T8.1** | mobile | `NotificationListenerService` in the same native module: package allowlist from the pack, same native pre-filter and queue, `source='notification'`, a separate permission with its own explainer | A6, §6.10 | UPI app push → detected; the same transaction also received by SMS → one record (T3.11) |
| **T8.2** | backend | Email connector (Gmail/Outlook OAuth read-only scope, or a forwarding address): a BullMQ worker fetches bank-alert messages from the allowlisted senders in the pack, parses with core and discards the body | §6.10 | Raw email is never stored |
| **T8.3** | backend + mobile + web | Open-banking adapter interface (`fetchTransactions(since)` → normalized input) + the first provider per D-6; same sync path, `source='open_banking'`, fingerprint on the provider's transaction id | §6.10 | End-to-end sandbox test |
| **T8.4** | mobile | iOS: hide SMS auto-tracking, show the explainer and offer email / import / open banking | §6.10 | iOS build shows the alternative flow |
| **T9.1** | all | Tests: core unit + corpus; mobile hooks, sync manager, store and pipeline adapter; backend service and integration tests with Postgres **and Redis in CI** (GitHub Actions services, since the current suites fail without a DB); web and admin component tests | Q5, Q6 | CI green in all repos |
| **T9.2** | all | Verify every budget in §3: Perfetto traces for the headless run, battery historian over a 24 h soak, backend k6 load and `EXPLAIN ANALYZE` for each new query; record the results in this file | performance | All budgets met, or a documented exception |
| **T9.3** | all | Staged rollout with kill switches: internal → 5 % → 25 % → 100 %, per country, watching the T7.2 dashboards (correction rate, undo rate) | — | Go/no-go checklist signed |
| **T9.4** | all | Guards that protect what's already right: keep and test the D1 unique index; a log and telemetry scrubber (winston redaction on the backend, Sentry `beforeSend` on mobile and web) plus a test that no message body reaches logs (P1); typecheck in CI for every repo (Q7) | D1, P1, Q7 | Guard tests in CI |

---

## 13. Traceability matrix (every gap → task)

### Blockers
| Gap | Tasks |
|---|---|
| P0-1 | T2.1, T2.11 |
| P0-2 | T2.4, T2.6 |
| P0-3 | T1.12, T2.8, T2.9 |
| P0-4 | T1.1, T1.2 |
| P0-5 | T1.3 |
| P0-6 | T1.4, T1.5 |
| P0-7 | T1.10, T1.13 |

### Detailed gaps
| Gap | Tasks | Gap | Tasks | Gap | Tasks |
|---|---|---|---|---|---|
| A1 | T2.1 | X1 | T3.4 | D1 | T9.4 |
| A2 | T0.2, T2.2 | X2 | T3.5 | D2 | T1.6 |
| A3 | T2.7 | X3 | T3.4 | D3 | T3.11 |
| A4 | T2.6 | X4 | T3.8 | D4 | T3.12 |
| A5 | T1.15 | X5 | T3.4, T3.7, T1.3 | D5 | T2.8 |
| A6 | T8.1 | X6 | T1.1, T3.2, T5.9 | D6 | T1.6, T1.14, T2.9 |
| E1 | T3.3 | X7 | T3.4 | D7 | T3.11 |
| E2 | T3.2, T3.3 | X8 | T3.4 | S1 | T2.3, T2.8 |
| E3 | T3.3 | M1 | T3.8, T4.5 | S2 | T2.8, T2.9 |
| E4 | T3.3 | M2 | T3.10 | S3 | T1.6, T1.14 |
| E5 | T3.2, T4.5 | L1 | T1.9 | S4 | T1.7, T1.14 |
| E6 | T3.5 | L2 | T5.3 | S5 | T2.8, T5.1 |
| E7 | T3.5 | L3 | T5.2 | S6 | T1.1, T2.10 |
| E8 | T3.5 | L4 | T5.2 | S7 | T2.10, T3.13 |
| C1 | T3.7 | L5 | T5.4 | S8 | T2.6 |
| C2 | T3.7 | L6 | T1.9, T5.3 | R1 | T5.1 |
| C3 | T1.1, T3.7 | L7 | T3.9 | R2 | T1.15 |
| C4 | T1.1, T3.7 | F1 | T3.10 | R3 | T1.10, T1.13 |
| C5 | T3.9 | F2 | T3.10 | R4 | T1.8 |
| C6 | T1.1, T1.2, T1.17, T6.4 | F3 | T1.5 | R5 | T1.8, T5.5 |
| | | F4 | T5.7 | R6 | T2.9, T2.12 |
| | | F5 | T1.13 | R7 | T5.6 |

| Gap | Tasks | Gap | Tasks | Gap | Tasks |
|---|---|---|---|---|---|
| P1 | T9.4 | Q1 | T0.2, T2.9, T3.1, T3.15 | W1 | T6.4 |
| P2 | T6.2, T6.3 | Q2 | T3.1, T3.15 | W2 | T6.1 |
| P3 | T5.9 | Q3 | T3.15, T4.4, T4.5 | W3 | T0.2, T6.2, T6.3 |
| P4 | T3.3, T5.8 | Q4 | T1.15 | W4 | T6.2, T6.5 |
| P5 | T5.8 | Q5 | T0.3, T9.1 | W5 | T1.2, T1.17, T6.4 |
| P6 | T2.12 | Q6 | T9.1 | W6 | T6.4 |
| P7 | T5.7, T7.6 | Q7 | T9.4 | W7 | T6.4 |
| | | | | W8 | T6.4 |
| AD1 | T7.1, T7.2, T7.3 | AD4 | T7.1, T7.3 | AD7 | T7.6 |
| AD2 | T4.1, T7.3 | AD5 | T1.3, T7.7 | | |
| AD3 | T1.16, T4.6, T7.3 | AD6 | T7.4 | | |

### Global coverage design (gap doc §6)
| Section | Tasks |
|---|---|
| §6.1 Why the current approach won't scale | T4.1–T4.5, T3.15 |
| §6.2 Target architecture (shared package, packs) | T0.2, T0.4, T4.3, T4.4 |
| §6.3 Institutions | T3.2, T4.1, T4.2 |
| §6.4 Generic parsing (tokenizer, roles, lexicons, templates) | T3.3, T3.4, T3.5, T3.6 |
| §6.5 Merchants | T3.8, T4.1, T4.2, T4.7 |
| §6.6 Learning loop + regression corpus | T0.3, T7.4, T7.5 |
| §6.7 Currencies and money | T3.4, T4.2, T1.10, T1.13 |
| §6.8 Transfers, card bills, own instruments | T3.7, T5.7 |
| §6.9 Category taxonomy | T3.9, T4.1 |
| §6.10 More sources, iOS | T6.5, T8.1, T8.2, T8.3, T8.4 |
| §6.11 Governance (Admin) | T4.6, T7.3 |

### Sample messages (gap doc §4) — all become corpus cases in T0.3
| Row | Fixed by |
|---|---|
| 1 HDFC Swiggy (dirty raw merchant) | T3.8 |
| 2 date `05/09/26` | T3.4 |
| 3 date `23-Sep-26` | T3.4 |
| 4 A→B transfer dropped | T3.3, T3.7 |
| 5 card bill payment → income | T3.7 |
| 6 refund saved as income | T1.1, T1.2 |
| 7 OTP ignored (keep) | T3.3 regression |
| 8 real debit with OTP footer dropped | T3.3 |
| 9 kirana → Zepto | T3.8 |
| 10 `FINOTE` "paid present" | T3.2, T3.3 |
| 11 wallet top-up dropped | T3.7 |
| 12 salary without merchant | T3.8, T3.10 |
| 13 personal SMS | T3.2, T3.3 |

### Mandatory business rules (gap doc §5)
| Rule | Tasks |
|---|---|
| 1 Not every message is a transaction | T3.2, T3.3, T3.5 |
| 2 Not every debit is an expense | T3.7, T1.12 |
| 3 Not every credit is income | T3.7, T1.1, T1.2 |
| 4 Refunds distinguishable | T1.1, T1.2, T1.17, T6.4 |
| 5 Transfers distinguishable | T1.1, T3.7, T5.5 |
| 6 Unknown messages don't create unreliable transactions | T3.2, T3.5, T3.10, T1.5 |
| 7 No duplicates | T1.6, T3.11, T3.12, T1.12 |
| 8 User corrections override | T1.9, T5.2, T5.3, T5.4, T7.5 |
| 9 High confidence may auto-create | T1.5, T3.10 |
| 10 Low confidence → review / ignore | T1.12, T3.10, T5.1 |
| 11 Works without permission | T2.1, T8.4 (keep current behaviour; regression test in T9.1) |
| 12 Backend validates independently | T1.4, T1.5 |
| 13 Raw messages minimized | T2.3, T5.9, T6.2, T6.3, T9.4 |
| 14 Processing independent of UI | T3.1, T3.15 |
| 15 Bank formats don't leak into core model | T3.2, T4.5 |
| 16 Future sources supported | T6.2, T6.5, T8.1–T8.3 |
| 17 Manual entry never blocked | T9.1 regression test |
| 18 Mistakes recoverable | T1.8, T5.1, T5.5, T6.4 |

### Enablers and performance tasks (no single gap ID; required by §3 budgets)
| Task | Purpose |
|---|---|
| T0.1 | Decisions D-1…D-8 |
| T0.5 | Performance harness and baselines |
| T1.11 | One-query, cached `getSyncState` |
| T2.5 | Lightweight headless JS entry |
| T3.14 | Precompiled pack, hot-path budget |
| T9.2 | Verify every §3 budget |
| T9.3 | Staged rollout with kill switches |

**Coverage check:** a script compared every gap ID in the gap doc (7 blockers, 97 detailed gaps, 11 §6 design sections = 111 IDs) against this matrix. All 111 are mapped, and every task referenced here is defined in §4–§12.

---

## 14. New or changed API endpoints

| Method + path | API | Task |
|---|---|---|
| `POST /detected-transactions/sync` (rewritten, idempotency key) | mobile, web | T1.6 |
| `GET /detected-transactions/pending` (DTO), `POST …/:id/confirm` (edit fields), `POST …/:id/reject` (status guard) | mobile, web | T1.8, T1.10, T5.1 |
| `POST /detected-transactions/:id/undo`, `DELETE /detected-transactions/:id` | mobile, web | T1.8 |
| `GET /detected-transactions?status=&source=` (detected list) | mobile, web | T5.5, T6.4 |
| `DELETE /detected-transactions/me` | mobile, web | T5.7 |
| `GET /detected-transactions/rules` (ETag), `PUT`/`DELETE …/rules/:id` | mobile, web | T5.3, T6.4 |
| `POST /detected-transactions/ingest` | mobile, web | T6.2 |
| `GET /detection/config` | mobile, web | T1.16, T4.6 |
| `GET /detection/knowledge-pack?country=&since=` | mobile | T4.3 |
| `POST /detection/diagnostics` | mobile | T7.1 |
| `POST /detection/skeletons` | mobile | T7.4 |
| `GET/POST/PATCH /admin/detection/*` (stats, catalog, publish, kill switches, users/:id/detection, template queue) | admin | T7.3, T7.4 |
| Removed later: `/integrations/sms`, `/integrations/email` | mobile, web | T6.3 |

---

## 15. Dependencies and order

```text
Phase 0 ─► Phase 1 (ship) ─► Phase 2 ─┐
   │                                   ├─► Phase 5 ─► Phase 7 ─► Phase 9
   └──────► Phase 3 ─► Phase 4 ────────┘      │
                        └──────────► Phase 6 ─┘   Phase 8 (after 3, 4)
```

- **Phase 1** can ship on its own and immediately stops wrong records.
- Phases 2 and 3 can run in parallel; T3.15 needs T2.8.
- Phase 4 needs T3.1–T3.6; Phase 6 needs T3.1 and T1.6; T7.4 needs T3.6.

Rough size: Phase 0 S · Phase 1 M · Phase 2 L · Phase 3 L · Phase 4 L · Phase 5 M · Phase 6 M · Phase 7 M · Phase 8 L · Phase 9 M.

---

## 16. Definition of done (per task)

1. Its acceptance criteria pass, and every gap ID it's mapped to in §13 is re-checked against the gap doc wording.
2. `npm run typecheck`, `npm run lint` and `npm test` pass in every repo touched (backend CI runs with Postgres and Redis).
3. Corpus and benchmark CI pass in core; performance budgets from §3 are unchanged or better.
4. Mobile layout or navigation changes get a device pass on iOS and Android (`AGENTS.md` verification gate).
5. No raw message text in logs, analytics, crash reports or the DB (T9.4 guard).
