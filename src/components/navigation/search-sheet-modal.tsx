import { BottomSheet, RNHostView } from "@expo/ui";
import { SymbolView } from "expo-symbols";
import { useMemo, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { TransactionDetailsModal } from "@/components/transaction-details-modal";
import { CATEGORY_ICONS, useExpense } from "@/context/expense-context";
import { useAppTheme } from "@/context/theme-context";
import { formatCurrency } from "@/domain/formatters";
import { Transaction } from "@/domain/types";

interface SearchSheetModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SearchSheetModal({ visible, onClose }: SearchSheetModalProps) {
  const { isDark } = useAppTheme();
  const { transactions, accounts } = useExpense();
  const [query, setQuery] = useState("");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Filter or take recents
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Recent transactions (matching Phantom's Recents layout)
      return transactions.slice(0, 8);
    }
    return transactions.filter(
      (tx) =>
        tx.title.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q) ||
        tx.note?.toLowerCase().includes(q),
    );
  }, [transactions, query]);

  const handleSelectTransaction = (tx: Transaction) => {
    Keyboard.dismiss();
    setSelectedTx(tx);
  };

  return (
    <>
      <BottomSheet
        isPresented={visible}
        onDismiss={() => {
          setQuery("");
          onClose();
        }}
        snapPoints={["half", "full"]}
        showDragIndicator
        containerColor={isDark ? "#18191D" : "#FFFFFF"}
        contentPadding={0}
      >
        <RNHostView matchContents={false}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 bg-surface-light dark:bg-surface-dark"
          >
            <View className="flex-1 px-5 pt-2 pb-6">
              {/* Header Row: "Recents" / "Results" + "Clear All" / Close */}
              <View className="flex-row items-center justify-between py-3">
                <Text className="text-xl font-bold tracking-tight text-text-light dark:text-text-dark">
                  {query.trim() ? "Results" : "Recents"}
                </Text>

                {query.trim().length > 0 ? (
                  <Pressable
                    onPress={() => setQuery("")}
                    hitSlop={8}
                    className="py-1 px-2 rounded-lg active:opacity-70"
                  >
                    <Text className="text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                      Clear
                    </Text>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={onClose}
                    hitSlop={8}
                    className="p-1 active:opacity-70"
                  >
                    <SymbolView
                      name={{
                        ios: "xmark.circle.fill",
                        android: "cancel",
                        web: "cancel",
                      }}
                      size={22}
                      tintColor={isDark ? "#989BA5" : "#AEAEB2"}
                    />
                  </Pressable>
                )}
              </View>

              {/* Transactions List */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                className="flex-1"
                contentContainerStyle={{ gap: 10, paddingVertical: 6 }}
              >
                {results.length === 0 ? (
                  <View className="items-center justify-center py-12 gap-2">
                    <SymbolView
                      name={{
                        ios: "magnifyingglass",
                        android: "search",
                        web: "search",
                      }}
                      size={32}
                      tintColor={isDark ? "#989BA5" : "#8E8E93"}
                    />
                    <Text className="text-base font-semibold text-text-light dark:text-text-dark">
                      No transactions found
                    </Text>
                    <Text className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                      Try searching by title, category, or notes
                    </Text>
                  </View>
                ) : (
                  results.map((tx) => {
                    const isTransfer = tx.type === "transfer";
                    const isIncome = tx.type === "income";
                    const categoryMeta = CATEGORY_ICONS[tx.category] ?? {
                      sf: "tag.fill",
                      material: "label",
                    };

                    const sourceAcc = accounts.find(
                      (a) => a.id === tx.sourceAccountId,
                    );
                    const destAcc = accounts.find(
                      (a) => a.id === tx.destinationAccountId,
                    );
                    const subtitle = isTransfer
                      ? `${sourceAcc?.name ?? "Account"} → ${destAcc?.name ?? "Account"}`
                      : `${sourceAcc?.name ?? "Wallet"} • ${tx.category}`;

                    const amountColor = isTransfer
                      ? "#AB9FF2"
                      : isIncome
                        ? "#2EC08B"
                        : "#FF3B30";

                    return (
                      <Pressable
                        key={tx.id}
                        onPress={() => handleSelectTransaction(tx)}
                        className="p-3.5 rounded-2xl bg-card-light dark:bg-card-dark flex-row items-center justify-between active:opacity-80"
                      >
                        <View className="flex-row items-center gap-3 flex-1 mr-3">
                          {/* Category Avatar Icon */}
                          <View className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/10 items-center justify-center shrink-0">
                            <SymbolView
                              name={{
                                ios: isTransfer
                                  ? "arrow.left.arrow.right"
                                  : categoryMeta.sf,
                                android: isTransfer
                                  ? "sync_alt"
                                  : categoryMeta.material,
                                web: isTransfer
                                  ? "sync_alt"
                                  : categoryMeta.material,
                              }}
                              size={20}
                              tintColor={
                                isTransfer
                                  ? "#AB9FF2"
                                  : isDark
                                    ? "#E4E5EB"
                                    : "#1E1F24"
                              }
                            />
                          </View>

                          {/* Info Column */}
                          <View className="flex-1">
                            <Text
                              numberOfLines={1}
                              ellipsizeMode="tail"
                              className="text-[15px] font-bold text-text-light dark:text-text-dark"
                            >
                              {tx.title}
                            </Text>
                            <Text
                              numberOfLines={1}
                              ellipsizeMode="tail"
                              className="text-[12px] text-text-secondary-light dark:text-text-secondary-dark mt-0.5"
                            >
                              {subtitle}
                            </Text>
                          </View>
                        </View>

                        {/* Amount & Change */}
                        <View className="items-end shrink-0">
                          <Text
                            className="text-[15px] font-extrabold"
                            style={{ color: amountColor }}
                          >
                            {isIncome ? "+" : isTransfer ? "" : "-"}
                            {formatCurrency(tx.amount)}
                          </Text>
                          <Text className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
                            {tx.date}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })
                )}
              </ScrollView>

              {/* Bottom Search Input Bar inside Modal (Matching screenshot) */}
              <View className="flex-row items-center gap-2 pt-3">
                <View
                  className={`flex-1 flex-row items-center h-12 px-4 rounded-full border ${
                    isDark
                      ? "bg-[#202227] border-white/10"
                      : "bg-[#F3F2F8] border-black/5"
                  }`}
                >
                  <SymbolView
                    name={{
                      ios: "magnifyingglass",
                      android: "search",
                      web: "search",
                    }}
                    size={18}
                    tintColor={isDark ? "#989BA5" : "#8E8E93"}
                  />
                  <TextInput
                    value={query}
                    onChangeText={setQuery}
                    autoFocus
                    placeholder="Search transactions, notes..."
                    placeholderTextColor={isDark ? "#989BA5" : "#8E8E93"}
                    className="flex-1 ml-2.5 text-[15px] font-medium text-text-light dark:text-text-dark"
                    returnKeyType="search"
                    autoCorrect={false}
                  />
                  {query.length > 0 && (
                    <Pressable
                      onPress={() => setQuery("")}
                      hitSlop={8}
                      className="p-1 active:opacity-70"
                    >
                      <SymbolView
                        name={{
                          ios: "xmark.circle.fill",
                          android: "cancel",
                          web: "cancel",
                        }}
                        size={16}
                        tintColor={isDark ? "#989BA5" : "#8E8E93"}
                      />
                    </Pressable>
                  )}
                </View>

                {/* Dismiss button */}
                <Pressable
                  onPress={onClose}
                  className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/10 items-center justify-center active:opacity-70"
                >
                  <SymbolView
                    name={{
                      ios: "xmark",
                      android: "close",
                      web: "close",
                    }}
                    size={18}
                    tintColor={isDark ? "#E4E5EB" : "#1E1F24"}
                  />
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </RNHostView>
      </BottomSheet>

      {/* Transaction Details Sub-Modal */}
      <TransactionDetailsModal
        visible={selectedTx !== null}
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
      />
    </>
  );
}
