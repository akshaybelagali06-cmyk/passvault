import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { VaultShell } from '@/components/vault/vault-shell';
import { Colors, Spacing, Typography } from '@/constants/theme';

export default function TermsScreen() {
  return (
    <VaultShell>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Terms and conditions</Text>
        <Text style={styles.updated}>Effective November 15, 2026</Text>
        <Text style={styles.heading}>Use of the app</Text>
        <Text style={styles.body}>PassVault is provided as a local utility for storing credentials on your device. You are responsible for choosing a strong PIN and keeping your device secure.</Text>
        <Text style={styles.heading}>Your data</Text>
        <Text style={styles.body}>You control the entries stored in your local vault. Deleting the app, clearing its data, or losing device access may make those entries unrecoverable.</Text>
        <Text style={styles.heading}>No recovery service</Text>
        <Text style={styles.body}>This build does not provide cloud backup, account recovery, or support access to your vault contents.</Text>
        <Text style={styles.heading}>Security limits</Text>
        <Text style={styles.body}>No software can guarantee security in a compromised device. Keep your operating system current and do not share your PIN.</Text>
      </ScrollView>
    </VaultShell>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
  },
  back: {
    minHeight: 48,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  backText: {
    ...Typography.bodyBold,
    color: Colors.dark.accent,
  },
  title: {
    ...Typography.displaySm,
    color: Colors.dark.text,
    marginTop: Spacing.two,
  },
  updated: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
    marginTop: Spacing.one,
    marginBottom: Spacing.four,
  },
  heading: {
    ...Typography.headingSm,
    color: Colors.dark.text,
    marginTop: Spacing.four,
    marginBottom: Spacing.one,
  },
  body: {
    ...Typography.body,
    color: Colors.dark.textSecondary,
  },
});
