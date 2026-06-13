import { Link } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { FeatureHeader, StackScrollScreen } from '@/shared/components/ui';
import { useThemedStyles } from '@/shared/hooks/useThemedStyles';
import type { AppTheme } from '@/shared/theme';

export default function NotFoundScreen() {
  const styles = useThemedStyles(createStyles);

  return (
    <StackScrollScreen
      header={
        <FeatureHeader variant="stack" showBack eyebrow="ERROR" title="Not Found" subtitle="This screen doesn't exist" />
      }
    >
      <Link href="/" style={styles.link}>
        <Text style={styles.linkText}>Go to home screen</Text>
      </Link>
    </StackScrollScreen>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    link: { paddingVertical: theme.spacing.md },
    linkText: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.primary,
    },
  });
