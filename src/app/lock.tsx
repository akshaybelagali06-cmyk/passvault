import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AuroraBackground } from '@/components/ui/aurora-background';
import { GlassCard } from '@/components/ui/glass-card';
import { Logo } from '@/components/ui/logo';
import { PinDots } from '@/components/pin-dots';
import { PinPad } from '@/components/pin-pad';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { getFailedAttemptState, verifyPin } from '@/services/pin';

const MAX_LENGTH = 6;

export default function LockScreen() {
  const [pin, setPin] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startCountdown(until: number) {
    if (countdownRef.current) clearInterval(countdownRef.current);
    const tick = () => {
      const remaining = Math.ceil((until - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockedUntil(null);
        setCountdown(0);
        if (countdownRef.current) clearInterval(countdownRef.current);
      } else {
        setCountdown(remaining);
      }
    };
    tick();
    countdownRef.current = setInterval(tick, 500);
  }

  useEffect(() => {
    void getFailedAttemptState()
      .then((state) => {
        if (state.locked) {
          setLockedUntil(state.lockedUntil);
          startCountdown(state.lockedUntil);
        } else {
          setAttempts(state.count);
        }
      })
      .catch((error) => {
        setErrorMessage(error instanceof Error ? error.message : 'Could not read lockout state.');
      });

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const handlePress = async (digit: string) => {
    if (loading || lockedUntil !== null || pin.length >= MAX_LENGTH) return;
    setErrorMessage(null);
    const next = pin + digit;
    setPin(next);
    if (next.length !== MAX_LENGTH) return;

    setLoading(true);
    try {
      const result = await verifyPin(next);
      setPin('');

      if (result.ok) {
        router.replace('/(home)');
        return;
      }

      setLoading(false);
      if (result.locked) {
        setLockedUntil(result.lockedUntil);
        startCountdown(result.lockedUntil);
        setErrorMessage('Too many failed attempts. Please wait before trying again.');
      } else {
        setAttempts(result.attemptsUsed);
        setErrorMessage(`Wrong PIN. Failed attempt ${result.attemptsUsed}.`);
        setTimeout(() => setErrorMessage(null), 1200);
      }
    } catch (error) {
      setLoading(false);
      setPin('');
      setErrorMessage(error instanceof Error ? error.message : 'Could not verify your PIN.');
    }
  };

  const isLocked = lockedUntil !== null && countdown > 0;
  const formatCountdown = (seconds: number) => (seconds >= 60 ? `${Math.ceil(seconds / 60)} min` : `${seconds}s`);

  return (
    <AuroraBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <Logo size={64} />
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Enter your PIN to unlock your vault.</Text>
        </View>

        <GlassCard strong style={styles.pinCard}>
          {isLocked ? (
            <>
              <Text style={styles.lockedTitle}>Locked for your safety</Text>
              <Text style={styles.countdown}>{formatCountdown(countdown)}</Text>
              <Text style={styles.note}>Wait before trying again.</Text>
            </>
          ) : (
            <>
              <PinDots length={pin.length} error={Boolean(errorMessage)} />
              {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
              {!errorMessage && attempts > 0 ? (
                <Text style={styles.note}>{attempts} failed attempt{attempts === 1 ? '' : 's'}</Text>
              ) : null}
            </>
          )}
        </GlassCard>

        {loading ? (
          <View style={styles.spinnerWrapper}>
            <ActivityIndicator color={Colors.dark.accent} size="large" />
            <Text style={styles.loadingText}>Checking your PIN…</Text>
          </View>
        ) : (
          <PinPad onPress={handlePress} onDelete={() => setPin((previous) => previous.slice(0, -1))} disabled={isLocked} />
        )}
      </View>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
  },
  header: {
    alignItems: 'center',
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
  pinCard: {
    width: '100%',
    maxWidth: 360,
    minHeight: 116,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.three,
    gap: Spacing.two,
  },
  errorText: {
    ...Typography.caption,
    fontFamily: 'Inter',
    color: Colors.dark.danger,
    textAlign: 'center',
  },
  note: {
    ...Typography.caption,
    fontFamily: 'Inter',
    color: Colors.dark.textSecondary,
    textAlign: 'center',
  },
  lockedTitle: {
    ...Typography.bodyBold,
    fontFamily: 'Sora',
    color: Colors.dark.danger,
  },
  countdown: {
    ...Typography.displaySm,
    fontFamily: 'Sora-Bold',
    color: Colors.dark.text,
  },
  spinnerWrapper: {
    height: 264,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
  },
  loadingText: {
    ...Typography.caption,
    fontFamily: 'Inter',
    color: Colors.dark.textSecondary,
  },
});
