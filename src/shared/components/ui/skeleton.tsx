import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Easing, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/shared/theme';
import { useScreenInsets } from '@/shared/hooks/useLayout';

/* ── Shimmer ── */

function useShimmer() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: 1400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);
  return anim;
}

export type ListSkeletonVariant =
  | 'transaction'
  | 'budget'
  | 'goal'
  | 'category'
  | 'notification'
  | 'account'
  | 'ticket'
  | 'generic';

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
  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-220, 320],
  });

  return (
    <View
      style={[
        {
          width: w as number,
          height: h,
          borderRadius: radius ?? theme.radii.sm,
          backgroundColor: theme.colors.surfaceHover,
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
          width: 180,
          transform: [{ translateX }],
          opacity: theme.isDark ? 0.28 : 0.55,
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: theme.colors.primarySoft,
          }}
        />
      </Animated.View>
    </View>
  );
}

export function SkeletonLine({
  width: w = '70%',
  size = 'md',
  style,
}: {
  width?: number | string;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}) {
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

function SurfaceCard({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.lg,
          borderWidth: 1,
          borderColor: theme.colors.borderSubtle,
          padding: theme.spacing.lg,
          shadowColor: '#0F172A',
          shadowOpacity: theme.isDark ? 0 : 0.04,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

function SkeletonScreen({
  children,
  safeAreaTop = true,
  gap,
}: {
  children: ReactNode;
  safeAreaTop?: boolean;
  gap?: number;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { frame } = useScreenInsets();
  const paddingTop = safeAreaTop ? insets.top + theme.spacing.lg : theme.spacing.lg;
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={[frame as ViewStyle, { paddingTop, gap: gap ?? theme.spacing.md }]}>{children}</View>
    </View>
  );
}

function SkeletonHeaderBar({ withAction = true }: { withAction?: boolean }) {
  const theme = useTheme();
  return (
    <View style={{ marginBottom: theme.spacing.sm }}>
      <SkeletonBlock width={48} height={10} radius={4} style={{ marginBottom: 10 }} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <SkeletonBlock width="42%" height={26} radius={8} style={{ marginBottom: 8 }} />
          <SkeletonBlock width="28%" height={12} radius={6} />
        </View>
        {withAction ? <SkeletonBlock width={40} height={40} radius={theme.radii.md} /> : null}
      </View>
    </View>
  );
}

/* ── Content-shaped rows ── */

function TransactionRowSkeleton() {
  const theme = useTheme();
  return (
    <SurfaceCard>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, flex: 1 }}>
          <SkeletonBlock width={40} height={40} radius={12} />
          <View style={{ flex: 1 }}>
            <SkeletonBlock width="58%" height={14} radius={6} style={{ marginBottom: 8 }} />
            <SkeletonBlock width="38%" height={11} radius={5} />
          </View>
        </View>
        <SkeletonBlock width={64} height={14} radius={6} />
      </View>
    </SurfaceCard>
  );
}

function BudgetRowSkeleton() {
  const theme = useTheme();
  return (
    <SurfaceCard>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
        <View style={{ flex: 1 }}>
          <SkeletonBlock width="45%" height={15} radius={6} style={{ marginBottom: 8 }} />
          <SkeletonBlock width="30%" height={10} radius={5} />
        </View>
        <SkeletonBlock width={88} height={18} radius={6} />
      </View>
      <SkeletonBlock width="100%" height={8} radius={999} style={{ marginBottom: 8 }} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <SkeletonBlock width={56} height={11} radius={5} />
        <SkeletonBlock width={48} height={11} radius={5} />
      </View>
    </SurfaceCard>
  );
}

function GoalRowSkeleton() {
  const theme = useTheme();
  return (
    <SurfaceCard>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
        <View style={{ flex: 1 }}>
          <SkeletonBlock width="50%" height={15} radius={6} style={{ marginBottom: 8 }} />
          <SkeletonBlock width="36%" height={10} radius={5} />
        </View>
        <SkeletonBlock width={52} height={22} radius={999} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.sm }}>
        <SkeletonBlock width={90} height={20} radius={6} />
        <SkeletonBlock width={70} height={12} radius={5} />
      </View>
      <SkeletonBlock width="100%" height={8} radius={999} style={{ marginBottom: 6 }} />
      <SkeletonBlock width={72} height={11} radius={5} />
    </SurfaceCard>
  );
}

