# Automatic Bank Transaction Detection — Gap Analysis

The code in both repos, checked against *Automatic Bank Transaction Detection — Architecture & Business Logic Specification*.

| | Repo | Commit reviewed |
|---|---|---|
| Mobile | `navneetpatel-dev/budgetbrain-mobile` | `dddb6df` (same as `main`) |
| Backend | `navneetpatel-dev/budgetbrain-backend` | `1f545ab` (`main`) |

**How this was checked**
- Read every file in the detection feature on both sides:
  - mobile: `src/features/transaction-detection/**`, `src/shared/services/sms/**`, `src/shared/store/transactionDetectionSlice.ts`
  - backend: `src/shared/modules/transaction-detection/**`, `src/mobile/features/transaction-detection/**`, the `detected_transactions` migration and the related models
- Ran 13 realistic Indian bank/UPI SMS messages through the mobile engines (see §4).
- Ran the mobile tests, typecheck and lint, and the backend typecheck.

**Status key:** ✅ done · 🟡 partly done / has defects · ❌ missing or broken

---

## 1. Summary

The pipeline is laid out the way the spec asks: one engine per stage, a normalized message model, a detected-transactions table with a unique fingerprint per user, a review inbox and a consent screen.

It is **not ready to ship**, for three reasons:

1. **It can't run on a device.** No native SMS module exists, so the phone never receives or reads a message.
2. **Several mandatory business rules are broken end to end:**
   - refunds are saved as **income** on the backend;
   - the mobile offline path saves refunds and transfers as **expenses** and skips both review and duplicate checks;
   - credit-card bill payments are auto-created as **income**.
3. **The backend does not independently validate what the phone sends (§21).**
   - It trusts the phone's confidence score to decide whether to auto-create.
   - It doesn't check that the category and account belong to the user.
   - Its detection path skips the normal transaction service, so account balances, budget alerts, the audit log and search indexing are never updated.

### Scorecard by spec section

| § | Spec area | Mobile | Backend | Notes |
|---|---|---|---|---|
| 1 | Pipeline stages | 🟡 | — | All stages exist; validation runs *after* the duplicate check, and there is no separate local-create or sync-manager stage |
| 2 | Platform separation | 🟡 | — | `shared/services/sms` imports feature code; Android bridge **does not exist** |
| 3 | Message access layer | ❌ | — | No native module; access layer filters by sender itself (makes a detection decision) |
| 4 | Message normalization | ✅ | — | `RawIncomingMessage` has sender, content, receivedAt, source, id |
| 5 | Eligibility | 🟡 | — | Real debit alerts rejected as OTP; unknown senders still pass; loose sender and keyword patterns |
| 6 | Transaction detection | 🟡 | — | Pure keyword match; mixed debit and credit wording resolved by guessing |
| 7 | Direction | ✅ | ✅ | `DEBIT` / `CREDIT` kept separate from type |
| 8 | Transaction type | 🟡 | ❌ | App `Transaction` model only has `expense \| income`; backend turns refunds into income |
| 9 | Expense logic | 🟡 | — | Every non-transfer, non-refund debit becomes an expense |
| 10 | Income logic | ❌ | — | Every other credit becomes income (card bill payments, P2P, wallet reversals) |
| 11 | Refund | 🟡 | ❌ | Detected on mobile; saved as `type: 'income'` on the backend |
| 12 | Transfer | ❌ | 🟡 | Only "self transfer" wording is caught; backend skips creating a transaction (good) but the transfer is invisible to the user |
| 13 | Extraction | 🟡 | — | Dates misread (US month-first + UTC shift); no payment method; `institutionName` = raw sender ID |
| 14 | Amount | 🟡 | ✅ | Balance is excluded correctly; multiple amounts in one message aren't detected |
| 15 | Merchant | 🟡 | — | Aggressive aliases (`kirana` → Zepto); raw merchant text is dirty |
| 16 | Category engine | 🟡 | 🟡 | Four tiers on mobile; backend applies user rules only when the phone sent no category |
| 17 | User learning | 🟡 | 🟡 | Learns on every confirm (not only corrections); server rules never pulled down to the phone |
| 18 | Confidence | 🟡 | ❌ | Weak scoring; backend trusts the phone's score |
| 19 | Duplicates | 🟡 | 🟡 | Unique index ✅; check-then-insert race; no match against manually entered transactions |
| 20 | Local-first | ❌ | — | No local transaction store; nothing shown until the server responds |
| 21 | Backend sync / validation | 🟡 | ❌ | Normalized payload ✅; backend validates amount and date only |
| 22 | Privacy | 🟡 | 🟡 | Detection path uploads no raw SMS ✅; legacy `/integrations/sms` stores raw SMS text |
| 23 | Permission flow | 🟡 | — | Asked from Settings ✅; explainer missing "what is extracted / stored" |
| 24 | Lifecycle | ❌ | ❌ | Only 5 statuses; no RECEIVED / PARSED / PARSE_FAILED / IGNORED / SYNC_PENDING / SYNCED |
| 25 | Review UX | 🟡 | 🟡 | Badge ✅; no **Edit**; tapping a row confirms it; review list crashes on string amounts |
| 26 | Correction handling | 🟡 | 🟡 | Only category override on confirm; edits in the main list aren't fed back |
| 27 | Failure handling | 🟡 | — | Ambiguous direction and multiple amounts are guessed instead of sent to review |
| 28 | Bank-agnostic | 🟡 | ✅ | India-only sender list and currency regex; core model is bank-agnostic |
| 29 | Extensibility | ✅ | ✅ | `source` enum ready for email, csv and bank_api |
| 30 | Separation of responsibilities | 🟡 | 🟡 | Transaction manager and sync manager folded into one mobile service |
| 31 | Mandatory rules | ❌ | ❌ | See §5 — 9 of 18 rules violated or only partly met |

