import type { SymbolViewProps } from "expo-symbols";
import React, { createContext, useContext, useState } from "react";

import {
  INITIAL_ACCOUNTS,
  INITIAL_PROFILE,
  INITIAL_TRANSACTIONS,
} from "@/data/mock-data";
import {
  calculateAccountBalance,
  calculateCombinedBalance,
  calculateExpenses,
  calculateGoalProgress,
  calculateIncome,
  calculateNetSavings,
  calculateSavingsRate,
} from "@/domain/finance-calculations";
import {
  Account,
  ExpenseCategory,
  Transaction,
  UserProfile,
} from "@/domain/types";

export type CategorySymbol = Extract<SymbolViewProps["name"], { ios?: any }>;

export interface CategoryMeta {
  sf: NonNullable<CategorySymbol["ios"]>;
  material: NonNullable<CategorySymbol["android"]>;
  color: string;
}

export const CATEGORY_ICONS: Record<ExpenseCategory, CategoryMeta> = {
  Food: { sf: "fork.knife", material: "restaurant", color: "#8E8E93" },
  Housing: { sf: "house.fill", material: "home", color: "#8E8E93" },
  Transportation: {
    sf: "car.fill",
    material: "directions_car",
    color: "#8E8E93",
  },
  Shopping: { sf: "bag.fill", material: "shopping_bag", color: "#8E8E93" },
  Entertainment: { sf: "play.tv.fill", material: "movie", color: "#8E8E93" },
  Bills: { sf: "doc.text.fill", material: "receipt", color: "#8E8E93" },
  Salary: {
    sf: "banknote.fill",
    material: "account_balance_wallet",
    color: "#8E8E93",
  },
  Health: { sf: "heart.fill", material: "favorite", color: "#8E8E93" },
  Transfer: {
    sf: "arrow.left.arrow.right",
    material: "swap_horiz",
    color: "#8E8E93",
  },
  Other: { sf: "tag.fill", material: "label", color: "#8E8E93" },
};

interface ExpenseContextType {
  profile: UserProfile;
  accounts: Account[];
  transactions: Transaction[];
  selectedAccountId: string | null;
  selectedAccount: Account | null;

  // Derived financial metrics
  combinedBalance: number;
  scopedBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  savingsRate: number | null;
  annualSavings: number;
  annualGoalProgress: {
    percentage: number;
    remaining: number;
    isAchieved: boolean;
  };

  // Filtered transaction collections
  scopedTransactions: Transaction[];
  recentTransactions: Transaction[];

  // Mutators
  selectAccount: (id: string | null) => void;
  setProfile: (profile: Partial<UserProfile>) => void;
  addTransaction: (
    tx: Omit<Transaction, "id" | "timestamp"> & { timestamp?: number },
  ) => void;
  editTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addAccount: (account: Omit<Account, "id">) => void;
  editAccount: (id: string, account: Partial<Account>) => void;
  archiveAccount: (id: string) => void;
  deleteAccount: (id: string) => void;
  getAccountById: (id: string) => Account | undefined;
  getAccountBalance: (id: string) => number;
  resetAllData: () => void;

