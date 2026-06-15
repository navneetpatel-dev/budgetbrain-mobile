import { useMemo, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';

function toIsoDate(date: Date) {
  return date.toISOString().split('T')[0];
}

function parseIsoDate(value: string) {
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function formatDisplayDate(value: string) {
  if (!value) return 'Select date';
  return parseIsoDate(value).toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function DateInput({
  label,
  value,
  onChange,
  error,
  minimumDate,
  maximumDate,
  disabled,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  disabled?: boolean;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [showPicker, setShowPicker] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (event.type === 'dismissed' || !selectedDate) {
      return;
    }
    onChange(toIsoDate(selectedDate));
  };

  const openPicker = () => {
    if (disabled) return;
    setFocused(true);
    setShowPicker(true);
  };

  const closePicker = () => {
    setShowPicker(false);
    setFocused(false);
  };

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable
        onPress={openPicker}
        disabled={disabled}
        style={[
          styles.field,
          focused && !disabled && styles.fieldFocused,
          error && styles.fieldError,
          disabled && styles.fieldDisabled,
        ]}
        accessibilityRole="button"
        accessibilityLabel={label ? `${label}, ${formatDisplayDate(value)}` : formatDisplayDate(value)}
      >
        <View style={styles.iconWrap}>
          <AppIcon name="calendar" size={18} color={theme.colors.primary} />
        </View>
        <Text style={[styles.value, !value && styles.placeholder]} numberOfLines={1}>
          {formatDisplayDate(value)}
        </Text>
        <AppIcon name="chevronRight" size={14} color={theme.colors.textTertiary} />
      </Pressable>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {Platform.OS === 'ios' ? (
        <Modal visible={showPicker} transparent animationType="slide" onRequestClose={closePicker}>
          <Pressable style={styles.sheetBackdrop} onPress={closePicker} />
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label ?? 'Select date'}</Text>
              <Pressable onPress={closePicker} hitSlop={8}>
                <Text style={styles.sheetDone}>Done</Text>
              </Pressable>
            </View>
            <DateTimePicker
              value={value ? parseIsoDate(value) : new Date()}
              mode="date"
              display="spinner"
              onChange={handleChange}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              themeVariant={theme.isDark ? 'dark' : 'light'}
            />
          </View>
        </Modal>
      ) : (
        showPicker && (
          <DateTimePicker
            value={value ? parseIsoDate(value) : new Date()}
            mode="date"
            display="default"
            onChange={handleChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
          />
        )
      )}
    </View>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { marginBottom: t.spacing.lg },
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: t.colors.textSecondary,
      marginBottom: t.spacing.sm,
    },
    field: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: t.isDark ? 'rgba(255,255,255,0.1)' : t.colors.borderSubtle,
      borderRadius: t.radii.lg,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.04)' : t.colors.inputBg,
      paddingHorizontal: t.spacing.sm,
      paddingVertical: 12,
      gap: t.spacing.sm,
    },
    fieldFocused: {
      borderColor: t.colors.primary + '88',
      backgroundColor: t.colors.primarySoft,
    },
    fieldError: { borderColor: t.colors.danger },
    fieldDisabled: { opacity: 0.55 },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.colors.primarySoft,
    },
    value: { flex: 1, fontSize: 16, fontWeight: '500', color: t.colors.text },
    placeholder: { color: t.colors.textTertiary, fontWeight: '400' },
    errorText: { color: t.colors.danger, fontSize: 12, marginTop: t.spacing.xs },
    sheetBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    sheet: {
      backgroundColor: t.colors.surface,
      borderTopLeftRadius: t.radii.xl,
      borderTopRightRadius: t.radii.xl,
      paddingTop: t.spacing.sm,
    },
    sheetHandle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.2)' : t.colors.border,
      alignSelf: 'center',
      marginBottom: t.spacing.sm,
    },
    sheetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: t.spacing.lg,
      paddingBottom: t.spacing.sm,
    },
    sheetTitle: { ...t.typography.bodySemibold, color: t.colors.text },
    sheetDone: { ...t.typography.bodySemibold, color: t.colors.primary, fontSize: 16 },
  });
}
