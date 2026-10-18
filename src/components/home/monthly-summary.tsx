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

  const savingsRateText =
    savingsRate !== null ? `${savingsRate}% saved` : "0% saved";

  // Current month label (e.g. "October 2026")
  const currentMonthName = new Date().toLocaleString("default", {
    month: "long",
  });

  // Card gradient themes:
  // Dark: Sleek obsidian slate gradient with fine border
  // Light: Clean pearl white gradient with crisp subtle border
  const cardGradient = isDark
    ? (["#21232B", "#18191E", "#131417"] as const)
    : (["#FFFFFF", "#F9FAFC", "#EEF1F6"] as const);

  return (
    <View
      className="w-full rounded-3xl overflow-hidden"
      style={{
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.25 : 0.06,
        shadowRadius: 12,
        elevation: 3,
      }}
    >
      <LinearGradient
        colors={cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: "100%",
          padding: 18,
          borderRadius: 24,
          gap: 14,
        }}
        className="border border-black/5 dark:border-white/10"
      >
        {/* ─── 1. Header Row: Month / Scope Title & Savings Rate Pill ─── */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="w-5.5 h-5.5 rounded-full bg-brand-perano/15 items-center justify-center">
              <SymbolView
                name={{
                  ios: "chart.pie.fill",
                  android: "donut_large",
                  web: "donut_large",
                }}
                size={12}
                tintColor="#AB9FF2"
              />
            </View>
            <Text className="text-[11px] font-bold tracking-widest uppercase text-text-secondary-light dark:text-text-secondary-dark">
              {selectedAccount
                ? `${selectedAccount.name} • ${currentMonthName}`
                : `Monthly Flow • ${currentMonthName}`}
            </Text>
          </View>

          {/* Savings Rate / Filter Pill */}
          <View className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-perano/15 border border-brand-perano/25">
            <SymbolView
              name={{
                ios:
                  monthlySavings >= 0 ? "arrow.up.right" : "arrow.down.right",
                android: monthlySavings >= 0 ? "trending_up" : "trending_down",
                web: monthlySavings >= 0 ? "trending_up" : "trending_down",
              }}
              size={11}
              tintColor="#AB9FF2"
            />
            <Text className="text-[10px] font-extrabold tracking-wider text-brand-dark-purple dark:text-brand-perano">
              {selectedAccount ? "FILTERED" : savingsRateText}
            </Text>
          </View>
        </View>

        {/* ─── 2. Unified Bento Split: Net Saved (Left) | Income & Expenses Breakdown (Right) ─── */}
        <View className="flex-row items-center justify-between gap-3">
          {/* Left Column: Net Remaining Savings Hero */}
          <View className="flex-1 gap-1.5">
            <Text className="text-[10px] font-bold tracking-wider uppercase text-text-secondary-light dark:text-text-secondary-dark">
              Net Saved
            </Text>
            <Text
              numberOfLines={1}
              className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary-light dark:text-text-primary-dark"
            >
              {formatCurrency(monthlySavings, profile.currency)}
            </Text>

            {/* Compact Goal Progress Track */}
            <View className="gap-1 mt-0.5">
              <View className="h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                <View
                  className="h-full rounded-full bg-brand-perano"
                  style={{ width: `${Math.max(4, goalPercentage)}%` }}
                />
              </View>
              <Text className="text-[10px] font-medium text-text-secondary-light dark:text-text-secondary-dark">
                {goalPercentage}% of goal (
                {formatCurrency(monthlyGoal, profile.currency)})
              </Text>
            </View>
          </View>

          {/* Subtle Vertical Divider */}
          <View className="w-[1px] h-16 bg-black/5 dark:bg-white/10 my-0.5" />

          {/* Right Column: Compact Income & Expenses Breakdown */}
          <View className="flex-1 gap-2 pl-1">
            {/* Income Row */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-1.5">
                <View className="w-1.5 h-1.5 rounded-full bg-[#2EC08B]" />
                <Text className="text-[11px] font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                  Income
                </Text>
              </View>
              <Text
                numberOfLines={1}
                className="text-[13px] font-bold text-[#2EC08B]"
              >
                +{formatCurrency(monthlyIncome, profile.currency)}
              </Text>
            </View>

            {/* Spent Row */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-1.5">
                <View className="w-1.5 h-1.5 rounded-full bg-[#FF3B30]" />
                <Text className="text-[11px] font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                  Spent
                </Text>
              </View>
              <Text
                numberOfLines={1}
                className="text-[13px] font-bold text-[#FF3B30]"
              >
                -{formatCurrency(monthlyExpenses, profile.currency)}
              </Text>
            </View>

            {/* Expense Ratio Bar */}
            <View className="h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden mt-0.5">
              <View
                className="h-full rounded-full bg-[#FF3B30]"
                style={{
                  width: `${
                    monthlyIncome > 0
                      ? Math.min(
                          100,
                          Math.round((monthlyExpenses / monthlyIncome) * 100),
                        )
                      : 0
                  }%`,
                }}
              />
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}
