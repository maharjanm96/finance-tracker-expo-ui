import { SymbolView } from "expo-symbols";
import { useMemo, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AddTransactionModal } from "@/components/add-transaction-modal";
import {
  BlurTargetView,
  BlurredStatusBar,
} from "@/components/blurred-status-bar";
import { TransactionDetailsModal } from "@/components/transaction-details-modal";
import { TransactionItem } from "@/components/transaction-item";
import { BottomTabInset, MaxContentWidth } from "@/constants/theme";
import { useExpense } from "@/context/expense-context";
import { useAppTheme } from "@/context/theme-context";
import { Transaction, TransactionType } from "@/domain/types";

type FilterType = "all" | TransactionType;

interface TransactionsScreenProps {
  externalSearchQuery?: string;
  onOpenAddTransaction?: () => void;
}

export default function TransactionsScreen({
  externalSearchQuery,
  onOpenAddTransaction,
}: TransactionsScreenProps = {}) {
  const insets = useSafeAreaInsets();
  const { isDark } = useAppTheme();
  const { transactions, accounts, selectedAccountId, selectAccount } =
    useExpense();

  const [scrollY] = useState(() => new Animated.Value(0));
  const blurTargetRef = useRef<View | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const effectiveSearch = (externalSearchQuery !== undefined ? externalSearchQuery : searchQuery).trim();

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // 1. Account filter
      if (selectedAccountId) {
        const matchesAccount =
          tx.sourceAccountId === selectedAccountId ||
          tx.destinationAccountId === selectedAccountId;
        if (!matchesAccount) return false;
      }

      // 2. Type filter
      if (filterType !== "all" && tx.type !== filterType) {
        return false;
      }

      // 3. Search query
      if (effectiveSearch.length > 0) {
        const query = effectiveSearch.toLowerCase().trim();
        const matchesTitle = tx.title.toLowerCase().includes(query);
        const matchesCategory = tx.category.toLowerCase().includes(query);
        const matchesNote = tx.note?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesCategory && !matchesNote) return false;
      }

      return true;
    });
  }, [transactions, selectedAccountId, filterType, effectiveSearch]);

  // Group by date
  const groupedTransactions = useMemo(() => {
    const groups: { date: string; items: Transaction[] }[] = [];
    filteredTransactions.forEach((tx) => {
      const existing = groups.find((g) => g.date === tx.date);
      if (existing) {
        existing.items.push(tx);
      } else {
        groups.push({ date: tx.date, items: [tx] });
      }
    });
    return groups;
  }, [filteredTransactions]);

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
            {/* Header */}
            <View style={styles.headerRow}>
              <View>
                <Text
                  style={[
                    styles.headerSubtitle,
                    isDark
                      ? styles.textSecondaryDark
                      : styles.textSecondaryLight,
                  ]}
                >
                  LEDGER & HISTORY
                </Text>
                <Text
                  style={[
                    styles.headerTitle,
                    isDark ? styles.textPrimaryDark : styles.textPrimaryLight,
                  ]}
                >
                  Transactions
                </Text>
              </View>

              <Pressable
                onPress={() => setShowAddModal(true)}
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

            {/* Search Input Bar */}
            <View
              style={[
                styles.searchBar,
                isDark ? styles.cardDark : styles.cardLight,
              ]}
            >
              <SymbolView
                name={{
                  ios: "magnifyingglass",
                  android: "search",
                  web: "search",
                }}
                size={18}
                tintColor="#8E8E93"
              />
              <TextInput
                value={externalSearchQuery !== undefined ? externalSearchQuery : searchQuery}
                onChangeText={(val) => {
                  setSearchQuery(val);
                }}
                placeholder="Search transactions, notes..."
                placeholderTextColor="#8E8E93"
                style={[
                  styles.searchInput,
                  isDark ? styles.textPrimaryDark : styles.textPrimaryLight,
                ]}
              />
              {effectiveSearch.length > 0 && (
                <Pressable
                  onPress={() => {
                    setSearchQuery("");
                  }}
                  hitSlop={8}
                >
                  <SymbolView
                    name={{
                      ios: "xmark.circle.fill",
                      android: "cancel",
                      web: "cancel",
                    }}
                    size={16}
                    tintColor="#8E8E93"
                  />
                </Pressable>
              )}
            </View>

            {/* Type Filter Chips (All, Expense, Income, Transfer) */}
            <View style={styles.filterRow}>
              {(["all", "expense", "income", "transfer"] as FilterType[]).map(
                (ft) => {
                  const isSelected = filterType === ft;
                  const label =
                    ft === "all"
                      ? "All"
                      : ft === "expense"
                        ? "Expenses"
                        : ft === "income"
                          ? "Income"
                          : "Transfers";

                  return (
                    <Pressable
                      key={ft}
                      onPress={() => setFilterType(ft)}
                      style={[
                        styles.filterChip,
                        isDark ? styles.chipDark : styles.chipLight,
                        isSelected &&
                          (isDark
                            ? styles.chipSelectedDark
                            : styles.chipSelectedLight),
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          isSelected
                            ? isDark
                              ? styles.chipTextSelectedDark
                              : styles.chipTextSelectedLight
                            : isDark
                              ? styles.chipTextInactiveDark
                              : styles.chipTextInactiveLight,
                        ]}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  );
                },
              )}
            </View>

            {/* Account Selector Chips */}
            <View style={styles.accountFilterWrap}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.accountChipsScroll}
              >
                <Pressable
                  onPress={() => selectAccount(null)}
                  style={[
                    styles.accountChip,
                    isDark ? styles.chipDark : styles.chipLight,
                    selectedAccountId === null &&
                      (isDark
                        ? styles.chipSelectedDark
                        : styles.chipSelectedLight),
                  ]}
                >
                  <Text
                    style={[
                      styles.accountChipText,
                      selectedAccountId === null
                        ? isDark
                          ? styles.chipTextSelectedDark
                          : styles.chipTextSelectedLight
                        : isDark
                          ? styles.chipTextInactiveDark
                          : styles.chipTextInactiveLight,
                    ]}
                  >
                    All Accounts
                  </Text>
                </Pressable>

                {accounts.map((acc) => {
                  const isSelected = selectedAccountId === acc.id;
                  return (
                    <Pressable
                      key={acc.id}
                      onPress={() => selectAccount(acc.id)}
                      style={[
                        styles.accountChip,
                        isDark ? styles.chipDark : styles.chipLight,
                        isSelected &&
                          (isDark
                            ? styles.chipSelectedDark
                            : styles.chipSelectedLight),
                      ]}
                    >
                      <Text
                        style={[
                          styles.accountChipText,
                          isSelected
                            ? isDark
                              ? styles.chipTextSelectedDark
                              : styles.chipTextSelectedLight
                            : isDark
                              ? styles.chipTextInactiveDark
                              : styles.chipTextInactiveLight,
                        ]}
                      >
                        {acc.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Date-Grouped Transaction List */}
            {groupedTransactions.length === 0 ? (
              <View
                style={[
                  styles.emptyContainer,
                  isDark ? styles.cardDark : styles.cardLight,
                ]}
              >
                <SymbolView
                  name={{
                    ios: "doc.text.magnifyingglass",
                    android: "find_in_page",
                    web: "find_in_page",
                  }}
                  size={36}
                  tintColor="#8E8E93"
                />
                <Text
                  style={[
                    styles.emptyTitle,
                    isDark ? styles.textPrimaryDark : styles.textPrimaryLight,
                  ]}
                >
                  No Transactions Found
                </Text>
                <Text
                  style={[
                    styles.emptySubtitle,
                    isDark
                      ? styles.textSecondaryDark
                      : styles.textSecondaryLight,
                  ]}
                >
                  Try clearing your search query or switching your account
                  filter.
                </Text>
              </View>
            ) : (
              groupedTransactions.map((group) => (
                <View key={group.date} style={styles.dateGroup}>
                  <Text
                    style={[
                      styles.dateGroupLabel,
                      isDark
                        ? styles.textSecondaryDark
                        : styles.textSecondaryLight,
                    ]}
                  >
                    {group.date.toUpperCase()}
                  </Text>
                  <View
                    style={[
                      styles.tableContainer,
                      isDark ? styles.cardDark : styles.cardLight,
                    ]}
                  >
                    {group.items.map((tx, idx) => (
                      <TransactionItem
                        key={tx.id}
                        transaction={tx}
                        onPress={() => setSelectedTx(tx)}
                        showDivider={idx < group.items.length - 1}
                      />
                    ))}
                  </View>
                </View>
              ))
            )}
          </View>
        </Animated.ScrollView>
      </BlurTargetView>

      {/* Top Status Bar */}
      <BlurredStatusBar blurTarget={blurTargetRef} scrollY={scrollY} />

      {/* Add Transaction Modal */}
      <AddTransactionModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
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
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  headerTitle: {
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
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: 16,
    paddingHorizontal: 14,
    gap: 10,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  accountFilterWrap: {
    marginTop: -4,
  },
  accountChipsScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  accountChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
  },
  accountChipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  chipDark: {
    backgroundColor: "#1C1C1E",
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  chipLight: {
    backgroundColor: "#f5f5f5ff",
    borderColor: "rgba(0, 0, 0, 0)",
  },
  chipSelectedDark: {
    backgroundColor: "#AB9FF2",
    borderColor: "#AB9FF2",
  },
  chipSelectedLight: {
    backgroundColor: "#AB9FF2",
    borderColor: "#AB9FF2",
  },
  chipTextSelectedDark: {
    color: "#000000",
    fontWeight: "700",
  },
  chipTextSelectedLight: {
    color: "#000000",
    fontWeight: "700",
  },
  chipTextInactiveDark: {
    color: "#8E8E93",
  },
  chipTextInactiveLight: {
    color: "#6C6C70",
  },
  dateGroup: {
    gap: 8,
    marginTop: 6,
  },
  dateGroupLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    paddingHorizontal: 4,
  },
  tableContainer: {
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    borderRadius: 22,
    borderWidth: 1,
    gap: 10,
    marginTop: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: "center",
    maxWidth: 260,
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
