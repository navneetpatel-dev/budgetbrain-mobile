import { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Controller, useForm } from 'react-hook-form';
import { useRouter } from 'expo-router';
import {
  AppHeaderBar,
  DateInput,
  ToggleSwitch,
  FormErrorBanner,
  FormSuccessBanner,
} from '@/shared/components/ui';
import { AppIcon, type AppIconName } from '@/features/navigation/components/AppIcon';
import { useCategoryOptions } from '@/features/categories/hooks/useCategoryOptions';
import { useCreateExpense, type ExpenseForm } from '@/features/expenses/hooks/useCreateExpense';
import { useReceiptPicker } from '@/features/expenses/hooks/useReceiptPicker';
import { useCategorySuggestion } from '@/features/expenses/hooks/useCategorySuggestion';
import { useExpenseTagSuggestions } from '@/features/expenses/hooks/useExpenseTagSuggestions';
import { useTheme } from '@/shared/theme';
import { useUserCurrency } from '@/shared/hooks/useUserCurrency';
import { amountRules, textRules, maxLen } from '@/shared/validation/fieldLimits';
import { DateBounds, toIsoDate } from '@/shared/utils/dateBounds';

const CURRENCIES = [
  { symbol: '$', code: 'USD' },
  { symbol: '₹', code: 'INR' },
  { symbol: '€', code: 'EUR' },
  { symbol: '£', code: 'GBP' },
];

const MERCHANT_SUGGESTIONS = ['Starbucks', 'Uber', 'Amazon', 'Target', 'Whole Foods'];

const DEFAULT_TAG_PRESETS = ['#dinner', '#groceries', '#work', '#treat'];

