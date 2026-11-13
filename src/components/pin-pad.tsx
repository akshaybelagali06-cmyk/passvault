import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radii, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'del'],
] as const;

type Key = (typeof ROWS)[number][number];

interface PinPadProps {
  onPress: (digit: string) => void;
  onDelete: () => void;
  disabled?: boolean;
}

export function PinPad({ onPress, onDelete, disabled = false }: PinPadProps) {
  const theme = useTheme();

  const handleKey = (key: Key) => {
    if (disabled) return;
    if (key === '' ) return;
    if (key === 'del') { onDelete(); return; }
    onPress(key);
  };

  return (
    <View style={styles.grid}>
      {ROWS.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((key, ci) => (
            <Pressable
              key={ci}
              onPress={() => handleKey(key)}
              disabled={disabled || key === ''}
              style={({ pressed }) => [
                styles.key,
                {
                  backgroundColor: key === '' ? 'transparent' : theme.surface,
                  opacity: pressed ? 0.6 : key === '' ? 0 : 1,
                },
              ]}
              accessibilityLabel={key === 'del' ? 'Delete' : key === '' ? undefined : key}
            >
              {key !== '' && (
                <Text style={[styles.keyText, { color: theme.text }]}>
                  {key === 'del' ? '⌫' : key}
                </Text>
              )}
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}

const KEY_SIZE = 72;

const styles = StyleSheet.create({
  grid: {
    gap: Spacing.two,
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  key: {
    width: KEY_SIZE,
    height: KEY_SIZE,
    borderRadius: Radii.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    ...Typography.headingLg,
  },
});
