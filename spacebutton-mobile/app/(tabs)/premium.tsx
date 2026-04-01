import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { BottomNav } from '@/components/BottomNav';
import { BackButton } from '@/components/BackButton';
import { Icon } from '@/components/Icons';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

const plans = [
  {
    id: 'basic-single',
    name: '1 Connect',
    price: 500,
    connects: 1,
    popular: false,
  },
  {
    id: 'basic-5',
    name: '5 Connects',
    price: 2000,
    connects: 5,
    popular: true,
    savings: '20%',
  },
  {
    id: 'basic-10',
    name: '10 Connects',
    price: 3500,
    connects: 10,
    popular: false,
    savings: '30%',
  },
];

const premiumPlans = [
  {
    id: 'premium-monthly',
    name: 'Monthly Premium',
    price: 5000,
    period: 'month',
    features: ['Unlimited connects', 'Priority support', 'Verified badge'],
  },
  {
    id: 'premium-yearly',
    name: 'Yearly Premium',
    price: 45000,
    period: 'year',
    savings: '25%',
    features: ['Unlimited connects', 'Priority support', 'Verified badge', 'Analytics'],
  },
];

export default function PremiumScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

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
        <Text style={[styles.title, { color: colors.foreground }]}>Premium</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <LinearGradient
          colors={['#703BF7', '#5f32d4']}
          style={styles.heroCard}
        >
          <Icon name="crown" size={48} color="#fff" />
          <Text style={styles.heroTitle}>Unlock Premium Features</Text>
          <Text style={styles.heroDesc}>
            Get unlimited connects and exclusive benefits
          </Text>
        </LinearGradient>

        {/* Connect Plans */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Buy Connects
        </Text>
        <View style={styles.plansGrid}>
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                { backgroundColor: colors.card, borderColor: plan.popular ? colors.primary : colors.border },
              ]}
            >
              {plan.popular && (
                <View style={[styles.popularBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.popularText}>Popular</Text>
                </View>
              )}
              <Text style={[styles.planConnects, { color: colors.foreground }]}>
                {plan.connects}
              </Text>
              <Text style={[styles.planName, { color: colors.mutedForeground }]}>
                {plan.name}
              </Text>
              <Text style={[styles.planPrice, { color: colors.primary }]}>
                N{plan.price.toLocaleString()}
              </Text>
              {plan.savings && (
                <Text style={[styles.planSavings, { color: colors.success }]}>
                  Save {plan.savings}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Premium Plans */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Premium Plans
        </Text>
        {premiumPlans.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[styles.premiumCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={styles.premiumHeader}>
              <View>
                <Text style={[styles.premiumName, { color: colors.foreground }]}>
                  {plan.name}
                </Text>
                <Text style={[styles.premiumPrice, { color: colors.primary }]}>
                  N{plan.price.toLocaleString()}/{plan.period}
                </Text>
              </View>
              {plan.savings && (
                <View style={[styles.savingsBadge, { backgroundColor: `${colors.success}20` }]}>
                  <Text style={[styles.savingsText, { color: colors.success }]}>
                    Save {plan.savings}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.featuresList}>
              {plan.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Icon name="check" size={16} color={colors.primary} />
                  <Text style={[styles.featureText, { color: colors.mutedForeground }]}>
                    {feature}
                  </Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}
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
  heroCard: {
    borderRadius: BorderRadius['2xl'],
    padding: Spacing['2xl'],
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  heroTitle: {
    color: '#fff',
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  heroDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.lg,
  },
  plansGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing['2xl'],
  },
  planCard: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    alignItems: 'center',
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  popularText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: FontWeight.semibold,
  },
  planConnects: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    marginBottom: 2,
  },
  planName: {
    fontSize: FontSize.xs,
    marginBottom: Spacing.sm,
  },
  planPrice: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
  },
  planSavings: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  premiumCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  premiumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  premiumName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    marginBottom: 2,
  },
  premiumPrice: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  savingsBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  savingsText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  featuresList: {
    gap: Spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  featureText: {
    fontSize: FontSize.sm,
  },
});
