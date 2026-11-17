import { BlurTargetView } from "expo-blur";
import { PropsWithChildren, useEffect, useRef, type ComponentRef } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";

import { Aurora } from "@/constants/theme";
import { GlassContext, getGlassSupport } from "@/hooks/use-glass";

interface RadialGlowProps {
  id: string;
  color: string;
}

function RadialGlow({ id, color }: RadialGlowProps) {
  return (
    <Svg height="100%" width="100%" viewBox="0 0 400 400">
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <Stop offset="62%" stopColor={color} stopOpacity="0.1" />
          <Stop offset="100%" stopColor={color} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Circle cx="200" cy="200" r="200" fill={`url(#${id})`} />
    </Svg>
  );
}

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
          <Animated.View style={[styles.glow, tealStyle]}>
            <RadialGlow id="auroraTeal" color={Aurora.teal} />
          </Animated.View>
          <Animated.View style={[styles.glow, indigoStyle]}>
            <RadialGlow id="auroraIndigo" color={Aurora.indigo} />
          </Animated.View>
          <Animated.View style={[styles.glow, amberStyle]}>
            <RadialGlow id="auroraAmber" color={Aurora.amber} />
          </Animated.View>
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
    overflow: "hidden",
  },
  glow: {
    position: "absolute",
    width: 400,
    height: 400,
  },
  content: {
    flex: 1,
  },
});
