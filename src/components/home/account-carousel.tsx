import { SymbolView } from "expo-symbols";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { useExpense } from "@/context/expense-context";
import { useAppTheme } from "@/context/theme-context";
import { Account } from "@/domain/types";
import { AccountCard } from "./account-card";

interface AccountCarouselProps {
  onAddAccount?: () => void;
  onManageAccounts?: () => void;
}

const CARD_WIDTH = 308;
const CARD_GAP = 12;

export function AccountCarousel({
  onAddAccount,
  onManageAccounts,
}: AccountCarouselProps) {
  const { isDark } = useAppTheme();
  const {
    accounts,
    selectedAccountId,
    selectedAccount,
    selectAccount,
    getAccountBalance,
    combinedBalance,
  } = useExpense();

  const activeAccounts = accounts.filter((a) => !a.isArchived);

  // Synthetic Combined Account Card representation
  const combinedAccount: Account = {
    id: "all-accounts-combined",
    name: "All Accounts",
    type: "savings",
    openingBalance: combinedBalance,
    institution: `Combined • ${activeAccounts.length} Connected Accounts`,
  };

  return (
    <View className="gap-3 w-full">
      {/* ─── Carousel Header ─── */}
      <View className="flex-row items-center justify-between px-0.5">
        <View className="flex-row items-center gap-2">
          <Text className="text-xs font-bold tracking-wider uppercase text-text-secondary-light dark:text-text-secondary-dark">
            YOUR CARDS & ACCOUNTS
          </Text>
          <View className="px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10">
            <Text className="text-[11px] font-bold text-text-secondary-light dark:text-text-secondary-dark">
              {activeAccounts.length}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          {selectedAccount && (
            <Pressable
              onPress={() => selectAccount(null)}
              hitSlop={8}
              className="flex-row items-center gap-1 px-2.5 py-1 rounded-full bg-brand-perano/15 active:opacity-70"
            >
              <Text className="text-[11px] font-bold text-brand-dark-purple dark:text-brand-perano">
                Show All
              </Text>
              <SymbolView
                name={{ ios: "xmark", android: "close", web: "close" }}
                size={11}
                tintColor="#AB9FF2"
              />
            </Pressable>
          )}

          {onAddAccount && (
            <Pressable
              onPress={onAddAccount}
              hitSlop={8}
              className="flex-row items-center gap-1 px-2.5 py-1.5 rounded-xl bg-card-light dark:bg-card-dark border border-black/5 dark:border-white/10 active:opacity-70 shadow-2xs"
            >
              <SymbolView
                name={{ ios: "plus", android: "add", web: "add" }}
                size={13}
                tintColor={isDark ? "#E4E5EB" : "#1E1F24"}
              />
              <Text className="text-xs font-semibold text-text-primary-light dark:text-text-primary-dark">
                New
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* ─── Horizontal Swipeable Card Carousel with Full Edge Bleed ─── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="-mx-4"
        contentContainerStyle={{
          paddingHorizontal: 16,
          gap: CARD_GAP,
        }}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + CARD_GAP}
        snapToAlignment="start"
      >
        {/* 1. Default Combined Portfolio Card */}
        <AccountCard
          account={combinedAccount}
          balance={combinedBalance}
          isSelected={selectedAccountId === null}
          onSelect={() => selectAccount(null)}
          width={CARD_WIDTH}
          isCombined
        />

        {/* 2. Individual Connected Account Cards */}
        {activeAccounts.map((account) => {
          const balance = getAccountBalance(account.id);
          const isSelected = selectedAccountId === account.id;

          return (
            <AccountCard
              key={account.id}
              account={account}
              balance={balance}
              isSelected={isSelected}
              onSelect={() => {
                if (isSelected) {
                  selectAccount(null);
                } else {
                  selectAccount(account.id);
                }
              }}
              width={CARD_WIDTH}
            />
          );
        })}

        {/* 3. Add Account End-Card */}
        {onAddAccount && (
          <Pressable
            onPress={onAddAccount}
            className="w-[140px] rounded-[24px] border-2 border-dashed border-black/15 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.02] items-center justify-center p-4 active:opacity-70"
            style={{ height: 195 }}
            accessibilityRole="button"
            accessibilityLabel="Add new account"
          >
            <View className="w-11 h-11 rounded-full bg-brand-perano/15 items-center justify-center mb-2">
              <SymbolView
                name={{ ios: "plus", android: "add", web: "add" }}
                size={20}
                tintColor="#AB9FF2"
              />
            </View>
            <Text className="text-xs font-bold text-center text-text-primary-light dark:text-text-primary-dark">
              Add Card
            </Text>
            <Text className="text-[10px] text-center text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
              Connect account
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}
