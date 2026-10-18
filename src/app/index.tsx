import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useRef, useState } from "react";
import { Animated, Image, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AddTransactionModal } from "@/components/add-transaction-modal";
import { BlurTargetView } from "@/components/blurred-status-bar";
import { CreateAccountModal } from "@/components/create-account-modal";
import { CurrencyPickerModal } from "@/components/currency-picker-modal";
import { AccountCarousel } from "@/components/home/account-carousel";
import { MonthlySummary } from "@/components/home/monthly-summary";
import { AccountSelectorSheet } from "@/components/navigation/account-selector-sheet";
import { getTopHeaderPadding } from "@/components/navigation/top-chip-header";
import { OnboardingSetup } from "@/components/onboarding-setup";
import { TransactionDetailsModal } from "@/components/transaction-details-modal";
import { TransactionItem } from "@/components/transaction-item";
import { useExpense } from "@/context/expense-context";
import { useAppTheme } from "@/context/theme-context";
import { Transaction, TransactionType } from "@/domain/types";

interface HomeScreenProps {
  onNavigateToTab?: (tabIndex: number) => void;
  onOpenAddTransaction?: () => void;
  onPressWallet?: () => void;
}

export default function HomeScreen({ onNavigateToTab }: HomeScreenProps = {}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useAppTheme();

  const { profile, scopedTransactions, selectedAccount, currencyInfo } =
    useExpense();
  const [scrollY] = useState(() => new Animated.Value(0));
  const blurTargetRef = useRef<View | null>(null);

  const topHeaderPadding = getTopHeaderPadding(insets.top);

  const [modalType, setModalType] = useState<TransactionType | null>(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const recentItems = scopedTransactions.slice(0, 5);

  return (
    <View className="flex-1 bg-bg-light dark:bg-bg-dark">
      <BlurTargetView ref={blurTargetRef} style={{ flex: 1 }}>
        <Animated.ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingTop: topHeaderPadding,
            paddingBottom: 140,
            alignItems: "center",
          }}
          scrollIndicatorInsets={{ top: topHeaderPadding, bottom: 90 }}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true },
          )}
        >
          <View className="w-full max-w-200 px-4 gap-5">
            {/* Top Bar: Clean Title & Global Functional Currency Flag Pill */}
            <View className="flex-row items-center justify-between mt-2 px-0.5">
              <View>
                <Text className="text-2xl font-extrabold tracking-tight text-text-light dark:text-text-dark">
                  Hello,
                </Text>
                <Text className="text-3xl font-black tracking-tight text-text-light dark:text-text-dark">
                  {profile.name}
                </Text>
                <Text className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
                  {selectedAccount
                    ? `Filtering • ${selectedAccount.name}`
                    : "Overview • All Accounts"}
                </Text>
              </View>

              {/* Functional Global Currency Flag Pill */}
              <Pressable
                hitSlop={8}
                onPress={() => setShowCurrencyModal(true)}
                className="flex-row items-center gap-1.5 px-2.5 py-3 rounded-full bg-card-light dark:bg-card-dark border border-black/5 dark:border-white/10 active:opacity-75 shadow-2xs"
                accessibilityRole="button"
                accessibilityLabel={`Current currency: ${currencyInfo.code}. Tap to change`}
              >
                <View className="w-4.5 h-4.5 rounded-full overflow-hidden bg-black/5 dark:bg-white/10 items-center justify-center shrink-0">
                  <Image
                    source={currencyInfo.flag}
                    className="w-4.5 h-4.5 rounded-full"
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

            {/* ─── 1. Horizontal Account Card Carousel ─── */}
            <AccountCarousel onAddAccount={() => setShowAccountModal(true)} />

            {/* ─── 2. Monthly Financial Snapshot Hero ─── */}
            <MonthlySummary />

            {/* ─── 3. Scoped Recent Transactions ─── */}
            <View className="gap-2.5">
              <View className="flex-row items-center justify-between px-1">
                <View>
                  <Text className="text-[12px] font-bold tracking-wider text-text-secondary-light dark:text-text-secondary-dark uppercase">
                    RECENT ACTIVITY
                  </Text>
                  {selectedAccount && (
                    <Text className="text-[11px] font-semibold text-[#AB9FF2] mt-0.5">
                      Filtered by {selectedAccount.name}
                    </Text>
                  )}
                </View>

                {scopedTransactions.length > 0 && (
                  <Pressable
                    onPress={() => {
                      if (onNavigateToTab) {
                        onNavigateToTab(1);
                      } else {
                        router.push("/transactions" as never);
                      }
                    }}
                    hitSlop={8}
                    className="flex-row items-center gap-1 active:opacity-70"
                  >
                    <Text className="text-[13px] font-bold text-[#AB9FF2]">
                      See all
                    </Text>
                    <SymbolView
                      name={{
                        ios: "chevron.right",
                        android: "chevron_right",
                        web: "chevron_right",
                      }}
                      size={14}
                      tintColor="#AB9FF2"
                    />
                  </Pressable>
                )}
              </View>

              <View className="rounded-3xl bg-card-light dark:bg-card-dark border border-black/5 dark:border-white/5 overflow-hidden">
                {recentItems.length === 0 ? (
                  <View className="items-center justify-center p-8 gap-2.5">
                    <SymbolView
                      name={{ ios: "tray", android: "inbox", web: "inbox" }}
                      size={32}
                      tintColor={isDark ? "#989BA5" : "#8E8E93"}
                    />
                    <Text className="text-[15px] font-medium text-text-secondary-light dark:text-text-secondary-dark">
                      No recent activity recorded
                    </Text>
                  </View>
                ) : (
                  recentItems.map((tx, idx) => (
                    <TransactionItem
                      key={tx.id}
                      transaction={tx}
                      onPress={() => setSelectedTx(tx)}
                      showDivider={idx < recentItems.length - 1}
                    />
                  ))
                )}
              </View>
            </View>
          </View>
        </Animated.ScrollView>
      </BlurTargetView>

      {/* Initial 2-Step Onboarding Modal */}
      <OnboardingSetup />

      {/* Slide-Up Transaction Modal (Expense, Income, Transfer) */}
      <AddTransactionModal
        visible={modalType !== null}
        initialType={modalType ?? "expense"}
        onClose={() => setModalType(null)}
      />

      {/* Account Selector Sheet */}
      <AccountSelectorSheet
        visible={showAccountSelector}
        onClose={() => setShowAccountSelector(false)}
        onOpenCreateAccount={() => setShowAccountModal(true)}
      />

      {/* Create Account Modal */}
      <CreateAccountModal
        visible={showAccountModal}
        onClose={() => setShowAccountModal(false)}
      />

      {/* Transaction Details Bottom Modal */}
      <TransactionDetailsModal
        visible={selectedTx !== null}
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
      />

      {/* Currency Picker Modal */}
      <CurrencyPickerModal
        visible={showCurrencyModal}
        onClose={() => setShowCurrencyModal(false)}
      />
    </View>
  );
}
