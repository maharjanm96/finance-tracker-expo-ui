import { BottomSheet, RNHostView } from "@expo/ui";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
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
    <View className="flex-1 px-5 pt-3 pb-6 gap-4 bg-bg-light dark:bg-bg-dark">
      {/* ─── Sheet Header ─── */}
      <View className="flex-row items-center justify-between pt-1.5 pb-1">
        <Text className="text-[20px] font-bold tracking-tight text-text-light dark:text-text-dark">
          {type === "expense"
            ? "Record Expense"
            : type === "income"
              ? "Record Income"
              : "Transfer Funds"}
        </Text>
        <Pressable onPress={onClose} hitSlop={12} className="p-1 active:opacity-70">
          <SymbolView
            name={{
              ios: "xmark.circle.fill",
              android: "cancel",
              web: "cancel",
            }}
            size={24}
            tintColor={isDark ? "#989BA5" : "#8E8E93"}
          />
        </Pressable>
      </View>

      {/* ─── 3-Way Segmented Control: Expense | Income | Transfer ─── */}
      <View className="flex-row h-12 rounded-2xl bg-card-light dark:bg-card-dark p-1 border border-black/5 dark:border-white/5 gap-1">
        {(["expense", "income", "transfer"] as const).map((t) => {
          const isActive = type === t;
          return (
            <Pressable
              key={t}
              onPress={() => setType(t)}
              className={`flex-1 rounded-xl items-center justify-center active:opacity-80 ${
                isActive
                  ? t === "expense"
                    ? "bg-red-500/15"
                    : t === "income"
                      ? "bg-emerald-500/15"
                      : "bg-brand-perano"
                  : ""
              }`}
            >
              <Text
                className={`text-[14px] font-bold capitalize ${
                  isActive
                    ? t === "expense"
                      ? "text-[#FF3B30]"
                      : t === "income"
                        ? "text-[#2EC08B]"
                        : "text-brand-dark-purple"
                    : isDark
                      ? "text-text-secondary-dark"
                      : "text-text-secondary-light"
                }`}
              >
                {t}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* ─── Big Amount Hero Input ─── */}
      <View className="flex-row items-center justify-center py-3 px-2">
        <Text className="text-3xl font-extrabold text-[#AB9FF2] mr-2">
          Rs.
        </Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          placeholderTextColor={isDark ? "#6C6C70" : "#8E8E93"}
          keyboardType="decimal-pad"
          autoFocus
          className="text-4xl font-extrabold text-text-light dark:text-text-dark tracking-tight min-w-[120px]"
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ gap: 16, paddingBottom: 16 }}
      >
        {/* ─── Pay From Account (Expense) ─── */}
        {type === "expense" && (
          <View className="gap-2">
            <Text className="text-[12px] font-bold tracking-wider text-text-secondary-light dark:text-text-secondary-dark uppercase px-0.5">
              PAY FROM ACCOUNT
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {accounts.map((acc) => {
                const isSelected = sourceAccountId === acc.id;
                return (
                  <Pressable
                    key={acc.id}
                    onPress={() => setSourceAccountId(acc.id)}
                    className={`px-4 py-2.5 rounded-full border active:opacity-80 ${
                      isSelected
                        ? "bg-brand-perano border-brand-perano"
                        : isDark
                          ? "bg-chip-dark border-white/5"
                          : "bg-chip-light border-black/5"
                    }`}
                  >
                    <Text
                      className={`text-[13px] font-bold ${
                        isSelected
                          ? "text-brand-dark-purple"
                          : isDark
                            ? "text-text-secondary-dark"
                            : "text-text-secondary-light"
                      }`}
                    >
                      {acc.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* ─── Deposit To Account (Income) ─── */}
        {type === "income" && (
          <View className="gap-2">
            <Text className="text-[12px] font-bold tracking-wider text-text-secondary-light dark:text-text-secondary-dark uppercase px-0.5">
              DEPOSIT TO ACCOUNT
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {accounts.map((acc) => {
                const isSelected = sourceAccountId === acc.id;
                return (
                  <Pressable
                    key={acc.id}
                    onPress={() => setSourceAccountId(acc.id)}
                    className={`px-4 py-2.5 rounded-full border active:opacity-80 ${
                      isSelected
                        ? "bg-brand-perano border-brand-perano"
                        : isDark
                          ? "bg-chip-dark border-white/5"
                          : "bg-chip-light border-black/5"
                    }`}
                  >
                    <Text
                      className={`text-[13px] font-bold ${
                        isSelected
                          ? "text-brand-dark-purple"
                          : isDark
                            ? "text-text-secondary-dark"
                            : "text-text-secondary-light"
                      }`}
                    >
                      {acc.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* ─── Transfer Route (Transfer) ─── */}
        {type === "transfer" && (
          <View className="gap-2">
            <Text className="text-[12px] font-bold tracking-wider text-text-secondary-light dark:text-text-secondary-dark uppercase px-0.5">
              TRANSFER ROUTE
            </Text>
            <View className="flex-row gap-3">
              <View className="flex-1 gap-1.5 p-3 rounded-2xl bg-card-light dark:bg-card-dark border border-black/5 dark:border-white/5">
                <Text className="text-[11px] font-bold text-text-secondary-light dark:text-text-secondary-dark uppercase mb-1">
                  FROM
                </Text>
                {accounts.map((acc) => {
                  const isSelected = sourceAccountId === acc.id;
                  return (
                    <Pressable
                      key={`from-${acc.id}`}
                      onPress={() => setSourceAccountId(acc.id)}
                      className={`px-3 py-2 rounded-xl border active:opacity-80 ${
                        isSelected
                          ? "bg-brand-perano border-brand-perano"
                          : isDark
                            ? "bg-chip-dark border-white/5"
                            : "bg-chip-light border-black/5"
                      }`}
                    >
                      <Text
                        numberOfLines={1}
                        className={`text-[13px] font-bold ${
                          isSelected
                            ? "text-brand-dark-purple"
                            : isDark
                              ? "text-text-secondary-dark"
                              : "text-text-secondary-light"
                        }`}
                      >
                        {acc.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View className="flex-1 gap-1.5 p-3 rounded-2xl bg-card-light dark:bg-card-dark border border-black/5 dark:border-white/5">
                <Text className="text-[11px] font-bold text-text-secondary-light dark:text-text-secondary-dark uppercase mb-1">
                  TO
                </Text>
                {accounts.map((acc) => {
                  const isSelected = destAccountId === acc.id;
                  const isSame = sourceAccountId === acc.id;
                  return (
                    <Pressable
                      key={`to-${acc.id}`}
                      disabled={isSame}
                      onPress={() => setDestAccountId(acc.id)}
                      className={`px-3 py-2 rounded-xl border active:opacity-80 ${
                        isSame ? "opacity-30" : ""
                      } ${
                        isSelected
                          ? "bg-brand-perano border-brand-perano"
                          : isDark
                            ? "bg-chip-dark border-white/5"
                            : "bg-chip-light border-black/5"
                      }`}
                    >
                      <Text
                        numberOfLines={1}
                        className={`text-[13px] font-bold ${
                          isSelected
                            ? "text-brand-dark-purple"
                            : isDark
                              ? "text-text-secondary-dark"
                              : "text-text-secondary-light"
                        }`}
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

        {/* ─── Note / Merchant Input ─── */}
        <View className="gap-2">
          <Text className="text-[12px] font-bold tracking-wider text-text-secondary-light dark:text-text-secondary-dark uppercase px-0.5">
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
            className="h-12 px-4 rounded-2xl bg-card-light dark:bg-card-dark border border-black/5 dark:border-white/5 text-[15px] font-semibold text-text-light dark:text-text-dark"
          />
        </View>

        {/* ─── Category Selector ─── */}
        {!isTransfer && (
          <View className="gap-2">
            <Text className="text-[12px] font-bold tracking-wider text-text-secondary-light dark:text-text-secondary-dark uppercase px-0.5">
              CATEGORY
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setCategory(cat)}
                    className={`px-4 py-2.5 rounded-full border active:opacity-80 ${
                      isSelected
                        ? "bg-brand-perano border-brand-perano"
                        : isDark
                          ? "bg-chip-dark border-white/5"
                          : "bg-chip-light border-black/5"
                    }`}
                  >
                    <Text
                      className={`text-[13px] font-bold ${
                        isSelected
                          ? "text-brand-dark-purple"
                          : isDark
                            ? "text-text-secondary-dark"
                            : "text-text-secondary-light"
                      }`}
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

      {/* ─── Primary Save Button ─── */}
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
      containerColor={isDark ? "#121316" : "#FFFFFF"}
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
