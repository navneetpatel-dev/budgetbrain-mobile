import { useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BackButton } from '@/shared/components/ui';
import { AuthHeroHeader } from '@/features/auth/components/layout/AuthHeroHeader';
import { useTheme } from '@/shared/theme';
import { useResponsive } from '@/shared/utils/responsive';
import { appHref } from '@/shared/utils/navigation';

export function AuthShell({
  children,
  footer,
  tagline,
  backHref,
  panelTitle,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
  tagline?: string;
  backHref?: string;
  panelTitle?: string;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { height } = useWindowDimensions();
  const { isPhone } = useResponsive();

  const heroHeight = isPhone
    ? Math.min(Math.max(height * 0.27, 192), 224)
    : Math.min(Math.max(height * 0.36, 260), 320);

  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    if (backHref) router.replace(appHref(backHref));
  };

  return (
    <View style={styles.heroRoot}>
      <AuthHeroHeader
        tagline={tagline}
        topInset={insets.top}
        compact={isPhone}
        branded
        style={{ height: heroHeight }}
      />

      <View style={[styles.panel, isPhone && styles.panelCompact]}>
        <View style={[styles.panelHandle, isPhone && styles.panelHandleCompact]} />
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
            {backHref ? (
              <View style={styles.backWrap}>
                <BackButton onPress={handleBack} />
              </View>
            ) : null}
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
      backgroundColor: t.colors.background,
    },
    panel: {
      flex: 1,
      backgroundColor: t.colors.background,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.14,
          shadowRadius: 14,
        },
        android: { elevation: 10 },
        default: {},
      }),
    },
    panelCompact: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
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
    panelHandleCompact: {
      width: 36,
    },
    panelScroll: {
      paddingHorizontal: t.spacing.xl,
      paddingTop: t.spacing.lg,
    },
    backWrap: {
      marginBottom: t.spacing.lg,
    },
    panelEyebrow: {
      ...t.typography.label,
      color: t.colors.primary,
      marginBottom: t.spacing.lg,
    },
    form: {
      gap: t.spacing.xs,
    },
    footer: {
      marginTop: t.spacing.lg,
      paddingTop: 0,
      alignItems: 'center',
    },
  });
}
