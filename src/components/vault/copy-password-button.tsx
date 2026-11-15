import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Colors, Radii, Spacing, Typography } from '@/constants/theme';
import { copyPassword } from '@/services/clipboard';

export function CopyPasswordButton({ password }: { password: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const handleCopy = async () => {
    await copyPassword(password);
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 30_000);
  };

  return (
    <Pressable
      accessibilityLabel={copied ? 'Password copied' : 'Copy password'}
      accessibilityRole="button"
      onPress={() => void handleCopy()}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={18} color={Colors.dark.accent} />
      <Text style={styles.label}>{copied ? 'Copied. Clears in 30 s' : 'Copy password'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.dark.accent,
    paddingHorizontal: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
  },
  pressed: {
    opacity: 0.75,
  },
  label: {
    ...Typography.bodyBold,
    color: Colors.dark.accent,
  },
});
