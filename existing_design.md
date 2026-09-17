# BudgetBrain Mobile Application — Existing Design & Input Specification

This document provides a comprehensive, exhaustive audit of the existing design system, UI/UX architecture, screen layouts, navigation hierarchy, and every single user input and form control across the BudgetBrain mobile application (`mobile/`).

---

## 1. Executive Overview & Architecture

BudgetBrain is a personal finance and budgeting mobile application built with React Native and Expo. It delivers a modern, tactile financial dashboard, automated and manual transaction logging, category tracking, multi-period budgets, goal management, loan/debt amortization, net worth tracking, family expense splitting, AI insights, bank SMS/email integration, and report exports.

### Technology Stack
* **Framework**: React Native `0.85.3`, Expo SDK `56.0.17`
* **Routing**: Expo Router `56.2.16` (File-based router with nested stacks, tabs, and presentation modals)
* **Language**: TypeScript `6.0.3` (Strict mode)
* **State Management**: Redux Toolkit `2.12.0` with `redux-persist` (AsyncStorage + SecureStore)
* **Server State & Caching**: TanStack React Query `v5.101.0`
* **Form Engine**: `react-hook-form` `7.79.0`
* **Animations & Micro-interactions**: `react-native-reanimated` `4.3.1`, `react-native-worklets` `0.8.3`
* **Graphics & Charts**: `@shopify/react-native-skia` `2.6.2`, `victory-native` `41.26.0`, `react-native-svg` `15.15.4`, `expo-linear-gradient` `56.0.4`
* **Hardware & Device Integrations**: `expo-local-authentication` (Biometrics/FaceID), `expo-notifications`, `expo-image-picker`, `expo-document-picker`, `expo-file-system`, `expo-sharing`
* **Typography**: `@expo-google-fonts/inter`, `@expo-google-fonts/fraunces`

---

## 2. Design System & Global Design Tokens

The application employs a curated, fluid design system supporting **Light Mode**, **Dark Mode**, and **System Mode**, combined with **5 selectable dynamic Accent Palettes**.

### 2.1 Accent Schemes
The user can select an accent palette in Settings, which dynamically configures the primary brand colors and gradients throughout the UI:

| Palette ID | Name | Primary Hex | Gradient End Hex | Swatch Preview |
| :--- | :--- | :--- | :--- | :--- |
| `indigo` | Indigo | `#6366F1` | `#8B5CF6` | Purplish Blue |
| `emerald` | Emerald | `#10B981` | `#059669` | Mint / Emerald Green |
| `ocean` *(Default)* | Ocean | `#0EA5E9` | `#0284C7` | Vivid Sky Blue |
| `rose` | Rose | `#F43F5E` | `#E11D48` | Coral Crimson / Rose |
| `violet` | Violet | `#8B5CF6` | `#7C3AED` | Royal Purple / Violet |

### 2.2 Semantic Color Tokens

```typescript
export interface ThemeColors {
  primary: string;           // Base brand accent
  primaryMuted: string;      // Accent with ~80% alpha
  primarySoft: string;       // Accent with ~10% alpha (chip & badge backgrounds)
  onPrimary: string;         // High-contrast text on primary (#FFFFFF)
  background: string;        // Screen canvas background (#F4F6FB light, #0B101A dark)
  backgroundElevated: string;// Elevated backdrop (#FFFFFF light, #151C2F dark)
  surface: string;           // Card & sheet surface (#FFFFFF light, #1C2540 dark)
  surfaceHover: string;      // Hover/pressed surface (#F8FAFC light, #24304C dark)
  border: string;            // Standard border (#E8ECF4 light, #3A4A6E dark)
  borderSubtle: string;      // Hairline dividers (#F1F5F9 light, #2C3A5C dark)
  text: string;              // Primary text (#0F172A light, #F8FAFC dark)
  textSecondary: string;     // Subheadings & labels (#64748B light, #B0BDCF dark)
  textTertiary: string;      // Captions & placeholders (#94A3B8 light, #8B9BB5 dark)
  success: string;           // Positive cashflow / progress (#10B981 light, #34D399 dark)
  successSoft: string;       // Success pill background
  danger: string;            // Expenses / warnings / delete (#EF4444 light, #F87171 dark)
  dangerSoft: string;        // Danger pill background
  warning: string;           // Approaching limit / streak (#F59E0B light, #FBBF24 dark)
  warningSoft: string;       // Warning pill background
  gradientStart: string;     // Hero gradient starting point
  gradientEnd: string;       // Hero gradient endpoint
  tabBar: string;            // Floating tab bar background (#FFFFFF light, #151C2F dark)
  tabBarBorder: string;      // Tab bar outline border (#E8ECF4 light, #3A4A6E dark)
  overlay: string;           // Modal backdrop (rgba(15,23,42,0.45) light, rgba(0,0,0,0.65) dark)
  inputBg: string;           // Form control fill (#F8FAFC light, #24304C dark)
}
```

### 2.3 Typography Scale
All typography is explicitly tokenized with proportional line heights, negative letter-spacing for large titles, and tabular-numeral support for monetary amounts:

| Token | Font Family | Size | Weight | Line Height | Letter Spacing | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `display` | `Inter_800ExtraBold` | 28px | `800` | 34px | -0.5px | Screen hero titles & primary focus headers |
| `title` | `Inter_700Bold` | 20px | `700` | 25px | -0.3px | Section headers & modal titles |
| `titleSm` | `Inter_600SemiBold` | 17px | `600` | 21px | 0px | Card headers, compact headers, modal labels |
| `body` | `Inter_400Regular` | 16px | `400` | 22px | 0px | Form field values, descriptions, legal text |
| `bodyMedium` | `Inter_500Medium` | 15px | `500` | 21px | 0px | List item titles, standard body text |
| `bodySemibold`| `Inter_600SemiBold`| 15px | `600` | 21px | 0px | Button labels, selected chip text, table labels |
| `caption` | `Inter_500Medium` | 13px | `500` | 18px | 0px | Form field sub-labels, timestamps, subtitles |
| `label` | `Inter_600SemiBold` | 12px | `600` | 16px | +0.2px | Form section overlines, category pill labels |
| `amount` | `Inter_700Bold` | 22px | `700` | 24px | -0.5px | Summary metrics, transaction amounts (`tabular-nums`) |
| `amountLg` | `Fraunces_700Bold` | 32px | `700` | 35px | -1.0px | Detail hero currency amounts (`tabular-nums`) |

### 2.4 Spacing & Border Radii
* **Spacing Scale**:
  * `xs`: 4px
  * `sm`: 8px
  * `md`: 12px
  * `lg`: 16px
  * `xl`: 24px
  * `xxl`: 32px
  * `section`: 24px (standard vertical separation between content blocks)
* **Radii Scale**:
  * `sm`: 8px (Inner chips, small action buttons)
  * `md`: 12px (Form inputs, secondary buttons)
  * `lg`: 16px (Cards, modal bottom sheets, hero containers)
  * `xl`: 24px (Large surfaces, modal wraps)
  * `full`: 999px (Pills, badges, floating circular buttons, FABs)

### 2.5 Elevation & Shadows
* **Light Mode**:
  * `sm`: `shadowColor: primary`, `shadowOffset: { width: 0, height: 2 }`, `shadowOpacity: 0.06`, `shadowRadius: 8`, `elevation: 2`
  * `md`: `shadowColor: '#0F172A'`, `shadowOffset: { width: 0, height: 4 }`, `shadowOpacity: 0.08`, `shadowRadius: 16`, `elevation: 4`
  * `lg`: `shadowColor: '#0F172A'`, `shadowOffset: { width: 0, height: 12 }`, `shadowOpacity: 0.12`, `shadowRadius: 28`, `elevation: 8`
* **Dark Mode**:
  * `sm`: `shadowColor: '#000'`, `shadowOffset: { width: 0, height: 2 }`, `shadowOpacity: 0.25`, `shadowRadius: 4`, `elevation: 2`
  * `md`: `shadowColor: '#000'`, `shadowOffset: { width: 0, height: 4 }`, `shadowOpacity: 0.35`, `shadowRadius: 12`, `elevation: 4`
  * `lg`: `shadowColor: '#000'`, `shadowOffset: { width: 0, height: 8 }`, `shadowOpacity: 0.45`, `shadowRadius: 24`, `elevation: 8`

