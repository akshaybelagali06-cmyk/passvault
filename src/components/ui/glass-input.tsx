import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { Aurora, Colors, Radii, Spacing, Typography } from '@/constants/theme';

export function GlassInput({ style, placeholderTextColor = '#8F98AA', ...props }: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={placeholderTextColor}
      style={[styles.input, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 52,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.three,
    backgroundColor: 'rgba(10,12,18,0.86)',
    borderWidth: 1,
    borderColor: Aurora.glassBorder,
    color: Colors.dark.text,
    ...Typography.body,
  },
});
