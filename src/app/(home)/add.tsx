import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { usePreventScreenCapture } from 'expo-screen-capture';

import { GlassButton } from '@/components/ui/glass-button';
import { GlassInput } from '@/components/ui/glass-input';
import { ServiceAvatar } from '@/components/vault/service-avatar';
import { VaultShell } from '@/components/vault/vault-shell';
import { Colors, Radii, Spacing, Typography } from '@/constants/theme';
import { getEntry, saveEntry } from '@/database/vault';
import services from '@/data/services.json';
import { ENTRY_CATEGORIES, type EntryCategory, type ServiceDefinition, type VaultEntryDraft } from '@/types/vault';

const catalog = services as ServiceDefinition[];
const emptyDraft: VaultEntryDraft = {
  serviceName: '',
  username: '',
  password: '',
  website: '',
  category: 'Work',
  brandColor: Colors.dark.accent,
};

export default function AddEntryScreen() {
  usePreventScreenCapture('entry-form');
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editing = Boolean(id);
  const [draft, setDraft] = useState<VaultEntryDraft>(emptyDraft);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    void getEntry(id)
      .then((entry) => {
        if (entry) {
          setDraft({
            serviceName: entry.serviceName,
            username: entry.username,
            password: entry.password,
            website: entry.website,
            category: entry.category,
            brandColor: entry.brandColor,
            androidPackage: entry.androidPackage,
          });
        }
      })
      .catch(() => setErrorMessage('This entry could not be opened.'));
  }, [id]);

  const suggestions = useMemo(() => {
    const query = draft.serviceName.trim().toLowerCase();
    if (!query) return [];
    return catalog
      .filter((service) => service.name.toLowerCase().includes(query) || service.domain.includes(query))
      .slice(0, 5);
  }, [draft.serviceName]);

  const chooseService = (service: ServiceDefinition) => {
    setDraft((current) => ({
      ...current,
      serviceName: service.name,
      website: `https://${service.domain}`,
      brandColor: service.brandColor,
      category: service.defaultCategory,
      androidPackage: service.androidPackage,
    }));
  };

  const handleServiceNameChange = (value: string) => {
    const query = value.trim().toLowerCase();
    const match = catalog.find(
      (service) => service.name.toLowerCase() === query || service.domain.toLowerCase() === query,
    );
    if (!match) {
      update('serviceName', value);
      return;
    }
    chooseService(match);
  };

  const update = <Key extends keyof VaultEntryDraft>(key: Key, value: VaultEntryDraft[Key]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async () => {
    if (!draft.serviceName.trim() || !draft.password) {
      setErrorMessage('Service name and password are required.');
      return;
    }

    setSaving(true);
    setErrorMessage(null);
    try {
      await saveEntry({
        ...draft,
        serviceName: draft.serviceName.trim(),
        username: draft.username.trim(),
        website: draft.website.trim(),
      }, id);
      router.back();
    } catch {
      setSaving(false);
      setErrorMessage('The entry could not be saved.');
    }
  };

  return (
    <VaultShell>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Pressable accessibilityLabel="Close" accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
            <Ionicons name="arrow-back" size={22} color={Colors.dark.text} />
          </Pressable>
          <Text style={styles.title}>{editing ? 'Edit entry' : 'Add entry'}</Text>
          <View style={styles.back} />
        </View>

        <View style={styles.identity}>
          <ServiceAvatar name={draft.serviceName || '?'} color={draft.brandColor} size={56} />
          <View>
            <Text style={styles.identityTitle}>{draft.serviceName || 'New login'}</Text>
            <Text style={styles.identityText}>Stored only on this device</Text>
          </View>
        </View>

        <Text style={styles.label}>Service</Text>
        <GlassInput
          autoCapitalize="words"
          autoCorrect={false}
          onChangeText={handleServiceNameChange}
          placeholder="Search services"
          value={draft.serviceName}
        />
        {suggestions.length > 0 ? (
          <View style={styles.suggestions}>
            {suggestions.map((service) => (
              <Pressable
                accessibilityLabel={`Use ${service.name}`}
                accessibilityRole="button"
                key={service.name}
                onPress={() => chooseService(service)}
                style={styles.suggestion}
              >
                <ServiceAvatar name={service.name} color={service.brandColor} size={32} />
                <View>
                  <Text style={styles.suggestionName}>{service.name}</Text>
                  <Text style={styles.suggestionDomain}>{service.domain}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        ) : null}

        <Text style={styles.label}>Username or email</Text>
        <GlassInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          onChangeText={(value) => update('username', value)}
          placeholder="name@example.com"
          textContentType="username"
          value={draft.username}
        />

        <View style={styles.labelRow}>
          <Text style={styles.label}>Password</Text>
          <Pressable accessibilityRole="button" onPress={() => setShowPassword((current) => !current)}>
            <Text style={styles.action}>{showPassword ? 'Hide' : 'Reveal'}</Text>
          </Pressable>
        </View>
        <GlassInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={(value) => update('password', value)}
          placeholder="Enter password"
          secureTextEntry={!showPassword}
          textContentType="password"
          value={draft.password}
        />

        <Text style={styles.label}>Website (optional)</Text>
        <GlassInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          onChangeText={(value) => update('website', value)}
          placeholder="https://example.com"
          value={draft.website}
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.categories}>
          {ENTRY_CATEGORIES.map((category) => (
            <Pressable
              accessibilityLabel={`Category ${category}`}
              accessibilityRole="radio"
              accessibilityState={{ selected: draft.category === category }}
              key={category}
              onPress={() => update('category', category as EntryCategory)}
              style={[styles.category, draft.category === category && styles.categorySelected]}
            >
              <Text style={[styles.categoryText, draft.category === category && styles.categoryTextSelected]}>{category}</Text>
            </Pressable>
          ))}
        </View>

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        <GlassButton disabled={saving} onPress={() => void handleSave()} style={styles.save}>
          {saving ? 'Saving' : editing ? 'Save changes' : 'Save entry'}
        </GlassButton>
      </ScrollView>
    </VaultShell>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
  },
  header: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  back: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Typography.headingSm,
    color: Colors.dark.text,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  identityTitle: {
    ...Typography.headingSm,
    color: Colors.dark.text,
  },
  identityText: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  label: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.one,
    marginTop: Spacing.three,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.three,
  },
  action: {
    ...Typography.caption,
    color: Colors.dark.accent,
  },
  suggestions: {
    marginTop: Spacing.one,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    backgroundColor: Colors.dark.surface,
    borderRadius: Radii.md,
    overflow: 'hidden',
  },
  suggestion: {
    minHeight: 56,
    paddingHorizontal: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  suggestionName: {
    ...Typography.bodyBold,
    color: Colors.dark.text,
  },
  suggestionDomain: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  category: {
    minHeight: 44,
    paddingHorizontal: Spacing.two,
    borderRadius: Radii.sm,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    justifyContent: 'center',
  },
  categorySelected: {
    borderColor: Colors.dark.accent,
    backgroundColor: Colors.dark.accentMuted,
  },
  categoryText: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
  },
  categoryTextSelected: {
    color: Colors.dark.text,
  },
  error: {
    ...Typography.caption,
    color: Colors.dark.danger,
    marginTop: Spacing.three,
  },
  save: {
    marginTop: Spacing.four,
  },
});
