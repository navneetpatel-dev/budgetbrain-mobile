import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    groupCard: {
      marginBottom: t.spacing.md,
      padding: 16,
      borderRadius: t.radii.card ?? 18,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    groupName: {
      ...t.typography.bodySemibold,
      fontSize: 16,
      fontWeight: '700',
      color: t.colors.text,
      flex: 1,
    },
    roleBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      backgroundColor: t.isDark ? 'rgba(14, 165, 233, 0.15)' : 'rgba(14, 165, 233, 0.1)',
    },
    roleBadgeOwner: {
      backgroundColor: t.isDark ? 'rgba(234, 179, 8, 0.2)' : 'rgba(234, 179, 8, 0.15)',
    },
    roleBadgeAdmin: {
      backgroundColor: t.isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.15)',
    },
    roleBadgeText: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.6,
      color: t.colors.primary,
      textTransform: 'uppercase',
    },
    roleBadgeTextOwner: {
      color: t.isDark ? '#FACC15' : '#CA8A04',
    },
    roleBadgeTextAdmin: {
      color: t.isDark ? '#C084FC' : '#7C3AED',
    },
    inviteCode: {
      ...t.typography.caption,
      fontSize: 13,
      color: t.colors.primary,
      fontWeight: '600',
      marginTop: 6,
    },
    membersSection: {
      marginTop: 14,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.borderSubtle,
      gap: 10,
    },
    membersSectionTitle: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.8,
      color: t.colors.textTertiary,
      textTransform: 'uppercase',
      marginBottom: 2,
    },
    memberRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    memberLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
    },
    memberAvatar: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    memberInitials: {
      fontSize: 12,
      fontWeight: '700',
      color: t.colors.text,
    },
    memberName: {
      ...t.typography.bodySemibold,
      fontSize: 13,
      color: t.colors.text,
    },
    memberRoleText: {
      ...t.typography.caption,
      fontSize: 11,
      color: t.colors.textSecondary,
      textTransform: 'capitalize',
    },
    memberActionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    memberRoleAction: {
      fontSize: 12,
      fontWeight: '600',
      color: t.colors.primary,
    },
    memberRemoveBtn: {
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    memberRemoveText: {
      fontSize: 12,
      fontWeight: '600',
      color: t.colors.danger,
    },
    groupActionsRow: {
      marginTop: 14,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.borderSubtle,
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    deleteGroupBtn: {
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    deleteGroupText: {
      fontSize: 12,
      fontWeight: '600',
      color: t.colors.danger,
    },
  });
}
