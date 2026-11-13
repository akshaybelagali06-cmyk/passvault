/**
 * Splash screen — boot decision point.
 *
 * Shows PassVault logo + name with a fade-in animation, then:
 *   - no PIN stored → replace with /setup
 *   - PIN stored    → replace with /lock
 */
import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

import { Colors, Radii, Spacing, Typography } from '@/constants/theme';
import { isPinSet } from '@/services/pin';

const BG = Colors.dark.background;

export default function SplashScreen() {
  // Logo + text fade in
  const logoOpacity = useSharedValue(0);
  const logoScale   = useSharedValue(0.85);
  const textOpacity = useSharedValue(0);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));
  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  useEffect(() => {
    // Animate in — assigning to .value is the correct Reanimated v4 pattern
    // eslint-disable-next-line react-hooks/immutability
    logoOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) });
    // eslint-disable-next-line react-hooks/immutability
    logoScale.value   = withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) });
    // eslint-disable-next-line react-hooks/immutability
    textOpacity.value = withDelay(300, withTiming(1, { duration: 400 }));

    // After animation, decide where to go
    const timer = setTimeout(async () => {
      try {
        const pinExists = await isPinSet();
        if (pinExists) {
          router.replace('/lock');
        } else {
          router.replace('/setup');
        }
      } catch {
        // If secure store fails (e.g. in bare JS env), go to setup
        router.replace('/setup');
      }
    }, 900);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      {/* Shield icon (emoji placeholder until a real SVG asset is added) */}
      <Animated.View style={[styles.logoWrapper, logoStyle]}>
        <View style={styles.shieldBg}>
          <Animated.Text style={styles.shieldEmoji}>🔐</Animated.Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.textBlock, textStyle]}>
        <Animated.Text style={styles.appName}>PassVault</Animated.Text>
        <Animated.Text style={styles.tagline}>Your passwords. Offline. Secure.</Animated.Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldBg: {
    width: 100,
    height: 100,
    borderRadius: Radii.xl,
    backgroundColor: Colors.dark.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldEmoji: {
    fontSize: 48,
  },
  textBlock: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  appName: {
    ...Typography.displaySm,
    color: Colors.dark.text,
  },
  tagline: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
  },
});
