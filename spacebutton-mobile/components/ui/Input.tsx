import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Icon } from '@/components/Icons';
import { BorderRadius, FontSize, Spacing } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  secureTextEntry,
  ...props
}: InputProps) {
  const { colors } = useTheme();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPassword = secureTextEntry !== undefined;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.muted,
            borderColor: error ? colors.destructive : colors.border,
          },
        ]}
      >
        {leftIcon && (
          <View style={styles.leftIcon}>
            <Icon name={leftIcon} size={20} color={colors.mutedForeground} />
          </View>
        )}
        <TextInput
          style={[
            styles.input,
            {
              color: colors.foreground,
              paddingLeft: leftIcon ? 44 : Spacing.lg,
              paddingRight: rightIcon || isPassword ? 44 : Spacing.lg,
            },
          ]}
          placeholderTextColor={colors.mutedForeground}
          secureTextEntry={isPassword ? !isPasswordVisible : false}
          {...props}
        />
        {(rightIcon || isPassword) && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={isPassword ? () => setIsPasswordVisible(!isPasswordVisible) : onRightIconPress}
          >
            <Icon
              name={isPassword ? (isPasswordVisible ? 'eye-off' : 'eye') : rightIcon!}
              size={20}
              color={colors.mutedForeground}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    position: 'relative',
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md + 2,
    fontSize: FontSize.base,
  },
  leftIcon: {
    position: 'absolute',
    left: Spacing.md,
    zIndex: 1,
  },
  rightIcon: {
    position: 'absolute',
    right: Spacing.md,
    zIndex: 1,
    padding: Spacing.xs,
  },
  error: {
    fontSize: FontSize.sm,
    marginTop: Spacing.xs,
  },
});
