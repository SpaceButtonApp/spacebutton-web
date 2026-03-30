import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BackButton } from '@/components/BackButton';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    setSent(true);
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

      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <BackButton variant="light" fallbackUrl="/login" />
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
          {/* Card */}
          <View style={styles.card}>
            {sent ? (
              <>
                <View style={styles.successIcon}>
                  <Text style={styles.successEmoji}>Check email</Text>
                </View>
                <Text style={styles.title}>Check your email</Text>
                <Text style={styles.description}>
                  We have sent a password reset link to {email}
                </Text>
                <Button
                  title="Back to Login"
                  onPress={() => router.replace('/login')}
                  fullWidth
                  size="lg"
                  style={{ marginTop: Spacing.xl }}
                />
              </>
            ) : (
              <>
                <Text style={styles.title}>Forgot Password?</Text>
                <Text style={styles.description}>
                  Enter your email address and we'll send you a link to reset your password.
                </Text>

                <Input
                  label="Email Address"
                  placeholder="Enter your email"
                  leftIcon="mail"
                  value={email}
                  onChangeText={setEmail}
                  error={error}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />

                <Button
                  title={loading ? 'Sending...' : 'Send Reset Link'}
                  onPress={handleSubmit}
                  loading={loading}
                  fullWidth
                  size="lg"
                />
              </>
            )}
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
  header: {
    paddingHorizontal: Spacing.lg,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#12121a',
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    borderColor: '#27272a',
    padding: Spacing['2xl'],
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.xl,
  },
  successEmoji: {
    fontSize: 12,
    color: '#22c55e',
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
});
