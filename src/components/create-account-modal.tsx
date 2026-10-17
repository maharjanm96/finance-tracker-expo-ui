import { BottomSheet, RNHostView } from "@expo/ui";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

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
    <View
      style={[
        styles.formContainer,
        isDark ? styles.sheetDark : styles.sheetLight,
      ]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <Text
          style={[
            styles.headerTitle,
            isDark ? styles.textPrimaryDark : styles.textPrimaryLight,
          ]}
        >
          New Account
        </Text>
        <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
          <SymbolView
            name={{
              ios: "xmark.circle.fill",
              android: "cancel",
              web: "cancel",
            }}
            size={24}
            tintColor="#8E8E93"
          />
        </Pressable>
      </View>

      {/* Starting Balance Input */}
      <View style={styles.amountInputWrap}>
        <Text style={styles.currencyPrefix}>Rs.</Text>
        <TextInput
          value={balance}
          onChangeText={setBalance}
          placeholder="0.00"
          placeholderTextColor="#8E8E93"
          keyboardType="decimal-pad"
          autoFocus
          style={[
            styles.amountInput,
            isDark ? styles.textPrimaryDark : styles.textPrimaryLight,
          ]}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.formScroll}
      >
        {/* Account Name */}
        <View style={styles.inputGroup}>
          <Text
            style={[
              styles.label,
              isDark ? styles.textSecondaryDark : styles.textSecondaryLight,
            ]}
          >
            ACCOUNT NAME
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Nabil Salary, Daily Cash"
            placeholderTextColor="#8E8E93"
            style={[
              styles.textInput,
              isDark ? styles.inputDark : styles.inputLight,
              isDark ? styles.textPrimaryDark : styles.textPrimaryLight,
            ]}
          />
        </View>

        {/* Institution / Bank */}
        <View style={styles.inputGroup}>
          <Text
            style={[
              styles.label,
              isDark ? styles.textSecondaryDark : styles.textSecondaryLight,
            ]}
          >
            INSTITUTION / BANK (OPTIONAL)
          </Text>
          <TextInput
            value={institution}
            onChangeText={setInstitution}
            placeholder="e.g. Global IME, NIC Asia, Cash"
            placeholderTextColor="#8E8E93"
            style={[
              styles.textInput,
              isDark ? styles.inputDark : styles.inputLight,
              isDark ? styles.textPrimaryDark : styles.textPrimaryLight,
            ]}
          />
        </View>

        {/* Account Type Selector */}
        <View style={styles.inputGroup}>
          <Text
            style={[
              styles.label,
              isDark ? styles.textSecondaryDark : styles.textSecondaryLight,
            ]}
          >
            ACCOUNT TYPE
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.typeChips}
          >
            {ACCOUNT_TYPES.map((t) => {
              const isSelected = selectedType === t.type;
              return (
                <Pressable
                  key={t.type}
                  onPress={() => setSelectedType(t.type)}
                  style={[
                    styles.typeChip,
                    isDark ? styles.chipDark : styles.chipLight,
                    isSelected &&
                      (isDark
                        ? styles.chipSelectedDark
                        : styles.chipSelectedLight),
                  ]}
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
                    style={[
                      styles.typeChipText,
                      isSelected
                        ? isDark
                          ? styles.chipTextSelectedDark
                          : styles.chipTextSelectedLight
                        : isDark
                          ? styles.chipTextInactiveDark
                          : styles.chipTextInactiveLight,
                    ]}
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
      <Pressable
        onPress={handleSave}
        disabled={!isSaveReady}
        style={({ pressed }) => [
          styles.saveBtn,
          isDark ? styles.saveBtnDark : styles.saveBtnLight,
          !isSaveReady && styles.saveBtnDisabled,
          pressed && { opacity: 0.85 },
        ]}
      >
        <Text style={isDark ? styles.saveBtnTextDark : styles.saveBtnTextLight}>
          Create Account
        </Text>
      </Pressable>
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

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 16,
  },
  sheetDark: {
    backgroundColor: "#121214",
  },
  sheetLight: {
    backgroundColor: "#FFFFFF",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  closeBtn: {
    padding: 4,
  },
  amountInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  currencyPrefix: {
    fontSize: 28,
    fontWeight: "700",
    color: "#AB9FF2",
    marginRight: 6,
  },
  amountInput: {
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -1,
    minWidth: 120,
    textAlign: "center",
  },
  formScroll: {
    gap: 16,
    paddingBottom: 8,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  textInput: {
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  inputDark: {
    backgroundColor: "#1C1C1E",
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  inputLight: {
    backgroundColor: "#F5F5F5",
    borderColor: "rgba(0, 0, 0, 0.08)",
  },
  typeChips: {
    gap: 8,
    paddingVertical: 4,
  },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  chipDark: {
    backgroundColor: "#1C1C1E",
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  chipLight: {
    backgroundColor: "#F5F5F5",
    borderColor: "rgba(0, 0, 0, 0.08)",
  },
  chipSelectedDark: {
    backgroundColor: "#AB9FF2",
    borderColor: "#AB9FF2",
  },
  chipSelectedLight: {
    backgroundColor: "#AB9FF2",
    borderColor: "#AB9FF2",
  },
  chipTextSelectedDark: {
    color: "#000000",
    fontWeight: "700",
  },
  chipTextSelectedLight: {
    color: "#000000",
    fontWeight: "700",
  },
  chipTextInactiveDark: {
    color: "#8E8E93",
  },
  chipTextInactiveLight: {
    color: "#6C6C70",
  },
  saveBtn: {
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  saveBtnDark: {
    backgroundColor: "#AB9FF2",
  },
  saveBtnLight: {
    backgroundColor: "#AB9FF2",
  },
  saveBtnDisabled: {
    opacity: 0.35,
  },
  saveBtnTextDark: {
    color: "#000000",
    fontSize: 17,
    fontWeight: "700",
  },
  saveBtnTextLight: {
    color: "#000000",
    fontSize: 17,
    fontWeight: "700",
  },
  textPrimaryDark: {
    color: "#FFFFFF",
  },
  textPrimaryLight: {
    color: "#000000",
  },
  textSecondaryDark: {
    color: "#8E8E93",
  },
  textSecondaryLight: {
    color: "#6C6C70",
  },
});
