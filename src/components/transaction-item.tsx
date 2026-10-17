import { SymbolView } from "expo-symbols";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { CATEGORY_ICONS, useExpense } from "@/context/expense-context";
import { useAppTheme } from "@/context/theme-context";
import { formatCurrency } from "@/domain/formatters";
import { Transaction } from "@/domain/types";

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
  showDivider?: boolean;
}

export function TransactionItem({
  transaction,
  onPress,
  showDivider = true,
}: TransactionItemProps) {
  const { deleteTransaction, accounts } = useExpense();
  const { isDark } = useAppTheme();

  const isTransfer = transaction.type === "transfer";
  const isIncome = transaction.type === "income";

  const categoryMeta = CATEGORY_ICONS[transaction.category] ?? {
    sf: "tag.fill",
    material: "label",
  };

  const sourceAccount = accounts.find(
    (a) => a.id === transaction.sourceAccountId,
  );
  const destAccount = accounts.find(
    (a) => a.id === transaction.destinationAccountId,
  );

  // Subtitle generation: show transfer route or account name
  let subtitleText = `${transaction.category} • ${transaction.date}`;
  if (isTransfer) {
    const fromName = sourceAccount?.name ?? "Account";
    const toName = destAccount?.name ?? "Account";
    subtitleText = `${fromName} → ${toName} • ${transaction.date}`;
  } else if (sourceAccount) {
    subtitleText = `${sourceAccount.name} • ${transaction.category} • ${transaction.date}`;
  }

  const handleDelete = () => {
    Alert.alert(
      "Delete Transaction",
      `Are you sure you want to delete "${transaction.title}" (${formatCurrency(transaction.amount)})?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteTransaction(transaction.id),
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.rowContent,
          pressed && { opacity: 0.75 },
        ]}
      >
        {/* Neutral Monochrome iOS Icon (No colorful background) */}
        <View
          style={[
            // styles.iconWrap,
            isDark ? styles.iconWrapDark : styles.iconWrapLight,
          ]}
        >
          <SymbolView
            name={{
              ios: isTransfer ? "arrow.left.arrow.right" : categoryMeta.sf,
              android: isTransfer ? "sync_alt" : categoryMeta.material,
              web: isTransfer ? "sync_alt" : categoryMeta.material,
            }}
            size={24}
            tintColor={isTransfer ? "#AB9FF2" : isDark ? "#FFFFFF" : "#000000"}
          />
        </View>

        {/* Title and Subtitle */}
        <View style={styles.infoCol}>
          <Text
            numberOfLines={1}
            style={[
              styles.title,
              isDark ? styles.textPrimaryDark : styles.textPrimaryLight,
            ]}
          >
            {transaction.title}
          </Text>
          <Text
            numberOfLines={1}
            style={[
              styles.subtitle,
              isDark ? styles.textSecondaryDark : styles.textSecondaryLight,
            ]}
          >
            {subtitleText}
          </Text>
        </View>

        {/* Amount: Income Green with up arrow, Expense Red with down arrow, Transfer Purple */}
        <View style={styles.amountCol}>
          <View style={styles.amountRow}>
            {!isTransfer && (
              <SymbolView
                name={{
                  ios: isIncome ? "arrow.up" : "arrow.down",
                  android: isIncome ? "arrow_upward" : "arrow_downward",
                  web: isIncome ? "arrow_upward" : "arrow_downward",
                }}
                size={11}
                tintColor={isIncome ? "#2EC08B" : "#FF3B30"}
              />
            )}
            <Text
              style={[
                styles.amountText,
                {
                  color: isTransfer
                    ? "#AB9FF2"
                    : isIncome
                      ? "#2EC08B"
                      : "#FF3B30",
                },
              ]}
            >
              {formatCurrency(transaction.amount)}
            </Text>
          </View>
        </View>

        {/* Quick Delete Trash Button */}
        <Pressable
          hitSlop={10}
          onPress={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          style={styles.deleteBtn}
          accessibilityRole="button"
          accessibilityLabel={`Delete transaction ${transaction.title}`}
        >
          <SymbolView
            name={{ ios: "trash", android: "delete", web: "delete" }}
            size={18}
            tintColor={isDark ? "#636366" : "#AEAEB2"}
          />
        </Pressable>
      </Pressable>

      {showDivider && (
        <View
          style={[
            styles.divider,
            isDark ? styles.dividerDark : styles.dividerLight,
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  rowContent: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapDark: {
    backgroundColor: "#1C1C1E",
  },
  iconWrapLight: {
    backgroundColor: "#F5F2FF", // Magnolia
  },
  infoCol: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
  },
  amountCol: {
    alignItems: "flex-end",
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  amountText: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  deleteBtn: {
    padding: 4,
    marginLeft: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 66,
  },
  dividerDark: {
    backgroundColor: "rgba(255, 255, 255, 0.10)",
  },
  dividerLight: {
    backgroundColor: "rgba(0, 0, 0, 0.08)",
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
});
