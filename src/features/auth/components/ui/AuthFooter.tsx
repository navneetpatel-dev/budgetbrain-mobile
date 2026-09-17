import { useMemo } from 'react';
import { Link } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/theme';
import { appHref } from '@/shared/utils/navigation';

export function AuthFooter({
  text,
  linkText,
  href,
  centered = true,
}: {
  text?: string;
  linkText: string;
  href: string;
  centered?: boolean;
}) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme, centered), [theme, centered]);

  return (
    <View style={styles.container}>
      {text && <Text style={styles.text}>{text}</Text>}
      <Link href={appHref(href)} style={styles.link}>{linkText}</Link>
    </View>
  );
}

export function AuthLink({
  href,
  children,
  align = 'left',
}: {
  href: string;
  children: string;
  align?: 'left' | 'center' | 'right';
}) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme, align === 'center'), [theme, align]);

  return (
    <Link
      href={appHref(href)}
      style={[
        styles.link,
        align === 'right' && styles.linkRight,
        align === 'center' && styles.linkCenter,
      ]}
    >
      {children}
    </Link>
  );
}

function createStyles(t: ReturnType<typeof useTheme>, centered: boolean) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: centered ? 'center' : 'flex-start',
      alignItems: 'center',
      marginTop: 0,
      flexWrap: 'wrap',
      gap: 4,
    },
    text: { ...t.typography.bodyMedium, color: t.colors.textSecondary },
    link: { ...t.typography.bodySemibold, color: t.colors.primary },
    linkRight: { alignSelf: 'flex-end', marginBottom: t.spacing.sm },
    linkCenter: { alignSelf: 'center', marginTop: t.spacing.md },
  });
}
