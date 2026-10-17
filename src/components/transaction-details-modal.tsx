import { BottomSheet, RNHostView } from "@expo/ui";
import { SymbolView } from "expo-symbols";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { CATEGORY_ICONS, useExpense } from "@/context/expense-context";
import { useAppTheme } from "@/context/theme-context";
import { formatCurrency } from "@/domain/formatters";
import { Transaction } from "@/domain/types";

interface TransactionDetailsModalProps {
  visible: boolean;
  transaction: Transaction | null;
  onClose: () => void;
}

function TransactionDetailsContent({
  transaction,
  onClose,
}: {
  transaction: Transaction;
  onClose: () => void;
}) {
  const { deleteTransaction, accounts } = useExpense();
  const { isDark } = useAppTheme();

  const isTransfer = transaction.type === "transfer";
  const isIncome = transaction.type === "income";

  const sourceAccount = accounts.find(
    (a) => a.id === transaction.sourceAccountId,
  );
  const destAccount = accounts.find(
    (a) => a.id === transaction.destinationAccountId,
  );

  const categoryMeta = CATEGORY_ICONS[transaction.category] ?? {
    sf: "tag.fill",
    material: "label",
  };

  const amountColor = isTransfer ? "#AB9FF2" : isIncome ? "#2EC08B" : "#FF3B30";

  const handleDelete = () => {
    Alert.alert(
      "Delete Transaction",
      `Are you sure you want to delete "${transaction.title}" (${formatCurrency(transaction.amount)})?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteTransaction(transaction.id);
            onClose();
          },
        },
      ],
    );
  };

  return (
    <View
      style={[styles.container, isDark ? styles.sheetDark : styles.sheetLight]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <Text
          style={[
            styles.headerTitle,
            isDark ? styles.textPrimaryDark : styles.textPrimaryLight,
          ]}
        >
          Transaction Details
        </Text>
        <Pressable
          onPress={onClose}
          hitSlop={12}
          style={styles.closeBtn}
          accessibilityRole="button"
          accessibilityLabel="Close details"
        >
          <SymbolView
            name={{
              ios: "xmark.circle.fill",
              android: "cancel",
              web: "cancel",
            }}
            size={24}
            tintColor={isDark ? "#8E8E93" : "#AEAEB2"}
          />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Amount & Type Card */}
        <View style={styles.heroWrap}>
          <View style={styles.heroAmountRow}>
            {!isTransfer && (
              <SymbolView
                name={{
                  ios: isIncome ? "arrow.up" : "arrow.down",
                  android: isIncome ? "arrow_upward" : "arrow_downward",
                  web: isIncome ? "arrow_upward" : "arrow_downward",
                }}
                size={22}
                tintColor={amountColor}
              />
            )}
            <Text style={[styles.amountText, { color: amountColor }]}>
              {formatCurrency(transaction.amount)}
            </Text>
          </View>
          <View
            style={[styles.typeBadge, { backgroundColor: `${amountColor}1A` }]}
          >
            <Text style={[styles.typeBadgeText, { color: amountColor }]}>
              {transaction.type.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Grouped Information List */}
        <View
          style={[
            styles.cardGroup,
            isDark ? styles.cardDark : styles.cardLight,
          ]}
        >
          {/* Title Row */}
          <View style={styles.infoRow}>
            <Text
              style={[
                styles.rowLabel,
                isDark ? styles.textSecondaryDark : styles.textSecondaryLight,
              ]}
            >
              Title
            </Text>
            <Text
              numberOfLines={2}
              style={[
                styles.rowValueBold,
                isDark ? styles.textPrimaryDark : styles.textPrimaryLight,
              ]}
            >
              {transaction.title}
            </Text>
          </View>

          <View
            style={[
              styles.rowDivider,
              isDark ? styles.dividerDark : styles.dividerLight,
            ]}
          />

          {/* Category Row */}
          <View style={styles.infoRow}>
            <Text
              style={[
                styles.rowLabel,
                isDark ? styles.textSecondaryDark : styles.textSecondaryLight,
              ]}
            >
              Category
            </Text>
            <View style={styles.categoryValueWrap}>
              <View
                style={[
                  styles.catIconCircle,
                  isDark ? styles.iconWrapDark : styles.iconWrapLight,
                ]}
              >
                <SymbolView
                  name={{
                    ios: isTransfer
                      ? "arrow.left.arrow.right"
                      : categoryMeta.sf,
                    android: isTransfer ? "sync_alt" : categoryMeta.material,
                    web: isTransfer ? "sync_alt" : categoryMeta.material,
                  }}
                  size={16}
                  tintColor={
                    isTransfer ? "#AB9FF2" : isDark ? "#FFFFFF" : "#000000"
                  }
                />
              </View>
              <Text
                style={[
                  styles.rowValue,
                  isDark ? styles.textPrimaryDark : styles.textPrimaryLight,
                ]}
              >
                {transaction.category}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.rowDivider,
              isDark ? styles.dividerDark : styles.dividerLight,
            ]}
          />

          {/* Account Row */}
          {isTransfer ? (
            <>
              <View style={styles.infoRow}>
                <Text
                  style={[
                    styles.rowLabel,
                    isDark
                      ? styles.textSecondaryDark
                      : styles.textSecondaryLight,
                  ]}
                >
                  From
                </Text>
                <Text
                  style={[
                    styles.rowValue,
                    isDark ? styles.textPrimaryDark : styles.textPrimaryLight,
                  ]}
                >
                  {sourceAccount?.name ?? "Source Account"}
                </Text>
              </View>
              <View
                style={[
                  styles.rowDivider,
                  isDark ? styles.dividerDark : styles.dividerLight,
                ]}
              />
              <View style={styles.infoRow}>
                <Text
                  style={[
                    styles.rowLabel,
                    isDark
                      ? styles.textSecondaryDark
                      : styles.textSecondaryLight,
                  ]}
                >
                  To
                </Text>
                <Text
                  style={[
                    styles.rowValue,
                    isDark ? styles.textPrimaryDark : styles.textPrimaryLight,
                  ]}
                >
                  {destAccount?.name ?? "Destination Account"}
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.rowLabel,
                  isDark ? styles.textSecondaryDark : styles.textSecondaryLight,
                ]}
              >
                Account
              </Text>
              <Text
                style={[
                  styles.rowValue,
                  isDark ? styles.textPrimaryDark : styles.textPrimaryLight,
                ]}
              >
                {sourceAccount?.name ?? "Connected Account"}
              </Text>
            </View>
          )}

          <View
            style={[
              styles.rowDivider,
              isDark ? styles.dividerDark : styles.dividerLight,
            ]}
          />

          {/* Date Row */}
          <View style={styles.infoRow}>
            <Text
              style={[
                styles.rowLabel,
                isDark ? styles.textSecondaryDark : styles.textSecondaryLight,
              ]}
            >
              Date
            </Text>
            <Text
              style={[
                styles.rowValue,
                isDark ? styles.textPrimaryDark : styles.textPrimaryLight,
              ]}
            >
              {transaction.date}
            </Text>
          </View>

          {/* Notes Row if present */}
          {transaction.note ? (
            <>
              <View
                style={[
                  styles.rowDivider,
                  isDark ? styles.dividerDark : styles.dividerLight,
                ]}
              />
              <View style={styles.infoRow}>
                <Text
                  style={[
                    styles.rowLabel,
                    isDark
                      ? styles.textSecondaryDark
                      : styles.textSecondaryLight,
                  ]}
                >
                  Note
                </Text>
                <Text
                  style={[
                    styles.rowValue,
                    isDark ? styles.textPrimaryDark : styles.textPrimaryLight,
                  ]}
                >
                  {transaction.note}
                </Text>
              </View>
            </>
          ) : null}
        </View>

        {/* Delete Action Button */}
        <Pressable
          onPress={handleDelete}
          style={({ pressed }) => [
            styles.deleteActionBtn,
            isDark ? styles.deleteBtnDark : styles.deleteBtnLight,
            pressed && { opacity: 0.8 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Delete this transaction"
        >
          <SymbolView
            name={{ ios: "trash.fill", android: "delete", web: "delete" }}
            size={18}
            tintColor="#FF3B30"
          />
          <Text style={styles.deleteActionText}>Delete Transaction</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

export function TransactionDetailsModal({
  visible,
  transaction,
  onClose,
}: TransactionDetailsModalProps) {
  const { isDark } = useAppTheme();

  return (
    <BottomSheet
      isPresented={visible && transaction !== null}
      onDismiss={onClose}
      snapPoints={["full"]}
      showDragIndicator
      containerColor={isDark ? "#121214" : "#FFFFFF"}
      contentPadding={0}
    >
      <RNHostView matchContents={false}>
        {visible && transaction ? (
          <TransactionDetailsContent
            transaction={transaction}
            onClose={onClose}
          />
        ) : (
          <View />
        )}
      </RNHostView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 16,
  },
  sheetDark: {
    backgroundColor: "#121214",
  },
  sheetLight: {
    backgroundColor: "#FFFFFF",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    gap: 18,
    paddingBottom: 16,
  },
  heroWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },
  heroAmountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  amountText: {
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -1,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  cardGroup: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 0,
  },
  cardDark: {
    backgroundColor: "#1C1C1E",
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  cardLight: {
    backgroundColor: "#f5f5f5ff",
    borderColor: "rgba(0, 0, 0, 0)",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    gap: 12,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  rowValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  rowValueBold: {
    fontSize: 15,
    fontWeight: "700",
    maxWidth: 200,
    textAlign: "right",
  },
  categoryValueWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  catIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapDark: {
    backgroundColor: "#2C2C2E",
  },
  iconWrapLight: {
    backgroundColor: "#E5E5EA",
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    width: "100%",
  },
  dividerDark: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  dividerLight: {
    backgroundColor: "rgba(0, 0, 0, 0.08)",
  },
  deleteActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    borderRadius: 16,
    gap: 8,
    marginTop: 6,
  },
  deleteBtnDark: {
    backgroundColor: "rgba(255, 59, 48, 0.12)",
  },
  deleteBtnLight: {
    backgroundColor: "rgba(255, 59, 48, 0.08)",
  },
  deleteActionText: {
    color: "#FF3B30",
    fontSize: 16,
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
});
