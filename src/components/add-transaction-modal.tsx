import { BottomSheet, RNHostView } from "@expo/ui";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { AppButton } from "@/components/ui/app-button";
import { getCurrencyInfo } from "@/constants/currencies";
import { useExpense } from "@/context/expense-context";
import { useAppTheme } from "@/context/theme-context";
import { formatCurrency, formatTime } from "@/domain/formatters";
import { Account, ExpenseCategory, TransactionType } from "@/domain/types";

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

/**
 * Account selector modal sheet for picking transfer source/destination
 */
function AccountPickerModal({
  visible,
  title,
  accounts,
  selectedId,
  onSelect,
  onClose,
  currencySymbol,
  getAccountBalance,
  isDark,
}: {
  visible: boolean;
  title: string;
  accounts: Account[];
  selectedId: string;
  onSelect: (accId: string) => void;
  onClose: () => void;
  currencySymbol: string;
  getAccountBalance: (id: string) => number;
  isDark: boolean;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable onPress={onClose} className="flex-1 bg-black/60 justify-end">
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="bg-surface-light dark:bg-surface-dark rounded-t-[32px] px-5 pt-4 pb-8 max-h-[70%] border-t border-black/5 dark:border-white/10"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
            <Text className="text-base font-bold text-text-primary-light dark:text-text-primary-dark">
              {title}
            </Text>
            <Pressable onPress={onClose} hitSlop={10} className="p-1">
              <SymbolView
                name={{
                  ios: "xmark.circle.fill",
                  android: "cancel",
                  web: "cancel",
                }}
                size={22}
                tintColor={isDark ? "#989BA5" : "#AEAEB2"}
              />
            </Pressable>
          </View>

          {/* Account List */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingVertical: 14 }}
          >
            {accounts.map((acc) => {
              const isSelected = acc.id === selectedId;
              const balance = getAccountBalance(acc.id);
              return (
                <Pressable
                  key={acc.id}
                  onPress={() => {
                    onSelect(acc.id);
                    onClose();
                  }}
                  className={`p-3.5 rounded-2xl border flex-row items-center justify-between active:opacity-75 ${
                    isSelected
                      ? "bg-brand-perano/15 border-brand-perano"
                      : "bg-card-light dark:bg-card-dark border-black/5 dark:border-white/5"
                  }`}
                >
                  <View className="flex-row items-center gap-3 flex-1 mr-3">
                    <View className="w-9 h-9 rounded-full bg-brand-perano/15 items-center justify-center">
                      <SymbolView
                        name={{
                          ios: "creditcard.fill",
                          android: "payment",
                          web: "payment",
                        }}
                        size={16}
                        tintColor="#AB9FF2"
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        numberOfLines={1}
                        className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark"
                      >
                        {acc.name}
                      </Text>
                      <Text className="text-[11px] font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase mt-0.5">
                        {acc.type}
                        {acc.institution ? ` • ${acc.institution}` : ""}
                      </Text>
                    </View>
                  </View>

                  <View className="items-end gap-1">
                    <Text className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
                      {formatCurrency(balance, currencySymbol)}
                    </Text>
                    {isSelected && (
                      <View className="w-2 h-2 rounded-full bg-brand-perano" />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function AddTransactionForm({
  initialType,
  onClose,
}: {
  initialType: TransactionType;
  onClose: () => void;
}) {
  const {
    accounts,
    selectedAccountId,
    addTransaction,
    profile,
    getAccountBalance,
  } = useExpense();
  const { isDark } = useAppTheme();
  const currencyInfo = getCurrencyInfo(profile.currency);

  const activeAccounts = accounts.filter((a) => !a.isArchived);

  const defaultSource =
    selectedAccountId ||
    (activeAccounts.length > 0 ? activeAccounts[0].id : "");
  const defaultDest =
    activeAccounts.find((a) => a.id !== defaultSource)?.id ||
    (activeAccounts.length > 1 ? activeAccounts[1].id : defaultSource);

  const [type, setType] = useState<TransactionType>(initialType);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("Food");
  const [sourceAccountId, setSourceAccountId] = useState<string>(defaultSource);
  const [destAccountId, setDestAccountId] = useState<string>(defaultDest);

  // Picker state for transfer cards
  const [pickerTarget, setPickerTarget] = useState<"source" | "dest" | null>(
    null,
  );

  const parsedAmount = parseFloat(amount.replace(/[^0-9.]/g, "")) || 0;
  const isTransfer = type === "transfer";

  const sourceAccount = activeAccounts.find((a) => a.id === sourceAccountId);
  const destAccount = activeAccounts.find((a) => a.id === destAccountId);

  const sourceBalance = sourceAccount ? getAccountBalance(sourceAccount.id) : 0;
  const destBalance = destAccount ? getAccountBalance(destAccount.id) : 0;

  const isExceedingBalance = isTransfer && parsedAmount > sourceBalance;
  const isTransferValid =
    !isTransfer ||
    (sourceAccountId !== "" &&
      destAccountId !== "" &&
      sourceAccountId !== destAccountId &&
      parsedAmount <= sourceBalance);
  const isSaveReady =
    parsedAmount > 0 &&
    (isTransfer || title.trim().length > 0) &&
    isTransferValid;

  // Swap Source and Destination accounts
  const handleSwapAccounts = () => {
    const temp = sourceAccountId;
    setSourceAccountId(destAccountId);
    setDestAccountId(temp);
  };

  // Restrict amount input to max 2 decimal digits
  const handleAmountChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) return;
    if (parts.length === 2 && parts[1].length > 2) {
      setAmount(`${parts[0]}.${parts[1].slice(0, 2)}`);
    } else {
      setAmount(cleaned);
    }
  };

  // Format max available balance with at most 2 decimal places without rounding up
  const getMaxTransferAmount = (balance: number): string => {
    if (balance <= 0) return "0";
    const clamped = Math.floor(balance * 100) / 100;
    return Number.isInteger(clamped) ? clamped.toString() : clamped.toFixed(2);
  };

  const handleSave = () => {
    if (!isSaveReady) return;

    let defaultTitle = title.trim();
    if (isTransfer && !defaultTitle) {
      defaultTitle = `Transfer: ${sourceAccount?.name ?? "Account"} → ${destAccount?.name ?? "Account"}`;
    }

    const fallbackAccountId = activeAccounts[0]?.id || "acc-1";
    const effectiveSourceId = sourceAccountId || fallbackAccountId;

    const now = new Date();
    const timeStr = formatTime(now);

    addTransaction({
      title: defaultTitle,
      amount: parsedAmount,
      category: isTransfer ? "Transfer" : category,
      date: "Today",
      timestamp: now.getTime(),
      time: timeStr,
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
    <View className="flex-1 px-5 pt-3 pb-6 gap-4 bg-surface-light dark:bg-surface-dark">
      {/* ─── Sheet Header ─── */}
      <View className="flex-row items-center justify-between pt-1.5 pb-1">
        <Text className="text-[20px] font-bold tracking-tight text-text-light dark:text-text-dark">
          {type === "expense"
            ? "Record Expense"
            : type === "income"
              ? "Record Income"
              : "Transfer Funds"}
        </Text>
        <Pressable
          onPress={onClose}
          hitSlop={12}
          className="p-1 active:opacity-70"
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

      {/* ─── Type Segmented Selector ─── */}
      <View className="flex-row p-1 rounded-2xl bg-card-light dark:bg-card-dark border border-black/5 dark:border-white/5 h-12">
        {(["expense", "income", "transfer"] as TransactionType[]).map((t) => {
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

      {/* ─── 1. Non-Transfer: Standard Hero Amount Input ─── */}
      {!isTransfer && (
        <View className="flex-row items-center justify-center py-3 px-2">
          <Text className="text-3xl font-bold text-[#AB9FF2] mr-2">
            {currencyInfo.symbol}
          </Text>
          <TextInput
            value={amount}
            onChangeText={handleAmountChange}
            placeholder="0.00"
            placeholderTextColor={isDark ? "#6C6C70" : "#8E8E93"}
            keyboardType="decimal-pad"
            autoFocus
            className="text-4xl font-extrabold text-text-light dark:text-text-dark tracking-tight min-w-[120px]"
          />
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ gap: 16, paddingBottom: 16 }}
      >
        {/* ─── 2. Transfer: Fintech Dual Swap Cards Interface ─── */}
        {isTransfer && (
          <View className="gap-0 pt-1">
            {/* ─── Top Card: "You Pay" / "From" ─── */}
            <View className="rounded-[24px] p-4 bg-card-light dark:bg-card-dark border border-black/5 dark:border-white/10 gap-3">
              {/* Card Header Row: Label & Account Picker Pill */}
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                  You Pay
                </Text>

                {/* From Account Pill */}
                <Pressable
                  onPress={() => setPickerTarget("source")}
                  className="flex-row items-center gap-2 px-3 py-1.5 rounded-full bg-surface-light dark:bg-chip-dark border border-black/5 dark:border-white/10 active:opacity-70 shadow-2xs"
                >
                  <View className="w-4.5 h-4.5 rounded-full bg-brand-perano/20 items-center justify-center">
                    <SymbolView
                      name={{
                        ios: "creditcard.fill",
                        android: "payment",
                        web: "payment",
                      }}
                      size={11}
                      tintColor="#AB9FF2"
                    />
                  </View>
                  <Text
                    numberOfLines={1}
                    className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark max-w-[110px]"
                  >
                    {sourceAccount?.name ?? "Select Account"}
                  </Text>
                  <SymbolView
                    name={{
                      ios: "chevron.down",
                      android: "keyboard_arrow_down",
                      web: "keyboard_arrow_down",
                    }}
                    size={11}
                    tintColor={isDark ? "#989BA5" : "#6C6C70"}
                  />
                </Pressable>
              </View>

              {/* Amount Input & Available Balance Row */}
              <View className="flex-row items-center justify-between">
                <TextInput
                  value={amount}
                  onChangeText={handleAmountChange}
                  placeholder="0.00"
                  placeholderTextColor={isDark ? "#6C6C70" : "#8E8E93"}
                  keyboardType="decimal-pad"
                  autoFocus
                  className="text-3xl sm:text-4xl font-extrabold text-text-primary-light dark:text-text-primary-dark tracking-tight flex-1 mr-2"
                />

                <View className="items-end gap-0.5">
                  <View className="flex-row items-center gap-1.5">
                    <Text className="text-[11px] font-medium text-text-secondary-light dark:text-text-secondary-dark">
                      Available
                    </Text>
                    {sourceBalance > 0 && (
                      <Pressable
                        onPress={() =>
                          setAmount(getMaxTransferAmount(sourceBalance))
                        }
                        hitSlop={6}
                        className="bg-brand-perano/20 px-1.5 py-0.5 rounded active:opacity-70"
                        accessibilityRole="button"
                        accessibilityLabel="Use maximum available balance"
                      >
                        <Text className="text-[10px] font-extrabold text-brand-dark-purple dark:text-brand-perano">
                          MAX
                        </Text>
                      </Pressable>
                    )}
                  </View>
                  <Text
                    className={`text-xs font-bold ${
                      isExceedingBalance
                        ? "text-[#FF3B30]"
                        : "text-text-primary-light dark:text-text-primary-dark"
                    }`}
                  >
                    {formatCurrency(sourceBalance, currencyInfo.symbol)}
                  </Text>
                </View>
              </View>

              {/* Insufficient Balance Error Notification */}
              {isExceedingBalance && (
                <View className="flex-row items-center gap-1.5 pt-1">
                  <SymbolView
                    name={{
                      ios: "exclamationmark.circle.fill",
                      android: "error",
                      web: "error",
                    }}
                    size={13}
                    tintColor="#FF3B30"
                  />
                  <Text className="text-[11px] font-semibold text-[#FF3B30]">
                    Amount exceeds available balance (
                    {formatCurrency(sourceBalance, currencyInfo.symbol)})
                  </Text>
                </View>
              )}
            </View>

            {/* ─── Center Overlapping Swap Button ─── */}
            <View className="items-center -my-3.5 z-20">
              <Pressable
                onPress={handleSwapAccounts}
                className="w-10 h-10 rounded-full bg-brand-perano items-center justify-center shadow-md active:scale-90 border-2 border-surface-light dark:border-surface-dark"
                accessibilityRole="button"
                accessibilityLabel="Swap from and to accounts"
              >
                <SymbolView
                  name={{
                    ios: "arrow.up.arrow.down",
                    android: "swap_vert",
                    web: "swap_vert",
                  }}
                  size={18}
                  tintColor="#1E1F24"
                />
              </Pressable>
            </View>

            {/* ─── Bottom Card: "You Receive" / "To" ─── */}
            <View className="rounded-[24px] p-4 bg-card-light dark:bg-card-dark border border-black/5 dark:border-white/10 gap-3">
              {/* Card Header Row: Label & Account Picker Pill */}
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                  You Receive
                </Text>

                {/* To Account Pill */}
                <Pressable
                  onPress={() => setPickerTarget("dest")}
                  className="flex-row items-center gap-2 px-3 py-1.5 rounded-full bg-surface-light dark:bg-chip-dark border border-black/5 dark:border-white/10 active:opacity-70 shadow-2xs"
                >
                  <View className="w-4.5 h-4.5 rounded-full bg-brand-perano/20 items-center justify-center">
                    <SymbolView
                      name={{
                        ios: "creditcard.fill",
                        android: "payment",
                        web: "payment",
                      }}
                      size={11}
                      tintColor="#AB9FF2"
                    />
                  </View>
                  <Text
                    numberOfLines={1}
                    className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark max-w-[110px]"
                  >
                    {destAccount?.name ?? "Select Account"}
                  </Text>
                  <SymbolView
                    name={{
                      ios: "chevron.down",
                      android: "keyboard_arrow_down",
                      web: "keyboard_arrow_down",
                    }}
                    size={11}
                    tintColor={isDark ? "#989BA5" : "#6C6C70"}
                  />
                </Pressable>
              </View>

              {/* Received Value & Destination Balance Row */}
              <View className="flex-row items-center justify-between">
                <Text
                  numberOfLines={1}
                  className="text-3xl sm:text-4xl font-extrabold text-text-primary-light dark:text-text-primary-dark tracking-tight flex-1 mr-2"
                >
                  {amount.trim().length > 0 ? amount : "0.00"}
                </Text>

                <View className="items-end gap-0.5">
                  <Text className="text-[11px] font-medium text-text-secondary-light dark:text-text-secondary-dark">
                    Current Bal
                  </Text>
                  <Text className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark">
                    {formatCurrency(destBalance, currencyInfo.symbol)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Route Collision Warning if Source equals Destination */}
            {sourceAccountId === destAccountId && (
              <Text className="text-xs font-semibold text-[#FF3B30] text-center mt-2">
                Source and Destination accounts must be different.
              </Text>
            )}
          </View>
        )}

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
              {activeAccounts.map((acc) => {
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
              {activeAccounts.map((acc) => {
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
              : isExceedingBalance
                ? "Insufficient Balance"
                : "Execute Transfer"
        }
        icon={{
          ios: isExceedingBalance ? "exclamationmark.circle" : "checkmark",
          android: isExceedingBalance ? "error" : "check",
          web: isExceedingBalance ? "error" : "check",
        }}
        onPress={handleSave}
        disabled={!isSaveReady}
        className="mt-2 mb-1"
      />

      {/* ─── Transfer Account Picker Modal ─── */}
      <AccountPickerModal
        visible={pickerTarget !== null}
        title={
          pickerTarget === "source"
            ? "Select Source Account"
            : "Select Destination Account"
        }
        accounts={activeAccounts}
        selectedId={pickerTarget === "source" ? sourceAccountId : destAccountId}
        onSelect={(accId) => {
          if (pickerTarget === "source") {
            if (accId === destAccountId) {
              // Auto-swap if user picks the same account
              setDestAccountId(sourceAccountId);
            }
            setSourceAccountId(accId);
          } else if (pickerTarget === "dest") {
            if (accId === sourceAccountId) {
              setSourceAccountId(destAccountId);
            }
            setDestAccountId(accId);
          }
        }}
        onClose={() => setPickerTarget(null)}
        currencySymbol={currencyInfo.symbol}
        getAccountBalance={getAccountBalance}
        isDark={isDark}
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
      containerColor={isDark ? "#18191D" : "#FFFFFF"}
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
