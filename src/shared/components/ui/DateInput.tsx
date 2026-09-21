import { useMemo, useState } from 'react';
import { Modal, Platform, Pressable, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';
import { parseIsoDate, toIsoDate } from '@/shared/utils/dateBounds';
import { useSheetEnterAnimation } from '@/shared/hooks/useSheetEnterAnimation';
import { useBottomSafeInset, useScreenInsets } from '@/shared/hooks/useLayout';
import { createStyles } from './DateInput.styles';

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
  const bottomSafe = useBottomSafeInset();
  const { paddingHorizontal } = useScreenInsets();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [showPicker, setShowPicker] = useState(false);
  const [focused, setFocused] = useState(false);
  const sheetAnim = useSheetEnterAnimation(showPicker, 'sheet');

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
        <Modal visible={showPicker} transparent animationType="fade" onRequestClose={closePicker}>
          <Pressable style={styles.sheetBackdrop} onPress={closePicker} accessibilityRole="button" accessibilityLabel="Dismiss">
            <Animated.View style={sheetAnim}>
              <Pressable
                style={[
                  styles.sheet,
                  {
                    marginHorizontal: paddingHorizontal,
                    marginBottom: bottomSafe,
                    paddingBottom: theme.spacing.md,
                  },
                ]}
                onPress={(e) => e.stopPropagation()}
              >
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
              </Pressable>
            </Animated.View>
          </Pressable>
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
