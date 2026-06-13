import { View, type ViewStyle } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

export function DashedBorder({
  width,
  height,
  borderRadius = 12,
  color,
  style,
  children,
}: {
  width: number | `${number}%`;
  height: number;
  borderRadius?: number;
  color: string;
  style?: ViewStyle;
  children?: React.ReactNode;
}) {
  return (
    <View style={[{ width, height, position: 'relative' }, style]}>
      <Svg width="100%" height="100%" style={{ position: 'absolute' }}>
        <Rect
          x={1}
          y={1}
          width="99%"
          height={height - 2}
          rx={borderRadius}
          ry={borderRadius}
          stroke={color}
          strokeWidth={1}
          strokeDasharray="6 4"
          fill="none"
        />
      </Svg>
      {children}
    </View>
  );
}
