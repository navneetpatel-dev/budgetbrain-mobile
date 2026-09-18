import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { AppIconName } from '@/features/navigation/components/AppIcon';
import { useCategoryOptions } from '@/features/categories/hooks/useCategoryOptions';
import { useCreateExpense, type ExpenseForm } from '@/features/expenses/hooks/useCreateExpense';
import { useReceiptPicker } from '@/features/expenses/hooks/useReceiptPicker';
import { useCategorySuggestion } from '@/features/expenses/hooks/useCategorySuggestion';
import { useExpenseTagSuggestions } from '@/features/expenses/hooks/useExpenseTagSuggestions';
import { useTheme } from '@/shared/theme';
import { toIsoDate } from '@/shared/utils/dateBounds';

export const CURRENCIES = [
  { symbol: '$', code: 'USD' },
  { symbol: '₹', code: 'INR' },
  { symbol: '€', code: 'EUR' },
  { symbol: '£', code: 'GBP' },
];

export const MERCHANT_SUGGESTIONS = ['Starbucks', 'Uber', 'Amazon', 'Target', 'Whole Foods'];

export const DEFAULT_TAG_PRESETS = ['#dinner', '#groceries', '#work', '#treat'];

export const PAYMENT_METHODS: { id: ExpenseForm['paymentMethod']; label: string; icon: AppIconName }[] = [
  { id: 'upi', label: 'Tap / Pay', icon: 'wallet' },
  { id: 'credit_card', label: 'Card', icon: 'wallet' },
  { id: 'cash', label: 'Cash', icon: 'income' },
  { id: 'net_banking', label: 'Bank', icon: 'netWorth' },
];

export function useAddExpenseForm() {
  const theme = useTheme();
  const { create, loading, submitError, justSaved } = useCreateExpense();
  const disabled = loading || justSaved;
  const { receipt, pick, clear } = useReceiptPicker();
  const { suggestedCategoryId, suggest } = useCategorySuggestion();
  const { suggestions: tagSuggestions } = useExpenseTagSuggestions();
  const { data: categories } = useCategoryOptions();

  const [currencyIndex, setCurrencyIndex] = useState(0);
  const [splitWithFamily, setSplitWithFamily] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const form = useForm<ExpenseForm>({
    defaultValues: {
      amount: '',
      merchant: '',
      notes: '',
      categoryId: '',
      paymentMethod: 'upi',
      date: toIsoDate(new Date()),
      tags: [],
    },
  });
  const { control, handleSubmit, setValue, watch, formState } = form;

  const selectedPayment = watch('paymentMethod');
  const currentCategoryId = watch('categoryId');
  const currentAmount = watch('amount');
  const currentDate = watch('date');
  const currentTags = watch('tags') ?? [];

  const onMerchantBlur = async (merchant: string) => {
    if (currentCategoryId) return;
    await suggest(merchant);
  };

  const selectMerchantSuggestion = (merchant: string) => {
    setValue('merchant', merchant);
    void onMerchantBlur(merchant);
  };

  useEffect(() => {
    if (suggestedCategoryId && !currentCategoryId) {
      setValue('categoryId', suggestedCategoryId);
    }
  }, [suggestedCategoryId, currentCategoryId, setValue]);

  // Quick increment button helper
  const handleAddAmount = (addVal: number) => {
    const parsed = parseFloat(currentAmount) || 0;
    setValue('amount', (parsed + addVal).toFixed(2));
  };

  // Round up button helper
  const handleRoundUp = () => {
    const parsed = parseFloat(currentAmount) || 0;
    if (parsed > 0) {
      setValue('amount', Math.ceil(parsed).toFixed(2));
    }
  };

  // Tag chip toggle helper
  const handleToggleTag = (tag: string) => {
    const cleanTag = tag.startsWith('#') ? tag.slice(1) : tag;
    const exists = currentTags.includes(cleanTag);
    if (exists) {
      setValue(
        'tags',
        currentTags.filter((t) => t !== cleanTag),
      );
    } else {
      setValue('tags', [...currentTags, cleanTag]);
    }
  };

  const onSubmit = async (data: ExpenseForm) => {
    await create(data, receipt);
  };

  const activeCurrency = CURRENCIES[currencyIndex] ?? { symbol: '$', code: 'USD' };

  // Category mapping with fallbacks and colors
  const categoryTiles = useMemo(() => {
    const apiCats = categories ?? [];
    if (apiCats.length) {
      return apiCats.slice(0, 8).map((cat, idx) => {
        let icon: AppIconName = 'expense';
        const name = cat.name.toLowerCase();
        if (name.includes('food') || name.includes('dine') || name.includes('cafe')) icon = 'activity';
        else if (name.includes('groc') || name.includes('market')) icon = 'activity';
        else if (name.includes('shop') || name.includes('buy')) icon = 'wallet';
        else if (name.includes('transit') || name.includes('travel')) icon = 'activity';
        else if (name.includes('bill') || name.includes('util')) icon = 'sparkles';
        else if (name.includes('entertain') || name.includes('fun')) icon = 'sparkles';
        else if (name.includes('health')) icon = 'target';
        return {
          id: cat.id,
          name: cat.name,
          icon,
          color: cat.color ?? (idx % 2 === 0 ? theme.colors.primary : theme.colors.rose),
        };
      });
    }
    return [
      { id: 'food', name: 'Food & Dining', icon: 'activity' as AppIconName, color: theme.colors.rose },
      { id: 'groceries', name: 'Groceries', icon: 'activity' as AppIconName, color: theme.colors.secondary },
      { id: 'shopping', name: 'Shopping', icon: 'wallet' as AppIconName, color: theme.colors.primary },
      { id: 'transit', name: 'Transit', icon: 'activity' as AppIconName, color: theme.colors.warning },
      { id: 'bills', name: 'Bills & Utilities', icon: 'sparkles' as AppIconName, color: theme.colors.violet },
      { id: 'entertainment', name: 'Entertainment', icon: 'sparkles' as AppIconName, color: theme.colors.rose },
      { id: 'health', name: 'Health & Care', icon: 'target' as AppIconName, color: theme.colors.secondaryFixed },
      { id: 'other', name: 'Other', icon: 'more' as AppIconName, color: theme.colors.textTertiary },
    ];
  }, [categories, theme]);

  return {
    control,
    handleSubmit,
    errors: formState.errors,
    loading,
    submitError,
    justSaved,
    disabled,
    receipt,
    pick,
    clear,
    suggestedCategoryId,
    tagSuggestions,
    currencyIndex,
    setCurrencyIndex,
    splitWithFamily,
    setSplitWithFamily,
    showDatePicker,
    setShowDatePicker,
    selectedPayment,
    currentCategoryId,
    currentDate,
    currentTags,
    onMerchantBlur,
    selectMerchantSuggestion,
    handleAddAmount,
    handleRoundUp,
    handleToggleTag,
    onSubmit,
    activeCurrency,
    categoryTiles,
  };
}