---

## 2. Blockers (P0)

### P0-1 Mobile: there is no native SMS bridge, so the feature can't run
- `src/shared/services/sms/smsListener.service.ts:15` looks for `NativeModules.SmsListenerModule || NativeModules.SmsReceiver`.
- `src/shared/services/sms/smsReader.service.ts:24` looks for `NativeModules.SmsReaderModule || NativeModules.RNSmsAndroid`.
- Nothing in `package.json`, `app.json` plugins or `plugins/` provides these, and there is no `android/` folder. Both services quietly return nothing, so live detection and the historical inbox scan never fire.
- `app.json` declares `RECEIVE_SMS` / `READ_SMS`. Google Play also requires a *Permissions Declaration* for SMS access, which isn't documented anywhere.
- **Needed:** an Expo config plugin plus a native module (or a maintained library) that provides both the broadcast receiver and the inbox query, and is built into a dev client or EAS build.

### P0-2 Mobile: nothing runs in the background (§3, §20)
- The listener is started by `useTransactionDetectionPipeline()` inside `AuthGate` in `src/app/_layout.tsx`, so it only runs while the JS app is open in the foreground.
- SMS that arrive while the app is killed or in the background are missed, and nothing catches up on next launch. `fetchSyncState()` exists but nothing calls it.
- **Needed:** either a headless JS task started by the broadcast receiver, or an inbox scan on app open from the last processed timestamp.

### P0-3 Mobile: the offline path corrupts records and bypasses review and duplicate checks
`src/features/transaction-detection/services/transactionPipeline.service.ts:214-244`:
- `type: processed.transactionType === 'income' ? 'income' : 'expense'` turns **refunds and transfers into expenses** (breaks rules 2–5).
- It queues a regular `/transactions` create, so:
  - **medium-confidence (`pending_review`) items become real transactions without review** (breaks rule 10, §18);
  - no `dedupFingerprint` reaches the backend, so the server can't dedupe (breaks rule 7).
- The same fallback runs from the `catch`, so **any** sync error lands here. That includes a 429 from the rate limiter (P1-B6) and the 500 from the insert race (P1-B5).

### P0-4 Backend: refunds are saved as income
`src/shared/modules/transaction-detection/transactionDetection.service.ts:120` and `:255` both do `isIncome = type === 'income' || type === 'refund'`. The resulting `Transaction.type = 'income'` inflates income totals, savings and reports. This breaks rule 4 and §10–11.

The `Transaction` model on both sides only allows `'expense' | 'income'` (mobile `src/shared/types`). A refund should either offset an expense (a negative expense, or a `refund` type that reports exclude from income) or get its own type.

