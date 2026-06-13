import { useMemo } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';
import { useResponsive } from '@/shared/utils/responsive';

export function AiHeroHeader() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { screenPaddingX } = useResponsive();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 6, paddingHorizontal: screenPaddingX }]}>
      <LinearGradient
        colors={[theme.colors.primary + '33', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={styles.row}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.75 }]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <AppIcon name="arrowLeft" size={18} color={theme.colors.text} />
        </Pressable>

        <View style={styles.titleGroup}>
          <View style={styles.iconBadge}>
            <AppIcon name="ai" size={16} color={theme.colors.primary} />
          </View>
          <View>
            <Text style={styles.title}>AI Coach</Text>
            <Text style={styles.subtitle}>Ask about your finances</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    wrap: {
      paddingBottom: t.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.borderSubtle,
      backgroundColor: t.colors.background,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing.sm,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.surfaceHover,
    },
    titleGroup: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing.sm,
    },
    iconBadge: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.colors.primarySoft,
    },
    title: {
      ...t.typography.bodySemibold,
      color: t.colors.text,
      fontSize: 16,
    },
    subtitle: {
      ...t.typography.caption,
      color: t.colors.textSecondary,
      marginTop: 1,
    },
  });
}
