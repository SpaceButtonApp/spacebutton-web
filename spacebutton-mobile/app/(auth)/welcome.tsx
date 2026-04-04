import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { FontSize, FontWeight, Spacing } from '@/constants/theme';

const { height } = Dimensions.get('window');
const LOGO_URL = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20icon-2NxSPMU2FJojZ6X3c9hif4dJEqs6ro.png';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0f', '#12121a', '#0a0a0f']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Background gradient effects */}
      <View style={styles.gradientOverlay}>
        <View style={[styles.gradientCircle, styles.gradientLeft]} />
        <View style={[styles.gradientCircle, styles.gradientRight]} />
      </View>

      <View style={[styles.content, { paddingTop: insets.top + 40 }]}>
        {/* Logo and Title */}
        <View style={styles.header}>
          <Image
            source={{ uri: LOGO_URL }}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={styles.title}>SpaceButton</Text>
          <Text style={styles.subtitle}>Connect with vacating tenants, landlords, and verified agents.</Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureEmoji}>1</Text>
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Direct Connections</Text>
              <Text style={styles.featureDesc}>Connect directly with landlords and tenants</Text>
            </View>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureEmoji}>2</Text>
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Verified Listings</Text>
              <Text style={styles.featureDesc}>Browse through verified property listings</Text>
            </View>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureEmoji}>3</Text>
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Secure Transactions</Text>
              <Text style={styles.featureDesc}>Safe and transparent rental process</Text>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View style={[styles.buttons, { paddingBottom: insets.bottom + 20 }]}>
          <Button
            title="Create Account"
            onPress={() => router.push('/(auth)/signup')}
            fullWidth
            size="lg"
          />
          <Button
            title="Sign In"
            onPress={() => router.push('/(auth)/login')}
            variant="outline"
            fullWidth
            size="lg"
            style={{ marginTop: Spacing.md }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  gradientCircle: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  gradientLeft: {
    top: -100,
    left: -150,
    backgroundColor: 'rgba(112, 59, 247, 0.2)',
  },
  gradientRight: {
    bottom: 100,
    right: -150,
    backgroundColor: 'rgba(112, 59, 247, 0.1)',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: height * 0.05,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.bold,
    color: '#ffffff',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.base,
    color: '#a1a1aa',
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  features: {
    marginTop: Spacing['3xl'],
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(112, 59, 247, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureEmoji: {
    fontSize: 20,
    color: '#703BF7',
    fontWeight: FontWeight.bold,
  },
  featureText: {
    marginLeft: Spacing.lg,
    flex: 1,
  },
  featureTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: '#ffffff',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: FontSize.sm,
    color: '#a1a1aa',
  },
  buttons: {
    marginTop: Spacing['3xl'],
  },
});
