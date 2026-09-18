# Mobile — Architecture & Folder Structure

## Overview

All application code lives under `src/`:

```
mobile/
└── src/
    ├── app/                  # Expo Router routes (thin re-exports)
    ├── features/             # Domain modules (feature-first)
    └── shared/               # Cross-cutting infrastructure
```

**Import paths**
- Features: `@/features/<domain>/...`
- Shared: `@/shared/...`
- Routes: `@/app/...` (rare — prefer feature screens)

---

## Feature module structure

Each domain lives under `src/features/<domain>/` with strict separation of concerns:

```
src/features/<domain>/
├── components/
│   ├── layout/             # Shells, page wrappers, structural UI
│   └── ui/                 # Presentational feature components
├── hooks/                  # React hooks — wire services to UI state
├── screens/                # Screen compositions (used by app routes)
├── services/               # Business logic, API calls (no React)
├── types/                  # Feature-specific TypeScript types
└── index.ts                # Public API barrel export
```

### Layer rules

| Layer | Responsibility | Must NOT contain |
|-------|----------------|------------------|
| `src/app/` | Route registration | Business logic, forms, API calls |
| `screens/` | Compose UI + hooks for one route | Direct API calls |
| `components/` | Render UI, receive props / minimal local UI state | API calls, Redux dispatch |
| `hooks/` | Loading/error state, call services, dispatch | JSX |
| `services/` | Pure business logic, API, validation | React hooks, JSX |
| `types/` | Interfaces, enums | Runtime logic |

---

## Example: `auth` feature

```
src/features/auth/
├── components/
│   ├── layout/
│   │   ├── AuthShell.tsx
│   │   └── AuthHeroHeader.tsx
│   └── ui/
│       ├── AuthFooter.tsx
│       ├── AuthDivider.tsx
│       ├── SocialAuthButtons.tsx
│       └── ...
├── hooks/
│   ├── useLogin.ts
│   └── ...
├── screens/
│   ├── LoginScreen.tsx
│   └── ...
├── services/
│   ├── auth.service.ts       # login, register, OTP, etc.
│   └── social-auth.service.ts
├── types/
│   └── auth.types.ts
└── index.ts
```

**Route file** (`src/app/(auth)/login.tsx`):
```tsx
export { LoginScreen as default } from '@/features/auth/screens/LoginScreen';
```

---

## Shared layer

```
src/shared/
├── components/ui/      # Design system primitives (Button, Input, Screen)
├── hooks/              # App-wide hooks (auth bootstrap, theme, layout)
├── services/           # API client, analytics, biometrics (not domain-specific)
├── store/              # Redux slices
├── theme/
├── types/              # App-wide types only
├── utils/
└── constants/
```

Domain-specific services (e.g. social auth) belong in the feature, not `shared/`.

---

## Naming conventions

| Item | Convention | Example |
|------|------------|---------|
| Feature folder | lowercase singular/plural domain | `auth`, `expenses`, `budgets` |
| Components | PascalCase | `AuthShell.tsx`, `BudgetCard.tsx` |
| Hooks | `use` + PascalCase | `useLogin.ts` |
| Services | `<domain>.service.ts` | `auth.service.ts` |
| Types | `<domain>.types.ts` | `auth.types.ts` |
| Screens | `<Name>Screen.tsx` | `LoginScreen.tsx` |

---

## Adding a new feature

1. Create `src/features/<domain>/` with `components/`, `hooks/`, `services/`, `types/`
2. Add `screens/` when you have routable UI
3. Export public API from `index.ts`
4. Add thin route in `src/app/` that re-exports the screen

---

## Other features (follow same pattern)

Existing features should adopt this layout incrementally:

- `dashboard/` — `components/`, `hooks/`
- `expenses/` — `components/`, `hooks/`, `services/`
- `budgets/` — `components/`, `hooks/`, `services/`
- `settings/` — `components/`, `hooks/`
- `navigation/` — `components/` (AppIcon, TabBar, Fab)

When touching a feature, colocate new code in the correct layer rather than mixing logic into components.

---

## Testing

Each feature that has tests keeps one flat `__tests__/` folder colocated at `src/features/<domain>/__tests__/` (or `src/shared/<layer>/__tests__/` for shared code) — no nested subfolders inside it. Name files `<thing>.test.ts` (or `.test.tsx` for component tests), matching the name of the module under test. Run with `npm test` (Jest, `jest-expo` preset).

---

## Shared UI design system

Use these from `@/shared/components/ui` for consistent screen styling:

| Component | Use for |
|-----------|---------|
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
