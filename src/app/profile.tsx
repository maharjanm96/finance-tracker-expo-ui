import { SymbolView } from "expo-symbols";
import { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppleSwitch } from "@/components/apple-style-kit";
import {
  BlurTargetView,
  BlurredStatusBar,
} from "@/components/blurred-status-bar";
import { CreateAccountModal } from "@/components/create-account-modal";
import { BottomTabInset, MaxContentWidth } from "@/constants/theme";
import { useExpense } from "@/context/expense-context";
import { ThemeMode, useAppTheme } from "@/context/theme-context";
import { formatCurrency } from "@/domain/formatters";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, themeMode, setThemeMode } = useAppTheme();

  const {
    profile,
    setProfile,
    accounts,
    resetAllData,
    getAccountBalance,
    deleteAccount,
  } = useExpense();

  const [scrollY] = useState(() => new Animated.Value(0));
  const blurTargetRef = useRef<View | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editIncome, setEditIncome] = useState(
    profile.monthlyIncome.toString(),
  );
  const [editGoal, setEditGoal] = useState(
    profile.annualSavingsGoal.toString(),
  );
  const [notifications, setNotifications] = useState(true);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);

  const handleDeleteAccount = (accountName: string, accountId: string) => {
    Alert.alert(
      "Delete Account",
      `Are you sure you want to delete "${accountName}"? All transactions linked to this account will also be deleted.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteAccount(accountId),
        },
      ],
    );
  };

  const handleSaveProfile = () => {
    const parsedIncome =
      parseFloat(editIncome.replace(/[^0-9.]/g, "")) || profile.monthlyIncome;
    const parsedGoal =
      parseFloat(editGoal.replace(/[^0-9.]/g, "")) || profile.annualSavingsGoal;

    setProfile({
      name: editName.trim() || profile.name,
      monthlyIncome: parsedIncome > 0 ? parsedIncome : profile.monthlyIncome,
      annualSavingsGoal:
        parsedGoal > 0 ? parsedGoal : profile.annualSavingsGoal,
    });
    setIsEditing(false);
  };

  const handleResetConfirm = () => {
    Alert.alert(
      "Reset All Data?",
      "This will permanently erase all your saved accounts, transactions, and settings from this device.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", style: "destructive", onPress: () => resetAllData() },
      ],
    );
  };

  return (
    <View
      className="flex-1 bg-bg-light dark:bg-bg-dark"
      style={styles.screen}
    >
      <BlurTargetView ref={blurTargetRef} style={styles.blurTarget}>
        <Animated.ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: 10,
              paddingBottom: 110,
            },
          ]}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true },
          )}
        >
          <View style={styles.contentWrapper}>
            <View style={styles.headerRow}>
              <View>
                <Text
                  style={[
                    styles.headerSubtitle,
                    isDark
                      ? styles.textSecondaryDark
                      : styles.textSecondaryLight,
                  ]}
                >
                  SETTINGS & PROFILE
                </Text>
                <Text
                  style={[
                    styles.headerTitle,
                    isDark ? styles.textPrimaryDark : styles.textPrimaryLight,
                  ]}
                >
                  Account
                </Text>
              </View>
            </View>

            {/* Profile Avatar & Info Card */}
            <View
              style={[
                styles.profileCard,
                isDark ? styles.cardDark : styles.cardLight,
              ]}
            >
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {(profile.name || "M").charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text
                  style={[
                    styles.profileName,
                    isDark ? styles.textPrimaryDark : styles.textPrimaryLight,
                  ]}
                >
                  {profile.name || "User"}
                </Text>
                <Text
                  style={[
                    styles.profileSubtitle,
                    isDark
                      ? styles.textSecondaryDark
                      : styles.textSecondaryLight,
                  ]}
                >
                  Income: {formatCurrency(profile.monthlyIncome)} / mo • NPR
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  if (isEditing) {
                    handleSaveProfile();
                  } else {
                    setEditName(profile.name);
                    setEditIncome(profile.monthlyIncome.toString());
                    setEditGoal(profile.annualSavingsGoal.toString());
                    setIsEditing(true);
                  }
                }}
                style={styles.editBtn}
              >
                <Text style={styles.editBtnText}>
                  {isEditing ? "Done" : "Edit"}
                </Text>
              </Pressable>
            </View>

            {/* Inset Edit Form (when Editing) */}
            {isEditing && (
              <View
                style={[
                  styles.editFormCard,
                  isDark ? styles.cardDark : styles.cardLight,
                ]}
              >
                <View style={styles.formRow}>
                  <Text
                    style={[
                      styles.formLabel,
                      isDark
                        ? styles.textSecondaryDark
                        : styles.textSecondaryLight,
                    ]}
                  >
                    Full Name
                  </Text>
                  <TextInput
                    value={editName}
                    onChangeText={setEditName}
                    style={[
                      styles.formInput,
                      isDark ? styles.textPrimaryDark : styles.textPrimaryLight,
                    ]}
                  />
                </View>
                <View
                  style={[
                    styles.divider,
                    isDark ? styles.dividerDark : styles.dividerLight,
                  ]}
                />
                <View style={styles.formRow}>
                  <Text
                    style={[
                      styles.formLabel,
                      isDark
                        ? styles.textSecondaryDark
                        : styles.textSecondaryLight,
                    ]}
                  >
                    Monthly Income (Rs.)
                  </Text>
                  <TextInput
                    value={editIncome}
                    onChangeText={setEditIncome}
                    keyboardType="numeric"
                    style={[
                      styles.formInput,
                      isDark ? styles.textPrimaryDark : styles.textPrimaryLight,
                    ]}
                  />
                </View>
                <View
                  style={[
                    styles.divider,
                    isDark ? styles.dividerDark : styles.dividerLight,
                  ]}
                />
                <View style={styles.formRow}>
                  <Text
                    style={[
                      styles.formLabel,
                      isDark
                        ? styles.textSecondaryDark
                        : styles.textSecondaryLight,
                    ]}
                  >
                    Annual Savings Goal (Rs.)
                  </Text>
                  <TextInput
                    value={editGoal}
                    onChangeText={setEditGoal}
                    keyboardType="numeric"
                    style={[
                      styles.formInput,
                      isDark ? styles.textPrimaryDark : styles.textPrimaryLight,
                    ]}
                  />
                </View>
              </View>
            )}

            {/* Managed Accounts List */}
            <View style={styles.groupWrapper}>
              <View style={styles.sectionHeaderRow}>
                <Text
                  style={[
                    styles.sectionHeader,
                    isDark
                      ? styles.textSecondaryDark
                      : styles.textSecondaryLight,
                  ]}
                >
                  CONNECTED ACCOUNTS ({accounts.length})
                </Text>
                <Pressable
                  onPress={() => setShowAddAccountModal(true)}
                  style={({ pressed }) => [
                    styles.addAccountPill,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <SymbolView
                    name={{ ios: "plus", android: "add", web: "add" }}
                    size={12}
                    tintColor="#AB9FF2"
                  />
                  <Text style={styles.addAccountPillText}>Add Account</Text>
                </Pressable>
              </View>

              <View
                style={[
                  styles.cardContainer,
                  isDark ? styles.cardDark : styles.cardLight,
                ]}
              >
                {accounts.length === 0 ? (
                  <View style={styles.emptyAccountRow}>
                    <Text
                      style={[
                        styles.emptyAccountText,
                        isDark ? styles.textSecondaryDark : styles.textSecondaryLight,
                      ]}
                    >
                      No accounts added yet. Tap &apos;Add Account&apos; to add one.
                    </Text>
                  </View>
                ) : (
                  accounts.map((acc, idx) => {
                    const balance = getAccountBalance(acc.id);
                    const isLast = idx === accounts.length - 1;

                    return (
                      <View key={acc.id}>
                        <View style={styles.accountItemRow}>
                          <View
                            style={[
                              styles.accountIconWrap,
                              isDark ? styles.iconWrapDark : styles.iconWrapLight,
                            ]}
                          >
                            <SymbolView
                              name={{
                                ios:
                                  acc.type === "savings"
                                    ? "building.columns"
                                    : "creditcard",
                                android: "account_balance",
                                web: "account_balance",
                              }}
                              size={16}
                              tintColor={isDark ? "#FFFFFF" : "#000000"}
                            />
                          </View>
                          <View style={styles.accountInfoCol}>
                            <Text
                              style={[
                                styles.accountName,
                                isDark
                                  ? styles.textPrimaryDark
                                  : styles.textPrimaryLight,
                              ]}
                            >
                              {acc.name}
                            </Text>
                            <Text
                              style={[
                                styles.accountMeta,
                                isDark
                                  ? styles.textSecondaryDark
                                  : styles.textSecondaryLight,
                              ]}
                            >
                              {acc.type.toUpperCase()}{" "}
                              {acc.institution ? `• ${acc.institution}` : ""}
                            </Text>
                          </View>
                          <View style={styles.accountRightGroup}>
                            <Text
                              style={[
                                styles.accountBalance,
                                isDark
                                  ? styles.textPrimaryDark
                                  : styles.textPrimaryLight,
                              ]}
                            >
                              {formatCurrency(balance)}
                            </Text>
                            <Pressable
                              hitSlop={8}
                              onPress={() => handleDeleteAccount(acc.name, acc.id)}
                              style={styles.deleteAccountBtn}
                              accessibilityRole="button"
                              accessibilityLabel={`Delete account ${acc.name}`}
                            >
                              <SymbolView
                                name={{ ios: "trash", android: "delete", web: "delete" }}
                                size={16}
                                tintColor={isDark ? "#8E8E93" : "#AEAEB2"}
                              />
                            </Pressable>
                          </View>
                        </View>
                        {!isLast && (
                          <View
                            style={[
                              styles.divider,
                              isDark ? styles.dividerDark : styles.dividerLight,
                              { marginLeft: 56 },
                            ]}
                          />
                        )}
                      </View>
                    );
                  })
                )}
              </View>
            </View>

            {/* Appearance Preference Group */}
            <View style={styles.groupWrapper}>
              <Text
                style={[
                  styles.sectionHeader,
                  isDark ? styles.textSecondaryDark : styles.textSecondaryLight,
                ]}
              >
                APPEARANCE
              </Text>
              <View
                style={[
                  styles.cardContainer,
                  isDark ? styles.cardDark : styles.cardLight,
                ]}
              >
                <View style={styles.themeSegmentRow}>
                  {(["system", "light", "dark"] as ThemeMode[]).map((mode) => {
                    const isActive = themeMode === mode;
                    return (
                      <Pressable
                        key={mode}
                        onPress={() => setThemeMode(mode)}
                        style={[
                          styles.themeSegmentBtn,
                          isActive &&
                            (isDark
                              ? styles.themeSegmentActiveDark
                              : styles.themeSegmentActiveLight),
                        ]}
                      >
                        <SymbolView
                          name={{
                            ios:
                              mode === "light"
                                ? "sun.max.fill"
                                : mode === "dark"
                                  ? "moon.fill"
                                  : "circle.lefthalf.filled",
                            android:
                              mode === "light"
                                ? "light_mode"
                                : mode === "dark"
                                  ? "dark_mode"
                                  : "brightness_medium",
                            web:
                              mode === "light"
                                ? "light_mode"
                                : mode === "dark"
                                  ? "dark_mode"
                                  : "brightness_medium",
                          }}
                          size={15}
                          tintColor={
                            isActive
                              ? isDark
                                ? "#FFFFFF"
                                : "#000000"
                              : "#8E8E93"
                          }
                        />
                        <Text
                          style={[
                            styles.themeSegmentText,
                            isActive
                              ? isDark
                                ? styles.themeTextActiveDark
                                : styles.themeTextActiveLight
                              : styles.themeTextInactive,
                          ]}
                        >
                          {mode.charAt(0).toUpperCase() + mode.slice(1)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* Preferences Group */}
            <View style={styles.groupWrapper}>
              <Text
                style={[
                  styles.sectionHeader,
                  isDark ? styles.textSecondaryDark : styles.textSecondaryLight,
                ]}
              >
                PREFERENCES
              </Text>
              <View
                style={[
                  styles.cardContainer,
                  isDark ? styles.cardDark : styles.cardLight,
                ]}
              >
                <View style={styles.settingRow}>
                  <View style={styles.labelWithIcon}>
                    <View
                      style={[
                        styles.iconPill,
                        isDark ? styles.iconWrapDark : styles.iconWrapLight,
                      ]}
                    >
                      <SymbolView
                        name={{
                          ios: "bell.fill",
                          android: "notifications",
                          web: "notifications",
                        }}
                        size={16}
                        tintColor={isDark ? "#FFFFFF" : "#1C1C1E"}
                      />
                    </View>
                    <Text
                      style={[
                        styles.settingLabel,
                        isDark
                          ? styles.textPrimaryDark
                          : styles.textPrimaryLight,
                      ]}
                    >
                      Daily Budget Alerts
                    </Text>
                  </View>
                  <AppleSwitch
                    value={notifications}
                    onValueChange={setNotifications}
                  />
                </View>
              </View>
            </View>

            {/* Reset / Onboarding Start Over */}
            <View style={styles.groupWrapper}>
              <Text
                style={[
                  styles.sectionHeader,
                  isDark ? styles.textSecondaryDark : styles.textSecondaryLight,
                ]}
              >
                DATA MANAGEMENT
              </Text>
              <Pressable
                onPress={handleResetConfirm}
                style={[
                  styles.resetButton,
                  isDark ? styles.cardDark : styles.cardLight,
                ]}
              >
                <Text style={styles.resetButtonText}>
                  Reset All Data & Restore Defaults
                </Text>
              </Pressable>
            </View>
          </View>
        </Animated.ScrollView>
      </BlurTargetView>

      <BlurredStatusBar blurTarget={blurTargetRef} scrollY={scrollY} />

      {/* Create Account Modal */}
      <CreateAccountModal
        visible={showAddAccountModal}
        onClose={() => setShowAddAccountModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  screenDark: {
    backgroundColor: "#000000",
  },
  screenLight: {
    backgroundColor: "#FFFFFF",
  },
  blurTarget: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  contentWrapper: {
    width: "100%",
    maxWidth: MaxContentWidth,
    gap: 20,
  },
  headerRow: {
    paddingVertical: 6,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.6,
    marginTop: 2,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    gap: 14,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#AB9FF2",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#000000",
  },
  profileInfo: {
    flex: 1,
    gap: 3,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  profileSubtitle: {
    fontSize: 13,
  },
  editBtn: {
    backgroundColor: "#AB9FF2",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
  },
  editBtnText: {
    color: "#000000",
    fontSize: 13,
    fontWeight: "700",
  },
  editFormCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    gap: 10,
  },
  formRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  formInput: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "right",
    minWidth: 140,
  },
  groupWrapper: {
    gap: 8,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  addAccountPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addAccountPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#AB9FF2",
  },
  cardContainer: {
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
  },
  accountItemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  accountIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapDark: {
    backgroundColor: "#1C1C1E",
  },
  iconWrapLight: {
    backgroundColor: "#F5F2FF",
  },
  accountInfoCol: {
    flex: 1,
    gap: 2,
  },
  accountName: {
    fontSize: 15,
    fontWeight: "600",
  },
  accountMeta: {
    fontSize: 11,
    fontWeight: "500",
  },
  accountBalance: {
    fontSize: 15,
    fontWeight: "700",
  },
  accountRightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  deleteAccountBtn: {
    padding: 4,
  },
  emptyAccountRow: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyAccountText: {
    fontSize: 13,
    textAlign: "center",
  },
  themeSegmentRow: {
    flexDirection: "row",
    padding: 4,
    gap: 4,
  },
  themeSegmentBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 38,
    borderRadius: 12,
  },
  themeSegmentActiveDark: {
    backgroundColor: "#3A3B3E",
  },
  themeSegmentActiveLight: {
    backgroundColor: "#E5E5EA",
  },
  themeSegmentText: {
    fontSize: 13,
    fontWeight: "600",
  },
  themeTextActiveDark: {
    color: "#FFFFFF",
  },
  themeTextActiveLight: {
    color: "#000000",
  },
  themeTextInactive: {
    color: "#8E8E93",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  labelWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconPill: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  resetButton: {
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  resetButtonText: {
    color: "#FF3B30",
    fontSize: 15,
    fontWeight: "700",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
  },
  dividerDark: {
    backgroundColor: "rgba(255, 255, 255, 0.10)",
  },
  dividerLight: {
    backgroundColor: "rgba(0, 0, 0, 0.08)",
  },
  cardDark: {
    backgroundColor: "#202227",
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  cardLight: {
    backgroundColor: "#F5F5F5",
    borderColor: "rgba(0, 0, 0, 0)",
  },
  textPrimaryDark: {
    color: "#E4E5EB",
  },
  textPrimaryLight: {
    color: "#1E1F24",
  },
  textSecondaryDark: {
    color: "#989BA5",
  },
  textSecondaryLight: {
    color: "#6C6C70",
  },
});