### P0-5 Backend: the detection path skips the normal transaction service
`transactionDetection.service.ts:121` and `:256` call `Transaction.create(...)` directly instead of `expenses.service.createTransaction()`. As a result, auto-detected transactions:
- **don't update `FinancialAccount.balance`**;
- **don't trigger `checkBudgetAlertsAfterExpense`**;
- write **no audit log** (`TRANSACTION_CREATE`);
- get no `searchVector`, so they don't show up in search;
- don't check that `categoryId` / `financialAccountId` belong to the user (see P0-6);
- create income rows without `incomeSourceId`.

### P0-6 Backend: no independent validation (§21, rule 12)
`engine/serverValidation.engine.ts` only checks amount > 0 and date ≤ now + 24h. Missing checks:
- **Confidence is trusted from the phone** (`service.ts:90-95`). A client can send `confidence: 1` and every item gets auto-created.
- **No ownership check** that `categoryId` / `financialAccountId` belong to `userId` (sync path). A foreign UUID would be accepted, limited only by the foreign key.
- **No direction/type consistency check.** `CREDIT + expense` and `DEBIT + income` are accepted.
- `transactionType` **defaults to `'expense'`** when missing (`transactionDetection.validator.ts:15`); it should be rejected.
- No lower bound on `transactionDate` (e.g. older than the historical scan window).
- `currency` is only checked as a 3-letter string, not against supported currencies.
- The client-sent `status` is ignored (good), but the client-sent `dedupFingerprint` is never compared with the recomputed one.

### P0-7 Mobile + backend: the review list crashes
- `listPending` returns Sequelize rows. `amount` is `DECIMAL(15,2)`, which comes back as a **string** from `pg` (no `decimalNumbers` / type parser set in `database/config/database.ts`).
- `DetectedTransactionRow.component.tsx:26` calls `transaction.amount.toFixed(2)`, which throws a `TypeError` on a string. Other screens wrap the value in `Number(...)`; this one doesn't.
- The backend returns `category: {id,name,...}`, but the row reads `categoryName`, so the category pill never shows.

---

## 3. Detailed gaps by area

### 3.1 Message access and normalization (§2–4)

| # | Gap | Where |
|---|---|---|
| A1 | Native bridge missing (P0-1) | `shared/services/sms/*` |
| A2 | The access layer makes a detection decision (`isFinancialSender` pre-filter), and `shared/` imports from `features/`, which breaks the layering rule in `AGENTS.md` | `smsListener.service.ts:25`, `smsReader.service.ts:41` |
| A3 | The live listener doesn't set `id` (message id) or `simSlot`, so the SIM filter never applies to live messages and there's no stable message id for dedup | `smsListener.service.ts:29-36` |
| A4 | Historical scan is capped at 300 messages, with no paging and no "last processed" watermark | `historicalSync.service.ts:21-24` |
| A5 | `useTransactionDetectionPipeline()` is called with no categories, and its default `= []` creates a new array every render, so the effect **unsubscribes and resubscribes on every render** and live SMS never get a `categoryId` | `useTransactionDetectionPipeline.hook.ts:8`, `_layout.tsx` |
| A6 | The notification-listener source (`'notification'`) is declared but not implemented (many UPI apps only send push notifications) | types |

### 3.2 Eligibility and detection (§5–6)

| # | Gap | Where |
|---|---|---|
| E1 | `/do\s*not\s*share/` and `/\botp\b/` match the **safety footer on genuine debit alerts** ("Never share your OTP/PIN"), so real transactions are dropped | `eligibility.engine.ts:3-11` |
| E2 | Unknown senders are still eligible: step 5 and the fallback return the same result, so the stage isn't conservative | `eligibility.engine.ts:70-76` |
| E3 | The movement regex has no word boundaries, so "sent" matches "present" / "consent" | `eligibility.engine.ts:62` |
| E4 | "transferred", "added", "withdrawn at ATM"-style wording is missing from the eligibility movement list, so A→B transfers and wallet top-ups are dropped | `eligibility.engine.ts:62` |
| E5 | The sender list is too loose: `/FI/i` matches any sender containing "fi"; `/BOB/`, `/SBI/` are broad; there's no DLT-header (`XX-XXXXXX`) parsing | `constants/institutionKeywords.ts` |
| E6 | `\bcredit\b` matches "credit card", so card spends match both debit and credit, and direction falls back to guessing | `detector.engine.ts:25` |
| E7 | When debit and credit keywords both appear, the earliest one wins. The spec (§27) says ambiguous messages should go to **review / ignore** | `detector.engine.ts:76-85` |
| E8 | No detection of "will be debited" / mandate / autopay-scheduled, or "request" (UPI collect) wording, so future or requested payments are treated as done | detector |

