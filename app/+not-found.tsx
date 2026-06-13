import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { useThemedStyles } from '@/src/shared/hooks/useThemedStyles';
import type { AppTheme } from '@/src/shared/theme';

export default function NotFoundScreen() {
  const styles = useThemedStyles(createStyles);

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen doesn't exist.</Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.background,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    link: {
      marginTop: theme.spacing.md,
      paddingVertical: theme.spacing.md,
    },
    linkText: {
      fontSize: 14,
      color: theme.colors.primary,
    },
  });
