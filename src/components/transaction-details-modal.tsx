import { BottomSheet, RNHostView } from "@expo/ui";
import { SymbolView } from "expo-symbols";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import { AppButton } from "@/components/ui/app-button";
import { getAccountTypeIcon } from "@/constants/account-types";
import { CATEGORY_ICONS, useExpense } from "@/context/expense-context";
import { useAppTheme } from "@/context/theme-context";
import { formatCurrency, formatTransactionDateTime } from "@/domain/formatters";
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
  const { deleteTransaction, accounts, currencySymbol } = useExpense();
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
      `Are you sure you want to delete "${transaction.title}" (${formatCurrency(transaction.amount, currencySymbol)})?`,
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
    <View className="flex-1 bg-surface-light dark:bg-surface-dark px-5 pt-3 pb-8">
      {/* Header */}
      <View className="flex-row items-center justify-between py-3">
        <Text className="text-xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
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
            tintColor={isDark ? "#989BA5" : "#AEAEB2"}
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
              {formatCurrency(transaction.amount, currencySymbol)}
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
        <View className="rounded-2xl px-4 py-1.5 bg-card-light dark:bg-card-dark border border-black/5 dark:border-white/10">
          {/* Title Row */}
          <View className="flex-row items-center justify-between py-3.5 gap-3">
            <Text className="text-[14px] font-medium text-text-secondary-light dark:text-text-secondary-dark">
              Title
            </Text>
            <Text
              numberOfLines={2}
              className="text-[14px] font-bold text-text-primary-light dark:text-text-primary-dark max-w-[200px] text-right"
            >
              {transaction.title}
            </Text>
          </View>

          <View className="h-[0.5px] w-full bg-black/5 dark:border-t dark:border-white/10" />

          {/* Category Row */}
          <View className="flex-row items-center justify-between py-3.5 gap-3">
            <Text className="text-[14px] font-medium text-text-secondary-light dark:text-text-secondary-dark">
              Category
            </Text>
            <View className="flex-row items-center gap-2">
              <View className="w-7 h-7 rounded-full items-center justify-center bg-black/5 dark:bg-white/10">
                <SymbolView
                  name={{
                    ios: isTransfer
                      ? "arrow.left.arrow.right"
                      : categoryMeta.sf,
                    android: isTransfer ? "sync_alt" : categoryMeta.material,
                    web: isTransfer ? "sync_alt" : categoryMeta.material,
                  }}
                  size={15}
                  tintColor={
                    isTransfer ? "#AB9FF2" : isDark ? "#E4E5EB" : "#1E1F24"
                  }
                />
              </View>
              <Text className="text-[14px] font-semibold text-text-primary-light dark:text-text-primary-dark">
                {transaction.category}
              </Text>
            </View>
          </View>

          <View className="h-[0.5px] w-full bg-black/5 dark:border-t dark:border-white/10" />

          {/* Account Row */}
          {isTransfer ? (
            <>
              <View className="flex-row items-center justify-between py-3.5 gap-3">
                <Text className="text-[14px] font-medium text-text-secondary-light dark:text-text-secondary-dark">
                  From
                </Text>
                <View className="flex-row items-center gap-2">
                  <View className="w-7 h-7 rounded-full items-center justify-center bg-black/5 dark:bg-white/10">
                    <SymbolView
                      name={{
                        ios: getAccountTypeIcon(sourceAccount?.type).ios as any,
                        android: getAccountTypeIcon(sourceAccount?.type).android,
                        web: getAccountTypeIcon(sourceAccount?.type).web,
                      }}
                      size={14}
                      tintColor={isDark ? "#E4E5EB" : "#1E1F24"}
                    />
                  </View>
                  <Text className="text-[14px] font-semibold text-text-primary-light dark:text-text-primary-dark">
                    {sourceAccount?.name ?? "Source Account"}
                  </Text>
                </View>
              </View>
              <View className="h-[0.5px] w-full bg-black/5 dark:border-t dark:border-white/10" />
              <View className="flex-row items-center justify-between py-3.5 gap-3">
                <Text className="text-[14px] font-medium text-text-secondary-light dark:text-text-secondary-dark">
                  To
                </Text>
                <View className="flex-row items-center gap-2">
                  <View className="w-7 h-7 rounded-full items-center justify-center bg-black/5 dark:bg-white/10">
                    <SymbolView
                      name={{
                        ios: getAccountTypeIcon(destAccount?.type).ios as any,
                        android: getAccountTypeIcon(destAccount?.type).android,
                        web: getAccountTypeIcon(destAccount?.type).web,
                      }}
                      size={14}
                      tintColor={isDark ? "#E4E5EB" : "#1E1F24"}
                    />
                  </View>
                  <Text className="text-[14px] font-semibold text-text-primary-light dark:text-text-primary-dark">
                    {destAccount?.name ?? "Destination Account"}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <View className="flex-row items-center justify-between py-3.5 gap-3">
              <Text className="text-[14px] font-medium text-text-secondary-light dark:text-text-secondary-dark">
                Account
              </Text>
              <View className="flex-row items-center gap-2">
                <View className="w-7 h-7 rounded-full items-center justify-center bg-black/5 dark:bg-white/10">
                  <SymbolView
                    name={{
                      ios: getAccountTypeIcon(sourceAccount?.type).ios as any,
                      android: getAccountTypeIcon(sourceAccount?.type).android,
                      web: getAccountTypeIcon(sourceAccount?.type).web,
                    }}
                    size={14}
                    tintColor={isDark ? "#E4E5EB" : "#1E1F24"}
                  />
                </View>
                <Text className="text-[14px] font-semibold text-text-primary-light dark:text-text-primary-dark">
                  {sourceAccount?.name ?? "Connected Account"}
                </Text>
              </View>
            </View>
          )}

          <View className="h-[0.5px] w-full bg-black/5 dark:border-t dark:border-white/10" />

          {/* Date & Time Row */}
          <View className="flex-row items-center justify-between py-3.5 gap-3">
            <Text className="text-[14px] font-medium text-text-secondary-light dark:text-text-secondary-dark">
              Date & Time
            </Text>
            <Text className="text-[14px] font-semibold text-text-primary-light dark:text-text-primary-dark">
              {formatTransactionDateTime(transaction)}
            </Text>
          </View>

          {/* Notes Row if present */}
          {transaction.note ? (
            <>
              <View className="h-[0.5px] w-full bg-black/5 dark:border-t dark:border-white/10" />
              <View className="flex-row items-center justify-between py-3.5 gap-3">
                <Text className="text-[14px] font-medium text-text-secondary-light dark:text-text-secondary-dark">
                  Note
                </Text>
                <Text className="text-[14px] font-semibold text-text-primary-light dark:text-text-primary-dark max-w-[200px] text-right">
                  {transaction.note}
                </Text>
              </View>
            </>
          ) : null}
        </View>

        {/* Delete Action Button */}
        <AppButton
          title="Delete Transaction"
          variant="danger"
          icon={{ ios: "trash.fill", android: "delete", web: "delete" }}
          iconSize={18}
          onPress={handleDelete}
          className="mt-2"
        />
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
      containerColor={isDark ? "#18191D" : "#FFFFFF"}
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
