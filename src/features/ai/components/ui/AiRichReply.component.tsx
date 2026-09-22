import { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/shared/theme';
import { parseCoachReply, renderInlineEmphasis } from '@/features/ai/utils/parseCoachReply';
import { createStyles } from './AiRichReply.styles';

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
