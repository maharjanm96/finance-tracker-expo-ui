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
  const { addAccount } = useExpense();
  const { isDark } = useAppTheme();

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
    <View className="flex-1 bg-white dark:bg-black px-5 pt-3 pb-6 gap-4">
      {/* Header */}
      <View className="flex-row items-center justify-between pt-1.5">
        <Text className="text-xl font-bold tracking-tight text-black dark:text-white">
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
            tintColor={isDark ? "#8E8E93" : "#AEAEB2"}
          />
        </Pressable>
      </View>

      {/* Starting Balance Input */}
      <View className="flex-row items-center justify-center py-1.5">
        <Text className="text-3xl font-bold text-[#AB9FF2] mr-1.5">Rs.</Text>
        <TextInput
          value={balance}
          onChangeText={setBalance}
          placeholder="0.00"
          placeholderTextColor="#8E8E93"
          keyboardType="decimal-pad"
          autoFocus
          className="text-4xl font-extrabold tracking-tight min-w-[120px] text-center text-black dark:text-white"
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ gap: 16, paddingBottom: 8 }}
      >
        {/* Account Name */}
        <View className="gap-2">
          <Text className="text-[11px] font-bold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase">
            ACCOUNT NAME
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Nabil Salary, Daily Cash"
            placeholderTextColor="#8E8E93"
            className="h-12 rounded-2xl px-4 text-base bg-[#F5F5F5] dark:bg-[#1C1C1E] text-black dark:text-white border border-black/5 dark:border-white/10"
          />
        </View>

        {/* Institution / Bank */}
        <View className="gap-2">
          <Text className="text-[11px] font-bold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase">
            INSTITUTION / BANK (OPTIONAL)
          </Text>
          <TextInput
            value={institution}
            onChangeText={setInstitution}
            placeholder="e.g. Global IME, NIC Asia, Cash"
            placeholderTextColor="#8E8E93"
            className="h-12 rounded-2xl px-4 text-base bg-[#F5F5F5] dark:bg-[#1C1C1E] text-black dark:text-white border border-black/5 dark:border-white/10"
          />
        </View>

        {/* Account Type Selector */}
        <View className="gap-2">
          <Text className="text-[11px] font-bold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase">
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
                  className={`flex-row items-center px-3.5 py-2 rounded-2xl gap-1.5 ${
                    isSelected
                      ? "bg-[#AB9FF2]"
                      : "bg-[#f5f5f5] dark:bg-[#1C1C1E]"
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
                        ? "#000000"
                        : isDark
                          ? "#FFFFFF"
                          : "#000000"
                    }
                  />
                  <Text
                    className={`text-[13px] ${
                      isSelected
                        ? "text-black font-bold"
                        : "text-neutral-600 dark:text-neutral-400 font-medium"
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
      containerColor={isDark ? "#121214" : "#FFFFFF"}
      contentPadding={0}
    >
      <RNHostView matchContents={false}>
        {visible ? <CreateAccountForm onClose={onClose} /> : <View />}
      </RNHostView>
    </BottomSheet>
  );
}
