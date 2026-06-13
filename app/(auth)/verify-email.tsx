import { Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Button } from '@/src/shared/components/ui';
import { AuthShell } from '@/src/features/auth/components/AuthShell';
import { AuthSuccessBanner } from '@/src/features/auth/components/AuthSuccessBanner';
import { AuthInfoBanner } from '@/src/features/auth/components/AuthInfoBanner';
import { useVerifyEmail } from '@/src/features/auth/hooks/useVerifyEmail';

export default function VerifyEmailScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const { verify, loading, verified, goToLogin } = useVerifyEmail(token);

  const handleVerify = async () => {
    try {
      await verify();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'This verification link is invalid or expired.');
    }
  };

  return (
    <AuthShell
      variant="compact"
      title="Verify email"
      subtitle={verified ? 'Your account is ready to use.' : 'Confirm your email to unlock all features.'}
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
          <Button title="Verify Email" onPress={handleVerify} loading={loading} size="lg" />
        </>
      )}
    </AuthShell>
  );
}
