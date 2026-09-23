import { useMemo } from 'react';
import { Modal, ScrollView, View, Text, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/shared/theme';
import { useScreenInsets, useBottomSafeInset } from '@/shared/hooks/useLayout.hook';
import { useSheetEnterAnimation } from '@/shared/hooks/useSheetEnterAnimation.hook';
import { useSpringPress } from '@/shared/hooks/useSpringPress.hook';
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
  const sheetAnim = useSheetEnterAnimation(visible, 'sheet');
  const closeSpring = useSpringPress();

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <KeyboardAvoidingView
          style={[styles.container, { marginHorizontal: paddingHorizontal, marginBottom: bottomSafe }]}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
        <Animated.View style={sheetAnim}>
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
              onPressIn={closeSpring.onPressIn}
              onPressOut={closeSpring.onPressOut}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close form"
            >
              <Animated.View style={closeSpring.style}>
                <AppIcon name="close" size={16} color={theme.colors.textSecondary} />
              </Animated.View>
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
        </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
