# BudgetBrain Mobile — UI/UX Inconsistency & Issues Report

> **Audit Date:** 2026-09-23  
> **Compared against:** `new_design/` folder (Dashboard, Activity/Transactions, Budgets/Limits, Log Expense, Luminous Wealth Design System, App Icon)

---

## Table of Contents

1. [Bottom Navigation / Tab Bar](#1-bottom-navigation--tab-bar)
2. [Dashboard Screen](#2-dashboard-screen)
3. [Activity / Transactions Screen](#3-activity--transactions-screen)
4. [Budgets Overview Screen](#4-budgets-overview-screen)
5. [Log Expense / Add Expense Screen](#5-log-expense--add-expense-screen)
6. [Design System & Theme Tokens](#6-design-system--theme-tokens)
7. [Typography Inconsistencies](#7-typography-inconsistencies)
8. [Spacing & Layout Issues](#8-spacing--layout-issues)
9. [Color & Elevation Discrepancies](#9-color--elevation-discrepancies)
10. [Animation & Micro-Interaction Gaps](#10-animation--micro-interaction-gaps)
11. [Cross-Cutting UX Issues](#11-cross-cutting-ux-issues)
12. [App Icon](#12-app-icon)

---

## 1. Bottom Navigation / Tab Bar

### 1.1 Tab Count Mismatch (Critical)

| Aspect | New Design | Current Mobile |
|--------|-----------|----------------|
| Tab count | **5 tabs**: Home, Activity, [+], Budgets, AI Coach | **4 tabs**: Home, Activity, [+], Budgets, Profile |
| 5th tab | `AI Coach` (brain/neurology icon) | `Profile` (profile/settings icon) |

> [!IMPORTANT]
> The new design replaces the **Profile** tab with an **AI Coach** tab. The current mobile app has `settings` as a visible 4th tab instead. The AI Coach tab is currently hidden (`href: null` in [_layout.tsx](file:///Users/navneet/Projects/Mobile-apps/BudgetBrain/mobile/src/app/(tabs)/_layout.tsx#L35)).

**Files affected:**
- [_layout.tsx](file:///Users/navneet/Projects/Mobile-apps/BudgetBrain/mobile/src/app/(tabs)/_layout.tsx) — Tab definitions
- [CustomTabBar.component.tsx](file:///Users/navneet/Projects/Mobile-apps/BudgetBrain/mobile/src/features/navigation/components/CustomTabBar.component.tsx#L29-L34) — `TABS` array only has 4 items

### 1.2 Tab Bar Visual Styling Differences

| Aspect | New Design | Current Mobile |
|--------|-----------|----------------|
| Background | `backgroundElevated/90` with `backdrop-blur-2xl` (glass effect) | `tabBar` solid color (`#151C2F`), no blur |
| Border radius | `28px` outer | `xl + 4` (~28px) ✅ Matches |
| Active indicator | Accent glow indicator below active tab icon | Simple 16×3px colored bar below icon |
| Label font size | `11px` caption | `10px` with `fontWeight: 600` — **1px smaller** than spec |
| FAB size | `48px` (w-12 h-12) | `56px` — **8px larger** than design |
| FAB elevation offset | `-mt-5` (20px above bar) | `marginTop: -28` — **8px more elevated** |
| Notification badge on FAB | Not present | Uses `ActionSheet` popup — ✅ acceptable UX pattern |
| Shadow | `box-shadow: 0 8px 32px rgba(0,0,0,0.55)` | Uses theme `shadows.lg` — close but not identical |

### 1.3 Tab Bar Icons Mismatch

| Tab | Design Icon | Mobile Icon |
|-----|-------------|-------------|
| Home | `home` (Material Symbols) | `home` (AppIcon) ✅ |
| Activity | `bar_chart` | `activity` (custom) — potentially different glyph |
| Budgets | `pie_chart` | `budgets` (custom) — potentially different glyph |
| AI Coach | `neurology` | **Missing** — tab doesn't exist |

### 1.4 Backdrop Blur Missing
The design specifies `backdrop-blur-2xl` (`blur(40px)`) on the nav bar for a frosted glass effect. The mobile implementation uses a solid `tabBar` background color without any `BlurView` or equivalent.

---

## 2. Dashboard Screen

### 2.1 Hero Card

| Aspect | New Design | Current Mobile |
|--------|-----------|----------------|
| Card radius | `24px` (`rounded-[24px]`) | Uses `radii.xl` (24px) ✅ |
| Background | `gradient-to-b from-surface-dark to-surface-container-low` | `heroCard` in styles — ✅ generally aligned |
| Pulsing status dot | Animated ping dot (green pulse) | `livePulseDot` view — present but no `Animated.loop` ping animation |
| Savings badge | `+18.4% saved` pill with trend icon, gradient bg | Text-only chip with icon — **missing the `secondaryContainer/20` background tint** |
| Ring visualizer size | `56px` (w-14 h-14) | `54px` — **2px smaller** |
| Ring SVG gradient | `secondary → primary` (`#4edea3 → #89ceff`) | Using `gradientColors` prop ✅ |
| Target banner | Shows "8 days left" with specific "$5,200 goal" text | Shows generic "Cycle active" — **no countdown or goal amount** |

> [!WARNING]
> The "8 days left" countdown and "$5,200 goal" target from the design are replaced with a generic "Cycle active" text, losing a key motivational UX element.

### 2.2 Quick Actions Row

| Aspect | New Design | Current Mobile |
|--------|-----------|----------------|
| Grid layout | `grid-cols-3` with equal sizing | `quickActionsGrid` — 3 columns ✅ |
| Primary button | Gradient `ocean-dark → primary-container` with rounded-xl | `LinearGradient` with `actionPrimaryGradient` ✅ |
| Icon circle background | `bg-white/20` translucent circle | `actionPrimaryIconCircle` — **needs verification of translucency** |
| Scan Slip action | Opens receipt scanner directly | Routes to `/expense/add` — **not a dedicated scanner flow** |

### 2.3 Streak Achievement Banner

| Aspect | New Design | Current Mobile |
|--------|-----------|----------------|
| Fire emoji | `🔥` with `animate-bounce` | `StreakBanner` component — present ✅ |
| Tier badge | Shows "Tier 2" pill with warning color | Has `tier` prop ✅ |
| Gradient background | Multi-stop gradient: `from-surface-dark via-surface-container to-surface-container-high` | Likely solid card — **needs gradient verification** |

### 2.4 Key Financials Bento Grid

| Aspect | New Design | Current Mobile |
|--------|-----------|----------------|
| Card radius | `20px` | Uses `radii.card` (20px) ✅ |
| Min height | `115px` | `BentoCard` component — **needs min-height constraint check** |
| Icon containers | `w-7 h-7 rounded-lg` (28px square, 8px radius) | `BentoCard` — **needs size/radius verification** |
| Percentage badge | Color-coded by context (secondary for positive, tertiary for neutral) | Uses `badgeColor` prop ✅ |
| "Live Updates" action | Shown as text link | Passed as `action` to `SectionHeader` ✅ |

### 2.5 Active Budgets Watchlist

| Aspect | New Design | Current Mobile |
|--------|-----------|----------------|
| "2 Alerting" badge | Pill badge next to title in `surface-container-high` | **Not present** — only section header with "Manage" action |
| Budget icon containers | `w-9 h-9 rounded-xl` (36px, 12px radius) | Uses `budgetIconPod` — size may differ |
| Progress bar | `h-2` (8px) with gradient colors | Uses `ProgressBar` component with `height={7}` — **1px shorter** |
| Alert state | Shows "95%" badge with red text + `$20.00 left to limit` | Shows `left to limit` text ✅ |

### 2.6 Spending Breakdown Section

| Aspect | New Design | Current Mobile |
|--------|-----------|----------------|
| Card container | `rounded-[24px]` with integrated content | `breakdownCard` in elevated `Card` — radius may differ |
| Segmented macro bar | Multi-color horizontal bar with 5 segments and `1px` gaps | `CategoryChart` component — **needs visual parity check** |
| "By Category" dropdown | Shows dropdown pill with expand_more icon | **Not visible** in mobile implementation |
| Date range | Shows "May 1 – May 24" | **Not displayed** in current implementation |
| Category color dots | `2.5×2.5` dots with legend grid | Handled by `CategoryChart` — layout may differ |

### 2.7 Recent Activity Feed

| Aspect | New Design | Current Mobile |
|--------|-----------|----------------|
| Transaction card radius | `20px` rounded | `TransactionItem` component — needs radius check |
| Icon containers | `w-11 h-11 rounded-2xl` (44px, 16px radius) | In `TransactionItem` — **needs dimension/radius verification** |
| Payment method pill | Shows "Apple Pay" / "Card **8842" in mini pill | Shown as sub-text — **needs badge-style pill verification** |
| Amount typography | `title-sm` (17px, weight 600) with bold override | May use different weight/size |
| Category label | Shown below amount in tertiary color | Present ✅ |
| "View all" link | Has `chevron_right` icon after text | Uses `SectionHeader` action — may lack icon |

### 2.8 Missing Sections in Dashboard

> [!CAUTION]
> The current mobile dashboard has extra sections **not in the new design**: 
> - Spending Trends Chart (`SpendingTrendChart`)
> - Goal Progress section
> - Upcoming Bills section
> 
> These may be intentional additions, but they are **not part of the new design reference** and may create visual clutter.

---

## 3. Activity / Transactions Screen

### 3.1 Search & Filter Bar

| Aspect | New Design | Current Mobile |
|--------|-----------|----------------|
| Search input | `h-11` (44px), `rounded-xl`, placeholder "Search 248 transactions..." | Uses `TextInput` with `searchInput` style — height may differ |
| Filter button | Shows badge count (`3`) in primary circle | Has `badgeCount` view ✅ |
| Export/Share button | `ios_share` icon in `h-11 w-11 rounded-xl` | Uses `send` icon — **different icon glyph** |

### 3.2 Filter Chips Rail

| Aspect | New Design | Current Mobile |
|--------|-----------|----------------|
| Chip style | Active: `bg-primary text-on-primary`, with checkmark icon | `FilterChipsRail` component — needs visual check |
| Chip typography | `body-semibold text-caption` (mixed styles) | Uses themed styles |
| Divider separators | `w-px h-5` vertical dividers between chip groups | **Likely missing** — most chip rails don't include dividers |
| "This Month" chip | Special accent: `bg-primary-container/20 text-primary` | Styled as regular filter chip |
| Category dot indicator | `w-2 h-2` color dot inside category chip (e.g., Food & Dining) | **Not implemented** — chips use text only |

### 3.3 Monthly Cash Flow Hero Widget

| Aspect | New Design | Current Mobile |
|--------|-----------|----------------|
| Layout | Rounded 2xl card with gradient + ambient backlight accents | `CashFlowHero` component ✅ |
| Metric modules | Split into "Total Spent" and "Total Earned" cards with rounded-xl bg | **Needs verification** of sub-card styling |
| Ratio progress bar | Bi-directional bar (red spent / green earned) | **Needs verification** |
| Net surplus text | Bold inline with `strong` tag | Present in component |
| "Pull down to sync bank accounts" | Shown as animated hint below hero | Shows "Pull down to sync transactions" — **different wording** |

### 3.4 Transaction Ledger Items

| Aspect | New Design | Current Mobile |
|--------|-----------|----------------|
| Card style | `rounded-2xl bg-surface-dark` with hover state | `TransactionItem` — uses `TransactionGroup` wrapper |
| Icon container | `w-11 h-11 rounded-xl` with category-tinted background | Needs size/radius verification |
| Payment method badge | Mini icon badge at bottom-right of icon (`w-4 h-4 rounded-full`) | **Not implemented** — no payment method overlay badge |
| Category inline badge | Pill badge next to merchant name (e.g., "Groceries", "Transport") | Uses separate text — **not a pill/badge** |
| Amount typography | `amount-metric` (22px, weight 700, -0.5 letter-spacing) | `TransactionItem` — may use different type style |
| Status text | "Completed", "Verified", "Auto-Categorized", "Monthly" | **Not showing** transaction status in current UI |
| Income highlight | Left green border (`w-1 bg-secondary`) on income rows | **Not implemented** — no left accent strip |
| Date group headers | "TODAY", "YESTERDAY", "OCT 24" in eyebrow caps with dot separator | Uses standard date grouping — **styling may differ** |
| Daily net summary | Shows net amount per day group (e.g., "2 items • -$102.70") | **Not implemented** in current `TransactionGroup` |

> [!WARNING]
> Several transaction list micro-details from the design are missing:
> - Payment method overlay badges on icons
> - Category pill badges inline with merchant names
> - Transaction status indicators (Completed/Verified/Auto-Categorized)
> - Income row left accent border
> - Per-day net sum in group headers

### 3.5 End-of-List Card

| Aspect | New Design | Current Mobile |
|--------|-----------|----------------|
| Content | "All transactions synced & balanced" + encryption note | Present in `footerSyncCard` ✅ |
| Icon | Verified checkmark in circle | Uses `checkmark` icon ✅ |

---

## 4. Budgets Overview Screen

### 4.1 Radial Gauge Banner

| Aspect | New Design | Current Mobile |
|--------|-----------|----------------|
| Gauge style | SVG semi-circular meter with dashed background track | `RingGauge` component — **uses full ring, not semi-circular** |
| Center icon | Gradient-filled icon pod with `insights` icon | Uses `budgets` icon — **different glyph** |
| "6 Days Left" pill | Pulse dot + text in rounded pill | Shows "Cycle Active" — **no day countdown** |
| Amount display | Hero display with `.60` in smaller text (split integer/decimal) | Single formatted amount — **no split decimal styling** |
| Daily Safe burn rate | Separate rounded-xl card with shield icon | `dailySafePill` view — present but styling may differ |

> [!IMPORTANT]
> The design's **split decimal display** (`$3,569` in hero + `.60` in secondary text) is a key visual refinement not present in the current implementation, which shows the full formatted amount in one style.

### 4.2 Segmented Period Filters

| Aspect | New Design | Current Mobile |
|--------|-----------|----------------|
| Filter style | Sliding segmented control in `surface-container-low` bar | `FilterChipsRail` component — **different interaction pattern** |
| Active state | `bg-surface-container-high text-primary` with shadow | Chip rail selection — may not match pill segmented style |
| Labels | "Active (5)", "Custom (2)", "Archived" | Uses `periodChips` — labels may differ |

### 4.3 Budget Category Cards

| Aspect | New Design | Current Mobile |
|--------|-----------|----------------|
| Card padding | `p-space-lg` (16px) | `BudgetCard` component — needs verification |
| Progress bar height | `h-2` (8px) with multi-color gradient | `ProgressBar` — height/gradient may differ |
| Warning state | Ambient rose glow, warning alert tag with "Adjust" button | `BudgetCard` alert state — **missing ambient glow and inline CTA** |
| Rollover pill | Shows "Rollover active: +$45.00 added from last month" | **Not implemented** in current `BudgetCard` |
| "Ideal Pace" label | Shows contextual pace indicator (green text) | **Not implemented** |
| "X recurring due soon" | Shows count of upcoming recurring expenses | **Not implemented** |
| Spent % and buffer labels | Shows "77.5% spent" / "22.5% safe buffer" below progress | **Not implemented** — only shows progress bar |

### 4.4 AI Optimization Forecast Banner

| Aspect | New Design | Current Mobile |
|--------|-----------|----------------|
| CTA text | "Apply smart rebalance →" | Shows "Ask AI Coach" with chevron — **different CTA wording and intent** |
| Description | Specific: "shifting $50 from Tech into Dining" | Generic recommendation fallback text |
| Icon | `auto_awesome` sparkles | `sparkles` (AppIcon) ✅ |

### 4.5 Create Budget Button

| Aspect | New Design | Current Mobile |
|--------|-----------|----------------|
| Style | Full-width `rounded-xl` gradient button | `LinearGradient` button ✅ |
| Text | "+ New Budget Category" with add_circle icon | Matches ✅ |
| Button radius | `rounded-xl` (12px) | Uses gradient style — radius may be `rounded-full` in mobile |

### 4.6 Missing "Sort by spent" Control
The design shows a "Sort by spent ↕" button in the categories section header. This is **not present** in the current implementation.

---

## 5. Log Expense / Add Expense Screen

### 5.1 Header Differences

| Aspect | New Design | Current Mobile |
|--------|-----------|----------------|
| Header layout | Back arrow + App icon + "Log Transaction" title + Profile avatar | `AppHeaderBar` with `showBack` — **may not show profile avatar** |
| Close button | `×` close button in header-right | **Not present** — only back arrow |
| Notification bell | Not shown (screen-specific header) | **Not shown** ✅ matches |

### 5.2 Sheet Handle & Sub-Header

| Aspect | New Design | Current Mobile |
|--------|-----------|----------------|
| Pull indicator | `w-10 h-1 rounded-full bg-surface-bright` | `sheetHandle` ✅ |
| "Scan Receipt" button | Pill button in header with icon | Present ✅ |
| Close "×" button | Next to Scan Receipt | **Not implemented** |

### 5.3 Amount Hero Card

| Aspect | New Design | Current Mobile |
|--------|-----------|----------------|
| Card style | `bg-surface-container-low rounded-xl` with ambient glows | `amountHeroCard` with glow views ✅ |
| Currency toggle | Pill with symbol + code + dropdown arrow | Implemented ✅ |
| Hero amount font | `display-hero-mobile` (28px, weight 800) | Uses themed style — ✅ |
| Quick presets | +$10, +$25, +$50, +$100, Round | All implemented ✅ |

### 5.4 Category Selector

| Aspect | New Design | Current Mobile |
|--------|-----------|----------------|
| Grid | `grid-cols-4` (4 columns × 2 rows) | `categoryGrid` — 4 columns ✅ |
| Selected category text | Shows "Food & Dining" in primary color at top-right | Has `suggestedHint` for "Auto-Suggested" — **different text** |
| Icon style | `w-10 h-10 rounded-full` with filled icons (`FILL 1`) | `catIconCircle` — size/fill may differ |
| Category labels | "Food", "Groceries", "Shopping", "Transit", "Bills", "Fun", "Health", "More" | Uses `categoryTiles` from hook — labels may differ |

### 5.5 Payment Method Selector

| Aspect | New Design | Current Mobile |
|--------|-----------|----------------|
| Labels | "Tap / Pay", "Card", "Cash", "Bank" | Uses `PAYMENT_METHODS` labels — needs verification |
| Style | `grid-cols-4` inside `surface-container-low` background | `paymentMethodsRow` — may differ |
| Icons | `contactless`, `credit_card`, `payments`, `account_balance` | AppIcon equivalents — needs glyph check |

### 5.6 Date & Family Split Section

| Aspect | New Design | Current Mobile |
|--------|-----------|----------------|
| Date display | "Today, 8:45 PM" with "Change" button | `currentDate` with "Change"/"Done" toggle ✅ |
| Family split | Toggle switch with "Smith Household" label | `ToggleSwitch` component ✅ |
| Toggle style | Custom `w-12 h-6 rounded-full` with `w-5 h-5` handle | Uses `ToggleSwitch` component — needs visual check |

### 5.7 Receipt Attachment

| Aspect | New Design | Current Mobile |
|--------|-----------|----------------|
| Icon style | `add_a_photo` in circle, changes on hover | Uses `document` icon — **different glyph** (should be camera) |
| Hover interaction | Icon circle changes to primary filled on hover | No hover state on mobile ✅ (expected) |

### 5.8 Notes & Tags

| Aspect | New Design | Current Mobile |
|--------|-----------|----------------|
| Tags | `#dinner`, `#groceries`, `#work`, `#treat` | `DEFAULT_TAG_PRESETS` — ✅ matches |
| Toggle behavior | Chips toggle `bg-primary-container/20 text-primary` | `tagChipSelected` style — ✅ |

### 5.9 Save Button

| Aspect | New Design | Current Mobile |
|--------|-----------|----------------|
| Shape | `rounded-full` (pill) | Uses `rounded-full` style — check against `savePressable` |
| Height | `h-14` (56px) | Needs verification |
| Gradient | `from-primary-container to-ocean-dark` | Gradient: `primaryContainer → ocean` ✅ |
| Saving state | Shows spinning sync icon + "Saving..." then "Logged!" with checkmark | Shows `ActivityIndicator` + "Saving Expense..." — **no "Logged!" success transition** |
| Bottom nav | **No bottom nav bar** on this screen | Nav bar hidden (screen is modal-style) ✅ |

---

## 6. Design System & Theme Tokens

### 6.1 Missing Color Tokens

The following design system colors are defined in [DESIGN.md](file:///Users/navneet/Projects/Mobile-apps/BudgetBrain/new_design/luminous_wealth/DESIGN.md) but **missing** from [palettes.ts](file:///Users/navneet/Projects/Mobile-apps/BudgetBrain/mobile/src/shared/theme/palettes.ts):

| Token | Design Value | Status |
|-------|-------------|--------|
| `surface-dark` | `#1C2540` | ❌ Not a separate token (computed differently) |
| `surface-elevated-dark` | `#151C2F` | ✅ Present as `backgroundElevated`/`surfaceElevated` |
| `surface-hover-dark` | `#24304C` | ✅ Present as `surfaceHover` |
| `border-dark` | `#3A4A6E` | ✅ Present as `border` |
| `border-subtle-dark` | `#2C3A5C` | ✅ Present as `borderSubtle` |
| `text-primary-dark` | `#F8FAFC` | ✅ Present as `text` |
| `text-secondary-dark` | `#B0BDCF` | ✅ Present as `textSecondary` |
| `text-tertiary-dark` | `#8B9BB5` | ✅ Present as `textTertiary` |
| `danger-dark` | `#F87171` | ✅ Present as `danger` |
| `warning-dark` | `#FBBF24` | ✅ Present as `warning` |
| `canvas-light` | `#F4F6FB` | ✅ Present as `background` (light) |
| `ocean-dark` | `#0284C7` | ✅ Present as `ocean` |
| `indigo-light` | `#8B5CF6` | ✅ Present as `violet` (reused) |

### 6.2 Surface Color Discrepancy

| Token | Design | Mobile (`palettes.ts`) |
|-------|--------|----------------------|
| `surface` (dark) | `#0e131d` | `#1B202A` — ❌ **Different** |
| `background` (dark) | `#0e131d` | `#0E131D` ✅ |
| `surface-container` | `#1b202a` | `#1B202A` ✅ |

> [!WARNING]
> The design uses `#0e131d` for `surface` (same as background), but the mobile theme uses `#1B202A` for `surface`, which is the design's `surface-container`. This creates a **slightly lighter base surface** than intended.

### 6.3 Border Radius Mapping Discrepancy

| Design Token | Design Value | Theme (`buildTheme.ts`) |
|-------------|-------------|------------------------|
| `sm` | `0.25rem` (4px) | `sm: 8` — ❌ **Double the design spec** |
| `DEFAULT` | `0.5rem` (8px) | No `default` key |
| `md` | `0.75rem` (12px) | `md: 12` ✅ |
| `lg` | `1rem` (16px) | `lg: 16` ✅ |
| `xl` | `1.5rem` (24px) | `xl: 24` ✅ |
| `card` | N/A (design uses 16-24px) | `card: 20` — custom addition |
| `nav` | `28px` (custom) | `nav: 28` ✅ |
| `full` | `9999px` | `full: 999` — ❌ `999` vs `9999` (minor) |

> [!NOTE]
> The `sm` radius is `8px` in the mobile theme but `4px` (`0.25rem`) in the design system. This affects small interactive targets, status tags, and inner category chips.

---

## 7. Typography Inconsistencies

### 7.1 Font Family for Large Amounts

| Typography Role | Design | Mobile |
|----------------|--------|--------|
| `amount-hero` / `amountLg` | `fontFamily: Inter` (weight 700) | `fontFamily: Fraunces_700Bold` ❌ |

> [!CAUTION]
> The `amountLg` style in [buildTheme.ts](file:///Users/navneet/Projects/Mobile-apps/BudgetBrain/mobile/src/shared/theme/buildTheme.ts#L43) uses **Fraunces** (a serif display font) instead of **Inter** for hero amounts. The Luminous Wealth design system specifies Inter for ALL typographic roles. This creates a serif vs. sans-serif inconsistency.

### 7.2 Line Height Discrepancies

| Style | Design `lineHeight` | Mobile `lineHeight` |
|-------|---------------------|---------------------|
| `titleSm` | `22px` | `21px` — ❌ **1px shorter** |
| `amount` | `26px` | `24px` — ❌ **2px shorter** |
| `amountLg` | `36px` | `35px` — ❌ **1px shorter** |

### 7.3 Label Eyebrow `textTransform`

| Aspect | Design | Mobile |
|--------|--------|--------|
| `label-eyebrow` | Uses `uppercase` in HTML classes | `textTransform: 'none'` in [buildTheme.ts](file:///Users/navneet/Projects/Mobile-apps/BudgetBrain/mobile/src/shared/theme/buildTheme.ts#L41) |

> [!WARNING]
> The design consistently applies `uppercase` + `tracking-wider` to eyebrow labels (e.g., "NET SAVINGS THIS MONTH", "TRANSACTION", "CATEGORY"). The mobile theme has `textTransform: 'none'`, so all eyebrow labels render in sentence case unless manually overridden.

### 7.4 Tabular Numerals

| Aspect | Design Spec | Mobile |
|--------|------------|--------|
| Requirement | `font-variant-numeric: tabular-nums` on ALL numerical displays | Only `amount` and `amountLg` have `fontVariant: ['tabular-nums']` |

Other typographic styles that display numbers (e.g., `titleSm`, `bodySemibold` used for budget amounts, percentages) do **not** have tabular numerals enabled, leading to potential **layout jitter** when values change dynamically.

---

## 8. Spacing & Layout Issues

### 8.1 Screen Canvas Margins

| Aspect | Design | Mobile |
|--------|--------|--------|
| Mobile screen margins | `16px` (`space-lg`) | Uses `paddingHorizontal` from `useScreenInsets()` — may not be exactly 16px |

### 8.2 Section Separation

| Aspect | Design | Mobile |
|--------|--------|--------|
| Between dashboard modules | `24px` (`space-xl`) | `section: 24` ✅ |
| Card internal padding | `16px–24px` | Varies by component |

### 8.3 Progress Bar Height Inconsistency

The design specifies `h-2` (8px) progress bars throughout. The mobile uses:
- Dashboard budget watchlist: `height={7}` — ❌ 1px short
- Budget cards: height from `ProgressBar` defaults — needs check
- Activity cash flow: Likely matches

---

## 9. Color & Elevation Discrepancies

### 9.1 Gradient Inconsistencies

| Component | Design Gradient | Mobile Gradient |
|-----------|----------------|-----------------|
| FAB button | `from-ocean-dark via-primary-container to-violet-primary` (3-stop) | `[ocean, primary, violet]` (3 colors) ✅ |
| Expense save button | `from-primary-container to-ocean-dark` | `[primaryContainer, ocean]` ✅ |
| Budget progress (healthy) | `from-secondary to-primary` | Single solid `secondary` color ❌ |
| Budget progress (warning) | `from-warning-dark to-rose-primary` | Single solid `danger` color ❌ |

> [!IMPORTANT]
> Budget progress bars use single solid colors in mobile but the design specifies **multi-color gradients**. This is a significant visual fidelity gap.

### 9.2 Ambient Glow Effects

The design heavily uses `blur-3xl` / `blur-2xl` ambient glow blobs (e.g., `absolute -right-12 -top-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl`). The mobile implementation has `ambientGlowRight` and `ambientGlowLeft` views in some components but:

- **No `blur` filter** is natively supported in React Native StyleSheet
- These likely render as **colored View rectangles/circles** without the soft gaussian blur effect
- Consider using `expo-blur` or `react-native-blur` for authenticity

### 9.3 Card Shadow Depth

| Level | Design Shadow | Mobile Shadow |
|-------|--------------|---------------|
| Level 1 (Badges) | `0 2px 4px rgba(0,0,0,0.25)` | `shadows.sm` ✅ |
| Level 2 (Cards) | `0 4px 12px rgba(0,0,0,0.35)` | `shadows.md` ✅ |
| Level 3 (Nav/Sheets) | `0 8px 24px rgba(0,0,0,0.45)` | `shadows.lg` ✅ |

---

## 10. Animation & Micro-Interaction Gaps

### 10.1 Missing Animations

| Animation | Design | Mobile |
|-----------|--------|--------|
| Pulsing status dot | `animate-ping` CSS animation | Static colored dot (no animation loop) |
| Streak fire emoji | `animate-bounce` | Unknown — needs verification |
| Date header "Today" | Highlighted with `text-primary font-bold` | Standard date grouping |
| Button press spring | `scale(0.97)` with `damping: 18, stiffness: 220` | Uses `pressed && { transform: [{ scale: 0.95 }] }` — different scale factor |
| Tab bar glow indicator | "spring-animated accent glow indicator" | Simple background color change |
| Transaction touch feedback | `scale(0.985)` on touchstart | Basic `Pressable` pressed state |
| Filter chip toggle | Ring-1 ring-primary toggle animation | Unknown implementation |

### 10.2 Spring Configuration

| Aspect | Design | Mobile |
|--------|--------|--------|
| Spring damping | `18` | `18` ✅ |
| Spring stiffness | `220` | `220` ✅ |
| Press scale | `0.97` | `0.95` / `0.94` / `0.98` — **inconsistent across components** |

> [!NOTE]
> The design specifies a consistent `scale(0.97)` press feedback. The mobile app uses varying scales: `0.95` for tab buttons, `0.94` for FAB, `0.98` for create budget button. This should be unified.

---

## 11. Cross-Cutting UX Issues

### 11.1 Notification Bell Missing Badge
The design shows a notification bell icon in the header across all screens but never shows a notification count badge. The mobile `AppHeaderBar` should be verified to include the bell icon consistently.

### 11.2 Profile Avatar Ring Gradient
The design shows the profile avatar wrapped in a `bg-gradient-to-tr from-ocean-dark to-violet-primary` ring (a 0.5px ring effect). This subtle detail may be missing in the mobile `AppHeaderBar`.

### 11.3 "Pull to Refresh" Wording
- **Design (Activity):** "Pull down to sync bank accounts"
- **Mobile (Activity):** "Pull down to sync transactions"
- **Design (Dashboard):** Standard pull-to-refresh (no hint text)

### 11.4 Missing "AI Coach" Tab Content
The design prominently features an "AI Coach" tab in the bottom navigation. While the mobile app has an `ai.tsx` tab file, it's hidden from navigation (`href: null`). The route exists but is only accessible via the budgets screen's "Ask AI Coach" link.

### 11.5 Accessibility Concerns
- Tab bar labels at `10px` (mobile) are below the recommended minimum touch target and font size
- Several pressable elements may not meet the `44×44pt` minimum touch target (especially filter chips)
- Material Symbols icons used in design may render differently than AppIcon custom icon system

### 11.6 Header Bar Consistency

| Screen | Design Header Style | Mobile Header Style |
|--------|-------------------|---------------------|
| Dashboard | App icon + "BudgetBrain" / "Dashboard" | `AppHeaderBar` ✅ |
| Activity | App icon + "BudgetBrain" / "Activity Feed" | `AppHeaderBar` ✅ |
| Budgets | App icon + "BudgetBrain" / "Budgets Overview" | `AppHeaderBar` ✅ |
| Log Expense | Back arrow + App icon + "Log Transaction" (no bell, no subtitle) | `AppHeaderBar` with `showBack` — **may still show notification bell** |

### 11.7 Data Staleness Indicators
The design shows various "live" indicators:
- "Live Updates" badge on Key Financials
- "Real-Time Sync" badge on Budget categories
- Pulsing green dot on greetings
- "Cycle Active" / "6 Days Left" countdown pills

These dynamic indicators need **actual real-time data** to feel authentic. Hardcoded/static values create a disconnected UX.

---

## 12. App Icon

### 12.1 Icon Implementation

| Aspect | Design | Mobile |
|--------|--------|--------|
| Background | `#0B101A` dark canvas with `rx=30` rounded rect | Needs verification in `app.json` |
| Border | `1px #1E293B` inner stroke | May be embedded in PNG asset |
| Brain graphic | Geometric brain path with gradient `#38BDF8 → #0EA5E9 → #6366F1` | Needs asset file comparison |
| Center pulse node | White circle (`r=5`) with cross-hair lines | Part of SVG design |
| Glow ring | Dashed circle (`stroke-dasharray: 8 4`) with emerald-to-ocean gradient | Needs asset comparison |

---

## Summary of Priority Fixes

### 🔴 Critical (P0)
1. **Tab bar has wrong tabs** — Missing AI Coach tab, Profile shouldn't be in tab bar
2. **`amountLg` font is Fraunces instead of Inter** — Wrong typeface family for hero amounts
3. **`surface` color mismatch** — `#1B202A` in mobile vs `#0e131d` in design
4. **Label eyebrow textTransform is `none`** — Should be `uppercase` per design system

### 🟠 High Priority (P1)
5. **Budget progress bars use solid colors** — Design specifies multi-color gradients
6. **Transaction list missing micro-details** — Payment badges, category pills, status text, income accent strips
7. **No "days left" countdown** — Dashboard hero and budgets gauge show generic text instead
8. **Tab bar missing backdrop blur** — Frosted glass effect not implemented
9. **Button press scale is inconsistent** — Should be unified to `0.97` per spec
10. **`sm` border radius is 8px instead of 4px** — Affects small UI elements

### 🟡 Medium Priority (P2)
11. **Pulsing status dot has no animation** — Static dot instead of ping animation
12. **Split decimal display not implemented** in budgets gauge
13. **Missing "Sort by spent" control** on budgets screen
14. **Missing rollover pill, ideal pace, recurring due soon** labels on budget cards
15. **Category chip dividers missing** in filter rail
16. **Receipt icon should be camera (`add_a_photo`)** not document icon
17. **"Scan Slip" quick action routes to add expense** instead of dedicated scanner

### 🟢 Low Priority (P3)
18. **Line height differences** (1-2px) across multiple type styles
19. **Ring visualizer 2px smaller** than design (54 vs 56)
20. **Progress bar 1px shorter** (7px vs 8px)
21. **"Pull down to sync" wording differs** between design and mobile
22. **`full` border radius is 999 vs 9999** — minor numeric difference
23. **Dashboard has extra sections** (Trends chart, Goals, Bills) not in new design
