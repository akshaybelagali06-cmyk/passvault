import * as Haptics from 'expo-haptics';
import { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Aurora, Colors, Radii, Typography } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface GlassPinKeyProps extends PropsWithChildren {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
}

export function GlassPinKey({ label, onPress, disabled = false, accessibilityLabel, children }: GlassPinKeyProps) {
  const scale = useSharedValue(1);
  const reduceMotion = useReducedMotion();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      disabled={disabled}
      onPressIn={() => {
        // eslint-disable-next-line react-hooks/immutability
        if (!reduceMotion) scale.value = withSpring(0.94);
      }}
      onPressOut={() => {
        // eslint-disable-next-line react-hooks/immutability
        if (!reduceMotion) scale.value = withSpring(1);
      }}
      onPress={() => {
        void Haptics.selectionAsync();
        onPress();
      }}
      style={[styles.key, animatedStyle, disabled && styles.disabled]}
    >
      {children ?? <Text style={styles.label}>{label}</Text>}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  key: {
    width: 72,
    height: 64,
    borderRadius: Radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: Aurora.glassBorder,
    borderTopColor: 'rgba(255,255,255,0.28)',
  },
  label: {
    ...Typography.headingLg,
    fontFamily: 'Inter',
    color: Colors.dark.text,
  },
  disabled: {
    opacity: 0.45,
  },
});
