import { SymbolView } from "expo-symbols";
import { useMemo, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BlurTargetView } from "@/components/blurred-status-bar";
import { getTopHeaderPadding } from "@/components/navigation/top-chip-header";
import { MaxContentWidth } from "@/constants/theme";
import { CATEGORY_ICONS, useExpense } from "@/context/expense-context";
import { useAppTheme } from "@/context/theme-context";
import { calculateCategoryBreakdown } from "@/domain/finance-calculations";
import { formatCurrency, formatPercentage } from "@/domain/formatters";

type TimeRange = "month" | "lastMonth" | "ytd";

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { isDark } = useAppTheme();
  const {
    profile,
    transactions,
    accounts,
    selectedAccountId,
    selectAccount,
    monthlyIncome,
    monthlyExpenses,
    monthlySavings,
    savingsRate,
    annualGoalProgress,
  } = useExpense();

  const [scrollY] = useState(() => new Animated.Value(0));
  const blurTargetRef = useRef<View | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("month");

  const topHeaderPadding = getTopHeaderPadding(insets.top);

  // Filter transactions for analytics
  const filteredTxs = useMemo(() => {
    return transactions.filter((tx) => {
      if (selectedAccountId) {
        const matches =
          tx.sourceAccountId === selectedAccountId ||
          tx.destinationAccountId === selectedAccountId;
        if (!matches) return false;
      }
      return true;
    });
  }, [transactions, selectedAccountId]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    return calculateCategoryBreakdown(filteredTxs, selectedAccountId);
  }, [filteredTxs, selectedAccountId]);

  // Cash Flow Calculations
  const maxCashFlow = Math.max(monthlyIncome, monthlyExpenses, 1);
  const incomeBarWidth = Math.round((monthlyIncome / maxCashFlow) * 100);
  const expenseBarWidth = Math.round((monthlyExpenses / maxCashFlow) * 100);

  return (
    <View className="flex-1 bg-bg-light dark:bg-bg-dark">
      <BlurTargetView ref={blurTargetRef} className="flex-1">
        <Animated.ScrollView
          className="flex-1"
          contentContainerStyle={{
            alignItems: "center",
            paddingHorizontal: 16,
            paddingTop: topHeaderPadding,
            paddingBottom: 110,
          }}
          scrollIndicatorInsets={{ top: topHeaderPadding, bottom: 90 }}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true },
          )}
        >
          <View className="w-full gap-4.5" style={{ maxWidth: MaxContentWidth }}>
            {/* Header */}
            <View className="py-1">
              <Text className="text-xs font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                INSIGHTS & CASH FLOW
              </Text>
              <Text className="text-3xl font-extrabold tracking-tight text-text-primary-light dark:text-text-primary-dark mt-0.5">
                Analytics
              </Text>
            </View>

            {/* Time Range Selector */}
            <View className="flex-row h-11 rounded-2xl p-1 bg-card-light dark:bg-card-dark border border-black/5 dark:border-white/5">
              {(
                [
                  { id: "month", label: "This Month" },
                  { id: "lastMonth", label: "Last Month" },
                  { id: "ytd", label: "YTD" },
                ] as const
              ).map((option) => {
                const isActive = timeRange === option.id;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => setTimeRange(option.id)}
                    className={`flex-1 items-center justify-center rounded-xl transition-all ${
                      isActive
                        ? "bg-white dark:bg-chip-dark shadow-xs"
                        : "bg-transparent"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        isActive
                          ? "text-brand-dark-purple dark:text-white font-bold"
                          : "text-text-secondary-light dark:text-text-secondary-dark"
                      }`}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Scope / Account Filter Chips */}
            <View className="-mt-1">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
              >
                <Pressable
                  onPress={() => selectAccount(null)}
                  className={`px-3.5 py-1.5 rounded-full border transition-all ${
                    selectedAccountId === null
                      ? "bg-brand-perano border-brand-perano"
                      : "bg-card-light dark:bg-card-dark border-black/5 dark:border-white/10"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      selectedAccountId === null
                        ? "text-brand-dark-purple dark:text-brand-dark-purple font-bold"
                        : "text-text-secondary-light dark:text-text-secondary-dark"
                    }`}
                  >
                    Combined (All Accounts)
                  </Text>
                </Pressable>

                {accounts.map((acc) => {
                  const isSelected = selectedAccountId === acc.id;
                  return (
                    <Pressable
                      key={acc.id}
                      onPress={() => selectAccount(acc.id)}
                      className={`px-3.5 py-1.5 rounded-full border transition-all ${
                        isSelected
                          ? "bg-brand-perano border-brand-perano"
                          : "bg-card-light dark:bg-card-dark border-black/5 dark:border-white/10"
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          isSelected
                            ? "text-brand-dark-purple dark:text-brand-dark-purple font-bold"
                            : "text-text-secondary-light dark:text-text-secondary-dark"
                        }`}
                      >
                        {acc.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* 1. Cash Flow Comparison Card */}
            <View className="rounded-3xl p-4.5 bg-card-light dark:bg-card-dark border border-black/5 dark:border-white/5 gap-3.5">
              <View className="flex-row items-center justify-between">
                <Text className="text-[11px] font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                  CASH FLOW COMPARISON
                </Text>
                <View className="bg-emerald-500/15 px-2.5 py-1 rounded-full">
                  <Text className="text-emerald-500 dark:text-emerald-400 text-xs font-bold">
                    {savingsRate !== null
                      ? `${formatPercentage(savingsRate)} Saved`
                      : "0% Saved"}
                  </Text>
                </View>
              </View>

              <View className="gap-3">
                {/* Income Bar */}
                <View className="gap-1.5">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                      Income
                    </Text>
                    <View className="flex-row items-center gap-1">
                      <SymbolView
                        name={{
                          ios: "arrow.up",
                          android: "arrow_upward",
                          web: "arrow_upward",
                        }}
                        size={11}
                        tintColor="#2EC08B"
                      />
                      <Text className="text-sm font-bold text-emerald-500 dark:text-emerald-400">
                        {formatCurrency(monthlyIncome)}
                      </Text>
                    </View>
                  </View>
                  <View className="h-2 rounded-full overflow-hidden bg-black/5 dark:bg-white/10">
                    <View
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${incomeBarWidth}%` }}
                    />
                  </View>
                </View>

                {/* Expenses Bar */}
                <View className="gap-1.5">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                      Expenses
                    </Text>
                    <View className="flex-row items-center gap-1">
                      <SymbolView
                        name={{
                          ios: "arrow.down",
                          android: "arrow_downward",
                          web: "arrow_downward",
                        }}
                        size={11}
                        tintColor="#FF3B30"
                      />
                      <Text className="text-sm font-bold text-rose-500 dark:text-rose-400">
                        {formatCurrency(monthlyExpenses)}
                      </Text>
                    </View>
                  </View>
                  <View className="h-2 rounded-full overflow-hidden bg-black/5 dark:bg-white/10">
                    <View
                      className="h-full rounded-full bg-rose-500"
                      style={{ width: `${expenseBarWidth}%` }}
                    />
                  </View>
                </View>
              </View>

              {/* Net Cash Flow Summary Footer */}
              <View className="flex-row justify-between items-center pt-3 border-t border-black/5 dark:border-white/10">
                <Text className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                  Net Surplus
                </Text>
                <View className="flex-row items-center gap-1">
                  <SymbolView
                    name={{
                      ios: monthlySavings >= 0 ? "arrow.up" : "arrow.down",
                      android:
                        monthlySavings >= 0 ? "arrow_upward" : "arrow_downward",
                      web:
                        monthlySavings >= 0 ? "arrow_upward" : "arrow_downward",
                    }}
                    size={12}
                    tintColor={monthlySavings >= 0 ? "#2EC08B" : "#FF3B30"}
                  />
                  <Text
                    className={`text-sm font-extrabold ${
                      monthlySavings >= 0
                        ? "text-emerald-500 dark:text-emerald-400"
                        : "text-rose-500 dark:text-rose-400"
                    }`}
                  >
                    {formatCurrency(Math.abs(monthlySavings))}
                  </Text>
                </View>
              </View>
            </View>

            {/* 2. Annual Savings Goal Progress */}
            <View className="rounded-3xl p-4.5 bg-card-light dark:bg-card-dark border border-black/5 dark:border-white/5 gap-3.5">
              <View className="flex-row items-center justify-between">
                <Text className="text-[11px] font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                  2026 ANNUAL SAVINGS GOAL
                </Text>
                <Text className="text-xs font-bold text-brand-perano">
                  {formatPercentage(annualGoalProgress.percentage)}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <View>
                  <Text className="text-[11px] font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                    Total Saved YTD
                  </Text>
                  <Text className="text-base font-bold text-text-primary-light dark:text-text-primary-dark mt-0.5">
                    {formatCurrency(monthlySavings > 0 ? monthlySavings : 0)}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-[11px] font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                    Target Goal
                  </Text>
                  <Text className="text-base font-bold text-text-primary-light dark:text-text-primary-dark mt-0.5">
                    {formatCurrency(profile.annualSavingsGoal)}
                  </Text>
                </View>
              </View>

              <View className="h-2 rounded-full overflow-hidden bg-black/5 dark:bg-white/10">
                <View
                  className="h-full rounded-full bg-brand-perano"
                  style={{
                    width: `${Math.min(100, Math.round(annualGoalProgress.percentage))}%`,
                  }}
                />
              </View>
            </View>

            {/* 3. Category Spending Breakdown */}
            <View className="gap-2.5">
              <Text className="text-[11px] font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark px-1">
                SPENDING BY CATEGORY
              </Text>

              <View className="rounded-3xl bg-card-light dark:bg-card-dark border border-black/5 dark:border-white/5 overflow-hidden">
                {categoryBreakdown.length === 0 ? (
                  <View className="p-8 items-center justify-center">
                    <Text className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                      No expense records in this period
                    </Text>
                  </View>
                ) : (
                  categoryBreakdown.map((item, idx) => {
                    const meta = CATEGORY_ICONS[item.category] ?? {
                      sf: "tag.fill",
                      material: "label",
                    };
                    const isLast = idx === categoryBreakdown.length - 1;

                    return (
                      <View key={item.category}>
                        <View className="flex-row items-center px-4 py-3 gap-3">
                          <View className="w-9 h-9 rounded-xl items-center justify-center bg-brand-perano/20 dark:bg-chip-dark">
                            <SymbolView
                              name={{
                                ios: meta.sf,
                                android: meta.material,
                                web: meta.material,
                              }}
                              size={16}
                              tintColor={isDark ? "#E4E5EB" : "#1E1F24"}
                            />
                          </View>

                          <View className="flex-1 gap-1.5">
                            <View className="flex-row justify-between items-center">
                              <Text className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                                {item.category}
                              </Text>
                              <Text className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
                                {formatCurrency(item.amount)}
                              </Text>
                            </View>

                            <View className="flex-row items-center gap-2">
                              <View className="flex-1 h-1.5 rounded-full overflow-hidden bg-black/5 dark:bg-white/10">
                                <View
                                  className="h-full rounded-full bg-brand-perano"
                                  style={{
                                    width: `${Math.min(100, item.percentage)}%`,
                                  }}
                                />
                              </View>
                              <Text className="text-[11px] font-semibold text-text-secondary-light dark:text-text-secondary-dark w-8 text-right">
                                {item.percentage}%
                              </Text>
                            </View>
                          </View>
                        </View>
                        {!isLast && (
                          <View className="h-[1px] ml-16 bg-black/5 dark:border-t dark:border-white/5" />
                        )}
                      </View>
                    );
                  })
                )}
              </View>
            </View>
          </View>
        </Animated.ScrollView>
      </BlurTargetView>
    </View>
  );
}
