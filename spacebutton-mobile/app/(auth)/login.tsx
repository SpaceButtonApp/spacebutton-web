import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAppStore } from '@/lib/store';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

const LOGO_URL = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20icon-2NxSPMU2FJojZ6X3c9hif4dJEqs6ro.png';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setUser = useAppStore((state) => state.setUser);
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};

    if (!formData.emailOrPhone) {
      newErrors.emailOrPhone = 'Email or phone number is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock login
    const emailName = formData.emailOrPhone.includes('@') 
      ? formData.emailOrPhone.split('@')[0].replace(/[._]/g, ' ')
      : 'User';
    const capitalizedName = emailName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    
    setUser({
      id: `user-${Date.now()}`,
      name: capitalizedName,
      email: formData.emailOrPhone.includes('@') ? formData.emailOrPhone : '',
      phone: formData.emailOrPhone.includes('@') ? '' : formData.emailOrPhone,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      type: 'individual',
      isLoggedIn: true,
      referralCode: `REF${Date.now().toString(36).toUpperCase()}`,
      referredCount: 0,
      location: 'Nigeria',
      walletBalance: 0,
      isPremium: false,
      connectsRemaining: 0,
    });

    router.replace('/(tabs)/home');
  };

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

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <Image
                source={{ uri: LOGO_URL }}
                style={styles.logo}
                contentFit="contain"
              />
              <Text style={styles.logoText}>SpaceButton</Text>
            </View>
            <Text style={styles.subtitle}>Find your perfect space</Text>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.description}>Sign in to continue to your account</Text>

            {errors.general && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{errors.general}</Text>
              </View>
            )}

            <Input
              label="Email Address or Phone Number"
              placeholder="Enter email or phone number"
              leftIcon="mail"
              value={formData.emailOrPhone}
              onChangeText={(text) => setFormData({ ...formData, emailOrPhone: text })}
              error={errors.emailOrPhone}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              leftIcon="lock"
              secureTextEntry
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              error={errors.password}
            />

            <TouchableOpacity
              onPress={() => router.push('/(auth)/forgot-password')}
              style={styles.forgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              title={loading ? 'Signing in...' : 'Sign In'}
              onPress={handleSubmit}
              loading={loading}
              fullWidth
              size="lg"
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Don&apos;t have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.terms}>
            By signing in, you agree to our Terms of Service
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
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
    bottom: -100,
    right: -150,
    backgroundColor: 'rgba(112, 59, 247, 0.1)',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  logo: {
    width: 48,
    height: 48,
    marginRight: Spacing.md,
  },
  logoText: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: '#ffffff',
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: '#a1a1aa',
  },
  card: {
    backgroundColor: '#12121a',
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    borderColor: '#27272a',
    padding: Spacing['2xl'],
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: FontSize.sm,
    color: '#a1a1aa',
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  errorBannerText: {
    color: '#f87171',
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.lg,
    marginTop: -Spacing.sm,
  },
  forgotPasswordText: {
    color: '#703BF7',
    fontSize: FontSize.sm,
  },
  divider: {
    marginVertical: Spacing.xl,
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#27272a',
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: '#a1a1aa',
    fontSize: FontSize.sm,
  },
  signupLink: {
    color: '#ffffff',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  terms: {
    color: '#71717a',
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});
