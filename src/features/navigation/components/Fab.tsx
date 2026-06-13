import { useMemo } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { Link, type Href } from 'expo-router';
import { useTheme } from '@/shared/theme';
import { useFabBottom } from '@/shared/hooks/useFabBottom';

export function Fab({ href, label = '+', aboveTabBar = false }: { href: Href; label?: string; aboveTabBar?: boolean }) {
  const theme = useTheme();
  const bottom = useFabBottom(aboveTabBar);
  const styles = useMemo(() => createStyles(theme, bottom), [theme, bottom]);

  return (
    <Link href={href} asChild>
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.9 }]}
        accessibilityRole="button"
        accessibilityLabel={label === '+' ? 'Add' : label}
      >
        <Text style={styles.fabText}>{label}</Text>
      </Pressable>
    </Link>
  );
}

function createStyles(t: ReturnType<typeof useTheme>, bottom: number) {
  return StyleSheet.create({
    fab: {
      position: 'absolute',
      bottom,
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
