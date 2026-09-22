import { useMemo } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { AppIcon, type AppIconName } from '@/features/navigation/components/AppIcon.component';
import { useTheme } from '@/shared/theme';
import { createStyles } from './FilterChipsRail.styles';

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