### 2.6 Motion & Animation Tokens
* **Physics / Springs**: `damping: 18`, `stiffness: 220` (Tactile iOS-style spring feel matching Framer Motion web equivalents)
* **Durations**: `fast: 120ms` (press states), `base: 200ms` (fade transitions), `slow: 320ms` (sheet & modal enters)
* **Accessibility**: `useReducedMotion` hook automatically disables spring oscillations and long fade animations when the user enables reduce-motion in device accessibility settings.

---

## 3. Core Reusable UI & Form Components

The mobile application enforces design consistency via high-order shared components in `src/shared/components/ui/`:

### 3.1 Layout & Screen Shells
* `ScreenWrapper`: Top-level canvas handler that integrates safe area insets, horizontal frame padding (`tabBarPaddingX`), vertical scroll container, pull-to-refresh controls, and keyboard tap handling.
* `StickyHeaderScreen`: Retains a fixed hero/header banner above a scrollable viewport.
* `StickyHeaderFlatScreen<T>`: Virtualized list screen with sticky header, search field embedding, pull-to-refresh, infinite scroll `onEndReached`, and comprehensive `ListEmptyComponent` and `ListFooterComponent` skeleton fallbacks.
* `StackScrollScreen` & `FormStackScreen`: Standard template for sub-screens and forms containing uniform back buttons, eyebrow headers, section spacing, and form submit buttons.

### 3.2 Form Input Controls
* `Input`: The foundation text field supporting:
  * Left icon prefix (`leftIcon`)
  * Visibility toggle for password fields (`secureToggle` with eye/eyeSlash icon)
  * Multiline expansion with auto vertical alignment
  * Focused accent glow and border state (`primary + '88'`)
  * Validation error text banner and helper captions
  * Fully accessible labels and disabled states
* `DateInput`: Unified cross-platform date selector:
  * Displays calendar icon, localized formatted date string (`weekday, MMM DD, YYYY`), and right chevron.
  * **iOS**: Launches a slide-up modal bottom sheet embedding `@react-native-community/datetimepicker` in inline/spinner mode with a "Done" confirmation button.
  * **Android**: Launches the native date dialog picker.
  * Enforces `minimumDate` and `maximumDate` boundary constraints.
* `OtpInput`: A 6-cell verification input box:
  * Automatically isolates single digits into individual styled blocks.
  * Supports clipboard paste / bulk autofill distribution across all 6 cells.
  * Handles backspace cascade (clears current cell or jumps to previous).
  * Auto-focuses on open.
* `OptionChips<T>`: Adaptive option selector:
  * **≤4 items**: Renders a segmented horizontal control.
  * **5–8 items**: Renders a wrapping grid or horizontal scrolling chip row.
  * **>8 items**: Automatically transitions to an expandable bottom `ActionSheet` picker with checkmarks.
* `OptionChipList`: Specialized entity selector for Categories and Income Sources, displaying color badges or swatches beside entity names.
* `MultiOptionChips`: Multi-select pill selector featuring checkmarks and active primary tinted backgrounds.
* `ImageUploadField`: Dashed border media container for receipt photo capture and attachment:
  * Empty state with photo icon and subtitle ("Tap to upload JPG or PNG").
  * Preview state with cover image, dark gradient overlay, "Replace" button, and "Remove" (trash) button.
* `ColorPicker`: Horizontal scroll row of circular palette swatches with white checkmark overlays on active selection.
* `ActionSheet`: Modal bottom sheet with drag handle, title, action items with custom icon & destructive highlights, and a prominent Cancel button.
* `FormModal`: Half/full screen page-sheet presentation for quick creation flows (e.g. Add Category, Add Account, Add Investment).

### 3.3 Feedback, Skeletons & Action Components
* `Button`: Primary gradient button with `useSpringPress` press scaling (0.97 scale), `ActivityIndicator` loading state, automatic `loadingTitle` computation, and 6 variants:
  * `primary` (linear gradient from `primary` to `gradientEnd`)
  * `secondary` (surface hover tint)
  * `outline` (transparent background with 1.5px border)
  * `danger` (destructive solid red)
  * `dangerGhost` (transparent background with red typography)
  * `ghost` (tinted primary soft fill)
* `ActionFab`: Floating circular linear-gradient button with `+` glyph anchored right above the bottom tab bar.
* `ProgressBar`: Animated linear fill bar using native animation drivers and accessible color thresholds (e.g. green < 80%, yellow 80–99%, red ≥ 100%).
* `Skeletons`: Dedicated skeleton loaders for every view (`DashboardSkeleton`, `ListRowsSkeleton`, `DetailSkeleton`, `SettingsSkeleton`, `NetWorthSkeleton`, `FamilySkeleton`, `SupportSkeleton`, `AiChatSkeleton`, `ColdStartSkeleton`).

---

## 4. App Navigation & Routing Structure

BudgetBrain uses **Expo Router** with strict file-based routing.

```
mobile/src/app/
├── _layout.tsx                     # Global Root Layout (Redux, QueryClient, SafeArea, Theme, AuthGate, AppLock)
├── +html.tsx                       # Web rendering shell
├── +not-found.tsx                  # 404 handler
├── (auth)/                         # Authentication flow stack
│   ├── _layout.tsx
│   ├── login.tsx                   # Email/password login
│   ├── register.tsx                # Sign up
│   ├── otp-login.tsx               # Passwordless email OTP login
│   ├── forgot-password.tsx         # Reset link dispatch
│   ├── reset-password.tsx          # New password submission
│   └── verify-email.tsx            # Email verification landing
├── (onboarding)/                   # Post-signup personalization stack
│   ├── _layout.tsx
│   └── index.tsx                   # Multi-step profile setup form
├── (tabs)/                         # Main floating bottom-tab application
│   ├── _layout.tsx                 # Tab navigator definition
│   ├── index.tsx                   # Tab 1: Home Dashboard
│   ├── expenses.tsx                # Tab 2: Activity (Transactions list & filter panel)
│   ├── budgets.tsx                 # Tab 3: Budgets overview
│   ├── settings.tsx                # Tab 4: Profile & App Settings
│   ├── goals.tsx                   # Hidden Tab: Savings Goals
│   ├── income.tsx                  # Hidden Tab: Income sources & transactions
│   └── ai.tsx                      # Hidden Tab: AI Finance Coach & Chat
├── expense/
│   ├── add.tsx                     # [Modal] Log new expense
│   └── [id].tsx                    # Expense detail, edit mode, delete, & split
├── income/
│   ├── add.tsx                     # [Modal] Record new income
│   └── [id].tsx                    # Income detail & edit
├── budget/
│   ├── add.tsx                     # [Modal] Create budget
│   └── [id].tsx                    # Budget detail, progress, edit, delete
├── goal/
│   ├── add.tsx                     # [Modal] Create goal
│   └── [id]/
│       ├── index.tsx               # Goal detail & edit
│       └── contribute.tsx          # [Modal] Add savings contribution
├── loan/
│   ├── index.tsx                   # Loans, credit cards & EMIs overview
│   ├── add.tsx                     # [Modal] Track new loan
│   └── [id]/
│       ├── index.tsx               # Loan detail & payoff progress
│       └── pay.tsx                 # [Modal] Record debt repayment
├── accounts/
│   └── index.tsx                   # Bank accounts & cash wallets
├── categories/
│   └── index.tsx                   # Category management & reordering
├── investments/
│   └── index.tsx                   # Stocks, mutual funds, crypto portfolio
├── family/
│   └── index.tsx                   # Family groups, invite codes, shared balances
├── subscriptions/
│   └── index.tsx                   # Subscriptions & recurring bills
├── recap.tsx                       # Monthly spending recap highlights
├── reports.tsx                     # CSV and PDF report exporter
├── notifications.tsx               # Notification center & read receipts
├── integrations.tsx / integrations/# Bank statement CSV import & SMS/Email parser
├── support/
│   └── index.tsx                   # Helpdesk ticket submission & list
├── search.tsx                      # Universal transaction keyword search
└── legal/
    ├── privacy.tsx                 # Privacy Policy
    └── terms.tsx                   # Terms of Service
```

### Custom Floating Tab Bar (`CustomTabBar`)
The bottom navigation bar floats over content with rounded corners (`radii.xl + 4`), subtle shadow elevation, and a center elevated action button:
* **Left Slot**:
  1. `Home` (icon: `home`, route: `/(tabs)`)
  2. `Activity` (icon: `activity`, route: `/(tabs)/expenses`)
