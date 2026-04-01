import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useAppStore } from '@/lib/store';
import { BottomNav } from '@/components/BottomNav';
import { BackButton } from '@/components/BackButton';
import { Icon } from '@/components/Icons';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

export default function WalletScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, transactions } = useAppStore();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
            paddingTop: insets.top + Spacing.sm,
          },
        ]}
      >
        <BackButton fallbackUrl="/(tabs)/settings" />
        <Text style={[styles.title, { color: colors.foreground }]}>My Wallet</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Card */}
        <LinearGradient
          colors={['#703BF7', '#5f32d4']}
          style={styles.balanceCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.balanceLabel}>Wallet Balance</Text>
          <Text style={styles.balanceValue}>
            N{(user?.walletBalance || 0).toLocaleString()}
          </Text>
          <View style={styles.connectsRow}>
            <View style={styles.connectsItem}>
              <Text style={styles.connectsValue}>{user?.connectsRemaining || 0}</Text>
              <Text style={styles.connectsLabel}>Connects Remaining</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            onPress={() => router.push('/wallet/fund' as any)}
            style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.actionIcon, { backgroundColor: `${colors.primary}20` }]}>
              <Icon name="plus" size={24} color={colors.primary} />
            </View>
            <Text style={[styles.actionLabel, { color: colors.foreground }]}>Fund Wallet</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.actionIcon, { backgroundColor: `${colors.success}20` }]}>
              <Icon name="share" size={24} color={colors.success} />
            </View>
            <Text style={[styles.actionLabel, { color: colors.foreground }]}>Withdraw</Text>
          </TouchableOpacity>
        </View>

        {/* Transactions */}
        <View style={styles.transactionsSection}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Recent Transactions
          </Text>
          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Icon name="wallet" size={32} color={colors.mutedForeground} />
              </View>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No transactions yet
              </Text>
            </View>
          ) : (
            transactions.map((transaction) => (
              <View
                key={transaction.id}
                style={[styles.transactionItem, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View
                  style={[
                    styles.transactionIcon,
                    {
                      backgroundColor: transaction.type === 'credit' 
                        ? `${colors.success}20` 
                        : `${colors.destructive}20`,
                    },
                  ]}
                >
                  <Icon
                    name={transaction.type === 'credit' ? 'plus' : 'log-out'}
                    size={20}
                    color={transaction.type === 'credit' ? colors.success : colors.destructive}
                  />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={[styles.transactionTitle, { color: colors.foreground }]}>
                    {transaction.title}
                  </Text>
                  <Text style={[styles.transactionDate, { color: colors.mutedForeground }]}>
                    {transaction.date}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    {
                      color: transaction.type === 'credit' ? colors.success : colors.destructive,
                    },
                  ]}
                >
                  {transaction.type === 'credit' ? '+' : '-'}N{transaction.amount.toLocaleString()}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  balanceCard: {
    borderRadius: BorderRadius['2xl'],
    padding: Spacing['2xl'],
    marginBottom: Spacing.xl,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FontSize.sm,
    marginBottom: Spacing.xs,
  },
  balanceValue: {
    color: '#fff',
    fontSize: FontSize['4xl'],
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xl,
  },
  connectsRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: Spacing.lg,
  },
  connectsItem: {
    alignItems: 'center',
  },
  connectsValue: {
    color: '#fff',
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
  },
  connectsLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FontSize.sm,
    marginTop: Spacing.xs,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  actionLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  transactionsSection: {
    marginTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: FontSize.sm,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
  },
  transactionDate: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
  },
});
