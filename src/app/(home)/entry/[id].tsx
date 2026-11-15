import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { usePreventScreenCapture } from 'expo-screen-capture';

import { CopyPasswordButton } from '@/components/vault/copy-password-button';
import { ServiceAvatar } from '@/components/vault/service-avatar';
import { VaultShell } from '@/components/vault/vault-shell';
import { Colors, Radii, Spacing, Typography } from '@/constants/theme';
import { deleteEntry, getEntry } from '@/database/vault';
import type { VaultEntry } from '@/types/vault';

export default function EntryDetailsScreen() {
  usePreventScreenCapture('entry-details');
  const { id } = useLocalSearchParams<{ id: string }>();
  const [entry, setEntry] = useState<VaultEntry | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    void getEntry(id)
      .then(setEntry)
      .catch(() => setErrorMessage('This entry could not be opened.'));
  }, [id]);

  useEffect(() => () => {
    if (revealTimer.current) clearTimeout(revealTimer.current);
  }, []);

  if (errorMessage) {
    return (
      <VaultShell>
        <View style={styles.center}>
          <Text style={styles.error}>{errorMessage}</Text>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.linkButton}>
            <Text style={styles.link}>Go back</Text>
          </Pressable>
        </View>
      </VaultShell>
    );
  }

  if (!entry) {
    return <VaultShell><View style={styles.center}><ActivityIndicator color={Colors.dark.accent} /></View></VaultShell>;
  }

  const handleDelete = () => {
    Alert.alert('Delete entry', 'This removes the encrypted record from your local vault.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void deleteEntry(entry.id).then(() => router.back());
        },
      },
    ]);
  };

  return (
    <VaultShell>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={22} color={Colors.dark.text} />
          </Pressable>
          <View style={styles.headerActions}>
            <Pressable accessibilityLabel="Edit entry" accessibilityRole="button" onPress={() => router.push({ pathname: '../add', params: { id: entry.id } })} style={styles.iconButton}>
              <Ionicons name="create-outline" size={21} color={Colors.dark.text} />
            </Pressable>
            <Pressable accessibilityLabel="Delete entry" accessibilityRole="button" onPress={handleDelete} style={styles.iconButton}>
              <Ionicons name="trash-outline" size={21} color={Colors.dark.danger} />
            </Pressable>
          </View>
        </View>

        <View style={styles.identity}>
          <ServiceAvatar name={entry.serviceName} color={entry.brandColor} size={64} />
          <Text style={styles.title}>{entry.serviceName}</Text>
          <Text style={styles.category}>{entry.category}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Username</Text>
          <Text selectable style={styles.value}>{entry.username || 'No username'}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Password</Text>
          <Text selectable style={styles.secret}>{revealed ? entry.password : '••••••••••••'}</Text>
          <View style={styles.passwordActions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                const next = !revealed;
                setRevealed(next);
                if (revealTimer.current) clearTimeout(revealTimer.current);
                if (next) revealTimer.current = setTimeout(() => setRevealed(false), 10_000);
              }}
              style={styles.reveal}
            >
              <Ionicons name={revealed ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.dark.accent} />
              <Text style={styles.link}>{revealed ? 'Hide' : 'Reveal'}</Text>
            </Pressable>
            <CopyPasswordButton password={entry.password} />
          </View>
        </View>
        {entry.website ? (
          <View style={styles.section}>
            <Text style={styles.label}>Website</Text>
            <Text selectable style={styles.value}>{entry.website}</Text>
          </View>
        ) : null}
      </ScrollView>
    </VaultShell>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
  },
  header: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
    backgroundColor: Colors.dark.surface,
  },
  identity: {
    alignItems: 'center',
    paddingVertical: Spacing.five,
    gap: Spacing.one,
  },
  title: {
    ...Typography.headingLg,
    color: Colors.dark.text,
    marginTop: Spacing.one,
  },
  category: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
  },
  section: {
    paddingVertical: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  label: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.one,
  },
  value: {
    ...Typography.body,
    color: Colors.dark.text,
  },
  secret: {
    ...Typography.body,
    fontFamily: 'monospace',
    color: Colors.dark.text,
    letterSpacing: 1,
  },
  passwordActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  reveal: {
    minHeight: 48,
    paddingHorizontal: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  link: {
    ...Typography.bodyBold,
    color: Colors.dark.accent,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.two,
  },
  error: {
    ...Typography.body,
    color: Colors.dark.danger,
    textAlign: 'center',
  },
  linkButton: {
    minHeight: 48,
    justifyContent: 'center',
  },
});
