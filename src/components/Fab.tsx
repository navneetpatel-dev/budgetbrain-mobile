import { useMemo } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { Link, type Href } from 'expo-router';
import { useTheme } from '@/src/theme';

export function Fab({ href, label = '+' }: { href: Href; label?: string }) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Link href={href} asChild>
      <Pressable style={({ pressed }) => [styles.fab, pressed && { opacity: 0.9 }]}>
        <Text style={styles.fabText}>{label}</Text>
      </Pressable>
    </Link>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    fab: {
      position: 'absolute',
      bottom: 24,
      right: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: t.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...t.shadows.lg,
    },
    fabText: { color: t.colors.onPrimary, fontSize: 28, fontWeight: '300', marginTop: -2 },
  });
}
