import { StyleSheet, View, Text, Pressable, ActivityIndicator, TextInputProps } from 'react-native';
import { COLORS } from '@/src/constants/config';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  loading?: boolean;
  disabled?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
}: ButtonProps) {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        isPrimary && styles.primary,
        variant === 'secondary' && styles.secondary,
        isOutline && styles.outline,
        variant === 'danger' && styles.danger,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? COLORS.primary : '#fff'} />
      ) : (
        <Text
          style={[
            styles.text,
            isPrimary && styles.primaryText,
            isOutline && styles.outlineText,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
  return (
    <View style={styles.inputContainer}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        <TextInputLike style={style} {...props} />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

function TextInputLike({ style, ...props }: TextInputProps) {
  const { TextInput } = require('react-native');
  return (
    <TextInput
      placeholderTextColor={COLORS.textSecondary}
      style={[styles.input, style]}
      {...props}
    />
  );
}

interface CardProps {
  children: React.ReactNode;
  style?: object;
}

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

interface SummaryCardProps {
  title: string;
  amount: string;
  color?: string;
  subtitle?: string;
}

export function SummaryCard({ title, amount, color, subtitle }: SummaryCardProps) {
  return (
    <Card style={styles.summaryCard}>
      <Text style={styles.summaryTitle}>{title}</Text>
      <Text style={[styles.summaryAmount, color ? { color } : undefined]}>{amount}</Text>
      {subtitle && <Text style={styles.summarySubtitle}>{subtitle}</Text>}
    </Card>
  );
}

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: COLORS.primary },
  secondary: { backgroundColor: COLORS.textSecondary },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  danger: { backgroundColor: COLORS.danger },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
  text: { fontSize: 16, fontWeight: '600' },
  primaryText: { color: '#fff' },
  outlineText: { color: COLORS.primary },
  inputContainer: { marginBottom: 16 },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 6,
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.card,
  },
  inputError: { borderColor: COLORS.danger },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text,
  },
  errorText: { color: COLORS.danger, fontSize: 12, marginTop: 4 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryCard: { flex: 1, minWidth: '45%' },
  summaryTitle: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 },
  summaryAmount: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  summarySubtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  emptySubtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4, textAlign: 'center' },
});
