import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { VaultShell } from '@/components/vault/vault-shell';
import { Colors, Spacing, Typography } from '@/constants/theme';

export default function PrivacyScreen() {
  return (
    <VaultShell>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Privacy policy</Text>
        <Text style={styles.updated}>Effective November 15, 2026</Text>
        <Text style={styles.heading}>What stays on your device</Text>
        <Text style={styles.body}>PassVault stores vault entries locally. Entry contents are encrypted before they are written to the local database.</Text>
        <Text style={styles.heading}>No network collection</Text>
        <Text style={styles.body}>PassVault does not send vault entries, passwords, usernames, or website data to a server. Service suggestions come from a bundled offline catalog.</Text>
        <Text style={styles.heading}>Access protection</Text>
        <Text style={styles.body}>Your PIN gates access to the app. It is not used as the vault encryption key. The vault key is random and stored in the device secure store.</Text>
        <Text style={styles.heading}>Clipboard</Text>
        <Text style={styles.body}>When you copy a password, PassVault marks it sensitive on supported Android versions and clears it after 30 seconds when it still owns the clipboard.</Text>
        <Text style={styles.heading}>Contact</Text>
        <Text style={styles.body}>This local-first build does not provide a remote account or analytics service.</Text>
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
