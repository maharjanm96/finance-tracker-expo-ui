import { Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";
import React, { useEffect, useState } from "react";
import {
  Animated,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NativeGlassView } from "@/components/native-glass";
import { useAppTheme } from "@/context/theme-context";

type TabBarProps = Parameters<
  NonNullable<React.ComponentProps<typeof Tabs>["tabBar"]>
>[0];

function InstagramCapsuleTabBar({
  state,
  descriptors,
  navigation,
}: TabBarProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useAppTheme();
  const [containerWidth, setContainerWidth] = useState(0);

  // Filter out any hidden screens (e.g. href: null)
  const visibleRoutes = state.routes.filter((route) => {
    const { options } = descriptors[route.key];
    return (options as { href?: string | null })?.href !== null;
  });

  const activeVisibleIndex = visibleRoutes.findIndex(
    (route) => route.key === state.routes[state.index]?.key,
  );

  const safeActiveIndex = Math.max(0, activeVisibleIndex);
  const [slideAnim] = useState(() => new Animated.Value(safeActiveIndex));

  useEffect(() => {
    if (activeVisibleIndex >= 0) {
      Animated.spring(slideAnim, {
        toValue: activeVisibleIndex,
        tension: 100,
        friction: 12,
        useNativeDriver: true,
      }).start();
    }
  }, [activeVisibleIndex, slideAnim]);

  const numTabs = visibleRoutes.length;
  // Outer capsule padding is 6 on each side
  const innerWidth = containerWidth > 12 ? containerWidth - 12 : 0;
  const tabWidth = numTabs > 0 ? innerWidth / numTabs : 0;

  // Active pill indicator dimensions (matching the Instagram stadium pill)
  const pillPaddingX = 8;
  const indicatorWidth =
    tabWidth > pillPaddingX * 2 ? tabWidth - pillPaddingX * 2 : 0;

  const translateX =
    visibleRoutes.length > 0 && tabWidth > 0
      ? slideAnim.interpolate({
          inputRange: visibleRoutes.map((_, i) => i),
          outputRange: visibleRoutes.map((_, i) => i * tabWidth + pillPaddingX),
        })
      : 0;

  const onLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  const activeIconColor = isDark ? "#FFFFFF" : "#000000";
  const inactiveIconColor = isDark ? "#FFFFFF" : "#000000";

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.barWrapper,
        {
          bottom: Platform.OS === "ios" ? Math.max(insets.bottom + 8, 22) : 22,
        },
      ]}
    >
      {/* Outer shadow anchor */}
      <View
        style={[
          styles.shadowAnchor,
          isDark ? styles.shadowDark : styles.shadowLight,
        ]}
      >
        {/* Inner Floating Capsule */}
        <View
          onLayout={onLayout}
          style={[
            styles.capsuleContainer,
            isDark ? styles.capsuleDark : styles.capsuleLight,
          ]}
        >
          {/* iOS Translucent Glass Blur Backdrop */}
          <NativeGlassView
            glassEffectStyle="regular"
            tintColor={
              isDark ? "rgba(22, 23, 26, 0.94)" : "rgba(255, 255, 255, 0.94)"
            }
            intensity={95}
            blurTint={
              isDark ? "systemChromeMaterialDark" : "systemChromeMaterialLight"
            }
            style={StyleSheet.absoluteFill}
          />

          {/* Active Stadium Pill (Instagram style highlight) */}
          {indicatorWidth > 0 && (
            <Animated.View
              style={[
                styles.activePillIndicator,
                isDark ? styles.activePillDark : styles.activePillLight,
                {
                  width: indicatorWidth,
                  transform: [{ translateX }],
                },
              ]}
            />
          )}

          {/* Icon Tab Buttons (Pure icons, no labels) */}
          {visibleRoutes.map((route) => {
            const isFocused = state.routes[state.index]?.key === route.key;
            const { options } = descriptors[route.key];

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: "tabLongPress",
                target: route.key,
              });
            };

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={
                  options.tabBarAccessibilityLabel ?? `${route.name} tab`
                }
                testID={options.tabBarButtonTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                style={({ pressed }) => [
                  styles.tabButton,
                  pressed && styles.tabButtonPressed,
                ]}
              >
                <View style={styles.iconContainer}>
                  {options.tabBarIcon
                    ? options.tabBarIcon({
                        focused: isFocused,
                        color: isFocused ? activeIconColor : inactiveIconColor,
                        size: 22,
                      })
                    : null}
                  {/* Subtle red notification dot on Settings tab like Instagram UI */}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

export default function AppTabs() {
  return (
    <Tabs
      tabBar={(props) => <InstagramCapsuleTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <SymbolView
              name={{
                ios: focused ? "house.fill" : "house",
                android: "home",
                web: "home",
              }}
              size={26}
              tintColor={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
          tabBarIcon: ({ color, focused }) => (
            <SymbolView
              name={{
                ios: focused ? "list.bullet.rectangle.fill" : "list.bullet.rectangle",
                android: "receipt_long",
                web: "receipt_long",
              }}
              size={26}
              tintColor={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Analytics",
          tabBarIcon: ({ color, focused }) => (
            <SymbolView
              name={{
                ios: focused ? "chart.bar.fill" : "chart.bar",
                android: "insights",
                web: "insights",
              }}
              size={26}
              tintColor={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <SymbolView
              name={{
                ios: focused ? "person.crop.circle.fill" : "person.crop.circle",
                android: "account_circle",
                web: "account_circle",
              }}
              size={26}
              tintColor={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  barWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  shadowAnchor: {
    width: 340,
    maxWidth: "85%",
    height: 60,
    borderRadius: 28,
  },
  shadowLight: {
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
      },
    }),
  },
  shadowDark: {
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 24,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.45)",
      },
    }),
  },
  capsuleContainer: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 28,
    paddingHorizontal: 6,
    overflow: "hidden",
    position: "relative",
  },
  capsuleLight: {
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  capsuleDark: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    backgroundColor: "#16171A",
  },
  activePillIndicator: {
    position: "absolute",
    top: 5,
    bottom: 5,
    left: 6,
    borderRadius: 23,
  },
  activePillDark: {
    backgroundColor: "#3A3B3E", // Instagram iOS charcoal gray stadium pill
  },
  activePillLight: {
    backgroundColor: "#E5E5EA", // Clean monochrome light stadium pill
  },
  tabButton: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  tabButtonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.94 }],
  },
  iconContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
  },
});
