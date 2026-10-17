# Expense Tracker — UI-First Build Instructions

> **Purpose:** Build a polished, natural-feeling iOS expense-tracker UI in the existing Expo project.
>
> **Phase:** UI only. Use realistic mock data and local in-memory state. Do not build a backend, authentication service, database, bank integration, or production financial calculations yet.
>
> **Currency:** Nepalese rupees (NPR / Rs.).
>
> **Primary UI target:** iOS, using the project's existing Expo UI / SwiftUI setup.

---

## 1. Main Agent Prompt

Read this file completely before making changes. Work inside the existing project; do not scaffold a new app or replace the project's current architecture.

### First: inspect before coding

1. Inspect the project structure, `package.json`, lockfile, Expo SDK version, React Native version, Expo Router/navigation setup, installed dependencies, existing theme/color tokens, current screens, and any shared components.
2. Find and read the locally installed skills relevant to this task. In particular, inspect the installed **Expo UI SwiftUI** skill and any Expo UI, Expo Router/navigation, and UI/design skill available in the project. Follow the installed skill's instructions and use the APIs supported by the installed SDK and package versions.
3. If the skill includes a component-listing script, run it against this project before choosing components. Check the installed `@expo/ui` TypeScript declarations and the documentation for any component or modifier whose API is uncertain.
4. Inspect the current design and reuse the existing colors, typography, spacing tokens, navigation conventions, and components. **Do not replace or invent a new palette.** If a required token is missing, add the smallest consistent extension.
5. Inspect the installed Hugeicons packages and their actual exports. Use only icons available in the installed free packages. Do not guess import names, install a paid icon pack, or substitute emoji.
6. Report any important compatibility conflict before making a risky architectural change. Then implement the UI in small, coherent steps.

### Goal

Create a premium, calm, well-crafted personal finance app. It should look like a real product designed by a thoughtful product designer—not a generic AI-generated dashboard, a template full of cards, or a Dribbble concept that is difficult to use.

The interface should be clear, information-dense where useful, and restrained. Use a consistent visual hierarchy, meaningful spacing, realistic content, and deliberate alignment. Every screen should feel like part of the same app.

### Non-negotiable constraints

- Preserve the existing project and its established colors.
- No gradients anywhere: no gradient backgrounds, gradient cards, gradient chart fills, or gradient buttons.
- Use free Hugeicons icons already available in the project.
- Use NPR throughout: display amounts consistently, for example `Rs. 45,000` or `NPR 45,000`. Choose one display convention and use it consistently; do not mix currencies.
- Design for iPhone screen sizes, safe areas, the home indicator, and the keyboard.
- Provide at least four working bottom tabs: **Home, Transactions, Analytics, Profile**.
- Accounts are first-class objects. Transactions must belong to a selected source account; transfers must have both source and destination accounts.
- Account selection must change the balances, expenses, income, recent transactions, and account-specific analytics shown on relevant screens.
- Use realistic mock data and local state for this phase. Make controls demonstrably interactive, but do not pretend that data is persisted or synced.
- Build the UI first. Do not introduce a backend, API, sign-in flow, cloud sync, or a database unless explicitly requested later.
- Do not add dependencies until checking whether the project already has a suitable installed library.
- Keep components modular, typed, and easy to extend. Avoid giant screen components and unnecessary abstraction.
- Do not alter unrelated screens or dependencies.

---

## 2. Product Definition

A personal expense tracker for a user who enters their name, monthly income, and savings target, then manages multiple savings/spending accounts, records transactions, and tracks progress toward a yearly savings goal.

The app should make these questions easy to answer:

1. How much money do I currently have across my accounts?
2. How much did I earn and spend this month?
3. How much did I save this month and this year?
4. Which account paid for a particular expense?
5. Where is my money going?
6. Am I on track to reach my annual savings target?
7. What were my latest transactions?
8. How are my accounts performing individually?

### Important financial distinctions

- **Account balance** is the current money available in that account.
- **Income** is money received from an external source.
- **Expense** is money spent externally.
- **Transfer** moves money between accounts. It must not count as income or expense in the combined totals.
- **Savings** is a calculated amount/measure, not a second copy of account balances. For the initial UI, show monthly net savings as income minus expenses and show account balances separately.
- **Savings target** is a goal, not an account balance. Show target progress and remaining amount separately.
- Avoid counting transfers as spending or income in combined analytics.

