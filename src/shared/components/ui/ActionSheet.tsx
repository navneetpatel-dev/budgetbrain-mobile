import { useMemo } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon, type AppIconName } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';
import { useSheetEnterAnimation } from '@/shared/hooks/useSheetEnterAnimation';
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
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const sheetAnim = useSheetEnterAnimation(visible, 'sheet');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" accessibilityLabel="Dismiss">
        <Animated.View style={sheetAnim}>
        <Pressable
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}
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
            style={({ pressed }) => [styles.cancel, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
