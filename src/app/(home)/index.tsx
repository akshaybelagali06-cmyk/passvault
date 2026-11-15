import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { AuroraBackground } from '@/components/ui/aurora-background';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { Logo } from '@/components/ui/logo';
import { Colors, Spacing, Typography } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <AuroraBackground>
      <View style={styles.container}>
        <Logo size={58} />
        <Text style={styles.title}>Your vault</Text>
        <Text style={styles.subtitle}>A calm, offline home for what matters.</Text>
        <GlassCard strong style={styles.card}>
          <Ionicons name="lock-closed-outline" size={28} color={Colors.dark.accent} />
          <Text style={styles.cardTitle}>Encrypted vault coming soon</Text>
          <Text style={styles.cardText}>Milestone 2 will bring local encrypted entries, search, and safe copy.</Text>
          <GlassButton onPress={() => undefined} variant="secondary" style={styles.button}>
            Ready for Milestone 2
          </GlassButton>
        </GlassCard>
      </View>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.two,
  },
  title: {
    ...Typography.headingLg,
    fontFamily: 'Sora-Bold',
    color: Colors.dark.text,
  },
  subtitle: {
    ...Typography.body,
    fontFamily: 'Inter',
    color: Colors.dark.textSecondary,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    padding: Spacing.four,
    marginTop: Spacing.three,
    gap: Spacing.two,
  },
  cardTitle: {
    ...Typography.headingSm,
    fontFamily: 'Sora',
    color: Colors.dark.text,
    textAlign: 'center',
  },
  cardText: {
    ...Typography.body,
    fontFamily: 'Inter',
    color: Colors.dark.textSecondary,
    textAlign: 'center',
  },
  button: {
    marginTop: Spacing.two,
  },
});
