# Folder Structure Review

## ✅ What's Good

- **19 clean feature domains** under `src/features/` (auth, dashboard, expenses, budgets, etc.), each with colocated `components/`, `hooks/`, and `services/` subdirectories — consistent and predictable across all features.
- **Well-organized shared layer** (`src/shared/`) with all the right categories:
  - `components/ui/` — design system primitives (DateInput, FormModal, DashedBorder, etc.)
  - `services/` — API, auth, analytics, biometrics, notifications, offline sync
  - `hooks/` — useAuthBootstrap, useThemedStyles, useUserCurrency, etc.
  - `theme/` — ThemeContext, palettes, buildTheme
  - `store/` — Redux slices (auth, settings)
  - `types/`, `utils/`, `constants/`
- **Expo Router convention respected** — `app/` contains only route files. No business logic leaks into routes.
- **No empty shells** — each feature and shared bucket has actual implementation files.

## ❌ What Needs Fixing

- **Root-level `components/` and `constants/` directories** are leftover Expo template boilerplate (`EditScreenInfo`, `StyledText`, `Themed`, `Colors.ts`). They conflict with the proper `src/shared/components/` and `src/shared/constants/` structure and create confusion about where code lives. **Delete them.**
