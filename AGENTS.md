# Mobile — Feature Structure

```
src/
  features/           # Feature-specific code (colocated by domain)
    auth/components/  # AuthShell, SocialAuthButtons
    dashboard/components/  # DashboardHero, CategoryChart
    expenses/components/   # TransactionItem
    expenses/services/     # receipts
    budgets/components/    # BudgetCard
    navigation/components/ # AppIcon, CustomTabBar, Fab
    settings/components/   # ThemePicker, AppLockGate
  shared/             # Cross-cutting infrastructure
    components/ui/    # Design system primitives
    services/         # API, analytics, biometrics, etc.
    hooks/
    theme/
    store/
    types/
    utils/
    constants/
app/                  # Expo Router screens (route files only)
```

Screens live in `app/` (Expo Router requirement). Import feature code via `@/src/features/<domain>/...` and shared code via `@/src/shared/...`.