For this UI-only phase, use clearly documented mock data and simple deterministic calculations. Do not claim the app has production-grade accounting.

---

## 3. Design Direction

### Desired visual feel

- Native-feeling iOS quality, clean typography, confident spacing, subtle borders, and restrained use of the existing accent color.
- Editorial hierarchy: a clear page title, one primary financial figure, secondary supporting metrics, and focused sections.
- Mostly flat surfaces. Use cards only when they improve grouping or interaction.
- Use consistent corner radii and spacing rather than applying rounded rectangles to every element.
- Make empty space intentional; do not cram every possible metric onto the first screen.
- Use natural, concise labels and realistic dates, merchants, and amounts.
- Use small, restrained micro-interactions only when supported by the existing setup.
- Use a single coherent light/dark strategy if the existing project already supports it. Do not introduce a separate theme system without a reason.
- Use tabular numerals for financial figures where supported so amounts align cleanly.
- Use native system typography or the existing project's font system. Do not add decorative fonts just to make the design feel premium.

### Avoid the typical AI-generated look

Do not use:
- A rainbow of unrelated accent colors.
- Excessive pill-shaped labels, floating badges, or rounded cards inside other rounded cards.
- Huge decorative icons beside every heading.
- Generic welcome headings followed by several redundant summary cards.
- Fake charts, meaningless percentages, random trend arrows, or fabricated claims.
- Gradients, glassmorphism, excessive blur, neon glow, or ornamental background shapes.
- The same card layout repeated for every section.
- Emoji as icons.
- Overly verbose explanatory copy in the UI.
- Decorative elements that compete with balances or transaction information.

### Layout and accessibility

- Respect iOS safe areas and dynamic island/notch regions.
- Ensure scrollable content does not disappear behind the tab bar or home indicator.
- Maintain readable contrast and touch targets (aim for at least 44 × 44 pt for primary interactive controls).
- Support Dynamic Type / text scaling as far as the existing component stack permits.
- Give icon-only controls meaningful accessibility labels.
- Prevent long account names and merchant names from breaking layouts.
- Format amounts and dates consistently.
- Provide clear pressed, selected, disabled, and empty states.

---

## 4. Navigation and Screen Map

Use the existing navigation library and conventions. Keep a persistent bottom tab bar with four primary destinations:

1. **Home** — account overview, account stack, monthly snapshot, recent transactions.
2. **Transactions** — searchable and filterable transaction history, with an add-transaction action.
3. **Analytics** — spending breakdowns, monthly trends, savings performance, annual goal progress.
4. **Profile** — name, monthly income, annual savings goal, preferences, and account management entry points.

Do not create a fifth bottom tab for accounts. Account selection and account management should be reachable from Home and Profile.

Use native navigation patterns already supported by the project for detail screens, forms, sheets, and confirmation dialogs. Avoid inventing a second navigation system.

### Navigation acceptance

- Every tab is reachable and shows the correct selected state.
- Switching tabs does not unexpectedly reset the entire UI.
- Opening a transaction, account detail, or edit form has an obvious route back.
- The tab bar remains usable and does not cover scroll content.
- Use platform-native controls when supported by the installed Expo UI version and appropriate for the component.

---

## 5. Home Screen — Highest Priority

Build the Home screen first and make it the most polished screen.

### Header

- Greeting based on the user's saved mock profile name, e.g. “Good morning, Manish” only if that is the mock profile value.
- A short, quiet supporting label such as “Your money at a glance”.
- A profile/avatar control only if it fits the existing design; it should open Profile.
- Avoid wasting the top third of the screen on a giant greeting.

### Overall summary

Show a prominent combined balance for all active accounts. Make it clear that this is the **total across accounts**, not a monthly income or savings goal.

Show a compact current-month summary with:
- Income received.
- Expenses paid.
- Net savings (income minus expenses).

Use a restrained two- or three-column layout only if the values remain readable on a small iPhone. Prefer clear hierarchy over forcing every metric into one row.

### Vertically stacked savings/account cards

This is a defining feature of the app.

