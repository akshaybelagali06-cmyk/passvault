import { StyleSheet, Text, View } from 'react-native';

import { Colors, Typography } from '@/constants/theme';

interface ServiceAvatarProps {
  name: string;
  color: string;
  size?: number;
}

export function ServiceAvatar({ name, color, size = 48 }: ServiceAvatarProps) {
  return (
    <View style={[styles.avatar, { backgroundColor: color, width: size, height: size }]}>
      <Text style={[styles.initial, { fontSize: size * 0.42 }]}>{name.trim().charAt(0).toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  initial: {
    ...Typography.bodyBold,
    color: Colors.dark.background,
  },
});
