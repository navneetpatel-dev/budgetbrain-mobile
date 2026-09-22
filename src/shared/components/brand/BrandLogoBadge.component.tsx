import { useMemo } from 'react';
import { View } from 'react-native';
import { BrandMark } from './BrandMark.component';
import { createStyles } from './BrandLogoBadge.styles';

export function BrandLogoBadge({
  compact = false,
  branded = true,
}: {
  compact?: boolean;
  branded?: boolean;
}) {
  const styles = useMemo(() => createStyles(compact, branded), [compact, branded]);
  const iconSize = branded ? (compact ? 20 : 26) : compact ? 22 : 28;

  return (
    <View style={styles.ring}>
      <View style={styles.badge}>
        <BrandMark size={iconSize} color="#fff" strokeWidth={2} />
      </View>
    </View>
  );
}
