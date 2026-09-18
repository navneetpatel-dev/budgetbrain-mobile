import { useMemo } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';
import { useResponsive } from '@/shared/utils/responsive';
import { createStyles } from './AiHeroHeader.styles';

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
