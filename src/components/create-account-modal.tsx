import { SymbolView } from 'expo-symbols';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { NativeGlassView } from '@/components/native-glass';
import { useExpense } from '@/context/expense-context';
import { useAppTheme } from '@/context/theme-context';
import { AccountType } from '@/domain/types';

interface CreateAccountModalProps {
  visible: boolean;
  onClose: () => void;
}

const ACCOUNT_TYPES: { type: AccountType; label: string; icon: string }[] = [
  { type: 'spending', label: 'Daily Spending', icon: 'creditcard' },
  { type: 'savings', label: 'Savings', icon: 'building.columns' },
  { type: 'emergency', label: 'Emergency Fund', icon: 'shield.fill' },
  { type: 'investment', label: 'Investment', icon: 'chart.line.uptrend.xyaxis' },
  { type: 'cash', label: 'Cash Wallet', icon: 'banknote' },
];

export function CreateAccountModal({ visible, onClose }: CreateAccountModalProps) {
  const { addAccount } = useExpense();
  const { isDark } = useAppTheme();

  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [institution, setInstitution] = useState('');
  const [selectedType, setSelectedType] = useState<AccountType>('spending');

  const handleSave = () => {
    const parsedBalance = parseFloat(balance.replace(/[^0-9.]/g, '')) || 0;
    if (name.trim().length === 0) return;

    addAccount({
      name: name.trim(),
      type: selectedType,
      openingBalance: parsedBalance,
      institution: institution.trim() || undefined,
      description: institution.trim() || undefined,
      color: '#AB9FF2',
    });

    setName('');
    setBalance('');
    setInstitution('');
    setSelectedType('spending');
    onClose();
  };

  const isSaveReady = name.trim().length > 0;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardWrap}>
          <View style={[styles.sheetCard, isDark ? styles.sheetDark : styles.sheetLight]}>
            <NativeGlassView
              glassEffectStyle="regular"
              tintColor={isDark ? 'rgba(28, 28, 30, 0.75)' : 'rgba(255, 255, 255, 0.85)'}
              intensity={80}
              blurTint={isDark ? 'systemMaterialDark' : 'systemMaterialLight'}
              style={StyleSheet.absoluteFill}
            />

            {/* Top Drag Indicator & Header */}
            <View style={styles.dragBar} />
            <View style={styles.headerRow}>
              <Text style={[styles.headerTitle, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}>
                New Account
              </Text>
              <Pressable onPress={onClose} hitSlop={8} style={styles.closeBtn}>
                <SymbolView
                  name={{ ios: 'xmark.circle.fill', android: 'cancel', web: 'cancel' }}
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
                style={[styles.amountInput, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}
              />
            </View>

            {/* Account Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>
                ACCOUNT NAME
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Nabil Salary, Daily Cash"
                placeholderTextColor={isDark ? '#6E628E' : '#9F95C4'}
                style={[
                  styles.textInput,
                  isDark ? styles.inputDark : styles.inputLight,
                  isDark ? styles.textPrimaryDark : styles.textPrimaryLight,
                ]}
              />
            </View>

            {/* Institution / Bank */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>
                INSTITUTION / BANK (OPTIONAL)
              </Text>
              <TextInput
                value={institution}
                onChangeText={setInstitution}
                placeholder="e.g. Global IME, NIC Asia, Cash"
                placeholderTextColor={isDark ? '#6E628E' : '#9F95C4'}
                style={[
                  styles.textInput,
                  isDark ? styles.inputDark : styles.inputLight,
                  isDark ? styles.textPrimaryDark : styles.textPrimaryLight,
                ]}
              />
            </View>

            {/* Account Type Selector */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>
                ACCOUNT TYPE
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeChips}>
                {ACCOUNT_TYPES.map((t) => {
                  const isSelected = selectedType === t.type;
                  return (
                    <Pressable
                      key={t.type}
                      onPress={() => setSelectedType(t.type)}
                      style={[
                        styles.typeChip,
                        isDark ? styles.chipDark : styles.chipLight,
                        isSelected && (isDark ? styles.chipSelectedDark : styles.chipSelectedLight),
                      ]}>
                      <SymbolView
                        name={{ ios: t.icon as any, android: 'account_balance', web: 'account_balance' }}
                        size={14}
                        tintColor={isSelected ? '#000000' : isDark ? '#FFFFFF' : '#000000'}
                      />
                      <Text
                        style={[
                          styles.typeChipText,
                          isSelected
                            ? (isDark ? styles.chipTextSelectedDark : styles.chipTextSelectedLight)
                            : (isDark ? styles.chipTextInactiveDark : styles.chipTextInactiveLight),
                        ]}>
                        {t.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Create Button */}
            <Pressable
              onPress={handleSave}
              disabled={!isSaveReady}
              style={({ pressed }) => [
                styles.saveBtn,
                isDark ? styles.saveBtnDark : styles.saveBtnLight,
                !isSaveReady && styles.saveBtnDisabled,
                pressed && { opacity: 0.85 },
              ]}>
              <Text style={isDark ? styles.saveBtnTextDark : styles.saveBtnTextLight}>Create Account</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  keyboardWrap: {
    width: '100%',
    alignItems: 'center',
  },
  sheetCard: {
    width: '100%',
    maxWidth: 520,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
    position: 'relative',
    gap: 16,
  },
  sheetDark: {
    backgroundColor: '#121214',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  sheetLight: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  dragBar: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#AB9FF2',
    alignSelf: 'center',
    marginBottom: 4,
    opacity: 0.35,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  closeBtn: {
    padding: 2,
  },
  amountInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  currencyPrefix: {
    fontSize: 28,
    fontWeight: '700',
    color: '#AB9FF2',
    marginRight: 6,
  },
  amountInput: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
    minWidth: 120,
    textAlign: 'center',
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
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
    backgroundColor: '#1C1C1E',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  inputLight: {
    backgroundColor: '#F5F2FF',
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  typeChips: {
    gap: 8,
    paddingVertical: 4,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  chipDark: {
    backgroundColor: '#1C1C1E',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  chipLight: {
    backgroundColor: '#F5F2FF',
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  chipSelectedDark: {
    backgroundColor: '#AB9FF2',
    borderColor: '#AB9FF2',
  },
  chipSelectedLight: {
    backgroundColor: '#AB9FF2',
    borderColor: '#AB9FF2',
  },
  chipTextSelectedDark: {
    color: '#000000',
    fontWeight: '700',
  },
  chipTextSelectedLight: {
    color: '#000000',
    fontWeight: '700',
  },
  chipTextInactiveDark: {
    color: '#8E8E93',
  },
  chipTextInactiveLight: {
    color: '#6C6C70',
  },
  saveBtn: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  saveBtnDark: {
    backgroundColor: '#AB9FF2',
  },
  saveBtnLight: {
    backgroundColor: '#AB9FF2',
  },
  saveBtnDisabled: {
    opacity: 0.35,
  },
  saveBtnTextDark: {
    color: '#000000',
    fontSize: 17,
    fontWeight: '700',
  },
  saveBtnTextLight: {
    color: '#000000',
    fontSize: 17,
    fontWeight: '700',
  },
  textPrimaryDark: {
    color: '#FFFFFF',
  },
  textPrimaryLight: {
    color: '#000000',
  },
  textSecondaryDark: {
    color: '#8E8E93',
  },
  textSecondaryLight: {
    color: '#6C6C70',
  },
});
