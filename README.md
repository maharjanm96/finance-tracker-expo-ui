# Vectra — Personal Finance Tracker

A modern, local-first personal finance tracking application built with **React Native**, **Expo SDK 57**, and **React 19**. Featuring Apple-inspired glassmorphism (`expo-glass-effect`), smooth gesture navigation, multi-currency support, and offline-first persistence.

---

## 📑 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Design System & Aesthetics](#design-system--aesthetics)
- [Getting Started (Tutorial)](#getting-started-tutorial)
  - [Prerequisites](#prerequisites)
  - [Installation & Setup](#installation--setup)
  - [Running the App](#running-the-app)
- [How-To Guides](#how-to-guides)
  - [Adding a Transaction](#adding-a-transaction)
  - [Managing Multi-Accounts](#managing-multi-accounts)
  - [Switching Currencies](#switching-currencies)
  - [Toggling Dark & Light Modes](#toggling-dark--light-modes)
- [Architecture & State Management (Explanation)](#architecture--state-management-explanation)
  - [Data Flow](#data-flow)
  - [Storage & Persistence](#storage--persistence)
  - [Financial Calculations Engine](#financial-calculations-engine)
- [Reference](#reference)
  - [Project Directory Layout](#project-directory-layout)
  - [Available Scripts](#available-scripts)
  - [Domain Data Contracts](#domain-data-contracts)
  - [Tech Stack & Dependencies](#tech-stack--dependencies)

---

## Overview

**Finance Tracker** gives users full visibility over their cash flow, accounts, and savings targets without relying on cloud servers or sharing sensitive banking credentials. All records are computed locally in real-time and saved directly to the device via asynchronous local storage.

---

## Key Features

- **📊 Dynamic Dashboard (`HomeScreen`)**: Real-time net worth calculation, monthly income vs. expense breakdown, quick-action sheets, and recent activity feed.
- **📈 In-Depth Analytics (`AnalyticsScreen`)**: Category spending distributions with visual percentage meters, cash flow balance trends, and annual savings progress tracking.
- **🧾 Complete Transaction Ledger (`TransactionsScreen`)**: Filterable timeline of income, expenses, and inter-account transfers with search support.
- **🏦 Multi-Account Portfolio**: Track balances across `Savings`, `Spending`, `Emergency Fund`, `Cash`, and `Investment` accounts.
- **💱 Global Currency Support**: Native support for **NPR** (Nepalese Rupee — default), **USD** ($), **GBP** (£), and **CNY** (¥).
- **🌓 Adaptive Theme**: Seamless dark and light themes with system appearance detection.
- **📱 Fluid Swiping Experience**: Paged horizontal swipe between Home, Transactions, and Analytics, paired with bottom navigation.

---

## Design System & Aesthetics

The UI is built with a focus on fluid, tactile iOS design guidelines:

- **Liquid Glass & Frosted Blur**: Powered by `expo-glass-effect` and `expo-blur` with real-time backdrop blur and fallback support across Android and Web.
- **Custom Typography**: Integrated with [Plus Jakarta Sans](assets/fonts/) across Light, Regular, Medium, SemiBold, Bold, and ExtraBold weights.
- **Utility Styling**: Accelerated with [Uniwind](https://github.com/uniwind) and Tailwind CSS v4 for native design tokens.
- **Symbol Graphics**: Native SF Symbols on iOS with automated Material Symbol fallbacks on Android via `expo-symbols`.

---

## Getting Started (Tutorial)

Follow this guide to get a local development instance of the application up and running.

### Prerequisites

Ensure you have the following installed on your machine:

- **Node.js**: `v18.x` or later (LTS recommended)
- **Package Manager**: `npm` (comes with Node) or `yarn` / `pnpm` / `bun`
- **Expo Go App** (optional): Install on your physical iOS or Android device from the App Store / Google Play
- **Development Tooling** (optional for native simulators):
  - **macOS**: Xcode for iOS Simulator
  - **macOS / Windows / Linux**: Android Studio with an active Android Virtual Device (AVD)

### Installation & Setup

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd finance-tracker-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

### Running the App

Start the Expo bundler:

```bash
npm run start
```

From the interactive terminal prompt, press:

- `a` to open in an **Android Emulator** or connected Android device.
- `i` to open in an **iOS Simulator** (macOS required).
- `w` to open in a **Web Browser**.

Alternatively, run direct platform scripts:

```bash
# Run directly in web browser
npm run web

# Run on Android emulator/device
npm run android

# Run on iOS simulator
npm run ios
```

---

## How-To Guides

### Adding a Transaction

1. Tap the **`+` Action Button** in the floating navigation bar.
2. Select the transaction type: **Expense**, **Income**, or **Transfer**.
3. Enter the amount, choose an account (e.g., Spending or Savings), select a category (e.g., _Food_, _Housing_, _Salary_), and optionally add a note.
4. Press **Save Transaction**. The ledger and all dashboard cards will recalculate instantly.

### Managing Multi-Accounts

1. Open the Account Selector via the top header account chip.
2. Tap **Create New Account**.
3. Choose an account type (`Savings`, `Spending`, `Emergency`, `Cash`, or `Investment`), assign a name, set the opening balance, and pick a custom accent color.
4. The account is immediately available for transactions and transfers.

### Switching Currencies

1. Tap the profile avatar in the header to open user settings.
2. Select **Change Currency**.
3. Choose your preferred currency (**NPR**, **USD**, **GBP**, or **CNY**). The entire UI will reformat currency prefixes and localized number groupings automatically.

### Toggling Dark & Light Modes

1. Open the profile modal.
2. Toggle between **System**, **Light**, and **Dark** themes. Preferences persist across restarts.

---

## Architecture & State Management (Explanation)

The application follows an offline-first, reactive unidirectional state architecture:

```
┌────────────────────────────────────────────────────────┐
│                   React Native UI                      │
│      (AppTabs / Home / Analytics / Transactions)       │
└───────────────────────────▲────────────────────────────┘
                            │ Dispatches actions & reads state
┌───────────────────────────┴────────────────────────────┐
│                    ExpenseContext                      │
│      - Transactions State    - Accounts State          │
│      - Active Currency       - User Profile            │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
               ▼                          ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│     Finance Calculations     │ │        StorageService        │
│  - calculateAccountBalance   │ │  - AsyncStorage keys:        │
│  - calculateCombinedBalance  │ │    @expense_app/transactions │
│  - calculateSavingsRate      │ │    @expense_app/accounts     │
│  - calculateGoalProgress     │ │    @expense_app/user_profile │
└──────────────────────────────┘ └──────────────────────────────┘
```

### Data Flow

1. **Context as Single Source of Truth**: `ExpenseProvider` (`src/context/expense-context.tsx`) provides state and mutating dispatchers (`addTransaction`, `deleteTransaction`, `createAccount`, `updateProfile`).
2. **Deterministic Calculations**: Financial metrics are separated into pure functions in `src/domain/finance-calculations.ts` to ensure consistency between screens without duplicated math.

### Storage & Persistence

- Built on top of `@react-native-async-storage/async-storage`.
- Keys are namespaced under `@expense_app/*`.
- On cold launch, `StorageService` (`src/services/storage-service.ts`) hydrates accounts, profile preferences, and transaction history. If no data exists, initial seed defaults are loaded.

### Financial Calculations Engine

- **Account Balances**: Calculated as `openingBalance + totalIncome + totalTransfersIn - totalExpenses - totalTransfersOut`.
- **Savings Rate**: Evaluated as `(netSavings / totalIncome) * 100` when total income > 0.
- **Goal Progress**: Compares net savings to `annualSavingsGoal` configured in the user profile.

---

## Reference

### Project Directory Layout

```
finance-tracker-app/
├── assets/                    # Static assets, fonts, icons, flags
│   ├── fonts/                 # Plus Jakarta Sans font family
│   └── images/                # App icons, splash screens, currency flags
├── src/
│   ├── app/                   # Expo Router screens
│   │   ├── _layout.tsx        # App entry point, font loading, providers
│   │   ├── index.tsx          # Home screen dashboard
│   │   ├── transactions.tsx   # Transaction history & search screen
│   │   ├── analytics.tsx      # Analytics & category statistics
│   │   └── profile.tsx        # User profile & preferences
│   ├── components/            # Reusable UI components
│   │   ├── home/              # Home-specific widgets (balance cards, charts)
│   │   ├── navigation/        # Floating tabs, top chips, modal sheets
│   │   ├── ui/                # Base UI elements (buttons, inputs)
│   │   ├── native-glass.tsx   # Cross-platform glassmorphism wrapper
│   │   └── app-tabs.tsx       # Horizontal pager & modal orchestration
│   ├── constants/             # Currency registries and palette constants
│   ├── context/               # Global state providers
│   │   ├── expense-context.tsx# Main transaction, account, and budget state
│   │   └── theme-context.tsx  # Theme mode (system/light/dark) provider
│   ├── domain/                # Pure business logic and domain types
│   │   ├── finance-calculations.ts # Mathematical computation engine
│   │   ├── formatters.ts      # Number, date, and currency formatting
│   │   └── types.ts           # TypeScript interfaces and contracts
│   ├── services/              # Infrastructure and persistence services
│   │   └── storage-service.ts # AsyncStorage persistence client
│   └── global.css             # Tailwind CSS / Uniwind global styling
├── app.json                   # Expo application manifest configuration
├── package.json               # Project dependencies and script declarations
├── tsconfig.json              # TypeScript compiler configuration
└── metro.config.js            # Metro bundler config with Uniwind CSS
```

### Available Scripts

| Command                 | Description                                                  |
| :---------------------- | :----------------------------------------------------------- |
| `npm run start`         | Launches the Expo Metro bundler server.                      |
| `npm run ios`           | Starts Metro and targets an iOS Simulator.                   |
| `npm run android`       | Starts Metro and targets an Android Emulator/device.         |
| `npm run web`           | Bundles and runs the application in the default web browser. |
| `npm run lint`          | Runs ESLint over project files to enforce code standards.    |
| `npm run reset-project` | Resets the starter project structure (Expo utility script).  |

### Domain Data Contracts

Key domain entities defined in `src/domain/types.ts`:

#### `Account`

```typescript
export type AccountType =
  | "savings"
  | "spending"
  | "emergency"
  | "cash"
  | "investment";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  openingBalance: number;
  currency?: string;
  description?: string;
  institution?: string;
  color?: string;
  isArchived?: boolean;
}
```

#### `Transaction`

```typescript
export type TransactionType = "expense" | "income" | "transfer";

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: ExpenseCategory;
  date: string;
  timestamp: number;
  time?: string;
  sourceAccountId: string;
  destinationAccountId?: string;
  note?: string;
}
```

#### `UserProfile`

type: TransactionType;
category: ExpenseCategory;
date: string;
timestamp: number;
time?: string;
sourceAccountId: string;
destinationAccountId?: string;
note?: string;
}

````

#### `UserProfile`

```typescript
export interface UserProfile {
  name: string;
  monthlyIncome: number;
  annualSavingsGoal: number;
  currency: string;
  isConfigured: boolean;
}
````

### Tech Stack & Dependencies

- **Framework**: [Expo SDK 57](https://expo.dev) (`~57.0.30`)
- **Runtime**: [React Native 0.86.3](https://reactnative.dev)
- **UI Core**: [React 19.2.3](https://react.dev)
- **Routing**: [Expo Router 57](https://docs.expo.dev/router/introduction/)
- **Styling**: [Uniwind](https://github.com/uniwind) (`^1.12.2`) & [Tailwind CSS v4](https://tailwindcss.com) (`^4.3.3`)
- **Animations**: [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) (`4.5.1`)
- **Native Visuals**: `expo-glass-effect`, `expo-blur`, `expo-symbols`, `expo-linear-gradient`
- **Persistence**: `@react-native-async-storage/async-storage` (`2.2.0`)
- **Language**: TypeScript 6 (`~6.0.3`)

---

## License

This project is licensed under the [MIT License](LICENSE).
