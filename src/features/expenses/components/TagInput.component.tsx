import { useMemo } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { FormFieldLabel } from '@/shared/components/ui';
import { AppIcon } from '@/features/navigation/components/AppIcon.component';
import { useTagInput } from '@/features/expenses/hooks/useTagInput.hook';
import { useTheme } from '@/shared/theme';
import { createStyles } from './TagInput.styles';

export function TagInput({
  value,
  onChange,
  suggestions,
  disabled,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions: string[];
  disabled?: boolean;
}) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { draft, setDraft, addTag, removeTag, submitDraft, remainingSuggestions, canAddMore } = useTagInput(
    value,
    onChange,
    suggestions,
  );

  return (
    <View>
      <FormFieldLabel>Tags (optional)</FormFieldLabel>
      <View style={styles.chipWrap}>
        {/* Bounded chip wrap, at most 8 tags, not a scrolling list. */}
        {value.map((tag) => (
          <View key={tag} style={styles.tagChip}>
            <Text style={styles.tagChipText} numberOfLines={1}>{tag}</Text>
            {!disabled ? (
              <Pressable onPress={() => removeTag(tag)} hitSlop={8} accessibilityRole="button" accessibilityLabel={`Remove tag ${tag}`}>
                <AppIcon name="close" size={12} color={theme.colors.primary} />
              </Pressable>
            ) : null}
          </View>
        ))}
        {canAddMore ? (
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={submitDraft}
            placeholder="Add a tag…"
            placeholderTextColor={theme.colors.textTertiary}
            style={styles.input}
            editable={!disabled}
            returnKeyType="done"
            blurOnSubmit={false}
          />
        ) : null}
      </View>

      {remainingSuggestions.length > 0 ? (
        <View style={styles.suggestionWrap}>
          {/* Bounded suggestion chips, capped at 8. */}
          {remainingSuggestions.map((s) => (
            <Pressable
              key={s}
              onPress={() => addTag(s)}
              disabled={disabled}
              style={styles.suggestionChip}
              accessibilityRole="button"
              accessibilityLabel={`Add tag ${s}`}
            >
              <Text style={styles.suggestionChipText}>+ {s}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
