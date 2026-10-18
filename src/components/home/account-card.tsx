import { LinearGradient } from "expo-linear-gradient";
import { SymbolView } from "expo-symbols";
import { DimensionValue, Pressable, Text, View } from "react-native";

import { getCurrencyInfo } from "@/constants/currencies";
import { useExpense } from "@/context/expense-context";
import { useAppTheme } from "@/context/theme-context";
import { formatCurrency } from "@/domain/formatters";
import { Account } from "@/domain/types";

interface AccountCardProps {
  account: Account;
  balance: number;
  monthlyExpense?: number;
  isSelected: boolean;
  onSelect: () => void;
  width?: DimensionValue;
  isCombined?: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  savings: "Savings",
  spending: "Daily Spending",
  emergency: "Emergency Fund",
  cash: "Cash Wallet",
  investment: "Investment",
};

/**
 * Realistic tactile EMV Chip with circuit geometry & contactless wave icon
 */
function EmvChip({
  isDark,
  isCombined,
}: {
  isDark: boolean;
  isCombined?: boolean;
}) {
  return (
    <View className="flex-row items-center gap-2.5">
      {/* Metallic Chip Graphic */}
      <View
        className="w-9 h-6.5 rounded-md justify-between p-1 border overflow-hidden"
        style={{
          backgroundColor: isDark
            ? isCombined
              ? "#3B3258"
              : "#2A2821"
            : isCombined
              ? "#EAE5FA"
              : "#F4EBD0",
          borderColor: isDark
            ? isCombined
              ? "#7A6BA8"
              : "#6B5E38"
            : isCombined
              ? "#AB9FF2"
              : "#D4AF37",
        }}
      >
        <View className="flex-row justify-between">
          <View
            className="w-2.5 h-1.5 rounded-[2px] border"
            style={{
              borderColor: isDark
                ? isCombined
                  ? "#9E8DD4"
                  : "#8A7947"
                : isCombined
                  ? "#8C7FD4"
                  : "#C5A030",
            }}
          />
          <View
            className="w-2.5 h-1.5 rounded-[2px] border"
            style={{
              borderColor: isDark
                ? isCombined
                  ? "#9E8DD4"
                  : "#8A7947"
                : isCombined
                  ? "#8C7FD4"
                  : "#C5A030",
            }}
          />
        </View>
        <View
          className="h-[0.5px] w-full"
          style={{
            backgroundColor: isDark
              ? isCombined
                ? "#7A6BA8"
                : "#6B5E38"
              : isCombined
                ? "#AB9FF2"
                : "#D4AF37",
          }}
        />
        <View className="flex-row justify-between">
          <View
            className="w-2.5 h-1.5 rounded-[2px] border"
            style={{
              borderColor: isDark
                ? isCombined
                  ? "#9E8DD4"
                  : "#8A7947"
                : isCombined
                  ? "#8C7FD4"
                  : "#C5A030",
            }}
          />
          <View
            className="w-2.5 h-1.5 rounded-[2px] border"
            style={{
              borderColor: isDark
                ? isCombined
                  ? "#9E8DD4"
                  : "#8A7947"
                : isCombined
                  ? "#8C7FD4"
                  : "#C5A030",
            }}
          />
        </View>
      </View>

      {/* Contactless waves icon */}
      <SymbolView
        name={{
          ios: "wave.3.right",
          android: "contactless",
          web: "contactless",
        }}
        size={15}
        tintColor={isDark ? "#989BA5" : "#6C6C70"}
      />
    </View>
  );
}

/**
 * Modern overlapping dual-circle debit card network badge
 */
function CardBrandIcon({ isCombined }: { isCombined?: boolean }) {
  return (
    <View className="flex-row items-center -space-x-2">
      <View
        className="w-5.5 h-5.5 rounded-full opacity-90 shadow-2xs"
        style={{
          backgroundColor: isCombined ? "#AB9FF2" : "#AB9FF2",
        }}
      />
      <View
        className="w-5.5 h-5.5 rounded-full"
        style={{
          backgroundColor: isCombined
            ? "rgba(60, 49, 91, 0.75)"
            : "rgba(60, 49, 91, 0.7)",
        }}
      />
    </View>
  );
}

/**
 * Generate a consistent 4-digit card suffix from account ID
 */
function getCardSuffix(accountId: string, isCombined?: boolean): string {
  if (isCombined) return "ALL";
  const digits = accountId.replace(/\D/g, "");
  if (digits.length >= 4) return digits.slice(-4);
  let hash = 0;
  for (let i = 0; i < accountId.length; i++) {
    hash = (hash * 31 + accountId.charCodeAt(i)) % 9000;
  }
  return String(1000 + hash);
}

