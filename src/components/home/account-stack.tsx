import { SymbolView } from 'expo-symbols';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AccountCard } from './account-card';
import { useExpense } from '@/context/expense-context';
import { useAppTheme } from '@/context/theme-context';
import { calculateExpenses } from '@/domain/finance-calculations';

interface AccountStackProps {
  onManageAccounts?: () => void;
  onAddAccount?: () => void;
}

export function AccountStack({ onManageAccounts, onAddAccount }: AccountStackProps) {
  const {
    accounts,
    transactions,
    selectedAccountId,
    selectedAccount,
    selectAccount,
    getAccountBalance,
  } = useExpense();
  const { isDark } = useAppTheme();

  const activeAccounts = accounts.filter((a) => !a.isArchived);

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitleGroup}>
          <Text style={[styles.sectionTitle, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>
            YOUR ACCOUNTS
          </Text>
          <Text style={[styles.accountCount, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>
            ({activeAccounts.length})
          </Text>
        </View>

        <View style={styles.actionsRow}>
          {onAddAccount && (
            <Pressable
              onPress={onAddAccount}
              hitSlop={8}
              style={[styles.smallBtn, isDark ? styles.btnDark : styles.btnLight]}
            >
              <SymbolView
                name={{ ios: 'plus', android: 'add', web: 'add' }}
                size={14}
                tintColor={isDark ? '#FFFFFF' : '#000000'}
              />
              <Text style={[styles.smallBtnText, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}>
                New
              </Text>
            </Pressable>
          )}

          {onManageAccounts && (
            <Pressable
              onPress={onManageAccounts}
              hitSlop={8}
              style={[styles.smallBtn, isDark ? styles.btnDark : styles.btnLight]}
            >
              <Text style={[styles.smallBtnText, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}>
                Manage
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Selected Account Filter Banner */}
      {selectedAccount && (
        <View style={[styles.activeScopeBanner, isDark ? styles.scopeDark : styles.scopeLight]}>
          <View style={styles.scopeLeft}>
            <View style={styles.scopeDot} />
            <Text style={[styles.scopeText, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}>
              Filtering by: <Text style={{ fontWeight: '700' }}>{selectedAccount.name}</Text>
            </Text>
          </View>
          <Pressable
            onPress={() => selectAccount(null)}
            hitSlop={8}
            style={styles.clearBtn}
          >
            <Text style={styles.clearBtnText}>Show All</Text>
            <SymbolView
              name={{ ios: 'xmark', android: 'close', web: 'close' }}
              size={12}
              tintColor="#AB9FF2"
            />
          </Pressable>
        </View>
      )}

      {/* Vertically Stacked Cards List */}
      <View style={styles.stackList}>
        {activeAccounts.map((account) => {
          const balance = getAccountBalance(account.id);
          const monthlyExpense = calculateExpenses(transactions, account.id);
          const isSelected = selectedAccountId === account.id;

          return (
            <AccountCard
              key={account.id}
              account={account}
              balance={balance}
              monthlyExpense={monthlyExpense}
              isSelected={isSelected}
              onSelect={() => {
                // Toggle selection: if already selected, clear to "all accounts"
                if (isSelected) {
                  selectAccount(null);
                } else {
                  selectAccount(account.id);
                }
              }}
            />
          );
        })}

        {activeAccounts.length === 0 && (
          <View style={[styles.emptyCard, isDark ? styles.btnDark : styles.btnLight]}>
            <Text style={[styles.emptyText, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>
              No accounts added yet. Tap &apos;New&apos; to create an account.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  accountCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  smallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  btnDark: {
    backgroundColor: '#1C1C1E',
  },
  btnLight: {
    backgroundColor: '#F5F2FF',
  },
  smallBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeScopeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  scopeDark: {
    backgroundColor: 'rgba(171, 159, 242, 0.12)',
    borderColor: 'rgba(171, 159, 242, 0.3)',
  },
  scopeLight: {
    backgroundColor: 'rgba(171, 159, 242, 0.10)',
    borderColor: 'rgba(171, 159, 242, 0.25)',
  },
  scopeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scopeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#AB9FF2',
  },
  scopeText: {
    fontSize: 13,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#AB9FF2',
  },
  stackList: {
    gap: 12,
  },
  emptyCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
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
