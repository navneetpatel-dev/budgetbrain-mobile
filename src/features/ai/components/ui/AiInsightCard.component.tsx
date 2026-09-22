import { useMemo } from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppIcon } from '@/features/navigation/components/AppIcon.component';
import { useTheme } from '@/shared/theme';
import { createStyles } from './AiInsightCard.styles';

export function AiInsightCard({ text }: { text: string }) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={[theme.colors.primary + '55', theme.colors.gradientEnd + '22']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.accent}
      />
      <View style={styles.iconWrap}>
        <AppIcon name="ai" size={16} color={theme.colors.primary} />
      </View>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}
