import { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';
import type { AppTheme } from '@/shared/theme';
import { useResponsive } from '@/shared/utils/responsive';

function roleLabel(role?: string) {
  switch (role) {
    case 'admin':
      return 'Admin';
    case 'premium':
      return 'Premium';
    case 'lifetime':
      return 'Lifetime';
    default:
      return 'Free plan';
  }
}

function roleColors(role: string | undefined, t: AppTheme) {
  switch (role) {
    case 'admin':
      return { bg: t.colors.warningSoft, text: t.colors.warning, border: t.colors.warning + '44' };
    case 'premium':
    case 'lifetime':
      return { bg: t.colors.primarySoft, text: t.colors.primary, border: t.colors.primary + '44' };
    default:
      return {
        bg: t.isDark ? 'rgba(255,255,255,0.08)' : t.colors.surfaceHover,
        text: t.colors.textSecondary,
        border: t.isDark ? 'rgba(255,255,255,0.1)' : t.colors.border,
      };
  }
}

export function ProfileHero({
  name,
  email,
  role,
  currency,
}: {
  name: string;
  email?: string;
  role?: string;
  currency?: string;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { tabBarPaddingX } = useResponsive();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const initial = name?.[0]?.toUpperCase() ?? '?';
  const badge = roleColors(role, theme);

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 10, paddingHorizontal: tabBarPaddingX }]}>
      <LinearGradient
        colors={[theme.colors.gradientStart, theme.colors.primary, theme.colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(255,255,255,0.14)', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.7 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={[styles.orb, styles.orbRight]} pointerEvents="none" />
      <View style={[styles.orb, styles.orbLeft]} pointerEvents="none" />

      <View style={styles.row}>
        <View style={styles.avatarRing}>
          <LinearGradient
            colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.12)']}
            style={styles.avatarRingGradient}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          {email ? (
            <Text style={styles.email} numberOfLines={1}>
              {email}
            </Text>
          ) : null}
          <View style={styles.metaRow}>
            <View style={[styles.roleBadge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
              <Text style={[styles.roleText, { color: badge.text }]}>{roleLabel(role).toUpperCase()}</Text>
            </View>
            {currency ? (
              <View style={styles.currencyChip}>
                <AppIcon name="wallet" size={11} color="rgba(255,255,255,0.85)" />
                <Text style={styles.currencyText}>{currency}</Text>
              </View>
            ) : null}
          </View>
        </View>

      </View>
    </View>
  );
}

function createStyles(t: AppTheme) {
  return StyleSheet.create({
    wrap: {
      paddingBottom: t.spacing.lg,
      overflow: 'hidden',
      borderBottomLeftRadius: t.radii.xl,
      borderBottomRightRadius: t.radii.xl,
    },
    orb: {
      position: 'absolute',
      borderRadius: 999,
      backgroundColor: 'rgba(255,255,255,0.07)',
    },
    orbRight: { width: 120, height: 120, top: -30, right: -40 },
    orbLeft: { width: 80, height: 80, bottom: -20, left: -20 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing.md,
    },
    avatarRing: {
      borderRadius: 999,
      padding: 2,
    },
    avatarRingGradient: {
      borderRadius: 999,
      padding: 2,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: 'rgba(255,255,255,0.18)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      color: '#fff',
      fontSize: 22,
      fontWeight: '800',
    },
    info: {
      flex: 1,
      minWidth: 0,
    },
    name: {
      color: '#fff',
      fontSize: 20,
      fontWeight: '800',
      letterSpacing: -0.3,
    },
    email: {
      color: 'rgba(255,255,255,0.78)',
      fontSize: 13,
      marginTop: 2,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 8,
    },
    roleBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: t.radii.full,
      borderWidth: 1,
    },
    roleText: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.6,
    },
    currencyChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: t.radii.full,
      backgroundColor: 'rgba(255,255,255,0.14)',
    },
    currencyText: {
      color: 'rgba(255,255,255,0.9)',
      fontSize: 10,
      fontWeight: '700',
    },
  });
}