- Show multiple account cards in a vertically stacked list on Home.
- Cards should feel like thoughtfully designed financial account summaries, not credit-card mockups with random decorative artwork.
- Use the established color palette. Flat fills only; no gradients.
- Cards may have a subtle border, restrained shadow if the existing design uses shadows, and a clear account title.
- Example names: `Savings Account 1`, `Savings Account 2`, `Daily Spending`, `Emergency Fund`. Use realistic mock balances.
- Each card should show:
  - Account name.
  - Current balance.
  - A concise account-specific spending figure for the selected period.
  - Optionally a small income or transaction count if it adds real value.
- Do not imply that every account is necessarily a bank account; allow account type labels such as savings, cash, or spending account where appropriate.
- Show a clear selected state when a card is selected. Selection must not rely on color alone.
- Tapping a card selects that account and updates account-specific figures, recent transactions, and contextual analytics on Home.
- Include a “View all” or “Manage accounts” entry point and an add-account action.
- If there are many accounts, keep the screen scrollable and the account list performant.

### Selected account context

When an account is selected:
- Clearly identify the selected account and show its balance.
- Show that account's expenses and income for the current month.
- Filter the Home recent transaction list to that account.
- Provide an obvious way to switch back to “All accounts”.
- Do not change the combined totals to account-only totals without labeling the scope.

### Recent transactions

Show a small, useful list of recent transactions:
- Merchant/title.
- Category or transaction type.
- Date.
- Amount with an appropriate sign.
- Account name when viewing all accounts; it can be omitted only when the selected account is already unambiguous.
- A category icon from the available free Hugeicons set, used consistently and sparingly.

Provide “See all” to open Transactions. Tapping a row should open a transaction detail view or sheet.

### Primary actions

Provide clear, accessible actions for:
- Add expense.
- Add income.
- Transfer between accounts.

Use an action sheet, native sheet, or a dedicated form screen based on the existing project patterns. Avoid placing too many equally prominent buttons in the header.

---

## 6. Transactions Screen

Build a useful transaction ledger, not just a static list.

### Header and controls

- Clear title: “Transactions”.
- Search by merchant/title.
- Period selector or date filter.
- Transaction type filter: All, Expense, Income, Transfer.
- Account filter: All accounts or a particular account.
- Category filter if it fits without clutter.
- Keep filter state visible and provide a way to reset filters.

### List

- Group transactions by date, e.g. Today, Yesterday, or formatted dates.
- Each row should show a recognizable title, category, account, and amount.
- Expenses, income, and transfers must be visually distinguishable without depending only on color.
- For transfers, display the source and destination accounts and do not treat the transfer as an expense in aggregate totals.
- Include useful loading-free empty states for no transactions and no search results.
- Tapping a row opens a detail screen/sheet with all fields and edit/delete actions.
- Use a confirmation step for destructive delete actions.

### Add/edit transaction form

Fields:
- Transaction type: Expense, Income, or Transfer.
- Amount in NPR.
- Title / merchant / source.
- Category, when relevant.
- Date.
- Source account.
- Destination account for transfers.
- Optional note.
- Optional recurring flag only if the UI can explain its meaning; recurrence automation is out of scope.

Rules:
- Validate that the amount is positive.
- Require a source account for an expense or transfer.
- Require a destination account for a transfer.
- Prevent source and destination accounts from being the same.
- For income, use a source/description and the account receiving the money; do not accidentally reverse the account direction.
- Keep form labels visible. Do not rely solely on placeholders.
- Update the mock state and derived UI when a form is saved.
- Use native keyboard and date controls where the installed stack supports them.
- Keep this form straightforward; do not make users complete unnecessary fields.

---

## 7. Analytics Screen

Analytics must be understandable and based on the mock transaction data. Avoid decorative graphs that do not communicate anything.

### Time controls

- Month selector with a clear current period.
- Useful period options such as month, 6 months, and year where supported by the data.
- Account scope: All accounts or a selected account.
- Make the scope and period visible next to the metrics.

### Summary metrics

Show:
- Total income.
- Total expenses.
- Net savings.
- Savings rate, calculated as net savings divided by income when income is greater than zero. If income is zero, show an unavailable state instead of dividing by zero.
- Annual savings target, amount saved toward the target, remaining amount, and progress.
- Clearly explain the definition used for annual progress. For the initial UI, use cumulative net savings during the current year; if negative, display it honestly and clamp only the visual progress bar to its valid range.

