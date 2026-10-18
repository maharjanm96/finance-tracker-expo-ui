import { SymbolView } from "expo-symbols";
import { Pressable, Text, View } from "react-native";

import { TransactionType } from "@/domain/types";

interface QuickActionsProps {
  onSelectAction: (type: TransactionType) => void;
}

export function QuickActions({ onSelectAction }: QuickActionsProps) {
  return (
    <View className="flex-row gap-2.5 w-full">
      {/* 1. Add Expense */}
      <Pressable
        onPress={() => onSelectAction("expense")}
        className="flex-1 flex-row items-center justify-center py-3.5 px-2 rounded-2xl bg-card-light dark:bg-card-dark border border-black/5 dark:border-white/5 gap-2 active:opacity-75"
      >
        <View className="w-7 h-7 rounded-lg items-center justify-center bg-rose-500/15">
          <SymbolView
            name={{
              ios: "arrow.up.right",
              android: "arrow_outward",
              web: "arrow_outward",
            }}
            size={15}
            tintColor="#FF3B30"
          />
        </View>
        <Text className="text-xs font-semibold text-text-primary-light dark:text-text-primary-dark">
          Expense
        </Text>
      </Pressable>

      {/* 2. Add Income */}
      <Pressable
        onPress={() => onSelectAction("income")}
        className="flex-1 flex-row items-center justify-center py-3.5 px-2 rounded-2xl bg-card-light dark:bg-card-dark border border-black/5 dark:border-white/5 gap-2 active:opacity-75"
      >
        <View className="w-7 h-7 rounded-lg items-center justify-center bg-emerald-500/15">
          <SymbolView
            name={{
              ios: "arrow.down.left",
              android: "call_received",
              web: "call_received",
            }}
            size={15}
            tintColor="#2EC08B"
          />
        </View>
        <Text className="text-xs font-semibold text-text-primary-light dark:text-text-primary-dark">
          Income
        </Text>
      </Pressable>

      {/* 3. Transfer */}
      <Pressable
        onPress={() => onSelectAction("transfer")}
        className="flex-1 flex-row items-center justify-center py-3.5 px-2 rounded-2xl bg-card-light dark:bg-card-dark border border-black/5 dark:border-white/5 gap-2 active:opacity-75"
      >
        <View className="w-7 h-7 rounded-lg items-center justify-center bg-brand-perano/20">
          <SymbolView
            name={{
              ios: "arrow.left.arrow.right",
              android: "sync_alt",
              web: "sync_alt",
            }}
            size={15}
            tintColor="#AB9FF2"
          />
        </View>
        <Text className="text-xs font-semibold text-text-primary-light dark:text-text-primary-dark">
          Transfer
        </Text>
      </Pressable>
    </View>
  );
}
