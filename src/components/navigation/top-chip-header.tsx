import { BlurView } from "expo-blur";
import { StatusBar } from "expo-status-bar";
import { useRef } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useExpense } from "@/context/expense-context";
import { useAppTheme } from "@/context/theme-context";

interface TopChipHeaderProps {
  activeTab: number;
  onSelectTab: (index: number) => void;
  onPressAvatar?: () => void;
}

const TABS = ["Home", "Transactions", "Analytics"] as const;

/**
 * Total height of the top chip header including status bar safe area inset.
 */
export function getTopHeaderHeight(insetsTop: number) {
  const topSafe = Math.max(insetsTop, Platform.OS === "ios" ? 44 : 24);
  return topSafe + (Platform.OS === "ios" ? 6 : 8) + 48 + 10;
}

/**
 * Recommended top padding for scrollable screen content so the initial view
 * clears the floating chip header and smoothly glides under the frosted glass when scrolled.
 */
export function getTopHeaderPadding(insetsTop: number) {
  return getTopHeaderHeight(insetsTop) + 6;
}

export function TopChipHeader({
  activeTab,
  onSelectTab,
  onPressAvatar,
}: TopChipHeaderProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useAppTheme();
  const { profile } = useExpense();
  const scrollRef = useRef<ScrollView>(null);

  const topInset =
    Math.max(insets.top, Platform.OS === "ios" ? 44 : 24) +
    (Platform.OS === "ios" ? 6 : 8);

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View
        className="absolute top-0 left-0 right-0 z-30 overflow-hidden border-b border-black/5 dark:border-white/10"
        style={{ paddingTop: topInset }}
      >
        {/* ─── Frosted Glass Blur Backdrop covering status bar and header ─── */}
        <BlurView
          intensity={Platform.OS === "ios" ? 75 : 85}
          tint={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />
        {/* Subtle translucent theme tint overlay */}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: isDark
                ? "rgba(18, 19, 22, 0.50)"
                : "rgba(255, 255, 255, 0.60)",
            },
          ]}
        />

        {/* Top Row: Avatar + Navigation Chips */}
        <View className="flex-row items-center gap-3 px-4 pb-2.5">
          {/* Avatar Circle */}
          <Pressable
            onPress={onPressAvatar}
            className="w-12 h-12 rounded-full bg-brand-perano items-center justify-center active:opacity-80 shadow-xs"
            accessibilityRole="button"
            accessibilityLabel="Profile avatar"
          >
            <Text className="text-2xl select-none font-black text-brand-dark-purple">
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
                  className={`px-4 py-2.5 rounded-full active:opacity-80 ${
                    isActive
                      ? "bg-brand-perano"
                      : isDark
                        ? "bg-chip-dark/80 border border-white/5"
                        : "bg-chip-light/80 border border-black/5"
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
      </View>
    </>
  );
}
