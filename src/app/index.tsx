import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AddTransactionModal } from "@/components/add-transaction-modal";
import {
  BlurTargetView,
  BlurredStatusBar,
} from "@/components/blurred-status-bar";
import { CreateAccountModal } from "@/components/create-account-modal";
import { AccountStack } from "@/components/home/account-stack";
import { MonthlySummary } from "@/components/home/monthly-summary";
import { OnboardingSetup } from "@/components/onboarding-setup";
import { TransactionDetailsModal } from "@/components/transaction-details-modal";
import { TransactionItem } from "@/components/transaction-item";
import { BottomTabInset, MaxContentWidth } from "@/constants/theme";
import { useExpense } from "@/context/expense-context";
import { useAppTheme } from "@/context/theme-context";
import { Transaction, TransactionType } from "@/domain/types";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDark } = useAppTheme();

  const { profile, scopedTransactions, selectedAccount } = useExpense();
  const [scrollY] = useState(() => new Animated.Value(0));
  const blurTargetRef = useRef<View | null>(null);

  const [modalType, setModalType] = useState<TransactionType | null>(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const recentItems = scopedTransactions.slice(0, 5);

  return (
    <View
      style={[styles.screen, isDark ? styles.screenDark : styles.screenLight]}
    >
      <BlurTargetView ref={blurTargetRef} style={styles.blurTarget}>
        <Animated.ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + (Platform.OS === "ios" ? 14 : 24),
              paddingBottom: insets.bottom + BottomTabInset + 44,
            },
          ]}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true },
          )}
        >
          <View style={styles.contentWrapper}>
            {/* ─── Top Header Bar ─── */}
            <View style={styles.headerRow}>
              <View>
                <Text
                  style={[
                    styles.dateText,
                    isDark
                      ? styles.textSecondaryDark
                      : styles.textSecondaryLight,
                  ]}
                >
                  {currentDate.toUpperCase()}
                </Text>
                <Text
                  style={[
                    styles.greetingText,
                    isDark ? styles.textPrimaryDark : styles.textPrimaryLight,
                  ]}
                >
                  Hello, {profile.name || "there"}
                </Text>
              </View>

              <Pressable
                onPress={() => setModalType("expense")}
                style={({ pressed }) => [
                  styles.addBtnCircle,
                  isDark ? styles.addBtnDark : styles.addBtnLight,
                  pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] },
                ]}
              >
                <SymbolView
                  name={{ ios: "plus", android: "add", web: "add" }}
                  size={18}
                  tintColor="#000000"
                />
              </Pressable>
            </View>

            {/* ─── 1. Monthly Financial Snapshot Hero ─── */}
            <MonthlySummary />

            {/* ─── 2. Quick Actions: Expense, Income, Transfer ─── */}
            {/* <QuickActions onSelectAction={(type) => setModalType(type)} /> */}

            {/* ─── 3. Vertically Stacked Account Cards ─── */}
            <AccountStack onAddAccount={() => setShowAccountModal(true)} />

            {/* ─── 4. Scoped Recent Transactions ─── */}
            <View style={styles.sectionWrap}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text
                    style={[
                      styles.sectionTitle,
                      isDark
                        ? styles.textSecondaryDark
                        : styles.textSecondaryLight,
                    ]}
                  >
                    RECENT ACTIVITY
                  </Text>
                  {selectedAccount && (
                    <Text
                      style={[
                        styles.accountFilterBadge,
                        { color: "#AB9FF2" },
                        { fontSize: 12 },
                      ]}
                    >
                      Filtered by {selectedAccount.name}
                    </Text>
                  )}
                </View>

                {scopedTransactions.length > 0 && (
                  <Pressable
                    onPress={() => router.push("/transactions" as never)}
                    hitSlop={8}
                    style={({ pressed }) => [
                      styles.seeAllBtn,
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.seeAllText,
                        { color: "#AB9FF2" },
                        { fontSize: 14 },
                      ]}
                    >
                      See all
                    </Text>
                    <SymbolView
                      name={{
                        ios: "chevron.right",
                        android: "chevron_right",
                        web: "chevron_right",
                      }}
                      size={16}
                      tintColor="#AB9FF2"
                    />
                  </Pressable>
                )}
              </View>

              <View
                style={[
                  styles.tableContainer,
                  isDark ? styles.cardDark : styles.cardLight,
                ]}
              >
                {recentItems.length === 0 ? (
                  <View style={styles.emptyState}>
                    <SymbolView
                      name={{ ios: "tray", android: "inbox", web: "inbox" }}
                      size={32}
                      tintColor="#8E8E93"
                    />
                    <Text
                      style={[
                        styles.emptyStateText,
                        isDark
                          ? styles.textSecondaryDark
                          : styles.textSecondaryLight,
                      ]}
                    >
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

      {/* Top Scroll-Reactive Blurred Status Bar */}
      <BlurredStatusBar blurTarget={blurTargetRef} scrollY={scrollY} />

      {/* Initial 2-Step Onboarding Modal */}
      <OnboardingSetup />

      {/* Slide-Up Transaction Modal (Expense, Income, Transfer) */}
      <AddTransactionModal
        visible={modalType !== null}
        initialType={modalType ?? "expense"}
        onClose={() => setModalType(null)}
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  screenDark: {
    backgroundColor: "#000000",
  },
  screenLight: {
    backgroundColor: "#FFFFFF",
  },
  blurTarget: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  contentWrapper: {
    width: "100%",
    maxWidth: MaxContentWidth,
    gap: 22,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  dateText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  greetingText: {
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.6,
    marginTop: 2,
  },
  addBtnCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#AB9FF2",
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  addBtnDark: {
    backgroundColor: "#AB9FF2",
  },
  addBtnLight: {
    backgroundColor: "#AB9FF2",
  },
  sectionWrap: {
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  accountFilterBadge: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  seeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: "700",
  },
  tableContainer: {
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
  },
  emptyState: {
    padding: 36,
    alignItems: "center",
    gap: 10,
  },
  emptyStateText: {
    fontSize: 15,
    fontWeight: "500",
  },
  cardDark: {
    backgroundColor: "#121214",
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  cardLight: {
    backgroundColor: "#f5f5f5ff",
    borderColor: "rgba(0, 0, 0, 0)",
  },
  textPrimaryDark: {
    color: "#FFFFFF",
  },
  textPrimaryLight: {
    color: "#000000",
  },
  textSecondaryDark: {
    color: "#8E8E93",
  },
  textSecondaryLight: {
    color: "#6C6C70",
  },
});