### Charts

Include:
1. **Monthly income vs. expenses bar chart** — compare both series with a readable legend and axis labels.
2. **Spending by category** — a horizontal bar chart or a restrained donut chart with a clear legend and values.
3. **Savings goal progress** — a simple progress indicator with target, current progress, and amount remaining.

Requirements:
- Use an existing chart library if one is already installed and suitable.
- If there is no chart library, inspect compatibility before adding one. Keep the chart implementation small and maintainable.
- Charts must be accessible and readable on narrow screens.
- Use solid colors from the existing theme; no gradients.
- Use labels and a legend rather than relying only on color.
- Include sensible empty states when no transactions exist for the chosen period.
- Never invent growth percentages or compare against nonexistent historical data.
- Keep chart data derived from the mock transactions rather than hardcoded separately from the ledger.

### Annual savings goal

Let the user set a target such as `Rs. 500,000` for the year.
Show:
- Annual target.
- Current year-to-date net savings.
- Amount remaining to target.
- Progress percentage, with a sensible display when the target is zero.
- A simple monthly trend or monthly contribution breakdown.

Do not confuse the annual target with total account balances. The target is a goal; account balances represent current funds.

---

## 8. Profile and Initial Setup

The user must be able to configure their name, monthly income, and annual savings goal.

### Initial setup UI

Create a simple, polished first-run setup screen or onboarding form with:
- Name.
- Monthly income in NPR.
- Annual savings goal in NPR.
- Optional first account name and opening balance if it fits naturally.
- A clear “Continue” / “Get started” action.

Do not build sign-in or authentication. This is local UI setup only.

### Profile screen

Include:
- Name and a simple avatar treatment.
- Monthly income.
- Annual savings goal.
- Currency preference shown as NPR; currency switching is out of scope for this first version.
- Account management entry point.
- Category management entry point if implemented.
- Preferences and app information.
- Edit profile action.

Requirements:
- Inputs must be editable.
- Validate that amounts are not negative.
- Empty or missing values should be handled intentionally.
- Changes should update Home and Analytics.
- If the existing app already has persistence, use its established approach only if it is already part of the project and appropriate. Otherwise, keep this phase in local state and explicitly label persistence as a future task.

---

## 9. Account Management and Account Details

Accounts are not just decorative cards. Build the UI and state behavior to support them.

### Account model (UI-level)

Each account should have:
- Stable ID.
- Name.
- Type (e.g. savings, spending, cash, other).
- Opening balance.
- Active/archived status.
- Optional short description.

The current balance should be derived from opening balance and the account's transactions:
- Add income credited to the account.
- Subtract expenses paid from the account.
- Subtract transfers sent from the source account.
- Add transfers received into the destination account.

Do not store a separately edited current balance if it can be derived; avoid double-counting.

### Account management UI

Allow the user to:
- View all accounts.
- Add an account.
- Edit an account name/type.
- Open account details.
- Archive an account rather than immediately deleting an account that has transactions.
- View account balance, monthly expenses, monthly income, and recent transactions.

For the UI phase, use mock state. If deleting/archiving an account with existing transactions, explain the consequence and ask for confirmation. Do not silently discard transaction history.

---

## 10. Mock Data and Calculation Rules

Create one centralized, typed mock-data module. Do not scatter inconsistent hardcoded figures across screens.

Suggested sample data:
- Profile: a neutral sample name, monthly income, and annual savings target.
- Accounts:
  - Savings Account 1.
  - Savings Account 2.
  - Daily Spending.
  - Emergency Fund.
- Transactions across several dates and months with varied but realistic Nepal-relevant examples:
  - Salary.
  - Groceries.
  - Rent.
  - Transport.
  - Food / café.
  - Utilities.
  - Internet/mobile.
  - Shopping.
  - Health.
  - Transfer between two accounts.

Use NPR-scale values that look realistic, but mark all of this as sample data. Avoid claiming these are the user's real financial records.

### Calculation rules

