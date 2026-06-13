import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '@/src/shared/theme';

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
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  minimumDate?: Date;
  maximumDate?: Date;
}) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [showPicker, setShowPicker] = useState(false);

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (event.type === 'dismissed' || !selectedDate) {
      return;
    }
    onChange(toIsoDate(selectedDate));
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable
        onPress={() => setShowPicker(true)}
        style={[styles.field, error && styles.fieldError]}
        accessibilityRole="button"
        accessibilityLabel={label ? `${label}, ${formatDisplayDate(value)}` : formatDisplayDate(value)}
      >
        <Text style={[styles.value, !value && styles.placeholder]}>{formatDisplayDate(value)}</Text>
      </Pressable>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {showPicker && (
        <DateTimePicker
          value={value ? parseIsoDate(value) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
      {showPicker && Platform.OS === 'ios' && (
        <Pressable onPress={() => setShowPicker(false)} style={styles.doneBtn}>
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
      )}
    </View>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { marginBottom: t.spacing.lg },
    label: { ...t.typography.caption, color: t.colors.textSecondary, marginBottom: t.spacing.sm },
    field: {
      borderWidth: 1,
      borderColor: t.colors.border,
      borderRadius: t.radii.md,
      backgroundColor: t.colors.inputBg,
      paddingHorizontal: t.spacing.lg,
      paddingVertical: 14,
    },
    fieldError: { borderColor: t.colors.danger },
    value: { fontSize: 16, color: t.colors.text },
    placeholder: { color: t.colors.textTertiary },
    errorText: { color: t.colors.danger, fontSize: 12, marginTop: t.spacing.xs },
    doneBtn: { alignSelf: 'flex-end', marginTop: t.spacing.sm, paddingVertical: t.spacing.sm },
    doneText: { ...t.typography.bodySemibold, color: t.colors.primary },
  });
}
