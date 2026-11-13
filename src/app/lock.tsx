/**
 * Lock screen — PIN unlock.
 *
 * On mount: reads failed-attempt state; if locked, shows countdown.
 * On correct PIN → replace with /(home).
 * On wrong PIN   → shake, show attempt count, enforce lockout if threshold reached.
 */
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { PinDots } from '@/components/pin-dots';
import { PinPad } from '@/components/pin-pad';
import { Colors, Radii, Spacing, Typography } from '@/constants/theme';
import { getFailedAttemptState, verifyPin } from '@/services/pin';

const MAX_LENGTH = 6;
const BG = Colors.dark.background;

export default function LockScreen() {
  const [pin, setPin]           = useState('');
  const [error, setError]       = useState(false);
  const [loading, setLoading]   = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [countdown, setCountdown]     = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // On mount, read persisted fail state
  useEffect(() => {
    getFailedAttemptState().then((state) => {
      if (state.locked) {
        setLockedUntil(state.lockedUntil);
        startCountdown(state.lockedUntil);
      } else {
        setAttempts(state.count);
      }
    });

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

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

  const handlePress = async (digit: string) => {
    if (loading || lockedUntil !== null) return;
    setError(false);
    if (pin.length >= MAX_LENGTH) return;

    const next = pin + digit;
    setPin(next);

    if (next.length === MAX_LENGTH) {
      setLoading(true);
      try {
        const result = await verifyPin(next);
        setPin('');

        if (result.ok) {
          router.replace('/(home)');
          return;
        }

        setLoading(false);
        setError(true);

        if (result.locked) {
          setLockedUntil(result.lockedUntil);
          startCountdown(result.lockedUntil);
        } else {
          setAttempts(result.attemptsUsed);
          setTimeout(() => setError(false), 1000);
        }
      } catch {
        setLoading(false);
        setPin('');
      }
    }
  };

  const handleDelete = () => {
    if (loading || lockedUntil !== null) return;
    setError(false);
    setPin((prev) => prev.slice(0, -1));
  };

  const isLocked = lockedUntil !== null && countdown > 0;

  const formatCountdown = (s: number) => {
    if (s >= 60) return `${Math.ceil(s / 60)} min`;
    return `${s}s`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.shieldEmoji}>🔐</Text>
        <Text style={styles.title}>PassVault</Text>
        <Text style={styles.subtitle}>Enter your PIN to unlock</Text>
      </View>

      {/* Dots */}
      <View style={styles.dotsWrapper}>
        {!isLocked && (
          <PinDots length={pin.length} error={error} />
        )}

        {isLocked ? (
          <View style={styles.lockoutCard}>
            <Text style={styles.lockoutEmoji}>⏳</Text>
            <Text style={styles.lockoutTitle}>Too many attempts</Text>
            <Text style={styles.lockoutTime}>{formatCountdown(countdown)}</Text>
            <Text style={styles.lockoutSub}>Wait before trying again</Text>
          </View>
        ) : error ? (
          <Text style={styles.errorText}>
            {attempts > 0 ? `Wrong PIN — ${attempts} failed attempt${attempts > 1 ? 's' : ''}` : 'Wrong PIN'}
          </Text>
        ) : attempts > 0 ? (
          <Text style={styles.warningText}>
            {attempts} failed attempt{attempts > 1 ? 's' : ''}
          </Text>
        ) : null}
      </View>

      {/* Keypad or spinner */}
      {loading ? (
        <View style={styles.spinnerWrapper}>
          <ActivityIndicator color={Colors.dark.accent} size="large" />
        </View>
      ) : (
        <PinPad
          onPress={handlePress}
          onDelete={handleDelete}
          disabled={loading || isLocked}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  shieldEmoji: {
    fontSize: 40,
    marginBottom: Spacing.one,
  },
  title: {
    ...Typography.headingLg,
    color: Colors.dark.text,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
  },
  dotsWrapper: {
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: 90,
    justifyContent: 'center',
  },
  errorText: {
    ...Typography.caption,
    color: Colors.dark.danger,
    textAlign: 'center',
  },
  warningText: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
  },
  lockoutCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    gap: Spacing.one,
    minWidth: 220,
  },
  lockoutEmoji: {
    fontSize: 28,
  },
  lockoutTitle: {
    ...Typography.bodyBold,
    color: Colors.dark.danger,
  },
  lockoutTime: {
    ...Typography.displaySm,
    color: Colors.dark.text,
  },
  lockoutSub: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
  },
  spinnerWrapper: {
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
