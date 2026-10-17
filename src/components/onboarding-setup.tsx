import { SymbolView } from 'expo-symbols';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { NativeGlassView } from '@/components/native-glass';
import { useExpense } from '@/context/expense-context';
import { useAppTheme } from '@/context/theme-context';

export function OnboardingSetup() {
  const { profile, setProfile } = useExpense();
  const { isDark } = useAppTheme();

  const [name, setName] = useState('');
  const [income, setIncome] = useState('');
  const [currency, setCurrency] = useState('Rs.');

  if (profile.isConfigured) {
    return null;
  }

  const handleFinish = () => {
    const parsedIncome = parseFloat(income.replace(/[^0-9.]/g, '')) || 0;
    setProfile({
      name: name.trim() || 'Alex',
      monthlyIncome: parsedIncome > 0 ? parsedIncome : 75000,
      currency,
      isConfigured: true,
    });
  };

  const isReady = name.trim().length > 0 && income.trim().length > 0;

  return (
    <Modal visible={!profile.isConfigured} animationType="fade" transparent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardWrap}>
          <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
            <NativeGlassView
              glassEffectStyle="regular"
              tintColor={isDark ? 'rgba(28, 28, 30, 0.70)' : 'rgba(255, 255, 255, 0.85)'}
              intensity={80}
              blurTint={isDark ? 'systemMaterialDark' : 'systemMaterialLight'}
              style={StyleSheet.absoluteFill}
            />

            {/* Icon Header */}
            <View style={[styles.iconCircle, isDark ? styles.iconCircleDark : styles.iconCircleLight]}>
              <SymbolView
                name={{ ios: 'wallet.pass.fill', android: 'account_balance_wallet', web: 'account_balance_wallet' }}
                size={28}
                tintColor="#AB9FF2"
              />
            </View>

            <View style={styles.headerBlock}>
              <Text style={[styles.title, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}>
                Welcome
              </Text>
              <Text style={[styles.subtitle, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>
                Let&apos;s personalize your minimalist expense dashboard in two simple steps.
              </Text>
            </View>

            {/* Step 1: Name Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>
                YOUR NAME
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Alex"
                placeholderTextColor="#8E8E93"
                autoCapitalize="words"
                style={[
                  styles.textInput,
                  isDark ? styles.inputDark : styles.inputLight,
                  isDark ? styles.textPrimaryDark : styles.textPrimaryLight,
                ]}
              />
            </View>

            {/* Step 2: Monthly Income Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>
                MONTHLY INCOME / BUDGET
              </Text>
              <View style={styles.currencyRow}>
                {['Rs.', '$', '€', '£', '₹'].map((curr) => {
                  const isActive = currency === curr;
                  return (
                    <Pressable
                      key={curr}
                      onPress={() => setCurrency(curr)}
                      style={[
                        styles.currencyPill,
                        isDark ? styles.currencyPillDark : styles.currencyPillLight,
                        isActive && (isDark ? styles.currencyPillActiveDark : styles.currencyPillActiveLight),
                      ]}>
                      <Text
                        style={[
                          styles.currencyPillText,
                          isActive
                            ? (isDark ? styles.currencyPillTextActiveDark : styles.currencyPillTextActiveLight)
                            : (isDark ? styles.currencyPillTextInactiveDark : styles.currencyPillTextInactiveLight),
                        ]}>
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
                placeholderTextColor="#8E8E93"
                keyboardType="numeric"
                style={[
                  styles.textInput,
                  isDark ? styles.inputDark : styles.inputLight,
                  isDark ? styles.textPrimaryDark : styles.textPrimaryLight,
                ]}
              />
            </View>

            {/* Submit Action */}
            <Pressable
              onPress={handleFinish}
              disabled={!isReady}
              style={({ pressed }) => [
                styles.submitBtn,
                isDark ? styles.submitBtnDark : styles.submitBtnLight,
                !isReady && styles.submitBtnDisabled,
                pressed && { opacity: 0.85 },
              ]}>
              <Text style={isDark ? styles.submitBtnTextDark : styles.submitBtnTextLight}>Get Started</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  keyboardWrap: {
    width: '100%',
    maxWidth: 400,
  },
  card: {
    width: '100%',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
    position: 'relative',
    gap: 20,
  },
  cardDark: {
    backgroundColor: '#121214',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleDark: {
    backgroundColor: '#1C1C1E',
  },
  iconCircleLight: {
    backgroundColor: '#F5F2FF', // Magnolia
  },
  headerBlock: {
    gap: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  currencyRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  currencyPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  currencyPillDark: {
    backgroundColor: '#1C1C1E',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  currencyPillLight: {
    backgroundColor: '#F5F2FF', // Magnolia
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  currencyPillActiveDark: {
    backgroundColor: '#AB9FF2',
    borderColor: '#AB9FF2',
  },
  currencyPillActiveLight: {
    backgroundColor: '#AB9FF2',
    borderColor: '#AB9FF2',
  },
  currencyPillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  currencyPillTextInactiveDark: {
    color: '#8E8E93',
  },
  currencyPillTextInactiveLight: {
    color: '#6C6C70',
  },
  currencyPillTextActiveDark: {
    color: '#000000',
  },
  currencyPillTextActiveLight: {
    color: '#000000',
  },
  textInput: {
    height: 50,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 17,
    fontWeight: '500',
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
  submitBtn: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  submitBtnDark: {
    backgroundColor: '#AB9FF2',
  },
  submitBtnLight: {
    backgroundColor: '#AB9FF2',
  },
  submitBtnDisabled: {
    opacity: 0.45,
  },
  submitBtnTextDark: {
    color: '#000000',
    fontSize: 17,
    fontWeight: '700',
  },
  submitBtnTextLight: {
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
