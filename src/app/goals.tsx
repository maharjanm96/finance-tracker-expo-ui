import { LinearGradient } from "expo-linear-gradient";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CreateGoalModal } from "@/components/create-goal-modal";
import { getTopHeaderPadding } from "@/components/navigation/top-chip-header";
import { useExpense } from "@/context/expense-context";
import { useAppTheme } from "@/context/theme-context";
import { formatCompactCurrency, formatCurrency } from "@/domain/formatters";
import { Goal } from "@/domain/types";

export default function GoalsScreen() {
  const insets = useSafeAreaInsets();
  const { isDark } = useAppTheme();
  const topHeaderPadding = getTopHeaderPadding(insets.top);

  const {
    goals,
    activeGoal,
    setActiveGoal,
    combinedBalance,
    scopedBalance,
    selectedAccount,
    currencySymbol,
  } = useExpense();

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Total savings across accounts (or selected account if scoped)
  const totalSavings = Math.max(
    0,
    selectedAccount ? scopedBalance : combinedBalance,
  );

  const handleOpenCreate = () => {
    setEditingGoal(null);
    setShowGoalModal(true);
  };

  const handleOpenEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setShowGoalModal(true);
  };

  // Active goal metrics
  const activeTargetAmount = activeGoal?.targetAmount ?? 0;
  const isActiveGoalReached =
    activeTargetAmount > 0 && totalSavings >= activeTargetAmount;
  const activeGoalPercentage =
    activeTargetAmount > 0
      ? Math.min(100, Math.round((totalSavings / activeTargetAmount) * 100))
      : 0;
  const activeRemaining = Math.max(0, activeTargetAmount - totalSavings);

  // Hero Card Gradient
  const heroGradient = isDark
    ? (["#262833", "#1B1C22", "#131418"] as const)
    : (["#FFFFFF", "#F9FAFC", "#EEF1F6"] as const);

  return (
    <View className="flex-1 bg-bg-light dark:bg-bg-dark">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: topHeaderPadding,
          paddingBottom: 140,
          paddingHorizontal: 16,
          gap: 20,
        }}
      >
        {/* ─── Screen Header ─── */}
        <View className="flex-row items-center justify-between pt-2">
          <View className="flex-1 mr-3">
            <Text className="text-[12px] font-bold tracking-wider text-text-secondary-light dark:text-text-secondary-dark uppercase">
              TARGETS & MILESTONES
            </Text>
            <Text className="text-3xl font-extrabold tracking-tight text-text-light dark:text-text-dark">
              Goals
            </Text>
            {selectedAccount && (
              <Text className="text-[11px] font-semibold text-[#AB9FF2] mt-0.5">
                Filtered by {selectedAccount.name}
              </Text>
            )}
          </View>

          <Pressable
            onPress={handleOpenCreate}
            className="flex-row items-center gap-1.5 px-3.5 py-2 rounded-full bg-brand-perano active:opacity-80 shrink-0"
          >
            <SymbolView
              name={{
                ios: "plus",
                android: "add",
                web: "add",
              }}
              size={13}
              tintColor="#1E1F24"
            />
            <Text className="text-[12px] font-extrabold text-[#1E1F24]">
              New Goal
            </Text>
          </Pressable>
        </View>

        {/* ─── 1. Active Goal Hero Card ─── */}
        {activeGoal ? (
          <View
            className="w-full rounded-3xl overflow-hidden"
            style={{
              shadowColor: "#000000",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: isDark ? 0.35 : 0.08,
              shadowRadius: 16,
              elevation: 4,
            }}
          >
            <LinearGradient
              colors={heroGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: "100%",
                padding: 20,
                borderRadius: 24,
                gap: 16,
              }}
              className={`border ${
                isActiveGoalReached
                  ? "border-emerald-500/40"
                  : "border-black/5 dark:border-white/10"
              }`}
            >
              {/* Header: Status Pill & Edit Action */}
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View
                    className={`px-3 py-1 rounded-full flex-row items-center gap-1.5 ${
                      isActiveGoalReached
                        ? "bg-emerald-500/20 border border-emerald-500/30"
                        : "bg-brand-perano/15 border border-brand-perano/25"
                    }`}
                  >
                    <SymbolView
                      name={{
                        ios: isActiveGoalReached
                          ? "checkmark.seal.fill"
                          : "star.fill",
                        android: isActiveGoalReached ? "verified" : "star",
                        web: isActiveGoalReached ? "verified" : "star",
                      }}
                      size={12}
                      tintColor={isActiveGoalReached ? "#2EC08B" : "#AB9FF2"}
                    />
                    <Text
                      className={`text-[11px] font-extrabold tracking-wider uppercase ${
                        isActiveGoalReached
                          ? "text-emerald-500"
                          : "text-brand-dark-purple dark:text-brand-perano"
                      }`}
                    >
                      {isActiveGoalReached ? "Goal Reached" : "Active Goal"}
                    </Text>
                  </View>

                  {activeGoal.category && (
                    <Text className="text-[12px] font-medium text-text-secondary-light dark:text-text-secondary-dark">
                      {activeGoal.category}
                    </Text>
                  )}
                </View>

                <Pressable
                  onPress={() => handleOpenEdit(activeGoal)}
                  hitSlop={8}
                  className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 items-center justify-center active:opacity-70"
                >
                  <SymbolView
                    name={{
                      ios: "pencil",
                      android: "edit",
                      web: "edit",
                    }}
                    size={14}
                    tintColor={isDark ? "#E4E5EB" : "#1E1F24"}
                  />
                </Pressable>
              </View>

              {/* Goal Title & Target */}
              <View className="gap-1">
                <Text
                  numberOfLines={2}
                  className="text-2xl font-black tracking-tight text-text-primary-light dark:text-text-primary-dark"
                >
                  {activeGoal.title}
                </Text>
                <View className="flex-row items-baseline gap-2">
                  <Text className="text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                    Target:
                  </Text>
                  <Text className="text-lg font-extrabold text-brand-dark-purple dark:text-brand-perano">
                    {formatCurrency(activeGoal.targetAmount, currencySymbol)}
                  </Text>
                </View>
              </View>

              {/* Big Celebration Banner or Progress Bar */}
              <View className="gap-2.5">
                <View className="flex-row items-center justify-between">
                  <Text className="text-[12px] font-bold text-text-secondary-light dark:text-text-secondary-dark">
                    Current Savings
                  </Text>
                  <Text
                    className={`text-[13px] font-extrabold ${
                      isActiveGoalReached
                        ? "text-income"
                        : "text-brand-dark-purple dark:text-brand-perano"
                    }`}
                  >
                    {activeGoalPercentage}%
                  </Text>
                </View>

                {/* Progress Bar Track */}
                <View className="h-3 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                  <View
                    className={`h-full rounded-full ${
                      isActiveGoalReached ? "bg-income" : "bg-brand-perano"
                    }`}
                    style={{ width: `${Math.max(4, activeGoalPercentage)}%` }}
                  />
                </View>

                {/* Savings Status Text */}
                <View className="flex-row items-center justify-between pt-0.5">
                  <Text className="text-[12px] font-medium text-text-secondary-light dark:text-text-secondary-dark">
                    Accumulated:{" "}
                    {formatCompactCurrency(totalSavings, currencySymbol)}
                  </Text>
                  {isActiveGoalReached ? (
                    <Text className="text-[12px] font-bold text-income">
                      Ready to fulfill
                    </Text>
                  ) : (
                    <Text className="text-[12px] font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                      {formatCompactCurrency(activeRemaining, currencySymbol)}{" "}
                      to go
                    </Text>
                  )}
                </View>
              </View>

              {/* Celebration Callout if Achieved */}
              {isActiveGoalReached && (
                <View className="flex-row items-center gap-2 px-3 py-2.5 rounded-2xl bg-income/10 border border-income/20">
                  <SymbolView
                    name={{
                      ios: "checkmark.seal.fill",
                      android: "verified",
                      web: "verified",
                    }}
                    size={16}
                    tintColor="#2EC08B"
                  />
                  <Text className="flex-1 text-[12px] font-semibold text-income">
                    Congratulations! Your total savings (
                    {formatCompactCurrency(totalSavings, currencySymbol)})
                    covers this goal completely.
                  </Text>
                </View>
              )}
            </LinearGradient>
          </View>
        ) : (
          /* Empty Active Goal Banner */
          <View className="p-6 rounded-3xl bg-card-light dark:bg-card-dark border border-black/5 dark:border-white/10 items-center justify-center gap-3">
            <SymbolView
              name={{
                ios: "target",
                android: "track_changes",
                web: "track_changes",
              }}
              size={36}
              tintColor="#AB9FF2"
            />
            <View className="items-center gap-1">
              <Text className="text-base font-bold text-text-primary-light dark:text-text-primary-dark">
                No Active Goal Set
              </Text>
              <Text className="text-xs text-center text-text-secondary-light dark:text-text-secondary-dark">
                Create a savings goal below and mark it active to track it on
                your home snapshot.
              </Text>
            </View>
            <Pressable
              onPress={handleOpenCreate}
              className="px-4 py-2 rounded-full bg-brand-perano active:opacity-80"
            >
              <Text className="text-xs font-bold text-[#1E1F24]">
                Create Your First Goal
              </Text>
            </Pressable>
          </View>
        )}

        {/* ─── 2. All Goals List ─── */}
        <View className="gap-3">
          <View className="flex-row items-center justify-between px-1">
            <Text className="text-[12px] font-bold tracking-wider text-text-secondary-light dark:text-text-secondary-dark uppercase">
              ALL GOALS ({goals.length})
            </Text>
            <Text className="text-[11px] font-medium text-text-secondary-light dark:text-text-secondary-dark">
              Tap any goal to activate
            </Text>
          </View>

          {goals.length === 0 ? (
            <View className="p-8 rounded-3xl bg-card-light dark:bg-card-dark border border-black/5 dark:border-white/10 items-center justify-center gap-2">
              <Text className="text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                No goals created yet.
              </Text>
            </View>
          ) : (
            <View className="gap-2.5">
              {goals.map((g) => {
                const isGoalActive = g.isActive;
                const isReached = totalSavings >= g.targetAmount;
                const pct = Math.min(
                  100,
                  Math.round((totalSavings / g.targetAmount) * 100),
                );

                return (
                  <Pressable
                    key={g.id}
                    onPress={() => setActiveGoal(g.id)}
                    className={`p-4 rounded-3xl border ${
                      isGoalActive
                        ? "bg-card-light dark:bg-card-dark border-brand-perano shadow-sm"
                        : "bg-card-light dark:bg-card-dark border-black/5 dark:border-white/5"
                    } active:opacity-90 gap-3`}
                  >
                    {/* Top Row: Icon, Title, Status & Edit */}
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-3 flex-1 mr-2">
                        <View
                          className={`w-10 h-10 rounded-2xl items-center justify-center ${
                            isGoalActive
                              ? "bg-brand-perano/20"
                              : "bg-black/5 dark:bg-white/10"
                          }`}
                        >
                          <SymbolView
                            name={{
                              ios: (g.icon as any) ?? "target",
                              android: "track_changes",
                              web: "track_changes",
                            }}
                            size={18}
                            tintColor={
                              isGoalActive
                                ? "#AB9FF2"
                                : isDark
                                  ? "#E4E5EB"
                                  : "#1E1F24"
                            }
                          />
                        </View>

                        <View className="flex-1">
                          <Text
                            numberOfLines={1}
                            className="text-[15px] font-bold text-text-primary-light dark:text-text-primary-dark"
                          >
                            {g.title}
                          </Text>
                          <Text className="text-[12px] font-medium text-text-secondary-light dark:text-text-secondary-dark">
                            Target:{" "}
                            {formatCurrency(g.targetAmount, currencySymbol)}
                          </Text>
                        </View>
                      </View>

                      {/* Right Side: Status Badge + Edit Button */}
                      <View className="flex-row items-center gap-2">
                        {isReached ? (
                          <View className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25">
                            <Text className="text-[10px] font-extrabold text-emerald-500">
                              REACHED
                            </Text>
                          </View>
                        ) : isGoalActive ? (
                          <View className="px-2 py-0.5 rounded-full bg-brand-perano/20 border border-brand-perano/30">
                            <Text className="text-[10px] font-extrabold text-brand-dark-purple dark:text-brand-perano">
                              ACTIVE
                            </Text>
                          </View>
                        ) : null}

                        <Pressable
                          onPress={() => handleOpenEdit(g)}
                          hitSlop={10}
                          className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/10 items-center justify-center active:opacity-60"
                        >
                          <SymbolView
                            name={{
                              ios: "ellipsis",
                              android: "more_horiz",
                              web: "more_horiz",
                            }}
                            size={14}
                            tintColor={isDark ? "#989BA5" : "#8E8E93"}
                          />
                        </Pressable>
                      </View>
                    </View>

                    {/* Progress Track */}
                    <View className="gap-1.5">
                      <View className="h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                        <View
                          className={`h-full rounded-full ${
                            isReached ? "bg-income" : "bg-brand-perano"
                          }`}
                          style={{ width: `${Math.max(4, pct)}%` }}
                        />
                      </View>
                      <View className="flex-row items-center justify-between">
                        <Text className="text-[11px] font-medium text-text-secondary-light dark:text-text-secondary-dark">
                          {formatCompactCurrency(totalSavings, currencySymbol)}{" "}
                          saved
                        </Text>
                        <Text
                          className={`text-[11px] font-bold ${
                            isReached
                              ? "text-income"
                              : "text-brand-dark-purple dark:text-brand-perano"
                          }`}
                        >
                          {pct}%
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* ─── Create / Edit Goal Bottom Sheet Modal ─── */}
      <CreateGoalModal
        visible={showGoalModal}
        goal={editingGoal}
        onClose={() => {
          setShowGoalModal(false);
          setEditingGoal(null);
        }}
      />
    </View>
  );
}
