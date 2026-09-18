import { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandMark } from '@/shared/components/brand/BrandMark';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';
import { useAppSelector } from '@/shared/store/hooks';
import { createStyles } from './AppHeaderBar.styles';

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