function CategoryRowSkeleton() {
  const theme = useTheme();
  return (
    <SurfaceCard>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, flex: 1 }}>
          <SkeletonCircle size={12} />
          <SkeletonBlock width="42%" height={14} radius={6} />
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <SkeletonBlock width={28} height={28} radius={8} />
          <SkeletonBlock width={28} height={28} radius={8} />
        </View>
      </View>
    </SurfaceCard>
  );
}

function NotificationRowSkeleton() {
  const theme = useTheme();
  return (
    <SurfaceCard>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.md }}>
        <SkeletonCircle size={8} style={{ marginTop: 6 }} />
        <View style={{ flex: 1 }}>
          <SkeletonBlock width="62%" height={14} radius={6} style={{ marginBottom: 8 }} />
          <SkeletonBlock width="88%" height={11} radius={5} style={{ marginBottom: 6 }} />
          <SkeletonBlock width="28%" height={10} radius={5} />
        </View>
      </View>
    </SurfaceCard>
  );
}

function AccountRowSkeleton() {
  return (
    <SurfaceCard>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <SkeletonBlock width="48%" height={15} radius={6} />
        <SkeletonBlock width={56} height={11} radius={5} />
      </View>
      <SkeletonBlock width="32%" height={11} radius={5} style={{ marginBottom: 10 }} />
      <SkeletonBlock width={100} height={20} radius={6} />
    </SurfaceCard>
  );
}

function TicketRowSkeleton() {
  return (
    <SurfaceCard>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <SkeletonBlock width="58%" height={14} radius={6} />
        <SkeletonBlock width={52} height={12} radius={5} />
      </View>
      <SkeletonBlock width="30%" height={11} radius={5} />
    </SurfaceCard>
  );
}

function GenericRowSkeleton() {
  return <SkeletonCard height={72} />;
}

function rowForVariant(variant: ListSkeletonVariant) {
  switch (variant) {
    case 'transaction':
      return TransactionRowSkeleton;
    case 'budget':
      return BudgetRowSkeleton;
    case 'goal':
      return GoalRowSkeleton;
    case 'category':
      return CategoryRowSkeleton;
    case 'notification':
      return NotificationRowSkeleton;
    case 'account':
      return AccountRowSkeleton;
    case 'ticket':
      return TicketRowSkeleton;
    default:
      return GenericRowSkeleton;
  }
}

/* ── Screen skeletons ── */

export function ListSkeleton({
  count = 4,
  variant = 'generic',
  showHeader = true,
  safeAreaTop = true,
}: {
  count?: number;
  variant?: ListSkeletonVariant;
  showHeader?: boolean;
  safeAreaTop?: boolean;
}) {
  const Row = rowForVariant(variant);
  return (
    <SkeletonScreen safeAreaTop={safeAreaTop}>
      {showHeader ? <SkeletonHeaderBar withAction={variant !== 'notification'} /> : null}
      {Array.from({ length: count }).map((_, i) => (
        <Row key={i} />
      ))}
    </SkeletonScreen>
  );
}

export function ScreenSkeleton({ rows = 4 }: { rows?: number }) {
  return <ListSkeleton count={rows} variant="generic" showHeader />;
}

