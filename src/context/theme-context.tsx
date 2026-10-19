import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance, useColorScheme as useDeviceColorScheme } from 'react-native';
import { Uniwind } from 'uniwind';

import { Colors } from '@/constants/theme';
import { StorageService, StoredThemeMode } from '@/services/storage-service';

export type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
  colors: typeof Colors.dark | typeof Colors.light;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const deviceColorScheme = useDeviceColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');
  const [systemScheme, setSystemScheme] = useState<'light' | 'dark'>(
    deviceColorScheme === 'light' ? 'light' : 'dark'
  );

  // Load saved theme preference on launch
  useEffect(() => {
    async function loadTheme() {
      const savedMode = await StorageService.loadThemeMode();
      if (savedMode) {
        setThemeModeState(savedMode);
        Uniwind.setTheme(savedMode);
      } else {
        Uniwind.setTheme('dark');
      }
    }
    loadTheme();
  }, []);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme === 'dark' ? 'dark' : 'light');
    });
    return () => subscription.remove();
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    Uniwind.setTheme(mode);
    StorageService.saveThemeMode(mode as StoredThemeMode);
  };

  const isDark = themeMode === 'system' ? systemScheme === 'dark' : themeMode === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, isDark, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
}

