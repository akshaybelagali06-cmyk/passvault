import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radii, Spacing, Typography } from '@/constants/theme';
import type { VaultEntry } from '@/types/vault';
import { ServiceAvatar } from './service-avatar';

interface EntryRowProps {
  entry: VaultEntry;
  onPress: () => void;
}

export function EntryRow({ entry, onPress }: EntryRowProps) {
  return (
    <Pressable
      accessibilityLabel={`Open ${entry.serviceName}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <ServiceAvatar name={entry.serviceName} color={entry.brandColor} />
      <View style={styles.copy}>
        <Text numberOfLines={1} style={styles.name}>{entry.serviceName}</Text>
        <Text numberOfLines={1} style={styles.username}>{maskUsername(entry.username)}</Text>
      </View>
      <View style={styles.meta}>
        <Text style={styles.category}>{entry.category}</Text>
        <Ionicons name="chevron-forward" size={18} color={Colors.dark.textSecondary} />
      </View>
    </Pressable>
  );
}

function maskUsername(username: string): string {
  if (!username) return 'No username';
  if (username.length <= 4) return '••••';
  return `${username.slice(0, 2)}•••${username.slice(-2)}`;
}

const styles = StyleSheet.create({
  row: {
    minHeight: 72,
    padding: Spacing.two,
    paddingRight: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radii.md,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  pressed: {
    opacity: 0.78,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...Typography.bodyBold,
    color: Colors.dark.text,
  },
  username: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
  },
  meta: {
    alignItems: 'flex-end',
    gap: 2,
  },
  category: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
  },
});
