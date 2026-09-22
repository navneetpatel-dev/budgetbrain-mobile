# Mobile — Architecture & Folder Structure

Authoritative shape: `structure/mobile/MOBILE-STRUCTURE-CONVENTIONS.md` and `structure/mobile/EXPO-STRUCTURE-CONVENTIONS.md`, with the three accepted deviations below. This file describes the code as it is.

## Overview

All application code lives under `src/`:

```
mobile/
└── src/
    ├── app/                  # Expo Router routes (thin re-exports)
    ├── features/             # Domain modules
    └── shared/               # Cross-feature code and app infrastructure
```

**Import paths**

- Features: `@/features/<domain>/...`
- Shared: `@/shared/...`

Import the suffixed file directly (`LoginScreen.screen`, `useLogin.hook`, `auth.api`). A feature `index.ts` barrel, where one exists (`auth`, `expenses`, `subscriptions`), re-exports that feature's public surface.

---

## Feature module structure

```
src/features/<domain>/
├── api/                      # Thin network wrappers only (*.api.ts)
├── components/               # Presentational UI (*.component.tsx + colocated *.styles.ts)
├── hooks/                    # State, effects, handlers (*.hook.ts)
├── screens/                  # One screen per route (*.screen.tsx + colocated *.styles.ts)
├── utils/                    # Pure functions (plain .ts)
├── types/                    # Request/response and shared form types (*.types.ts)
├── constants/                # Feature constants, when there is something to name
└── index.ts                  # Public barrel, when the feature has one
```

Do not add an empty folder. One file for a concern stays flat; two or more files for the same functionality get a subfolder.

Styles are colocated `*.styles.ts` files (`StyleSheet.create` dictionaries) next to the component or screen. They are not a separate `styles/` tree.

### Layer rules

| Suffix | Allowed | Forbidden |
|---|---|---|
| `.component.tsx` | Presentation, composition, conditional rendering of already-computed values | `useState` / `useEffect`, API calls, data transformation, inline `.map()` of a growing list, inline arrow handlers (except a callback that binds one row id), hardcoded `style={{}}` |
| `.screen.tsx` | Compose that screen's hooks and components | Its own business logic, API calls, inline list rendering |
| `.hook.ts` | State, effects, API orchestration, event handlers, derived state | JSX. A hook file that already contains JSX uses `.hook.tsx` |
| `.api.ts` | Network calls only, one function per endpoint | Business logic, React state, JSX |
| `.styles.ts` | Named `StyleSheet.create` dictionaries | Logic beyond a simple variant or `Platform.select` |
| `.container.tsx` | Wires hooks to one component, mounted once at app level | Its own business logic |
| plain `.ts` in `utils/` | Pure functions | State, network, JSX |
| `app/**/*.tsx` | Re-export one feature screen | Hooks, API calls, styles, lists |

---

## Accepted deviations

These are intentional. Do not "fix" them back toward the generic doc's folder names.

1. **Tokens live in `shared/theme/`**, not `shared/styles/tokens/`. `palettes.ts`, `buildTheme.ts`, and `types.ts` cover color, space, type, radius, and elevation. Extend `theme/` in place. Do not add a second token folder or a second styling system.
2. **`shared/services/` is a named category** for cross-cutting native-module and SDK wrappers: the HTTP client (`api.ts`), secure storage, biometrics, push notifications, offline sync, analytics, monitoring, and the query client. These are not feature network wrappers and are not moved into `api/`. Auth tokens go through `secureStorage.ts` (`expo-secure-store`), never `AsyncStorage`.
3. **No `(app)/` route group.** `src/app/` groups by navigation concern that already exists: `(auth)/`, `(onboarding)/`, and `(tabs)/`. Other authenticated routes sit directly under `app/` (`expense/`, `budget/`, `goal/`, and the rest). Route groups do not change the URL, and wrapping those folders would churn every route and `router.push` path for no runtime benefit.

`shared/containers/` holds app-level provider wiring. `ConfirmDialogProvider.container.tsx` is the current instance.

A feature file that is not a network call does not go in `api/`. `budgets/services/confirmations.ts` only opens the confirm dialog, so it stays there.

---

## Example: `auth` feature

```
src/features/auth/
├── api/
│   ├── auth.api.ts
│   ├── social-auth.api.ts
│   └── index.ts
├── components/
│   ├── layout/
│   │   ├── AuthShell.component.tsx
│   │   └── AuthHeroHeader.component.tsx
│   └── ui/
│       ├── AuthFooter.component.tsx
│       ├── SocialAuthButtons.component.tsx
│       └── ...
├── hooks/
│   ├── useLogin.hook.ts
│   └── ...
├── screens/
│   ├── LoginScreen.screen.tsx
│   └── ...
├── types/
│   └── auth.types.ts
└── index.ts
```

