import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { VaultShell } from '@/components/vault/vault-shell';
import { Colors, Radii, Spacing, Typography } from '@/constants/theme';

export default function SettingsScreen() {
  return (
    <VaultShell>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={22} color={Colors.dark.text} />
          </Pressable>
          <Text style={styles.title}>Settings</Text>
          <View style={styles.iconButton} />
        </View>

        <Text style={styles.sectionTitle}>Privacy</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Local by design</Text>
          <Text style={styles.cardText}>Your entries stay encrypted on this device. PassVault does not fetch logos or sync data.</Text>
        </View>

        <Text style={styles.sectionTitle}>About</Text>
        <Pressable accessibilityRole="button" onPress={() => router.push('./privacy')} style={styles.linkRow}>
          <Text style={styles.linkText}>Privacy policy</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.dark.textSecondary} />
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.push('./terms')} style={styles.linkRow}>
          <Text style={styles.linkText}>Terms and conditions</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.dark.textSecondary} />
        </Pressable>
      </ScrollView>
    </VaultShell>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.three,
  },
  header: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.four,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Typography.headingSm,
    color: Colors.dark.text,
  },
  sectionTitle: {
    ...Typography.caption,
    color: Colors.dark.accent,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
  },
  card: {
    padding: Spacing.three,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    backgroundColor: Colors.dark.surface,
  },
  cardTitle: {
    ...Typography.bodyBold,
    color: Colors.dark.text,
  },
  cardText: {
    ...Typography.body,
    color: Colors.dark.textSecondary,
    marginTop: Spacing.one,
  },
  linkRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  linkText: {
    ...Typography.body,
    color: Colors.dark.text,
  },
});