- Use one source of truth for transactions and accounts.
- Account balance = opening balance + income received − expenses paid − outgoing transfers + incoming transfers.
- Combined balance = sum of active account balances.
- Monthly income = external income transactions in the selected month.
- Monthly expenses = external expense transactions in the selected month.
- Monthly net savings = monthly income − monthly expenses.
- Transfer transactions are excluded from external income and expense totals.
- Category breakdown includes expenses only.
- Annual net savings = year-to-date external income − year-to-date external expenses.
- Savings rate = net savings / income × 100 when income > 0; otherwise show unavailable.
- Annual goal progress should handle zero targets and negative savings safely.
- Account-specific metrics must filter by the relevant source/destination account according to the metric's meaning.
- Avoid floating-point rounding problems in money calculations where practical. Use integer NPR amounts for this prototype.
- Use a shared formatter for currency, dates, and percentages.

Write a few small tests for calculation helpers if the project's test setup already exists. Do not add a testing framework just for this phase without checking project constraints.

---

## 11. Hugeicons Requirements

- Use the free Hugeicons package(s) already installed in the project.
- Check actual exports and installed package version before importing icons.
- Use icons consistently for bottom navigation, account type, transaction category, add, search, filters, and settings where helpful.
- Prefer clear outline or consistent-weight icons from the same style family.
- Do not use huge icons as decoration. Icon size should reflect importance and available space.
- Pair unfamiliar icons with text labels.
- Ensure tab icons have accessible labels and selected-state feedback.
- Do not use paid-only icons or assume a named icon exists without verifying it.
- Do not replace the requested Hugeicons with SF Symbols unless the installed free Hugeicons setup cannot support the required use and the reason is explained first.

---

## 12. Expo UI / SwiftUI Implementation Rules

1. Read the locally installed skills before implementation and follow their version-specific instructions.
2. Verify the Expo SDK version before applying SDK-specific examples from the internet.
3. Use `@expo/ui/swift-ui` only in iOS-specific components. Its native component tree is iOS-only; do not import it unguarded into code that runs on Android.
4. Every SwiftUI tree must be wrapped in the correct `Host` component according to the installed version's documentation. Verify the correct import path against installed package declarations; do not blindly copy an example for another SDK version.
5. Keep Expo Router route filenames compatible with its conventions. If platform-specific UI files are needed, keep `.ios.tsx` / `.android.tsx` implementation components outside the route directory and import them from a regular route file, following the installed skill.
6. Use universal Expo UI components where they cover the requirement and the installed SDK supports them. Use the platform-specific SwiftUI layer when genuinely necessary.
7. Check component and modifier signatures in the installed package types. Do not invent props or copy outdated APIs.
8. Avoid mixing native SwiftUI controls and React Native controls arbitrarily. Define a clear component boundary and use `RNHostView` only where required by the installed API.
9. Use the existing router, state-management approach, and style system. Do not introduce a new navigation or state library without need.
10. Do not assume Expo Go or the current runtime supports every native component in the installed SDK. Check the project's actual runtime/build setup and report any native rebuild requirement.
11. Do not use gradients, including any native gradient component or modifier.
12. Keep the UI responsive and test at a small iPhone viewport, including keyboard-visible forms and scroll behavior.

---

## 13. Suggested Component Organization

Adapt this to the project's existing structure instead of moving files unnecessarily.

```text
src/
  app/
    (tabs)/
      index.tsx                 # Home
      transactions.tsx
      analytics.tsx
      profile.tsx
    transactions/
      [id].tsx                  # optional transaction detail route
    accounts/
      index.tsx                 # account management
      [id].tsx                  # account details
  components/
    home/
      account-card.tsx
      account-stack.tsx
      monthly-summary.tsx
      recent-transactions.tsx
    transactions/
      transaction-row.tsx
      transaction-filters.tsx
      transaction-form.tsx
    analytics/
      metric-summary.tsx
      income-expense-chart.tsx
      category-breakdown.tsx
      savings-goal-card.tsx
    accounts/
      account-form.tsx
      account-list-item.tsx
    ui/
      screen-container.tsx
      section-heading.tsx
      amount-text.tsx
      empty-state.tsx
  data/
    mock-profile.ts
    mock-accounts.ts
    mock-transactions.ts
  domain/
    types.ts
    finance-calculations.ts
    formatters.ts
  theme/
    colors.ts                   # reuse existing tokens if already present
    spacing.ts                  # reuse existing tokens if already present
```