* **Center FAB**:
  * Floating `+` button in a linear gradient ring.
  * Tapping opens a quick creation `ActionSheet` with 4 options:
    * **Expense**: Log a purchase or bill (`/expense/add`)
    * **Income**: Record money in (`/income/add`)
    * **Budget**: Set a spending limit (`/budget/add`)
    * **Goal**: Start a savings target (`/goal/add`)
* **Right Slot**:
  3. `Budgets` (icon: `budgets`, route: `/(tabs)/budgets`)
  4. `Profile` (icon: `profile`, route: `/(tabs)/settings`)

---

## 5. Exhaustive Screen-by-Screen Breakdown & Inputs Catalog

Below is the complete, exhaustive catalog of every screen, layout structure, interaction, and input field across the entire mobile application.

---

### 5.1 Authentication Screens `(auth)`

#### 1. Login Screen (`/(auth)/login`)
* **Purpose**: Primary email and password authentication.
* **Layout**: `AuthShell` card with brand logo badge, header text, input fields, social auth buttons, and footer links.
* **Form Inputs**:
  | Field Label | Form Key | Control Type | Input Props / Keyboard | Validation Rules & Limits | Placeholder / Helper |
  | :--- | :--- | :--- | :--- | :--- | :--- |
  | **Email** | `email` | `Input` | `keyboardType="email-address"`, `autoCapitalize="none"`, `textContentType="emailAddress"`, `autoComplete="email"` | Required; min 1, max 255 chars; valid email regex | `you@example.com` |
  | **Password** | `password` | `Input` | `secureTextEntry`, `secureToggle=true`, `textContentType="password"`, `autoComplete="password"` | Required; min 8, max 72 chars | `Your password` |
* **Buttons & Actions**:
  * `Sign In`: Primary button, calls `login(email, password)`.
  * `Forgot password?`: Navigates to `/(auth)/forgot-password`.
  * `SocialAuthButtons`: Google Sign-In button and Apple Sign-In button (native `AppleAuthenticationButton`).
  * `Sign in with OTP`: Navigates to `/(auth)/otp-login`.
  * `Sign Up`: Footer link to `/(auth)/register`.

#### 2. Register Screen (`/(auth)/register`)
* **Purpose**: New user account creation.
* **Layout**: `AuthShell` with tagline "Set up your profile in under a minute" and back button.
* **Form Inputs**:
  | Field Label | Form Key | Control Type | Input Props / Keyboard | Validation Rules & Limits | Placeholder / Helper |
  | :--- | :--- | :--- | :--- | :--- | :--- |
  | **Full name** | `name` | `Input` | `textContentType="name"`, `autoCapitalize="words"` | Required; min 1, max 255 chars | `Jane Doe` |
  | **Email** | `email` | `Input` | `keyboardType="email-address"`, `autoCapitalize="none"`, `textContentType="emailAddress"`, `autoComplete="email"` | Required; min 1, max 255 chars; valid email regex | `you@example.com` |
  | **Password** | `password` | `Input` | `secureTextEntry`, `secureToggle=true`, `textContentType="newPassword"`, `autoComplete="password-new"` | Required; min 8, max 72 chars; must include letter, number, special char; no spaces | `Min. 8 characters` |
* **Buttons & Actions**:
  * `Create Account`: Primary button, calls `register(name, email, password)`.
  * `Sign In`: Footer link to `/(auth)/login`.

#### 3. OTP Login Screen (`/(auth)/otp-login`)
* **Purpose**: Passwordless authentication via 6-digit email OTP.
* **Layout**: Two-step flow in `AuthShell`: Step 1 enters email, Step 2 displays 6-cell pin boxes.
* **Form Inputs**:
  | Field Label | Form Key | Control Type | Input Props / Keyboard | Validation Rules & Limits | Placeholder / Helper |
  | :--- | :--- | :--- | :--- | :--- | :--- |
  | **Email** | `email` | `Input` | `keyboardType="email-address"`, `autoCapitalize="none"` | Required; min 1, max 255 chars; valid email regex; disabled once sent | `you@example.com` |
  | **Verification code** | `otp` | `OtpInput` | `keyboardType="number-pad"`, 6 individual auto-advancing digit boxes | Exactly 6 numeric digits | Auto-focused upon OTP dispatch |
* **Buttons & Actions**:
  * `Send Code`: Visible in step 1; triggers OTP delivery.
  * `Verify & Sign In`: Visible in step 2; validates OTP.
  * `Resend code`: Ghost button to re-trigger OTP delivery.
  * `Back to Sign In`: Footer link to `/(auth)/login`.

#### 4. Forgot Password Screen (`/(auth)/forgot-password`)
* **Purpose**: Request a password reset link.
* **Form Inputs**:
  | Field Label | Form Key | Control Type | Input Props / Keyboard | Validation Rules & Limits | Placeholder / Helper |
  | :--- | :--- | :--- | :--- | :--- | :--- |
  | **Email** | `email` | `Input` | `keyboardType="email-address"`, `autoCapitalize="none"` | Required; min 1, max 255 chars; valid email regex | `you@example.com` |
* **Buttons & Actions**:
  * `Send Reset Link`: Primary button, calls `forgotPassword(email)`.
  * `Back to Sign In`: Footer link to `/(auth)/login`.

#### 5. Reset Password Screen (`/(auth)/reset-password`)
* **Purpose**: Enter and confirm a new password using a token from email.
* **Form Inputs**:
  | Field Label | Form Key | Control Type | Input Props / Keyboard | Validation Rules & Limits | Placeholder / Helper |
  | :--- | :--- | :--- | :--- | :--- | :--- |
  | **New password** | `password` | `Input` | `secureTextEntry`, `secureToggle=true` | Required; min 8, max 72 chars; letter, number, & special char | `Min. 8 characters` |
  | **Confirm password** | `confirmPassword` | `Input` | `secureTextEntry`, `secureToggle=true` | Required; must exactly match `password` | `Re-enter password` |
* **Buttons & Actions**:
  * `Update Password`: Primary button, submits token and new password.
  * `Back to Sign In`: Footer link.

#### 6. Verify Email Screen (`/(auth)/verify-email`)
* **Purpose**: Validates account registration email token.
* **Inputs**: No text input fields; reads `token` query param.
* **Buttons & Actions**:
  * `Verify Email`: Primary button to submit verification.
  * `Continue to Sign In`: Button shown on successful verification.

---

### 5.2 Onboarding Screen `(onboarding)`

#### Personalization Screen (`/(onboarding)`)
* **Purpose**: Onboard newly registered users before accessing the dashboard.
* **Layout**: `FormStackScreen` with sections for personal info, goals, and income.
* **Form Inputs**:
  | Field Label | Form Key | Control Type | Input Props / Keyboard | Validation Rules & Limits | Placeholder / Helper |
  | :--- | :--- | :--- | :--- | :--- | :--- |
  | **Your name** | `name` | `Input` | `leftIcon="personFill"`, `maxLength=255` | Required; min 1, max 255 chars | `What should we call you?` |
  | **Country** | `country` | `Input` | `maxLength=100`, default: `'India'` | Required; min 1, max 100 chars | Country name |
  | **Currency** | `currency` | `OptionChips` | Horizontal chip selector | Must be one of: `INR`, `USD`, `EUR`, `GBP`, `AED`, `SGD` (Default: `INR`) | Chip list |
  | **Financial goals** | `financialGoals` | `MultiOptionChips` | Multi-select chips with checkmark indicators | Required; minimum 1 goal must be selected | Options: `Emergency Fund`, `Vacation`, `Home Purchase`, `Car Purchase`, `Investments`, `Debt Payoff` |
  | **Salary range** | `salaryRange` | `OptionChips` | Segmented/chip selector | Required | Options: `Under 3L`, `3L - 6L`, `6L - 12L`, `12L - 24L`, `Above 24L` |
  | **Monthly savings target** | `monthlySavingsTarget` | `Input` | `keyboardType="numeric"`, `leftIcon="goals"` | Required; positive number; max 9,999,999,999,999.99 | Label dynamically includes selected currency symbol; Placeholder: `0` |
* **Buttons & Actions**:
  * `Get Started`: Primary action, completes onboarding and navigates to `/(tabs)`.

---

### 5.3 Tab Screens `(tabs)`

