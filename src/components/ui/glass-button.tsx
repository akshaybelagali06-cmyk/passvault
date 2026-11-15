import { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { Aurora, Colors, Radii, Spacing, Typography } from '@/constants/theme';

type GlassButtonVariant = 'primary' | 'secondary' | 'danger';

interface GlassButtonProps extends PropsWithChildren {
  onPress: () => void;
  variant?: GlassButtonVariant;
  disabled?: boolean;
  style?: ViewStyle;
}

export function GlassButton({
  children,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
}: GlassButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.label, variant === 'secondary' && styles.secondaryLabel]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  primary: {
    backgroundColor: Aurora.teal,
    borderColor: Aurora.teal,
  },
  secondary: {
    backgroundColor: Aurora.glassStrong,
    borderColor: Aurora.glassBorder,
  },
  danger: {
    backgroundColor: Colors.dark.danger,
    borderColor: Colors.dark.danger,
  },
  label: {
    ...Typography.bodyBold,
    color: Aurora.ink,
  },
  secondaryLabel: {
    color: Colors.dark.text,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.45,
  },
});