export function DashboardSkeleton() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { frame } = useScreenInsets();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View
        style={{
          paddingTop: insets.top + theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: theme.spacing.xl,
          backgroundColor: theme.colors.primarySoft,
        }}
      >
        <SkeletonBlock width={120} height={12} radius={6} style={{ marginBottom: 14 }} />
        <SkeletonBlock width="55%" height={28} radius={8} style={{ marginBottom: 10 }} />
        <SkeletonBlock width={160} height={36} radius={10} style={{ marginBottom: 8 }} />
        <SkeletonBlock width={100} height={12} radius={6} />
      </View>
      <View style={[frame as ViewStyle, { paddingTop: theme.spacing.lg, gap: theme.spacing.lg }]}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <SurfaceCard style={{ padding: theme.spacing.md }}>
              <SkeletonBlock width={28} height={28} radius={8} style={{ marginBottom: 12 }} />
              <SkeletonBlock width="50%" height={11} radius={5} style={{ marginBottom: 8 }} />
              <SkeletonBlock width="70%" height={18} radius={6} />
            </SurfaceCard>
          </View>
          <View style={{ flex: 1 }}>
            <SurfaceCard style={{ padding: theme.spacing.md }}>
              <SkeletonBlock width={28} height={28} radius={8} style={{ marginBottom: 12 }} />
              <SkeletonBlock width="50%" height={11} radius={5} style={{ marginBottom: 8 }} />
              <SkeletonBlock width="70%" height={18} radius={6} />
            </SurfaceCard>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <SurfaceCard style={{ padding: theme.spacing.md }}>
              <SkeletonBlock width={28} height={28} radius={8} style={{ marginBottom: 12 }} />
              <SkeletonBlock width="50%" height={11} radius={5} style={{ marginBottom: 8 }} />
              <SkeletonBlock width="70%" height={18} radius={6} />
            </SurfaceCard>
          </View>
          <View style={{ flex: 1 }}>
            <SurfaceCard style={{ padding: theme.spacing.md }}>
              <SkeletonBlock width={28} height={28} radius={8} style={{ marginBottom: 12 }} />
              <SkeletonBlock width="50%" height={11} radius={5} style={{ marginBottom: 8 }} />
              <SkeletonBlock width="70%" height={18} radius={6} />
            </SurfaceCard>
          </View>
        </View>
        <View>
          <SkeletonBlock width={160} height={14} radius={6} style={{ marginBottom: 12 }} />
          <SurfaceCard>
            {Array.from({ length: 4 }).map((_, i) => (
              <View key={i} style={{ marginBottom: i < 3 ? theme.spacing.md : 0 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <SkeletonBlock width="40%" height={12} radius={5} />
                  <SkeletonBlock width={48} height={12} radius={5} />
                </View>
                <SkeletonBlock width="100%" height={6} radius={999} />
              </View>
            ))}
          </SurfaceCard>
        </View>
        <View>
          <SkeletonBlock width={140} height={14} radius={6} style={{ marginBottom: 12 }} />
          <SurfaceCard>
            {Array.from({ length: 3 }).map((_, i) => (
              <View
                key={i}
                style={{
                  paddingVertical: theme.spacing.md,
                  borderBottomWidth: i < 2 ? 1 : 0,
                  borderBottomColor: theme.colors.borderSubtle,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <SkeletonBlock width="45%" height={14} radius={6} />
                  <SkeletonBlock width={36} height={12} radius={5} />
                </View>
                <SkeletonBlock width="100%" height={8} radius={999} style={{ marginBottom: 6 }} />
                <SkeletonBlock width="55%" height={11} radius={5} />
              </View>
            ))}
          </SurfaceCard>
        </View>
        {Array.from({ length: 3 }).map((_, i) => (
          <TransactionRowSkeleton key={i} />
        ))}
      </View>
    </View>
  );
}

export function DetailSkeleton() {
  const theme = useTheme();
  return (
    <SkeletonScreen>
      <View style={{ alignItems: 'center', paddingVertical: theme.spacing.xl, gap: 10 }}>
        <SkeletonBlock width={72} height={12} radius={5} />
        <SkeletonBlock width={140} height={40} radius={10} />
        <SkeletonBlock width={100} height={12} radius={5} />
      </View>
      <SurfaceCard style={{ padding: 0, overflow: 'hidden' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: theme.spacing.lg,
              paddingVertical: theme.spacing.md,
              borderBottomWidth: i < 3 ? 1 : 0,
              borderBottomColor: theme.colors.borderSubtle,
            }}
          >
            <SkeletonBlock width="30%" height={12} radius={5} />
            <SkeletonBlock width="40%" height={14} radius={6} />
          </View>
        ))}
      </SurfaceCard>
      <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
        <SkeletonBlock width="100%" height={50} radius={theme.radii.md} />
        <SkeletonBlock width="100%" height={50} radius={theme.radii.md} />
      </View>
    </SkeletonScreen>
  );
}