#### 1. Home Dashboard (`/(tabs)`)
* **Purpose**: High-level financial overview, balances, quick actions, streaks, category breakdown, budget progress, upcoming bills, and recent transactions.
* **Layout**:
  * `DashboardHero`: Sticky gradient header displaying greeting ("Good morning/afternoon/evening"), user name, avatar button, animated Net Savings counter, savings rate badge ("XX% saved this month"), and 2 quick-action pills (`+ Expense` -> `/expense/add`, `+ Income` -> `/income/add`).
  * `SummaryMetricsGrid`: 4 responsive `SummaryCard` widgets:
    * **Income**: Total income this month (taps to `/(tabs)/income`)
    * **Expenses**: Total expenses this month (taps to `/(tabs)/expenses`)
    * **Goals**: % progress across active goals (taps to `/(tabs)/goals`)
    * **Net Worth**: Total net worth amount (taps to `/net-worth`)
  * **No-Spend Streak Banner**: Highlight card with star icon showing current consecutive streak days.
  * **Spending by Category**: Donut/Bar visualization using `CategoryChart` with "See all" link.
  * **Budget Progress**: Card listing active budgets with individual `ProgressBar` indicators and spent/limit ratios.
  * **Goal Progress**: Card listing goals with current/target ratios and percentage progress.
  * **Upcoming Bills**: Card listing detected or manual subscription dues within the next 7 days.
  * **Recent Activity**: `TransactionGroup` showing the 5 most recent transactions with categorized icons.
* **Inputs**: Pull-to-refresh control.

#### 2. Activity / Expenses Screen (`/(tabs)/expenses`)
* **Purpose**: Complete transaction ledger (both expenses and income) with extensive multi-dimensional filtering.
* **Layout**: `StickyHeaderFlatScreen` containing `FeatureHeader`, search bar trigger, filter button with active count badge, expandable filter panel, and transaction groups.
* **Inline Filter Panel Inputs (`TransactionFilters`)**:
  | Field Label | Filter Key | Control Type | Options / Choices | Behavior & Constraints |
  | :--- | :--- | :--- | :--- | :--- |
  | **Type** | `type` | `OptionChips` (Segmented) | `All`, `Expense`, `Income` | Dynamically shows/hides category, source, and payment method fields |
  | **Date** | `datePreset` | `OptionChips` (Segmented) | `All`, `Month` (This month), `30 days`, `Custom` | Selecting `Custom` displays From/To date pickers |
  | **From** *(Custom Date)* | `startDate` | `DateInput` | Date picker (bounds: 10 years past to today or `endDate`) | Enabled when datePreset = `custom` |
  | **To** *(Custom Date)* | `endDate` | `DateInput` | Date picker (bounds: `startDate` to today) | Enabled when datePreset = `custom` |
  | **Category** | `categoryId` | `FilterEntityPicker` | All user-defined categories + "All categories" option | Hidden when type = `income` |
  | **Income source** | `incomeSourceId`| `FilterEntityPicker` | All user income sources + "All sources" option | Hidden when type = `expense` |
  | **Tag** | `tag` | `FilterEntityPicker` | Autocompleted tags from transaction history + "All tags" | Shown if user has created tags |
  | **Payment** | `paymentMethod` | `OptionChips` | `All methods`, `UPI`, `Card`, `Cash`, `Bank Transfer`, `Other` | Hidden when type = `income` |
* **Buttons & Actions**:
  * `Search transactions`: Input field that redirects to `/search`.
  * `Filters` button: Toggles filter panel drawer; shows numeric badge when filters are active.
  * `Apply Filters`: Commits filter draft and triggers refetch.
  * `Clear Filters`: Resets all filters to defaults.
  * `+` Action Icon: Navigates to `/expense/add`.
  * Pull-to-refresh: Refetches infinite list.
  * Infinite scroll: Loads next 20 transactions at 40% scroll threshold.

#### 3. Budgets Screen (`/(tabs)/budgets`)
* **Purpose**: Budget tracking and spending limit management.
* **Layout**: List of `BudgetCard` elements showing budget name, category, spent vs limit amount, progress bar, alert status, and days remaining.
* **Inputs & Actions**:
  * `+` Header Action: Navigates to `/budget/add`.
  * `BudgetCard` Tap: Navigates to `/budget/[id]`.
  * `Delete` Icon: Prompts confirmation dialog to delete the budget.
  * Pull-to-refresh: Reloads budgets query.

#### 4. Savings Goals Screen (`/(tabs)/goals`)
* **Purpose**: Target savings tracker.
* **Layout**: List of `GoalCard` widgets showing goal name, category type, current saved vs target amount, percentage bar, and target date.
* **Inputs & Actions**:
  * `+` Header Action: Navigates to `/goal/add`.
  * `GoalCard` Tap: Navigates to `/goal/[id]/index`.
  * `Contribute` Quick Button: Navigates to `/goal/[id]/contribute`.
  * `Delete` Icon: Triggers delete confirmation modal.

#### 5. Income Screen (`/(tabs)/income`)
* **Purpose**: List recorded income entries and manage recurring income sources.
* **Layout**:
  * Header showing total income count and total sources.
  * `INCOME SOURCES` Section: Cards showing source name and category type (`salary`, `freelancing`, `investments`, `rental`, `other`).
  * `RECENT INCOME` Section: Grouped transaction rows with positive green amounts.
* **Inputs & Actions**:
  * `+` Header Action: Navigates to `/income/add`.
  * Income Item Tap: Navigates to `/income/[id]`.
  * Pull-to-refresh: Refetches income entries and sources.

#### 6. AI Finance Coach Screen (`/(tabs)/ai`)
* **Purpose**: Conversational AI assistant for spending insights, anomaly explanations, and financial queries.
* **Layout**:
  * Chat scroll view with speech bubbles (`AiChatBubble`) and typing indicator (`AiTypingIndicator`).
  * Empty state with introductory suggestion prompts.
* **Form Inputs (`AiChatInput`)**:
  | Field Label | Form Key | Control Type | Input Props / Keyboard | Limits & Suggestions |
  | :--- | :--- | :--- | :--- | :--- |
  | **Ask your finance coach...** | `message` | `TextInput` in composer | `multiline`, `maxLength=4000` | Max 4000 characters; send button enabled only when non-empty |
  | **Suggested prompts** | N/A | Horizontal scroll chip list | Tap to send instantly | Starters: "Where did I spend the most this month?", "How am I tracking against my budgets?", "Give me 3 tips to save more". Follow-ups: "Break that down by category", "Compare to last month". |
* **Buttons & Actions**:
  * `Send`: Circular gradient button with paper plane icon.
  * `New conversation`: Header action (visible when chat history exists) to clear context and start fresh.

#### 7. Profile & Settings Screen (`/(tabs)/settings`)
* **Purpose**: User profile management, security preferences, appearance configuration, feature links, and account controls.
* **Layout**:
  * `ProfileHero`: Displays user avatar initials, full name, email, account role badge, and base currency.
  * `Features` Grouped Card: Navigation links to Goals, Income, AI Insights, Net Worth, Reports, Spending Recap, Categories, Loans & Debts, Subscriptions.
  * `Account` Grouped Card: Navigation links to Accounts, Investments, Family Groups, Integrations, Notifications, Support, Privacy Policy, Terms of Service.
  * `Appearance` Grouped Card: `ThemePicker` component with Mode buttons (Light / Dark / System) and 5 Accent Palette swatches.
  * `Security & preferences` Grouped Card:
    * **Biometric Lock Toggle**: Switch for FaceID / TouchID / Biometrics.
    * **Weekly Spending Digest Toggle**: Switch for Monday notification summaries.
    * **Test Push Notification**: Triggers sample push notification.
  * `Profile` Grouped Card: Read-only info or inline edit form.
* **Inline "Edit Profile" Form Inputs**:
  | Field Label | Form Key | Control Type | Input Props / Keyboard | Validation Rules & Limits | Placeholder / Helper |
  | :--- | :--- | :--- | :--- | :--- | :--- |
  | **Name** | `name` | `Input` | `leftIcon="personFill"`, `maxLength=255` | Required; min 1, max 255 chars | User's full name |
  | **Country** | `country` | `Input` | `maxLength=100` | Required; min 1, max 100 chars | Country name |
  | **Currency** | `currency` | `OptionChips` | Horizontal chip selector | Must be one of supported currencies (`INR`, `USD`, `EUR`, `GBP`, `AED`, `SGD`) | Current currency selected |
* **Buttons & Actions**:
  * `Save profile`: Submits profile updates.
  * `Cancel`: Exits edit mode.
  * `Sign out`: Confirmation alert and session purge.
  * `Delete account`: Danger ghost button prompting irreversible account deletion confirmation.

