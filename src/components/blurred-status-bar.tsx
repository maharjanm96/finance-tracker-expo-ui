import { BlurMethod, BlurTargetView, BlurTint, BlurView } from "expo-blur";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppTheme } from "@/context/theme-context";

export { BlurTargetView };

export interface BlurredStatusBarProps {
  /**
   * Ref to a BlurTargetView for Android hardware-accelerated blur support.
   */
  blurTarget?: React.RefObject<View | null>;
  /**
   * Animated scroll value tracking the vertical scroll position (y).
   * When provided, the blur header fades in smoothly from 0 to maxScroll.
   */
  scrollY?: Animated.Value;
  /**
   * Scroll distance in pixels after which the status bar is 100% blurred.
   * @default 35
   */
  maxScroll?: number;
  /**
   * Blur intensity from 1 to 100.
   * @default 80
   */
  intensity?: number;
  /**
   * Blur tint mode: 'dark' | 'light' | 'default' | 'systemUltraThinMaterialDark', etc.
   */
  tint?: BlurTint;
  /**
   * Android blur method.
   * @default 'dimezisBlurViewSdk31Plus'
   */
  blurMethod?: BlurMethod;
  /**
   * Number by which blur intensity is divided on Android.
   * @default 4
   */
  blurReductionFactor?: number;
  /**
   * Additional height below safe area inset if desired.
   * @default 0
   */
  extraHeight?: number;
}

export function BlurredStatusBar({
  blurTarget,
  scrollY,
  maxScroll = 35,
  intensity = 60,
  tint,
  blurMethod = "dimezisBlurViewSdk31Plus",
  blurReductionFactor = 4,
  extraHeight = 0,
}: BlurredStatusBarProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useAppTheme();

  const defaultTop = Platform.OS === "ios" ? 44 : 24;
  const barHeight = Math.max(insets.top, defaultTop) + extraHeight;

  const opacity = scrollY
    ? scrollY.interpolate({
        inputRange: [0, maxScroll],
        outputRange: [0, 1],
        extrapolate: "clamp",
      })
    : 1;

  const resolvedTint =
    tint ??
    (isDark
      ? (Platform.OS === "ios" ? "systemChromeMaterialDark" : "dark")
      : (Platform.OS === "ios" ? "systemChromeMaterialLight" : "light"));

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.container,
          {
            height: barHeight,
            opacity,
          },
        ]}
      >
      {/* Official Expo BlurView with full iOS & Android BlurTargetView support */}
      <BlurView
        intensity={intensity}
        tint={resolvedTint}
        blurTarget={blurTarget}
        blurMethod={blurMethod}
        blurReductionFactor={blurReductionFactor}
        style={StyleSheet.absoluteFill}
      />

      {/* Subtle overlay tint for extra contrast and legibility */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: isDark
              ? "rgba(0, 0, 0, 0.42)"
              : "rgba(255, 255, 255, 0.42)",
          },
        ]}
      />

      {/* Subtle bottom separator hairline */}
      <View
        style={[
          styles.bottomBorder,
          {
            backgroundColor: isDark
              ? "rgba(255, 255, 255, 0.08)"
              : "rgba(0, 0, 0, 0.08)",
          },
        ]}
      />
    </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 998,
    overflow: "hidden",
  },
  bottomBorder: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
});

export default BlurredStatusBar;
