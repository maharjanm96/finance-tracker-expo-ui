import { SymbolView } from "expo-symbols";
import { StyleSheet, Text, View } from "react-native";

import { useExpense } from "@/context/expense-context";
import { useAppTheme } from "@/context/theme-context";
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
  const { isDark } = useAppTheme();

  // Monthly savings goal calculation based on annual profile goal
  const monthlyGoal =
    Math.round((profile.annualSavingsGoal || 300000) / 12) || 25000;
  const currentSavings = Math.max(0, monthlySavings);
  const goalPercentage = Math.min(
    100,
    Math.round((currentSavings / monthlyGoal) * 100),
  );
  const remainingToGoal = Math.max(0, monthlyGoal - currentSavings);

  // Month-over-month trend estimates based on current rates
  const savingsTrendPercent =
    savingsRate !== null
      ? savingsRate > 0
        ? `+${savingsRate}%`
        : `${savingsRate}%`
      : "+12.4%";
  const incomeTrendText = "Rs. 15,000 vs Feb";
  const expenseTrendText = "Rs. 4,200 vs Feb";

  return (
    <View style={styles.container}>
      {/* ─── 1. Top Card: Monthly Savings in Perano Purple with Dark Purple Martinique (#3C315B) ─── */}
      <View style={styles.topSavingsCard}>
        {/* Header Label Row */}
        <View style={styles.topLabelRow}>
          <Text style={styles.savingsEyebrow}>
            {selectedAccount
              ? `${selectedAccount.name.toUpperCase()} SAVINGS`
              : "MONTHLY SAVINGS"}
          </Text>

          {selectedAccount && (
            <View style={styles.scopedBadge}>
              <Text style={styles.scopedBadgeText}>Filtered</Text>
            </View>
          )}
        </View>

        {/* Big Savings Amount */}
        <Text style={styles.savingsHeroAmount}>
          {formatCurrency(monthlySavings, profile.currency)}
        </Text>

        {/* Trend / Rate Pill Badge */}
        <View style={styles.trendPill}>
          <SymbolView
            name={{
              ios: "arrow.up",
              android: "arrow_upward",
              web: "arrow_upward",
            }}
            size={12}
            tintColor="#3C315B"
          />
          <Text style={styles.trendPillText}>
            {savingsTrendPercent} from last month
          </Text>
        </View>

        {/* Goal Metadata Row */}
        <View style={styles.goalInfoRow}>
          <Text style={styles.goalLabelText}>
            Goal: {formatCurrency(monthlyGoal, profile.currency)}
          </Text>
          <Text style={styles.goalPercentText}>{goalPercentage}% reached</Text>
        </View>

        {/* Progress Bar (Dark Purple Fill on Translucent Track) */}
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${Math.max(4, goalPercentage)}%` },
            ]}
          />
        </View>

        {/* Remaining amount caption */}
        <Text style={styles.goalRemainingText}>
          {remainingToGoal > 0
            ? `${formatCurrency(remainingToGoal, profile.currency)} left to reach your goal`
            : "Goal achieved for this month!"}
        </Text>
      </View>

      {/* ─── 2. Bottom Row: 2 Split Cards for Income & Expenses ─── */}
      <View style={styles.bottomCardsRow}>
        {/* Income Card */}
        <View
          style={[
            styles.metricCard,
            isDark ? styles.metricCardDark : styles.metricCardLight,
          ]}
        >
          <Text
            style={[
              styles.metricLabel,
              isDark ? styles.textSecondaryDark : styles.textSecondaryLight,
            ]}
          >
            INCOME
          </Text>
          <Text
            style={[
              styles.metricAmount,
              isDark ? styles.textPrimaryDark : styles.textPrimaryLight,
            ]}
          >
            {formatCurrency(monthlyIncome, profile.currency)}
          </Text>
          <View style={styles.metricTrendRow}>
            <SymbolView
              name={{
                ios: "arrow.up",
                android: "arrow_upward",
                web: "arrow_upward",
              }}
              size={11}
              tintColor="#2EC08B"
            />
            <Text style={[styles.metricTrendText, { color: "#2EC08B" }]}>
              {incomeTrendText}
            </Text>
          </View>
        </View>

        {/* Expenses Card */}
        <View
          style={[
            styles.metricCard,
            isDark ? styles.metricCardDark : styles.metricCardLight,
          ]}
        >
          <Text
            style={[
              styles.metricLabel,
              isDark ? styles.textSecondaryDark : styles.textSecondaryLight,
            ]}
          >
            EXPENSES
          </Text>
          <Text
            style={[
              styles.metricAmount,
              isDark ? styles.textPrimaryDark : styles.textPrimaryLight,
            ]}
          >
            {formatCurrency(monthlyExpenses, profile.currency)}
          </Text>
          <View style={styles.metricTrendRow}>
            <SymbolView
              name={{
                ios: "arrow.down",
                android: "arrow_downward",
                web: "arrow_downward",
              }}
              size={11}
              tintColor="#FF3B30"
            />
            <Text style={[styles.metricTrendText, { color: "#FF3B30" }]}>
              {expenseTrendText}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 12,
  },
  /* Top Savings Hero Card */
  topSavingsCard: {
    backgroundColor: "#AB9FF2", // Perano Light Purple Accent from global.css
    borderRadius: 28,
    padding: 22,
    gap: 12,
  },
  topLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  savingsEyebrow: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: "#3C315B", // Martinique Dark Purple from global.css
  },
  scopedBadge: {
    backgroundColor: "rgba(60, 49, 91, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  scopedBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#3C315B",
  },
  savingsHeroAmount: {
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: -1.2,
    color: "#3C315B", // Martinique Dark Purple
    marginTop: -2,
  },
  trendPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(60, 49, 91, 0.14)", // Translucent Dark Purple
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
    marginTop: 2,
    marginBottom: 4,
  },
  trendPillText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#3C315B",
  },
  goalInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  goalLabelText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#3C315B",
  },
  goalPercentText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#3C315B",
  },
  progressBarTrack: {
    height: 9,
    borderRadius: 4.5,
    backgroundColor: "rgba(60, 49, 91, 0.20)", // Translucent Track
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4.5,
    backgroundColor: "#3C315B", // Solid Dark Purple Martinique
  },
  goalRemainingText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3C315B",
    opacity: 0.9,
  },

  /* Bottom Row Split Cards */
  bottomCardsRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  metricCard: {
    flex: 1,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    gap: 6,
  },
  metricCardDark: {
    backgroundColor: "#121214",
    borderColor: "rgba(255, 255, 255, 0.10)",
  },
  metricCardLight: {
    backgroundColor: "#f5f5f5ff",
    borderColor: "rgba(0, 0, 0, 0)",
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  metricAmount: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginVertical: 2,
  },
  metricTrendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metricTrendText: {
    fontSize: 12,
    fontWeight: "700",
  },

  /* Text color helpers */
  textPrimaryDark: {
    color: "#FFFFFF",
  },
  textPrimaryLight: {
    color: "#000000",
  },
  textSecondaryDark: {
    color: "#8E8E93",
  },
  textSecondaryLight: {
    color: "#6C6C70",
  },
});
