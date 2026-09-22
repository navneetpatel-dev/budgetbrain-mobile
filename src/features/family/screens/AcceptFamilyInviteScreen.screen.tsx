import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/shared/components/ui';
import { useTheme } from '@/shared/theme';
import { appHref } from '@/shared/utils/navigation';
import { useAcceptFamilyInvite } from '@/features/family/hooks/useAcceptFamilyInvite.hook';

export function AcceptFamilyInviteScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const { status, error } = useAcceptFamilyInvite(token);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        gap: 16,
      }}
    >
      {status === 'pending' ? (
        <>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ ...theme.typography.body, color: theme.colors.textSecondary, textAlign: 'center' }}>
            Joining family group…
          </Text>
        </>
      ) : null}

      {status === 'error' ? (
        <>
          <Text style={{ ...theme.typography.title, color: theme.colors.text, textAlign: 'center' }}>
            Could not accept invite
          </Text>
          <Text style={{ ...theme.typography.body, color: theme.colors.textSecondary, textAlign: 'center' }}>
            {error}
          </Text>
          <View style={{ width: '100%' }}>
            <Button
              title="Go to login"
              onPress={() => router.replace(appHref('/(auth)/login'))}
              variant="outline"
              size="lg"
            />
          </View>
        </>
      ) : null}

      {status === 'success' ? (
        <>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ ...theme.typography.body, color: theme.colors.textSecondary, textAlign: 'center' }}>
            You are in! Taking you to the family group…
          </Text>
        </>
      ) : null}
    </View>
  );
}
