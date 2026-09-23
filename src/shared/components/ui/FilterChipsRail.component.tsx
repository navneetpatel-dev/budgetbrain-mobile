import { memo, useMemo } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import Animated from 'react-native-reanimated';
import { AppIcon, type AppIconName } from '@/features/navigation/components/AppIcon.component';
import { useTheme } from '@/shared/theme';
import { useSpringPress } from '@/shared/hooks/useSpringPress.hook';
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

const Chip = memo(function Chip({
  chip,
  isSelected,
  onSelect,
  styles,
  theme,
}: {
  chip: FilterChipItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
  styles: ReturnType<typeof createStyles>;
  theme: ReturnType<typeof useTheme>;
}) {
  const spring = useSpringPress(0.97);

  return (
    <Pressable
      onPress={() => onSelect(chip.id)}
      onPressIn={spring.onPressIn}
      onPressOut={spring.onPressOut}
      style={[styles.chip, isSelected ? styles.chipSelected : styles.chipUnselected]}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
    >
      <Animated.View style={[{ flexDirection: 'row', alignItems: 'center', gap: 6 }, spring.style]}>
        {chip.dotColor ? (
          <View style={[styles.dot, { backgroundColor: chip.dotColor }]} />
        ) : chip.icon ? (
          <AppIcon
            name={chip.icon}
            size={14}
            color={isSelected ? theme.colors.onPrimary : chip.color ?? theme.colors.textSecondary}
          />
        ) : isSelected ? (
          <AppIcon name="checkmark" size={14} color={theme.colors.onPrimary} />
        ) : null}

        <Text
          style={[styles.chipLabel, isSelected ? styles.chipLabelSelected : styles.chipLabelUnselected]}
          numberOfLines={1}
        >
          {chip.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
});

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
      {chips.map((chip) => (
        <Chip
          key={chip.id}
          chip={chip}
          isSelected={chip.id === selectedId}
          onSelect={onSelect}
          styles={styles}
          theme={theme}
        />
      ))}
    </ScrollView>
  );
}
