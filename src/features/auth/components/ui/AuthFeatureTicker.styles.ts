import { StyleSheet } from 'react-native';

export function createStyles(compact: boolean) {
  return StyleSheet.create({
    wrap: {
      width: '100%',
      marginTop: compact ? 12 : 16,
      overflow: 'hidden',
    },
    track: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: compact ? 14 : 22,
    },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: compact ? 10 : 12,
      paddingVertical: compact ? 4 : 5,
      borderRadius: 999,
      backgroundColor: 'rgba(255,255,255,0.11)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.15)',
    },
    pillText: {
      fontSize: compact ? 11 : 12,
      fontWeight: '600',
      color: 'rgba(255,255,255,0.9)',
    },
  });
}
