import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/Icons';
import { useTheme } from '@/context/ThemeContext';
import { FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';

const LOGO_URL = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20icon-2NxSPMU2FJojZ6X3c9hif4dJEqs6ro.png';

export default function SignupSuccessScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  
  // Animation values using useRef
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const iconBounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate content
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    // Bounce animation for icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconBounce, {
          toValue: -10,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(iconBounce, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim, scaleAnim, iconBounce]);

  const features = [
    { icon: 'home' as const, label: 'Find your perfect space' },
    { icon: 'check-circle' as const, label: 'Verified property listings' },
    { icon: 'zap' as const, label: '₦6000 connect included' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Content */}
      <Animated.View 
        style={[
          styles.content, 
          { 
            paddingTop: insets.top + 40, 
            paddingBottom: insets.bottom + 20,
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        {/* Success Icon */}
        <Animated.View 
          style={[
            styles.successIconContainer,
            { transform: [{ translateY: iconBounce }] }
          ]}
        >
          <View style={styles.successIcon}>
            <Icon name="check-circle" size={56} color="#22c55e" />
          </View>
          <View style={styles.sparklesBadge}>
            <Icon name="sparkles" size={20} color="#fff" />
          </View>
        </Animated.View>

        {/* Logo */}
        <View style={styles.logoRow}>
          <Image
            source={{ uri: LOGO_URL }}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={[styles.logoText, { color: colors.foreground }]}>SpaceButton</Text>
        </View>

        {/* Welcome Text */}
        <Text style={[styles.title, { color: colors.foreground }]}>Welcome aboard!</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Your account is ready. Start exploring the best spaces tailored just for you.
        </Text>

        {/* Features */}
        <View style={styles.features}>
          {features.map((feature, index) => (
            <View
              key={index}
              style={[styles.featureItem, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={styles.featureIcon}>
                <Icon name={feature.icon} size={20} color={colors.primary} />
              </View>
              <Text style={[styles.featureLabel, { color: colors.foreground }]}>{feature.label}</Text>
            </View>
          ))}
        </View>

        {/* CTA Button */}
        <Button
          title="Start Exploring"
          onPress={() => router.replace('/(tabs)/home')}
          fullWidth
          size="lg"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconContainer: {
    marginBottom: Spacing.xl,
  },
  successIcon: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparklesBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#703BF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  logo: {
    width: 48,
    height: 48,
  },
  logoText: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
  },
  title: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.base,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  features: {
    width: '100%',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    gap: Spacing.lg,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(112, 59, 247, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureLabel: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
  },
});