---

### 5.4 Transaction CRUD & Split Modals

#### 1. Add Expense Screen (`/expense/add`)
* **Purpose**: Log a single expense transaction.
* **Layout**: `FormStackScreen` with Sections: "Amount & details", "Payment & category", "Extras", and bottom action buttons.
* **Form Inputs**:
  | Field Label | Form Key | Control Type | Input Props / Keyboard | Validation Rules & Limits | Placeholder / Helper |
  | :--- | :--- | :--- | :--- | :--- | :--- |
  | **Amount ({currency})** | `amount` | `Input` | `keyboardType="numeric"`, `leftIcon="expense"` | Required; positive finite number; max 9,999,999,999,999.99 | `0.00` |
  | **Merchant** | `merchant` | `Input` | `leftIcon="activity"`, `maxLength=255`, blur triggers category suggestion | Required; min 1, max 255 chars | `e.g. Swiggy, Amazon` |
  | **Date** | `date` | `DateInput` | Calendar sheet/dialog picker; default today | Required; ISO date; max: today (no future dates), min: 10 years ago | `Select date` |
  | **Payment method** | `paymentMethod` | `OptionChips` | Horizontal chips | Options: `UPI`, `Card`, `Cash`, `Bank Transfer`, `Other` (Default: `UPI`) | Select payment type |
  | **Category** | `categoryId` | `OptionChipList` | Color dot + category name chips / modal sheet | Required; selects active Category ID | "Suggested from history" banner appears if auto-detected from merchant name |
  | **Tags** | `tags` | `TagInput` | Text input + tag pill manager + auto-suggest chips | Array of string tags; adds on comma/enter; removable pills with `x` | `Add tag...` |
  | **Receipt** | `receipt` | `ImageUploadField` | Photo picker via `expo-image-picker` | Optional; supports camera or gallery selection; JPEG/PNG preview | "Attach a photo of your receipt" |
  | **Notes** | `notes` | `Input` | `multiline`, `maxLength=2000` | Optional; max 2000 chars | `Add any extra details...` |
* **Buttons & Actions**:
  * `Save Expense`: Validates and submits expense; uploads receipt attachment if present.

#### 2. Expense Detail & Edit Screen (`/expense/[id]`)
* **Purpose**: View transaction details, switch to full edit mode, duplicate transaction, delete, or split with family members.
* **Read-Only Mode Elements**:
  * `DetailHero`: Shows large red `-₹XXX.XX` amount, merchant title, and category subtitle.
  * `DetailMetaList`: Displays Date, Payment method, Notes, and Tags.
  * `DetailActions`:
    * `Edit`: Toggles screen into editing mode.
    * `Duplicate`: Creates a clone with today's date.
    * `Delete`: Prompts confirmation dialog.
  * `SplitExpenseSection`: Family expense splitting widget (detailed below).
* **Edit Mode Form Inputs**:
  * Identical inputs to Add Expense: `amount`, `merchant`, `date`, `paymentMethod`, `categoryId`, `tags`, and `notes`.
  * Actions: `Save Changes` (primary) and `Cancel` (secondary).

#### 3. Split Expense Section (`SplitExpenseSection` inside `/expense/[id]`)
* **Purpose**: Split an existing expense among members of a selected Family Group.
* **Form Inputs**:
  | Field Label | Form Key | Control Type | Input Props / Keyboard | Behavior & Limits |
  | :--- | :--- | :--- | :--- | :--- |
  | **Family group** | `groupId` | `ActionSheet` picker | Selects active family group | Only rendered if user belongs to ≥1 family group |
  | **Member check & custom share** | `selected[userId]` | Checkbox pill + inline numeric `TextInput` | `keyboardType="numeric"` | Selecting members divides amount equally by default; user can overwrite individual split amounts |
* **Buttons & Actions**:
  * `Split with family`: Expands the split creator section.
  * `Confirm Split`: Posts participants and split amounts to `/family/groups/:id/splits`.
  * `Settle up`: Settle button on individual generated split rows.

#### 4. Add Income Screen (`/income/add`)
* **Purpose**: Record incoming funds and optionally create a new income source inline.
* **Layout**: `FormStackScreen` with "Amount & date", "Income source", and "Notes".
* **Form Inputs**:
  | Field Label | Form Key | Control Type | Input Props / Keyboard | Validation Rules & Limits | Placeholder / Helper |
  | :--- | :--- | :--- | :--- | :--- | :--- |
  | **Amount ({currency})** | `amount` | `Input` | `keyboardType="numeric"`, `leftIcon="income"` | Required; positive finite number; max 9,999,999,999,999.99 | `0.00` |
  | **Date** | `date` | `DateInput` | Calendar sheet/dialog picker; default today | Required; ISO date; max: today, min: 10 years ago | `Select date` |
  | **Source Mode** | `sourceMode` | `OptionChips` (Segmented) | Options: `Existing source`, `New source` | Toggles between existing source picker and new source creator |
  | **Existing Source** | `incomeSourceId`| `OptionChipList` | Chip list of user's income sources | Required if `sourceMode` = `existing` | Select an existing income source |
  | **Source name** | `newSourceName` | `Input` | `leftIcon="wallet"`, `maxLength=255` | Required if `sourceMode` = `new`; min 1, max 255 chars | `e.g. Salary, Freelance` |
  | **Source type** | `newSourceType` | `OptionChips` | Options: `Salary`, `Freelancing`, `Investments`, `Rental`, `Other` | Required if `sourceMode` = `new` | Select source classification |
  | **Notes** | `notes` | `Input` | `multiline`, `maxLength=2000` | Optional; max 2000 chars | `Add any extra details...` |
* **Buttons & Actions**:
  * `Save Income`: Validates and submits income record.

#### 5. Income Detail & Edit Screen (`/income/[id]`)
* **Purpose**: View and edit an income record.
* **Read-Only Mode Elements**: `DetailHero` with green `+₹XXX.XX`, Date subtitle, Notes, and Duplicate/Delete actions.
* **Edit Mode Form Inputs**:
  * `amount`: Numeric input for income amount.
  * `date`: `DateInput` selector.
  * `notes`: Multiline notes input.
  * Actions: `Save Changes` and `Cancel`.

---

### 5.5 Budget Management Screens `(budget)`

#### 1. Add Budget Screen (`/budget/add`)
* **Purpose**: Create a spending limit with configurable time horizon and alerts.
* **Form Inputs**:
  | Field Label | Form Key | Control Type | Input Props / Keyboard | Validation Rules & Limits | Placeholder / Helper |
  | :--- | :--- | :--- | :--- | :--- | :--- |
  | **Budget name** | `name` | `Input` | `leftIcon="budgets"`, `maxLength=255` | Required; min 1, max 255 chars | `e.g. Groceries` |
  | **Period** | `type` | `OptionChips` (Segmented) | Options: `Monthly`, `Weekly`, `Custom` | Default: `Monthly` | Select period frequency |
  | **Budget amount ({currency})** | `amount` | `Input` | `keyboardType="numeric"`, `leftIcon="wallet"` | Required; positive number; max 9,999,999,999,999.99 | `0.00` |
  | **Start date** | `startDate` | `DateInput` | Default: 1st of current month | Required; bounds: 2 years ago to 1 year ahead | Start date |
  | **End date** | `endDate` | `DateInput` | Visible only when `type` = `custom` | Required if `custom`; must be on or after `startDate`; max 5 years ahead | End date |
  | **Alert threshold (%)** | `alertThreshold`| `Input` | `keyboardType="numeric"`, `leftIcon="bell"` | Required; integer between 1 and 100 (Default: `80`) | Helper: "Notify when spending reaches this %" |
  | **Roll over unused amount** | `rollover` | `Switch` | Toggle switch; hidden for custom budgets | Boolean (`true` / `false`) | Helper: "Carry last period's leftover into this one" |
  | **Category (optional)** | `categoryId` | `OptionChipList` | Chip list includes `All spending` (`__all__`) + user categories | Optional; default: `All spending` | Select category to limit |
* **Buttons & Actions**:
  * `Create Budget`: Submits new budget definition.

#### 2. Budget Detail & Edit Screen (`/budget/[id]`)
* **Purpose**: Inspect real-time budget consumption, alert thresholds, rollover details, and edit limits.
* **Read-Only Mode Elements**:
  * `DetailHero`: Displays remaining balance and percentage consumed.
  * `ProgressBar`: Colored dynamic progress bar (green -> yellow -> red).
  * `DetailMetaList`: Displays Period type, Start Date, End Date, Alert threshold %, and Rollover status.
