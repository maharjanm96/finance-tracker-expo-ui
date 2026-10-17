import { useEffect, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";

/**
 * ─── 1. Pixel-Perfect iOS Capsule Switch for Android ───
 * Replicates the authentic Apple fluid switch on Android and all platforms.
 */
interface AppleSwitchProps {
  value: boolean;
  onValueChange: (newValue: boolean) => void;
  activeColor?: string;
  inactiveColor?: string;
}

export function AppleSwitch({
  value,
  onValueChange,
  activeColor = "#34C759",
  inactiveColor = "#39393D",
}: AppleSwitchProps) {
  const [animatedValue] = useState(() => new Animated.Value(value ? 1 : 0));

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: value ? 1 : 0,
      bounciness: 4,
      speed: 18,
      useNativeDriver: false,
    }).start();
  }, [value, animatedValue]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  });

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [inactiveColor, activeColor],
  });

  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      hitSlop={8}
      style={styles.switchHitSlop}
    >
      <Animated.View style={[styles.switchTrack, { backgroundColor }]}>
        <Animated.View
          style={[styles.switchThumb, { transform: [{ translateX }] }]}
        />
      </Animated.View>
    </Pressable>
  );
}

/**
 * ─── 2. Apple iOS Connectivity Group Card ───
 */
interface SettingRowProps {
  label: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  isLast?: boolean;
}

function SettingRow({ label, value, onValueChange, isLast }: SettingRowProps) {
  return (
    <View>
      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>{label}</Text>
        <AppleSwitch value={value} onValueChange={onValueChange} />
      </View>
      {!isLast && <View style={styles.settingDivider} />}
    </View>
  );
}

export function AppleConnectivityCard({ style }: { style?: ViewStyle }) {
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(true);
  const [airplaneMode, setAirplaneMode] = useState(false);

  return (
    <View style={[styles.groupWrapper, style]}>
      <Text style={styles.sectionHeader}>Connectivity</Text>
      <View style={styles.cardContainer}>
        <SettingRow label="Wi-Fi" value={wifi} onValueChange={setWifi} />
        <SettingRow
          label="Bluetooth"
          value={bluetooth}
          onValueChange={setBluetooth}
        />
        <SettingRow
          label="Airplane Mode"
          value={airplaneMode}
          onValueChange={setAirplaneMode}
          isLast
        />
      </View>
    </View>
  );
}

/**
 * ─── 3. Apple iOS "Sign out?" Confirmation Dialog Card ───
 */
interface AppleSignOutDialogProps {
  onCancel?: () => void;
  onSignOut?: () => void;
  style?: ViewStyle;
}

export function AppleSignOutDialog({
  onCancel,
  onSignOut,
  style,
}: AppleSignOutDialogProps) {
  return (
    <View style={[styles.dialogCard, style]}>
      <Text style={styles.dialogTitle}>Sign out?</Text>
      <Text style={styles.dialogMessage}>
        You will need to sign in again to access your account.
      </Text>

      <View style={styles.dialogActionsRow}>
        <Pressable
          onPress={onCancel}
          style={({ pressed }) => [
            styles.dialogButton,
            pressed && styles.dialogButtonPressed,
          ]}
        >
          <Text style={styles.dialogButtonText}>Cancel</Text>
        </Pressable>

        <Pressable
          onPress={onSignOut}
          style={({ pressed }) => [
            styles.dialogButton,
            pressed && styles.dialogButtonPressed,
          ]}
        >
          <Text style={styles.dialogButtonText}>Sign Out</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  /* ─── Switch ─── */
  switchHitSlop: {
    padding: 2,
  },
  switchTrack: {
    width: 51,
    height: 31,
    borderRadius: 16,
    justifyContent: "center",
  },
  switchThumb: {
    width: 27,
    height: 27,
    borderRadius: 13.5,
    backgroundColor: "#FFFFFF",
    elevation: 2,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
  },

  /* ─── Connectivity Group ─── */
  groupWrapper: {
    width: "100%",
    gap: 8,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: "600",
    color: "#9898A0",
    paddingHorizontal: 16,
    letterSpacing: -0.2,
  },
  cardContainer: {
    backgroundColor: "#232326",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  settingRow: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
  },
  settingLabel: {
    fontSize: 17,
    fontWeight: "500",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  settingDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    marginLeft: 18,
  },

  /* ─── Sign Out Dialog ─── */
  dialogCard: {
    backgroundColor: "#161618",
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 20,
    width: "100%",
    maxWidth: 380,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    elevation: 6,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  dialogMessage: {
    fontSize: 15,
    lineHeight: 21,
    color: "#98989F",
    fontWeight: "400",
    marginBottom: 24,
  },
  dialogActionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  dialogButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2C2C2E",
    alignItems: "center",
    justifyContent: "center",
  },
  dialogButtonPressed: {
    backgroundColor: "#3A3A3E",
    transform: [{ scale: 0.98 }],
  },
  dialogButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
});
