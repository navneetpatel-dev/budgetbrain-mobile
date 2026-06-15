import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { BrandMark } from './BrandMark';

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

function createStyles(compact: boolean, branded: boolean) {
  const logoSize = branded ? (compact ? 40 : 52) : 44;
  const logoRadius = branded ? (compact ? 12 : 15) : 14;

  return StyleSheet.create({
    ring: {
      padding: 2,
      borderRadius: branded ? (compact ? 16 : 20) : 18,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.22)',
    },
    badge: {
      width: logoSize,
      height: logoSize,
      borderRadius: logoRadius,
      backgroundColor: 'rgba(255,255,255,0.16)',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