**Route file** (`src/app/(auth)/login.tsx`):

```tsx
export { LoginScreen as default } from '@/features/auth/screens/LoginScreen.screen';
```

---

## Shared layer

```
src/shared/
├── components/           # Design-system primitives (*.component.tsx)
│   ├── ui/               # index.ts re-exports index.component.tsx; import `@/shared/components/ui`
│   └── brand/
├── containers/           # App-level providers (*.container.tsx)
├── hooks/                # App-wide hooks (*.hook.ts / *.hook.tsx)
├── services/             # Native/SDK wrappers (see deviation 2)
├── store/                # Redux slices (cross-feature state)
├── theme/                # Token layer (see deviation 1)
├── types/
├── utils/
├── constants/
└── validation/
```

There is no feature-level `stores/` folder. Global state stays in `shared/store/`.

---

## Naming conventions

| Item | Convention | Example |
|---|---|---|
| Feature folder | lowercase domain | `auth`, `expenses`, `budgets` |
| Component | PascalCase + `.component.tsx` | `AuthShell.component.tsx` |
| Hook | `use` + PascalCase + `.hook.ts` | `useLogin.hook.ts` |
| Screen | `<Name>Screen.screen.tsx` | `LoginScreen.screen.tsx` |
| API | `<name>.api.ts` under `api/` | `auth.api.ts` |
| Styles | colocated `<Name>.styles.ts` | `AuthShell.styles.ts` |
| Types | `<domain>.types.ts` | `auth.types.ts` |
| Container | `<Name>.container.tsx` | `ConfirmDialogProvider.container.tsx` |
| Util | plain `.ts` | `transactionFilters.ts` |

---

## Adding a new feature

1. Create `src/features/<domain>/` and add only the layers that have files (`api/`, `components/`, `hooks/`, `screens/`, `types/`, `utils/`).
2. Put network calls in `api/*.api.ts`. Put native SDK wrappers that are app-wide in `shared/services/`.
3. Name files with the suffix table above. Colocate `*.styles.ts` next to the component or screen, and take colors, space, type, radius, and elevation from `shared/theme/`.
4. Export a public `index.ts` when another feature needs to import from this one.
5. Add a thin route in `src/app/` that re-exports the `.screen.tsx`. Do not wrap authenticated routes in a new `(app)/` group.

---

## Shared UI design system

Use these from `@/shared/components/ui` for consistent screen styling:

| Component | Use for |
|---|---|
| `FeatureHeader` | Compact eyebrow + title + subtitle (+ optional action/footer) |
| `StickyHeaderScreen` | Tab screens: fixed header, scroll body, tab-bar inset |
| `StickyHeaderFlatScreen` | List tab/stack screens with sticky header (`inset="stack"` off tabs) |
| `SearchField` / `HeaderIconButton` | Header search row and icon actions |
| `FormFieldLabel` | Uppercase section labels on forms |
| `OptionChips` / `OptionChipList` / `MultiOptionChips` | Single/multi-select pill chips |
| `ActionFab` | Gradient floating add button (stack list screens) |
| `ScreenIntro` | Eyebrow + subtitle under native stack headers |
| `GroupedCard` | Sectioned card groups with uppercase titles |
| `EmptyState` | Empty lists with gradient CTA |

A growing, scrollable collection is a `*List.component.tsx` that renders `FlatList`, plus a `*Row.component.tsx`. A fixed chip row (a handful of options that do not grow) can stay a `.map()` inside the parent, with a one-line comment saying why.

---

## Testing

- Runner: Jest (`jest-expo` preset) + `@testing-library/react-native`. Run with `npm test`.
- Colocation: one flat `__tests__/` folder per feature (e.g. `src/features/expenses/utils/__tests__/`) or under `src/shared/`.
- Naming: `<thing>.test.ts` (or `.test.tsx` for component/screen tests).
- Prioritize tests for `hooks/` and `utils/`. `.component.tsx` and `.screen.tsx` files are thin composition.

## Verification gate

Before considering any change done: `npm run typecheck`, `npm run lint`, `npm test`, and — for anything that changes layout, styling, or navigation — a device/simulator pass (`npx expo start`, iOS and Android). Do not suppress a lint rule or skip a failing test to get green; fix the root cause.

Money totals, balances, and similar derived amounts stay on the server. Display the values the API returned. Do not sum or derive them on the client.
