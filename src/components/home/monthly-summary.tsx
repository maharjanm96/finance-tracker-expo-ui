import { SymbolView } from "expo-symbols";
import { Text, View } from "react-native";

import { useExpense } from "@/context/expense-context";
import { formatCurrency } from "@/domain/formatters";

export function MonthlySummary() {
  const {
    profile,
    selectedAccount,
    monthlyIncome,
    monthlyExpenses,
    monthlySavings,
    savingsRate,
  } = useExpense();

  // Monthly savings goal calculation based on annual profile goal
  const monthlyGoal =
    Math.round((profile.annualSavingsGoal || 300000) / 12) || 25000;
  const currentSavings = Math.max(0, monthlySavings);
  const goalPercentage = Math.min(
    100,
    Math.round((currentSavings / monthlyGoal) * 100),
  );
  const remainingToGoal = Math.max(0, monthlyGoal - currentSavings);

  // Savings rate and monthly metrics
  const savingsTrendPercent =
    savingsRate !== null ? `${savingsRate}% savings rate` : "0% savings rate";
  const incomeTrendText = `${formatCurrency(monthlyIncome, profile.currency)} this month`;
  const expenseTrendText =
    monthlyIncome > 0
      ? `${Math.min(100, Math.round((monthlyExpenses / monthlyIncome) * 100))}% of income`
      : `${formatCurrency(monthlyExpenses, profile.currency)} this month`;

  return (
    <View className="w-full gap-3">
      {/* ─── 1. Top Card: Monthly Savings in Perano Purple with Dark Purple Martinique (#3C315B) ─── */}
      <View className="bg-[#AB9FF2] rounded-[28px] p-5 gap-3">
        {/* Header Label Row */}
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-extrabold tracking-wider text-[#3C315B] uppercase">
            {selectedAccount
              ? `${selectedAccount.name.toUpperCase()} SAVINGS`
              : "MONTHLY SAVINGS"}
          </Text>

          {selectedAccount && (
            <View className="bg-[#3C315B]/15 px-2 py-0.5 rounded-md">
              <Text className="text-[10px] font-bold text-[#3C315B]">Filtered</Text>
            </View>
          )}
        </View>

        {/* Big Savings Amount */}
        <Text className="text-4xl font-black tracking-tight text-[#3C315B] -mt-0.5">
          {formatCurrency(monthlySavings, profile.currency)}
        </Text>

        {/* Trend / Rate Pill Badge */}
        <View className="flex-row items-center self-start bg-[#3C315B]/15 px-3 py-1.5 rounded-full gap-1.5 my-0.5">
          <SymbolView
            name={{
              ios: "arrow.up",
              android: "arrow_upward",
              web: "arrow_upward",
            }}
            size={12}
            tintColor="#3C315B"
          />
          <Text className="text-[13px] font-bold text-[#3C315B]">
            {savingsTrendPercent}
          </Text>
        </View>

        {/* Goal Metadata Row */}
        <View className="flex-row items-center justify-between mt-1.5">
          <Text className="text-[13px] font-bold text-[#3C315B]">
            Goal: {formatCurrency(monthlyGoal, profile.currency)}
          </Text>
          <Text className="text-[13px] font-extrabold text-[#3C315B]">
            {goalPercentage}% reached
          </Text>
        </View>

        {/* Progress Bar (Dark Purple Fill on Translucent Track) */}
        <View className="h-2.5 rounded-full bg-[#3C315B]/20 overflow-hidden">
          <View
            className="h-full rounded-full bg-[#3C315B]"
            style={{ width: `${Math.max(4, goalPercentage)}%` }}
          />
        </View>

        {/* Remaining amount caption */}
        <Text className="text-xs font-semibold text-[#3C315B]/90">
          {remainingToGoal > 0
            ? `${formatCurrency(remainingToGoal, profile.currency)} left to reach your goal`
            : "Goal achieved for this month!"}
        </Text>
      </View>

      {/* ─── 2. Bottom Row: 2 Split Cards for Income & Expenses ─── */}
      <View className="flex-row gap-3 w-full">
        {/* Income Card */}
        <View className="flex-1 rounded-[22px] p-4 gap-1.5 bg-card-light dark:bg-card-dark">
          <Text className="text-[12px] font-bold tracking-wider text-text-secondary-light dark:text-text-secondary-dark uppercase">
            INCOME
          </Text>
          <Text className="text-xl font-extrabold tracking-tight text-text-light dark:text-text-dark my-0.5">
            {formatCurrency(monthlyIncome, profile.currency)}
          </Text>
          <View className="flex-row items-center gap-1">
            <SymbolView
              name={{
                ios: "arrow.up",
                android: "arrow_upward",
                web: "arrow_upward",
              }}
              size={12}
              tintColor="#2EC08B"
            />
            <Text className="text-[13px] font-bold text-[#2EC08B]">
              {incomeTrendText}
            </Text>
          </View>
        </View>

        {/* Expenses Card */}
        <View className="flex-1 rounded-[22px] p-4 gap-1.5 bg-card-light dark:bg-card-dark">
          <Text className="text-[12px] font-bold tracking-wider text-text-secondary-light dark:text-text-secondary-dark uppercase">
            EXPENSES
          </Text>
          <Text className="text-xl font-extrabold tracking-tight text-text-light dark:text-text-dark my-0.5">
            {formatCurrency(monthlyExpenses, profile.currency)}
          </Text>
          <View className="flex-row items-center gap-1">
            <SymbolView
              name={{
                ios: "arrow.down",
                android: "arrow_downward",
                web: "arrow_downward",
              }}
              size={12}
              tintColor="#FF3B30"
            />
            <Text className="text-xs font-bold text-[#FF3B30]">
              {expenseTrendText}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
