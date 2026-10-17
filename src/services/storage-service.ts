import AsyncStorage from "@react-native-async-storage/async-storage";

import { Account, Transaction, UserProfile } from "@/domain/types";

export type StoredThemeMode = "system" | "light" | "dark";

const STORAGE_KEYS = {
  USER_PROFILE: "@expense_app/user_profile",
  ACCOUNTS: "@expense_app/accounts",
  TRANSACTIONS: "@expense_app/transactions",
  THEME_MODE: "@expense_app/theme_mode",
} as const;

export const StorageService = {
  async loadProfile(): Promise<UserProfile | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return data ? (JSON.parse(data) as UserProfile) : null;
    } catch (error) {
      console.warn("Failed to load user profile from storage", error);
      return null;
    }
  },

  async saveProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PROFILE,
        JSON.stringify(profile)
      );
    } catch (error) {
      console.warn("Failed to save user profile to storage", error);
    }
  },

  async loadAccounts(): Promise<Account[] | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      return data ? (JSON.parse(data) as Account[]) : null;
    } catch (error) {
      console.warn("Failed to load accounts from storage", error);
      return null;
    }
  },

  async saveAccounts(accounts: Account[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.ACCOUNTS,
        JSON.stringify(accounts)
      );
    } catch (error) {
      console.warn("Failed to save accounts to storage", error);
    }
  },

  async loadTransactions(): Promise<Transaction[] | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return data ? (JSON.parse(data) as Transaction[]) : null;
    } catch (error) {
      console.warn("Failed to load transactions from storage", error);
      return null;
    }
  },

  async saveTransactions(transactions: Transaction[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.TRANSACTIONS,
        JSON.stringify(transactions)
      );
    } catch (error) {
      console.warn("Failed to save transactions to storage", error);
    }
  },

  async loadThemeMode(): Promise<StoredThemeMode | null> {
    try {
      const mode = await AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE);
      return mode ? (mode as StoredThemeMode) : null;
    } catch (error) {
      console.warn("Failed to load theme mode from storage", error);
      return null;
    }
  },

  async saveThemeMode(mode: StoredThemeMode): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
    } catch (error) {
      console.warn("Failed to save theme mode to storage", error);
    }
  },

  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_PROFILE,
        STORAGE_KEYS.ACCOUNTS,
        STORAGE_KEYS.TRANSACTIONS,
      ]);
    } catch (error) {
      console.warn("Failed to clear local app data", error);
    }
  },
};
