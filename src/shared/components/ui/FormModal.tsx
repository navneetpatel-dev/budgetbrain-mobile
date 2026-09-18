import { useMemo } from 'react';
import { Modal, ScrollView, View, Text, Pressable, KeyboardAvoidingView, Platform,  } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';
import { useScreenInsets } from '@/shared/hooks/useLayout';
import { createStyles } from './FormModal.styles';

export function FormModal({
  visible,
  title,
  subtitle,
  onClose,
  children,
  footer,
}: {
  visible: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { frame } = useScreenInsets();
  const styles = useMemo(() => createStyles(theme, insets), [theme, insets]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.handleWrap}>
          <View style={styles.handle} />
        </View>

        <View style={[styles.header, frame]}>
          <View style={styles.headerText}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
            accessibilityLabel="Close form"
          >
            <AppIcon name="close" size={16} color={theme.colors.textSecondary} />
          </Pressable>
        </View>

        <LinearGradient
          colors={[theme.colors.primary + '12', 'transparent']}
          style={styles.headerGlow}
          pointerEvents="none"
        />

        <ScrollView
          contentContainerStyle={[styles.content, frame]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>

        {footer ? (
          <View style={[styles.footer, frame, { paddingBottom: insets.bottom + 12 }]}>
            {footer}
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </Modal>
  );
}
