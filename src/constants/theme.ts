/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import "@/global.css";

import { Platform } from "react-native";

export const Brand = {
  perano: "#AB9FF2", // Primary Purple (Lavender)
  darkPurple: "#3C315B", // Deep Purple / Martinique
  fog: "#E2DFFE", // Soft Lilac Gray
  magnolia: "#F5F2FF", // Off-White
  income: "#2EC08B", // Cash In Green
  expense: "#FF3B30", // Cash Out Red
} as const;

export const Colors = {
  light: {
    text: "#1E1F24",
    textSecondary: "#6C6C70",
    background: "#FFFFFF",
    backgroundElement: "#F5F2FF",
    backgroundSelected: "#E2DFFE",
    surface: "#FFFFFF",
    surfaceSecondary: "#F5F2FF",
    surfaceMuted: "#E2DFFE",
    border: "rgba(0, 0, 0, 0.08)",
    primary: "#AB9FF2",
    accent: "#AB9FF2",
    success: "#2EC08B",
    income: "#2EC08B",
    expense: "#FF3B30",
    capsuleBg: "rgba(255, 255, 255, 0.92)",
    capsuleActive: "#F5F2FF",
    capsuleBorder: "rgba(0, 0, 0, 0.08)",
    iconMuted: "#8E8E93",
    iconActive: "#1E1F24",
    iconBg: "#F5F2FF",
    accentBlue: "#AB9FF2",
    accentGreen: "#2EC08B",
    accentRed: "#FF3B30",
    badgeRed: "#FF3B30",
  },
  dark: {
    text: "#E4E5EB",
    textSecondary: "#989BA5",
    background: "#121316",
    backgroundElement: "#202227",
    backgroundSelected: "#2A2D35",
    surface: "#18191D",
    surfaceSecondary: "#202227",
    surfaceMuted: "#2A2D35",
    border: "rgba(255, 255, 255, 0.08)",
    primary: "#AB9FF2",
    accent: "#AB9FF2",
    success: "#2EC08B",
    income: "#2EC08B",
    expense: "#FF3B30",
    capsuleBg: "rgba(24, 25, 29, 0.90)",
    capsuleActive: "rgba(255, 255, 255, 0.12)",
    capsuleBorder: "rgba(255, 255, 255, 0.08)",
    iconMuted: "#989BA5",
    iconActive: "#E4E5EB",
    iconBg: "#202227",
    accentBlue: "#AB9FF2",
    accentGreen: "#2EC08B",
    accentRed: "#FF453A",
    badgeRed: "#FF3B30",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