* **Edit Mode Form Inputs**:
  | Field Label | Form Key | Control Type | Validation Rules & Limits |
  | :--- | :--- | :--- | :--- |
  | **Budget name** | `name` | `Input` | Required; min 1, max 255 chars |
  | **Budget amount** | `amount` | `Input` | Required; positive number; max 9,999,999,999,999.99 |
  | **Alert threshold (%)** | `alertThreshold` | `Input` | Integer between 1 and 100 |
  | **Roll over unused amount** | `rollover` | `Switch` | Boolean toggle |
* **Buttons & Actions**:
  * `Save Changes` & `Cancel`.
  * `Delete Budget`: Red destructive button prompting confirmation.

---

### 5.6 Savings Goals Screens `(goal)`

#### 1. Add Goal Screen (`/goal/add`)
* **Purpose**: Create a new savings target.
* **Form Inputs**:
  | Field Label | Form Key | Control Type | Input Props / Keyboard | Validation Rules & Limits | Placeholder / Helper |
  | :--- | :--- | :--- | :--- | :--- | :--- |
  | **Goal name** | `name` | `Input` | `leftIcon="goals"`, `maxLength=255` | Required; min 1, max 255 chars | `e.g. Emergency fund` |
  | **Goal type** | `type` | `OptionChips` | Horizontal chips | Options: `Emergency Fund`, `Vacation`, `Car`, `Home`, `Investments`, `Other` | Type classification |
  | **Target amount ({currency})** | `targetAmount` | `Input` | `keyboardType="numeric"`, `leftIcon="wallet"` | Required; positive finite number | `0.00` |
  | **Target date** | `targetDate` | `DateInput` | Calendar picker (bounds: today to 50 years future) | Optional date | Optional target deadline |
* **Buttons & Actions**:
  * `Create Goal`: Validates and saves goal.

#### 2. Goal Detail Screen (`/goal/[id]/index`)
* **Purpose**: View goal progress, contribute funds, edit goals, or delete.
* **Read-Only Mode Elements**:
  * `DetailHero`: Shows current saved amount vs target amount with progress percentage.
  * `ProgressBar`: Green progress bar showing percent completion.
  * `DetailMetaList`: Displays Goal type, Target Date, and Remaining amount.
  * `Contribute`: Prominent button opening contribution modal.
* **Edit Mode Form Inputs**:
  * `name`: Goal name text input.
  * `targetAmount`: Target amount numeric input.
  * `targetDate`: Target deadline `DateInput`.
  * Actions: `Save Changes` & `Cancel`.

#### 3. Contribute to Goal Screen (`/goal/[id]/contribute`)
* **Purpose**: Modal form to log a deposit towards a savings goal.
* **Form Inputs**:
  | Field Label | Form Key | Control Type | Input Props / Keyboard | Validation Rules & Limits | Placeholder / Helper |
  | :--- | :--- | :--- | :--- | :--- | :--- |
  | **Amount ({currency})** | `amount` | `Input` | `keyboardType="numeric"`, `leftIcon="goals"` | Required; positive finite number | `0.00` |
  | **Notes** | `notes` | `Input` | `multiline`, `maxLength=2000` | Optional; max 2000 chars | `Optional note...` |
* **Buttons & Actions**:
  * `Add Contribution`: Submits deposit and updates goal progress.

---

### 5.7 Loans & Debts Screens `(loan)`

#### 1. Loans Overview Screen (`/loan`)
* **Purpose**: List tracked liabilities, loans, credit card balances, and EMIs.
* **Layout**: `StickyHeaderFlatScreen` with `ProfileStackHeader` and `LoanCard` items.
* **Inputs & Actions**:
  * `+` Header Action: Navigates to `/loan/add`.
  * Tap Card: Navigates to `/loan/[id]/index`.
  * Delete icon: Prompts delete confirmation.

#### 2. Add Loan Screen (`/loan/add`)
* **Purpose**: Track a new loan, credit card debt, or EMI repayment schedule.
* **Form Inputs**:
  | Field Label | Form Key | Control Type | Input Props / Keyboard | Validation Rules & Limits | Placeholder / Helper |
  | :--- | :--- | :--- | :--- | :--- | :--- |
  | **Loan name** | `name` | `Input` | `leftIcon="wallet"`, `maxLength=255` | Required; min 1, max 255 chars | `e.g. Car loan` |
  | **Type** | `type` | `OptionChips` (Segmented) | Options: `Loan`, `Credit Card`, `EMI`, `Other` | Default: `Loan` | Debt type |
  | **Principal amount ({currency})** | `principal` | `Input` | `keyboardType="numeric"`, `leftIcon="wallet"` | Required; positive finite number | `0.00` |
  | **Interest rate (%)** | `interestRate` | `Input` | `keyboardType="numeric"` | Optional positive number | `e.g. 9.5` |
  | **Monthly EMI ({currency})** | `emiAmount` | `Input` | `keyboardType="numeric"` | Optional positive number | `0.00` |
  | **Start date** | `startDate` | `DateInput` | Calendar picker; default today | Required; historical bounds (up to 50 years past) | Start date |
  | **Due day of month** | `dueDayOfMonth`| `Input` | `keyboardType="numeric"` | Optional integer between 1 and 31 | Helper: "Day of month payment is due (1-31)" |
  | **Notes** | `notes` | `Input` | `multiline`, `maxLength=2000` | Optional; max 2000 chars | `Optional note...` |
* **Buttons & Actions**:
  * `Add Loan`: Submits debt record.

#### 3. Loan Detail Screen (`/loan/[id]/index`)
* **Purpose**: Inspect principal balance, payments made, remaining balance, and record repayments.
* **Read-Only Mode Elements**:
  * `DetailHero`: Large red remaining balance counter.
  * `ProgressBar`: Displays paid-off percentage.
  * `DetailMetaList`: Displays Principal, Interest rate, Monthly EMI, Due day of month, and Start date.
  * Actions: `Record Payment` (opens `/loan/[id]/pay`), `Edit`, and `Delete`.
* **Edit Mode Form Inputs**:
  * `name`: Text input.
  * `interestRate`: Numeric input.
  * `emiAmount`: Numeric input.
  * `notes`: Multiline text input.

#### 4. Record Loan Payment Screen (`/loan/[id]/pay`)
* **Purpose**: Log a payment to reduce the loan's outstanding principal balance.
* **Form Inputs**:
  | Field Label | Form Key | Control Type | Input Props / Keyboard | Validation Rules & Limits | Placeholder / Helper |
  | :--- | :--- | :--- | :--- | :--- | :--- |
  | **Amount ({currency})** | `amount` | `Input` | `keyboardType="numeric"`, `leftIcon="wallet"` | Required; positive number | `0.00` |
  | **Notes** | `notes` | `Input` | `multiline`, `maxLength=2000` | Optional; max 2000 chars | `Optional note...` |
* **Buttons & Actions**:
  * `Record Payment`: Submits payment, deducts remaining balance, and closes modal.

---

### 5.8 Net Worth & Accounts Screens

#### 1. Net Worth Screen (`/net-worth`)
* **Purpose**: Aggregated overview of total assets, liabilities, bank accounts, and investment portfolios.
* **Layout**:
  * Net Worth Hero Banner with animated gradient and total net worth counter.
  * Responsive 4-card metric grid: Total Assets, Total Liabilities, Bank Balance, Investment Value.
  * Bank Accounts section listing linked accounts with individual balances.
  * Investment Holdings section listing assets with live gain/loss values.
* **Inputs & Actions**:
  * Pull-to-refresh: Refetches all account and investment balances.
  * Card taps: Route to `/accounts` and `/investments`.

