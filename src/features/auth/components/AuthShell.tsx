import { useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppIcon } from '@/src/features/navigation/components/AppIcon';
import { AuthHeroHeader } from '@/src/features/auth/components/AuthHeroHeader';
import { useTheme } from '@/src/shared/theme';
import { appHref } from '@/src/shared/utils/navigation';

type AuthShellVariant = 'hero' | 'compact';

export function AuthShell({
  children,
  footer,
  title = 'BudgetBrain',
  subtitle = 'Track smarter. Save better.',
  variant = 'hero',
  backHref,
  panelTitle,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
  title?: string;
  subtitle?: string;
  variant?: AuthShellVariant;
  backHref?: string;
  panelTitle?: string;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { height } = useWindowDimensions();
  const isHero = variant === 'hero';

  const heroHeight = Math.min(Math.max(height * 0.36, 260), 320);

  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    if (backHref) router.replace(appHref(backHref));
  };

  if (!isHero) {
    return (
      <View style={styles.compactRoot}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.compactScroll,
              {
                paddingTop: insets.top + 12,
                paddingBottom: Math.max(insets.bottom, 24),
              },
            ]}
          >
            <Pressable
              onPress={handleBack}
              style={({ pressed }) => [styles.compactBack, pressed && { opacity: 0.7 }]}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <AppIcon name="arrowLeft" size={20} color={theme.colors.text} />
            </Pressable>

            <Text style={styles.compactTitle}>{title}</Text>
            <Text style={styles.compactSubtitle}>{subtitle}</Text>

            <View style={styles.form}>{children}</View>
            {footer ? <View style={styles.compactFooter}>{footer}</View> : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }

  return (
    <View style={styles.heroRoot}>
      <AuthHeroHeader
        title={title}
        subtitle={subtitle}
        topInset={insets.top}
        style={{ height: heroHeight }}
      />

      <View style={styles.panel}>
        <View style={styles.panelHandle} />
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={[
              styles.panelScroll,
              { paddingBottom: Math.max(insets.bottom, 20) },
            ]}
          >
            {panelTitle ? <Text style={styles.panelEyebrow}>{panelTitle}</Text> : null}
            <View style={styles.form}>{children}</View>
            {footer ? <View style={styles.footer}>{footer}</View> : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    flex: { flex: 1 },
    heroRoot: {
      flex: 1,
      backgroundColor: t.colors.gradientEnd,
    },
    compactRoot: {
      flex: 1,
      backgroundColor: t.colors.background,
    },
    compactScroll: {
      paddingHorizontal: t.spacing.xl,
    },
    compactBack: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.borderSubtle,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: t.spacing.lg,
    },
    compactTitle: {
      ...t.typography.display,
      fontSize: 28,
      color: t.colors.text,
    },
    compactSubtitle: {
      ...t.typography.bodyMedium,
      color: t.colors.textSecondary,
      marginTop: t.spacing.sm,
      marginBottom: t.spacing.xl,
      lineHeight: 22,
    },
    compactFooter: {
      marginTop: t.spacing.xl,
    },
    panel: {
      flex: 1,
      marginTop: -28,
      backgroundColor: t.colors.background,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      overflow: 'hidden',
    },
    panelHandle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: t.colors.border,
      marginTop: t.spacing.md,
      marginBottom: t.spacing.sm,
    },
    panelScroll: {
      paddingHorizontal: t.spacing.xl,
    },
    panelEyebrow: {
      ...t.typography.label,
      color: t.colors.primary,
      marginBottom: t.spacing.lg,
      marginTop: t.spacing.sm,
    },
    form: {
      gap: t.spacing.xs,
    },
    footer: {
      marginTop: t.spacing.xl,
      paddingTop: t.spacing.lg,
    },
  });
}
