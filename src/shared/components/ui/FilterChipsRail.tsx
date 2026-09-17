import { useMemo } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { AppIcon, type AppIconName } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';

export interface FilterChipItem {
  id: string;
  label: string;
  icon?: AppIconName;
  color?: string;
  dotColor?: string;
}

export interface FilterChipsRailProps {
  chips: FilterChipItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  style?: object;
}

export function FilterChipsRail({
  chips,
  selectedId,
  onSelect,
  style,
}: FilterChipsRailProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.scrollContent, style]}
    >
      {chips.map((chip) => {
        const isSelected = chip.id === selectedId;

        return (
          <Pressable
            key={chip.id}
            onPress={() => onSelect(chip.id)}
            style={({ pressed }) => [
              styles.chip,
              isSelected ? styles.chipSelected : styles.chipUnselected,
              pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
          >
            {chip.dotColor ? (
              <View style={[styles.dot, { backgroundColor: chip.dotColor }]} />
            ) : chip.icon ? (
              <AppIcon
                name={chip.icon}
                size={14}
                color={
                  isSelected
                    ? theme.colors.onPrimary
                    : chip.color ?? theme.colors.textSecondary
                }
              />
            ) : isSelected ? (
              <AppIcon name="checkmark" size={14} color={theme.colors.onPrimary} />
            ) : null}

            <Text
              style={[
                styles.chipLabel,
                isSelected ? styles.chipLabelSelected : styles.chipLabelUnselected,
              ]}
              numberOfLines={1}
            >
              {chip.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    scrollContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: t.spacing.lg,
      paddingVertical: 4,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: t.radii.full,
      minHeight: 34,
    },
    chipSelected: {
      backgroundColor: t.colors.primary,
      ...t.shadows.sm,
    },
    chipUnselected: {
      backgroundColor: t.colors.surfaceContainerLow,
      borderWidth: 1,
      borderColor: t.colors.borderSubtle,
    },
    chipLabel: {
      fontSize: 13,
      fontWeight: '600',
    },
    chipLabelSelected: {
      color: t.colors.onPrimary,
    },
    chipLabelUnselected: {
      color: t.colors.textSecondary,
    },
    dot: {
      width: 7,
      height: 7,
      borderRadius: 4,
    },
  });
}
