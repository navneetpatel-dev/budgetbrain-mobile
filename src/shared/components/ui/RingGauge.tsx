import { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { AppIcon, type AppIconName } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';
import { styles } from './RingGauge.styles';

export interface RingGaugeProps {
  size?: number;
  strokeWidth?: number;
  progress: number; // 0 to 100
  variant?: 'circle' | 'semi';
  icon?: AppIconName;
  centerText?: string;
  gradientColors?: [string, string];
}

export function RingGauge({
  size = 56,
  strokeWidth = 5,
  progress = 0,
  variant = 'circle',
  icon = 'budgets',
  centerText,
  gradientColors,
}: RingGaugeProps) {
  const theme = useTheme();
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const startColor = gradientColors?.[0] ?? theme.colors.secondary;
  const endColor = gradientColors?.[1] ?? theme.colors.primary;

  const gradId = useMemo(() => `ring_grad_${Math.floor(Math.random() * 100000)}`, []);

  // Geometry:
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * clampedProgress) / 100;
  const center = size / 2;

  if (variant === 'semi') {
    const semiRadius = 48;
    const semiCircumference = 2 * Math.PI * semiRadius;
    // Semi-gauge consumes about 75% max sweep or full circle dash offset
    const semiOffset = semiCircumference * (1 - clampedProgress / 100);

    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} viewBox="0 0 120 120" style={{ transform: [{ rotate: '-90deg' }] }}>
          <Defs>
            <LinearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={startColor} />
              <Stop offset="55%" stopColor={theme.colors.primary} />
              <Stop offset="100%" stopColor={endColor} />
            </LinearGradient>
          </Defs>
          {/* Dashed outer track */}
          <Circle
            cx="60"
            cy="60"
            r={semiRadius}
            fill="none"
            stroke={theme.colors.surfaceContainerHigh}
            strokeWidth={8}
            strokeDasharray="3 4"
            strokeLinecap="round"
          />
          {/* Background track */}
          <Circle
            cx="60"
            cy="60"
            r={semiRadius}
            fill="none"
            stroke={theme.colors.surfaceContainerHighest}
            strokeWidth={8}
            opacity={0.6}
          />
          {/* Active progress arc */}
          <Circle
            cx="60"
            cy="60"
            r={semiRadius}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={8.5}
            strokeDasharray={semiCircumference}
            strokeDashoffset={semiOffset}
            strokeLinecap="round"
          />
        </Svg>
        {/* Tactical center glyph node */}
        <View style={styles.semiCenterNode} pointerEvents="none">
          <View style={[styles.semiIconBadge, { backgroundColor: theme.colors.primaryContainer }]}>
            <AppIcon name={icon} size={22} color="#FFFFFF" />
          </View>
          {centerText ? (
            <Text style={[styles.semiPercentText, { color: theme.colors.secondaryFixed }]}>
              {centerText}
            </Text>
          ) : (
            <Text style={[styles.semiPercentText, { color: theme.colors.secondaryFixed }]}>
              {clampedProgress.toFixed(1)}%
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Defs>
          <LinearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={startColor} />
            <Stop offset="100%" stopColor={endColor} />
          </LinearGradient>
        </Defs>
        {/* Track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={theme.colors.surfaceHover}
          strokeWidth={strokeWidth}
        />
        {/* Progress Arc */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.centerNode}>
          {icon ? (
            <AppIcon name={icon} size={Math.max(16, size * 0.36)} color={theme.colors.primary} />
          ) : centerText ? (
            <Text style={[styles.centerText, { color: theme.colors.text }]}>{centerText}</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}
