import { useMemo } from 'react';
import { Modal, ScrollView, View, Text, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/shared/theme';
import { useScreenInsets, useBottomSafeInset } from '@/shared/hooks/useLayout.hook';
import { AppIcon } from '@/features/navigation/components/AppIcon.component';
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
  const bottomSafe = useBottomSafeInset();
  const { paddingHorizontal } = useScreenInsets();
  const styles = useMemo(() => createStyles(theme, bottomSafe), [theme, bottomSafe]);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <KeyboardAvoidingView
          style={[styles.container, { marginHorizontal: paddingHorizontal, marginBottom: bottomSafe }]}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>

          <View style={styles.header}>
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
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>

          {footer ? (
            <View style={[styles.footer, { paddingBottom: 12 }]}>
              {footer}
            </View>
          ) : null}
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
