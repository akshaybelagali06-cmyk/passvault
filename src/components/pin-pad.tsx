import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import { GlassPinKey } from '@/components/ui/glass-pin-key';

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
  const handleKey = (key: Key) => {
    if (disabled || key === '') return;
    if (key === 'del') {
      onDelete();
      return;
    }
    onPress(key);
  };

  return (
    <View style={styles.grid}>
      {ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((key, columnIndex) =>
            key === '' ? (
              <View key={columnIndex} style={styles.keyPlaceholder} />
            ) : (
              <GlassPinKey
                key={columnIndex}
                label={key === 'del' ? '' : key}
                accessibilityLabel={key === 'del' ? 'Delete' : key}
                disabled={disabled}
                onPress={() => handleKey(key)}
              >
                {key === 'del' ? (
                  <Ionicons name="backspace-outline" size={24} color={Colors.dark.text} />
                ) : null}
              </GlassPinKey>
            ),
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: Spacing.two,
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  keyPlaceholder: {
    width: 72,
    height: 64,
  },
});
