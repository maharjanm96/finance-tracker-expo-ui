import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { NativeGlassView } from '@/components/native-glass';
import { useExpense } from '@/context/expense-context';
import { useAppTheme } from '@/context/theme-context';
import { formatCurrency } from '@/domain/formatters';

export function ExpenseHeroCard() {
  const { profile, totalSpent, remainingBalance, percentSpent, currencySymbol } = useExpense();
  const { isDark } = useAppTheme();

  const formatAmt = (val: number) => formatCurrency(val, currencySymbol);

  const isLowBalance = percentSpent > 85;

  return (
    <View className="rounded-3xl p-5.5 border border-black/5 dark:border-white/10 overflow-hidden relative gap-4">
      <NativeGlassView
        glassEffectStyle="regular"
        tintColor={isDark ? 'rgba(24, 25, 29, 0.75)' : 'rgba(255, 255, 255, 0.90)'}
        intensity={70}
        blurTint={isDark ? 'systemMaterialDark' : 'systemMaterialLight'}
        style={StyleSheet.absoluteFill}
      />

      {/* Top Header Label */}
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-bold tracking-wider uppercase text-text-secondary-light dark:text-text-secondary-dark">
          REMAINING BUDGET
        </Text>
        <View
          className={`px-2 py-0.5 rounded-lg ${
            isLowBalance ? 'bg-rose-500/15' : 'bg-brand-perano/20'
          }`}
        >
          <Text
            className={`text-[11px] font-bold ${
              isLowBalance ? 'text-rose-500' : 'text-brand-perano'
            }`}
          >
            {percentSpent}% Used
          </Text>
        </View>
      </View>

      {/* Hero Remaining Balance */}
      <Text className="text-4xl font-extrabold tracking-tight text-text-primary-light dark:text-text-primary-dark">
        {formatAmt(remainingBalance)}
      </Text>

      {/* Minimalist Progress Track (Perano Primary Purple) */}
      <View className="h-1.5 rounded-full overflow-hidden bg-black/5 dark:bg-white/10">
        <View
          className="h-full rounded-full"
          style={{
            width: `${Math.min(100, Math.max(2, percentSpent))}%`,
            backgroundColor: isLowBalance ? '#FF3B30' : '#AB9FF2',
          }}
        />
      </View>

      {/* Sub Stats Row */}
      <View className="flex-row items-center pt-1">
        <View className="flex-1 gap-1">
          <Text className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">
            Total Spent
          </Text>
          <Text className="text-lg font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
            {formatAmt(totalSpent)}
          </Text>
        </View>

        <View className="w-[1px] h-9 mx-4 bg-black/5 dark:bg-white/10" />

        <View className="flex-1 gap-1">
          <Text className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">
            Monthly Income
          </Text>
          <Text className="text-lg font-bold tracking-tight text-emerald-500 dark:text-emerald-400">
            {formatAmt(profile.monthlyIncome)}
          </Text>
        </View>
      </View>
    </View>
  );
}
