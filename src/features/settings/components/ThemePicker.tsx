import { useMemo } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useTheme, ACCENT_OPTIONS, type ThemeMode, type AccentPalette } from '@/shared/theme';
import { AppIcon } from '@/features/navigation/components/AppIcon';

export function ThemePicker({
  mode,
  accent,
  onModeChange,
  onAccentChange,
}: {
  mode: ThemeMode;
  accent: AccentPalette;
  onModeChange: (m: ThemeMode) => void;
  onAccentChange: (a: AccentPalette) => void;
}) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const modes: { id: ThemeMode; label: string; icon: 'sun' | 'moon' | 'auto' }[] = [
    { id: 'light', label: 'Light', icon: 'sun' },
    { id: 'dark', label: 'Dark', icon: 'moon' },
    { id: 'system', label: 'Auto', icon: 'auto' },
  ];

  return (
    <View>
      <View style={styles.modeRow}>
        {modes.map((m) => (
          <Pressable
            key={m.id}
            onPress={() => onModeChange(m.id)}
            style={[styles.modeBtn, mode === m.id && styles.modeBtnActive]}
            accessibilityRole="button"
            accessibilityLabel={`${m.label} theme`}
            accessibilityState={{ selected: mode === m.id }}
          >
            <AppIcon name={m.icon} size={20} color={mode === m.id ? theme.colors.primary : theme.colors.textSecondary} />
            <Text style={[styles.modeLabel, mode === m.id && styles.modeLabelActive]}>{m.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.accentLabel}>Accent color</Text>
      <View style={styles.accentRow}>
        {ACCENT_OPTIONS.map((a) => (
          <Pressable
            key={a.id}
            onPress={() => onAccentChange(a.id)}
            style={[styles.accentBtn, accent === a.id && styles.accentBtnActive]}
            accessibilityRole="button"
            accessibilityLabel={`${a.label} accent`}
            accessibilityState={{ selected: accent === a.id }}
          >
            <View style={[styles.swatch, { backgroundColor: a.swatch }]}>
              {accent === a.id && <View style={styles.swatchCheck} />}
            </View>
            <Text style={[styles.accentName, accent === a.id && styles.accentNameActive]}>{a.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    modeRow: { flexDirection: 'row', gap: t.spacing.sm },
    modeBtn: {
      flex: 1,
      alignItems: 'center',
      gap: 6,
      paddingVertical: t.spacing.md,
      borderRadius: t.radii.md,
      backgroundColor: t.colors.surfaceHover,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    modeBtnActive: { borderColor: t.colors.primary, backgroundColor: t.colors.primarySoft },
    modeLabel: { ...t.typography.caption, color: t.colors.textSecondary },
    modeLabelActive: { color: t.colors.primary, fontWeight: '700' },
    accentLabel: {
      ...t.typography.caption,
      color: t.colors.textTertiary,
      marginTop: t.spacing.lg,
      marginBottom: t.spacing.sm,
    },
    accentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm },
    accentBtn: {
      alignItems: 'center',
      padding: t.spacing.sm,
      borderRadius: t.radii.md,
      borderWidth: 2,
      borderColor: 'transparent',
      minWidth: 58,
    },
    accentBtnActive: { borderColor: t.colors.primary, backgroundColor: t.colors.primarySoft },
    swatch: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    swatchCheck: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: t.colors.onPrimary,
      borderWidth: 2,
      borderColor: 'rgba(0,0,0,0.15)',
    },
    accentName: { ...t.typography.caption, fontSize: 10, color: t.colors.textTertiary },
    accentNameActive: { color: t.colors.primary, fontWeight: '700' },
  });
}
