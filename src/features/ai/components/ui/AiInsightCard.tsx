import { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';

export function AiInsightCard({ text }: { text: string }) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={[theme.colors.primary + '55', theme.colors.gradientEnd + '22']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.accent}
      />
      <View style={styles.iconWrap}>
        <AppIcon name="ai" size={16} color={theme.colors.primary} />
      </View>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      padding: t.spacing.lg,
      borderRadius: t.radii.lg,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.04)' : t.colors.surface,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.08)' : t.colors.borderSubtle,
      overflow: 'hidden',
    },
    accent: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 3,
    },
    iconWrap: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.colors.primarySoft,
      marginTop: 1,
    },
    text: {
      flex: 1,
      ...t.typography.bodyMedium,
      color: t.colors.text,
      lineHeight: 22,
    },
  });
}
