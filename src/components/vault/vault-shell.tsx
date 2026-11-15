import { PropsWithChildren } from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';

import { Colors } from '@/constants/theme';

export function VaultShell({ children }: PropsWithChildren) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
});
