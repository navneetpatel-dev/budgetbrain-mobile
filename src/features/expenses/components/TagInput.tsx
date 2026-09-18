import { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { FormFieldLabel } from '@/shared/components/ui';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';
import { createStyles } from './TagInput.styles';

const MAX_TAGS = 8;
const MAX_TAG_LENGTH = 30;

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
  const [draft, setDraft] = useState('');

  const addTag = (raw: string) => {
    const tag = raw.trim().slice(0, MAX_TAG_LENGTH);
    if (!tag || value.length >= MAX_TAGS || value.includes(tag)) {
      setDraft('');
      return;
    }
    onChange([...value, tag]);
    setDraft('');
  };

  const removeTag = (tag: string) => onChange(value.filter((t) => t !== tag));

  const remainingSuggestions = suggestions.filter((s) => !value.includes(s)).slice(0, 8);

  return (
    <View>
      <FormFieldLabel>Tags (optional)</FormFieldLabel>
      <View style={styles.chipWrap}>
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
        {value.length < MAX_TAGS ? (
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={() => addTag(draft)}
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
