import { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';

export function AuthHeroHeader({
  title = 'BudgetBrain',
  subtitle = 'Track smarter. Save better.',
  topInset,
  style,
}: {
  title?: string;
  subtitle?: string;
  topInset: number;
  style?: object;
}) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isBudgetBrain = title === 'BudgetBrain';

  return (
    <View style={[styles.wrap, style]}>
      <LinearGradient
        colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(255,255,255,0.14)', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.65 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={[styles.glow, styles.glowRight]} pointerEvents="none" />
      <View style={[styles.glow, styles.glowLeft]} pointerEvents="none" />

      <View style={[styles.content, { paddingTop: topInset + 28 }]}>
        <View style={styles.logoRing}>
          <View style={styles.logoBadge}>
            <AppIcon name="wallet" size={28} color="#fff" />
          </View>
        </View>

        {isBudgetBrain ? (
          <Text style={styles.title}>
            Budget<Text style={styles.titleAccent}>Brain</Text>
          </Text>
        ) : (
          <Text style={styles.title}>{title}</Text>
        )}

        <View style={styles.divider} />
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    wrap: {
      overflow: 'hidden',
    },
    glow: {
      position: 'absolute',
      borderRadius: 999,
      backgroundColor: 'rgba(255,255,255,0.07)',
    },
    glowRight: {
      width: 200,
      height: 200,
      top: -60,
      right: -70,
    },
    glowLeft: {
      width: 140,
      height: 140,
      bottom: 20,
      left: -50,
    },
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: t.spacing.xl,
      paddingBottom: t.spacing.xxl + 8,
    },
    logoRing: {
      padding: 3,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.22)',
      marginBottom: t.spacing.lg,
    },
    logoBadge: {
      width: 60,
      height: 60,
      borderRadius: 18,
      backgroundColor: 'rgba(255,255,255,0.16)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 32,
      fontWeight: '800',
      color: '#fff',
      letterSpacing: -0.6,
      textAlign: 'center',
    },
    titleAccent: {
      fontWeight: '800',
      color: 'rgba(255,255,255,0.92)',
    },
    divider: {
      width: 32,
      height: 2,
      borderRadius: 1,
      backgroundColor: 'rgba(255,255,255,0.35)',
      marginTop: t.spacing.md,
      marginBottom: t.spacing.sm,
    },
    subtitle: {
      fontSize: 15,
      fontWeight: '500',
      color: 'rgba(255,255,255,0.78)',
      textAlign: 'center',
      lineHeight: 22,
      maxWidth: 260,
      letterSpacing: 0.2,
    },
  });
}
