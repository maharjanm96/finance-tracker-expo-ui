import { SymbolView } from "expo-symbols";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { AppButton } from "@/components/ui/app-button";
import { useExpense } from "@/context/expense-context";
import { useAppTheme } from "@/context/theme-context";

export function OnboardingSetup() {
  const { profile, setProfile, accounts, addAccount, isHydrated } =
    useExpense();
  const { isDark } = useAppTheme();

  const [name, setName] = useState("");
  const [income, setIncome] = useState("");
  const [currency, setCurrency] = useState("Rs.");

  if (!isHydrated || profile.isConfigured) {
    return null;
  }

  const handleFinish = () => {
    const parsedIncome = parseFloat(income.replace(/[^0-9.]/g, "")) || 0;
    const trimmedName = name.trim() || "Alex";

    setProfile({
      name: trimmedName,
      monthlyIncome: parsedIncome,
      annualSavingsGoal: parsedIncome * 12 * 0.2,
      currency,
      isConfigured: true,
    });

    if (accounts.length === 0) {
      addAccount({
        name: "Main Wallet",
        type: "spending",
        openingBalance: 0,
      });
      addAccount({
        name: "Emergency Fund",
        type: "emergency",
        openingBalance: 0,
      });
    }
  };

  const isReady = name.trim().length > 0 && income.trim().length > 0;

  return (
    <Modal visible={!profile.isConfigured} animationType="fade" transparent>
      <View className="flex-1 bg-black/75 items-center justify-center p-5">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="w-full max-w-[400px]"
        >
          <View className="p-6 rounded-3xl bg-card-light dark:bg-card-dark border border-black/5 dark:border-white/10 gap-5 shadow-2xl">
            {/* Icon Header */}
            <View className="w-14 h-14 rounded-2xl bg-brand-perano/20 items-center justify-center self-center shadow-xs">
              <SymbolView
                name={{
                  ios: "wallet.pass.fill",
                  android: "account_balance_wallet",
                  web: "account_balance_wallet",
                }}
                size={28}
                tintColor="#AB9FF2"
              />
            </View>

            <View className="items-center gap-1.5">
              <Text className="text-2xl font-bold tracking-tight text-center text-text-light dark:text-text-dark">
                Welcome
              </Text>
              <Text className="text-[14px] text-center text-text-secondary-light dark:text-text-secondary-dark leading-5 px-2">
                Let&apos;s personalize your minimalist expense dashboard in two
                simple steps.
              </Text>
            </View>

            {/* Step 1: Name Input */}
            <View className="gap-1.5">
              <Text className="text-[12px] font-bold tracking-wider text-text-secondary-light dark:text-text-secondary-dark uppercase px-0.5">
                YOUR NAME
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Alex"
                placeholderTextColor={isDark ? "#8E8E93" : "#8E8E93"}
                autoCapitalize="words"
                className="h-12 px-4 rounded-xl bg-white dark:bg-[#18191D] border border-black/5 dark:border-white/10 text-[16px] font-semibold text-text-light dark:text-text-dark"
              />
            </View>

            {/* Step 2: Monthly Income Input */}
            <View className="gap-1.5">
              <Text className="text-[12px] font-bold tracking-wider text-text-secondary-light dark:text-text-secondary-dark uppercase px-0.5">
                MONTHLY INCOME / BUDGET
              </Text>
              <View className="flex-row gap-2 pb-1">
                {["Rs.", "$", "€", "£", "₹"].map((curr) => {
                  const isActive = currency === curr;
                  return (
                    <Pressable
                      key={curr}
                      onPress={() => setCurrency(curr)}
                      className={`flex-1 py-2 rounded-xl items-center justify-center border active:opacity-80 ${
                        isActive
                          ? "bg-brand-perano border-brand-perano"
                          : isDark
                            ? "bg-chip-dark border-white/5"
                            : "bg-chip-light border-black/5"
                      }`}
                    >
                      <Text
                        className={`text-[13px] font-bold ${
                          isActive
                            ? "text-brand-dark-purple"
                            : isDark
                              ? "text-text-secondary-dark"
                              : "text-text-secondary-light"
                        }`}
                      >
                        {curr}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <TextInput
                value={income}
                onChangeText={setIncome}
                placeholder="e.g. 50000"
                placeholderTextColor={isDark ? "#8E8E93" : "#8E8E93"}
                keyboardType="numeric"
                className="h-12 px-4 rounded-xl bg-white dark:bg-[#18191D] border border-black/5 dark:border-white/10 text-[16px] font-semibold text-text-light dark:text-text-dark"
              />
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
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
