import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  track: {
    width: 48,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    justifyContent: 'center',
  },
  knob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
});
