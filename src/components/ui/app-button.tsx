import { SymbolView, SymbolViewProps } from "expo-symbols";
import React from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
  StyleProp,
  Text,
  TextStyle,
  ViewStyle,
} from "react-native";

import { useAppTheme } from "@/context/theme-context";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "outline"
  | "ghost";

export type ButtonIconProp = SymbolViewProps["name"] | React.ReactNode;

export interface AppButtonProps {
  title?: string;
  children?: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  /**
   * Optional icon: SymbolView name config (e.g. { ios: "plus", android: "add", web: "add" }),
   * a single symbol name string, or custom ReactNode.
   */
  icon?: ButtonIconProp;
  iconPosition?: "left" | "right";
  iconSize?: number;
  iconColor?: string;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  textClassName?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

export function AppButton({
  title,
  children,
  onPress,
  icon,
  iconPosition = "left",
  iconSize = 22,
  iconColor,
  variant = "primary",
  disabled = false,
  loading = false,
  className = "",
  textClassName = "",
  style,
  textStyle,
  accessibilityLabel,
}: AppButtonProps) {
  const { isDark } = useAppTheme();

  // Resolve Variant Styles
  let containerVariantClass = "";
  let textVariantClass = "";
  let defaultIconColor = "";

  switch (variant) {
    case "danger":
      containerVariantClass =
        "bg-red-500/10 dark:bg-red-500/15 border border-red-500/20";
      textVariantClass = "text-[#FF3B30]";
      defaultIconColor = "#FF3B30";
      break;
    case "secondary":
      containerVariantClass =
        "bg-card-light dark:bg-card-dark border border-black/5 dark:border-white/10";
      textVariantClass = "text-text-light dark:text-text-dark";
      defaultIconColor = isDark ? "#E4E5EB" : "#1E1F24";
      break;
    case "outline":
      containerVariantClass = "bg-transparent border border-brand-perano";
      textVariantClass = "text-brand-perano";
      defaultIconColor = "#AB9FF2";
      break;
    case "ghost":
      containerVariantClass = "bg-transparent";
      textVariantClass = "text-text-light dark:text-text-dark";
      defaultIconColor = isDark ? "#E4E5EB" : "#1E1F24";
      break;
    case "primary":
    default:
      containerVariantClass = "bg-brand-perano";
      textVariantClass = "text-white dark:text-brand-dark-purple";
      defaultIconColor = isDark ? "#121316" : "#FFFFFF";
      break;
  }

  const resolvedIconColor = iconColor ?? defaultIconColor;

  const renderIcon = () => {
    if (!icon) return null;

    if (React.isValidElement(icon)) {
      return icon;
    }

    return (
      <SymbolView
        name={icon as SymbolViewProps["name"]}
        size={iconSize}
        tintColor={resolvedIconColor}
      />
    );
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel || (typeof title === "string" ? title : undefined)
      }
      accessibilityState={{ disabled: disabled || loading }}
      style={style}
      className={`flex-row items-center justify-center gap-2 h-15 rounded-4xl active:opacity-80 ${containerVariantClass} ${
        disabled || loading ? "opacity-40" : ""
      } ${className}`}
    >
      {loading ? (
        <ActivityIndicator size="small" color={resolvedIconColor} />
      ) : (
        <>
          {iconPosition === "left" && renderIcon()}
          {title ? (
            <Text
              style={textStyle}
              className={`text-base font-bold select-none ${textVariantClass} ${textClassName}`}
            >
              {title}
            </Text>
          ) : null}
          {children}
          {iconPosition === "right" && renderIcon()}
        </>
      )}
    </Pressable>
  );
}

export default AppButton;
