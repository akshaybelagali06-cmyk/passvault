import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AuroraBackground } from '@/components/ui/aurora-background';
import { GlassCard } from '@/components/ui/glass-card';
import { Logo } from '@/components/ui/logo';
import { PinDots } from '@/components/pin-dots';
import { PinPad } from '@/components/pin-pad';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { createPin, validatePin } from '@/services/pin';

const MAX_LENGTH = 6;
type Step = 'create' | 'confirm';

export default function SetupScreen() {
  const [step, setStep] = useState<Step>('create');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const firstPin = useRef('');

  const current = step === 'create' ? pin : confirmPin;
  const setCurrent = step === 'create' ? setPin : setConfirmPin;

  const resetToCreate = () => {
    setStep('create');
    setPin('');
    setConfirmPin('');
    firstPin.current = '';
  };

  const handlePress = async (digit: string) => {
    if (loading || current.length >= MAX_LENGTH) return;
    setErrorMessage(null);
    const next = current + digit;
    setCurrent(next);

    if (next.length !== MAX_LENGTH) return;

    if (step === 'create') {
      const validationMessage = validatePin(next);
      if (validationMessage) {
        setErrorMessage(validationMessage);
        setTimeout(() => setPin(''), 900);
        return;
      }

      firstPin.current = next;
      setTimeout(() => {
        setStep('confirm');
        setPin('');
        setConfirmPin('');
      }, 150);
      return;
    }

    if (next !== firstPin.current) {
      setErrorMessage("PINs don't match. Try again.");
      setTimeout(() => {
        setErrorMessage(null);
        resetToCreate();
      }, 900);
      return;
    }

    setLoading(true);
    try {
      await createPin(next);
      router.replace('/(home)');
    } catch (error) {
      setLoading(false);
      setErrorMessage(error instanceof Error ? error.message : 'Could not save your PIN.');
      setTimeout(() => {
        setErrorMessage(null);
        resetToCreate();
      }, 1200);
    }
  };

  const handleDelete = () => {
    if (loading) return;
    setErrorMessage(null);
    setCurrent((previous) => previous.slice(0, -1));
  };

  return (
    <AuroraBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <Logo size={64} />
          <Text style={styles.title}>{step === 'create' ? 'Create your PIN' : 'Confirm your PIN'}</Text>
          <Text style={styles.subtitle}>
            {step === 'create' ? 'Choose a six-digit PIN to protect the app.' : 'Enter it once more to confirm.'}
          </Text>
        </View>

        <GlassCard strong style={styles.pinCard}>
          <PinDots length={current.length} error={Boolean(errorMessage)} />
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          <Text style={styles.note}>Your PIN unlocks the app. It is never used as your encryption key.</Text>
        </GlassCard>

        {loading ? (
          <View style={styles.spinnerWrapper}>
            <ActivityIndicator color={Colors.dark.accent} size="large" />
            <Text style={styles.loadingText}>Securing your PIN…</Text>
          </View>
        ) : (
          <PinPad onPress={handlePress} onDelete={handleDelete} />
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
    alignItems: 'center',
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
