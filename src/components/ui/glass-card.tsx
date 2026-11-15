import { BlurView } from 'expo-blur';
import { PropsWithChildren } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { Aurora, Radii } from '@/constants/theme';
import { useGlass } from '@/hooks/use-glass';

interface GlassCardProps extends PropsWithChildren {
  style?: ViewStyle;
  strong?: boolean;
}

export function GlassCard({ children, style, strong = false }: GlassCardProps) {
  const { blurEnabled, blurMethod, targetRef } = useGlass();

  return (
    <View style={[styles.card, strong && styles.strongCard, style]}>
      {blurEnabled && (
        <BlurView
          blurMethod={blurMethod}
          blurTarget={targetRef}
          intensity={28}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
      )}
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderRadius: Radii.lg,
    backgroundColor: Aurora.glass,
    borderWidth: 1,
    borderColor: Aurora.glassBorder,
    borderTopColor: 'rgba(255,255,255,0.26)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.24,
    shadowRadius: 24,
    elevation: 8,
  },
  strongCard: {
    backgroundColor: 'rgba(10,12,18,0.82)',
  },
  inner: {
    flex: 1,
  },
});
