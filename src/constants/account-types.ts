import type { SymbolViewProps } from "expo-symbols";

import { AccountType } from "@/domain/types";

export type AccountSymbol = Extract<SymbolViewProps["name"], { ios?: any }>;

export interface AccountIconMeta {
  ios: NonNullable<AccountSymbol["ios"]>;
  android: NonNullable<AccountSymbol["android"]>;
  web: NonNullable<AccountSymbol["web"]>;
}

export interface AccountTypeOption {
  type: AccountType;
  label: string;
  icon: AccountIconMeta;
}

export const ACCOUNT_TYPES: AccountTypeOption[] = [
  {
    type: "spending",
    label: "Daily Spending",
    icon: {
      ios: "creditcard",
      android: "credit_card",
      web: "credit_card",
    },
  },
  {
    type: "savings",
    label: "Savings",
    icon: {
      ios: "building.columns",
      android: "account_balance",
      web: "account_balance",
    },
  },
  {
    type: "emergency",
    label: "Emergency Fund",
    icon: {
      ios: "shield.fill",
      android: "shield",
      web: "shield",
    },
  },
  {
    type: "investment",
    label: "Investment",
    icon: {
      ios: "chart.line.uptrend.xyaxis",
      android: "trending_up",
      web: "trending_up",
    },
  },
  {
    type: "cash",
    label: "Cash Wallet",
    icon: {
      ios: "banknote",
      android: "payments",
      web: "payments",
    },
  },
];

export const ACCOUNT_TYPE_ICONS: Record<AccountType, AccountIconMeta> = {
  spending: {
    ios: "creditcard",
    android: "credit_card",
    web: "credit_card",
  },
  savings: {
    ios: "building.columns",
    android: "account_balance",
    web: "account_balance",
  },
  emergency: {
    ios: "shield.fill",
    android: "shield",
    web: "shield",
  },
  investment: {
    ios: "chart.line.uptrend.xyaxis",
    android: "trending_up",
    web: "trending_up",
  },
  cash: {
    ios: "banknote",
    android: "payments",
    web: "payments",
  },
};

export function getAccountTypeIcon(
  type?: AccountType | string,
): AccountIconMeta {
  if (type && type in ACCOUNT_TYPE_ICONS) {
    return ACCOUNT_TYPE_ICONS[type as AccountType];
  }
  return ACCOUNT_TYPE_ICONS.spending;
}