### 3.3 Classification (§7–12)

| # | Gap | Where |
|---|---|---|
| C1 | Transfer is only detected from self-transfer wording. Not handled: A→B own accounts, wallet ⇄ bank, **credit-card bill payment**, FD/RD/SIP moves, loan EMI | `classifier.engine.ts:13` |
| C2 | Every other credit → income (P2P receipts, card bill "payment received", wallet reversals) | `classifier.engine.ts:27` |
| C3 | Cashback is folded into `refund`; the spec lists it separately | `classifier.engine.ts:18` |
| C4 | No link between a refund and its original expense (spec §11 keeps both; linking is optional but useful for reports) | — |
| C5 | Category is resolved with expense categories even for income, refund and transfer | `transactionPipeline.service.ts:88` |
| C6 | The app model has no `refund` / `transfer` type (mobile `shared/types` line 34, backend `TransactionType`) | both |

### 3.4 Extraction (§13–15)

| # | Gap | Where |
|---|---|---|
| X1 | **Dates are misread:** `new Date("05/09/26")` reads month-first (→ May), and `toISOString()` shifts IST dates back one day. `DD-MM-YY` isn't parsed at all. The backend already has a `toLocalIsoDate` helper for this exact bug (`integrations.service.ts`) | `extractor.engine.ts:124-134` |
| X2 | No multiple-amount check (spec §14, §27); the first non-balance amount is taken | `extractor.engine.ts:69-83` |
| X3 | Amounts with one decimal place (`Rs.1250.5`) and lakh formatting edge cases aren't covered | `extractor.engine.ts:14-23` |
| X4 | Merchant capture includes trailing text (`"VPA swiggy@icici. Avl"`, `"DMART on 2026-09-20"`), and `(?:at\|to\|…)` has no word boundary | `extractor.engine.ts:36-40` |
| X5 | Payment method (UPI / card / NEFT / IMPS / ATM / netbanking) isn't extracted; the backend `Transaction.paymentMethod` exists but is never filled | — |
| X6 | `institutionName` is the raw sender (`VM-HDFCBK`), not a normalized bank | `transactionPipeline.service.ts:157` |
| X7 | Reference regex misses `Ref No 1234…` shapes and needs 8+ contiguous characters | `extractor.engine.ts:31-34` |
| X8 | Currency: `\$` inside `\b…\b` never matches; non-INR symbols (€, £) can't satisfy the eligibility check | `extractor.engine.ts:56-59` |
| M1 | Aggressive merchant aliases: `/kirana/` → Zepto, `/mmt/`, `/jio/`, `/uber/`, `/disney/` match unrelated text (spec §15 forbids aggressive merging) | `constants/merchantCatalog.ts` |
| M2 | No per-extracted-field reliability (spec §13 "implicit reliability level") | — |

### 3.5 Category and learning (§16–17, §26)

| # | Gap | Where |
|---|---|---|
| L1 | The backend only applies the user's `MerchantCategoryRule` when the phone sent **no** `categoryId`. The phone usually sends the catalog category, so global rules beat user rules, which breaks rule 8 | backend `service.ts:102-116` |
| L2 | Server rules (including ones learned from manual entries by `createTransaction → upsertMerchantCategoryRule`) are **never pulled down**: `fetchLearnedMerchantRules()` is never called, so local rules are lost on reinstall or a new device | mobile `api/detectedTransactions.api.ts:86` |
| L3 | Learning runs on **every confirm**, even when the user changed nothing, and stores the stale `item.categoryName` with the new id | `useDetectedTransactionsReview.hook.ts:47-55` |
| L4 | Double write: the mobile calls `POST /rules` **and** the backend confirm upserts (with `learnMerchantCategory` defaulting to true) | both |
| L5 | Edits to an auto-detected transaction in the normal expense edit screen don't update rules or the `DetectedTransaction` row | — |
| L6 | Rule matching is an exact, case-sensitive string on the backend and lowercase on mobile, so the two disagree | `service.ts:108`, `category.engine.ts:40` |
| L7 | `findCategoryId` uses `includes()`, so it can match the wrong category (e.g. "Other" inside a longer name) | `category.engine.ts:30-36` |

