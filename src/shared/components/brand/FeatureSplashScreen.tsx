import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BrandMark } from './BrandMark';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';
import type { AppIconName } from '@/features/navigation/components/AppIcon';

const FEATURES: { icon: AppIconName; label: string }[] = [
  { icon: 'expense', label: 'Track expenses' },
  { icon: 'budgets', label: 'Manage budgets' },
  { icon: 'goals', label: 'Reach goals' },
  { icon: 'ai', label: 'AI insights' },
];

export function FeatureSplashScreen() {
  const theme = useTheme();
  const [activeFeature, setActiveFeature] = useState(0);
  const spin = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    const spinLoop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 800, easing: Easing.linear, useNativeDriver: true }),
    );
    spinLoop.start();
    const featureTimer = setInterval(() => {
      setActiveFeature((i) => (i + 1) % FEATURES.length);
    }, 2200);
    return () => {
      spinLoop.stop();
      clearInterval(featureTimer);
    };
  }, [fadeIn, spin]);

  const spinRotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <LinearGradient
      colors={[theme.colors.background, theme.colors.primarySoft, theme.colors.background]}
      locations={[0, 0.55, 1]}
      style={styles.root}
    >
      <Animated.View style={[styles.content, { opacity: fadeIn }]}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoWrap}
        >
          <BrandMark size={44} color="#fff" strokeWidth={2.2} />
        </LinearGradient>

        <Text style={[styles.title, { color: theme.colors.text }]}>BudgetBrain</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Smart budgeting for your financial goals
        </Text>

        <View style={styles.featureRow}>
          {FEATURES.map((f, i) => (
            <View
              key={f.label}
              style={[
                styles.featurePill,
                {
                  backgroundColor: i === activeFeature ? theme.colors.primarySoft : theme.colors.surface,
                  borderColor: i === activeFeature ? theme.colors.primary + '44' : theme.colors.borderSubtle,
                  opacity: i === activeFeature ? 1 : 0.55,
                },
              ]}
            >
              <AppIcon name={f.icon} size={14} color={i === activeFeature ? theme.colors.primary : theme.colors.textSecondary} />
              <Text style={[styles.featureLabel, { color: i === activeFeature ? theme.colors.primary : theme.colors.textSecondary }]}>
                {f.label}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.loaderRow}>
          <Animated.View
            style={[
              styles.spinner,
              { borderColor: theme.colors.borderSubtle, borderTopColor: theme.colors.primary, transform: [{ rotate: spinRotate }] },
            ]}
          />
          <Text style={[styles.loadingText, { color: theme.colors.textTertiary }]}>Loading your finances…</Text>
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  logoWrap: {
    width: 88, height: 88, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5, marginBottom: 8 },
  subtitle: { fontSize: 15, textAlign: 'center', maxWidth: 280, lineHeight: 22, marginBottom: 32 },
  featureRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 40, minHeight: 36 },
  featurePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1,
  },
  featureLabel: { fontSize: 12, fontWeight: '600' },
  loaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  spinner: { width: 22, height: 22, borderRadius: 11, borderWidth: 2.5 },
  loadingText: { fontSize: 13, fontWeight: '500' },
});
