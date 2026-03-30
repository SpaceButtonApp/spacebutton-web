import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { Icon } from '@/components/Icons';
import { BorderRadius, Spacing } from '@/constants/theme';

interface BackButtonProps {
  fallbackUrl?: string;
  style?: ViewStyle;
  variant?: 'default' | 'light';
}

export function BackButton({ fallbackUrl, style, variant = 'default' }: BackButtonProps) {
  const router = useRouter();
  const { colors } = useTheme();

  const handlePress = () => {
    if (router.canGoBack()) {
      router.back();
    } else if (fallbackUrl) {
      router.replace(fallbackUrl as any);
    }
  };

  const backgroundColor = variant === 'light' 
    ? 'rgba(255,255,255,0.1)' 
    : colors.secondary;

  const iconColor = variant === 'light' ? '#fff' : colors.foreground;

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.button, { backgroundColor }, style]}
      activeOpacity={0.7}
    >
      <Icon name="arrow-left" size={20} color={iconColor} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