### 3.6 Confidence (§18)

| # | Gap | Where |
|---|---|---|
| F1 | Sender + amount + direction + date = 0.85 → **high**, with no merchant or reference. The date always scores because it falls back to the received time | `confidence.engine.ts` |
| F2 | "Clear transaction wording", "known merchant" (catalog hit versus any string) and ambiguity penalties aren't scored | `confidence.engine.ts` |
| F3 | The backend trusts the phone's score (P0-6) and has no server-side scoring | backend `service.ts:90` |
| F4 | The "Auto-add high confidence" toggle is local `useState`, and the pipeline never reads it | `AutoTrackingSettingsScreen.screen.tsx:46` |
| F5 | Review row colour thresholds (0.70 / 0.85) don't match the engine tiers (0.50 / 0.80) | `DetectedTransactionRow.component.tsx:51-57` |

### 3.7 Duplicates (§19)

| # | Gap | Where |
|---|---|---|
| D1 | ✅ Backend unique index `(user_id, dedup_fingerprint)` and a server-recomputed fingerprint | migration `20260924010000` |
| D2 | Check-then-insert race: two concurrent syncs → the second hits the unique constraint → **uncaught 500 for the whole batch** after earlier items committed → mobile falls back to the offline queue → **real duplicates** | backend `service.ts:72-97` |
| D3 | Fingerprint includes `transactionType` and merchant, so the same transaction classified differently (for example, SMS vs a notification, or after a parser update) gets a new identity | both engines |
| D4 | No match against **manually entered** transactions. `isFuzzyManualDuplicate` exists and is tested but **nothing calls it**; the backend has no equivalent | `duplicate.engine.ts:138` |
| D5 | Local dedup is a 500-entry ring buffer only; the historical scan can re-send items that were already synced (the server dedupes them, but they still count as "found") | slice |
| D6 | The mobile ignores the per-item `results` (`created` / `already_synced` / `validation_error`) | pipeline, historical sync |
| D7 | The hand-rolled SHA-256 has a dead prime-counting loop and handles non-ASCII input (e.g. `Domino’s`) incorrectly | `duplicate.engine.ts:38-50, 55` |

### 3.8 Local-first, sync and lifecycle (§20–21, §24)

| # | Gap | Where |
|---|---|---|
| S1 | No local store of detected transactions: the `processed` object is returned and then dropped. Nothing is shown until the server responds (§20) | pipeline |
| S2 | `isSynced = true` is set on an object that isn't kept anywhere; there's no SYNC_PENDING → SYNCED tracking or retry via the detection endpoint | pipeline `:202` |
| S3 | **Historical sync sends every found item in one request**, but the backend caps at `max(100)`. A 30–90 day scan easily exceeds that → 400 → silently swallowed → **nothing synced** | `historicalSync.service.ts:88`, backend validator `:34` |
| S4 | Live pipeline makes one `/sync` call per SMS, and `integrationsRateLimiter` allows only **15/min**. A burst → 429 → offline fallback (P0-3) | backend `rateLimit.ts:81`, routes `:21` |
| S5 | The review inbox comes only from the server, so offline pending items can't be reviewed | `useDetectedTransactionsReview.hook.ts` |
| S6 | Lifecycle states from the spec aren't modelled: RECEIVED, DETECTED, PARSED, CLASSIFIED, VALIDATED, PARSE_FAILED, IGNORED, SYNC_PENDING, SYNCED. Rejects are a silent `return null`, with no counters or diagnostics | both |
| S7 | Validation runs after the duplicate check (the spec orders validate → duplicate check) | pipeline `:111-137` |
| S8 | Backend `getSyncState` / watermark is never used by the mobile | — |

### 3.9 Review and correction UX (§25–26)

