import { useMemo } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandMark } from '@/shared/components/brand/BrandMark';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';
import { useAppSelector } from '@/shared/store/hooks';

export interface AppHeaderBarProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  showNotifications?: boolean;
  rightAction?: React.ReactNode;
}

export function AppHeaderBar({
  title = 'BudgetBrain',
  subtitle = 'Dashboard',
  showBack = false,
  onBack,
  showNotifications = true,
  rightAction,
}: AppHeaderBarProps) {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAppSelector((s) => s.auth.user);
  const styles = useMemo(() => createStyles(theme, insets.top), [theme, insets.top]);
  const userInitial = (user?.name?.[0] ?? user?.email?.[0] ?? 'A').toUpperCase();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.left}>
          {showBack ? (
            <Pressable
              onPress={handleBack}
              style={({ pressed }) => [styles.iconBtn, pressed && styles.btnPressed]}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={8}
            >
              <AppIcon name="arrowLeft" size={20} color={theme.colors.text} />
            </Pressable>
          ) : null}

          <View style={styles.brandRow}>
            <BrandMark size={32} />
            <View style={styles.titleCol}>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
              {subtitle ? (
                <Text style={styles.subtitle} numberOfLines={1}>
                  {subtitle}
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        <View style={styles.right}>
          {rightAction ? (
            rightAction
          ) : (
            <>
              {showNotifications ? (
                <Pressable
                  onPress={() => router.push('/notifications')}
                  style={({ pressed }) => [styles.iconBtn, pressed && styles.btnPressed]}
                  accessibilityRole="button"
                  accessibilityLabel="Notifications"
                  hitSlop={6}
                >
                  <AppIcon name="bell" size={20} color={theme.colors.textSecondary} />
                </Pressable>
              ) : null}

              <Pressable
                onPress={() => router.push('/(tabs)/settings')}
                style={({ pressed }) => [styles.avatarPressable, pressed && { opacity: 0.85 }]}
                accessibilityRole="button"
                accessibilityLabel="Open settings and profile"
              >
                <LinearGradient
                  colors={[theme.colors.ocean, theme.colors.violet]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.avatarGradientRing}
                >
                  <View style={styles.avatarInner}>
                    <Text style={styles.avatarText}>{userInitial}</Text>
                  </View>
                </LinearGradient>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

function createStyles(t: ReturnType<typeof useTheme>, topInset: number) {
  return StyleSheet.create({
    container: {
      backgroundColor: t.colors.surfaceContainerLow,
      paddingTop: Math.max(topInset, 12),
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: t.colors.borderSubtle,
      ...t.shadows.sm,
      zIndex: 50,
    },
    content: {
      height: 60,
      paddingHorizontal: t.spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing.sm,
      flex: 1,
      minWidth: 0,
    },
    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
      minWidth: 0,
    },
    titleCol: {
      flex: 1,
      minWidth: 0,
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: -0.3,
      color: t.colors.text,
      fontFamily: t.typography.titleSm.fontFamily,
      lineHeight: 19,
    },
    subtitle: {
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      color: t.colors.textTertiary,
      fontFamily: t.typography.label.fontFamily,
      lineHeight: 14,
      marginTop: 1,
    },
    right: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing.sm,
    },
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.colors.surfaceHover,
    },
    btnPressed: {
      transform: [{ scale: 0.94 }],
      opacity: 0.85,
    },
    avatarPressable: {
      padding: 1,
    },
    avatarGradientRing: {
      width: 36,
      height: 36,
      borderRadius: 18,
      padding: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarInner: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: t.colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#FFFFFF',
    },
  });
}