#### 2. Accounts Screen (`/accounts`)
* **Purpose**: Manage physical bank accounts, credit cards, and cash wallets.
* **Layout**: `StickyHeaderFlatScreen` with account list, plus floating `ActionFab` (`+ Add account`).
* **Add / Edit Account Modal Form Inputs (`FormModal`)**:
  | Field Label | Form Key | Control Type | Input Props / Keyboard | Validation Rules & Limits | Placeholder / Helper |
  | :--- | :--- | :--- | :--- | :--- | :--- |
  | **Account name** | `name` | `Input` | `leftIcon="wallet"`, `maxLength=255` | Required; min 1, max 255 chars | `e.g. Primary Checking` |
  | **Account type** | `type` | `OptionChips` (Segmented) | Options: `Bank`, `Credit Card`, `Cash`, `Wallet` | Required (hidden on edit) | Account type |
  | **Institution** | `institution` | `Input` | `leftIcon="netWorth"`, `maxLength=255` | Optional; max 255 chars (hidden on edit) | `e.g. HDFC Bank, Chase` |
  | **Last 4 digits** | `accountNumberLast4`| `Input` | `keyboardType="number-pad"`, `maxLength=4` | Optional; must be exactly 4 digits if provided (hidden on edit) | Helper: "For identification only" |
  | **Balance ({currency})** | `balance` | `Input` | `keyboardType="numeric"`, `leftIcon="wallet"` | Required finite number (allows negative for credit cards) | Current account balance |
* **Buttons & Actions**:
  * `Add Account` / `Update`: Primary modal action.
  * `Cancel`: Closes modal.

#### 3. Investments Screen (`/investments`)
* **Purpose**: Portfolio management for stocks, mutual funds, fixed deposits, crypto, and gold.
* **Layout**: Virtualized holding list with current valuation and gain/loss indicators; floating `ActionFab`.
* **Add / Edit Investment Modal Form Inputs (`FormModal`)**:
  | Field Label | Form Key | Control Type | Input Props / Keyboard | Validation Rules & Limits | Placeholder / Helper |
  | :--- | :--- | :--- | :--- | :--- | :--- |
  | **Investment name** | `name` | `Input` | `leftIcon="chart"`, `maxLength=255` | Required; min 1, max 255 chars (hidden on edit) | `e.g. Apple Stock` |
  | **Investment type** | `type` | `OptionChips` | Options: `Stocks`, `Mutual Fund`, `Fixed Deposit`, `Crypto`, `Gold`, `Other` | Required (hidden on edit) | Investment category |
  | **Symbol** | `symbol` | `Input` | `maxLength=20`, `autoCapitalize="characters"` | Optional ticker; max 20 chars (hidden on edit) | `e.g. AAPL, INFY` |
  | **Purchase price** | `purchasePrice` | `Input` | `keyboardType="numeric"` | Required positive number (hidden on edit) | Price per unit when bought |
  | **Purchase date** | `purchaseDate` | `DateInput` | Historical date picker | Required date (hidden on edit) | Date acquired |
  | **Quantity** | `quantity` | `Input` | `keyboardType="numeric"` | Required positive number; max 1,000,000,000 | Number of units held |
  | **Current price** | `currentPrice` | `Input` | `keyboardType="numeric"` | Required positive number | Current market price per unit |
* **Buttons & Actions**:
  * `Add Investment` / `Update`: Submits holding.

---

### 5.9 Subscriptions & Recurring Bills (`/subscriptions`)

* **Purpose**: Monitor active recurring charges and manually add or dismiss detected subscription series.
* **Layout**:
  * Header showing active count and total monthly equivalent cost (`₹XXX/mo`).
  * `Active` list: Cards showing merchant name, frequency, next due date, amount, and `Dismiss` / `Delete` controls.
  * `Add a subscription` inline expandable form:
* **Add Subscription Form Inputs**:
  | Field Label | Form Key | Control Type | Input Props / Keyboard | Validation Rules & Limits | Placeholder / Helper |
  | :--- | :--- | :--- | :--- | :--- | :--- |
  | **Merchant** | `merchant` | `Input` | `leftIcon="activity"`, `maxLength=255` | Required; min 1, max 255 chars | `e.g. Netflix, Spotify` |
  | **Amount ({currency})** | `amount` | `Input` | `keyboardType="numeric"`, `leftIcon="wallet"` | Required positive number | `0.00` |
  | **Cadence** | `cadence` | `OptionChips` (Segmented) | Options: `Weekly`, `Monthly`, `Yearly` | Required; default: `Monthly` | Frequency |
  | **Next due date** | `nextDueDate` | `DateInput` | Calendar picker; default today | Required; bounds: 2 years past to 1 year ahead | Upcoming charge date |
  | **Category (optional)**| `categoryId` | `OptionChipList` | Chip list of user categories | Optional category | Link to category |
* **Buttons & Actions**:
  * `Add Subscription`: Saves recurring series.
  * `Dismiss`: Dismisses current recurring billing cycle alert.
  * `Delete`: Deletes the series permanently.

---

### 5.10 Family Groups & Shared Expenses (`/family`)

* **Purpose**: Collaborate on household finances, share budgets, split bills, and track mutual debt balances.
* **Layout**:
  * `Your groups` Section: Cards showing group name, user role (`owner`/`member`), invite code, and `GroupBalances` (who owes whom with "Settle up" buttons).
  * `Create group` Section: Inline creation form.
  * `Join group` Section: Invite code submission form.
* **Create Group Form Inputs**:
  | Field Label | Form Key | Control Type | Input Props / Keyboard | Validation Rules & Limits | Placeholder / Helper |
  | :--- | :--- | :--- | :--- | :--- | :--- |
  | **Group name** | `name` | `Input` | `leftIcon="family"`, `maxLength=255` | Required; min 1, max 255 chars | `e.g. Smith Family` |
* **Join Group Form Inputs**:
  | Field Label | Form Key | Control Type | Input Props / Keyboard | Validation Rules & Limits | Placeholder / Helper |
  | :--- | :--- | :--- | :--- | :--- | :--- |
  | **Invite code** | `inviteCode` | `Input` | `leftIcon="link"`, `autoCapitalize="characters"`, `maxLength=20` | Required; 6 to 20 alphanumeric chars | `ABC123` |
* **Buttons & Actions**:
  * `Create Group`: Creates new family group and generates unique invite code.
  * `Join Group`: Validates code and links user membership.
  * `Settle up`: Resolves balances between members.

---

### 5.11 Categories Management (`/categories`)

* **Purpose**: Organize transaction categories, edit labels, assign colors, reorder priority, and archive defaults.
* **Layout**: Reorderable list with up/down sort buttons, edit icons, archive icons, and floating `ActionFab`.
* **Add / Edit Category Modal Form Inputs (`FormModal`)**:
  | Field Label | Form Key | Control Type | Input Props / Keyboard | Validation Rules & Limits | Placeholder / Helper |
  | :--- | :--- | :--- | :--- | :--- | :--- |
  | **Category name** | `name` | `Input` | `leftIcon="category"`, `maxLength=100` | Required; min 1, max 100 chars | `e.g. Food, Travel, Utilities` |
  | **Color** | `color` | `ColorPicker` | Horizontal swatch selector | Selected hex code from curated palette (10 colors) | Color swatch |
* **Buttons & Actions**:
  * `Create` / `Update`: Submits category changes.
  * `Move Up` / `Move Down`: Reorders category sorting order.
  * `Archive`: Hides custom categories (default system categories cannot be deleted).

---

### 5.12 Integrations & Parser (`/integrations`)

* **Purpose**: Automated ingestion of bank statements, SMS alerts, and email receipts.
* **Layout**:
  * `Import CSV statement`: File picker button.
  * `Pending review`: Horizontal chip list of parsed transactions awaiting confirmation.
  * `Parsed transaction`: Review card with confidence score, editable category picker, and Confirm/Reject buttons.
  * `Parse SMS` form.
  * `Parse email` form.
* **Form Inputs**:
  | Section | Field Label | Form Key | Control Type | Input Props / Keyboard | Validation Rules & Limits | Placeholder / Helper |
  | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
  | **CSV Import** | Choose CSV file | N/A | File Document Picker (`expo-document-picker`) | Must be `.csv` MIME type; max 10MB | Native file selector |
  | **Review** | Category | `categoryId` | `OptionChipList` | Required to confirm parsed expense | Select category to assign |
  | **Parse SMS** | **SMS content** | `content` | `Input` | `multiline`, `maxLength=10000` | Required; min 10, max 10,000 chars | `Paste bank SMS here...` (Helper: "Include amount & merchant") |
  | **Parse Email** | **Subject** | `subject` | `Input` | `leftIcon="mail"`, `maxLength=255` | Required; min 1, max 255 chars | Email subject line |
  | **Parse Email** | **Email body** | `body` | `Input` | `multiline`, `maxLength=50000` | Required; min 10, max 50,000 chars | `Paste email body here...` |
* **Buttons & Actions**:
  * `Parse SMS`: Triggers regex/NLP extractor.
  * `Parse Email`: Submits email content for parsing.
  * `Confirm as Expense`: Commits parsed item into official expense ledger.
  * `Reject`: Discards parsed item.

