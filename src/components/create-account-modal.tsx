import { BottomSheet, RNHostView } from "@expo/ui";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { AppButton } from "@/components/ui/app-button";
import { ACCOUNT_TYPES } from "@/constants/account-types";
import { getCurrencyInfo } from "@/constants/currencies";
import { useExpense } from "@/context/expense-context";
import { useAppTheme } from "@/context/theme-context";
import { Account, AccountType } from "@/domain/types";

interface CreateAccountModalProps {
  visible: boolean;
  onClose: () => void;
  account?: Account | null;
}

function CreateAccountForm({
  account,
  onClose,
}: {
  account?: Account | null;
  onClose: () => void;
}) {
  const { addAccount, editAccount, profile, currencyInfo } = useExpense();
  const { isDark } = useAppTheme();

  const isEditing = Boolean(account);

  const [name, setName] = useState(account?.name ?? "");
  const [balance, setBalance] = useState(
    account
      ? account.openingBalance !== undefined
        ? account.openingBalance.toString()
        : ""
      : "",
  );
  const [institution, setInstitution] = useState(
    account?.institution ?? account?.description ?? "",
  );
  const [selectedType, setSelectedType] = useState<AccountType>(
    account?.type ?? "spending",
  );

  const handleSave = () => {
    const parsedBalance = parseFloat(balance.replace(/[^0-9.]/g, "")) || 0;
    if (name.trim().length === 0) return;

    if (isEditing && account) {
      editAccount(account.id, {
        name: name.trim(),
        type: selectedType,
        openingBalance: parsedBalance,
        institution: institution.trim() || undefined,
        description: institution.trim() || undefined,
      });
    } else {
      addAccount({
        name: name.trim(),
        type: selectedType,
        openingBalance: parsedBalance,
        institution: institution.trim() || undefined,
        description: institution.trim() || undefined,
        color: "#AB9FF2",
      });
    }

    onClose();
  };

  const isSaveReady = name.trim().length > 0;

  return (
    <View className="flex-1 bg-surface-light dark:bg-surface-dark px-5 pt-3 pb-6 gap-4">
      {/* Header */}
      <View className="flex-row items-center justify-between pt-1.5">
        <Text className="text-xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
          {isEditing ? "Edit Account" : "New Account"}
        </Text>
        <Pressable
          onPress={onClose}
          hitSlop={12}
          className="p-1 active:opacity-70"
        >
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
            className="h-12 rounded-2xl px-4 text-[15px] font-semibold bg-card-light dark:bg-card-dark text-text-primary-light dark:text-text-primary-dark border border-black/5 dark:border-white/10"
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
            className="h-12 rounded-2xl px-4 text-[15px] font-semibold bg-card-light dark:bg-card-dark text-text-primary-light dark:text-text-primary-dark border border-black/5 dark:border-white/10"
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
                      ios: t.icon.ios as any,
                      android: t.icon.android,
                      web: t.icon.web,
                    }}
                    size={14}
                    tintColor={
                      isSelected ? "#1E1F24" : isDark ? "#E4E5EB" : "#1E1F24"
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

      {/* Save / Create Button */}
      <AppButton
        title={isEditing ? "Save Changes" : "Create Account"}
        icon={{
          ios: isEditing ? "checkmark" : "plus",
          android: isEditing ? "check" : "add",
          web: isEditing ? "check" : "add",
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
  account,
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
        {visible ? (
          <CreateAccountForm
            key={account?.id ?? "new"}
            account={account}
            onClose={onClose}
          />
        ) : (
          <View />
        )}
      </RNHostView>
    </BottomSheet>
  );
}
