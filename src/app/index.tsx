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

import { AddTransactionModal } from "@/components/add-transaction-modal";
import { BlurTargetView } from "@/components/blurred-status-bar";
import { CreateAccountModal } from "@/components/create-account-modal";
import { MonthlySummary } from "@/components/home/monthly-summary";
import { OnboardingSetup } from "@/components/onboarding-setup";
import { TransactionDetailsModal } from "@/components/transaction-details-modal";
import { TransactionItem } from "@/components/transaction-item";
import { MaxContentWidth } from "@/constants/theme";
import { useExpense } from "@/context/expense-context";
import { useAppTheme } from "@/context/theme-context";
import { Transaction, TransactionType } from "@/domain/types";

interface HomeScreenProps {
  onNavigateToTab?: (tabIndex: number) => void;
  onOpenAddTransaction?: () => void;
}

export default function HomeScreen({ onNavigateToTab }: HomeScreenProps = {}) {
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
      className="flex-1 bg-bg-light dark:bg-bg-dark"
      style={styles.screen}
    >
      <BlurTargetView ref={blurTargetRef} style={styles.blurTarget}>
        <Animated.ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: 8,
              paddingBottom: 110,
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
            {/* ─── 1. Monthly Financial Snapshot Hero ─── */}
            <MonthlySummary />

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
                    onPress={() => {
                      if (onNavigateToTab) {
                        onNavigateToTab(1);
                      } else {
                        router.push("/transactions" as never);
                      }
                    }}
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
      {/* <BlurredStatusBar blurTarget={blurTargetRef} scrollY={scrollY} /> */}

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
    backgroundColor: "#202227",
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  cardLight: {
    backgroundColor: "#F5F5F5",
    borderColor: "rgba(0, 0, 0, 0)",
  },
  textPrimaryDark: {
    color: "#E4E5EB",
  },
  textPrimaryLight: {
    color: "#1E1F24",
  },
  textSecondaryDark: {
    color: "#989BA5",
  },
  textSecondaryLight: {
    color: "#6C6C70",
  },
});