---

### 5.13 Reports & Data Export (`/reports`)

* **Purpose**: Export transaction history into CSV spreadsheets or formatted PDF files.
* **Form Inputs**:
  | Field Label | Form Key | Control Type | Input Props / Keyboard | Constraints | Placeholder / Helper |
  | :--- | :--- | :--- | :--- | :--- | :--- |
  | **Start date** | `startDate` | `DateInput` | Calendar picker; historical bounds | Optional; if provided, must be on or before `endDate` | Leave empty for all-time |
  | **End date** | `endDate` | `DateInput` | Calendar picker; historical bounds | Optional; if provided, must be on or after `startDate` | Leave empty for all-time |
* **Buttons & Actions**:
  * `Download CSV`: Generates and exports `.csv` file via native share sheet (`expo-sharing`).
  * `Download PDF`: Generates and exports formatted `.pdf` summary.

---

### 5.14 Monthly Recap Screen (`/recap`)

* **Purpose**: Monthly spending summary and highlight reel.
* **Layout**:
  * Total spent hero card.
  * Top category card.
  * Biggest expense card.
  * No-spend streak counter.
* **Inputs & Actions**:
  * Pull-to-refresh: Updates recap figures.
  * `Share recap`: Opens system share dialog with formatted textual breakdown.

---

### 5.15 Universal Search Screen (`/search`)

* **Purpose**: Real-time keyword search across all transactions (merchant, notes, category names).
* **Layout**: Header with search input field, instant results list, and skeleton state.
* **Form Inputs**:
  | Field Label | Form Key | Control Type | Input Props / Keyboard | Limits & Validation | Placeholder |
  | :--- | :--- | :--- | :--- | :--- | :--- |
  | **Search** | `query` | `Input` | `leftIcon="search"`, `autoFocus=true`, `maxLength=100` | Min 2 characters to trigger query; max 100 chars | `Type to search...` |
* **Actions**:
  * Tapping a result row navigates to `/expense/[id]` or `/income/[id]`.

---

### 5.16 Notifications Center (`/notifications`)

* **Purpose**: View budget alert notices, weekly digests, and family split updates.
* **Layout**: Virtualized list of notification cards with blue unread left-accent borders.
* **Inputs & Actions**:
  * Reading: Opening the screen automatically marks notifications as read.
  * Pull-to-refresh: Refetches notifications.
  * Infinite scroll: Loads older notifications.

---

### 5.17 Support & Helpdesk (`/support`)

* **Purpose**: Submit customer assistance tickets and view ticket status.
* **Layout**:
  * `New ticket` FormSection.
  * `Your tickets` GroupedCard showing subject, status badge (`open`, `in_progress`, `resolved`), and date.
* **Form Inputs**:
  | Field Label | Form Key | Control Type | Input Props / Keyboard | Validation Rules & Limits | Placeholder / Helper |
  | :--- | :--- | :--- | :--- | :--- | :--- |
  | **Subject** | `subject` | `Input` | `leftIcon="support"`, `maxLength=255` | Required; min 3, max 255 chars | `Brief summary of your issue` |
  | **Message** | `message` | `Input` | `multiline`, `maxLength=5000` | Required; min 10, max 5,000 chars | `Describe what happened and how we can help...` (Helper: "Must be at least 10 characters") |
* **Buttons & Actions**:
  * `Submit Ticket`: Dispatches ticket to backend API.

---

### 5.18 Legal & Policy Screens (`/legal/privacy`, `/legal/terms`)

* **Purpose**: Display terms of service and data privacy declarations.
* **Layout**: `StackScrollScreen` with numbered sections (`1. Information We Collect`, `2. How We Use Your Data`, `3. Data Security`, `4. Third-Party Services`, `5. Your Rights`, `6. Contact`).
* **Inputs**: No form inputs; read-only text view with back navigation.

---

## 6. Global Field Limits & Validation Specifications Matrix

All inputs across the entire application adhere to the synchronized rule set defined in `src/shared/validation/fieldLimits.ts`. These rules provide the primary validation gate:

| Field Key | Min Chars | Max Chars | Data Type / Regex / Format | Default Error Message |
| :--- | :--- | :--- | :--- | :--- |
| `email` | 1 | 255 | RFC-compliant email string | `"Enter a valid email address"` |
| `password` | 8 | 72 | Must have ≥1 letter, ≥1 number, ≥1 special char, no spaces | `"Password must include a letter, a number, and a special character"` |
| `name` / `entityName` | 1 | 255 | Trimmed string | `"Must be at least 1 characters"` |
| `categoryName` | 1 | 100 | Trimmed string | `"Must be at least 1 characters"` |
| `merchant` | 1 | 255 | Trimmed string | `"Must be at least 1 characters"` |
| `otp` | 6 | 6 | Exactly 6 numeric digits `^\d{6}$` | `"Enter the 6-digit code"` |
| `country` | 1 | 100 | String | `"Must be at least 1 characters"` |
| `currency` | 3 | 3 | Enum: `INR`, `USD`, `EUR`, `GBP`, `AED`, `SGD` | `"Currency must be one of: INR, USD, EUR, GBP, AED, SGD"` |
| `notes` | 0 | 2000 | Multiline text | `"Must be at most 2000 characters"` |
| `search` | 2 | 100 | String | `"Must be at least 2 characters"` |
| `institution` | 0 | 255 | String | `"Must be at most 255 characters"` |
| `accountNumberLast4` | 4 | 4 | Exactly 4 numeric digits `^\d{4}$` | `"Last 4 digits must be numeric"` |
| `symbol` | 0 | 20 | Alphanumeric ticker symbol | `"Must be at most 20 characters"` |
| `inviteCode` | 6 | 20 | Alphanumeric code | `"Invalid invite code"` |
| `subject` | 3 | 255 | String | `"Must be at least 3 characters"` |
| `message` | 10 | 5000 | Multiline text | `"Must be at least 10 characters"` |
| `aiMessage` | 1 | 4000 | Multiline text | `"Must be at most 4000 characters"` |
| `smsContent` | 10 | 10000 | Raw SMS text | `"Must be at least 10 characters"` |
| `emailSubject` | 1 | 255 | String | `"Must be at least 1 characters"` |
| `emailBody` | 10 | 50000 | Raw email body | `"Must be at least 10 characters"` |
| `salaryRange` | 1 | 50 | Enum string | `"Please select a salary range"` |
| `financialGoal` | 1 | 100 | Array of strings (min 1, max 20) | `"Please select at least one financial goal"` |
| **Monetary Amount** | > 0 | 9,999,999,999,999.99 | Finite positive decimal (`.2` precision) | `"Amount must be greater than zero"` |
| **Quantity** | > 0 | 1,000,000,000 | Finite positive number | `"Quantity must be greater than zero"` |
| **Alert Threshold** | 1 | 100 | Positive integer percentage | `"Alert threshold must be between 1 and 100"` |
| **Transaction Date** | Today - 10 yrs | Today | ISO date `YYYY-MM-DD` | `"Date cannot be in the future"` |
| **Budget Start Date** | Today - 2 yrs | Today + 1 yr | ISO date `YYYY-MM-DD` | `"Date is too far in the past/future"` |
| **Budget End Date** | `startDate` | `startDate` + 5 yrs | ISO date `YYYY-MM-DD` | `"End date must be on or after start date"` |

---

## 7. State Management & Storage Layers

### 7.1 Redux Store (`src/shared/store`)
* **`auth` Slice**:
  * `isAuthenticated`: boolean flag driving `AuthGate`.
  * `user`: Current logged-in user profile, roles, onboarding status, and currency.
  * `isLoading`: Cold start bootstrap status.
* **Persistence**:
  * Configured via `redux-persist` with AsyncStorage engine for general cache.
  * Tokens (`accessToken`, `refreshToken`) stored securely using `expo-secure-store`.

### 7.2 Biometric App Lock (`AppLockGate`)
* Intercepts application focus when the app returns from the background.
* Prompts native FaceID / TouchID / passcode verification using `expo-local-authentication` before displaying sensitive financial dashboards.

### 7.3 Offline Sync Architecture (`initOfflineSync`)
* Listens to network connectivity state using `@react-native-community/netinfo`.
* Queues failed mutations (expense creations, edits, deletes) into an offline persistent queue in AsyncStorage.
* Automatically replays queued mutations in chronological order when network connectivity is re-established.
