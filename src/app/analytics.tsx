import { SymbolView } from "expo-symbols";
import { useMemo, useRef, useState } from "react";
import {
  Animated,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  Path,
  Stop,
  LinearGradient as SvgLinearGradient,
} from "react-native-svg";

import { BlurTargetView } from "@/components/blurred-status-bar";
import { getTopHeaderPadding } from "@/components/navigation/top-chip-header";
import { getAccountTypeIcon } from "@/constants/account-types";
import { MaxContentWidth } from "@/constants/theme";
import { CATEGORY_ICONS, useExpense } from "@/context/expense-context";
import { useAppTheme } from "@/context/theme-context";
import { calculateCategoryBreakdown } from "@/domain/finance-calculations";
import { formatCurrency, formatPercentage } from "@/domain/formatters";
import { Transaction } from "@/domain/types";

type TimeRange = "week" | "month" | "ytd";

interface GraphBucket {
  label: string;
  fullLabel: string;
  expense: number;
  income: number;
  txCount: number;
}

function getTxTimestamp(tx: Transaction): number {
  if (
    typeof tx.timestamp === "number" &&
    !isNaN(tx.timestamp) &&
    tx.timestamp > 0
  ) {
    return tx.timestamp;
  }
  if (tx.date === "Today") {
    return Date.now();
  }
  if (tx.date === "Yesterday") {
    return Date.now() - 86400000;
  }
  const parsed = Date.parse(tx.date);
  if (!isNaN(parsed)) {
    return parsed;
  }
  return Date.now();
}

