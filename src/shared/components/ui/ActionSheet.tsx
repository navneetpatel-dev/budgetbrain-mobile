import { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon, type AppIconName } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';
import type { AppTheme } from '@/shared/theme';

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

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" accessibilityLabel="Dismiss">
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
      </Pressable>
    </Modal>
  );
}

function createStyles(t: AppTheme) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: t.colors.overlay,
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: t.colors.surface,
      borderTopLeftRadius: t.radii.xl,
      borderTopRightRadius: t.radii.xl,
      paddingHorizontal: t.spacing.lg,
      paddingTop: t.spacing.sm,
      borderWidth: 1,
      borderColor: t.colors.borderSubtle,
      borderBottomWidth: 0,
    },
    handle: {
      alignSelf: 'center',
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: t.colors.border,
      marginBottom: t.spacing.md,
    },
    title: {
      ...t.typography.titleSm,
      color: t.colors.text,
      marginBottom: t.spacing.sm,
    },
    list: {
      borderRadius: t.radii.lg,
      borderWidth: 1,
      borderColor: t.colors.borderSubtle,
      overflow: 'hidden',
      backgroundColor: t.colors.backgroundElevated,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing.md,
      paddingVertical: 14,
      paddingHorizontal: t.spacing.lg,
      minHeight: 56,
    },
    rowBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: t.colors.borderSubtle,
    },
    rowPressed: { backgroundColor: t.colors.surfaceHover },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textCol: { flex: 1 },
    label: { ...t.typography.bodyMedium, color: t.colors.text, fontWeight: '600' },
    subtitle: { ...t.typography.caption, color: t.colors.textTertiary, marginTop: 2 },
    cancel: {
      marginTop: t.spacing.md,
      alignItems: 'center',
      paddingVertical: 14,
      borderRadius: t.radii.lg,
      backgroundColor: t.colors.surfaceHover,
    },
    cancelText: { ...t.typography.bodySemibold, color: t.colors.textSecondary },
  });
}
