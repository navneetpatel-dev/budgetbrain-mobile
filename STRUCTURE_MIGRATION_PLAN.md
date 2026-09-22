# Mobile Structure Migration Plan

**Target spec (authoritative):** `structure/mobile/MOBILE-STRUCTURE-CONVENTIONS.md` (generic) + `structure/mobile/EXPO-STRUCTURE-CONVENTIONS.md` (Expo-specific). Read both before touching any file.

**Conflict with current docs:** `mobile/AGENTS.md` (imported by `mobile/CLAUDE.md`) documents a *different* architecture than the target spec — `services/` instead of `api/`, no dot-suffixed filenames, `components/{layout,ui}/` instead of per-functionality subfolders, no `.styles.ts` naming requirement, no `stores/`/`containers/` categories. That document is being **superseded**, not reconciled. Phase 4 below rewrites it. Until Phase 4 lands, `AGENTS.md` is describing the old target — do not use it to justify new code.

`mobile/STRUCTURE_REVIEW.md`'s one flagged issue (leftover root-level Expo-template `components/`/`constants/`) is **already fixed** — no such dirs exist at mobile root anymore. No action needed.

---

## Compliance summary

| Rule area | Status | Evidence |
|---|---|---|
| Feature/shared split (generic §3) | ✅ Good | Every domain lives under `features/<name>/`; `shared/` holds genuinely cross-feature code only. |
| `.screen.tsx` suffix | ⚠️ Partial | 36 files correctly suffixed; **7 screens missing it**: `ai/screens/AiScreen.tsx`, `auth/screens/{ForgotPasswordScreen,VerifyEmailScreen,RegisterScreen,OtpLoginScreen,LoginScreen,ResetPasswordScreen}.tsx`. |
| `.component.tsx` suffix | ❌ Not adopted | Only 2/63 components suffixed (`PinPadModal.component.tsx`, `PaywallModal.component.tsx`). 61 components use plain PascalCase `.tsx`. |
| `.hook.ts` suffix | ❌ Not adopted | Only 9/73 hooks suffixed. 64 use plain `useX.ts`. |
| `.styles.ts` StyleSheet dictionaries | ✅ Good | Widely and consistently adopted across features and shared — this is the strongest-compliance area. Spot-checked files use `StyleSheet.create` named dictionaries, not inline `style={{}}`. |
| `api/` for network calls | ❌ Not adopted | Only 1 folder (`settings/api/devices.api.ts`) matches. **8 features use `services/` instead** (`auth`, `budgets`, `expenses`, `family`, `subscriptions`, +3 in `shared/services/`). Content of `services/*.service.ts` (e.g. `auth.service.ts`) is a thin network wrapper — semantically identical to what the doc calls `.api.ts`. This is a naming/location gap, not a logic gap. |
| `types/<functionality>/` | ❌ Sparse | Only `auth/types/` exists. Other features either skip local types or inline them. |
| `constants/<functionality>/` | ⚠️ Sparse | Only `ai/constants/`, `settings/constants/` exist. Acceptable where there's nothing to name yet — do not force empty folders. |
| `stores/<functionality>/` (feature-level) | ❌ Not used | Zero feature-level stores. All global state lives in `shared/store/` (Redux). This may be fine — see Finding 6. |
| `containers/` | ❌ Not used | Zero `.container.tsx` files anywhere. See Finding 7. |
| Token system (`shared/theme/`) | ✅ Accepted deviation | `shared/theme/{palettes,buildTheme,types}.ts` covers all 5 token categories (color/space/type/radius/elevation). Per `mobile/AGENTS.md`, this **is** the project's token layer — doc's `shared/styles/tokens/` naming is not required to be adopted literally. **Do not** create a parallel `styles/tokens/` folder. |
| Secure token storage (Expo §7) | ✅ Good | Auth tokens go through `shared/services/secureStorage.ts` → `expo-secure-store`. `AsyncStorage` usage found only in `pendingReceipts.ts`, `settingsSlice.ts`, `storage.ts`, `queryClient.ts` — all non-sensitive (settings, query cache, offline receipt queue), not tokens. No violation. |
| Client-side money math (generic §12) | ✅ Good | No `.reduce()`/sum/total derivation found in `expenses`, `budgets`, `goals`. Values are displayed as returned by the API. |
| Inline `.map()` in JSX (generic §5, Expo §4) | ⚠️ Needs per-file check | `.map()` found in `expenses/screens/{ExpenseDetailScreen,AddExpenseScreen}.screen.tsx`, `expenses/components/{TransactionFilters,TagInput,FilterEntityPicker}.tsx`, `budgets/screens/AddBudgetScreen.screen.tsx`. Some may be small fixed-size option lists (arguably fine); any that render a scrollable/growing collection must move to a `*List` + `FlatList`/`*Row` pair per Expo doc §4. Verify each before rewriting. |
| Route groups (`app/`) | ⚠️ Stylistic gap | See Finding 8 below — recommendation included. |