export default function AddExpenseScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { currency } = useUserCurrency();

  const { create, loading, submitError, justSaved } = useCreateExpense();
  const disabled = loading || justSaved;
  const { receipt, pick, clear } = useReceiptPicker();
  const { suggestedCategoryId, suggest } = useCategorySuggestion();
  const { suggestions: tagSuggestions } = useExpenseTagSuggestions();
  const { data: categories } = useCategoryOptions();

  const [currencyIndex, setCurrencyIndex] = useState(0);
  const [splitWithFamily, setSplitWithFamily] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<ExpenseForm>({
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

  const selectedPayment = watch('paymentMethod');
  const currentCategoryId = watch('categoryId');
  const currentAmount = watch('amount');
  const currentDate = watch('date');
  const currentTags = watch('tags') ?? [];

  const onMerchantBlur = async (merchant: string) => {
    if (currentCategoryId) return;
    await suggest(merchant);
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

  return (
    <View style={styles.screenWrapper}>
      {/* Top Header */}
      <AppHeaderBar title="Log Transaction" subtitle="Expense" showBack={true} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {justSaved ? <FormSuccessBanner message="Expense saved successfully!" /> : null}
        {submitError ? <FormErrorBanner message={submitError} /> : null}

        {/* Modal Handle & Header Subtitle */}
        <View style={styles.sheetHeader}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetTitleRow}>
            <View style={styles.sheetTitleLeft}>
              <View style={styles.sheetIconPod}>
                <AppIcon name="add" size={18} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={styles.sheetEyebrow}>Transaction</Text>
                <Text style={styles.sheetTitle}>Log Expense</Text>
              </View>
            </View>

            <Pressable
              onPress={pick}
              style={({ pressed }) => [styles.scanReceiptBtn, pressed && { opacity: 0.85 }]}
              accessibilityRole="button"
              accessibilityLabel="Scan Receipt"
            >
              <AppIcon name="document" size={15} color={theme.colors.primary} />
              <Text style={styles.scanReceiptText}>Scan Receipt</Text>
            </Pressable>
          </View>
        </View>

        {/* Currency & Numerical Hero Input Card */}
        <View style={styles.amountHeroCard}>
          <View style={styles.glowTopRight} pointerEvents="none" />
          <View style={styles.glowBottomLeft} pointerEvents="none" />

          {/* Currency Toggle Pill */}
          <View style={styles.amountTopRow}>
            <Pressable
              onPress={() => setCurrencyIndex((prev) => (prev + 1) % CURRENCIES.length)}
              style={styles.currencyTogglePill}
              accessibilityRole="button"
              accessibilityLabel="Change Currency"
            >
              <Text style={styles.currencySymbol}>{activeCurrency.symbol}</Text>
              <Text style={styles.currencyCode}>{activeCurrency.code}</Text>
              <AppIcon name="chevronRight" size={11} color={theme.colors.textTertiary} />
            </Pressable>
            <Text style={styles.amountSpentLabel}>Amount Spent</Text>
          </View>

          {/* Large Hero Amount Input */}
          <View style={styles.heroAmountRow}>
            <Text style={styles.heroSymbolText}>{activeCurrency.symbol}</Text>
            <Controller
              control={control}
              name="amount"
              rules={amountRules()}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.heroAmountInput}
                  placeholder="0.00"
                  placeholderTextColor={theme.colors.textTertiary}
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                  editable={!disabled}
                />
              )}
            />
          </View>
          {errors.amount?.message ? (
            <Text style={styles.fieldErrorText}>{errors.amount.message}</Text>
          ) : null}

          {/* Quick Increment Presets */}
          <View style={styles.presetChipsRow}>
            <Pressable
              onPress={() => handleAddAmount(10)}
              style={({ pressed }) => [styles.presetChip, pressed && styles.presetPressed]}
            >
              <Text style={styles.presetText}>+$10</Text>
            </Pressable>
            <Pressable
              onPress={() => handleAddAmount(25)}
              style={({ pressed }) => [styles.presetChip, pressed && styles.presetPressed]}
            >
              <Text style={styles.presetText}>+$25</Text>
            </Pressable>
            <Pressable
              onPress={() => handleAddAmount(50)}
              style={({ pressed }) => [styles.presetChip, pressed && styles.presetPressed]}
            >
              <Text style={styles.presetText}>+$50</Text>
            </Pressable>
            <Pressable
              onPress={() => handleAddAmount(100)}
              style={({ pressed }) => [styles.presetChip, pressed && styles.presetPressed]}
            >
              <Text style={styles.presetText}>+$100</Text>
            </Pressable>
            <Pressable
              onPress={handleRoundUp}
              style={({ pressed }) => [
                styles.presetChip,
                styles.roundUpChip,
                pressed && styles.presetPressed,
              ]}
            >
              <AppIcon name="arrowUp" size={13} color={theme.colors.secondary} />
              <Text style={[styles.presetText, { color: theme.colors.secondary }]}>Round</Text>
            </Pressable>
          </View>
        </View>

        {/* Merchant or Payee */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionEyebrow}>Merchant or Payee</Text>
          <View style={styles.merchantInputWrap}>
            <AppIcon name="search" size={18} color={theme.colors.textTertiary} />
            <Controller
              control={control}
              name="merchant"
              rules={textRules('merchant')}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.merchantInput}
                  placeholder="e.g. Starbucks, Target, Uber"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={() => {
                    onBlur();
                    void onMerchantBlur(value);
                  }}
                  maxLength={maxLen('merchant')}
                  editable={!disabled}
                />
              )}
            />
          </View>
          {errors.merchant?.message ? (
            <Text style={styles.fieldErrorText}>{errors.merchant.message}</Text>
          ) : null}

          {/* Suggested Merchant Rail */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.merchantRail}>
            {MERCHANT_SUGGESTIONS.map((merchant) => (
              <Pressable
                key={merchant}
                onPress={() => {
                  setValue('merchant', merchant);
                  void onMerchantBlur(merchant);
                }}
                style={({ pressed }) => [styles.merchantChip, pressed && { opacity: 0.8 }]}
              >
                <Text style={styles.merchantChipText}>{merchant}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Category Selector 4x2 Grid */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeaderBetween}>
            <Text style={styles.sectionEyebrow}>Category</Text>
            {suggestedCategoryId && currentCategoryId === suggestedCategoryId ? (
              <Text style={styles.suggestedHint}>Auto-Suggested</Text>
            ) : null}
          </View>

          <Controller
            control={control}
            name="categoryId"
            render={({ field: { onChange, value } }) => (
              <View style={styles.categoryGrid}>
                {categoryTiles.map((cat) => {
                  const isSelected = value === cat.id;

                  return (
                    <Pressable
                      key={cat.id}
                      onPress={() => onChange(cat.id)}
                      style={({ pressed }) => [
                        styles.categoryTile,
                        isSelected && styles.categoryTileSelected,
                        pressed && { transform: [{ scale: 0.96 }] },
                      ]}
                      accessibilityRole="button"
                    >
                      <View
                        style={[
                          styles.catIconCircle,
                          { backgroundColor: cat.color + '22' },
                        ]}
                      >
                        <AppIcon name={cat.icon} size={18} color={cat.color} />
                      </View>
                      <Text
                        style={[
                          styles.catTileLabel,
                          isSelected && { color: theme.colors.text, fontWeight: '700' },
                        ]}
                        numberOfLines={1}
                      >
                        {cat.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          />
        </View>

        {/* Payment Method Selector (4 segmented cards) */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionEyebrow}>Payment Method</Text>
          <Controller
            control={control}
            name="paymentMethod"
            render={({ field: { onChange, value } }) => {
              const methods = [
                { id: 'upi', label: 'Tap / Pay', icon: 'wallet' as AppIconName },
                { id: 'credit_card', label: 'Card', icon: 'wallet' as AppIconName },
                { id: 'cash', label: 'Cash', icon: 'income' as AppIconName },
                { id: 'net_banking', label: 'Bank', icon: 'netWorth' as AppIconName },
              ];

              return (
                <View style={styles.paymentMethodsRow}>
                  {methods.map((method) => {
                    const isSelected = value === method.id;

                    return (
                      <Pressable
                        key={method.id}
                        onPress={() => onChange(method.id)}
                        style={[
                          styles.payMethodTile,
                          isSelected && styles.payMethodTileSelected,
                        ]}
                        accessibilityRole="button"
                      >
                        <AppIcon
                          name={method.icon}
                          size={18}
                          color={isSelected ? theme.colors.primary : theme.colors.textSecondary}
                        />
                        <Text
                          style={[
                            styles.payMethodLabel,
                            isSelected && { color: theme.colors.primary, fontWeight: '700' },
                          ]}
                        >
                          {method.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              );
            }}
          />
        </View>

        {/* Date & Family Split Card Duo */}
        <View style={styles.sectionWrap}>
          {/* Date Row */}
          <View style={styles.infoCardRow}>
            <View style={styles.infoCardLeft}>
              <View style={[styles.infoIconCircle, { backgroundColor: theme.colors.primary + '18' }]}>
                <AppIcon name="calendar" size={16} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={styles.infoCardSub}>Transaction Date</Text>
                <Text style={styles.infoCardTitle}>{currentDate}</Text>
              </View>
            </View>
            <Pressable
              onPress={() => setShowDatePicker((prev) => !prev)}
              style={styles.changeActionBtn}
            >
              <Text style={styles.changeActionText}>
                {showDatePicker ? 'Done' : 'Change'}
              </Text>
            </Pressable>
          </View>

          {showDatePicker ? (
            <Controller
              control={control}
              name="date"
              render={({ field: { onChange, value } }) => {
                const b = DateBounds.transaction(value);
                return (
                  <View style={{ marginTop: 8 }}>
                    <DateInput
                      label="Select Date"
                      value={value}
                      onChange={onChange}
                      error={errors.date?.message}
                      disabled={disabled}
                      minimumDate={b.minimumDate}
                      maximumDate={b.maximumDate}
                    />
                  </View>
                );
              }}
            />
          ) : null}

          {/* Family Split Toggle */}
          <View style={[styles.infoCardRow, { marginTop: 8 }]}>
            <View style={styles.infoCardLeft}>
              <View style={[styles.infoIconCircle, { backgroundColor: theme.colors.secondary + '18' }]}>
                <AppIcon name="family" size={16} color={theme.colors.secondary} />
              </View>
              <View>
                <Text style={styles.infoCardTitle}>Split with Family</Text>
                <Text style={styles.infoCardSub}>Share in household ledger</Text>
              </View>
            </View>
            <ToggleSwitch
              value={splitWithFamily}
              onValueChange={setSplitWithFamily}
              disabled={disabled}
            />
          </View>
        </View>

        {/* Receipt Attachment Card */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionEyebrow}>Receipt Attachment</Text>
          <Pressable
            onPress={receipt?.uri ? clear : pick}
            style={styles.receiptUploadCard}
            accessibilityRole="button"
          >
            <View style={styles.receiptLeft}>
              <View style={styles.receiptIconCircle}>
                <AppIcon name="document" size={18} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.receiptTitle} numberOfLines={1}>
                  {receipt?.uri ? 'Receipt Attached (Tap to remove)' : 'Snap or upload receipt'}
                </Text>
                <Text style={styles.receiptSub}>Smart OCR fills merchant & tax line</Text>
              </View>
            </View>
            {receipt?.uri ? (
              <Image source={{ uri: receipt.uri }} style={styles.receiptThumb} />
            ) : (
              <AppIcon name="chevronRight" size={18} color={theme.colors.textTertiary} />
            )}
          </Pressable>
        </View>

        {/* Notes & Tags */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeaderBetween}>
            <Text style={styles.sectionEyebrow}>Notes & Tags</Text>
            <Text style={styles.optionalText}>Optional</Text>
          </View>

          <View style={styles.notesBox}>
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.notesInput}
                  placeholder="Add a short memo..."
                  placeholderTextColor={theme.colors.textTertiary}
                  value={value}
                  onChangeText={onChange}
                  maxLength={maxLen('notes')}
                  editable={!disabled}
                />
              )}
            />

            {/* Quick Tag Chips */}
            <View style={styles.tagChipsRow}>
              {DEFAULT_TAG_PRESETS.map((tag) => {
                const clean = tag.slice(1);
                const isTagSelected = currentTags.includes(clean);

                return (
                  <Pressable
                    key={tag}
                    onPress={() => handleToggleTag(tag)}
                    style={[
                      styles.tagChip,
                      isTagSelected && styles.tagChipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tagChipText,
                        isTagSelected && { color: theme.colors.primary, fontWeight: '700' },
                      ]}
                    >
                      {tag}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* Sticky Save Button */}
        <View style={styles.saveBtnWrap}>
          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={disabled}
            style={({ pressed }) => [
              styles.savePressable,
              pressed && { transform: [{ scale: 0.98 }] },
              disabled && { opacity: 0.7 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Save Expense"
          >
            <LinearGradient
              colors={[theme.colors.primaryContainer, theme.colors.ocean]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.saveGradient}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <AppIcon name="checkmark" size={18} color="#FFFFFF" />
              )}
              <Text style={styles.saveButtonText}>
                {loading ? 'Saving Expense...' : 'Save Expense'}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    screenWrapper: {
      flex: 1,
      backgroundColor: t.colors.background,
    },
    scrollContent: {
      paddingHorizontal: t.spacing.lg,
      paddingBottom: 40,
      gap: t.spacing.lg,
    },
    sheetHeader: {
      alignItems: 'center',
      gap: 12,
      paddingTop: 8,
    },
    sheetHandle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: t.colors.surfaceBright,
    },
    sheetTitleRow: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sheetTitleLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    sheetIconPod: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: t.colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
    },
    sheetEyebrow: {
      fontSize: 10,
      fontWeight: '600',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      color: t.colors.textTertiary,
    },
    sheetTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: t.colors.text,
      letterSpacing: -0.3,
    },
    scanReceiptBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: t.radii.full,
      backgroundColor: t.colors.surfaceContainerHigh,
    },
    scanReceiptText: {
      fontSize: 12,
      fontWeight: '600',
      color: t.colors.primary,
    },
    amountHeroCard: {
      backgroundColor: t.colors.surfaceContainerLow,
      borderRadius: t.radii.card,
      padding: t.spacing.lg,
      borderWidth: 1,
      borderColor: t.colors.borderSubtle,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      ...t.shadows.sm,
    },
    glowTopRight: {
      position: 'absolute',
      top: -30,
      right: -30,
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: t.colors.primary + '14',
    },
    glowBottomLeft: {
      position: 'absolute',
      bottom: -30,
      left: -30,
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: t.colors.secondary + '14',
    },
    amountTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 10,
    },
    currencyTogglePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: t.radii.full,
      backgroundColor: t.colors.surface,
    },
    currencySymbol: {
      fontSize: 13,
      fontWeight: '700',
      color: t.colors.text,
    },
    currencyCode: {
      fontSize: 11,
      fontWeight: '600',
      color: t.colors.textTertiary,
    },
    amountSpentLabel: {
      fontSize: 12,
      color: t.colors.textTertiary,
    },
    heroAmountRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroSymbolText: {
      fontSize: 28,
      fontWeight: '800',
      color: t.colors.textTertiary,
      marginRight: 4,
    },
    heroAmountInput: {
      fontSize: 32,
      fontWeight: '800',
      color: t.colors.text,
      fontVariant: ['tabular-nums'],
      minWidth: 120,
      textAlign: 'center',
    },
    presetChipsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 14,
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    presetChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: t.radii.full,
      backgroundColor: t.colors.surfaceContainerHigh,
    },
    roundUpChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    presetPressed: {
      transform: [{ scale: 0.94 }],
      opacity: 0.8,
    },
    presetText: {
      fontSize: 12,
      fontWeight: '600',
      color: t.colors.text,
    },
    sectionWrap: {
      gap: 8,
    },
    sectionEyebrow: {
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      color: t.colors.textTertiary,
    },
    sectionHeaderBetween: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    suggestedHint: {
      fontSize: 11,
      fontWeight: '600',
      color: t.colors.primary,
    },
    merchantInputWrap: {
      height: 48,
      borderRadius: t.radii.md,
      backgroundColor: t.colors.surfaceContainerLow,
      borderWidth: 1,
      borderColor: t.colors.borderSubtle,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      gap: 10,
    },
    merchantInput: {
      flex: 1,
      fontSize: 14,
      color: t.colors.text,
    },
    merchantRail: {
      paddingTop: 4,
    },
    merchantChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: t.radii.full,
      backgroundColor: t.colors.surface,
      marginRight: 8,
    },
    merchantChipText: {
      fontSize: 12,
      color: t.colors.textSecondary,
      fontWeight: '500',
    },
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      justifyContent: 'space-between',
    },
    categoryTile: {
      width: '23%',
      paddingVertical: 10,
      paddingHorizontal: 4,
      borderRadius: t.radii.md,
      backgroundColor: t.colors.surfaceContainerLow,
      borderWidth: 1,
      borderColor: t.colors.borderSubtle,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    categoryTileSelected: {
      backgroundColor: t.colors.surfaceContainerHigh,
      borderColor: t.colors.primary,
    },
    catIconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    catTileLabel: {
      fontSize: 11,
      fontWeight: '500',
      color: t.colors.textSecondary,
      textAlign: 'center',
    },
    paymentMethodsRow: {
      flexDirection: 'row',
      gap: 8,
      backgroundColor: t.colors.surfaceContainerLow,
      padding: 6,
      borderRadius: t.radii.md,
    },
    payMethodTile: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: t.radii.sm,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    },
    payMethodTileSelected: {
      backgroundColor: t.colors.surfaceContainerHigh,
    },
    payMethodLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: t.colors.textSecondary,
    },
    infoCardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 14,
      borderRadius: t.radii.md,
      backgroundColor: t.colors.surfaceContainerLow,
      borderWidth: 1,
      borderColor: t.colors.borderSubtle,
    },
    infoCardLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    infoIconCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    infoCardTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: t.colors.text,
    },
    infoCardSub: {
      fontSize: 11,
      color: t.colors.textTertiary,
    },
    changeActionBtn: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: t.radii.full,
      backgroundColor: t.colors.surface,
    },
    changeActionText: {
      fontSize: 11,
      fontWeight: '600',
      color: t.colors.textSecondary,
    },
    receiptUploadCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 14,
      borderRadius: t.radii.md,
      backgroundColor: t.colors.surfaceContainerLow,
      borderWidth: 1,
      borderColor: t.colors.borderSubtle,
    },
    receiptLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    receiptIconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: t.colors.primary + '18',
      alignItems: 'center',
      justifyContent: 'center',
    },
    receiptTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: t.colors.text,
    },
    receiptSub: {
      fontSize: 11,
      color: t.colors.textTertiary,
    },
    receiptThumb: {
      width: 36,
      height: 36,
      borderRadius: 8,
    },
    notesBox: {
      borderRadius: t.radii.md,
      backgroundColor: t.colors.surfaceContainerLow,
      borderWidth: 1,
      borderColor: t.colors.borderSubtle,
      padding: 12,
      gap: 10,
    },
    notesInput: {
      fontSize: 13,
      color: t.colors.text,
      minHeight: 32,
    },
    tagChipsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
    },
    tagChip: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: t.radii.full,
      backgroundColor: t.colors.surface,
    },
    tagChipSelected: {
      backgroundColor: t.colors.primary + '22',
    },
    tagChipText: {
      fontSize: 11,
      fontWeight: '500',
      color: t.colors.textSecondary,
    },
    optionalText: {
      fontSize: 11,
      color: t.colors.textTertiary,
    },
    fieldErrorText: {
      fontSize: 11,
      color: t.colors.danger,
      marginTop: 2,
    },
    saveBtnWrap: {
      paddingTop: 8,
    },
    savePressable: {
      width: '100%',
      borderRadius: t.radii.full,
      overflow: 'hidden',
      ...t.shadows.md,
    },
    saveGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 16,
    },
    saveButtonText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#FFFFFF',
    },
  });
}
