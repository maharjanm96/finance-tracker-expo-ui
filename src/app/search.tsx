import { SymbolView } from 'expo-symbols';
import React, { useMemo, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BlurTargetView, BlurredStatusBar } from '@/components/blurred-status-bar';
import { BottomTabInset, MaxContentWidth } from '@/constants/theme';
import { CATEGORY_ICONS, useExpense } from '@/context/expense-context';
import { useAppTheme } from '@/context/theme-context';
import { calculateCategoryBreakdown } from '@/domain/finance-calculations';
import {
  formatCurrency,
  formatPercentage,
} from '@/domain/formatters';

type TimeRange = 'month' | 'lastMonth' | 'ytd';

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { isDark } = useAppTheme();
  const {
    profile,
    transactions,
    accounts,
    selectedAccountId,
    selectAccount,
    monthlyIncome,
    monthlyExpenses,
    monthlySavings,
    savingsRate,
    annualGoalProgress,
  } = useExpense();

  const [scrollY] = useState(() => new Animated.Value(0));
  const blurTargetRef = useRef<View | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  // Filter transactions for analytics
  const filteredTxs = useMemo(() => {
    return transactions.filter((tx) => {
      if (selectedAccountId) {
        const matches =
          tx.sourceAccountId === selectedAccountId ||
          tx.destinationAccountId === selectedAccountId;
        if (!matches) return false;
      }
      return true;
    });
  }, [transactions, selectedAccountId]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    return calculateCategoryBreakdown(filteredTxs, selectedAccountId);
  }, [filteredTxs, selectedAccountId]);

  // Cash Flow Calculations
  const maxCashFlow = Math.max(monthlyIncome, monthlyExpenses, 1);
  const incomeBarWidth = Math.round((monthlyIncome / maxCashFlow) * 100);
  const expenseBarWidth = Math.round((monthlyExpenses / maxCashFlow) * 100);

  return (
    <View style={[styles.screen, isDark ? styles.screenDark : styles.screenLight]}>
      <BlurTargetView ref={blurTargetRef} style={styles.blurTarget}>
        <Animated.ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + (Platform.OS === 'ios' ? 14 : 24),
              paddingBottom: insets.bottom + BottomTabInset + 44,
            },
          ]}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}>
          <View style={styles.contentWrapper}>
            {/* Header */}
            <View style={styles.headerRow}>
              <View>
                <Text style={[styles.headerSubtitle, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>
                  INSIGHTS & CASH FLOW
                </Text>
                <Text style={[styles.headerTitle, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}>
                  Analytics
                </Text>
              </View>
            </View>

            {/* Time Range Selector */}
            <View style={[styles.timeRangeToggle, isDark ? styles.cardDark : styles.cardLight]}>
              <Pressable
                onPress={() => setTimeRange('month')}
                style={[
                  styles.timeOption,
                  timeRange === 'month' && (isDark ? styles.timeOptionActiveDark : styles.timeOptionActiveLight),
                ]}>
                <Text
                  style={[
                    styles.timeOptionText,
                    timeRange === 'month'
                      ? styles.timeTextActive
                      : isDark
                      ? styles.textSecondaryDark
                      : styles.textSecondaryLight,
                  ]}>
                  This Month
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setTimeRange('lastMonth')}
                style={[
                  styles.timeOption,
                  timeRange === 'lastMonth' && (isDark ? styles.timeOptionActiveDark : styles.timeOptionActiveLight),
                ]}>
                <Text
                  style={[
                    styles.timeOptionText,
                    timeRange === 'lastMonth'
                      ? styles.timeTextActive
                      : isDark
                      ? styles.textSecondaryDark
                      : styles.textSecondaryLight,
                  ]}>
                  Last Month
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setTimeRange('ytd')}
                style={[
                  styles.timeOption,
                  timeRange === 'ytd' && (isDark ? styles.timeOptionActiveDark : styles.timeOptionActiveLight),
                ]}>
                <Text
                  style={[
                    styles.timeOptionText,
                    timeRange === 'ytd'
                      ? styles.timeTextActive
                      : isDark
                      ? styles.textSecondaryDark
                      : styles.textSecondaryLight,
                  ]}>
                  YTD
                </Text>
              </Pressable>
            </View>

            {/* Scope / Account Filter Chips */}
            <View style={styles.accountScopeWrap}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.accountChipsScroll}>
                <Pressable
                  onPress={() => selectAccount(null)}
                  style={[
                    styles.scopeChip,
                    isDark ? styles.chipDark : styles.chipLight,
                    selectedAccountId === null && (isDark ? styles.chipSelectedDark : styles.chipSelectedLight),
                  ]}>
                  <Text
                    style={[
                      styles.scopeChipText,
                      selectedAccountId === null
                        ? (isDark ? styles.chipTextSelectedDark : styles.chipTextSelectedLight)
                        : (isDark ? styles.chipTextInactiveDark : styles.chipTextInactiveLight),
                    ]}>
                    Combined (All Accounts)
                  </Text>
                </Pressable>

                {accounts.map((acc) => {
                  const isSelected = selectedAccountId === acc.id;
                  return (
                    <Pressable
                      key={acc.id}
                      onPress={() => selectAccount(acc.id)}
                      style={[
                        styles.scopeChip,
                        isDark ? styles.chipDark : styles.chipLight,
                        isSelected && (isDark ? styles.chipSelectedDark : styles.chipSelectedLight),
                      ]}>
                      <Text
                        style={[
                          styles.scopeChipText,
                          isSelected
                            ? (isDark ? styles.chipTextSelectedDark : styles.chipTextSelectedLight)
                            : (isDark ? styles.chipTextInactiveDark : styles.chipTextInactiveLight),
                        ]}>
                        {acc.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* 1. Cash Flow Comparison Card */}
            <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
              <View style={styles.cardHeaderRow}>
                <Text style={[styles.cardTitle, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>
                  CASH FLOW COMPARISON
                </Text>
                <View style={styles.savingsPill}>
                  <Text style={styles.savingsPillText}>
                    {savingsRate !== null ? `${formatPercentage(savingsRate)} Saved` : '0% Saved'}
                  </Text>
                </View>
              </View>

              <View style={styles.cashFlowBars}>
                {/* Income Bar */}
                <View style={styles.flowRow}>
                  <View style={styles.flowLabelRow}>
                    <Text style={[styles.flowLabel, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}>
                      Income
                    </Text>
                    <Text style={[styles.flowAmount, { color: '#2EC08B' }]}>
                      +{formatCurrency(monthlyIncome)}
                    </Text>
                  </View>
                  <View style={[styles.barTrack, isDark ? styles.trackDark : styles.trackLight]}>
                    <View style={[styles.barFill, { width: `${incomeBarWidth}%`, backgroundColor: '#2EC08B' }]} />
                  </View>
                </View>

                {/* Expenses Bar */}
                <View style={styles.flowRow}>
                  <View style={styles.flowLabelRow}>
                    <Text style={[styles.flowLabel, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}>
                      Expenses
                    </Text>
                    <Text style={[styles.flowAmount, { color: '#FF3B30' }]}>
                      -{formatCurrency(monthlyExpenses)}
                    </Text>
                  </View>
                  <View style={[styles.barTrack, isDark ? styles.trackDark : styles.trackLight]}>
                    <View style={[styles.barFill, { width: `${expenseBarWidth}%`, backgroundColor: '#FF3B30' }]} />
                  </View>
                </View>
              </View>

              {/* Net Cash Flow Summary Footer */}
              <View style={[styles.flowFooter, isDark ? styles.footerDark : styles.footerLight]}>
                <Text style={[styles.footerLabel, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>
                  Net Surplus
                </Text>
                <Text
                  style={[
                    styles.footerValue,
                    { color: monthlySavings >= 0 ? '#2EC08B' : '#FF3B30' },
                  ]}>
                  {monthlySavings >= 0 ? '+' : '-'}{formatCurrency(Math.abs(monthlySavings))}
                </Text>
              </View>
            </View>

            {/* 2. Annual Savings Goal Progress */}
            <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
              <View style={styles.cardHeaderRow}>
                <Text style={[styles.cardTitle, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>
                  2026 ANNUAL SAVINGS GOAL
                </Text>
                <Text style={[styles.goalPercentBadge, { color: '#AB9FF2' }]}>
                  {formatPercentage(annualGoalProgress.percentage)}
                </Text>
              </View>

              <View style={styles.goalValuesRow}>
                <View>
                  <Text style={[styles.goalLabel, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>
                    Total Saved YTD
                  </Text>
                  <Text style={[styles.goalAmount, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}>
                    {formatCurrency(monthlySavings > 0 ? monthlySavings : 0)}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.goalLabel, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>
                    Target Goal
                  </Text>
                  <Text style={[styles.goalAmount, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}>
                    {formatCurrency(profile.annualSavingsGoal)}
                  </Text>
                </View>
              </View>

              <View style={[styles.barTrack, isDark ? styles.trackDark : styles.trackLight]}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${Math.min(100, Math.round(annualGoalProgress.percentage))}%`,
                      backgroundColor: '#AB9FF2',
                    },
                  ]}
                />
              </View>
            </View>

            {/* 3. Category Spending Breakdown */}
            <View style={styles.categorySection}>
              <Text style={[styles.sectionTitle, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>
                SPENDING BY CATEGORY
              </Text>

              <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight, { padding: 0 }]}>
                {categoryBreakdown.length === 0 ? (
                  <View style={styles.emptyCatWrap}>
                    <Text style={[styles.emptyCatText, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>
                      No expense records in this period
                    </Text>
                  </View>
                ) : (
                  categoryBreakdown.map((item, idx) => {
                    const meta = CATEGORY_ICONS[item.category] ?? {
                      sf: 'tag.fill',
                      material: 'label',
                    };
                    const isLast = idx === categoryBreakdown.length - 1;

                    return (
                      <View key={item.category}>
                        <View style={styles.catRow}>
                          <View style={[styles.catIconWrap, isDark ? styles.catIconDark : styles.catIconLight]}>
                            <SymbolView
                              name={{ ios: meta.sf, android: meta.material, web: meta.material }}
                              size={16}
                              tintColor={isDark ? '#FFFFFF' : '#000000'}
                            />
                          </View>

                          <View style={styles.catInfoCol}>
                            <View style={styles.catTitleRow}>
                              <Text style={[styles.catName, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}>
                                {item.category}
                              </Text>
                              <Text style={[styles.catAmount, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}>
                                {formatCurrency(item.amount)}
                              </Text>
                            </View>

                            <View style={styles.catProgressRow}>
                              <View style={[styles.catTrack, isDark ? styles.trackDark : styles.trackLight]}>
                                <View
                                  style={[
                                    styles.catFill,
                                    {
                                      width: `${Math.min(100, item.percentage)}%`,
                                      backgroundColor: '#AB9FF2',
                                    },
                                  ]}
                                />
                              </View>
                              <Text style={[styles.catPercentText, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>
                                {item.percentage}%
                              </Text>
                            </View>
                          </View>
                        </View>
                        {!isLast && (
                          <View
                            style={[
                              styles.catDivider,
                              isDark ? styles.dividerDark : styles.dividerLight,
                            ]}
                          />
                        )}
                      </View>
                    );
                  })
                )}
              </View>
            </View>
          </View>
        </Animated.ScrollView>
      </BlurTargetView>

      {/* Top Status Bar */}
      <BlurredStatusBar blurTarget={blurTargetRef} scrollY={scrollY} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  screenDark: {
    backgroundColor: '#000000',
  },
  screenLight: {
    backgroundColor: '#FFFFFF',
  },
  blurTarget: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: 18,
  },
  headerRow: {
    paddingVertical: 6,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.6,
    marginTop: 2,
  },
  timeRangeToggle: {
    flexDirection: 'row',
    height: 42,
    borderRadius: 14,
    padding: 3,
    borderWidth: 1,
  },
  timeOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },
  timeOptionActiveDark: {
    backgroundColor: '#3A3B3E',
  },
  timeOptionActiveLight: {
    backgroundColor: '#E5E5EA',
  },
  timeOptionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  timeTextActive: {
    color: '#000000',
    fontWeight: '700',
  },
  accountScopeWrap: {
    marginTop: -4,
  },
  accountChipsScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  scopeChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
  },
  scopeChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    gap: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  savingsPill: {
    backgroundColor: 'rgba(46, 192, 139, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savingsPillText: {
    color: '#2EC08B',
    fontSize: 12,
    fontWeight: '700',
  },
  goalPercentBadge: {
    fontSize: 13,
    fontWeight: '700',
  },
  cashFlowBars: {
    gap: 12,
  },
  flowRow: {
    gap: 6,
  },
  flowLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flowLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  flowAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  trackDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  trackLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  flowFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerDark: {
    borderTopColor: 'rgba(255, 255, 255, 0.10)',
  },
  footerLight: {
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
  },
  footerLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  footerValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  goalValuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  goalAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  categorySection: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    paddingHorizontal: 4,
  },
  emptyCatWrap: {
    padding: 30,
    alignItems: 'center',
  },
  emptyCatText: {
    fontSize: 14,
    fontWeight: '500',
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  catIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catIconDark: {
    backgroundColor: '#1C1C1E',
  },
  catIconLight: {
    backgroundColor: '#F5F2FF',
  },
  catInfoCol: {
    flex: 1,
    gap: 6,
  },
  catTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catName: {
    fontSize: 14,
    fontWeight: '600',
  },
  catAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  catProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  catTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  catFill: {
    height: '100%',
    borderRadius: 3,
  },
  catPercentText: {
    fontSize: 11,
    fontWeight: '600',
    width: 32,
    textAlign: 'right',
  },
  catDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 64,
  },
  dividerDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },
  dividerLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  chipDark: {
    backgroundColor: '#121214',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  chipLight: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  chipSelectedDark: {
    backgroundColor: '#AB9FF2',
    borderColor: '#AB9FF2',
  },
  chipSelectedLight: {
    backgroundColor: '#AB9FF2',
    borderColor: '#AB9FF2',
  },
  chipTextSelectedDark: {
    color: '#000000',
    fontWeight: '700',
  },
  chipTextSelectedLight: {
    color: '#000000',
    fontWeight: '700',
  },
  chipTextInactiveDark: {
    color: '#8E8E93',
  },
  chipTextInactiveLight: {
    color: '#6C6C70',
  },
  cardDark: {
    backgroundColor: '#121214',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  textPrimaryDark: {
    color: '#FFFFFF',
  },
  textPrimaryLight: {
    color: '#000000',
  },
  textSecondaryDark: {
    color: '#8E8E93',
  },
  textSecondaryLight: {
    color: '#6C6C70',
  },
});
