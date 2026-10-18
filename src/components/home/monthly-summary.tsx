import { LinearGradient } from "expo-linear-gradient";
import { SymbolView } from "expo-symbols";
import { Text, View } from "react-native";

import { useExpense } from "@/context/expense-context";
import { useAppTheme } from "@/context/theme-context";
import { formatCurrency } from "@/domain/formatters";

export function MonthlySummary() {
  const { isDark } = useAppTheme();
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

  const savingsRateText =
    savingsRate !== null ? `${savingsRate}% saved` : "0% saved";

  // Card gradient themes
  const cardGradient = isDark
    ? (["#22242D", "#1A1B22", "#131418"] as const)
    : (["#FFFFFF", "#F9FAFC", "#EEF1F6"] as const);

  return (
    <View className="w-full gap-4">
      {/* ─── 1. Main Hero Financial Snapshot Card ─── */}
      <View
        className="rounded-[28px] overflow-hidden"
        style={{
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: isDark ? 0.35 : 0.08,
          shadowRadius: 16,
          elevation: 4,
        }}
      >
        <LinearGradient
          colors={cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            padding: 24,
            gap: 20,
            borderRadius: 28,
          }}
          className="border border-black/5 dark:border-white/10"
        >
          {/* Header Row: Label & Active Filter Pill */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2.5">
              <View className="w-7 h-7 rounded-full bg-brand-perano/15 items-center justify-center">
                <SymbolView
                  name={{
                    ios: "chart.pie.fill",
                    android: "donut_large",
                    web: "donut_large",
                  }}
                  size={15}
                  tintColor="#AB9FF2"
                />
              </View>
              <Text className="text-xs font-bold tracking-widest uppercase text-text-secondary-light dark:text-text-secondary-dark">
                {selectedAccount
                  ? `${selectedAccount.name} Savings`
                  : "Monthly Net Savings"}
              </Text>
            </View>

            {selectedAccount ? (
              <View className="bg-brand-perano/20 px-3 py-1 rounded-full border border-brand-perano/30">
                <Text className="text-xs font-bold text-brand-dark-purple dark:text-brand-perano">
                  Filtered
                </Text>
              </View>
            ) : (
              <View className="bg-black/5 dark:bg-white/10 px-3 py-1 rounded-full">
                <Text className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                  This Month
                </Text>
              </View>
            )}
          </View>

          {/* Big Bold Hero Net Savings Figure + Trend Rate Pill */}
          <View className="gap-2">
            <Text className="text-4xl sm:text-5xl font-black tracking-tight text-text-primary-light dark:text-text-primary-dark">
              {formatCurrency(monthlySavings, profile.currency)}
            </Text>

            <View className="flex-row items-center justify-between flex-wrap gap-2 pt-1">
              <Text className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">
                Remaining savings after total expenses
              </Text>

              {/* Savings Rate Pill */}
              <View className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-perano/20 border border-brand-perano/25">
                <SymbolView
                  name={{
                    ios:
                      monthlySavings >= 0
                        ? "arrow.up.right"
                        : "arrow.down.right",
                    android:
                      monthlySavings >= 0 ? "trending_up" : "trending_down",
                    web: monthlySavings >= 0 ? "trending_up" : "trending_down",
                  }}
                  size={13}
                  tintColor="#AB9FF2"
                />
                <Text className="text-xs font-bold text-brand-dark-purple dark:text-brand-perano">
                  {savingsRateText}
                </Text>
              </View>
            </View>
          </View>

          {/* Goal Progress Section */}
          <View className="gap-2.5 pt-3 border-t border-black/5 dark:border-white/10">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                Monthly Goal:{" "}
                <Text className="font-bold text-text-primary-light dark:text-text-primary-dark">
                  {formatCurrency(monthlyGoal, profile.currency)}
                </Text>
              </Text>
              <Text className="text-xs font-bold text-brand-dark-purple dark:text-brand-perano">
                {goalPercentage}% reached
              </Text>
            </View>

            {/* Smooth Progress Track */}
            <View className="h-2.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
              <View
                className="h-full rounded-full bg-brand-perano"
                style={{ width: `${Math.max(4, goalPercentage)}%` }}
              />
            </View>

            <Text className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">
              {remainingToGoal > 0
                ? `${formatCurrency(remainingToGoal, profile.currency)} left to reach your goal`
                : "Goal achieved for this month! 🎉"}
            </Text>
          </View>
        </LinearGradient>
      </View>

      {/* ─── 2. Income & Expenses Paired Stat Tiles ─── */}
      <View className="flex-row gap-3 w-full">
        {/* Income Card */}
        <View className="flex-1 rounded-[24px] p-5 bg-card-light dark:bg-card-dark border border-black/5 dark:border-white/5 gap-2.5 shadow-2xs">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-bold tracking-wider text-text-secondary-light dark:text-text-secondary-dark uppercase">
              Income
            </Text>
            <View className="w-7 h-7 rounded-full bg-[#2EC08B]/15 items-center justify-center">
              <SymbolView
                name={{
                  ios: "arrow.down.left",
                  android: "arrow_downward",
                  web: "arrow_downward",
                }}
                size={13}
                tintColor="#2EC08B"
              />
            </View>
          </View>
          <Text
            numberOfLines={1}
            className="text-2xl font-black tracking-tight text-text-primary-light dark:text-text-primary-dark"
          >
            {formatCurrency(monthlyIncome, profile.currency)}
          </Text>
          <Text className="text-xs font-semibold text-[#2EC08B]">
            Incoming this month
          </Text>
        </View>

        {/* Expenses Card */}
        <View className="flex-1 rounded-[24px] p-5 bg-card-light dark:bg-card-dark border border-black/5 dark:border-white/5 gap-2.5 shadow-2xs">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-bold tracking-wider text-text-secondary-light dark:text-text-secondary-dark uppercase">
              Expenses
            </Text>
            <View className="w-7 h-7 rounded-full bg-[#FF3B30]/15 items-center justify-center">
              <SymbolView
                name={{
                  ios: "arrow.up.right",
                  android: "arrow_upward",
                  web: "arrow_upward",
                }}
                size={13}
                tintColor="#FF3B30"
              />
            </View>
          </View>
          <Text
            numberOfLines={1}
            className="text-2xl font-black tracking-tight text-text-primary-light dark:text-text-primary-dark"
          >
            {formatCurrency(monthlyExpenses, profile.currency)}
          </Text>
          <Text className="text-xs font-semibold text-[#FF3B30]">
            Spent this month
          </Text>
        </View>
      </View>
    </View>
  );
}