export function AccountCard({
  account,
  balance,
  isSelected,
  onSelect,
  width,
  isCombined,
}: AccountCardProps) {
  const { isDark } = useAppTheme();
  const { currencyInfo } = useExpense();

  const cardSuffix = getCardSuffix(account.id, isCombined);

  // Gradient themes:
  // Combined card gets a signature deep amethyst / perano metallic tone
  // Individual cards get sleek charcoal titanium
  const gradientColors = isCombined
    ? isDark
      ? isSelected
        ? (["#362E52", "#231F35", "#161520"] as const)
        : (["#2A253C", "#1E1A2B", "#14131C"] as const)
      : isSelected
        ? (["#FFFFFF", "#F5F2FF", "#EBE4FC"] as const)
        : (["#FFFFFF", "#F8F6FD", "#EFF0F7"] as const)
    : isDark
      ? isSelected
        ? (["#2E2A42", "#1F1F2A", "#15161A"] as const)
        : (["#252731", "#1C1E24", "#131417"] as const)
      : isSelected
        ? (["#FFFFFF", "#F6F4FF", "#ECE7FC"] as const)
        : (["#FFFFFF", "#F8F9FA", "#EEF1F5"] as const);

  return (
    <Pressable
      onPress={onSelect}
      className="rounded-[24px] overflow-hidden active:scale-[0.985] transition-all"
      style={{
        width: width ?? "100%",
        height: 195,
        shadowColor: isSelected ? "#AB9FF2" : "#000000",
        shadowOffset: { width: 0, height: isSelected ? 8 : 4 },
        shadowOpacity: isSelected
          ? isDark
            ? 0.35
            : 0.22
          : isDark
            ? 0.25
            : 0.08,
        shadowRadius: isSelected ? 16 : 8,
        elevation: isSelected ? 8 : 3,
      }}
      accessibilityRole="button"
      accessibilityLabel={`${account.name}, balance ${formatCurrency(balance, currencyInfo.symbol)}, ${isSelected ? "selected active account" : ""}`}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
          padding: 20,
          justifyContent: "space-between",
          borderRadius: 24,
        }}
        className={`border ${
          isSelected
            ? "border-brand-perano"
            : isDark
              ? "border-white/10"
              : "border-black/5"
        }`}
      >
        {/* ─── 1. Top Row: EMV Chip & Contactless on Left, Card Brand Network on Right ─── */}
        <View className="flex-row items-center justify-between">
          <EmvChip isDark={isDark} isCombined={isCombined} />
          <CardBrandIcon isCombined={isCombined} />
        </View>

        {/* ─── 2. Middle Section: Giant Minimalist Balance & Masked Card Digits ─── */}
        <View className="gap-1 my-0.5">
          <Text
            numberOfLines={1}
            className="text-3xl font-extrabold tracking-tight text-text-primary-light dark:text-text-primary-dark"
          >
            {formatCurrency(balance, currencyInfo.symbol)}
          </Text>

          {/* Masked Card Number */}
          <Text className="text-[11px] font-semibold tracking-[3px] text-text-secondary-light/70 dark:text-text-secondary-dark/70 font-mono">
            •••• •••• •••• {cardSuffix}
          </Text>
        </View>

        {/* ─── 3. Bottom Row: Account Details (Left) & Active Status Badge (Right) ─── */}
        <View className="flex-row items-center justify-between pt-0.5">
          {/* Account Title & Subtitle */}
          <View className="flex-1 mr-3">
            <Text
              numberOfLines={1}
              className="text-[15px] font-bold text-text-primary-light dark:text-text-primary-dark tracking-tight"
            >
              {account.name}
            </Text>
            <Text
              numberOfLines={1}
              className="text-[10px] font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mt-0.5"
            >
              {isCombined
                ? account.institution || "Combined Portfolio"
                : (TYPE_LABELS[account.type] ?? "Account") +
                  (account.institution ? ` • ${account.institution}` : "")}
            </Text>
          </View>

          {/* Right: Active Status Badge (No delete icon on card) */}
          {isSelected && (
            <View className="flex-row items-center gap-1.5 bg-brand-perano/20 px-2 py-1 rounded-full border border-brand-perano/35">
              <View className="w-1 h-1 rounded-full bg-brand-perano" />
              <Text className="text-[9px] font-extrabold tracking-wider text-brand-dark-purple dark:text-brand-perano">
                ACTIVE
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </Pressable>
  );
}
