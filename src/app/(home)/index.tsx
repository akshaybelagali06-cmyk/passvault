/**
 * Placeholder home screen — Milestone 2 will replace this with the vault list.
 */
import { StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing, Typography } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🏠</Text>
      <Text style={styles.title}>Vault</Text>
      <Text style={styles.subtitle}>Coming in Milestone 2</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    ...Typography.headingLg,
    color: Colors.dark.text,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.dark.textSecondary,
  },
});
