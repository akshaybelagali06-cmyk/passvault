/**
 * PIN setup screen — first-time PIN creation.
 *
 * Step 1: Enter new 6-digit PIN.
 * Step 2: Confirm it.
 * On match  → createPin() → replace with /(home)
 * On mismatch → shake error + return to step 1.
 */
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { PinDots } from '@/components/pin-dots';
import { PinPad } from '@/components/pin-pad';
import { Colors, Radii, Spacing, Typography } from '@/constants/theme';
import { createPin } from '@/services/pin';

const MAX_LENGTH = 6;
const BG = Colors.dark.background;

type Step = 'create' | 'confirm';

export default function SetupScreen() {
  const [step, setStep]       = useState<Step>('create');
  const [pin, setPin]         = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError]     = useState(false);
  const [loading, setLoading] = useState(false);
  const firstPin = useRef('');

  const current   = step === 'create' ? pin : confirmPin;
  const setCurrent = step === 'create' ? setPin : setConfirmPin;

  const handlePress = async (digit: string) => {
    if (loading) return;
    setError(false);
    if (current.length >= MAX_LENGTH) return;

    const next = current + digit;
    setCurrent(next);

    if (next.length === MAX_LENGTH) {
      if (step === 'create') {
        // Advance to confirm step
        firstPin.current = next;
        setTimeout(() => {
          setStep('confirm');
          setPin('');
          setConfirmPin('');
        }, 150);
      } else {
        // Confirm step complete — check match
        if (next === firstPin.current) {
          setLoading(true);
          try {
            await createPin(next);
            router.replace('/(home)');
          } catch {
            setLoading(false);
            setError(true);
            setTimeout(() => {
              setStep('create');
              setPin('');
              setConfirmPin('');
              setError(false);
              firstPin.current = '';
            }, 800);
          }
        } else {
          // Mismatch
          setError(true);
          setTimeout(() => {
            setStep('create');
            setPin('');
            setConfirmPin('');
            setError(false);
            firstPin.current = '';
          }, 800);
        }
      }
    }
  };

  const handleDelete = () => {
    if (loading) return;
    setError(false);
    setCurrent((prev) => prev.slice(0, -1));
  };

  const title    = step === 'create' ? 'Create your PIN' : 'Confirm your PIN';
  const subtitle = step === 'create'
    ? 'Choose a 6-digit PIN to protect the app'
    : 'Enter the same PIN again to confirm';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.shieldEmoji}>🔐</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {/* Dots */}
      <View style={styles.dotsWrapper}>
        <PinDots length={current.length} error={error} />
        {error && (
          <Text style={styles.errorText}>
            {step === 'confirm' ? "PINs don't match — try again" : 'Something went wrong'}
          </Text>
        )}
      </View>

      {/* Security note */}
      <View style={styles.noteCard}>
        <Text style={styles.noteText}>
          🔒 Your PIN only <Text style={styles.noteEmphasis}>unlocks the app</Text>. It is not your encryption key.
        </Text>
      </View>

      {/* Keypad or spinner */}
      {loading ? (
        <View style={styles.spinnerWrapper}>
          <ActivityIndicator color={Colors.dark.accent} size="large" />
          <Text style={styles.loadingText}>Setting up…</Text>
        </View>
      ) : (
        <PinPad onPress={handlePress} onDelete={handleDelete} disabled={loading} />
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
    minHeight: 56,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.dark.danger,
    textAlign: 'center',
  },
  noteCard: {
    backgroundColor: Colors.dark.accentMuted,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    maxWidth: 300,
  },
  noteText: {
    ...Typography.caption,
    color: Colors.dark.text,
    textAlign: 'center',
    lineHeight: 20,
  },
  noteEmphasis: {
    fontWeight: '700',
    color: Colors.dark.accent,
  },
  spinnerWrapper: {
    alignItems: 'center',
    gap: Spacing.two,
    height: 240,
    justifyContent: 'center',
  },
  loadingText: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
  },
});
