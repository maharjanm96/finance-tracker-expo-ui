import { SymbolView } from "expo-symbols";
import { Alert, Pressable, Text, View } from "react-native";

import { useExpense } from "@/context/expense-context";
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
  const { deleteAccount } = useExpense();

  const iconInfo = TYPE_ICONS[account.type] ?? {
    sf: "tray.fill",
    material: "inbox",
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      `Are you sure you want to delete "${account.name}"? All transactions linked to this account will also be deleted.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteAccount(account.id),
        },
      ],
    );
  };

  return (
    <Pressable
      onPress={onSelect}
      className={`rounded-[20px] p-4 border-[1.5px] gap-2.5 active:opacity-85 ${
        isSelected
          ? "bg-[#AB9FF2]/10 border-[#AB9FF2]"
          : "bg-[#f5f5f5] dark:bg-[#121214] border-transparent"
      }`}
      accessibilityRole="button"
      accessibilityLabel={`${account.name}, balance ${formatCurrency(balance)}, ${isSelected ? "selected" : "not selected"}`}
    >
      {/* Top row: Type badge & Selected state indicator */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-full items-center justify-center bg-black/5 dark:bg-white/10">
            <SymbolView
              name={{
                ios: iconInfo.sf as any,
                android: iconInfo.material as any,
                web: iconInfo.material as any,
              }}
              size={18}
              tintColor={isDark ? "#FFFFFF" : "#000000"}
            />
          </View>
          <Text className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            {TYPE_LABELS[account.type] ?? "Account"}
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          {isSelected ? (
            <View className="flex-row items-center gap-1 bg-[#AB9FF2]/15 px-2.5 py-1 rounded-full">
              <SymbolView
                name={{
                  ios: "checkmark.circle.fill",
                  android: "check_circle",
                  web: "check_circle",
                }}
                size={14}
                tintColor="#AB9FF2"
              />
              <Text className="text-xs font-bold text-[#AB9FF2]">Active</Text>
            </View>
          ) : (
            <Text className="text-xs font-medium text-neutral-400 dark:text-neutral-600">
              Tap to filter
            </Text>
          )}

          <Pressable
            hitSlop={10}
            onPress={(e) => {
              e.stopPropagation();
              handleDeleteAccount();
            }}
            className="p-1 ml-1 active:opacity-60"
            accessibilityRole="button"
            accessibilityLabel={`Delete account ${account.name}`}
          >
            <SymbolView
              name={{ ios: "trash", android: "delete", web: "delete" }}
              size={15}
              tintColor={isDark ? "#8E8E93" : "#AEAEB2"}
            />
          </Pressable>
        </View>
      </View>

      {/* Account Title */}
      <Text
        numberOfLines={1}
        className="text-base font-bold text-black dark:text-white tracking-tight"
      >
        {account.name}
      </Text>

      {/* Main Account Balance */}
      <View className="flex-row items-baseline">
        <Text className="text-2xl font-extrabold tracking-tight text-black dark:text-white">
          {formatCurrency(balance)}
        </Text>
      </View>

      {/* Footer stats: monthly outflow */}
      <View className="flex-row items-center justify-between pt-2.5 mt-1 border-t border-black/5 dark:border-white/10">
        <Text className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
          Spent this month
        </Text>
        <View className="flex-row items-center gap-1">
          {monthlyExpense > 0 && (
            <SymbolView
              name={{
                ios: "arrow.down",
                android: "arrow_downward",
                web: "arrow_downward",
              }}
              size={11}
              tintColor="#FF3B30"
            />
          )}
          <Text
            className="text-xs font-semibold"
            style={{
              color:
                monthlyExpense > 0 ? "#FF3B30" : isDark ? "#8E8E93" : "#6C6C70",
            }}
          >
            {formatCurrency(monthlyExpense)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
