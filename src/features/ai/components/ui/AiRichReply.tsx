import { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTheme } from '@/shared/theme';
import { parseCoachReply, renderInlineEmphasis } from '@/features/ai/utils/parseCoachReply';

function EmphasizedText({
  text,
  style,
}: {
  text: string;
  style: { color: string; fontSize: number; lineHeight: number };
}) {
  const parts = renderInlineEmphasis(text);
  return (
    <Text style={style}>
      {parts.map((part, i) => (
        <Text key={i} style={part.bold ? { fontWeight: '700' } : undefined}>
          {part.text}
        </Text>
      ))}
    </Text>
  );
}

export function AiRichReply({ content }: { content: string }) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const blocks = parseCoachReply(content);

  if (!blocks.length) {
    return <Text style={styles.paragraph}>{content}</Text>;
  }

  return (
    <View style={styles.wrap}>
      {blocks.map((block, i) => {
        if (block.type === 'heading') {
          return (
            <Text key={i} style={styles.heading}>
              {block.text}
            </Text>
          );
        }

        if (block.type === 'list') {
          return (
            <View key={i} style={styles.listCard}>
              {block.items.map((item, j) => (
                <View key={j} style={styles.listRow}>
                  <View style={styles.listLeft}>
                    <View style={styles.bullet} />
                    {item.label ? (
                      <Text style={styles.listLabel}>{item.label}</Text>
                    ) : (
                      <EmphasizedText text={item.value} style={styles.listValueAlone} />
                    )}
                  </View>
                  {item.label ? <Text style={styles.listValue}>{item.value}</Text> : null}
                </View>
              ))}
            </View>
          );
        }

        return <EmphasizedText key={i} text={block.text} style={styles.paragraph} />;
      })}
    </View>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    wrap: { gap: 10 },
    heading: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      color: t.colors.textTertiary,
    },
    paragraph: {
      color: t.colors.text,
      fontSize: 15,
      lineHeight: 22,
    },
    listCard: {
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.04)' : t.colors.background,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.08)' : t.colors.borderSubtle,
    },
    listRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
    },
    listLeft: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      flexShrink: 1,
      minWidth: 0,
    },
    bullet: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginTop: 7,
      backgroundColor: t.colors.primary,
      opacity: 0.75,
    },
    listLabel: {
      fontSize: 13,
      lineHeight: 20,
      color: t.colors.textSecondary,
      flexShrink: 1,
    },
    listValue: {
      fontSize: 13,
      lineHeight: 20,
      fontWeight: '700',
      color: t.colors.text,
      textAlign: 'right',
    },
    listValueAlone: {
      fontSize: 13,
      lineHeight: 20,
      color: t.colors.text,
    },
  });
}
