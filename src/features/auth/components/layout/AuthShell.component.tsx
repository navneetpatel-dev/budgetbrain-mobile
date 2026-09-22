import { useMemo } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, useWindowDimensions,  } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BackButton } from '@/shared/components/ui';
import { AuthHeroHeader } from '@/features/auth/components/layout/AuthHeroHeader.component';
import { useTheme } from '@/shared/theme';
import { useResponsive } from '@/shared/utils/responsive';
import { useBottomSafeInset } from '@/shared/hooks/useLayout.hook';
import { appHref } from '@/shared/utils/navigation';
import { createStyles } from './AuthShell.styles';

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
  const bottomSafe = useBottomSafeInset();
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
              { paddingBottom: bottomSafe + 20 },
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
