import { Account, CategoryBreakdownItem, ExpenseCategory, Transaction } from './types';

/**
 * Derives current balance for a single account based on opening balance and transactions:
 * + external income credited to account
 * - external expenses paid from account
 * - transfers sent from this account
 * + transfers received into this account
 */
export function calculateAccountBalance(account: Account, transactions: Transaction[]): number {
  let balance = account.openingBalance;

  for (const tx of transactions) {
    if (tx.type === 'income' && tx.sourceAccountId === account.id) {
      balance += tx.amount;
    } else if (tx.type === 'expense' && tx.sourceAccountId === account.id) {
      balance -= tx.amount;
    } else if (tx.type === 'transfer') {
      if (tx.sourceAccountId === account.id) {
        balance -= tx.amount;
      }
      if (tx.destinationAccountId === account.id) {
        balance += tx.amount;
      }
    }
  }

  return balance;
}

/**
 * Combined balance across all active accounts
 */
export function calculateCombinedBalance(accounts: Account[], transactions: Transaction[]): number {
  const activeAccounts = accounts.filter((acc) => !acc.isArchived);
  return activeAccounts.reduce((total, acc) => {
    return total + calculateAccountBalance(acc, transactions);
  }, 0);
}

/**
 * External income for selected account or all accounts.
 * Transfers are strictly excluded.
 */
export function calculateIncome(
  transactions: Transaction[],
  accountId?: string | null
): number {
  return transactions
    .filter((tx) => {
      if (tx.type !== 'income') return false;
      if (accountId && tx.sourceAccountId !== accountId) return false;
      return true;
    })
    .reduce((sum, tx) => sum + tx.amount, 0);
}

/**
 * External expenses for selected account or all accounts.
 * Transfers are strictly excluded.
 */
export function calculateExpenses(
  transactions: Transaction[],
  accountId?: string | null
): number {
  return transactions
    .filter((tx) => {
      if (tx.type !== 'expense') return false;
      if (accountId && tx.sourceAccountId !== accountId) return false;
      return true;
    })
    .reduce((sum, tx) => sum + tx.amount, 0);
}

/**
 * Net savings = Income - Expenses
 */
export function calculateNetSavings(income: number, expenses: number): number {
  return income - expenses;
}

/**
 * Savings rate percentage (0 - 100). Returns null if income <= 0.
 */
export function calculateSavingsRate(income: number, netSavings: number): number | null {
  if (income <= 0) return null;
  const rate = Math.round((netSavings / income) * 100);
  return Math.max(0, rate);
}

/**
 * Spending breakdown grouped by category
 */
export function calculateCategoryBreakdown(
  transactions: Transaction[],
  accountId?: string | null
): CategoryBreakdownItem[] {
  const expenseTxs = transactions.filter((tx) => {
    if (tx.type !== 'expense') return false;
    if (accountId && tx.sourceAccountId !== accountId) return false;
    return true;
  });

  const totalExpense = expenseTxs.reduce((sum, tx) => sum + tx.amount, 0);
  const categoryMap = new Map<ExpenseCategory, { amount: number; count: number }>();

  for (const tx of expenseTxs) {
    const existing = categoryMap.get(tx.category) ?? { amount: 0, count: 0 };
    categoryMap.set(tx.category, {
      amount: existing.amount + tx.amount,
      count: existing.count + 1,
    });
  }

  const items: CategoryBreakdownItem[] = [];
  for (const [category, data] of categoryMap.entries()) {
    items.push({
      category,
      amount: data.amount,
      percentage: totalExpense > 0 ? Math.round((data.amount / totalExpense) * 100) : 0,
      count: data.count,
    });
  }

  return items.sort((a, b) => b.amount - a.amount);
}

/**
 * Goal progress calculations
 */
export function calculateGoalProgress(currentSavings: number, annualGoal: number) {
  const percentage = annualGoal > 0 ? Math.min(100, Math.max(0, Math.round((currentSavings / annualGoal) * 100))) : 0;
  const remaining = Math.max(0, annualGoal - currentSavings);
  return {
    percentage,
    remaining,
    isAchieved: currentSavings >= annualGoal && annualGoal > 0,
  };
}
