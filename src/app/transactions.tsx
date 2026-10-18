import { SymbolView } from "expo-symbols";
import { useMemo, useRef, useState } from "react";
import { Animated, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AddTransactionModal } from "@/components/add-transaction-modal";
import { BlurTargetView } from "@/components/blurred-status-bar";
import { getTopHeaderPadding } from "@/components/navigation/top-chip-header";
import { TransactionDetailsModal } from "@/components/transaction-details-modal";
import { TransactionItem } from "@/components/transaction-item";
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

  const topHeaderPadding = getTopHeaderPadding(insets.top);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const effectiveSearch = (
    externalSearchQuery !== undefined ? externalSearchQuery : searchQuery
  ).trim();

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
    <View className="flex-1 bg-bg-light dark:bg-bg-dark">
      <BlurTargetView ref={blurTargetRef} style={{ flex: 1 }}>
        <Animated.ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingTop: topHeaderPadding,
            paddingBottom: 110,
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
          <View className="w-full max-w-[800px] px-4 gap-4">
            {/* Header */}
            <View className="pt-2">
              <Text className="text-[12px] font-bold tracking-wider text-text-secondary-light dark:text-text-secondary-dark uppercase">
                LEDGER & HISTORY
              </Text>
              <Text className="text-3xl font-extrabold tracking-tight text-text-light dark:text-text-dark">
                Transactions
              </Text>
            </View>

            {/* Type Filter Chips (All, Expense, Income, Transfer) */}
            <View className="flex-row h-11 rounded-2xl bg-card-light dark:bg-card-dark p-1 border border-black/5 dark:border-white/5 gap-1">
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
                      className={`flex-1 rounded-xl items-center justify-center active:opacity-80 ${
                        isSelected ? "bg-brand-perano" : ""
                      }`}
                    >
                      <Text
                        className={`text-[13px] font-bold ${
                          isSelected
                            ? "text-brand-dark-purple"
                            : isDark
                              ? "text-text-secondary-dark"
                              : "text-text-secondary-light"
                        }`}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  );
                },
              )}
            </View>

            {/* Account Selector Chips */}
            <View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                <Pressable
                  onPress={() => selectAccount(null)}
                  className={`px-4 py-2 rounded-full border active:opacity-80 ${
                    selectedAccountId === null
                      ? "bg-brand-perano border-brand-perano"
                      : isDark
                        ? "bg-chip-dark border-white/5"
                        : "bg-chip-light border-black/5"
                  }`}
                >
                  <Text
                    className={`text-[13px] font-bold ${
                      selectedAccountId === null
                        ? "text-brand-dark-purple"
                        : isDark
                          ? "text-text-secondary-dark"
                          : "text-text-secondary-light"
                    }`}
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
                      className={`px-4 py-2 rounded-full border active:opacity-80 ${
                        isSelected
                          ? "bg-brand-perano border-brand-perano"
                          : isDark
                            ? "bg-chip-dark border-white/5"
                            : "bg-chip-light border-black/5"
                      }`}
                    >
                      <Text
                        className={`text-[13px] font-bold ${
                          isSelected
                            ? "text-brand-dark-purple"
                            : isDark
                              ? "text-text-secondary-dark"
                              : "text-text-secondary-light"
                        }`}
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
              <View className="p-8 rounded-3xl bg-card-light dark:bg-card-dark border border-black/5 dark:border-white/5 items-center justify-center gap-2.5 my-4">
                <SymbolView
                  name={{
                    ios: "doc.text.magnifyingglass",
                    android: "find_in_page",
                    web: "find_in_page",
                  }}
                  size={36}
                  tintColor={isDark ? "#989BA5" : "#8E8E93"}
                />
                <Text className="text-[17px] font-bold text-text-light dark:text-text-dark">
                  No Transactions Found
                </Text>
                <Text className="text-[14px] text-center text-text-secondary-light dark:text-text-secondary-dark max-w-[280px]">
                  Try clearing your search query or switching your account
                  filter.
                </Text>
              </View>
            ) : (
              groupedTransactions.map((group) => (
                <View key={group.date} className="gap-2">
                  <Text className="text-[12px] font-bold tracking-wider text-text-secondary-light dark:text-text-secondary-dark uppercase px-1">
                    {group.date.toUpperCase()}
                  </Text>
                  <View className="rounded-3xl bg-card-light dark:bg-card-dark border border-black/5 dark:border-white/5 overflow-hidden">
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
