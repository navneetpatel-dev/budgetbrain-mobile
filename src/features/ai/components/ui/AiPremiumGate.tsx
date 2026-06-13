import { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Button, ScreenContainer } from '@/shared/components/ui';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';

export function AiPremiumGate() {
  const theme = useTheme();
  const router = useRouter();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <ScreenContainer padded={false} style={styles.root}>
      <ProfileStackHeader screen="ai" subtitle="Premium feature" />
      <View style={styles.body}>
        <LinearGradient
          colors={[theme.colors.gradientStart, theme.colors.primary, theme.colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.glow}
        />
        <View style={styles.iconRing}>
          <AppIcon name="ai" size={36} color={theme.colors.primary} />
        </View>
        <Text style={styles.title}>Unlock AI Coach</Text>
        <Text style={styles.subtitle}>
          Get spending insights, anomaly detection, and a personal finance coach powered by your data.
        </Text>
        <Button title="Upgrade to Premium" onPress={() => router.push('/subscription')} size="lg" />
      </View>
    </ScreenContainer>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: { flex: 1 },
    body: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
      overflow: 'hidden',
    },
    glow: {
      position: 'absolute',
      width: 280,
      height: 280,
      borderRadius: 140,
      opacity: 0.18,
      top: '28%',
    },
    iconRing: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.colors.primarySoft,
      marginBottom: t.spacing.xl,
    },
    title: { ...t.typography.title, color: t.colors.text, marginBottom: t.spacing.sm, textAlign: 'center' },
    subtitle: {
      ...t.typography.bodyMedium,
      color: t.colors.textSecondary,
      textAlign: 'center',
      marginBottom: t.spacing.xl,
      lineHeight: 22,
      maxWidth: 300,
    },
  });
}
