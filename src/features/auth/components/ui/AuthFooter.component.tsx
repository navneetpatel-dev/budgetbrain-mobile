import { useMemo } from 'react';
import { Link } from 'expo-router';
import { View, Text } from 'react-native';
import { useTheme } from '@/shared/theme';
import { appHref } from '@/shared/utils/navigation';
import { createStyles } from './AuthFooter.styles';

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
