import { SymbolView } from "expo-symbols";
import { Alert, Pressable, Text, View } from "react-native";

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
  const { deleteTransaction, accounts, currencySymbol } = useExpense();
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
      `Are you sure you want to delete "${transaction.title}" (${formatCurrency(transaction.amount, currencySymbol)})?`,
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
    <View className="w-full">
      <Pressable
        onPress={onPress}
        className="min-h-[64px] flex-row items-center px-4 py-2 gap-3 active:opacity-75"
      >
        {/* Neutral Monochrome iOS Icon */}
        <View className="w-9 h-9 rounded-xl items-center justify-center">
          <SymbolView
            name={{
              ios: isTransfer ? "arrow.left.arrow.right" : categoryMeta.sf,
              android: isTransfer ? "sync_alt" : categoryMeta.material,
              web: isTransfer ? "sync_alt" : categoryMeta.material,
            }}
            size={24}
            tintColor={isTransfer ? "#AB9FF2" : isDark ? "#E4E5EB" : "#1E1F24"}
          />
        </View>

        {/* Title and Subtitle */}
        <View className="flex-1 gap-0.5">
          <Text
            numberOfLines={1}
            className="text-[16px] font-semibold tracking-tight text-text-light dark:text-text-dark"
          >
            {transaction.title}
          </Text>
          <Text
            numberOfLines={1}
            className="text-[13px] text-text-secondary-light dark:text-text-secondary-dark mt-0.5"
          >
            {subtitleText}
          </Text>
        </View>

        {/* Amount */}
        <View className="items-end">
          <View className="flex-row items-center gap-1">
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
              className="text-[15px] font-bold tracking-tight"
              style={{
                color: isTransfer
                  ? "#AB9FF2"
                  : isIncome
                    ? "#2EC08B"
                    : "#FF3B30",
              }}
            >
              {formatCurrency(transaction.amount, currencySymbol)}
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
          className="p-1 ml-1 active:opacity-60"
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
        <View className="h-[0.5px] ml-[52px] bg-black/5 dark:bg-white/10" />
      )}
    </View>
  );
}