export function SettingsSkeleton() {
  const theme = useTheme();
  return (
    <SkeletonScreen gap={theme.spacing.lg}>
      <SurfaceCard style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, padding: theme.spacing.xl }}>
        <SkeletonCircle size={64} />
        <View style={{ flex: 1 }}>
          <SkeletonBlock width="48%" height={18} radius={6} style={{ marginBottom: 8 }} />
          <SkeletonBlock width="62%" height={12} radius={5} style={{ marginBottom: 6 }} />
          <SkeletonBlock width="30%" height={11} radius={5} />
        </View>
      </SurfaceCard>
      <SurfaceCard>
        <SkeletonBlock width={80} height={12} radius={5} style={{ marginBottom: 14 }} />
        {Array.from({ length: 4 }).map((_, i) => (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingVertical: 12,
              borderBottomWidth: i < 3 ? 1 : 0,
              borderBottomColor: theme.colors.borderSubtle,
            }}
          >
            <SkeletonBlock width={36} height={36} radius={10} />
            <SkeletonBlock width="50%" height={13} radius={6} />
          </View>
        ))}
      </SurfaceCard>
      <SurfaceCard>
        <SkeletonBlock width={100} height={12} radius={5} style={{ marginBottom: 14 }} />
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBlock key={i} width={72} height={32} radius={999} />
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCircle key={i} size={36} />
          ))}
        </View>
      </SurfaceCard>
      <SurfaceCard>
        <SkeletonBlock width={90} height={12} radius={5} style={{ marginBottom: 14 }} />
        {Array.from({ length: 3 }).map((_, i) => (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingVertical: 12,
              borderBottomWidth: i < 2 ? 1 : 0,
              borderBottomColor: theme.colors.borderSubtle,
            }}
          >
            <SkeletonBlock width={36} height={36} radius={10} />
            <SkeletonBlock width="45%" height={13} radius={6} />
          </View>
        ))}
      </SurfaceCard>
    </SkeletonScreen>
  );
}

export function NetWorthSkeleton() {
  const theme = useTheme();
  return (
    <SkeletonScreen gap={theme.spacing.lg}>
      <SkeletonHeaderBar withAction={false} />
      <View
        style={{
          borderRadius: theme.radii.xl,
          padding: theme.spacing.xl,
          backgroundColor: theme.colors.primarySoft,
          alignItems: 'center',
          gap: 10,
        }}
      >
        <SkeletonBlock width={80} height={11} radius={5} />
        <SkeletonBlock width={160} height={36} radius={10} />
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <SurfaceCard style={{ padding: theme.spacing.md }}>
            <SkeletonBlock width={28} height={28} radius={8} style={{ marginBottom: 12 }} />
            <SkeletonBlock width="55%" height={11} radius={5} style={{ marginBottom: 8 }} />
            <SkeletonBlock width="70%" height={16} radius={6} />
          </SurfaceCard>
        </View>
        <View style={{ flex: 1 }}>
          <SurfaceCard style={{ padding: theme.spacing.md }}>
            <SkeletonBlock width={28} height={28} radius={8} style={{ marginBottom: 12 }} />
            <SkeletonBlock width="55%" height={11} radius={5} style={{ marginBottom: 8 }} />
            <SkeletonBlock width="70%" height={16} radius={6} />
          </SurfaceCard>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <SurfaceCard style={{ padding: theme.spacing.md }}>
            <SkeletonBlock width={28} height={28} radius={8} style={{ marginBottom: 12 }} />
            <SkeletonBlock width="55%" height={11} radius={5} style={{ marginBottom: 8 }} />
            <SkeletonBlock width="70%" height={16} radius={6} />
          </SurfaceCard>
        </View>
        <View style={{ flex: 1 }}>
          <SurfaceCard style={{ padding: theme.spacing.md }}>
            <SkeletonBlock width={28} height={28} radius={8} style={{ marginBottom: 12 }} />
            <SkeletonBlock width="55%" height={11} radius={5} style={{ marginBottom: 8 }} />
            <SkeletonBlock width="70%" height={16} radius={6} />
          </SurfaceCard>
        </View>
      </View>
      {Array.from({ length: 3 }).map((_, i) => (
        <AccountRowSkeleton key={i} />
      ))}
    </SkeletonScreen>
  );
}

