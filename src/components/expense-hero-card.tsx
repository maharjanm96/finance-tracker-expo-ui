import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { NativeGlassView } from '@/components/native-glass';
import { useExpense } from '@/context/expense-context';
import { useAppTheme } from '@/context/theme-context';

export function ExpenseHeroCard() {
  const { profile, totalSpent, remainingBalance, percentSpent } = useExpense();
  const { isDark } = useAppTheme();

  const formatCurrency = (val: number) => {
    return `${profile.currency} ${val.toLocaleString()}`;
  };

  const isLowBalance = percentSpent > 85;

  return (
    <View style={styles.cardWrapper}>
      <NativeGlassView
        glassEffectStyle="regular"
        tintColor={isDark ? 'rgba(18, 18, 20, 0.75)' : 'rgba(255, 255, 255, 0.90)'}
        intensity={70}
        blurTint={isDark ? 'systemMaterialDark' : 'systemMaterialLight'}
        style={StyleSheet.absoluteFill}
      />

      {/* Top Header Label */}
      <View style={styles.topRow}>
        <Text style={[styles.eyebrow, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>
          REMAINING BUDGET
        </Text>
        <View style={[styles.badge, isLowBalance ? styles.badgeAlert : styles.badgeNormal]}>
          <Text style={[styles.badgeText, isLowBalance ? styles.badgeTextAlert : styles.badgeTextNormal]}>
            {percentSpent}% Used
          </Text>
        </View>
      </View>

      {/* Hero Remaining Balance */}
      <Text style={[styles.heroAmount, isDark ? styles.textPrimaryDark : styles.textPrimaryLight]}>
        {formatCurrency(remainingBalance)}
      </Text>

      {/* Minimalist Progress Track (Perano Primary Purple) */}
      <View style={[styles.progressTrack, isDark ? styles.progressTrackDark : styles.progressTrackLight]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${Math.min(100, Math.max(2, percentSpent))}%`,
              backgroundColor: isLowBalance ? '#FF3B30' : '#AB9FF2',
            },
          ]}
        />
      </View>

      {/* Sub Stats Row */}
      <View style={styles.subStatsRow}>
        <View style={styles.statColumn}>
          <Text style={[styles.statLabel, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>
            Total Spent
          </Text>
          <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            {formatCurrency(totalSpent)}
          </Text>
        </View>

        <View style={[styles.statDivider, isDark ? styles.dividerDark : styles.dividerLight]} />

        <View style={styles.statColumn}>
          <Text style={[styles.statLabel, isDark ? styles.textSecondaryDark : styles.textSecondaryLight]}>
            Monthly Income
          </Text>
          <Text style={[styles.statValue, { color: '#2EC08B' }]}>
            {formatCurrency(profile.monthlyIncome)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
    position: 'relative',
    gap: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeNormal: {
    backgroundColor: 'rgba(171, 159, 242, 0.18)',
  },
  badgeAlert: {
    backgroundColor: 'rgba(255, 69, 58, 0.15)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeTextNormal: {
    color: '#AB9FF2',
  },
  badgeTextAlert: {
    color: '#FF453A',
  },
  heroAmount: {
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -1,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressTrackDark: {
    backgroundColor: '#2C2C2E',
  },
  progressTrackLight: {
    backgroundColor: '#E2DFFE', // Fog
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  subStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 4,
  },
  statColumn: {
    flex: 1,
    gap: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 36,
    marginHorizontal: 16,
  },
  dividerDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  dividerLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
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
