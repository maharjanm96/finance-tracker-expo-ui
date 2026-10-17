import { BottomSheet, RNHostView } from "@expo/ui";
import { SymbolView } from "expo-symbols";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

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
    <View className="flex-1 bg-white dark:bg-black px-5 pt-3 pb-8">
      {/* Header */}
      <View className="flex-row items-center justify-between py-3">
        <Text className="text-xl font-bold tracking-tight text-black dark:text-white">
          Transaction Details
        </Text>
        <Pressable
          onPress={onClose}
          hitSlop={12}
          className="p-1 active:opacity-70"
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
        contentContainerStyle={{ paddingBottom: 24, gap: 18 }}
      >
        {/* Hero Amount & Type Card */}
        <View className="items-center justify-center py-5 gap-2">
          <View className="flex-row items-center justify-center gap-2">
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
            <Text
              className="text-4xl font-extrabold tracking-tight"
              style={{ color: amountColor }}
            >
              {formatCurrency(transaction.amount)}
            </Text>
          </View>
          <View
            className="px-3 py-1 rounded-xl"
            style={{ backgroundColor: `${amountColor}1A` }}
          >
            <Text
              className="text-xs font-bold tracking-wider"
              style={{ color: amountColor }}
            >
              {transaction.type.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Grouped Information List */}
        <View className="rounded-2xl px-4 py-1.5 bg-[#f5f5f5] dark:bg-[#1C1C1E]">
          {/* Title Row */}
          <View className="flex-row items-center justify-between py-3.5 gap-3">
            <Text className="text-[15px] font-medium text-neutral-500 dark:text-neutral-400">
              Title
            </Text>
            <Text
              numberOfLines={2}
              className="text-[15px] font-bold text-black dark:text-white max-w-[200px] text-right"
            >
              {transaction.title}
            </Text>
          </View>

          <View className="h-[0.5px] w-full bg-black/5 dark:bg-white/10" />

          {/* Category Row */}
          <View className="flex-row items-center justify-between py-3.5 gap-3">
            <Text className="text-[15px] font-medium text-neutral-500 dark:text-neutral-400">
              Category
            </Text>
            <View className="flex-row items-center gap-2">
              <View className="w-7 h-7 rounded-full items-center justify-center bg-[#E5E5EA] dark:bg-[#2C2C2E]">
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
              <Text className="text-[15px] font-semibold text-black dark:text-white">
                {transaction.category}
              </Text>
            </View>
          </View>

          <View className="h-[0.5px] w-full bg-black/5 dark:bg-white/10" />

          {/* Account Row */}
          {isTransfer ? (
            <>
              <View className="flex-row items-center justify-between py-3.5 gap-3">
                <Text className="text-[15px] font-medium text-neutral-500 dark:text-neutral-400">
                  From
                </Text>
                <Text className="text-[15px] font-semibold text-black dark:text-white">
                  {sourceAccount?.name ?? "Source Account"}
                </Text>
              </View>
              <View className="h-[0.5px] w-full bg-black/5 dark:bg-white/10" />
              <View className="flex-row items-center justify-between py-3.5 gap-3">
                <Text className="text-[15px] font-medium text-neutral-500 dark:text-neutral-400">
                  To
                </Text>
                <Text className="text-[15px] font-semibold text-black dark:text-white">
                  {destAccount?.name ?? "Destination Account"}
                </Text>
              </View>
            </>
          ) : (
            <View className="flex-row items-center justify-between py-3.5 gap-3">
              <Text className="text-[15px] font-medium text-neutral-500 dark:text-neutral-400">
                Account
              </Text>
              <Text className="text-[15px] font-semibold text-black dark:text-white">
                {sourceAccount?.name ?? "Connected Account"}
              </Text>
            </View>
          )}

          <View className="h-[0.5px] w-full bg-black/5 dark:bg-white/10" />

          {/* Date Row */}
          <View className="flex-row items-center justify-between py-3.5 gap-3">
            <Text className="text-[15px] font-medium text-neutral-500 dark:text-neutral-400">
              Date
            </Text>
            <Text className="text-[15px] font-semibold text-black dark:text-white">
              {transaction.date}
            </Text>
          </View>

          {/* Notes Row if present */}
          {transaction.note ? (
            <>
              <View className="h-[0.5px] w-full bg-black/5 dark:bg-white/10" />
              <View className="flex-row items-center justify-between py-3.5 gap-3">
                <Text className="text-[15px] font-medium text-neutral-500 dark:text-neutral-400">
                  Note
                </Text>
                <Text className="text-[15px] font-semibold text-black dark:text-white max-w-[200px] text-right">
                  {transaction.note}
                </Text>
              </View>
            </>
          ) : null}
        </View>

        {/* Delete Action Button */}
        <Pressable
          onPress={handleDelete}
          className="flex-row items-center justify-center h-[52px] rounded-2xl gap-2 mt-1.5 bg-red-500/10 dark:bg-red-500/15 active:opacity-80"
          accessibilityRole="button"
          accessibilityLabel="Delete this transaction"
        >
          <SymbolView
            name={{ ios: "trash.fill", android: "delete", web: "delete" }}
            size={18}
            tintColor="#FF3B30"
          />
          <Text className="text-[#FF3B30] text-base font-bold">
            Delete Transaction
          </Text>
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
