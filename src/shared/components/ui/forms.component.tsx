import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { AppIcon } from '@/features/navigation/components/AppIcon.component';
import { useTheme } from '@/shared/theme';
import { createSectionStyles, createUploadStyles, createColorStyles } from './forms.styles';

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
            <Image source={{ uri: imageUri }} style={styles.preview} contentFit="cover" transition={150} />
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
