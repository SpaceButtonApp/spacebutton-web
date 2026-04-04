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
import { BackButton } from '@/components/BackButton';
import { Icon } from '@/components/Icons';
import { useAppStore } from '@/lib/store';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

const LOGO_URL = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20icon-2NxSPMU2FJojZ6X3c9hif4dJEqs6ro.png';

export default function SignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setUser = useAppStore((state) => state.setUser);
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    profileType: 'individual' as 'individual' | 'agent',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    invitationCode: '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleStep1Submit = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.agreeToTerms) newErrors.terms = 'You must agree to the terms';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setStep(2);
  };

  const handleStep2Submit = async () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setUser({
      id: `user-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      type: formData.profileType,
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

      {/* Progress bar */}
      <View style={[styles.progressContainer, { paddingTop: insets.top + Spacing.lg }]}>
        <BackButton 
          variant="light" 
          fallbackUrl="/(auth)/welcome"
          style={{ position: 'absolute', left: Spacing.lg, top: insets.top + Spacing.lg }}
        />
        <View style={styles.progressBar}>
          <View style={[styles.progressDot, step >= 1 && styles.progressDotActive]} />
          <View style={[styles.progressDot, step >= 2 && styles.progressDotActive]} />
        </View>
        <Text style={styles.stepText}>{step} of 2</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <Image
                source={{ uri: LOGO_URL }}
                style={styles.logo}
                contentFit="contain"
              />
              <Text style={styles.logoText}>SpaceButton</Text>
            </View>
            <Text style={styles.title}>
              {step === 1 ? 'Create an account' : 'Set your password'}
            </Text>
            <Text style={styles.subtitle}>
              {step === 1 
                ? 'Join thousands finding their perfect space' 
                : 'Create a secure password for your account'}
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {step === 1 ? (
              <>
                <Input
                  label="Full Name"
                  placeholder="Enter your name"
                  leftIcon="user"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  error={errors.name}
                />

                <Text style={styles.inputLabel}>Profile Type</Text>
                <View style={styles.profileTypeRow}>
                  <TouchableOpacity
                    onPress={() => setFormData({ ...formData, profileType: 'individual' })}
                    style={[
                      styles.profileTypeButton,
                      formData.profileType === 'individual' && styles.profileTypeButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.profileTypeText,
                        formData.profileType === 'individual' && styles.profileTypeTextActive,
                      ]}
                    >
                      Individual
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setFormData({ ...formData, profileType: 'agent' })}
                    style={[
                      styles.profileTypeButton,
                      formData.profileType === 'agent' && styles.profileTypeButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.profileTypeText,
                        formData.profileType === 'agent' && styles.profileTypeTextActive,
                      ]}
                    >
                      Agent
                    </Text>
                  </TouchableOpacity>
                </View>

                <Input
                  label="Email Address"
                  placeholder="Enter email address"
                  leftIcon="mail"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  error={errors.email}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />

                <Input
                  label="Phone Number"
                  placeholder="Enter phone number"
                  leftIcon="phone"
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  error={errors.phone}
                  keyboardType="phone-pad"
                />

                <Input
                  label="Invitation Code (Optional)"
                  placeholder="Enter invite code"
                  leftIcon="ticket"
                  value={formData.invitationCode}
                  onChangeText={(text) => setFormData({ ...formData, invitationCode: text })}
                />

                <TouchableOpacity
                  onPress={() => setFormData({ ...formData, agreeToTerms: !formData.agreeToTerms })}
                  style={styles.checkboxRow}
                >
                  <View
                    style={[
                      styles.checkbox,
                      formData.agreeToTerms && styles.checkboxActive,
                    ]}
                  >
                    {formData.agreeToTerms && (
                      <Icon name="check" size={12} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.checkboxText}>
                    I agree to SpaceButton{' '}
                    <Text style={styles.linkText}>Terms & Conditions</Text>
                  </Text>
                </TouchableOpacity>
                {errors.terms && (
                  <Text style={styles.errorText}>{errors.terms}</Text>
                )}

                <Button
                  title="Continue"
                  onPress={handleStep1Submit}
                  fullWidth
                  size="lg"
                  style={{ marginTop: Spacing.lg }}
                />
              </>
            ) : (
              <>
                <Input
                  label="Password"
                  placeholder="Create a password"
                  leftIcon="lock"
                  secureTextEntry
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  error={errors.password}
                />

                <Input
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  leftIcon="lock"
                  secureTextEntry
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                  error={errors.confirmPassword}
                />

                <View style={styles.passwordHints}>
                  <Text style={styles.hintTitle}>Password must:</Text>
                  <Text style={styles.hintText}>- Be at least 8 characters</Text>
                  <Text style={styles.hintText}>- Include uppercase and lowercase</Text>
                  <Text style={styles.hintText}>- Include a number</Text>
                </View>

                <Button
                  title={loading ? 'Creating account...' : 'Create Account'}
                  onPress={handleStep2Submit}
                  loading={loading}
                  fullWidth
                  size="lg"
                  style={{ marginTop: Spacing.lg }}
                />
              </>
            )}

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  progressBar: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  progressDot: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#27272a',
  },
  progressDotActive: {
    backgroundColor: '#703BF7',
  },
  stepText: {
    position: 'absolute',
    right: Spacing.lg,
    color: '#a1a1aa',
    fontSize: FontSize.sm,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: Spacing.md,
  },
  logoText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: '#ffffff',
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: '#ffffff',
    marginBottom: Spacing.sm,
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
    padding: Spacing.xl,
  },
  inputLabel: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: '#d4d4d8',
    marginBottom: Spacing.sm,
  },
  profileTypeRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  profileTypeButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    backgroundColor: '#1a1a24',
    borderWidth: 1,
    borderColor: '#27272a',
    alignItems: 'center',
  },
  profileTypeButtonActive: {
    backgroundColor: '#703BF7',
    borderColor: '#703BF7',
  },
  profileTypeText: {
    color: '#a1a1aa',
    fontWeight: FontWeight.medium,
  },
  profileTypeTextActive: {
    color: '#ffffff',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#52525b',
    marginRight: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#703BF7',
    borderColor: '#703BF7',
  },
  checkboxText: {
    color: '#a1a1aa',
    fontSize: FontSize.sm,
    flex: 1,
  },
  linkText: {
    color: '#703BF7',
  },
  errorText: {
    color: '#f87171',
    fontSize: FontSize.sm,
    marginTop: Spacing.xs,
  },
  passwordHints: {
    backgroundColor: '#1a1a24',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  hintTitle: {
    color: '#a1a1aa',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.xs,
  },
  hintText: {
    color: '#71717a',
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  divider: {
    marginVertical: Spacing.xl,
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#27272a',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#a1a1aa',
    fontSize: FontSize.sm,
  },
  loginLink: {
    color: '#ffffff',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
});
