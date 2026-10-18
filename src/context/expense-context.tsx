import type { SymbolViewProps } from "expo-symbols";
import React, { createContext, useContext, useEffect, useState } from "react";

import {
  CurrencyInfo,
  DEFAULT_CURRENCY,
  getCurrencyInfo,
} from "@/constants/currencies";
import {
  calculateAccountBalance,
  calculateCombinedBalance,
  calculateExpenses,
  calculateGoalProgress,
  calculateIncome,
  calculateNetSavings,
  calculateSavingsRate,
} from "@/domain/finance-calculations";
import { setActiveCurrency } from "@/domain/formatters";
import {
  Account,
  ExpenseCategory,
  Transaction,
  UserProfile,
} from "@/domain/types";
import { StorageService } from "@/services/storage-service";

export type CategorySymbol = Extract<SymbolViewProps["name"], { ios?: any }>;

export interface CategoryMeta {
  sf: NonNullable<CategorySymbol["ios"]>;
  material: NonNullable<CategorySymbol["android"]>;
  color: string;
}

export const CATEGORY_ICONS: Record<ExpenseCategory, CategoryMeta> = {
  Food: { sf: "fork.knife", material: "restaurant", color: "#FF9500" },
  Housing: { sf: "house.fill", material: "home", color: "#6366F1" },
  Transportation: {
    sf: "car.fill",
    material: "directions_car",
    color: "#0EA5E9",
  },
  Shopping: { sf: "bag.fill", material: "shopping_bag", color: "#EC4899" },
  Entertainment: { sf: "play.tv.fill", material: "movie", color: "#A855F7" },
  Bills: { sf: "doc.text.fill", material: "receipt", color: "#F59E0B" },
  Salary: {
    sf: "banknote.fill",
    material: "account_balance_wallet",
    color: "#10B981",
  },
  Freelance: {
    sf: "laptopcomputer",
    material: "laptop",
    color: "#06B6D4",
  },
  Business: {
    sf: "briefcase.fill",
    material: "business_center",
    color: "#3B82F6",
  },
  Investment: {
    sf: "chart.line.uptrend.xyaxis",
    material: "trending_up",
    color: "#8B5CF6",
  },
  Gift: {
    sf: "gift.fill",
    material: "card_giftcard",
    color: "#EC4899",
  },
  Rental: {
    sf: "building.2.fill",
    material: "apartment",
    color: "#14B8A6",
  },
  Health: { sf: "heart.fill", material: "favorite", color: "#EF4444" },
  Transfer: {
    sf: "arrow.left.arrow.right",
    material: "swap_horiz",
    color: "#8B5CF6",
  },
  Other: { sf: "tag.fill", material: "label", color: "#64748B" },
};

export const DEFAULT_PROFILE: UserProfile = {
  name: "",
  monthlyIncome: 0,
  annualSavingsGoal: 0,
  currency: "NPR",
  isConfigured: false,
};

interface ExpenseContextType {
  profile: UserProfile;
  accounts: Account[];
  transactions: Transaction[];
  selectedAccountId: string | null;
  selectedAccount: Account | null;
  isHydrated: boolean;

  // Global Currency (reactive across all screens)
  currency: string;
  currencySymbol: string;
  currencyInfo: CurrencyInfo;

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
  updateCurrency: (currency: string) => void;
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
  const [profile, setProfileState] = useState<UserProfile>(DEFAULT_PROFILE);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null,
  );
  const [isHydrated, setIsHydrated] = useState(false);

  // Load persisted offline state on startup
  useEffect(() => {
    async function hydrate() {
      const [savedProfile, savedAccounts, savedTransactions] =
        await Promise.all([
          StorageService.loadProfile(),
          StorageService.loadAccounts(),
          StorageService.loadTransactions(),
        ]);

      if (savedProfile) {
        setProfileState(savedProfile);
        if (savedProfile.currency) {
          setActiveCurrency(savedProfile.currency);
        }
      }
      if (savedAccounts) {
        setAccounts(savedAccounts);
      }
      if (savedTransactions) {
        setTransactions(savedTransactions);
      }
      setIsHydrated(true);
    }

    hydrate();
  }, []);

  const selectedAccount =
    accounts.find((acc) => acc.id === selectedAccountId) ?? null;

  // Reactive Currency derived from profile
  const currencyInfo = getCurrencyInfo(profile.currency);
  const currencySymbol = currencyInfo.symbol;
  const currency = currencyInfo.code;

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
    setProfileState((prev) => {
      const next = { ...prev, ...newProfile };
      StorageService.saveProfile(next);
      if (next.currency) {
        setActiveCurrency(next.currency);
      }
      return next;
    });
  };

  const updateCurrency = (newCurrency: string) => {
    const info = getCurrencyInfo(newCurrency);
    setActiveCurrency(info.symbol);
    setProfile({ currency: info.code });
  };

  const addTransaction = (
    tx: Omit<Transaction, "id" | "timestamp"> & { timestamp?: number },
  ) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      timestamp: tx.timestamp ?? Date.now(),
    };
    setTransactions((prev) => {
      const next = [newTx, ...prev];
      StorageService.saveTransactions(next);
      return next;
    });
  };

  const editTransaction = (id: string, updated: Partial<Transaction>) => {
    setTransactions((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, ...updated } : t));
      StorageService.saveTransactions(next);
      return next;
    });
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => {
      const next = prev.filter((tx) => tx.id !== id);
      StorageService.saveTransactions(next);
      return next;
    });
  };

  const addAccount = (accountData: Omit<Account, "id">) => {
    const newAccount: Account = {
      ...accountData,
      id: `acc-${Date.now()}`,
    };
    setAccounts((prev) => {
      const next = [...prev, newAccount];
      StorageService.saveAccounts(next);
      return next;
    });
  };

  const editAccount = (id: string, updated: Partial<Account>) => {
    setAccounts((prev) => {
      const next = prev.map((acc) =>
        acc.id === id ? { ...acc, ...updated } : acc,
      );
      StorageService.saveAccounts(next);
      return next;
    });
  };

  const archiveAccount = (id: string) => {
    setAccounts((prev) => {
      const next = prev.map((acc) =>
        acc.id === id ? { ...acc, isArchived: true } : acc,
      );
      StorageService.saveAccounts(next);
      return next;
    });
    if (selectedAccountId === id) {
      setSelectedAccountId(null);
    }
  };

  const deleteAccount = (id: string) => {
    if (selectedAccountId === id) {
      setSelectedAccountId(null);
    }
    setAccounts((prev) => {
      const nextAccs = prev.filter((acc) => acc.id !== id);
      StorageService.saveAccounts(nextAccs);
      return nextAccs;
    });
    setTransactions((prev) => {
      const nextTxs = prev.filter(
        (tx) => tx.sourceAccountId !== id && tx.destinationAccountId !== id,
      );
      StorageService.saveTransactions(nextTxs);
      return nextTxs;
    });
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
    setProfileState(DEFAULT_PROFILE);
    setAccounts([]);
    setTransactions([]);
    setSelectedAccountId(null);
    StorageService.clearAllData();
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
        isHydrated,
        currency,
        currencySymbol,
        currencyInfo,
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
        updateCurrency,
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
