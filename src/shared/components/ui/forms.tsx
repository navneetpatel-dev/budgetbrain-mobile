import { useMemo, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';
import type { AppTheme } from '@/shared/theme';

/** Visual grouping for related form fields */
export function FormSection({
  title,
  subtitle,
  children,
  style,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const theme = useTheme();
  const styles = useMemo(() => createSectionStyles(theme), [theme]);

  return (
    <View style={[styles.wrap, style]}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <View style={styles.body}>{children}</View>
    </View>
  );
}

/** Image picker with preview, remove, and dashed upload zone */
export function ImageUploadField({
  label,
  hint = 'Tap to upload JPG or PNG',
  imageUri,
  onPick,
  onRemove,
  height = 140,
  error,
  disabled,
}: {
  label?: string;
  hint?: string;
  imageUri?: string | null;
  onPick: () => void;
  onRemove?: () => void;
  height?: number;
  error?: string;
  disabled?: boolean;
}) {
  const theme = useTheme();
  const styles = useMemo(() => createUploadStyles(theme, height), [theme, height]);

  return (
    <View style={[styles.container, disabled && styles.containerDisabled]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable
        onPress={disabled || imageUri ? undefined : onPick}
        disabled={disabled}
        style={({ pressed }) => [
          styles.zone,
          error && styles.zoneError,
          disabled && styles.zoneDisabled,
          !imageUri && pressed && !disabled && styles.zonePressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={label ?? 'Upload image'}
      >
        {imageUri ? (
          <>
            <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.55)']}
              style={styles.previewOverlay}
            />
            <View style={styles.previewActions}>
              <Pressable
                onPress={disabled ? undefined : onPick}
                disabled={disabled}
                style={({ pressed }) => [styles.previewBtn, pressed && !disabled && { opacity: 0.85 }]}
                accessibilityRole="button"
                accessibilityLabel="Replace image"
              >
                <AppIcon name="document" size={16} color={theme.colors.onPrimary} />
                <Text style={styles.previewBtnText}>Replace</Text>
              </Pressable>
              {onRemove ? (
                <Pressable
                  onPress={disabled ? undefined : onRemove}
                  disabled={disabled}
                  style={({ pressed }) => [styles.previewBtn, styles.removeBtn, pressed && !disabled && { opacity: 0.85 }]}
                  accessibilityRole="button"
                  accessibilityLabel="Remove image"
                >
                  <AppIcon name="trash" size={16} color={theme.colors.onPrimary} />
                </Pressable>
              ) : null}
            </View>
          </>
        ) : (
          <View style={styles.empty}>
            <LinearGradient
              colors={[theme.colors.primary + '28', theme.colors.gradientEnd + '18']}
              style={styles.emptyIconRing}
            >
              <AppIcon name="document" size={22} color={theme.colors.primary} />
            </LinearGradient>
            <Text style={styles.emptyTitle}>Add photo</Text>
            <Text style={styles.emptyHint}>{hint}</Text>
          </View>
        )}
      </Pressable>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

/** Color swatch selector */
export function ColorPicker({
  colors,
  value,
  onChange,
  label,
  error,
  disabled,
}: {
  colors: string[];
  value: string;
  onChange: (color: string) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
}) {
  const theme = useTheme();
  const styles = useMemo(() => createColorStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {colors.map((c) => {
          const selected = value === c;
          return (
            <Pressable
              key={c}
              onPress={disabled ? undefined : () => onChange(c)}
              disabled={disabled}
              style={[styles.swatchOuter, selected && { borderColor: c }, disabled && styles.swatchDisabled]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`Color ${c}`}
            >
              <View style={[styles.swatch, { backgroundColor: c }]}>
                {selected ? <AppIcon name="checkmark" size={16} color={theme.colors.onPrimary} /> : null}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

function createSectionStyles(t: AppTheme) {
  return StyleSheet.create({
    wrap: {
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.03)' : t.colors.surface,
      borderRadius: t.radii.lg,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.borderSubtle,
      padding: t.spacing.md,
      marginBottom: t.spacing.md,
    },
    title: {
      fontSize: 13,
      fontWeight: '700',
      color: t.colors.text,
      letterSpacing: -0.1,
      marginBottom: 2,
    },
    subtitle: {
      ...t.typography.caption,
      color: t.colors.textSecondary,
      marginBottom: t.spacing.sm,
    },
    body: { gap: 2 },
  });
}

function createUploadStyles(t: AppTheme, height: number) {
  return StyleSheet.create({
    container: { marginBottom: t.spacing.lg },
    containerDisabled: { opacity: 0.55 },
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: t.colors.textSecondary,
      marginBottom: t.spacing.sm,
    },
    zone: {
      height,
      borderRadius: t.radii.lg,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: t.isDark ? 'rgba(255,255,255,0.14)' : t.colors.border,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.03)' : t.colors.surface,
      overflow: 'hidden',
    },
    zoneError: { borderColor: t.colors.danger },
    zoneDisabled: { opacity: 0.7 },
    zonePressed: {
      borderColor: t.colors.primary + '66',
      backgroundColor: t.colors.primarySoft,
    },
    empty: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: t.spacing.lg,
      gap: t.spacing.sm,
    },
    emptyIconRing: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 2,
    },
    emptyTitle: { ...t.typography.bodySemibold, color: t.colors.text, fontSize: 15 },
    emptyHint: { ...t.typography.caption, color: t.colors.textTertiary, textAlign: 'center' },
    preview: { width: '100%', height: '100%' },
    previewOverlay: {
      ...StyleSheet.absoluteFill,
    },
    previewActions: {
      position: 'absolute',
      bottom: t.spacing.sm,
      right: t.spacing.sm,
      flexDirection: 'row',
      gap: t.spacing.sm,
    },
    previewBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: t.radii.full,
      backgroundColor: 'rgba(0,0,0,0.45)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
    },
    removeBtn: { paddingHorizontal: 10 },
    previewBtnText: { color: t.colors.onPrimary, fontSize: 12, fontWeight: '600' },
    errorText: { color: t.colors.danger, fontSize: 12, marginTop: t.spacing.xs },
  });
}

function createColorStyles(t: AppTheme) {
  return StyleSheet.create({
    container: { marginBottom: t.spacing.lg },
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: t.colors.textSecondary,
      marginBottom: t.spacing.sm,
    },
    row: { flexDirection: 'row', gap: 10, paddingVertical: 4 },
    swatchOuter: {
      padding: 3,
      borderRadius: 999,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    swatchDisabled: { opacity: 0.5 },
    swatch: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      ...t.shadows.sm,
    },
    errorText: { color: t.colors.danger, fontSize: 12, marginTop: t.spacing.xs },
  });
}
