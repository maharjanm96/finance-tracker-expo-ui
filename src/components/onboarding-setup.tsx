import { BlurView } from "expo-blur";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppButton } from "@/components/ui/app-button";
import { CURRENCIES, getCurrencyInfo } from "@/constants/currencies";
import { useExpense } from "@/context/expense-context";
import { useAppTheme } from "@/context/theme-context";

export function OnboardingSetup() {
  const insets = useSafeAreaInsets();
  const { setProfile, addGoal } = useExpense();
  const { isDark } = useAppTheme();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currencyCode, setCurrencyCode] = useState("NPR");
  const [savingsGoal, setSavingsGoal] = useState("");

  const selectedCurrency = getCurrencyInfo(currencyCode);

  const handleFinish = () => {
    const trimmedName = name.trim() || "User";
    const trimmedEmail = email.trim();
    const parsedGoal =
      parseFloat(savingsGoal.replace(/[^0-9.]/g, "")) || 300000;

    setProfile({
      name: trimmedName,
      email: trimmedEmail,
      monthlyIncome: 0,
      annualSavingsGoal: parsedGoal,
      currency: currencyCode,
      isConfigured: true,
    });

    addGoal({
      title: "Annual Savings Goal",
      targetAmount: parsedGoal,
      isActive: true,
      category: "General",
      icon: "target",
    });
  };

  const isReady = name.trim().length > 0;
  const statusBarHeight = Math.max(insets.top, Platform.OS === "ios" ? 44 : 24);

  return (
    <View className="flex-1 bg-bg-light dark:bg-bg-dark">
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* ─── Frosted Glass Status Bar Blur Overlay ─── */}
      <View
        pointerEvents="none"
        className="absolute top-0 left-0 right-0 z-30 overflow-hidden"
        style={{ height: statusBarHeight }}
      >
        <BlurView
          intensity={Platform.OS === "ios" ? 40 : 85}
          tint={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: isDark
                ? "rgba(18, 19, 22, 0.50)"
                : "rgba(255, 255, 255, 0.60)",
            },
          ]}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingTop: Math.max(insets.top, 24) + 20,
            paddingBottom: Math.max(insets.bottom, 24) + 30,
            paddingHorizontal: 24,
            alignItems: "center",
          }}
        >
          <View className="w-full max-w-[420px] gap-6">
            {/* ─── 1. Brand Header ─── */}
            <View className="items-center gap-3 pt-2">
              <View
                className="w-25 h-25 rounded-xl overflow-hidden items-center justify-center"
                style={{
                  shadowColor: "#000000",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: isDark ? 0.35 : 0.12,
                  shadowRadius: 12,
                  elevation: 5,
                }}
              >
                <Image
                  source={require("@/assets/images/icon.png")}
                  className="w-25 h-25"
                  resizeMode="cover"
                />
              </View>

              <View className="items-center gap-1.5">
                <Text className="text-3xl font-black tracking-tight text-center text-text-light dark:text-text-dark">
                  Welcome to Vectra
                </Text>
                <Text className="text-[14px] text-center text-text-secondary-light dark:text-text-secondary-dark leading-5 px-4 font-medium">
                  Set up your personal expense tracker in two simple steps.
                </Text>
              </View>
            </View>

            {/* ─── 2. Setup Card ─── */}
            <View className="gap-5">
              {/* Step 1: Your Name */}
              <View className="gap-2">
                <Text className="text-[11px] font-bold tracking-wider text-text-secondary-light dark:text-text-secondary-dark uppercase px-0.5">
                  YOUR NAME
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Alex"
                  placeholderTextColor={isDark ? "#6E717C" : "#9E9EA7"}
                  autoCapitalize="words"
                  autoFocus
                  className="h-12 px-4 rounded-2xl bg-white dark:bg-[#18191D] border border-black/10 dark:border-white/10 text-[16px] font-bold text-text-light dark:text-text-dark"
                />
              </View>

              {/* Step 2: Email Address */}
              <View className="gap-2">
                <Text className="text-[11px] font-bold tracking-wider text-text-secondary-light dark:text-text-secondary-dark uppercase px-0.5">
                  EMAIL ADDRESS
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="e.g. alex@example.com"
                  placeholderTextColor={isDark ? "#6E717C" : "#9E9EA7"}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="h-12 px-4 rounded-2xl bg-white dark:bg-[#18191D] border border-black/10 dark:border-white/10 text-[16px] font-bold text-text-light dark:text-text-dark"
                />
              </View>

              {/* Step 3: Base Currency Selection */}
              <View className="gap-2">
                <Text className="text-[11px] font-bold tracking-wider text-text-secondary-light dark:text-text-secondary-dark uppercase px-0.5">
                  BASE CURRENCY
                </Text>
                <View className="flex-row gap-2">
                  {CURRENCIES.map((item) => {
                    const isSelected = currencyCode === item.code;
                    return (
                      <Pressable
                        key={item.code}
                        onPress={() => setCurrencyCode(item.code)}
                        className={`flex-1 py-3 px-1.5 rounded-2xl items-center justify-center gap-1.5 border active:opacity-80 transition-all ${
                          isSelected
                            ? "bg-brand-perano/15 border-brand-perano dark:bg-brand-perano/20 dark:border-brand-perano shadow-xs"
                            : "bg-surface-light dark:bg-chip-dark border-black/5 dark:border-white/5"
                        }`}
                      >
                        <View className="w-6 h-6 rounded-full overflow-hidden items-center justify-center border border-black/5 dark:border-white/10">
                          <Image
                            source={item.flag}
                            className="w-6 h-6 rounded-full"
                            resizeMode="cover"
                          />
                        </View>
                        <Text
                          numberOfLines={1}
                          className={`text-[12px] font-bold ${
                            isSelected
                              ? "text-brand-dark-purple dark:text-brand-perano"
                              : "text-text-secondary-light dark:text-text-secondary-dark"
                          }`}
                        >
                          {item.symbol} {item.code}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Step 3: Annual Savings Goal */}
              <View className="gap-2">
                <View className="flex-row items-center justify-between px-0.5">
                  <Text className="text-[11px] font-bold tracking-wider text-text-secondary-light dark:text-text-secondary-dark uppercase">
                    ANNUAL SAVINGS GOAL
                  </Text>
                  <Text className="text-[11px] font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                    Optional
                  </Text>
                </View>
                <View className="flex-row items-center h-12 px-4 rounded-2xl bg-white dark:bg-[#18191D] border border-black/10 dark:border-white/10">
                  <Text className="text-base font-bold text-text-secondary-light dark:text-text-secondary-dark mr-2">
                    {selectedCurrency.symbol}
                  </Text>
                  <TextInput
                    value={savingsGoal}
                    onChangeText={setSavingsGoal}
                    placeholder="300000"
                    placeholderTextColor={isDark ? "#6E717C" : "#9E9EA7"}
                    keyboardType="numeric"
                    className="flex-1 text-[16px] font-bold text-text-light dark:text-text-dark"
                  />
                </View>
                <Text className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark px-1">
                  Tracks progress on your monthly summary card.
                </Text>
              </View>

              {/* Submit Action */}
              <AppButton
                title="Get Started"
                icon={{
                  ios: "arrow.right",
                  android: "arrow_forward",
                  web: "arrow_forward",
                }}
                iconPosition="right"
                onPress={handleFinish}
                disabled={!isReady}
                className="mt-2"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
