import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

import { Colors, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface PinDotsProps {
  length: number;    // number of digits entered (0–6)
  error?: boolean;   // when true, dots pulse red
  maxLength?: number;
}

const DOT_SIZE = 14;
const DOT_GAP  = 20;

export function PinDots({ length, error = false, maxLength = 6 }: PinDotsProps) {
  const theme = useTheme();
  // Horizontal shake offset
  const shakeX = useSharedValue(0);
  const prevError = useRef(false);

  useEffect(() => {
    if (error && !prevError.current) {
      // Shake animation: bounce left-right
      shakeX.value = withSequence(
        withTiming(-8,  { duration: 60 }),
        withTiming( 8,  { duration: 60 }),
        withTiming(-6,  { duration: 60 }),
        withTiming( 6,  { duration: 60 }),
        withTiming( 0,  { duration: 60 }),
      );
    }
    prevError.current = error;
  }, [error, shakeX]);

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  return (
    <Animated.View style={[styles.row, rowStyle]}>
      {Array.from({ length: maxLength }).map((_, i) => (
        <Dot
          key={i}
          filled={i < length}
          error={error}
          theme={theme}
        />
      ))}
    </Animated.View>
  );
}

interface DotProps {
  filled: boolean;
  error: boolean;
  theme: ReturnType<typeof useTheme>;
}

function Dot({ filled, error, theme }: DotProps) {
  const scale = useSharedValue(1);
  const prevFilled = useRef(false);

  useEffect(() => {
    if (filled && !prevFilled.current) {
      // Pop animation when a digit is added
      scale.value = withSequence(
        withSpring(1.3, { damping: 6, stiffness: 300 }),
        withSpring(1.0, { damping: 10, stiffness: 300 }),
      );
    }
    prevFilled.current = filled;
  }, [filled, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const fillColor = error
    ? Colors.dark.danger
    : filled
      ? theme.accent
      : theme.border;

  return (
    <Animated.View
      style={[
        styles.dot,
        { backgroundColor: fillColor, borderColor: theme.border },
        animStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: DOT_GAP,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: Radii.full,
    borderWidth: 1.5,
  },
});
