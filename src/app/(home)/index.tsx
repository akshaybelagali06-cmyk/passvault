import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { usePreventScreenCapture } from 'expo-screen-capture';

import { EntryRow } from '@/components/vault/entry-row';
import { VaultShell } from '@/components/vault/vault-shell';
import { GlassInput } from '@/components/ui/glass-input';
import { Colors, Radii, Spacing, Typography } from '@/constants/theme';
import { listEntries } from '@/database/vault';
import type { VaultEntry } from '@/types/vault';

export default function HomeScreen() {
  usePreventScreenCapture('vault');
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadEntries = useCallback(() => {
    setLoading(true);
    setErrorMessage(null);
    void listEntries()
      .then(setEntries)
      .catch(() => setErrorMessage('Your vault could not be opened. Try again.'))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(loadEntries);

  const filteredEntries = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return entries;
    return entries.filter((entry) =>
      `${entry.serviceName} ${entry.username} ${entry.category}`.toLowerCase().includes(normalized),
    );
  }, [entries, query]);

  return (
    <VaultShell>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>PASSVAULT</Text>
            <Text style={styles.title}>Your vault</Text>
          </View>
          <Pressable
            accessibilityLabel="Open settings"
            accessibilityRole="button"
            onPress={() => router.push('./settings')}
            style={styles.iconButton}
          >
            <Ionicons name="settings-outline" size={22} color={Colors.dark.text} />
          </Pressable>
        </View>

        <View style={styles.searchRow}>
          <GlassInput
            accessibilityLabel="Search vault"
            onChangeText={setQuery}
            placeholder="Search entries"
            returnKeyType="search"
            style={styles.search}
            value={query}
          />
          <Pressable
            accessibilityLabel="Add entry"
            accessibilityRole="button"
            onPress={() => router.push('./add')}
            style={styles.addButton}
          >
            <Ionicons name="add" size={25} color={Colors.dark.background} />
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={Colors.dark.accent} />
          </View>
        ) : errorMessage ? (
          <View style={styles.center}>
            <Text style={styles.error}>{errorMessage}</Text>
            <Pressable accessibilityRole="button" onPress={loadEntries} style={styles.retry}>
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            contentContainerStyle={filteredEntries.length ? styles.list : styles.emptyList}
            data={filteredEntries}
            keyExtractor={(entry) => entry.id}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <View style={styles.empty}>
                <View style={styles.emptyMark}>
                  <Ionicons name="key-outline" size={26} color={Colors.dark.accent} />
                </View>
                <Text style={styles.emptyTitle}>{query ? 'No matching entries' : 'Your vault is ready'}</Text>
                <Text style={styles.emptyText}>
                  {query ? 'Try another service or username.' : 'Add your first login to keep it close and private.'}
                </Text>
                {!query ? (
                  <Pressable accessibilityRole="button" onPress={() => router.push('./add')} style={styles.emptyAction}>
                    <Text style={styles.emptyActionText}>Add an entry</Text>
                  </Pressable>
                ) : null}
              </View>
            }
            renderItem={({ item }) => (
              <EntryRow entry={item} onPress={() => router.push({ pathname: './entry/[id]', params: { id: item.id } })} />
            )}
          />
        )}
      </View>
    </VaultShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  eyebrow: {
    ...Typography.caption,
    color: Colors.dark.accent,
    letterSpacing: 1.4,
  },
  title: {
    ...Typography.displaySm,
    color: Colors.dark.text,
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  search: {
    flex: 1,
  },
  addButton: {
    width: 52,
    height: 52,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.accent,
  },
  list: {
    paddingBottom: Spacing.five,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: Spacing.five,
  },
  separator: {
    height: Spacing.two,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  error: {
    ...Typography.body,
    color: Colors.dark.danger,
    textAlign: 'center',
  },
  retry: {
    minHeight: 48,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    ...Typography.bodyBold,
    color: Colors.dark.accent,
  },
  empty: {
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  emptyMark: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.accentMuted,
    marginBottom: Spacing.three,
  },
  emptyTitle: {
    ...Typography.headingSm,
    color: Colors.dark.text,
    textAlign: 'center',
  },
  emptyText: {
    ...Typography.body,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.one,
  },
  emptyAction: {
    minHeight: 48,
    justifyContent: 'center',
    marginTop: Spacing.three,
  },
  emptyActionText: {
    ...Typography.bodyBold,
    color: Colors.dark.accent,
  },
});
