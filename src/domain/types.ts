export type AccountType = 'savings' | 'spending' | 'emergency' | 'cash' | 'investment';

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

export type ExpenseCategory =
  | 'Food'
  | 'Housing'
  | 'Transportation'
  | 'Shopping'
  | 'Entertainment'
  | 'Bills'
  | 'Salary'
  | 'Health'
  | 'Transfer'
  | 'Other';

export type TransactionType = 'expense' | 'income' | 'transfer';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD or formatted display
  timestamp: number;
  sourceAccountId: string;
  destinationAccountId?: string; // required for transfer
  note?: string;
}

export interface UserProfile {
  name: string;
  monthlyIncome: number;
  annualSavingsGoal: number;
  currency: string;
  isConfigured: boolean;
}

export interface CategoryBreakdownItem {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
  count: number;
}
