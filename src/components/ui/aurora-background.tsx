import { BlurTargetView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { PropsWithChildren, useEffect, useRef, type ComponentRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Aurora } from '@/constants/theme';
import { GlassContext, getGlassSupport } from '@/hooks/use-glass';

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

export function AuroraBackground({ children }: PropsWithChildren) {
  const targetRef = useRef<ComponentRef<typeof View>>(null);
  const reduceMotion = useReducedMotion();
  const teal = useSharedValue(0);
  const indigo = useSharedValue(0);
  const amber = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    teal.value = withRepeat(
      withTiming(1, { duration: 32_000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    indigo.value = withRepeat(
      withTiming(1, { duration: 38_000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    amber.value = withRepeat(
      withTiming(1, { duration: 26_000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [amber, indigo, reduceMotion, teal]);

  const tealStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: -80 + teal.value * 120 },
      { translateY: -120 + teal.value * 80 },
      { scale: 1 + teal.value * 0.1 },
    ],
  }));
  const indigoStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: 120 - indigo.value * 160 },
      { translateY: 100 - indigo.value * 100 },
      { scale: 1 + indigo.value * 0.08 },
    ],
  }));
  const amberStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: 80 - amber.value * 100 },
      { translateY: 180 - amber.value * 80 },
    ],
  }));

  return (
    <GlassContext.Provider value={{ ...getGlassSupport(), targetRef }}>
      <View style={styles.container}>
        <BlurTargetView ref={targetRef} style={styles.glowLayer}>
          <AnimatedGradient
            colors={['rgba(45,212,191,0.24)', 'rgba(45,212,191,0)']}
            style={[styles.glow, styles.tealGlow, tealStyle]}
          />
          <AnimatedGradient
            colors={['rgba(99,102,241,0.2)', 'rgba(99,102,241,0)']}
            style={[styles.glow, styles.indigoGlow, indigoStyle]}
          />
          <AnimatedGradient
            colors={['rgba(245,179,92,0.12)', 'rgba(245,179,92,0)']}
            style={[styles.glow, styles.amberGlow, amberStyle]}
          />
        </BlurTargetView>
        <View style={styles.content}>{children}</View>
      </View>
    </GlassContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Aurora.ink,
  },
  glowLayer: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
  },
  tealGlow: { top: -150, left: -150 },
  indigoGlow: { top: 180, right: -180 },
  amberGlow: { bottom: -180, left: 80 },
  content: {
    flex: 1,
  },
});