function createSmoothPath(
  pts: { x: number; y: number }[],
  minY: number,
  maxY: number,
): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

  const clampY = (val: number) => Math.max(minY, Math.min(maxY, val));
  let path = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;

  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i === 0 ? i : i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = clampY(p1.y + (p2.y - p0.y) / 6);

    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = clampY(p2.y - (p3.y - p1.y) / 6);

    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return path;
}

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
    currencySymbol,
  } = useExpense();

  const formatAmt = (val: number) => formatCurrency(val, currencySymbol);

  const [scrollY] = useState(() => new Animated.Value(0));
  const blurTargetRef = useRef<View | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const [chartWidth, setChartWidth] = useState(330);

  const topHeaderPadding = getTopHeaderPadding(insets.top);

  // Filter transactions for analytics by selected account
  const accountFilteredTxs = useMemo(() => {
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

  // Compute precise period boundaries for week, month, and YTD
  const { currentStart, currentEnd, prevStart, prevEnd } = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDayIdx = now.getDay(); // 0 is Sunday, 6 is Saturday

    if (timeRange === "week") {
      // Current week: Sunday 00:00:00.000 to next Sunday 00:00:00.000
      const cStart = new Date(now);
      cStart.setDate(now.getDate() - currentDayIdx);
      cStart.setHours(0, 0, 0, 0);

      const cEnd = new Date(cStart);
      cEnd.setDate(cStart.getDate() + 7);

      const pStart = new Date(cStart);
      pStart.setDate(cStart.getDate() - 7);

      const pEnd = new Date(cStart);

      return {
        currentStart: cStart,
        currentEnd: cEnd,
        prevStart: pStart,
        prevEnd: pEnd,
      };
    }

    if (timeRange === "month") {
      // Current month: 1st of month to 1st of next month
      const cStart = new Date(currentYear, currentMonth, 1, 0, 0, 0, 0);
      const cEnd = new Date(currentYear, currentMonth + 1, 1, 0, 0, 0, 0);

      const pStart = new Date(currentYear, currentMonth - 1, 1, 0, 0, 0, 0);
      const pEnd = cStart;

      return {
        currentStart: cStart,
        currentEnd: cEnd,
        prevStart: pStart,
        prevEnd: pEnd,
      };
    }

    // YTD: Jan 1 of current year to Jan 1 of next year
    const cStart = new Date(currentYear, 0, 1, 0, 0, 0, 0);
    const cEnd = new Date(currentYear + 1, 0, 1, 0, 0, 0, 0);

    const pStart = new Date(currentYear - 1, 0, 1, 0, 0, 0, 0);
    const pEnd = cStart;

    return {
      currentStart: cStart,
      currentEnd: cEnd,
      prevStart: pStart,
      prevEnd: pEnd,
    };
  }, [timeRange]);

  // Transactions in current active timeRange
  const periodFilteredTxs = useMemo(() => {
    const startMs = currentStart.getTime();
    const endMs = currentEnd.getTime();
    return accountFilteredTxs.filter((tx) => {
      const t = getTxTimestamp(tx);
      return t >= startMs && t < endMs;
    });
  }, [accountFilteredTxs, currentStart, currentEnd]);

  // Transactions in previous period (for trend comparison)
  const prevPeriodFilteredTxs = useMemo(() => {
    const startMs = prevStart.getTime();
    const endMs = prevEnd.getTime();
    return accountFilteredTxs.filter((tx) => {
      const t = getTxTimestamp(tx);
      return t >= startMs && t < endMs;
    });
  }, [accountFilteredTxs, prevStart, prevEnd]);

  // Total expense in current period
  const totalPeriodExpense = useMemo(() => {
    return periodFilteredTxs
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [periodFilteredTxs]);

  // Total income in current period
  const totalPeriodIncome = useMemo(() => {
    return periodFilteredTxs
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [periodFilteredTxs]);

  // Effective income for this period (from transactions if recorded, else from user's configured monthly income)
  const effectivePeriodIncome = useMemo(() => {
    if (totalPeriodIncome > 0) return totalPeriodIncome;
    const baseMonthly =
      monthlyIncome > 0 ? monthlyIncome : profile.monthlyIncome;
    if (baseMonthly > 0) {
      if (timeRange === "week") return Math.round(baseMonthly / 4.33);
      if (timeRange === "month") return baseMonthly;
      return baseMonthly * (new Date().getMonth() + 1);
    }
    return 0;
  }, [totalPeriodIncome, monthlyIncome, profile.monthlyIncome, timeRange]);

  // Total expense in previous period
  const totalPrevPeriodExpense = useMemo(() => {
    return prevPeriodFilteredTxs
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [prevPeriodFilteredTxs]);

  // Performance badge: Always displays an icon and percentage of income or expense
  const performanceBadge = useMemo(() => {
    // 1. If income is available, calculate percentage of income spent
    if (effectivePeriodIncome > 0) {
      const pctOfIncome = Math.round(
        (totalPeriodExpense / effectivePeriodIncome) * 100,
      );
      const isUnder = pctOfIncome <= 100;
      return {
        text: `${pctOfIncome}% of income`,
        isPositive: isUnder,
        tintColor: isUnder ? "#2EC08B" : "#FF3B30",
        bgClass: isUnder ? "bg-emerald-500/15" : "bg-rose-500/15",
        textClass: isUnder
          ? "text-emerald-500 dark:text-emerald-400"
          : "text-rose-500 dark:text-rose-400",
      };
    }

    // 2. If trend vs previous period is available
    if (totalPrevPeriodExpense > 0) {
      const diff = totalPeriodExpense - totalPrevPeriodExpense;
      const pct = Math.round((diff / totalPrevPeriodExpense) * 100);
      const isDecrease = pct <= 0;
      return {
        text: `${pct > 0 ? "+" : ""}${pct}% vs last ${timeRange}`,
        isPositive: isDecrease,
        tintColor: isDecrease ? "#2EC08B" : "#FF3B30",
        bgClass: isDecrease ? "bg-emerald-500/15" : "bg-rose-500/15",
        textClass: isDecrease
          ? "text-emerald-500 dark:text-emerald-400"
          : "text-rose-500 dark:text-rose-400",
      };
    }

    // 3. Fallback when neither income nor previous period exists
    const isZero = totalPeriodExpense === 0;
    return {
      text: isZero ? "0% of income" : "100% expense",
      isPositive: isZero,
      tintColor: isZero ? "#2EC08B" : "#FF3B30",
      bgClass: isZero ? "bg-emerald-500/15" : "bg-rose-500/15",
      textClass: isZero
        ? "text-emerald-500 dark:text-emerald-400"
        : "text-rose-500 dark:text-rose-400",
    };
  }, [
    effectivePeriodIncome,
    totalPeriodExpense,
    totalPrevPeriodExpense,
    timeRange,
  ]);

  // Category breakdown (uses periodFilteredTxs; falls back to all-time account if period has no expenses)
  const categoryBreakdown = useMemo(() => {
    const periodBreakdown = calculateCategoryBreakdown(
      periodFilteredTxs,
      selectedAccountId,
    );
    if (periodBreakdown.length > 0) return periodBreakdown;
    return calculateCategoryBreakdown(accountFilteredTxs, selectedAccountId);
  }, [periodFilteredTxs, accountFilteredTxs, selectedAccountId]);

  // Compute graph data buckets based on selected timeRange (Starts with SUNDAY)
  const graphBuckets: GraphBucket[] = useMemo(() => {
    const expenseTxs = accountFilteredTxs.filter((tx) => tx.type === "expense");
    const incomeTxs = accountFilteredTxs.filter((tx) => tx.type === "income");
    const now = new Date();

    if (timeRange === "week") {
      // Week starts with SUNDAY (Sunday = 0 in JS Date)
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const fullDays = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const currentDayIdx = now.getDay(); // 0 is Sunday, 6 is Saturday

      // Start of current week: Sunday 00:00:00.000
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - currentDayIdx);
      startOfWeek.setHours(0, 0, 0, 0);

      return days.map((day, idx) => {
        const dayStart = new Date(startOfWeek);
        dayStart.setDate(startOfWeek.getDate() + idx);
        dayStart.setHours(0, 0, 0, 0);

        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayStart.getDate() + 1);

        const dayStartMs = dayStart.getTime();
        const dayEndMs = dayEnd.getTime();

        // Match actual transactions belonging to this day of the current week
        const dayExpenses = expenseTxs.filter((tx) => {
          const t = getTxTimestamp(tx);
          return t >= dayStartMs && t < dayEndMs;
        });

        const dayIncomes = incomeTxs.filter((tx) => {
          const t = getTxTimestamp(tx);
          return t >= dayStartMs && t < dayEndMs;
        });

        const totalExp = dayExpenses.reduce((s, tx) => s + tx.amount, 0);
        const totalInc = dayIncomes.reduce((s, tx) => s + tx.amount, 0);

        return {
          label: day,
          fullLabel: `${fullDays[idx]}${idx === currentDayIdx ? " (Today)" : ""}`,
          expense: totalExp,
          income: totalInc,
          txCount: dayExpenses.length,
        };
      });
    }

    if (timeRange === "month") {
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const currentWeekIdx = Math.min(3, Math.floor((now.getDate() - 1) / 7));

      const weeks = [
        {
          label: "Week 1",
          fullLabel: "Week 1 (Day 1-7)",
          startDay: 1,
          endDay: 7,
        },
        {
          label: "Week 2",
          fullLabel: "Week 2 (Day 8-14)",
          startDay: 8,
          endDay: 14,
        },
        {
          label: "Week 3",
          fullLabel: "Week 3 (Day 15-21)",
          startDay: 15,
          endDay: 21,
        },
        {
          label: "Week 4",
          fullLabel: "Week 4 (Day 22+)",
          startDay: 22,
          endDay: 32,
        },
      ];

      return weeks.map((w, idx) => {
        const weekTxs = expenseTxs.filter((tx) => {
          const t = getTxTimestamp(tx);
          const d = new Date(t);
          if (
            d.getFullYear() !== currentYear ||
            d.getMonth() !== currentMonth
          ) {
            return false;
          }
          const dateNum = d.getDate();
          return dateNum >= w.startDay && dateNum <= w.endDay;
        });

        const weekIncomes = incomeTxs.filter((tx) => {
          const t = getTxTimestamp(tx);
          const d = new Date(t);
          if (
            d.getFullYear() !== currentYear ||
            d.getMonth() !== currentMonth
          ) {
            return false;
          }
          const dateNum = d.getDate();
          return dateNum >= w.startDay && dateNum <= w.endDay;
        });

        const totalExp = weekTxs.reduce((s, tx) => s + tx.amount, 0);
        const totalInc = weekIncomes.reduce((s, tx) => s + tx.amount, 0);

        return {
          label: w.label,
          fullLabel: `${w.fullLabel}${idx === currentWeekIdx ? " (Current)" : ""}`,
          expense: totalExp,
          income: totalInc,
          txCount: weekTxs.length,
        };
      });
    }

    // YTD: 4 Quarters of current year
    const currentYear = now.getFullYear();
    const currentPeriodIdx = Math.min(3, Math.floor(now.getMonth() / 3));

    const periods = [
      {
        label: "Quarter 1",
        fullLabel: "Quarter 1 (Jan - Mar)",
        startMonth: 0,
        endMonth: 2,
      },
      {
        label: "Quarter 2",
        fullLabel: "Quarter 2 (Apr - Jun)",
        startMonth: 3,
        endMonth: 5,
      },
      {
        label: "Quarter 3",
        fullLabel: "Quarter 3 (Jul - Sep)",
        startMonth: 6,
        endMonth: 8,
      },
      {
        label: "Quarter 4",
        fullLabel: "Quarter 4 (Oct - Dec)",
        startMonth: 9,
        endMonth: 11,
      },
    ];

    return periods.map((p, idx) => {
      const periodExpenses = expenseTxs.filter((tx) => {
        const t = getTxTimestamp(tx);
        const d = new Date(t);
        if (d.getFullYear() !== currentYear) return false;
        const m = d.getMonth();
        return m >= p.startMonth && m <= p.endMonth;
      });

      const periodIncomes = incomeTxs.filter((tx) => {
        const t = getTxTimestamp(tx);
        const d = new Date(t);
        if (d.getFullYear() !== currentYear) return false;
        const m = d.getMonth();
        return m >= p.startMonth && m <= p.endMonth;
      });

      const totalExp = periodExpenses.reduce((s, tx) => s + tx.amount, 0);
      const totalInc = periodIncomes.reduce((s, tx) => s + tx.amount, 0);

      return {
        label: p.label,
        fullLabel: `${p.fullLabel}${idx === currentPeriodIdx ? " (Current)" : ""}`,
        expense: totalExp,
        income: totalInc,
        txCount: periodExpenses.length,
      };
    });
  }, [accountFilteredTxs, timeRange]);

  // Max expense value for scaling the line graph
  const maxBucketExpense = useMemo(() => {
    const maxVal = Math.max(...graphBuckets.map((b) => b.expense), 0);
    if (maxVal === 0) return 100;
    if (maxVal <= 100) return 100;
    if (maxVal <= 500) return 500;
    if (maxVal <= 1000) return 1000;
    if (maxVal <= 5000) return Math.ceil(maxVal / 500) * 500;
    return Math.ceil(maxVal / 1000) * 1000;
  }, [graphBuckets]);

  // Chart coordinates
  const chartHeight = 155;
  const topPadding = 18;
  const bottomPadding = 24;
  const sidePadding = 22;

  const points = useMemo(() => {
    const n = graphBuckets.length;
    if (n <= 1) return [];
    const usableWidth = Math.max(100, chartWidth - sidePadding * 2);
    const usableHeight = chartHeight - topPadding - bottomPadding;

    return graphBuckets.map((bucket, idx) => {
      const x = sidePadding + (idx / (n - 1)) * usableWidth;
      const ratio = Math.min(1, Math.max(0, bucket.expense / maxBucketExpense));
      const y = topPadding + usableHeight - ratio * usableHeight;
      return { x, y, bucket, index: idx };
    });
  }, [graphBuckets, chartWidth, maxBucketExpense]);

  const linePath = useMemo(
    () => createSmoothPath(points, topPadding - 4, chartHeight - bottomPadding),
    [points],
  );

  const areaPath = useMemo(() => {
    if (points.length === 0) return "";
    const groundY = chartHeight - bottomPadding;
    const first = points[0];
    const last = points[points.length - 1];
    return `${linePath} L ${last.x.toFixed(1)} ${groundY} L ${first.x.toFixed(1)} ${groundY} Z`;
  }, [linePath, points]);

  // Default active index matches current day (for week), current week (for month), or current quarter (for ytd)
  const defaultIndex = useMemo(() => {
    const now = new Date();
    if (timeRange === "week") {
      return now.getDay(); // 0 is Sunday, 6 is Saturday
    }
    if (timeRange === "month") {
      const dateNum = now.getDate();
      return Math.min(3, Math.floor((dateNum - 1) / 7));
    }
    // ytd (Quarters: Q1=0, Q2=1, Q3=2, Q4=3)
    return Math.min(3, Math.floor(now.getMonth() / 3));
  }, [timeRange]);

  // Active point index (defaults to Today/Current instead of hardcoded last index)
  const activeIndex = useMemo(() => {
    const maxIdx = Math.max(0, graphBuckets.length - 1);
    if (selectedBarIndex !== null) {
      return Math.min(Math.max(0, selectedBarIndex), maxIdx);
    }
    return Math.min(Math.max(0, defaultIndex), maxIdx);
  }, [selectedBarIndex, defaultIndex, graphBuckets.length]);

  const activePoint = points[activeIndex] ?? points[0];
  const activeBucket =
    activePoint?.bucket ?? graphBuckets[activeIndex] ?? graphBuckets[0];

  // Daily average spend calculation
  const dailyAverageSpend = useMemo(() => {
    const daysInPeriod =
      timeRange === "week" ? 7 : timeRange === "month" ? 30 : 365;
    const avg = totalPeriodExpense / daysInPeriod;
    return Math.round(avg);
  }, [totalPeriodExpense, timeRange]);

  // Top category
  const topCategory = categoryBreakdown[0];

  const handleChartLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width > 0) {
      setChartWidth(width);
    }
  };

  return (
    <View className="flex-1 bg-bg-light dark:bg-bg-dark">
      <BlurTargetView ref={blurTargetRef} className="flex-1">
        <Animated.ScrollView
          className="flex-1"
          contentContainerStyle={{
            alignItems: "center",
            paddingHorizontal: 16,
            paddingTop: topHeaderPadding,
            paddingBottom: 110,
          }}
          scrollIndicatorInsets={{ top: topHeaderPadding, bottom: 90 }}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true },
          )}
        >
          <View
            className="w-full gap-4.5"
            style={{ maxWidth: MaxContentWidth }}
          >
            {/* Header */}
            <View className="py-1">
              <Text className="text-[11px] font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                FINANCIAL INTELLIGENCE
              </Text>
              <Text className="text-3xl font-extrabold tracking-tight text-text-primary-light dark:text-text-primary-dark mt-0.5">
                Analytics
              </Text>
            </View>

            {/* Time Range Selector */}
            <View className="flex-row h-11 rounded-3xl p-1 bg-card-light dark:bg-card-dark border border-black/5 dark:border-white/5">
              {(
                [
                  { id: "week", label: "Week" },
                  { id: "month", label: "Month" },
                  { id: "ytd", label: "YTD" },
                ] as const
              ).map((option) => {
                const isActive = timeRange === option.id;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => {
                      setTimeRange(option.id);
                      setSelectedBarIndex(null);
                    }}
                    className={`flex-1 items-center justify-center rounded-3xl transition-all ${
                      isActive ? "bg-brand-perano shadow-xs" : "bg-transparent"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        isActive
                          ? "text-brand-dark-purple dark:text-light font-bold"
                          : "text-text-secondary-dark dark:text-text-secondary-light"
                      }`}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Account Filter Chips */}
            <View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                <Pressable
                  onPress={() => selectAccount(null)}
                  className={`flex-row items-center gap-2 px-3.5 py-2 rounded-full border active:opacity-80 ${
                    selectedAccountId === null
                      ? "bg-brand-perano border-brand-perano"
                      : isDark
                        ? "bg-chip-dark border-white/5"
                        : "bg-chip-light border-black/5"
                  }`}
                >
                  <SymbolView
                    name={{
                      ios: "square.grid.2x2.fill",
                      android: "dashboard",
                      web: "dashboard",
                    }}
                    size={14}
                    tintColor={
                      selectedAccountId === null
                        ? "#1E1F24"
                        : isDark
                          ? "#E4E5EB"
                          : "#1E1F24"
                    }
                  />
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
                  const accIcon = getAccountTypeIcon(acc.type);
                  return (
                    <Pressable
                      key={acc.id}
                      onPress={() => selectAccount(acc.id)}
                      className={`flex-row items-center gap-2 px-3.5 py-2 rounded-full border active:opacity-80 ${
                        isSelected
                          ? "bg-brand-perano border-brand-perano"
                          : isDark
                            ? "bg-chip-dark border-white/5"
                            : "bg-chip-light border-black/5"
                      }`}
                    >
                      <SymbolView
                        name={{
                          ios: accIcon.ios as any,
                          android: accIcon.android,
                          web: accIcon.web,
                        }}
                        size={14}
                        tintColor={
                          isSelected
                            ? "#1E1F24"
                            : isDark
                              ? "#E4E5EB"
                              : "#1E1F24"
                        }
                      />
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

            {/* ─── Modern Interactive Line Graph Card (Starts with Sunday) ─── */}
            <View className="rounded-3xl p-5 bg-card-light dark:bg-card-dark border border-black/5 dark:border-white/5 gap-3.5">
              {/* Card Header & Selected Inspector */}
              <View className="flex-row items-start justify-between">
                <View className="gap-0.5">
                  <Text className="text-[11px] font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                    SPENDING ACTIVITY
                  </Text>
                  <Text className="text-2xl font-extrabold tracking-tight text-text-primary-light dark:text-text-primary-dark">
                    {formatAmt(activeBucket?.expense ?? totalPeriodExpense)}
                  </Text>
                  <Text className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">
                    {activeBucket?.label ?? "Selected Period"}
                    {activeBucket && activeBucket.txCount > 0
                      ? ` • ${activeBucket.txCount} transaction${activeBucket.txCount > 1 ? "s" : ""}`
                      : ""}
                  </Text>
                </View>

                {/* Savings / Trend Badge: Shows trend icon and % of income or expense */}
                <View
                  className={`px-3 py-1.5 rounded-full flex-row items-center gap-1.5 ${performanceBadge.bgClass}`}
                >
                  <SymbolView
                    name={{
                      ios: performanceBadge.isPositive
                        ? "chart.line.downtrend.xyaxis"
                        : "chart.line.uptrend.xyaxis",
                      android: performanceBadge.isPositive
                        ? "trending_down"
                        : "trending_up",
                      web: performanceBadge.isPositive
                        ? "trending_down"
                        : "trending_up",
                    }}
                    size={11}
                    tintColor={performanceBadge.tintColor}
                  />
                  <Text
                    className={`text-xs font-bold ${performanceBadge.textClass}`}
                  >
                    {performanceBadge.text}
                  </Text>
                </View>
              </View>

              {/* ─── SVG Curved Line Graph Canvas ─── */}
              <View
                onLayout={handleChartLayout}
                className="w-full relative pt-2"
              >
                <Svg width={chartWidth} height={chartHeight}>
                  <Defs>
                    <SvgLinearGradient
                      id="areaGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <Stop
                        offset="0%"
                        stopColor="#AB9FF2"
                        stopOpacity={isDark ? "0.40" : "0.30"}
                      />
                      <Stop
                        offset="80%"
                        stopColor="#AB9FF2"
                        stopOpacity="0.04"
                      />
                      <Stop offset="100%" stopColor="#AB9FF2" stopOpacity="0" />
                    </SvgLinearGradient>
                  </Defs>

                  {/* Horizontal Baseline Reference Guide */}
                  <Line
                    x1={sidePadding}
                    y1={chartHeight - bottomPadding}
                    x2={chartWidth - sidePadding}
                    y2={chartHeight - bottomPadding}
                    stroke={
                      isDark
                        ? "rgba(255, 255, 255, 0.08)"
                        : "rgba(0, 0, 0, 0.06)"
                    }
                    strokeWidth={1}
                  />

                  {/* Mid-level dashed guideline */}
                  <Line
                    x1={sidePadding}
                    y1={
                      topPadding +
                      (chartHeight - topPadding - bottomPadding) / 2
                    }
                    x2={chartWidth - sidePadding}
                    y2={
                      topPadding +
                      (chartHeight - topPadding - bottomPadding) / 2
                    }
                    stroke={
                      isDark
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(0, 0, 0, 0.04)"
                    }
                    strokeDasharray="4 4"
                    strokeWidth={1}
                  />

                  {/* Area Gradient Fill */}
                  {areaPath ? (
                    <Path d={areaPath} fill="url(#areaGradient)" />
                  ) : null}

                  {/* Smooth Bezier Line Path */}
                  {linePath ? (
                    <Path
                      d={linePath}
                      fill="none"
                      stroke="#AB9FF2"
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ) : null}

                  {/* Selected Point Vertical Indicator Dashed Guide */}
                  {activePoint && (
                    <Line
                      x1={activePoint.x}
                      y1={topPadding}
                      x2={activePoint.x}
                      y2={chartHeight - bottomPadding}
                      stroke="#AB9FF2"
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                      opacity={0.65}
                    />
                  )}

                  {/* Data Point Dots */}
                  {points.map((pt) => {
                    const isSelected = pt.index === activeIndex;
                    return (
                      <G key={pt.bucket.label}>
                        {isSelected && (
                          <Circle
                            cx={pt.x}
                            cy={pt.y}
                            r={9}
                            fill="#AB9FF2"
                            opacity={0.25}
                          />
                        )}
                        <Circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isSelected ? 5 : 3.5}
                          fill={
                            isSelected
                              ? "#AB9FF2"
                              : isDark
                                ? "#202227"
                                : "#FFFFFF"
                          }
                          stroke="#AB9FF2"
                          strokeWidth={isSelected ? 2.5 : 2}
                        />
                      </G>
                    );
                  })}
                </Svg>

                {/* Floating Tooltip Pill over Active Point */}
                {activePoint && (
                  <View
                    style={{
                      position: "absolute",
                      left: Math.max(
                        8,
                        Math.min(chartWidth - 84, activePoint.x - 38),
                      ),
                      top: Math.max(2, activePoint.y - 32),
                    }}
                    pointerEvents="none"
                    className="bg-brand-dark-purple dark:bg-chip-dark border border-transparent dark:border-brand-perano/40 px-2 py-0.5 rounded-lg shadow-sm items-center"
                  >
                    <Text className="text-[10px] font-bold text-white dark:text-brand-perano">
                      {formatAmt(activePoint.bucket.expense)}
                    </Text>
                  </View>
                )}

                {/* Invisible Touch Scrub Target Overlay */}
                <View className="absolute inset-0 flex-row">
                  {points.map((pt) => (
                    <Pressable
                      key={pt.bucket.label}
                      onPress={() => setSelectedBarIndex(pt.index)}
                      className="flex-1 h-full"
                      accessibilityRole="button"
                      accessibilityLabel={`${pt.bucket.fullLabel}: ${formatAmt(pt.bucket.expense)}`}
                    />
                  ))}
                </View>
              </View>

              {/* Day / Period Labels Row below Line Graph (Starts with Sunday) */}
              <View className="flex-row justify-between px-1">
                {graphBuckets.map((bucket, idx) => {
                  const isSelected = idx === activeIndex;
                  return (
                    <Pressable
                      key={bucket.label}
                      onPress={() => setSelectedBarIndex(idx)}
                      className="items-center py-1 px-1.5 rounded-lg active:opacity-70"
                    >
                      <Text
                        className={`text-xs transition-all ${
                          isSelected
                            ? "font-bold text-brand-dark-purple dark:text-brand-perano"
                            : "font-semibold text-text-secondary-light dark:text-text-secondary-dark"
                        }`}
                      >
                        {bucket.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Tap Helper Hint */}
              <View className="pt-2 border-t border-black/5 dark:border-white/5 flex-row items-center justify-between">
                <Text className="text-[11px] font-medium text-text-secondary-light dark:text-text-secondary-dark">
                  💡 Tap points along the curve to inspect spending
                </Text>
                {selectedBarIndex !== null &&
                  selectedBarIndex !== defaultIndex && (
                    <Pressable
                      onPress={() => setSelectedBarIndex(null)}
                      className="px-2.5 py-1 rounded-full bg-brand-perano/20 border border-brand-perano/30 active:opacity-70"
                    >
                      <Text className="text-[11px] font-bold text-brand-dark-purple dark:text-brand-perano">
                        {timeRange === "week" ? "Today" : "Current"}
                      </Text>
                    </Pressable>
                  )}
              </View>
            </View>

            {/* ─── Key Financial Metrics (3-Card Summary Grid) ─── */}
            <View className="flex-row gap-3">
              {/* Daily Average */}
              <View className="flex-1 rounded-2xl p-3.5 bg-card-light dark:bg-card-dark border border-black/5 dark:border-white/5 gap-1">
                <Text className="text-[11px] font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                  Daily Avg
                </Text>
                <Text className="text-base font-bold text-text-primary-light dark:text-text-primary-dark">
                  {formatAmt(dailyAverageSpend)}
                </Text>
                <Text className="text-[11px] font-medium text-text-secondary-light dark:text-text-secondary-dark">
                  per day
                </Text>
              </View>

              {/* Top Category */}
              <View className="flex-1 rounded-2xl p-3.5 bg-card-light dark:bg-card-dark border border-black/5 dark:border-white/5 gap-1">
                <Text className="text-[11px] font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                  Category
                </Text>
                <Text
                  numberOfLines={1}
                  className="text-base font-bold text-text-primary-light dark:text-text-primary-dark"
                >
                  {topCategory?.category ?? "None"}
                </Text>
                <Text className="text-[11px] font-medium text-text-secondary-light dark:text-text-secondary-dark">
                  {topCategory ? `${topCategory.percentage}% of total` : "0%"}
                </Text>
              </View>

              {/* Period Total */}
              <View className="flex-1 rounded-2xl p-3.5 bg-card-light dark:bg-card-dark border border-black/5 dark:border-white/5 gap-1">
                <Text className="text-[11px] font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                  Total
                </Text>
                <Text className="text-base font-bold text-text-primary-light dark:text-text-primary-dark">
                  {formatAmt(totalPeriodExpense)}
                </Text>
                <Text className="text-[11px] font-medium text-text-secondary-light dark:text-text-secondary-dark">
                  this {timeRange}
                </Text>
              </View>
            </View>

            {/* ─── Category Spending Breakdown with Segmented Distribution Bar ─── */}
            <View className="gap-2.5">
              <View className="flex-row items-center justify-between px-1">
                <Text className="text-[11px] font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                  SPENDING BY CATEGORY
                </Text>
                <Text className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                  {categoryBreakdown.length} categor
                  {categoryBreakdown.length === 1 ? "y" : "ies"}
                </Text>
              </View>

              <View className="rounded-3xl bg-card-light dark:bg-card-dark border border-black/5 dark:border-white/5 p-4.5 gap-4 overflow-hidden">
                {/* ─── Segmented Multi-Color Distribution Bar ─── */}
                <View className="gap-2">
                  <View className="h-3 rounded-full overflow-hidden flex-row bg-black/5 dark:bg-white/10 gap-0.5">
                    {categoryBreakdown.length === 0 ? (
                      <View className="h-full w-full bg-black/5 dark:bg-white/5" />
                    ) : (
                      categoryBreakdown.map((item) => {
                        const meta = CATEGORY_ICONS[item.category];
                        const barColor = meta?.color ?? "#AB9FF2";
                        return (
                          <View
                            key={item.category}
                            className="h-full rounded-sm"
                            style={{
                              width: `${Math.max(2, item.percentage)}%`,
                              backgroundColor: barColor,
                            }}
                          />
                        );
                      })
                    )}
                  </View>

                  {/* Top 3 Legend Chips */}
                  {categoryBreakdown.length > 0 && (
                    <View className="flex-row flex-wrap gap-2 pt-1">
                      {categoryBreakdown.slice(0, 4).map((item) => {
                        const meta = CATEGORY_ICONS[item.category];
                        const dotColor = meta?.color ?? "#AB9FF2";
                        return (
                          <View
                            key={item.category}
                            className="flex-row items-center gap-1.5"
                          >
                            <View
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: dotColor }}
                            />
                            <Text className="text-[11px] font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                              {item.category} ({item.percentage}%)
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>

                {/* Category Item Rows */}
                {categoryBreakdown.length === 0 ? (
                  <View className="py-6 items-center justify-center">
                    <Text className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                      No expense records in this period
                    </Text>
                  </View>
                ) : (
                  <View className="gap-3 pt-1">
                    {categoryBreakdown.map((item, idx) => {
                      const meta = CATEGORY_ICONS[item.category] ?? {
                        sf: "tag.fill",
                        material: "label",
                        color: "#AB9FF2",
                      };
                      const isLast = idx === categoryBreakdown.length - 1;
                      const catColor = meta.color;

                      return (
                        <View key={item.category} className="gap-2.5">
                          <View className="flex-row items-center gap-3">
                            {/* Icon inside category-colored badge */}
                            <View
                              className="w-10 h-10 rounded-2xl items-center justify-center"
                              style={{ backgroundColor: `${catColor}1F` }}
                            >
                              <SymbolView
                                name={{
                                  ios: meta.sf,
                                  android: meta.material,
                                  web: meta.material,
                                }}
                                size={18}
                                tintColor={catColor}
                              />
                            </View>

                            <View className="flex-1">
                              <View className="flex-row justify-between items-center">
                                <Text className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
                                  {item.category}
                                </Text>
                                <Text className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
                                  {formatAmt(item.amount)}
                                </Text>
                              </View>

                              <View className="flex-row justify-between items-center mt-0.5">
                                <Text className="text-[12px] font-medium text-text-secondary-light dark:text-text-secondary-dark">
                                  {item.count} transaction
                                  {item.count > 1 ? "s" : ""}
                                </Text>
                                <Text className="text-[11px] font-bold text-text-secondary-light dark:text-text-secondary-dark">
                                  {item.percentage}%
                                </Text>
                              </View>
                            </View>
                          </View>

                          {/* Progress Track */}
                          <View className="h-1.5 rounded-full overflow-hidden bg-black/5 dark:bg-white/10 ml-13">
                            <View
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(100, item.percentage)}%`,
                                backgroundColor: catColor,
                              }}
                            />
                          </View>

                          {!isLast && (
                            <View className="h-[1px] ml-13 bg-black/5 dark:bg-white/5 my-0.5" />
                          )}
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            </View>

            {/* ─── Cash Flow Comparison Card ─── */}
            <View className="rounded-3xl p-5 bg-card-light dark:bg-card-dark border border-black/5 dark:border-white/5 gap-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-[11px] font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                  CASH FLOW COMPARISON
                </Text>
                <View className="bg-emerald-500/15 px-2.5 py-1 rounded-full">
                  <Text className="text-emerald-500 dark:text-emerald-400 text-xs font-bold">
                    {savingsRate !== null
                      ? `${formatPercentage(savingsRate)} Saved`
                      : "0% Saved"}
                  </Text>
                </View>
              </View>

              <View className="gap-3">
                {/* Income Bar */}
                <View className="gap-1.5">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                      Income
                    </Text>
                    <View className="flex-row items-center gap-1">
                      <SymbolView
                        name={{
                          ios: "arrow.up",
                          android: "arrow_upward",
                          web: "arrow_upward",
                        }}
                        size={11}
                        tintColor="#2EC08B"
                      />
                      <Text className="text-sm font-bold text-emerald-500 dark:text-emerald-400">
                        {formatAmt(monthlyIncome)}
                      </Text>
                    </View>
                  </View>
                  <View className="h-2 rounded-full overflow-hidden bg-black/5 dark:bg-white/10">
                    <View
                      className="h-full rounded-full bg-emerald-500"
                      style={{
                        width: `${Math.round(
                          (monthlyIncome /
                            Math.max(monthlyIncome, monthlyExpenses, 1)) *
                            100,
                        )}%`,
                      }}
                    />
                  </View>
                </View>

                {/* Expenses Bar */}
                <View className="gap-1.5">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                      Expenses
                    </Text>
                    <View className="flex-row items-center gap-1">
                      <SymbolView
                        name={{
                          ios: "arrow.down",
                          android: "arrow_downward",
                          web: "arrow_downward",
                        }}
                        size={11}
                        tintColor="#FF3B30"
                      />
                      <Text className="text-sm font-bold text-rose-500 dark:text-rose-400">
                        {formatAmt(monthlyExpenses)}
                      </Text>
                    </View>
                  </View>
                  <View className="h-2 rounded-full overflow-hidden bg-black/5 dark:bg-white/10">
                    <View
                      className="h-full rounded-full bg-rose-500"
                      style={{
                        width: `${Math.round(
                          (monthlyExpenses /
                            Math.max(monthlyIncome, monthlyExpenses, 1)) *
                            100,
                        )}%`,
                      }}
                    />
                  </View>
                </View>
              </View>

              {/* Net Cash Flow Summary Footer */}
              <View className="flex-row justify-between items-center pt-3 border-t border-black/5 dark:border-white/5">
                <Text className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                  Net Surplus
                </Text>
                <View className="flex-row items-center gap-1">
                  <SymbolView
                    name={{
                      ios: monthlySavings >= 0 ? "arrow.up" : "arrow.down",
                      android:
                        monthlySavings >= 0 ? "arrow_upward" : "arrow_downward",
                      web:
                        monthlySavings >= 0 ? "arrow_upward" : "arrow_downward",
                    }}
                    size={12}
                    tintColor={monthlySavings >= 0 ? "#2EC08B" : "#FF3B30"}
                  />
                  <Text
                    className={`text-sm font-extrabold ${
                      monthlySavings >= 0
                        ? "text-emerald-500 dark:text-emerald-400"
                        : "text-rose-500 dark:text-rose-400"
                    }`}
                  >
                    {formatAmt(Math.abs(monthlySavings))}
                  </Text>
                </View>
              </View>
            </View>

            {/* ─── Annual Savings Goal Progress Card ─── */}
            <View className="rounded-3xl p-5 bg-card-light dark:bg-card-dark border border-black/5 dark:border-white/5 gap-3.5">
              <View className="flex-row items-center justify-between">
                <Text className="text-[11px] font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                  2026 ANNUAL SAVINGS GOAL
                </Text>
                <Text className="text-xs font-bold text-brand-perano">
                  {formatPercentage(annualGoalProgress.percentage)}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <View>
                  <Text className="text-[11px] font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                    Total Saved YTD
                  </Text>
                  <Text className="text-base font-bold text-text-primary-light dark:text-text-primary-dark mt-0.5">
                    {formatAmt(monthlySavings > 0 ? monthlySavings : 0)}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-[11px] font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                    Target Goal
                  </Text>
                  <Text className="text-base font-bold text-text-primary-light dark:text-text-primary-dark mt-0.5">
                    {formatAmt(profile.annualSavingsGoal)}
                  </Text>
                </View>
              </View>

              <View className="h-2 rounded-full overflow-hidden bg-black/5 dark:bg-white/10">
                <View
                  className="h-full rounded-full bg-brand-perano"
                  style={{
                    width: `${Math.min(100, Math.round(annualGoalProgress.percentage))}%`,
                  }}
                />
              </View>
            </View>
          </View>
        </Animated.ScrollView>
      </BlurTargetView>
    </View>
  );
}