---

## Findings (priority order)

1. **`.component.tsx` suffix missing on 61 files.** Violates MOBILE-STRUCTURE-CONVENTIONS.md §4 (every file fits exactly one row; `.component.tsx` is the required extension for presentational files). Mechanical rename, but must update every import site.
2. **`.hook.ts` suffix missing on 64 files.** Same rule, same mechanical-rename category. Note 9 files already use it (`useBudgetsScreen.hook.ts`, `useDashboardScreen.hook.ts`, `useAddExpenseForm.hook.ts`, `useExpensesScreen.hook.ts`, `useDevices.hook.ts`, `useSettingsScreen.hook.ts`, `useOnboardingForm.hook.ts`, +2 more) — this looks like a partial migration someone already started. Finish it.
3. **`services/` → `api/` rename, 8 features.** `auth/services/{auth,social-auth}.service.ts`, `budgets/services/confirmations.ts`, `expenses/services/receipts.ts`, `family/services/familyInvite.service.ts`, `subscriptions/services/webHandoff.service.ts` are thin network wrappers and map cleanly to `.api.ts` under `api/`. **Exception:** `shared/services/{analytics,api,biometrics,monitoring,notifications,offlineSync,pendingReceipts,queryClient,queryInvalidation,secureStorage}.ts` are cross-cutting native-module/SDK wrappers (push, biometrics, secure storage, offline queue, analytics) — these don't fit the doc's `api`/`hooks`/`utils` taxonomy cleanly. **Recommendation:** keep `shared/services/` as an accepted, named 11th category (documented explicitly in the rewritten AGENTS.md, Phase 4) rather than force-fitting native wrappers into `api/`. Only feature-level `services/` (which are pure network calls) get renamed to `api/`.
4. **7 screens missing `.screen.tsx`** (listed in compliance table). Trivial renames.
5. **Per-feature `types/` mostly absent.** Low priority — add only where a feature actually has multiple non-trivial types to name (e.g. `budgets`, `goals`, `loans`, `expenses` likely qualify; features with a single inline prop type do not need a folder per generic §2's flat-vs-subfolder rule).
6. **No feature-level `stores/`.** Everything global lives in `shared/store/` (Redux Toolkit: `authSlice`, `settingsSlice`). This is consistent with generic §3 ("genuinely cross-feature... → shared") as long as no feature needs isolated cross-screen state of its own. **No action required** unless a specific feature is found needing screen-to-screen state that doesn't belong globally — none found in this audit.
7. **No `.container.tsx` anywhere.** The doc describes `containers/` as "wires one or more hooks to one component, mounted once at app level" — this is an optional category for app-level provider wiring, not mandatory per feature. `shared/components/confirm/ConfirmDialogProvider.tsx` is functionally a container but isn't named/located as one. **Recommendation:** rename/move it to `shared/containers/ConfirmDialogProvider.container.tsx` as the one concrete instance; don't invent containers elsewhere without a real need.
8. **Route groups:** `app/` has `(auth)/`, `(onboarding)/`, `(tabs)/` plus ~15 authenticated route folders directly under `app/` with no wrapping group, whereas the Expo doc's illustrative tree nests all authenticated routes under `(app)/`. Route groups don't affect the URL, so this is organizational only, not a routing defect. **Recommendation: do not do this migration.** Wrapping ~15 existing route folders in a new `(app)/` group touches every route file's location and every `router.push` path assumption for zero runtime benefit, and the doc explicitly says its tree is illustrative of *grouping by navigation concern*, which `(tabs)/` already satisfies for the tab set. Treat as an accepted deviation; note it in the Phase 4 AGENTS.md rewrite so it isn't re-flagged later.
9. **Money math and secure storage are already compliant** — no remediation needed, called out so Phase 5 verification doesn't waste time re-checking from scratch beyond a final grep.

---

## Recommended target folder shape

Worked example — `features/expenses/` (largest feature by file count), current → target:

```
features/expenses/
  api/                                          # was: services/
    receipts.api.ts                             # was: services/receipts.ts
  components/
    FilterEntityPicker.component.tsx            # was: FilterEntityPicker.tsx
    FilterEntityPicker.styles.ts                # unchanged
    TagInput.component.tsx                      # was: TagInput.tsx
    TagInput.styles.ts                           # unchanged
    TransactionFilters.component.tsx            # was: TransactionFilters.tsx
    TransactionFilters.styles.ts                 # unchanged
    TransactionItem.component.tsx               # was: TransactionItem.tsx (this is the *Row for lists — rename, verify no .map() violation remains upstream)
    TransactionItem.styles.ts                    # unchanged
  hooks/
    useAddExpenseForm.hook.ts                    # unchanged (already correct)
    useCategorySuggestion.hook.ts                # was: useCategorySuggestion.ts
    useCreateExpense.hook.ts                     # was: useCreateExpense.ts
    useExpenseDetail.hook.ts                     # was: useExpenseDetail.ts
    useExpenseTagSuggestions.hook.ts             # was: useExpenseTagSuggestions.ts
    useExpensesScreen.hook.ts                    # unchanged (already correct)
    useReceiptPicker.hook.ts                     # was: useReceiptPicker.ts
  screens/
    AddExpenseScreen.screen.tsx                  # unchanged
    AddExpenseScreen.styles.ts                   # unchanged
    ExpenseDetailScreen.screen.tsx               # unchanged
    ExpensesScreen.screen.tsx                    # unchanged
    ExpensesScreen.styles.ts                     # unchanged
  utils/
    transactionFilters.ts                        # unchanged (plain utils keep no suffix per doc)
    __tests__/transactionFilters.test.ts          # unchanged
  types/
    expenses.types.ts                            # NEW — extract inline prop/API types currently scattered across components/hooks, if any warrant it
  index.ts                                        # NEW if missing — feature barrel per generic §6 cross-feature import rule
```

Apply the same four transforms (`services/`→`api/` + `.api.ts`, bare component → `.component.tsx`, bare hook → `.hook.ts`, verify `.screen.tsx`) to every other feature.

---

## Step-by-step migration plan

### Phase 1 — shared/ decisions (no renames needed, just document)
- [ ] In the Phase 4 AGENTS.md rewrite, explicitly codify `shared/theme/` as the accepted token-layer name (supersedes `shared/styles/tokens/`).
- [ ] Explicitly codify `shared/services/` as an accepted 11th category for native-module/SDK wrappers (push, biometrics, secure storage, offline sync, analytics, monitoring, query client) — these are not renamed.
- [ ] Rename `shared/components/confirm/ConfirmDialogProvider.tsx` → `shared/containers/ConfirmDialogProvider.container.tsx`; update its one import site.

### Phase 2 — per-feature mechanical renames (repeat the `expenses/` pattern above)
Work top-to-bottom by priority (screens users touch most / most files first). For every feature: (a) `services/*.service.ts` → `api/*.api.ts` where content is a pure network wrapper, (b) bare component `.tsx` → `.component.tsx`, (c) bare hook `useX.ts` → `useX.hook.ts`, (d) bare screen `XScreen.tsx` → `XScreen.screen.tsx`, (e) update all import sites, (f) `npx tsc --noEmit` after each feature to catch broken imports immediately rather than batching.

| Feature | Components to suffix | Hooks to suffix | services→api | Screens to suffix | Priority |
|---|---|---|---|---|---|
| auth | 11 | 6 | 2 files | 6 | 1 (highest file count + has the services/ rename + screen suffix gaps) |
| expenses | 4 | 6 | 1 file | 0 | 2 (worked example above) |
| settings | 6 | 8 | 0 (already has `api/devices.api.ts`) | 0 | 3 |
| budgets | 1 | 3 | 1 file | 0 | 4 |
| goals | 1 | 4 | 0 | 0 | 5 |
| loans | 1 | 4 | 0 | 0 | 5 |
| income | 1 | 2 | 0 | 0 | 6 |
| dashboard | 2 | 2 | 0 | 0 | 6 |
| ai | 5 | 1 | 0 | 1 | 6 |
| family | 1 | 4 | 1 file | 0 | 6 |
| subscriptions | 1 | 1 | 1 file | 0 | 7 |
| navigation | 2 | 0 | 0 | 0 | 7 |
| notifications | 0 | 1 | 0 | 0 | 8 |
| recurring | 0 | 3 | 0 | 0 | 8 |
| onboarding | 0 | 2 | 0 | 0 | 8 |
| reports | 0 | 1 | 0 | 0 | 8 |
| support | 0 | 1 | 0 | 0 | 8 |
| accounts | 0 | 1 | 0 | 0 | 8 |
| categories | 0 | 2 | 0 | 0 | 8 |
| integrations | 0 | 1 | 0 | 0 | 8 |
| investments | 0 | 1 | 0 | 0 | 8 |
| net-worth | 0 | 0 | 0 | 0 | — (already screen-only, no change) |
| legal | 0 | 0 | 0 | 0 | — |
| recap | 0 | 0 | 0 | 0 | — |
| shared/components/ui | ~18 | — | — | — | 3 (high-traffic design-system primitives; do alongside settings) |

- [ ] Work through the table feature-by-feature; check each box only after `tsc`/lint pass clean for that feature.

### Phase 3 — JSX cleanliness pass
- [ ] Open each of the 6 files with `.map()` flagged in Finding 9 / compliance table. For each: if it renders a bounded, non-scrolling set (e.g. a fixed filter-chip row), leave as-is and note why in a one-line comment; if it renders a scrollable/unbounded collection, extract a `*List.component.tsx` (using `FlatList`) + `*Row.component.tsx` pair per Expo doc §4.
- [ ] While in each file, check for inline arrow-function handlers beyond the one documented parameterized-callback exception (generic §5) and extract to the hook if found.

### Phase 4 — rewrite `mobile/AGENTS.md`
- [ ] Replace the current architecture section with the target shape from `structure/mobile/*.md`, folding in the three accepted deviations from Phase 1 (theme/, shared/services/, no `(app)/` route wrapper) as explicitly documented exceptions so they're never mistaken for drift again.
- [ ] Update the "Example: auth feature" block to show the new `api/`/`.hook.ts`/`.component.tsx` shape.
- [ ] Update the naming-conventions table to add the four suffix rules.

### Phase 5 — verification (Expo doc §10)
- [ ] `npx tsc --noEmit`
- [ ] `npm run lint`
- [ ] `npm test`
- [ ] `npx expo start` — device/simulator pass on iOS **and** Android for every screen touched in Phase 3 (list/overlay behavior can't be typechecked).
- [ ] Final grep sweep: `grep -rE "AsyncStorage" src/features/auth`, `grep -rE "\.reduce\(|totalAmount" src/features/{expenses,budgets,goals}` — confirm both stay clean (they were clean at audit time; re-check nothing regressed during the rename pass).
