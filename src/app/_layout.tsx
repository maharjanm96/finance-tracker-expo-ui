import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavThemeProvider,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import AppTabs from "@/components/app-tabs";
import { ExpenseProvider } from "@/context/expense-context";
import { ThemeProvider, useAppTheme } from "@/context/theme-context";

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { isDark } = useAppTheme();
  return (
    <NavThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ExpenseProvider>
        <RootNavigator />
      </ExpenseProvider>
    </ThemeProvider>
  );
}