| # | Gap | Where |
|---|---|---|
| R1 | No **Edit** action; only "Ignore" and "Add Transaction" | `DetectedTransactionRow.component.tsx:119-139` |
| R2 | **Tapping a row confirms it** (the comment says editing was intended) | `DetectedTransactionsReviewScreen.screen.tsx:34-37` |
| R3 | Crash on string amount and missing category name (P0-7) | row `:26` |
| R4 | Backend `rejectPending` doesn't check status: it can "reject" an `auto_approved` or `user_confirmed` row without deleting the created transaction, leaving inconsistent state | backend `service.ts:286-299` |
| R5 | No way to see or undo **auto-approved** items or **transfers** (transfers create no transaction, so they are invisible) | both |
| R6 | Notification deep link uses the **local** id (`detected-…`), not the server `detectedId`; auto-approved notifications open a list, not the transaction | pipeline `:257-264` |
| R7 | The "Needs Review" state isn't shown in the main transaction list (only the "auto-detected" tag badge) | `TransactionItem.component.tsx` |

### 3.10 Privacy and permission (§22–23)

| # | Gap | Where |
|---|---|---|
| P1 | ✅ The detection path never uploads raw SMS, and no raw-message logging was found on either side | — |
| P2 | The legacy `/integrations/sms` endpoint (used by the mobile Integrations screen) **stores the raw SMS** in `parsed_transactions.raw_content`. That's a second, parallel parsing system that conflicts with §22 | backend `integrations.service.ts:20-34` |
| P3 | `merchant` (raw capture) is uploaded with surrounding message fragments (X4), which is more message text than needed | pipeline |
| P4 | The explainer says "Personal messages … are completely ignored", but eligibility doesn't guarantee that (E2) | `PermissionExplainerModal.component.tsx:63` |
| P5 | The explainer doesn't say **what fields are extracted or stored**, or where (§23) | same |
| P6 | Local notifications show the amount and merchant on the lock screen, with no privacy option | pipeline `:248-265` |
| P7 | Turning the feature off doesn't clear local learned rules or fingerprints, and there's no "delete my detected data" option | slice |

### 3.11 Architecture and quality (§28–30, verification gate)

