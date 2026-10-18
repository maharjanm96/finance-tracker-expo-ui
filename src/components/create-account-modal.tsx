import { BottomSheet, RNHostView } from "@expo/ui";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { AppButton } from "@/components/ui/app-button";
import { getCurrencyInfo } from "@/constants/currencies";
import { useExpense } from "@/context/expense-context";
import { useAppTheme } from "@/context/theme-context";
import { AccountType } from "@/domain/types";

interface CreateAccountModalProps {
  visible: boolean;
  onClose: () => void;
}

const ACCOUNT_TYPES: { type: AccountType; label: string; icon: string }[] = [
  { type: "spending", label: "Daily Spending", icon: "creditcard" },
  { type: "savings", label: "Savings", icon: "building.columns" },
  { type: "emergency", label: "Emergency Fund", icon: "shield.fill" },
  {
    type: "investment",
    label: "Investment",
    icon: "chart.line.uptrend.xyaxis",
  },
  { type: "cash", label: "Cash Wallet", icon: "banknote" },
];

function CreateAccountForm({ onClose }: { onClose: () => void }) {
  const { addAccount, profile } = useExpense();
  const { isDark } = useAppTheme();
  const currencyInfo = getCurrencyInfo(profile.currency);

  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [institution, setInstitution] = useState("");
  const [selectedType, setSelectedType] = useState<AccountType>("spending");

  const handleSave = () => {
    const parsedBalance = parseFloat(balance.replace(/[^0-9.]/g, "")) || 0;
    if (name.trim().length === 0) return;

    addAccount({
      name: name.trim(),
      type: selectedType,
      openingBalance: parsedBalance,
      institution: institution.trim() || undefined,
      description: institution.trim() || undefined,
      color: "#AB9FF2",
    });

    onClose();
  };

  const isSaveReady = name.trim().length > 0;

  return (
    <View className="flex-1 bg-surface-light dark:bg-surface-dark px-5 pt-3 pb-6 gap-4">
      {/* Header */}
      <View className="flex-row items-center justify-between pt-1.5">
        <Text className="text-xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
          New Account
        </Text>
        <Pressable onPress={onClose} hitSlop={12} className="p-1 active:opacity-70">
          <SymbolView
            name={{
              ios: "xmark.circle.fill",
              android: "cancel",
              web: "cancel",
            }}
            size={24}
            tintColor={isDark ? "#989BA5" : "#AEAEB2"}
          />
        </Pressable>
      </View>

      {/* Starting Balance Input */}
      <View className="flex-row items-center justify-center py-2">
        <Text className="text-3xl font-bold text-[#AB9FF2] mr-2">
          {currencyInfo.symbol}
        </Text>
        <TextInput
          value={balance}
          onChangeText={setBalance}
          placeholder="0.00"
          placeholderTextColor={isDark ? "#6C6C70" : "#AEAEB2"}
          keyboardType="decimal-pad"
          autoFocus
          className="text-4xl font-extrabold tracking-tight min-w-[120px] text-center text-text-primary-light dark:text-text-primary-dark"
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ gap: 16, paddingBottom: 8 }}
      >
        {/* Account Name */}
        <View className="gap-2">
          <Text className="text-[11px] font-bold tracking-wider text-text-secondary-light dark:text-text-secondary-dark uppercase">
            ACCOUNT NAME
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Nabil Salary, Daily Cash"
            placeholderTextColor={isDark ? "#6C6C70" : "#AEAEB2"}
            className="h-12 rounded-2xl px-4 text-base bg-card-light dark:bg-card-dark text-text-primary-light dark:text-text-primary-dark border border-black/5 dark:border-white/10"
          />
        </View>

        {/* Institution / Bank */}
        <View className="gap-2">
          <Text className="text-[11px] font-bold tracking-wider text-text-secondary-light dark:text-text-secondary-dark uppercase">
            INSTITUTION / BANK (OPTIONAL)
          </Text>
          <TextInput
            value={institution}
            onChangeText={setInstitution}
            placeholder="e.g. Global IME, NIC Asia, Cash"
            placeholderTextColor={isDark ? "#6C6C70" : "#AEAEB2"}
            className="h-12 rounded-2xl px-4 text-base bg-card-light dark:bg-card-dark text-text-primary-light dark:text-text-primary-dark border border-black/5 dark:border-white/10"
          />
        </View>

        {/* Account Type Selector */}
        <View className="gap-2">
          <Text className="text-[11px] font-bold tracking-wider text-text-secondary-light dark:text-text-secondary-dark uppercase">
            ACCOUNT TYPE
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
          >
            {ACCOUNT_TYPES.map((t) => {
              const isSelected = selectedType === t.type;
              return (
                <Pressable
                  key={t.type}
                  onPress={() => setSelectedType(t.type)}
                  className={`flex-row items-center px-3.5 py-2.5 rounded-2xl gap-2 border ${
                    isSelected
                      ? "bg-brand-perano border-brand-perano"
                      : "bg-card-light dark:bg-card-dark border-black/5 dark:border-white/10"
                  }`}
                >
                  <SymbolView
                    name={{
                      ios: t.icon as any,
                      android: "account_balance",
                      web: "account_balance",
                    }}
                    size={14}
                    tintColor={
                      isSelected
                        ? "#1E1F24"
                        : isDark
                          ? "#E4E5EB"
                          : "#1E1F24"
                    }
                  />
                  <Text
                    className={`text-[13px] ${
                      isSelected
                        ? "text-[#1E1F24] font-bold"
                        : "text-text-secondary-light dark:text-text-secondary-dark font-medium"
                    }`}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Create Button */}
      <AppButton
        title="Create Account"
        icon={{
          ios: "plus",
          android: "add",
          web: "add",
        }}
        onPress={handleSave}
        disabled={!isSaveReady}
        className="mt-2"
      />
    </View>
  );
}

export function CreateAccountModal({
  visible,
  onClose,
}: CreateAccountModalProps) {
  const { isDark } = useAppTheme();

  return (
    <BottomSheet
      isPresented={visible}
      onDismiss={onClose}
      snapPoints={["full"]}
      showDragIndicator
      containerColor={isDark ? "#18191D" : "#FFFFFF"}
      contentPadding={0}
    >
      <RNHostView matchContents={false}>
        {visible ? <CreateAccountForm onClose={onClose} /> : <View />}
      </RNHostView>
    </BottomSheet>
  );
}
