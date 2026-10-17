import { BlurTint, BlurView } from 'expo-blur';
import { GlassStyle, GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect';
import React, { useMemo } from 'react';
import {
  ColorValue,
  Platform,
  StyleProp,
  StyleSheet,
  useColorScheme,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';

export interface NativeGlassProps extends ViewProps {
  /**
   * Liquid Glass style when available on iOS.
   * @default 'regular'
   */
  glassEffectStyle?: GlassStyle;
  /**
   * Tint color applied to the glass effect.
   */
  tintColor?: ColorValue;
  /**
   * Blur intensity (1 to 100) when falling back to native BlurView.
   * @default 80
   */
  intensity?: number;
  /**
   * BlurTint when falling back to native BlurView.
   */
  blurTint?: BlurTint;
  /**
   * Color scheme override: 'auto' | 'light' | 'dark'.
   * @default 'auto'
   */
  colorScheme?: 'auto' | 'light' | 'dark';
  /**
   * Whether the glass is interactive (iOS Liquid Glass).
   */
  isInteractive?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export function NativeGlassView({
  glassEffectStyle = 'regular',
  tintColor,
  intensity = 80,
  blurTint,
  colorScheme = 'auto',
  isInteractive = false,
  style,
  children,
  ...rest
}: NativeGlassProps) {
  const systemColorScheme = useColorScheme();
  const effectiveTheme = colorScheme === 'auto' ? (systemColorScheme ?? 'dark') : colorScheme;
  const isDark = effectiveTheme === 'dark';

  // Check if native Liquid Glass API is available at runtime
  const hasLiquidGlass = useMemo(() => {
    if (Platform.OS !== 'ios') return false;
    try {
      return isGlassEffectAPIAvailable();
    } catch {
      return false;
    }
  }, []);

  const defaultBlurTint: BlurTint = useMemo(() => {
    if (blurTint) return blurTint;
    if (Platform.OS === 'ios') {
      return isDark ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight';
    }
    return isDark ? 'dark' : 'light';
  }, [blurTint, isDark]);

  if (hasLiquidGlass) {
    return (
      <GlassView
        glassEffectStyle={glassEffectStyle}
        tintColor={tintColor}
        colorScheme={colorScheme}
        isInteractive={isInteractive}
        style={style}
        {...rest}>
        {children}
      </GlassView>
    );
  }

  // Native Apple UIVisualEffectView frosted glass fallback
  return (
    <View style={[styles.glassContainer, style]} {...rest}>
      <BlurView
        intensity={intensity}
        tint={defaultBlurTint}
        style={StyleSheet.absoluteFill}
      />
      {tintColor ? (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: tintColor }]} />
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  glassContainer: {
    overflow: 'hidden',
    position: 'relative',
  },
});

export default NativeGlassView;
