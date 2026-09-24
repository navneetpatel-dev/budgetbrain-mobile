import React, { useMemo } from 'react';
import { Pressable, Text } from 'react-native';
import { useTheme } from '@/shared/theme';
import { createStyles } from './NeedsReviewChip.styles';

export interface NeedsReviewChipProps {
  count: number;
  onPress: () => void;
}

/** "3 to review": detected transactions waiting for the user (plan T5.6). Hidden when there are none. */
export function NeedsReviewChip({ count, onPress }: NeedsReviewChipProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  if (count <= 0) return null;
  return (
    <Pressable
      style={styles.chip}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${count} detected transactions need review`}
    >
      <Text style={styles.text}>{`${count} detected to review`}</Text>
    </Pressable>
  );
}
