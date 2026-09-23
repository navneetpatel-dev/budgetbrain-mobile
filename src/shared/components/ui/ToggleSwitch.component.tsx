import { Pressable } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/shared/theme';
import { styles } from './ToggleSwitch.styles';

export interface ToggleSwitchProps {
  value: boolean;
  onValueChange: (val: boolean) => void;
  disabled?: boolean;
}

export function ToggleSwitch({
  value,
  onValueChange,
  disabled = false,
}: ToggleSwitchProps) {
  const theme = useTheme();

  const knobStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withSpring(value ? 22 : 2, {
            damping: 18,
            stiffness: 220,
          }),
        },
      ],
    };
  }, [value]);

  return (
    <Pressable
      onPress={() => {
        if (disabled) return;
        void Haptics.selectionAsync();
        onValueChange(!value);
      }}
      disabled={disabled}
      style={[
        styles.track,
        {
          backgroundColor: value ? theme.colors.secondary : theme.colors.surfaceHover,
          borderColor: value ? theme.colors.secondary : theme.colors.borderSubtle,
        },
        disabled && { opacity: 0.5 },
      ]}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
    >
      <Animated.View
        style={[
          styles.knob,
          {
            backgroundColor: value ? '#003824' : theme.colors.text,
          },
          knobStyle,
        ]}
      />
    </Pressable>
  );
}