| # | Gap | Where |
|---|---|---|
| Q1 | `transactionPipeline.service.ts` combines detection, Redux, the API call, offline queueing and notifications; there's no separate Transaction Manager or Sync Manager (§30) | mobile |
| Q2 | Engines are tied to the Redux store through the service (`store.getState()`), which makes them hard to reuse for CSV or email sources | mobile |
| Q3 | Bank-agnostic only for India: the sender list and currency regex are INR-centric (§28 is fine for now, but should be data-driven) | constants |
| Q4 | Mobile lint: **2 errors** (`react-hooks/set-state-in-effect`) at `useAutoTrackingSettings.hook.ts:34` and `useDetectedTransactionsReview.hook.ts:39`, plus 8 warnings | lint |
| Q5 | Mobile tests: 14 engine tests pass; **no tests** for the pipeline, transfers, date parsing, the offline path or the hooks | tests |
| Q6 | Backend tests: 6 engine tests exist, but the suites need Postgres (couldn't run here); **no service or integration tests** for sync, confirm or reject | backend |
| Q7 | Backend typecheck passes; mobile typecheck passes | — |

---

## 4. Sample SMS results (mobile engines)

Run with `TZ=Asia/Kolkata`, received at `2026-09-23T10:00+05:30`.

| Message (abridged) | Result | Expected | Gap |
|---|---|---|---|
| HDFC: Rs.1,250 debited a/c **1234 … VPA swiggy@icici. Avl Bal Rs 20,500 | expense 1250, Swiggy, high | ✅ | raw merchant `"VPA swiggy@icici. Avl"` (X4) |
| HDFC: Sent Rs.500 … To RAMESH KUMAR On 05/09/26 Ref 4256… | expense 500, **date 2026-05-08** | 2026-09-05 | X1 |
| ICICI: … debited Rs 1000 on 23-Sep-26 | expense 1000, **date 2026-09-22** | 2026-09-23 | X1 |
| SBI: Rs 2000 transferred from A/c XX4455 to A/c XX9988 | **dropped** | transfer | E4, C1 |
| Axis: Payment of Rs 15,000 received towards your Credit Card | **income, high → auto-created** | transfer | C1, C2 |
| HDFC: Rs 500 refund credited from AMAZON | refund 500, high | ✅ (then backend saves it as **income**, P0-4) | P0-4 |
| HDFC: Your OTP for txn of Rs 5000 … Do not share | ignored | ✅ | — |
| HDFC: Rs 2,500 spent on Credit Card at DMART … Never share your OTP/PIN | **ignored** | expense 2500 | E1 |
| Kotak: Rs 300 debited … at local kirana store | expense, merchant **Zepto** | unknown merchant | M1 |
| `FINOTE`: "Rs 999 paid present" | **expense 999, high** | ignore | E3, E5 |
| Paytm: Rs 1000 added to your Paytm Wallet from HDFC | dropped | transfer | C1 |
| HDFC: Salary of Rs 50,000 credited … by ACME CORP | income 50000, high, **no merchant** | ✅ (merchant "ACME CORP") | X4, F1 |
| +91 personal: "I sent you Rs 500 yesterday, received?" | **income 500, medium → review** | ignore | E2 (the live listener pre-filter hides it; the engine doesn't) |

---

## 5. Mandatory business rules (§31)

| # | Rule | Status | Why |
|---|---|---|---|
| 1 | Not every message is a transaction | 🟡 | E1–E5 |
| 2 | Not every debit is an expense | ❌ | C1, P0-3 |
| 3 | Not every credit is income | ❌ | C2, P0-4 |
| 4 | Refunds distinguishable from income | ❌ | P0-4, C6 |
| 5 | Transfers distinguishable | ❌ | C1, P0-3, R5 |
| 6 | Unknown messages must not create unreliable transactions | 🟡 | E2, F1, E7 |
| 7 | Duplicates never created | 🟡 | D2, D4, P0-3 |
| 8 | User corrections override automatic categorization | ❌ | L1, L2 |
| 9 | High confidence may auto-create | ✅ | (but see F1) |
| 10 | Low confidence → review / ignore | 🟡 | Low is dropped ✅; medium bypasses review offline (P0-3) |
| 11 | App works without message permission | ✅ | |
| 12 | Backend independently validates | ❌ | P0-6 |
| 13 | Raw messages minimized and protected | 🟡 | P2, P3 |
| 14 | Processing independent of UI | ✅ | engines/services, no UI logic |
| 15 | Bank formats don't leak into core model | 🟡 | X6 (raw sender stored as institution) |
| 16 | Supports future sources | ✅ | `source` enum, normalized input |
| 17 | Doesn't block manual entry | ✅ | |
| 18 | Mistakes recoverable by edit / delete | 🟡 | R1, R4, R5 |

---

## 6. Suggested fix order

1. **Make it run:** native SMS module + config plugin (P0-1); background or catch-up processing (P0-2); fix the review-row crash (P0-7).
2. **Stop wrong records:**
   - remove the `/transactions` offline fallback and queue to `/detected-transactions/sync` instead (P0-3);
   - give refunds their own handling on the backend (P0-4);
   - route creates through `createTransaction` (P0-5);
   - add server-side confidence scoring and ownership / consistency checks (P0-6).
3. **Parser accuracy:** OTP footer (E1), conservative unknown senders (E2), word boundaries and sender list (E3, E5), transfer and card-bill detection (C1, C2), DD/MM dates without UTC shift (X1), send ambiguous direction or multiple amounts to review (E7, X2), merchant cleanup and aliases (X4, M1).
4. **Sync correctness:**
   - chunk historical sync into ≤100 items and batch the live pipeline (S3, S4);
   - catch unique-violation errors per item (D2);
   - handle the per-item results (D6);
   - keep a local detected store with SYNC_PENDING / SYNCED (S1, S2).
5. **Learning and UX:** user rules override catalog on the backend (L1); pull server rules down (L2); learn only on real corrections (L3); add an Edit flow and stop tap-to-confirm (R1, R2); status check on reject (R4); a view for transfers and auto-approved items (R5).
6. **Privacy and quality:** retire or align the raw-storing `/integrations/sms` path (P2); complete the explainer (P5); clear data on disable (P7); fix the lint errors; add pipeline, service and integration tests (Q4–Q6).
