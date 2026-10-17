import { SymbolView } from "expo-symbols";
import { useRef } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useExpense } from "@/context/expense-context";
import { useAppTheme } from "@/context/theme-context";

interface TopChipHeaderProps {
  activeTab: number;
  onSelectTab: (index: number) => void;
  onPressWallet?: () => void;
}

const TABS = ["Home", "Transactions", "Analytics", "Profile"] as const;

export function TopChipHeader({
  activeTab,
  onSelectTab,
  onPressWallet,
}: TopChipHeaderProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useAppTheme();
  const { selectedAccount, profile } = useExpense();
  const scrollRef = useRef<ScrollView>(null);

  const topInset = insets.top + (Platform.OS === "ios" ? 8 : 12);

  return (
    <View
      className="w-full bg-bg-light dark:bg-bg-dark px-4 pb-2 z-10"
      style={{ paddingTop: topInset }}
    >
      {/* Top Row: Avatar + Navigation Chips */}
      <View className="flex-row items-center gap-3">
        {/* Avatar Circle */}
        <Pressable
          onPress={() => onSelectTab(3)}
          className="w-12 h-12 rounded-full bg-brand-perano items-center justify-center active:opacity-80 shadow-xs"
          accessibilityRole="button"
          accessibilityLabel="Profile avatar"
        >
          <Text className="text-xl select-none">
            {profile.name ? profile.name.charAt(0).toUpperCase() : "😎"}
          </Text>
        </Pressable>

        {/* Chips Horizontal Scroll */}
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, alignItems: "center" }}
        >
          {TABS.map((tab, idx) => {
            const isActive = activeTab === idx;
            return (
              <Pressable
                key={tab}
                onPress={() => onSelectTab(idx)}
                className={`px-4 py-3 rounded-full active:opacity-80 ${
                  isActive
                    ? "bg-brand-perano"
                    : isDark
                      ? "bg-chip-dark"
                      : "bg-chip-light"
                }`}
                accessibilityRole="tab"
                accessibilityState={isActive ? { selected: true } : {}}
              >
                <Text
                  className={`text-[15px] tracking-tight ${
                    isActive
                      ? "font-bold text-brand-dark-purple"
                      : isDark
                        ? "font-semibold text-text-secondary-dark"
                        : "font-semibold text-text-light"
                  }`}
                >
                  {tab}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Wallet Selector Row below Avatar */}
      <View className="flex-row items-center mt-2.5 px-0.5">
        <Pressable
          onPress={onPressWallet}
          className="flex-row items-center gap-1.5 py-1 px-2 -ml-2 rounded-lg active:opacity-70 max-w-[80%]"
          accessibilityRole="button"
          accessibilityLabel="Account wallet selector"
        >
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            className="text-[16px] font-bold tracking-tight text-text-light dark:text-text-dark"
          >
            {selectedAccount ? selectedAccount.name : "Combined Account"}
          </Text>
          <SymbolView
            name={{
              ios: "chevron.down",
              android: "keyboard_arrow_down",
              web: "keyboard_arrow_down",
            }}
            size={14}
            tintColor={isDark ? "#E4E5EB" : "#1E1F24"}
          />
        </Pressable>
      </View>
    </View>
  );
}
