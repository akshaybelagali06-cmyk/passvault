import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Aurora, Colors, Radii, Spacing } from '@/constants/theme';

interface PinDotsProps {
  length: number;
  error?: boolean;
  maxLength?: number;
}

export function PinDots({ length, error = false, maxLength = 6 }: PinDotsProps) {
  const shakeX = useSharedValue(0);
  const previousError = useRef(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (error && !previousError.current && !reduceMotion) {
      shakeX.value = withSequence(
        withTiming(-8, { duration: 60 }),
        withTiming(8, { duration: 60 }),
        withTiming(-6, { duration: 60 }),
        withTiming(6, { duration: 60 }),
        withTiming(0, { duration: 60 }),
      );
    }
    previousError.current = error;
  }, [error, reduceMotion, shakeX]);

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  return (
    <Animated.View style={[styles.row, rowStyle]}>
      {Array.from({ length: maxLength }).map((_, index) => (
        <Dot key={index} filled={index < length} error={error} reduceMotion={reduceMotion} />
      ))}
    </Animated.View>
  );
}

interface DotProps {
  filled: boolean;
  error: boolean;
  reduceMotion: boolean | null;
}

function Dot({ filled, error, reduceMotion }: DotProps) {
  const scale = useSharedValue(1);
  const previousFilled = useRef(false);

  useEffect(() => {
    if (filled && !previousFilled.current && !reduceMotion) {
      scale.value = withSequence(
        withSpring(1.3, { damping: 6, stiffness: 300 }),
        withSpring(1, { damping: 10, stiffness: 300 }),
      );
    }
    previousFilled.current = filled;
  }, [filled, reduceMotion, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const fillColor = error ? Colors.dark.danger : filled ? Aurora.teal : 'transparent';

  return (
    <Animated.View
      style={[
        styles.dot,
        { backgroundColor: fillColor, borderColor: error ? Colors.dark.danger : Aurora.glassBorder },
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: Radii.full,
    borderWidth: 1.5,
  },
});