This is a suggested organization, not a mandate. Follow the existing project structure if it is already clean.

---

## 14. UI-Only State and Interaction Requirements

All core controls should work against local mock state:
- Select an account card.
- Switch between all accounts and a single account.
- Navigate between four tabs.
- Search and filter transactions.
- Open transaction details.
- Add, edit, and delete a mock transaction.
- Add/edit/archive an account.
- Edit profile name, monthly income, and annual target.
- Change the analytics period and account scope.
- See totals, charts, and progress update when relevant data changes.

Use the existing state-management approach where available. If none exists, keep state local and lift it only as far as needed to share it across screens. Avoid adding a global state library for a small prototype.

Make it obvious when there is no data. Do not leave dead buttons that look functional. If a feature is intentionally out of scope, do not display a fake active control for it.

---

## 15. Implementation Sequence

Work in this order and check the app after each phase:

### Phase A — Inspect and plan
- Inspect project, installed skills, SDK, dependencies, theme, navigation, and icon package.
- Produce a short plan based on the actual project.
- Identify compatibility issues before coding.

### Phase B — Design foundation
- Reuse existing colors.
- Define only missing shared typography/spacing/shape tokens.
- Establish shared screen container, section heading, amount formatter, and transaction row.
- Confirm there are no gradients.

### Phase C — Home screen
- Build the header and combined balance.
- Build stacked account cards and selection state.
- Add monthly summary and recent transactions.
- Make the account scope/filter behavior work.

### Phase D — Navigation and Transactions
- Complete four tabs.
- Build transaction list, search, filters, detail, and form.
- Wire actions to local state and verify derived values.

### Phase E — Analytics
- Add monthly summary metrics, income/expense bars, category breakdown, and annual savings goal.
- Derive all metrics from the same mock data.
- Verify period and account filters.

### Phase F — Profile and accounts
- Add initial setup, profile editing, and account management.
- Verify that edited values update all dependent screens.

### Phase G — Quality pass
- Run the available type checker, lint, and tests.
- Run the project's supported iOS workflow.
- Inspect for layout overflow, clipped amounts, broken icons, keyboard overlap, inaccessible touch targets, and dead actions.
- Check small iPhone sizes and a longer account/transaction list.
- Fix issues instead of merely reporting them.

Do not implement all phases as one giant code dump. Keep changes reviewable and test each screen as it is added.

---

## 16. Acceptance Checklist

The UI is ready for review only when these are true:

- [ ] Existing project architecture and theme are preserved.
- [ ] Installed skills and package APIs were inspected before implementation.
- [ ] No gradients exist.
- [ ] Free Hugeicons from the installed package are used correctly.
- [ ] Four working bottom tabs exist: Home, Transactions, Analytics, Profile.
- [ ] Home displays a combined balance and vertically stacked account cards.
- [ ] Selecting an account updates clearly labeled account-specific data.
- [ ] “All accounts” can be selected again.
- [ ] Income, expenses, transfers, and balances use correct, consistent definitions.
- [ ] Transfers do not inflate combined income or expenses.
- [ ] Transactions can be searched, filtered, viewed, and edited in mock state.
- [ ] Add transaction validates amount and account selection.
- [ ] Analytics charts use the same underlying mock transactions as the ledger.
- [ ] Annual savings target is separate from account balances.
- [ ] Profile name, monthly income, and annual goal can be edited.
- [ ] The interface uses realistic content and a consistent visual hierarchy.
- [ ] Empty states, selected states, errors, and destructive confirmations exist where needed.
- [ ] No visible control is unintentionally nonfunctional.
- [ ] No backend or persistence is claimed to exist when it does not.
- [ ] Type checking/linting and the available iOS workflow have been run, with failures fixed or clearly documented.

---

## 17. Final Agent Response

When finished, report:
1. Screens and interactions implemented.
2. Files created or changed.
3. Which installed skills and package APIs were consulted.
4. Any dependencies added and why.
5. Checks run and their results.
6. Known limitations or unfinished items.

Do not claim the app was run on an iPhone unless it was actually launched and verified on a device. Distinguish simulator/build verification from physical-device verification.
