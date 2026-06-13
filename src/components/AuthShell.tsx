import { useMemo } from 'react';
import { StyleSheet, View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/src/theme';

export function AuthShell({
  children,
  title = 'BudgetBrain',
  subtitle = 'Track smarter. Save better.',
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme, insets.top), [theme, insets.top]);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient
        colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <Text style={styles.logo}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </LinearGradient>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(t: ReturnType<typeof useTheme>, topInset: number) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.background },
    hero: {
      paddingTop: topInset + 48,
      paddingBottom: 56,
      paddingHorizontal: t.spacing.xl,
      alignItems: 'center',
      borderBottomLeftRadius: t.radii.xl,
      borderBottomRightRadius: t.radii.xl,
    },
    logo: { fontSize: 32, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
    subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.85)', marginTop: 8, fontWeight: '500' },
    scroll: {
      flexGrow: 1,
      paddingHorizontal: t.spacing.lg,
      paddingTop: t.spacing.lg,
      paddingBottom: t.spacing.xxl,
    },
    card: {
      backgroundColor: t.colors.surface,
      borderRadius: t.radii.xl,
      padding: t.spacing.xl,
      marginTop: t.spacing.sm,
      ...t.shadows.md,
      borderWidth: 1,
      borderColor: t.colors.borderSubtle,
    },
  });
}
