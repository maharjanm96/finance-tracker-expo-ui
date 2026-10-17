import { SymbolView } from "expo-symbols";
import React from "react";
import {
  Platform,
  Pressable,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppTheme } from "@/context/theme-context";

interface BottomFloatingBarProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onPressAdd: () => void;
  onFocusSearch?: () => void;
}

export function BottomFloatingBar({
  searchQuery,
  onSearchChange,
  onPressAdd,
  onFocusSearch,
}: BottomFloatingBarProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useAppTheme();

  const bottomInset = Platform.OS === "ios" ? Math.max(insets.bottom + 6, 16) : 18;

  return (
    <View
      pointerEvents="box-none"
      className="absolute left-0 right-0 z-20 px-4 flex-row items-center gap-3"
      style={{ bottom: bottomInset }}
    >
      {/* Left / Center: Rounded Stadium Search Bar */}
      <View
        className={`flex-1 flex-row items-center h-12 px-4 rounded-full border ${
          isDark
            ? "bg-surface-dark border-white/10"
            : "bg-[#F3F2F8] border-black/5"
        } shadow-lg`}
      >
        <SymbolView
          name={{
            ios: "magnifyingglass",
            android: "search",
            web: "search",
          }}
          size={16}
          tintColor={isDark ? "#989BA5" : "#8E8E93"}
        />
        <TextInput
          value={searchQuery}
          onChangeText={onSearchChange}
          onFocus={onFocusSearch}
          placeholder="Search transactions..."
          placeholderTextColor={isDark ? "#989BA5" : "#8E8E93"}
          className="flex-1 ml-2.5 text-[15px] font-medium text-text-light dark:text-text-dark"
          returnKeyType="search"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <Pressable
            onPress={() => onSearchChange("")}
            hitSlop={8}
            className="p-1 active:opacity-70"
            accessibilityRole="button"
            accessibilityLabel="Clear search"
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

      {/* Right: Circular Purple Floating '+' Button */}
      <Pressable
        onPress={onPressAdd}
        className="w-12 h-12 rounded-full bg-brand-perano items-center justify-center active:scale-95 shadow-lg"
        accessibilityRole="button"
        accessibilityLabel="Add transaction"
      >
        <SymbolView
          name={{
            ios: "plus",
            android: "add",
            web: "add",
          }}
          size={22}
          tintColor={isDark ? "#121316" : "#FFFFFF"}
        />
      </Pressable>
    </View>
  );
}
