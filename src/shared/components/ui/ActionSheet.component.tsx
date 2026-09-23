import { useMemo } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { AppIcon, type AppIconName } from '@/features/navigation/components/AppIcon.component';
import { useTheme } from '@/shared/theme';
import { useSheetEnterAnimation } from '@/shared/hooks/useSheetEnterAnimation.hook';
import { useSpringPress } from '@/shared/hooks/useSpringPress.hook';
import { useScreenInsets, useBottomSafeInset } from '@/shared/hooks/useLayout.hook';
import { createStyles } from './ActionSheet.styles';

export type ActionSheetItem = {
  id: string;
  label: string;
  subtitle?: string;
  icon?: AppIconName;
  destructive?: boolean;
  onPress: () => void;
};

export function ActionSheet({
  visible,
  title = 'Create',
  items,
  onClose,
}: {
  visible: boolean;
  title?: string;
  items: ActionSheetItem[];
  onClose: () => void;
}) {
  const theme = useTheme();
  const bottomSafe = useBottomSafeInset();
  const { paddingHorizontal } = useScreenInsets();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const sheetAnim = useSheetEnterAnimation(visible, 'sheet');
  const cancelSpring = useSpringPress();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" accessibilityLabel="Dismiss">
        <Animated.View style={sheetAnim}>
        <Pressable
          style={[
            styles.sheet,
            {
              marginHorizontal: paddingHorizontal,
              marginBottom: bottomSafe,
              paddingBottom: theme.spacing.md,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.handle} />
          <Text style={styles.title}>{title}</Text>
          <View style={styles.list}>
            {items.map((item, i) => (
              <Pressable
                key={item.id}
                onPress={() => {
                  onClose();
                  item.onPress();
                }}
                style={({ pressed }) => [
                  styles.row,
                  i < items.length - 1 && styles.rowBorder,
                  pressed && styles.rowPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={item.label}
              >
                {item.icon ? (
                  <View
                    style={[
                      styles.iconWrap,
                      {
                        backgroundColor: item.destructive
                          ? theme.colors.dangerSoft
                          : theme.colors.primarySoft,
                      },
                    ]}
                  >
                    <AppIcon
                      name={item.icon}
                      size={18}
                      color={item.destructive ? theme.colors.danger : theme.colors.primary}
                    />
                  </View>
                ) : null}
                <View style={styles.textCol}>
                  <Text style={[styles.label, item.destructive && { color: theme.colors.danger }]}>
                    {item.label}
                  </Text>
                  {item.subtitle ? <Text style={styles.subtitle}>{item.subtitle}</Text> : null}
                </View>
                <AppIcon name="chevronRight" size={14} color={theme.colors.textTertiary} />
              </Pressable>
            ))}
          </View>
          <Pressable
            onPress={onClose}
            onPressIn={cancelSpring.onPressIn}
            onPressOut={cancelSpring.onPressOut}
            style={styles.cancel}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            <Animated.View style={cancelSpring.style}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Animated.View>
          </Pressable>
        </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
