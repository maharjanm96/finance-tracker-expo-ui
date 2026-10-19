import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CreateAccountModal } from "@/components/create-account-modal";
import { CurrencyPickerModal } from "@/components/currency-picker-modal";
import { getTopHeaderPadding } from "@/components/navigation/top-chip-header";
import { AppButton } from "@/components/ui/app-button";
import { getAccountTypeIcon } from "@/constants/account-types";
import { useExpense } from "@/context/expense-context";
import { ThemeMode, useAppTheme } from "@/context/theme-context";
import { formatCurrency } from "@/domain/formatters";
import { Account } from "@/domain/types";

interface ProfileScreenProps {
  onClose?: () => void;
  isTab?: boolean;
}

export default function ProfileScreen({
  onClose,
  isTab = false,
}: ProfileScreenProps = {}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, themeMode, setThemeMode } = useAppTheme();
  const topHeaderPadding = getTopHeaderPadding(insets.top);

  const {
    profile,
    setProfile,
    accounts,
    resetAllData,
    getAccountBalance,
    deleteAccount,
    currencySymbol,
    currencyInfo,
  } = useExpense();

  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editEmail, setEditEmail] = useState(profile.email ?? "");
  const [notifications, setNotifications] = useState(true);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/" as never);
    }
  };

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
    setProfile({
      name: editName.trim() || profile.name,
      email: editEmail.trim(),
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-bg-light dark:bg-bg-dark"
    >
      {/* ─── Top Page Header Bar (Only shown when not used as a tab) ─── */}
      {!isTab && (
        <View
          className="px-5 pb-3 flex-row items-center justify-between border-b border-black/5 dark:border-white/5 bg-bg-light dark:bg-bg-dark z-10"
          style={{ paddingTop: Math.max(insets.top, 16) + 6 }}
        >
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={handleBack}
              hitSlop={12}
              className="w-10 h-10 rounded-full items-center justify-center bg-black/5 dark:bg-white/10 active:opacity-70"
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <SymbolView
                name={{
                  ios: "chevron.backward",
                  android: "arrow_back",
                  web: "arrow_back",
                }}
                size={20}
                tintColor={isDark ? "#E4E5EB" : "#1E1F24"}
              />
            </Pressable>

            <View>
              <Text className="text-[11px] font-bold tracking-wider text-text-secondary-light dark:text-text-secondary-dark uppercase">
                SETTINGS & PROFILE
              </Text>
              <Text className="text-xl font-black tracking-tight text-text-light dark:text-text-dark">
                Account
              </Text>
            </View>
          </View>

          {isEditing && (
            <Pressable
              onPress={handleSaveProfile}
              hitSlop={8}
              className="px-3.5 py-1.5 rounded-full bg-brand-perano active:opacity-80"
            >
              <Text className="text-xs font-bold text-brand-dark-purple">
                Save
              </Text>
            </Pressable>
          )}
        </View>
      )}

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
        bounces={true}
        alwaysBounceVertical={true}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: isTab ? topHeaderPadding + 10 : 16,
          paddingBottom: isTab ? 140 : Math.max(insets.bottom + 60, 80),
          gap: 20,
        }}
      >
        {/* ─── 1. Profile Avatar & Info Card ─── */}
        <View className="p-4 rounded-3xl bg-card-light dark:bg-card-dark border border-black/5 dark:border-white/5 flex-row items-center gap-3.5">
          <View className="w-14 h-14 rounded-full bg-brand-perano items-center justify-center shadow-xs shrink-0">
            <Text className="text-2xl font-black text-brand-dark-purple select-none">
              {(profile.name || "M").charAt(0).toUpperCase()}
            </Text>
          </View>
          <View className="flex-1">
            <Text
              numberOfLines={1}
              className="text-lg font-bold text-text-light dark:text-text-dark tracking-tight"
            >
              {profile.name || "User"}
            </Text>
            <Text
              numberOfLines={1}
              className="text-[13px] font-medium text-text-secondary-light dark:text-text-secondary-dark mt-0.5"
            >
              {profile.email || "No email added"}
            </Text>
          </View>
          <Pressable
            onPress={() => {
              if (isEditing) {
                handleSaveProfile();
              } else {
                setEditName(profile.name);
                setEditEmail(profile.email ?? "");
                setIsEditing(true);
              }
            }}
            className="px-4 py-2 rounded-full bg-brand-perano active:opacity-80"
          >
            <Text className="text-[13px] font-bold text-brand-dark-purple">
              {isEditing ? "Done" : "Edit"}
            </Text>
          </Pressable>
        </View>

        {/* ─── 2. Edit Profile Form (Inline when editing) ─── */}
        {isEditing && (
          <View className="p-4 rounded-3xl bg-card-light dark:bg-card-dark border border-black/5 dark:border-white/5 gap-3">
            <View className="gap-1">
              <Text className="text-[12px] font-bold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                Full Name
              </Text>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                className="h-11 px-3.5 rounded-xl bg-white dark:bg-[#18191D] text-[15px] font-semibold text-text-light dark:text-text-dark border border-black/5 dark:border-white/5"
              />
            </View>

            <View className="gap-1">
              <Text className="text-[12px] font-bold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                Email Address
              </Text>
              <TextInput
                value={editEmail}
                onChangeText={setEditEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="e.g. manish@example.com"
                placeholderTextColor={isDark ? "#6E717C" : "#9E9EA7"}
                className="h-11 px-3.5 rounded-xl bg-white dark:bg-[#18191D] text-[15px] font-semibold text-text-light dark:text-text-dark border border-black/5 dark:border-white/5"
              />
            </View>
          </View>
        )}

        {/* ─── 3. Connected Accounts Section ─── */}
        <View className="gap-2.5">
          <View className="flex-row items-center justify-between px-1">
            <Text className="text-[12px] font-bold tracking-wider text-text-secondary-light dark:text-text-secondary-dark uppercase">
              CONNECTED ACCOUNTS ({accounts.length})
            </Text>
            <Pressable
              onPress={() => {
                setEditingAccount(null);
                setShowAddAccountModal(true);
              }}
              className="flex-row items-center gap-1.5 py-1 px-2.5 rounded-full bg-brand-perano/15 active:opacity-70"
            >
              <SymbolView
                name={{ ios: "plus", android: "add", web: "add" }}
                size={12}
                tintColor="#AB9FF2"
              />
              <Text className="text-[12px] font-bold text-[#AB9FF2]">
                Add Account
              </Text>
            </Pressable>
          </View>

          <View className="rounded-3xl bg-card-light dark:bg-card-dark border border-black/5 dark:border-white/5 overflow-hidden">
            {accounts.length === 0 ? (
              <View className="p-6 items-center justify-center">
                <Text className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                  No accounts added yet.
                </Text>
              </View>
            ) : (
              accounts.map((acc, idx) => {
                const balance = getAccountBalance(acc.id);
                const isLast = idx === accounts.length - 1;

                return (
                  <View key={acc.id}>
                    <View className="p-4 flex-row items-center justify-between">
                      <Pressable
                        onPress={() => {
                          setEditingAccount(acc);
                          setShowAddAccountModal(true);
                        }}
                        className="flex-row items-center gap-3 flex-1 mr-3 active:opacity-70"
                        accessibilityRole="button"
                        accessibilityLabel={`Edit account ${acc.name}`}
                      >
                        <View className="w-10 h-10 rounded-2xl bg-black/5 dark:bg-white/10 items-center justify-center shrink-0">
                          <SymbolView
                            name={{
                              ios: getAccountTypeIcon(acc.type).ios as any,
                              android: getAccountTypeIcon(acc.type).android,
                              web: getAccountTypeIcon(acc.type).web,
                            }}
                            size={18}
                            tintColor={isDark ? "#E4E5EB" : "#1E1F24"}
                          />
                        </View>
                        <View className="flex-1">
                          <Text
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            className="text-xs font-bold text-text-light dark:text-text-dark"
                          >
                            {acc.name}
                          </Text>
                          <Text className="text-[10px] font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase mt-0.5">
                            {acc.type}{" "}
                            {acc.institution ? `• ${acc.institution}` : ""}
                          </Text>
                        </View>
                      </Pressable>

                      <View className="flex-row items-center gap-2.5 shrink-0">
                        <Text className="text-sm font-extrabold text-text-light dark:text-text-dark mr-0.5">
                          {formatCurrency(balance, currencySymbol)}
                        </Text>
                        <Pressable
                          hitSlop={10}
                          onPress={() => {
                            setEditingAccount(acc);
                            setShowAddAccountModal(true);
                          }}
                          className="p-1 active:opacity-70"
                          accessibilityRole="button"
                          accessibilityLabel={`Edit account ${acc.name}`}
                        >
                          <SymbolView
                            name={{
                              ios: "pencil",
                              android: "edit",
                              web: "edit",
                            }}
                            size={16}
                            tintColor={isDark ? "#989BA5" : "#AEAEB2"}
                          />
                        </Pressable>
                        <Pressable
                          hitSlop={10}
                          onPress={() => handleDeleteAccount(acc.name, acc.id)}
                          className="p-1 active:opacity-70"
                          accessibilityRole="button"
                          accessibilityLabel={`Delete account ${acc.name}`}
                        >
                          <SymbolView
                            name={{
                              ios: "trash",
                              android: "delete",
                              web: "delete",
                            }}
                            size={16}
                            tintColor={isDark ? "#989BA5" : "#AEAEB2"}
                          />
                        </Pressable>
                      </View>
                    </View>
                    {!isLast && (
                      <View className="h-[0.5px] ml-16 bg-black/5 dark:bg-white/10" />
                    )}
                  </View>
                );
              })
            )}
          </View>
        </View>

        {/* ─── 4. Appearance Preferences ─── */}
        <View className="gap-2.5">
          <Text className="text-[12px] font-bold tracking-wider text-text-secondary-light dark:text-text-secondary-dark uppercase px-1">
            APPEARANCE
          </Text>
          <View className="p-1.5 rounded-3xl bg-card-light dark:bg-card-dark border border-black/5 dark:border-white/5 flex-row">
            {(["system", "light", "dark"] as ThemeMode[]).map((mode) => {
              const isActive = themeMode === mode;
              return (
                <Pressable
                  key={mode}
                  onPress={() => setThemeMode(mode)}
                  className={`flex-1 py-2.5 rounded-3xl flex-row items-center justify-center gap-1.5 ${
                    isActive
                      ? isDark
                        ? "bg-brand-perano shadow-xs"
                        : "bg-brand-perano shadow-xs"
                      : "bg-transparent"
                  }`}
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
                          ? "#1E1F24"
                          : "#1E1F24"
                        : isDark
                          ? "#989BA5"
                          : "#8E8E93"
                    }
                  />
                  <Text
                    className={`text-[13px] capitalize ${
                      isActive
                        ? "font-bold text-text-light dark:text-text-light"
                        : "font-semibold text-text-secondary-light dark:text-text-secondary-light"
                    }`}
                  >
                    {mode}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ─── Currency Settings ─── */}
        <View className="gap-2.5">
          <Text className="text-[12px] font-bold tracking-wider text-text-secondary-light dark:text-text-secondary-dark uppercase px-1">
            CURRENCY
          </Text>
          <Pressable
            onPress={() => setShowCurrencyModal(true)}
            className="p-4 rounded-3xl bg-card-light dark:bg-card-dark border border-black/5 dark:border-white/5 flex-row items-center justify-between active:opacity-80"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-full overflow-hidden bg-black/5 dark:bg-white/10 items-center justify-center shrink-0">
                <Image
                  source={currencyInfo.flag}
                  className="w-8 h-8 rounded-full"
                  resizeMode="cover"
                />
              </View>
              <View>
                <Text className="text-[15px] font-bold text-text-light dark:text-text-dark">
                  {currencyInfo.name} ({currencyInfo.code})
                </Text>
                <Text className="text-[12px] font-medium text-text-secondary-light dark:text-text-secondary-dark">
                  Active Symbol: {currencySymbol}
                </Text>
              </View>
            </View>
            <SymbolView
              name={{
                ios: "chevron.right",
                android: "keyboard_arrow_right",
                web: "keyboard_arrow_right",
              }}
              size={14}
              tintColor={isDark ? "#989BA5" : "#8E8E93"}
            />
          </Pressable>
        </View>

        {/* ─── 5. Preferences & Alerts ─── */}
        {/* <View className="gap-2.5">
          <Text className="text-[12px] font-bold tracking-wider text-text-secondary-light dark:text-text-secondary-dark uppercase px-1">
            PREFERENCES
          </Text>
          <View className="p-4 rounded-3xl bg-card-light dark:bg-card-dark border border-black/5 dark:border-white/5 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-2xl bg-black/5 dark:bg-white/10 items-center justify-center">
                <SymbolView
                  name={{
                    ios: "bell.fill",
                    android: "notifications",
                    web: "notifications",
                  }}
                  size={18}
                  tintColor={isDark ? "#E4E5EB" : "#1E1F24"}
                />
              </View>
              <Text className="text-[15px] font-bold text-text-light dark:text-text-dark">
                Daily Budget Alerts
              </Text>
            </View>
            <AppleSwitch
              value={notifications}
              onValueChange={setNotifications}
            />
          </View>
        </View> */}

        {/* ─── 6. Data Management ─── */}
        <View className="gap-2.5 pt-2">
          <Text className="text-[12px] font-bold tracking-wider text-text-secondary-light dark:text-text-secondary-dark uppercase px-1">
            DATA MANAGEMENT
          </Text>
          <AppButton
            title="Reset All Data & Restore Defaults"
            variant="danger"
            icon={{
              ios: "arrow.counterclockwise",
              android: "restart_alt",
              web: "restart_alt",
            }}
            iconSize={20}
            onPress={handleResetConfirm}
          />
        </View>
      </ScrollView>

      {/* Create / Edit Account Modal */}
      <CreateAccountModal
        visible={showAddAccountModal}
        account={editingAccount}
        onClose={() => {
          setShowAddAccountModal(false);
          setEditingAccount(null);
        }}
      />
      {/* Currency Picker Modal */}
      <CurrencyPickerModal
        visible={showCurrencyModal}
        onClose={() => setShowCurrencyModal(false)}
      />
    </KeyboardAvoidingView>
  );
}
