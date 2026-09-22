import { useState } from 'react';

const MAX_TAGS = 8;
const MAX_TAG_LENGTH = 30;

export function useTagInput(
  value: string[],
  onChange: (tags: string[]) => void,
  suggestions: string[],
) {
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
  const submitDraft = () => addTag(draft);
  const remainingSuggestions = suggestions.filter((s) => !value.includes(s)).slice(0, MAX_TAGS);
  const canAddMore = value.length < MAX_TAGS;

  return { draft, setDraft, addTag, removeTag, submitDraft, remainingSuggestions, canAddMore };
}
