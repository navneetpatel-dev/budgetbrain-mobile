import { useLocalSearchParams } from 'expo-router';
import { Button } from '@/shared/components/ui';
import { AuthShell, AuthSuccessBanner, AuthInfoBanner, AuthErrorBanner } from '@/features/auth/components';
import { useVerifyEmail } from '@/features/auth/hooks';

export function VerifyEmailScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const { verify, loading, verified, error, clearError, goToLogin } = useVerifyEmail(token);

  const handleVerify = () => {
    clearError();
    void verify();
  };

  return (
    <AuthShell
      tagline={verified ? 'Your account is ready to use.' : 'Confirm your email to unlock all features.'}
      panelTitle="Verify email"
      backHref="/(auth)/login"
    >
      {verified ? (
        <>
          <AuthSuccessBanner message="Your email has been verified successfully." />
          <Button title="Continue to Sign In" onPress={goToLogin} size="lg" />
        </>
      ) : (
        <>
          <AuthInfoBanner message="Tap the button below to verify your BudgetBrain account." />
          {error ? <AuthErrorBanner message={error} /> : null}
          <Button title="Verify Email" onPress={handleVerify} loading={loading} size="lg" />
        </>
      )}
    </AuthShell>
  );
}
