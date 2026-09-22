import { useMemo } from 'react';
import { View, Text, Pressable, ActivityIndicator, Platform } from 'react-native';
import { AppIcon } from '@/features/navigation/components/AppIcon.component';
import { useSocialAuth } from '@/features/auth/hooks/useSocialAuth.hook';
import { AuthDivider } from '@/features/auth/components/ui/AuthDivider.component';
import { AuthErrorBanner } from '@/features/auth/components/ui/AuthErrorBanner.component';
import { getLoadingLabel } from '@/shared/utils/buttonLoadingLabel';
import { useTheme } from '@/shared/theme';
import { markStyles, createStyles, createBtnStyles } from './SocialAuthButtons.styles';

function GoogleMark() {
  return (
    <View style={markStyles.circle}>
      <Text style={markStyles.g}>G</Text>
    </View>
  );
}


export function SocialAuthButtons({ disabled: formDisabled }: { disabled?: boolean }) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { loading, error, clearError, signInGoogle, signInApple } = useSocialAuth();
  const isBusy = formDisabled || !!loading;

  const onGoogle = () => {
    clearError();
    void signInGoogle();
  };

  const onApple = () => {
    clearError();
    void signInApple();
  };

  return (
    <View style={styles.container}>
      <AuthDivider label="or sign in with" />
      <View style={styles.row}>
        <SocialButton
          label="Google"
          onPress={onGoogle}
          loading={loading === 'google'}
          disabled={isBusy}
          icon={<GoogleMark />}
        />
        {Platform.OS === 'ios' && (
          <SocialButton
            label="Apple"
            onPress={onApple}
            loading={loading === 'apple'}
            disabled={isBusy}
            icon={<AppIcon name="apple" size={20} color={theme.colors.text} />}
          />
        )}
      </View>
      {error ? <AuthErrorBanner message={error} /> : null}
    </View>
  );
}

function SocialButton({
  label,
  onPress,
  loading,
  disabled,
  icon,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon: React.ReactNode;
}) {
  const theme = useTheme();
  const styles = useMemo(() => createBtnStyles(theme), [theme]);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        (disabled || loading) && styles.btnDisabled,
        pressed && !disabled && !loading && styles.btnPressed,
      ]}
    >
      {loading ? (
        <>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={styles.label}>{getLoadingLabel(label)}</Text>
        </>
      ) : (
        <>
          {icon}
          <Text style={styles.label}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}
