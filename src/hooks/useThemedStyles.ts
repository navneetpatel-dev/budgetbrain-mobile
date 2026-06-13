import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme, type AppTheme } from '@/src/theme';

export function useThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: (theme: AppTheme) => T
): T {
  const theme = useTheme();
  return useMemo(() => StyleSheet.create(factory(theme)), [theme, factory]);
}
