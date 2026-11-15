import { createContext, useContext, type ComponentRef, type RefObject } from 'react';
import { Platform, View } from 'react-native';
import type { BlurMethod } from 'expo-blur';

type GlassTarget = ComponentRef<typeof View>;

interface GlassContextValue {
  blurEnabled: boolean;
  blurMethod: BlurMethod;
  targetRef: RefObject<GlassTarget | null>;
}

const fallbackTargetRef: RefObject<GlassTarget | null> = { current: null };
const fallbackGlass: GlassContextValue = {
  blurEnabled: false,
  blurMethod: 'none',
  targetRef: fallbackTargetRef,
};

export const GlassContext = createContext<GlassContextValue>(fallbackGlass);

export function useGlass(): GlassContextValue {
  return useContext(GlassContext);
}

export function getGlassSupport(): Pick<GlassContextValue, 'blurEnabled' | 'blurMethod'> {
  const androidVersion = typeof Platform.Version === 'number' ? Platform.Version : 0;
  const blurEnabled = Platform.OS === 'ios' || (Platform.OS === 'android' && androidVersion >= 31);
  return {
    blurEnabled,
    blurMethod: Platform.OS === 'android' ? 'dimezisBlurViewSdk31Plus' : 'none',
  };
}