  // Legacy compat aliases
  totalSpent: number;
  remainingBalance: number;
  percentSpent: number;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile>(INITIAL_PROFILE);
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [transactions, setTransactions] =
    useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null,
  );

  const selectedAccount =
    accounts.find((acc) => acc.id === selectedAccountId) ?? null;

  // 1. Balances
  const combinedBalance = calculateCombinedBalance(accounts, transactions);
  const scopedBalance = selectedAccount
    ? calculateAccountBalance(selectedAccount, transactions)
    : combinedBalance;

  // 2. Income, Expenses & Net Savings (scoped to selected account or all accounts)
  const monthlyIncome = calculateIncome(transactions, selectedAccountId);
  const monthlyExpenses = calculateExpenses(transactions, selectedAccountId);
  const monthlySavings = calculateNetSavings(monthlyIncome, monthlyExpenses);
  const savingsRate = calculateSavingsRate(monthlyIncome, monthlySavings);

  // 3. Annual goal progress
  const annualSavings = calculateNetSavings(
    calculateIncome(transactions, null),
    calculateExpenses(transactions, null),
  );
  const annualGoalProgress = calculateGoalProgress(
    annualSavings,
    profile.annualSavingsGoal,
  );

  // 4. Scoped transactions list
  const scopedTransactions = transactions.filter((tx) => {
    if (!selectedAccountId) return true;
    return (
      tx.sourceAccountId === selectedAccountId ||
      tx.destinationAccountId === selectedAccountId
    );
  });

  const recentTransactions = scopedTransactions.slice(0, 5);

  // Actions
  const selectAccount = (id: string | null) => {
    setSelectedAccountId(id);
  };

  const setProfile = (newProfile: Partial<UserProfile>) => {
    setProfileState((prev) => ({ ...prev, ...newProfile }));
  };

  const addTransaction = (
    tx: Omit<Transaction, "id" | "timestamp"> & { timestamp?: number },
  ) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      timestamp: tx.timestamp ?? Date.now(),
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const editTransaction = (id: string, updated: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updated } : t)),
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  const addAccount = (accountData: Omit<Account, "id">) => {
    const newAccount: Account = {
      ...accountData,
      id: `acc-${Date.now()}`,
    };
    setAccounts((prev) => [...prev, newAccount]);
  };

  const editAccount = (id: string, updated: Partial<Account>) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, ...updated } : acc)),
    );
  };

  const archiveAccount = (id: string) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, isArchived: true } : acc)),
    );
    if (selectedAccountId === id) {
      setSelectedAccountId(null);
    }
  };

  const deleteAccount = (id: string) => {
    if (selectedAccountId === id) {
      setSelectedAccountId(null);
    }
    setAccounts((prev) => prev.filter((acc) => acc.id !== id));
    setTransactions((prev) =>
      prev.filter(
        (tx) => tx.sourceAccountId !== id && tx.destinationAccountId !== id,
      ),
    );
  };

  const getAccountById = (id: string) => {
    return accounts.find((acc) => acc.id === id);
  };

  const getAccountBalance = (id: string) => {
    const account = accounts.find((acc) => acc.id === id);
    if (!account) return 0;
    return calculateAccountBalance(account, transactions);
  };

  const resetAllData = () => {
    setProfileState({
      name: "",
      monthlyIncome: 0,
      annualSavingsGoal: 0,
      currency: "Rs.",
      isConfigured: false,
    });
    setAccounts([]);
    setTransactions([]);
    setSelectedAccountId(null);
  };

  // Legacy compat aliases for hero card
  const totalSpent = monthlyExpenses;
  const remainingBalance = Math.max(0, profile.monthlyIncome - monthlyExpenses);
  const percentSpent =
    profile.monthlyIncome > 0
      ? Math.min(
          100,
          Math.round((monthlyExpenses / profile.monthlyIncome) * 100),
        )
      : 0;

  return (
    <ExpenseContext.Provider
      value={{
        profile,
        accounts,
        transactions,
        selectedAccountId,
        selectedAccount,
        combinedBalance,
        scopedBalance,
        monthlyIncome,
        monthlyExpenses,
        monthlySavings,
        savingsRate,
        annualSavings,
        annualGoalProgress,
        scopedTransactions,
        recentTransactions,
        selectAccount,
        setProfile,
        addTransaction,
        editTransaction,
        deleteTransaction,
        addAccount,
        editAccount,
        archiveAccount,
        deleteAccount,
        getAccountById,
        getAccountBalance,
        resetAllData,
        totalSpent,
        remainingBalance,
        percentSpent,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpense() {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error("useExpense must be used within an ExpenseProvider");
  }
  return context;
}
