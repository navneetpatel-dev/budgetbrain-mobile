import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, type ViewStyle } from 'react-native';
import { useTheme } from '@/shared/theme';
import { useScreenInsets } from '@/shared/hooks/useLayout';
import type { AppTheme } from '@/shared/theme';

/* ── Shimmer Animation ── */

function useShimmer() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);
  return anim;
}

/* ── Primitives ── */

export function SkeletonBlock({
  width: w = '100%',
  height: h = 16,
  radius,
  style,
}: {
  width?: number | string;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}) {
  const theme = useTheme();
  const shimmer = useShimmer();
  const bg = theme.colors.surfaceHover;

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 300],
  });

  return (
    <View
      style={[
        {
          width: w as number,
          height: h,
          borderRadius: radius ?? theme.radii.sm,
          backgroundColor: bg,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: 200,
          transform: [{ translateX }],
        }}
      >
        <View
          style={{
            flex: 1,
            width: 200,
            backgroundColor: theme.colors.primarySoft,
            opacity: theme.isDark ? 0.25 : 0.5,
          }}
        />
      </Animated.View>
    </View>
  );
}

export function SkeletonLine({ width: w = '70%', size = 'md', style }: { width?: number | string; size?: 'sm' | 'md' | 'lg'; style?: ViewStyle }) {
  const heights = { sm: 10, md: 14, lg: 20 };
  return <SkeletonBlock width={w} height={heights[size]} style={style} />;
}

export function SkeletonCircle({ size = 40, style }: { size?: number; style?: ViewStyle }) {
  return <SkeletonBlock width={size} height={size} radius={size / 2} style={style} />;
}

export function SkeletonCard({ height = 72, style }: { height?: number; style?: ViewStyle }) {
  const theme = useTheme();
  return <SkeletonBlock width="100%" height={height} radius={theme.radii.lg} style={style} />;
}

/* ── Screen Skeletons ── */

function SkeletonScreen({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const { frame } = useScreenInsets();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={[frame as ViewStyle, { paddingTop: theme.spacing.lg }]}>
        {children}
      </View>
    </View>
  );
}

/** Dashboard skeleton — hero + summary grid + chart + widgets */
export function DashboardSkeleton() {
  const theme = useTheme();
  const { frame } = useScreenInsets();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Hero */}
      <SkeletonBlock width="100%" height={140} radius={0} style={{ borderRadius: 0 }} />
      <View style={[frame as ViewStyle, { paddingTop: theme.spacing.lg, gap: theme.spacing.lg }]}>
        {/* Summary cards grid */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}><SkeletonCard height={90} /></View>
          <View style={{ flex: 1 }}><SkeletonCard height={90} /></View>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}><SkeletonCard height={90} /></View>
          <View style={{ flex: 1 }}><SkeletonCard height={90} /></View>
        </View>
        {/* Category chart */}
        <SkeletonBlock width="100%" height={160} radius={theme.radii.lg} />
        {/* Budget widgets */}
        <SkeletonBlock width="100%" height={120} radius={theme.radii.lg} />
        {/* Recent transactions */}
        <SkeletonBlock width="100%" height={200} radius={theme.radii.lg} />
      </View>
    </View>
  );
}

/** Generic list skeleton */
export function ListSkeleton({ count = 4 }: { count?: number }) {
  const theme = useTheme();
  return (
    <SkeletonScreen>
      <View style={{ gap: theme.spacing.md }}>
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} height={68} />
        ))}
      </View>
    </SkeletonScreen>
  );
}

/** Detail/Form skeleton */
export function DetailSkeleton() {
  const theme = useTheme();
  return (
    <SkeletonScreen>
      {/* Amount */}
      <View style={{ alignItems: 'center', paddingVertical: theme.spacing.xl }}>
        <SkeletonBlock width={120} height={40} radius={8} />
      </View>
      {/* Detail rows */}
      <SkeletonBlock width="100%" height={180} radius={theme.radii.lg} />
      {/* Action buttons */}
      <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.lg }}>
        <SkeletonBlock width="100%" height={50} radius={theme.radii.md} />
        <SkeletonBlock width="100%" height={50} radius={theme.radii.md} />
        <SkeletonBlock width="100%" height={50} radius={theme.radii.md} />
      </View>
    </SkeletonScreen>
  );
}

/** Settings skeleton */
export function SettingsSkeleton() {
  const theme = useTheme();
  return (
    <SkeletonScreen>
      {/* Profile hero */}
      <SkeletonBlock width="100%" height={140} radius={theme.radii.lg} />
      {/* Theme picker */}
      <SkeletonBlock width="100%" height={120} radius={theme.radii.lg} />
      {/* Link groups */}
      <SkeletonBlock width="100%" height={300} radius={theme.radii.lg} />
      <SkeletonBlock width="100%" height={140} radius={theme.radii.lg} />
    </SkeletonScreen>
  );
}

/** Onboarding skeleton */
export function OnboardingSkeleton() {
  const theme = useTheme();
  return (
    <SkeletonScreen>
      <SkeletonLine width="40%" size="lg" />
      <View style={{ gap: theme.spacing.md, marginTop: theme.spacing.lg }}>
        <SkeletonBlock width="100%" height={48} radius={theme.radii.md} />
        <SkeletonBlock width="100%" height={48} radius={theme.radii.md} />
        <SkeletonBlock width="100%" height={48} radius={theme.radii.md} />
        <SkeletonBlock width="100%" height={48} radius={theme.radii.md} />
        <SkeletonBlock width="100%" height={100} radius={theme.radii.lg} />
      </View>
    </SkeletonScreen>
  );
}

/** Cold-start splash skeleton — mirrors the landing/auth screen */
export function ColdStartSkeleton() {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
      {/* App icon placeholder */}
      <SkeletonCircle size={80} style={{ marginBottom: 24 }} />
      {/* Title */}
      <SkeletonBlock width={180} height={28} radius={8} style={{ marginBottom: 8 }} />
      {/* Subtitle */}
      <SkeletonBlock width={240} height={16} radius={6} style={{ marginBottom: 32 }} />
      {/* Form placeholders */}
      <SkeletonBlock width="100%" height={50} radius={12} style={{ marginBottom: 12 }} />
      <SkeletonBlock width="100%" height={50} radius={12} style={{ marginBottom: 24 }} />
      <SkeletonBlock width="100%" height={52} radius={14} />
    </View>
  );
}