export function FamilySkeleton() {
  const theme = useTheme();
  return (
    <SkeletonScreen gap={theme.spacing.md}>
      <SkeletonHeaderBar withAction={false} />
      {Array.from({ length: 2 }).map((_, i) => (
        <SurfaceCard key={i}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
            <SkeletonCircle size={44} />
            <View style={{ flex: 1 }}>
              <SkeletonBlock width="50%" height={15} radius={6} style={{ marginBottom: 8 }} />
              <SkeletonBlock width="70%" height={12} radius={5} />
            </View>
          </View>
        </SurfaceCard>
      ))}
      <View style={{ gap: theme.spacing.md, marginTop: theme.spacing.sm }}>
        <SurfaceCard>
          <SkeletonBlock width={110} height={12} radius={5} style={{ marginBottom: 14 }} />
          <SkeletonBlock width="100%" height={48} radius={theme.radii.md} style={{ marginBottom: 12 }} />
          <SkeletonBlock width="100%" height={48} radius={theme.radii.md} />
        </SurfaceCard>
        <SurfaceCard>
          <SkeletonBlock width={90} height={12} radius={5} style={{ marginBottom: 14 }} />
          <SkeletonBlock width="100%" height={48} radius={theme.radii.md} style={{ marginBottom: 12 }} />
          <SkeletonBlock width="100%" height={48} radius={theme.radii.md} />
        </SurfaceCard>
      </View>
    </SkeletonScreen>
  );
}

export function SupportSkeleton() {
  const theme = useTheme();
  return (
    <SkeletonScreen gap={theme.spacing.md}>
      <SkeletonHeaderBar />
      <SurfaceCard>
        <SkeletonBlock width={90} height={12} radius={5} style={{ marginBottom: 14 }} />
        <SkeletonBlock width="100%" height={48} radius={theme.radii.md} style={{ marginBottom: 12 }} />
        <SkeletonBlock width="100%" height={96} radius={theme.radii.md} style={{ marginBottom: 14 }} />
        <SkeletonBlock width="100%" height={48} radius={theme.radii.md} />
      </SurfaceCard>
      {Array.from({ length: 3 }).map((_, i) => (
        <TicketRowSkeleton key={i} />
      ))}
    </SkeletonScreen>
  );
}

export function SubscriptionSkeleton() {
  const theme = useTheme();
  return (
    <SkeletonScreen gap={theme.spacing.md} safeAreaTop={false}>
      {Array.from({ length: 3 }).map((_, i) => (
        <SurfaceCard key={i}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
            <SkeletonBlock width="40%" height={18} radius={6} />
            <SkeletonBlock width={72} height={18} radius={6} />
          </View>
          <SkeletonBlock width="100%" height={14} radius={5} style={{ marginBottom: 8 }} />
          <SkeletonBlock width="70%" height={12} radius={5} style={{ marginBottom: 16 }} />
          <SkeletonBlock width="100%" height={48} radius={theme.radii.md} />
        </SurfaceCard>
      ))}
    </SkeletonScreen>
  );
}

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

export function ColdStartSkeleton() {
  const theme = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
      }}
    >
      <SkeletonCircle size={80} style={{ marginBottom: 24 }} />
      <SkeletonBlock width={180} height={28} radius={8} style={{ marginBottom: 8 }} />
      <SkeletonBlock width={240} height={16} radius={6} style={{ marginBottom: 32 }} />
      <SkeletonBlock width="100%" height={50} radius={12} style={{ marginBottom: 12 }} />
      <SkeletonBlock width="100%" height={50} radius={12} style={{ marginBottom: 24 }} />
      <SkeletonBlock width="100%" height={52} radius={14} />
    </View>
  );
}
