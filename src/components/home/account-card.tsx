import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/context/theme-context";
import { formatCurrency } from "@/domain/formatters";
import { Account } from "@/domain/types";

interface AccountCardProps {
  account: Account;
  balance: number;
  monthlyExpense: number;
  isSelected: boolean;
  onSelect: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  savings: "Savings",
  spending: "Daily Spending",
  emergency: "Emergency Fund",
  cash: "Cash Wallet",
  investment: "Investment",
};

const TYPE_ICONS: Record<string, { sf: string; material: string }> = {
  savings: { sf: "building.columns.fill", material: "account_balance" },
  spending: { sf: "creditcard.fill", material: "payment" },
  emergency: { sf: "shield.fill", material: "security" },
  cash: { sf: "banknote.fill", material: "attach_money" },
  investment: { sf: "chart.line.uptrend.xyaxis", material: "trending_up" },
};

export function AccountCard({
  account,
  balance,
  monthlyExpense,
  isSelected,
  onSelect,
}: AccountCardProps) {
  const { isDark } = useAppTheme();

  const iconInfo = TYPE_ICONS[account.type] ?? {
    sf: "tray.fill",
    material: "inbox",
  };

  return (
    <Pressable
      onPress={onSelect}
      style={({ pressed }) => [
        styles.card,
        isDark ? styles.cardDark : styles.cardLight,
        isSelected &&
          (isDark ? styles.cardSelectedDark : styles.cardSelectedLight),
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${account.name}, balance ${formatCurrency(balance)}, ${isSelected ? "selected" : "not selected"}`}
    >
      {/* Top row: Type badge & Selected state indicator */}
      <View style={styles.topRow}>
        <View style={styles.badgeRow}>
          <View
            style={[
              styles.typeIconWrap,
              isDark ? styles.iconWrapDark : styles.iconWrapLight,
            ]}
          >
            <SymbolView
              name={{
                ios: iconInfo.sf as any,
                android: iconInfo.material as any,
                web: iconInfo.material as any,
              }}
              size={22}
              tintColor={isDark ? "#FFFFFF" : "#000000"}
            />
          </View>
          <Text
            style={[
              styles.typeLabel,
              isDark ? styles.textSecondaryDark : styles.textSecondaryLight,
            ]}
          >
            {TYPE_LABELS[account.type] ?? "Account"}
          </Text>
        </View>

        {isSelected ? (
          <View style={styles.selectedPill}>
            <SymbolView
              name={{
                ios: "checkmark.circle.fill",
                android: "check_circle",
                web: "check_circle",
              }}
              size={14}
              tintColor="#AB9FF2"
            />
            <Text style={styles.selectedPillText}>Active Filter</Text>
          </View>
        ) : (
          <Text
            style={[
              styles.tapHint,
              isDark ? styles.textMutedDark : styles.textMutedLight,
            ]}
          >
            Tap to filter
          </Text>
        )}
      </View>

      {/* Account Title */}
      <Text
        numberOfLines={1}
        style={[
          styles.accountName,
          isDark ? styles.textPrimaryDark : styles.textPrimaryLight,
        ]}
      >
        {account.name}
      </Text>

      {/* Main Account Balance */}
      <View style={styles.balanceRow}>
        <Text
          style={[
            styles.balanceAmount,
            isDark ? styles.textPrimaryDark : styles.textPrimaryLight,
          ]}
        >
          {formatCurrency(balance)}
        </Text>
      </View>

      {/* Footer stats: monthly outflow */}
      <View
        style={[
          styles.footerRow,
          isDark ? styles.footerBorderDark : styles.footerBorderLight,
        ]}
      >
        <Text
          style={[
            styles.footerLabel,
            isDark ? styles.textSecondaryDark : styles.textSecondaryLight,
          ]}
        >
          Spent this month
        </Text>
        <Text
          style={[
            styles.footerValue,
            {
              color:
                monthlyExpense > 0 ? "#FF3B30" : isDark ? "#8E8E93" : "#6C6C70",
            },
          ]}
        >
          {monthlyExpense > 0 ? `-${formatCurrency(monthlyExpense)}` : "Rs. 0"}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    gap: 10,
  },
  cardDark: {
    backgroundColor: "#121214",
    borderColor: "rgba(255, 255, 255, 0.10)",
  },
  cardLight: {
    backgroundColor: "#f5f5f5ff",
    borderColor: "rgba(0, 0, 0, 0)",
  },
  cardSelectedDark: {
    borderColor: "#AB9FF2",
    backgroundColor: "#18171E",
  },
  cardSelectedLight: {
    borderColor: "#AB9FF2",
    backgroundColor: "#FBF9FF",
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  typeIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapDark: {
    backgroundColor: "rgba(255, 255, 255, 0.10)",
  },
  iconWrapLight: {
    backgroundColor: "#F5F2FF",
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  selectedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: "rgba(171, 159, 242, 0.15)",
  },
  selectedPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#AB9FF2",
  },
  tapHint: {
    fontSize: 11,
    fontWeight: "500",
  },
  accountName: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: -2,
  },
  balanceAmount: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    marginTop: 2,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerBorderDark: {
    borderTopColor: "rgba(255, 255, 255, 0.08)",
  },
  footerBorderLight: {
    borderTopColor: "rgba(0, 0, 0, 0.06)",
  },
  footerLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  footerValue: {
    fontSize: 13,
    fontWeight: "700",
  },
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
  textMutedDark: {
    color: "#636366",
  },
  textMutedLight: {
    color: "#8E8E93",
  },
});
