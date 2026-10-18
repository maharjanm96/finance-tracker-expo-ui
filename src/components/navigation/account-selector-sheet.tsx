import { BottomSheet, RNHostView } from "@expo/ui";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

import { CurrencyPickerModal } from "@/components/currency-picker-modal";
import { AppButton } from "@/components/ui/app-button";
import { getAccountTypeIcon } from "@/constants/account-types";
import { getCurrencyInfo } from "@/constants/currencies";
import { useExpense } from "@/context/expense-context";
import { useAppTheme } from "@/context/theme-context";
import { formatCurrency } from "@/domain/formatters";

interface AccountSelectorSheetProps {
  visible: boolean;
  onClose: () => void;
  onOpenCreateAccount?: () => void;
}

export function AccountSelectorSheet({
  visible,
  onClose,
  onOpenCreateAccount,
}: AccountSelectorSheetProps) {
  const { isDark } = useAppTheme();
  const {
    profile,
    accounts,
    selectedAccountId,
    selectAccount,
    getAccountBalance,
    combinedBalance,
  } = useExpense();

  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const currencyInfo = getCurrencyInfo(profile.currency);
  const activeAccounts = accounts.filter((a) => !a.isArchived);

  return (
    <>
      <BottomSheet
        isPresented={visible}
        onDismiss={onClose}
        snapPoints={["half", "full"]}
        showDragIndicator
        containerColor={isDark ? "#18191D" : "#FFFFFF"}
        contentPadding={0}
      >
        <RNHostView matchContents={false}>
          <View className="flex-1 bg-surface-light dark:bg-surface-dark px-5 pt-3 pb-8">
            {/* Header with Title & Currency Flag Pill */}
            <View className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center gap-2.5">
                <Text className="text-xl font-bold tracking-tight text-text-light dark:text-text-dark">
                  Select Account
                </Text>
                {/* Currency Flag Pill */}
                <Pressable
                  hitSlop={8}
                  onPress={() => setShowCurrencyModal(true)}
                  className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/5 dark:bg-chip-dark border border-black/5 dark:border-white/10 active:opacity-75"
                  accessibilityRole="button"
                  accessibilityLabel={`Currency: ${currencyInfo.code}. Tap to change`}
                >
                  <View className="w-4 h-4 rounded-full overflow-hidden bg-black/5 dark:bg-white/10 items-center justify-center">
                    <Image
                      source={currencyInfo.flag}
                      className="w-4 h-4 rounded-full"
                      resizeMode="cover"
                    />
                  </View>
                  <Text className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark">
                    {currencyInfo.code}
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
                  tintColor={isDark ? "#989BA5" : "#AEAEB2"}
                />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ gap: 10, paddingVertical: 10 }}
            >
              {/* 1. All Accounts Combined Option */}
              <Pressable
                onPress={() => {
                  selectAccount(null);
                  onClose();
                }}
                className={`p-4 rounded-2xl border-[1.5px] flex-row items-center justify-between ${
                  selectedAccountId === null
                    ? "bg-brand-perano/15 border-brand-perano"
                    : "bg-card-light dark:bg-card-dark border-transparent"
                } active:opacity-80`}
              >
                <View className="flex-row items-center gap-3 flex-1 mr-3">
                  <View className="w-10 h-10 rounded-full bg-brand-perano/20 items-center justify-center shrink-0">
                    <SymbolView
                      name={{
                        ios: "wallet.pass.fill",
                        android: "account_balance_wallet",
                        web: "account_balance_wallet",
                      }}
                      size={20}
                      tintColor="#AB9FF2"
                    />
                  </View>
                  <View className="flex-1">
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      className="text-base font-bold text-text-light dark:text-text-dark"
                    >
                      All (Combined Account)
                    </Text>
                    <Text className="text-[13px] font-medium text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
                      {activeAccounts.length} connected accounts
                    </Text>
                  </View>
                </View>
                <Text className="text-[16px] font-extrabold text-text-light dark:text-text-dark shrink-0">
                  {formatCurrency(combinedBalance, currencyInfo.symbol)}
                </Text>
              </Pressable>

              {/* 2. Individual Accounts */}
              {activeAccounts.map((acc) => {
                const isSelected = selectedAccountId === acc.id;
                const balance = getAccountBalance(acc.id);
                return (
                  <Pressable
                    key={acc.id}
                    onPress={() => {
                      selectAccount(acc.id);
                      onClose();
                    }}
                    className={`p-4 rounded-2xl border-[1.5px] flex-row items-center justify-between ${
                      isSelected
                        ? "bg-brand-perano/15 border-brand-perano"
                        : "bg-card-light dark:bg-card-dark border-transparent"
                    } active:opacity-80`}
                  >
                    <View className="flex-row items-center gap-3 flex-1 mr-3">
                      <View className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 items-center justify-center shrink-0">
                        <SymbolView
                          name={{
                            ios: getAccountTypeIcon(acc.type).ios as any,
                            android: getAccountTypeIcon(acc.type).android,
                            web: getAccountTypeIcon(acc.type).web,
                          }}
                          size={18}
                          tintColor={isDark ? "#E4E5EB" : "#1A1A1E"}
                        />
                      </View>
                      <View className="flex-1">
                        <Text
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          className="text-base font-bold text-text-light dark:text-text-dark"
                        >
                          {acc.name}
                        </Text>
                        <Text className="text-[13px] font-medium text-text-secondary-light dark:text-text-secondary-dark capitalize mt-0.5">
                          {acc.type}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-[15px] font-bold text-text-light dark:text-text-dark shrink-0">
                      {formatCurrency(balance, currencyInfo.symbol)}
                    </Text>
                  </Pressable>
                );
              })}

              {/* 3. New Account Button */}
              <AppButton
                title="Add New Account"
                icon={{
                  ios: "plus",
                  android: "add",
                  web: "add",
                }}
                onPress={() => {
                  onClose();
                  onOpenCreateAccount?.();
                }}
                className="mt-3"
              />
            </ScrollView>
          </View>
        </RNHostView>
      </BottomSheet>

      {/* Currency Picker Modal */}
      <CurrencyPickerModal
        visible={showCurrencyModal}
        onClose={() => setShowCurrencyModal(false)}
      />
    </>
  );
}
