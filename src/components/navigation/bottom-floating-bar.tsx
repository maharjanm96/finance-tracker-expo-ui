import { BlurView } from "expo-blur";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppTheme } from "@/context/theme-context";
import { TransactionType } from "@/domain/types";

interface BottomFloatingBarProps {
  onPressSearch: () => void;
  onPressAdd?: () => void;
  onSelectAction?: (type: TransactionType) => void;
}

interface SpeedDialAction {
  type: TransactionType;
  label: string;
  icon: {
    ios: string;
    android: string;
    web: string;
  };
}

const ACTIONS: SpeedDialAction[] = [
  {
    type: "income",
    label: "Income",
    icon: {
      ios: "arrow.down.left",
      android: "arrow_downward",
      web: "arrow_downward",
    },
  },
  {
    type: "expense",
    label: "Expense",
    icon: {
      ios: "arrow.up.right",
      android: "arrow_outward",
      web: "arrow_outward",
    },
  },
  {
    type: "transfer",
    label: "Transfer",
    icon: {
      ios: "arrow.left.arrow.right",
      android: "sync_alt",
      web: "sync_alt",
    },
  },
];

export function BottomFloatingBar({
  onPressSearch,
  onPressAdd,
  onSelectAction,
}: BottomFloatingBarProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useAppTheme();
  const [isOpen, setIsOpen] = useState(false);

  const [anim] = useState(() => new Animated.Value(0));

  const bottomInset =
    Platform.OS === "ios" ? Math.max(insets.bottom + 6, 16) : 18;
  const blurHeight = bottomInset + 48 + 10;

  const openMenu = () => {
    setIsOpen(true);
    Animated.spring(anim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 65,
      friction: 9,
    }).start();
  };

  const closeMenu = (callback?: () => void) => {
    Animated.timing(anim, {
      toValue: 0,
      duration: 150,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      setIsOpen(false);
      callback?.();
    });
  };

  const handleTriggerPress = () => {
    if (isOpen) {
      closeMenu();
    } else {
      if (onSelectAction) {
        openMenu();
      } else {
        onPressAdd?.();
      }
    }
  };

  const handleSelect = (type: TransactionType) => {
    setIsOpen(false);
    anim.setValue(0);
    if (onSelectAction) {
      onSelectAction(type);
    } else {
      onPressAdd?.();
    }
  };

  return (
    <>
      {/* ─── 1. Dimmed Backdrop Scrim (When Speed Dial is Open) ─── */}
      {isOpen && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: isDark
                ? "rgba(0, 0, 0, 0.70)"
                : "rgba(0, 0, 0, 0.45)",
              opacity: anim,
              zIndex: 40,
            },
          ]}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => closeMenu()}
          />
        </Animated.View>
      )}

      {/* ─── 2. Speed-dial Action Items (Income, Expense, Transfer) ─── */}
      {isOpen && (
        <Animated.View
          style={[
            styles.speedDialMenu,
            {
              bottom: bottomInset + 48 + 14,
              opacity: anim,
              transform: [
                {
                  translateY: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
                {
                  scale: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.85, 1],
                  }),
                },
              ],
            },
          ]}
        >
          {ACTIONS.map((action) => (
            <Pressable
              key={action.type}
              onPress={() => handleSelect(action.type)}
              className="flex-row items-center justify-end gap-3.5 active:opacity-80 py-1.5"
              accessibilityRole="button"
              accessibilityLabel={`Add ${action.label}`}
              hitSlop={8}
            >
              <Text
                style={styles.actionLabelText}
                className="text-[17px] font-bold text-white tracking-tight select-none"
              >
                {action.label}
              </Text>
              <View className="w-12 h-12 rounded-full bg-brand-perano items-center justify-center shadow-lg active:scale-95">
                <SymbolView
                  name={action.icon as any}
                  size={22}
                  tintColor={isDark ? "#121316" : "#3C315B"}
                />
              </View>
            </Pressable>
          ))}
        </Animated.View>
      )}

      {/* ─── 3. Frosted Glass Blur Backdrop ─── */}
      <View
        pointerEvents="none"
        style={[
          styles.backdropContainer,
          {
            height: blurHeight,
          },
        ]}
      >
        <BlurView
          intensity={Platform.OS === "ios" ? 30 : 100}
          tint={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />
        {/* Subtle theme tint overlay for deep contrast */}
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
      </View>

      {/* ─── 4. Floating Controls Row ─── */}
      <View
        pointerEvents="box-none"
        className="absolute left-0 right-0 z-50 px-4 flex-row items-center gap-3"
        style={{ bottom: bottomInset }}
      >
        {/* Left / Center: Rounded Stadium Search Bar Trigger */}
        <Pressable
          onPress={onPressSearch}
          style={[
            {
              backgroundColor: isDark
                ? "rgba(24, 25, 29, 0.85)"
                : "rgba(243, 242, 248, 0.88)",
              borderColor: isDark
                ? "rgba(255, 255, 255, 0.10)"
                : "rgba(0, 0, 0, 0.06)",
            },
          ]}
          className="flex-1 flex-row items-center h-12 px-4 rounded-full border shadow-lg active:opacity-80"
          accessibilityRole="button"
          accessibilityLabel="Open search"
        >
          <SymbolView
            name={{
              ios: "magnifyingglass",
              android: "search",
              web: "search",
            }}
            size={20}
            tintColor={isDark ? "#989BA5" : "#8E8E93"}
          />
          <Text className="flex-1 ml-2.5 text-[15px] font-medium text-text-secondary-light dark:text-text-secondary-dark">
            Search transactions, notes...
          </Text>
        </Pressable>

        {/* Right: Circular Floating Action Button (Toggles between '+' and '✕') */}
        {isOpen ? (
          <Pressable
            onPress={() => closeMenu()}
            className="w-12 h-12 rounded-full bg-[#1C1D22] dark:bg-[#202227] border border-white/10 items-center justify-center active:scale-95 shadow-xl"
            accessibilityRole="button"
            accessibilityLabel="Close action menu"
          >
            <SymbolView
              name={{
                ios: "xmark",
                android: "close",
                web: "close",
              }}
              size={20}
              tintColor="#FFFFFF"
            />
          </Pressable>
        ) : (
          <Pressable
            onPress={handleTriggerPress}
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
              size={24}
              tintColor={isDark ? "#121316" : "#FFFFFF"}
            />
          </Pressable>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  backdropContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    overflow: "hidden",
  },
  speedDialMenu: {
    position: "absolute",
    right: 16,
    zIndex: 45,
    alignItems: "flex-end",
    gap: 14,
  },
  actionLabelText: {
    textShadowColor: "rgba(0, 0, 0, 0.45)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
