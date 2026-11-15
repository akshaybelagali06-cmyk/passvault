import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AuroraBackground } from '@/components/ui/aurora-background';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassCard } from '@/components/ui/glass-card';
import { Logo } from '@/components/ui/logo';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { isPinSet } from '@/services/pin';

type BootState = 'loading' | 'error';

export default function SplashScreen() {
  const [state, setState] = useState<BootState>('loading');

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      void isPinSet()
        .then((pinExists) => {
          if (!active) return;
          router.replace(pinExists ? '/lock' : '/setup');
        })
        .catch(() => {
          if (active) setState('error');
        });
    }, 900);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  const retry = () => {
    setState('loading');
    void isPinSet()
      .then((pinExists) => router.replace(pinExists ? '/lock' : '/setup'))
      .catch(() => setState('error'));
  };

  return (
    <AuroraBackground>
      <View style={styles.container}>
        {state === 'error' ? (
          <GlassCard strong style={styles.errorCard}>
            <Ionicons name="warning-outline" size={38} color={Colors.dark.danger} />
            <Text style={styles.title}>Could not open PassVault</Text>
            <Text style={styles.subtitle}>
              Your secure PIN data could not be read. Try again without creating a new PIN.
            </Text>
            <GlassButton onPress={retry} variant="secondary" style={styles.retry}>
              Retry
            </GlassButton>
          </GlassCard>
        ) : (
          <>
            <Logo size={88} />
            <Text style={styles.title}>PassVault</Text>
            <Text style={styles.subtitle}>Your passwords. Offline. Secure.</Text>
          </>
        )}
      </View>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  errorCard: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    padding: Spacing.four,
    gap: Spacing.two,
  },
  title: {
    ...Typography.headingLg,
    fontFamily: 'Sora-Bold',
    color: Colors.dark.text,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    fontFamily: 'Inter',
    color: Colors.dark.textSecondary,
    textAlign: 'center',
  },
  retry: {
    marginTop: Spacing.two,
    minWidth: 140,
  },
});
