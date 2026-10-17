import { SymbolView } from 'expo-symbols';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { AccountCard } from './account-card';
import { useExpense } from '@/context/expense-context';
import { useAppTheme } from '@/context/theme-context';
import { calculateExpenses } from '@/domain/finance-calculations';

interface AccountStackProps {
  onManageAccounts?: () => void;
  onAddAccount?: () => void;
}

export function AccountStack({ onManageAccounts, onAddAccount }: AccountStackProps) {
  const {
    accounts,
    transactions,
    selectedAccountId,
    selectedAccount,
    selectAccount,
    getAccountBalance,
  } = useExpense();
  const { isDark } = useAppTheme();

  const activeAccounts = accounts.filter((a) => !a.isArchived);

  return (
    <View className="gap-3">
      {/* Section Header */}
      <View className="flex-row items-center justify-between px-1">
        <View className="flex-row items-center gap-1.5">
          <Text className="text-xs font-bold tracking-wider text-neutral-500 dark:text-neutral-400">
            YOUR ACCOUNTS
          </Text>
          <Text className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
            ({activeAccounts.length})
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          {onAddAccount && (
            <Pressable
              onPress={onAddAccount}
              hitSlop={8}
              className="flex-row items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#f5f5f5] dark:bg-[#1C1C1E] active:opacity-70"
            >
              <SymbolView
                name={{ ios: 'plus', android: 'add', web: 'add' }}
                size={14}
                tintColor={isDark ? '#FFFFFF' : '#000000'}
              />
              <Text className="text-xs font-semibold text-black dark:text-white">
                New
              </Text>
            </Pressable>
          )}

          {onManageAccounts && (
            <Pressable
              onPress={onManageAccounts}
              hitSlop={8}
              className="flex-row items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#f5f5f5] dark:bg-[#1C1C1E] active:opacity-70"
            >
              <Text className="text-xs font-semibold text-black dark:text-white">
                Manage
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Selected Account Filter Banner */}
      {selectedAccount && (
        <View className="flex-row items-center justify-between px-3.5 py-2 rounded-xl border bg-[#AB9FF2]/10 border-[#AB9FF2]/25">
          <View className="flex-row items-center gap-2">
            <View className="w-1.5 h-1.5 rounded-full bg-[#AB9FF2]" />
            <Text className="text-[13px] text-black dark:text-white">
              Filtering by: <Text className="font-bold">{selectedAccount.name}</Text>
            </Text>
          </View>
          <Pressable
            onPress={() => selectAccount(null)}
            hitSlop={8}
            className="flex-row items-center gap-1 active:opacity-70"
          >
            <Text className="text-xs font-bold text-[#AB9FF2]">Show All</Text>
            <SymbolView
              name={{ ios: 'xmark', android: 'close', web: 'close' }}
              size={12}
              tintColor="#AB9FF2"
            />
          </Pressable>
        </View>
      )}

      {/* Vertically Stacked Cards List */}
      <View className="gap-3">
        {activeAccounts.map((account) => {
          const balance = getAccountBalance(account.id);
          const monthlyExpense = calculateExpenses(transactions, account.id);
          const isSelected = selectedAccountId === account.id;

          return (
            <AccountCard
              key={account.id}
              account={account}
              balance={balance}
              monthlyExpense={monthlyExpense}
              isSelected={isSelected}
              onSelect={() => {
                if (isSelected) {
                  selectAccount(null);
                } else {
                  selectAccount(account.id);
                }
              }}
            />
          );
        })}

        {activeAccounts.length === 0 && (
          <View className="p-6 rounded-2xl items-center justify-center bg-[#f5f5f5] dark:bg-[#1C1C1E]">
            <Text className="text-sm text-center text-neutral-500 dark:text-neutral-400">
              No accounts added yet. Tap &apos;New&apos; to create an account.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
