import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  centerNode: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    fontSize: 11,
    fontWeight: '700',
  },
  semiCenterNode: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  semiIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  semiPercentText: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 0.2,
  },
});
