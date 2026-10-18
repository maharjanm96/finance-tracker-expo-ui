import { BottomSheet, RNHostView } from "@expo/ui";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { AppButton } from "@/components/ui/app-button";
import { useExpense } from "@/context/expense-context";
import { useAppTheme } from "@/context/theme-context";
import { ExpenseCategory, TransactionType } from "@/domain/types";

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  initialType?: TransactionType;
}

const CATEGORIES: ExpenseCategory[] = [
  "Food",
  "Housing",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills",
  "Health",
  "Salary",
  "Other",
];

function AddTransactionForm({
  initialType,
  onClose,
}: {
  initialType: TransactionType;
  onClose: () => void;
}) {
  const { accounts, selectedAccountId, addTransaction } = useExpense();
  const { isDark } = useAppTheme();

  const defaultSource =
    selectedAccountId || (accounts.length > 0 ? accounts[0].id : "");
  const defaultDest = accounts.find((a) => a.id !== defaultSource)?.id || "";

  const [type, setType] = useState<TransactionType>(initialType);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("Food");
  const [sourceAccountId, setSourceAccountId] = useState<string>(defaultSource);
  const [destAccountId, setDestAccountId] = useState<string>(defaultDest);

  const parsedAmount = parseFloat(amount.replace(/[^0-9.]/g, "")) || 0;
  const isTransfer = type === "transfer";
  const isTransferValid =
    !isTransfer ||
    (sourceAccountId !== "" &&
      destAccountId !== "" &&
      sourceAccountId !== destAccountId);
  const isSaveReady =
    parsedAmount > 0 &&
    (isTransfer || title.trim().length > 0) &&
    isTransferValid;

  const handleSave = () => {
    if (!isSaveReady) return;

    const sourceAcc = accounts.find((a) => a.id === sourceAccountId);
    const destAcc = accounts.find((a) => a.id === destAccountId);

    let defaultTitle = title.trim();
    if (isTransfer && !defaultTitle) {
      defaultTitle = `Transfer: ${sourceAcc?.name ?? "Account"} → ${destAcc?.name ?? "Account"}`;
    }

    const fallbackAccountId = accounts[0]?.id || "acc-1";
    const effectiveSourceId = sourceAccountId || fallbackAccountId;

    addTransaction({
      title: defaultTitle,
      amount: parsedAmount,
      category: isTransfer ? "Transfer" : category,
      date: "Today",
      type,
      sourceAccountId: effectiveSourceId,
      destinationAccountId: isTransfer
        ? destAccountId
        : type === "income"
          ? effectiveSourceId
          : undefined,
      note: defaultTitle,
    });

    onClose();
  };

  return (
    <View
      style={[
        styles.formContainer,
        isDark ? styles.sheetDark : styles.sheetLight,
      ]}
    >
      {/* Sheet Header */}
      <View style={styles.headerRow}>
        <Text
          style={[
            styles.headerTitle,
            isDark ? styles.textPrimaryDark : styles.textPrimaryLight,
          ]}
        >
          {type === "expense"
            ? "Record Expense"
            : type === "income"
              ? "Record Income"
              : "Transfer Funds"}
        </Text>
        <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
          <SymbolView
            name={{
              ios: "xmark.circle.fill",
              android: "cancel",
              web: "cancel",
            }}
            size={24}
            tintColor={isDark ? "#8E8E93" : "#8E8E93"}
          />
        </Pressable>
      </View>

      {/* 3-Way Segmented Control: Expense | Income | Transfer */}
      <View
        style={[
          styles.typeToggleRow,
          isDark ? styles.toggleDark : styles.toggleLight,
        ]}
      >
        <Pressable
          onPress={() => setType("expense")}
          style={[
            styles.typeOption,
            type === "expense" && styles.typeExpenseActive,
          ]}
        >
          <Text
            style={[
              styles.typeText,
              type === "expense"
                ? styles.typeTextActive
                : isDark
                  ? styles.typeTextInactiveDark
                  : styles.typeTextInactiveLight,
            ]}
          >
            Expense
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setType("income")}
          style={[
            styles.typeOption,
            type === "income" && styles.typeIncomeActive,
          ]}
        >
          <Text
            style={[
              styles.typeText,
              type === "income"
                ? styles.typeTextActive
                : isDark
                  ? styles.typeTextInactiveDark
                  : styles.typeTextInactiveLight,
            ]}
          >
            Income
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setType("transfer")}
          style={[
            styles.typeOption,
            type === "transfer" && styles.typeTransferActive,
          ]}
        >
          <Text
            style={[
              styles.typeText,
              type === "transfer"
                ? styles.typeTextActive
                : isDark
                  ? styles.typeTextInactiveDark
                  : styles.typeTextInactiveLight,
            ]}
          >
            Transfer
          </Text>
        </Pressable>
      </View>

      {/* Amount Input */}
      <View style={styles.amountInputWrap}>
        <Text style={styles.currencyPrefix}>Rs.</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          placeholderTextColor="#8E8E93"
          keyboardType="decimal-pad"
          autoFocus
          style={[
            styles.amountInput,
            isDark ? styles.textPrimaryDark : styles.textPrimaryLight,
          ]}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.formScroll}
      >
        {/* Account Selector(s) */}
        {type === "expense" && (
          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.label,
                isDark ? styles.textSecondaryDark : styles.textSecondaryLight,
              ]}
            >
              PAY FROM ACCOUNT
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsScroll}
            >
              {accounts.map((acc) => {
                const isSelected = sourceAccountId === acc.id;
                return (
                  <Pressable
                    key={acc.id}
                    onPress={() => setSourceAccountId(acc.id)}
                    style={[
                      styles.accountChip,
                      isDark ? styles.chipDark : styles.chipLight,
                      isSelected &&
                        (isDark
                          ? styles.chipSelectedDark
                          : styles.chipSelectedLight),
                    ]}
                  >
                    <Text
                      style={[
                        styles.accountChipText,
                        isSelected
                          ? isDark
                            ? styles.chipTextSelectedDark
                            : styles.chipTextSelectedLight
                          : isDark
                            ? styles.chipTextInactiveDark
                            : styles.chipTextInactiveLight,
                      ]}
                    >
                      {acc.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        {type === "income" && (
          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.label,
                isDark ? styles.textSecondaryDark : styles.textSecondaryLight,
              ]}
            >
              DEPOSIT TO ACCOUNT
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsScroll}
            >
              {accounts.map((acc) => {
                const isSelected = sourceAccountId === acc.id;
                return (
                  <Pressable
                    key={acc.id}
                    onPress={() => setSourceAccountId(acc.id)}
                    style={[
                      styles.accountChip,
                      isDark ? styles.chipDark : styles.chipLight,
                      isSelected &&
                        (isDark
                          ? styles.chipSelectedDark
                          : styles.chipSelectedLight),
                    ]}
                  >
                    <Text
                      style={[
                        styles.accountChipText,
                        isSelected
                          ? isDark
                            ? styles.chipTextSelectedDark
                            : styles.chipTextSelectedLight
                          : isDark
                            ? styles.chipTextInactiveDark
                            : styles.chipTextInactiveLight,
                      ]}
                    >
                      {acc.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        {type === "transfer" && (
          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.label,
                isDark ? styles.textSecondaryDark : styles.textSecondaryLight,
              ]}
            >
              TRANSFER ROUTE
            </Text>
            <View style={styles.transferRoutesWrap}>
              <View style={styles.routeCol}>
                <Text
                  style={[
                    styles.routeSublabel,
                    isDark
                      ? styles.textSecondaryDark
                      : styles.textSecondaryLight,
                  ]}
                >
                  FROM
                </Text>
                {accounts.map((acc) => {
                  const isSelected = sourceAccountId === acc.id;
                  return (
                    <Pressable
                      key={`from-${acc.id}`}
                      onPress={() => setSourceAccountId(acc.id)}
                      style={[
                        styles.routeRowPill,
                        isDark ? styles.chipDark : styles.chipLight,
                        isSelected &&
                          (isDark
                            ? styles.chipSelectedDark
                            : styles.chipSelectedLight),
                      ]}
                    >
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.routePillText,
                          isSelected
                            ? isDark
                              ? styles.chipTextSelectedDark
                              : styles.chipTextSelectedLight
                            : isDark
                              ? styles.chipTextInactiveDark
                              : styles.chipTextInactiveLight,
                        ]}
                      >
                        {acc.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.routeCol}>
                <Text
                  style={[
                    styles.routeSublabel,
                    isDark
                      ? styles.textSecondaryDark
                      : styles.textSecondaryLight,
                  ]}
                >
                  TO
                </Text>
                {accounts.map((acc) => {
                  const isSelected = destAccountId === acc.id;
                  const isSameAsSource = sourceAccountId === acc.id;
                  return (
                    <Pressable
                      key={`to-${acc.id}`}
                      disabled={isSameAsSource}
                      onPress={() => setDestAccountId(acc.id)}
                      style={[
                        styles.routeRowPill,
                        isDark ? styles.chipDark : styles.chipLight,
                        isSelected &&
                          (isDark
                            ? styles.chipSelectedDark
                            : styles.chipSelectedLight),
                        isSameAsSource && { opacity: 0.3 },
                      ]}
                    >
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.routePillText,
                          isSelected
                            ? isDark
                              ? styles.chipTextSelectedDark
                              : styles.chipTextSelectedLight
                            : isDark
                              ? styles.chipTextInactiveDark
                              : styles.chipTextInactiveLight,
                        ]}
                      >
                        {acc.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* Title / Note */}
        <View style={styles.inputGroup}>
          <Text
            style={[
              styles.label,
              isDark ? styles.textSecondaryDark : styles.textSecondaryLight,
            ]}
          >
            {type === "transfer" ? "NOTE (OPTIONAL)" : "NOTE / MERCHANT"}
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={
              type === "transfer"
                ? "e.g. Monthly Savings allocation"
                : "e.g. Grocery Store, Salary, Coffee"
            }
            placeholderTextColor={isDark ? "#8E8E93" : "#8E8E93"}
            style={[
              styles.textInput,
              isDark ? styles.inputDark : styles.inputLight,
              isDark ? styles.textPrimaryDark : styles.textPrimaryLight,
            ]}
          />
        </View>

        {/* Category Selector (For Expense & Income) */}
        {!isTransfer && (
          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.label,
                isDark ? styles.textSecondaryDark : styles.textSecondaryLight,
              ]}
            >
              CATEGORY
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsScroll}
            >
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={[
                      styles.categoryChip,
                      isDark ? styles.chipDark : styles.chipLight,
                      isSelected &&
                        (isDark
                          ? styles.chipSelectedDark
                          : styles.chipSelectedLight),
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        isSelected
                          ? isDark
                            ? styles.chipTextSelectedDark
                            : styles.chipTextSelectedLight
                          : isDark
                            ? styles.chipTextInactiveDark
                            : styles.chipTextInactiveLight,
                      ]}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Save Button */}
      <AppButton
        title={
          type === "expense"
            ? "Save Expense"
            : type === "income"
              ? "Save Income"
              : "Execute Transfer"
        }
        icon={{
          ios: "checkmark",
          android: "check",
          web: "check",
        }}
        onPress={handleSave}
        disabled={!isSaveReady}
        className="mt-2 mb-1"
      />
    </View>
  );
}

export function AddTransactionModal({
  visible,
  onClose,
  initialType = "expense",
}: AddTransactionModalProps) {
  const { isDark } = useAppTheme();

  return (
    <BottomSheet
      isPresented={visible}
      onDismiss={onClose}
      snapPoints={["full"]}
      showDragIndicator
      containerColor={isDark ? "#121214" : "#FFFFFF"}
      contentPadding={0}
    >
      <RNHostView matchContents={false}>
        {visible ? (
          <AddTransactionForm initialType={initialType} onClose={onClose} />
        ) : (
          <View />
        )}
      </RNHostView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  formContainer: {
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
  typeToggleRow: {
    flexDirection: "row",
    height: 42,
    borderRadius: 12,
    padding: 3,
  },
  toggleDark: {
    backgroundColor: "#1C1C1E",
  },
  toggleLight: {
    backgroundColor: "#F5F5F5",
  },
  typeOption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  typeExpenseActive: {
    backgroundColor: "#FF3B30",
  },
  typeIncomeActive: {
    backgroundColor: "#2EC08B",
  },
  typeTransferActive: {
    backgroundColor: "#AB9FF2",
  },
  typeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  typeTextActive: {
    color: "#000000",
    fontWeight: "700",
  },
  typeTextInactiveDark: {
    color: "#8E8E93",
  },
  typeTextInactiveLight: {
    color: "#6C6C70",
  },
  amountInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  currencyPrefix: {
    fontSize: 28,
    fontWeight: "700",
    color: "#AB9FF2",
    marginRight: 6,
  },
  amountInput: {
    fontSize: 38,
    fontWeight: "800",
    letterSpacing: -1,
    minWidth: 120,
    textAlign: "center",
  },
  formScroll: {
    gap: 16,
    paddingBottom: 8,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  textInput: {
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  inputDark: {
    backgroundColor: "#1C1C1E",
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  inputLight: {
    backgroundColor: "#F5F5F5",
    borderColor: "rgba(0, 0, 0, 0.08)",
  },
  chipsScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  accountChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  accountChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  transferRoutesWrap: {
    flexDirection: "row",
    gap: 10,
  },
  routeCol: {
    flex: 1,
    gap: 6,
  },
  routeSublabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  routeRowPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  routePillText: {
    fontSize: 12,
    fontWeight: "600",
  },
  chipDark: {
    backgroundColor: "#1C1C1E",
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  chipLight: {
    backgroundColor: "#f5f5f5ff",
    borderColor: "rgba(0, 0, 0, 0)",
  },
  chipSelectedDark: {
    backgroundColor: "#AB9FF2",
    borderColor: "#AB9FF2",
  },
  chipSelectedLight: {
    backgroundColor: "#AB9FF2",
    borderColor: "#AB9FF2",
  },
  chipTextSelectedDark: {
    color: "#000000",
    fontWeight: "700",
  },
  chipTextSelectedLight: {
    color: "#000000",
    fontWeight: "700",
  },
  chipTextInactiveDark: {
    color: "#8E8E93",
  },
  chipTextInactiveLight: {
    color: "#6C6C70",
  },
  saveBtn: {
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  saveBtnDark: {
    backgroundColor: "#AB9FF2",
  },
  saveBtnLight: {
    backgroundColor: "#AB9FF2",
  },
  saveBtnDisabled: {
    opacity: 0.35,
  },
  saveBtnTextDark: {
    color: "#000000",
    fontSize: 17,
    fontWeight: "700",
  },
  saveBtnTextLight: {
    color: "#000000",
    fontSize: 17,
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
