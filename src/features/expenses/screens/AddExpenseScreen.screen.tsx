import { useMemo } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Controller } from 'react-hook-form';
import { AppHeaderBar, DateInput, ToggleSwitch, FormErrorBanner, FormSuccessBanner } from '@/shared/components/ui';
import { AppIcon } from '@/features/navigation/components/AppIcon.component';
import { useTheme } from '@/shared/theme';
import { useBottomSafeInset } from '@/shared/hooks/useLayout.hook';
import { amountRules, textRules, maxLen } from '@/shared/validation/fieldLimits';
import { DateBounds } from '@/shared/utils/dateBounds';
import {
  useAddExpenseForm,
  MERCHANT_SUGGESTIONS,
  DEFAULT_TAG_PRESETS,
  PAYMENT_METHODS,
} from '@/features/expenses/hooks/useAddExpenseForm.hook';
import { categoryIconTint, createStyles, scrollBottomInset } from './AddExpenseScreen.styles';

export function AddExpenseScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const bottomSafe = useBottomSafeInset();
  const {
    control,
    handleSubmit,
    errors,
    loading,
    submitError,
    justSaved,
    disabled,
    receipt,
    pick,
    clear,
    suggestedCategoryId,
    currencyIndex,
    cycleCurrency,
    splitWithFamily,
    setSplitWithFamily,
    showDatePicker,
    toggleDatePicker,
    addTen,
    addTwentyFive,
    addFifty,
    addOneHundred,
    blurMerchantField,
    currentCategoryId,
    currentDate,
    currentTags,
    selectMerchantSuggestion,
    handleRoundUp,
    handleToggleTag,
    onSubmit,
    activeCurrency,
    categoryTiles,
  } = useAddExpenseForm();

  return (
    <View style={styles.screenWrapper}>
      {/* Top Header */}
      <AppHeaderBar title="Log Transaction" subtitle="Expense" showBack={true} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          scrollBottomInset(bottomSafe, theme.spacing.lg),
        ]}
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
              style={({ pressed }) => [styles.scanReceiptBtn, pressed && styles.pressedFade]}
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
              onPress={cycleCurrency}
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
              onPress={addTen}
              style={({ pressed }) => [styles.presetChip, pressed && styles.presetPressed]}
            >
              <Text style={styles.presetText}>+$10</Text>
            </Pressable>
            <Pressable
              onPress={addTwentyFive}
              style={({ pressed }) => [styles.presetChip, pressed && styles.presetPressed]}
            >
              <Text style={styles.presetText}>+$25</Text>
            </Pressable>
            <Pressable
              onPress={addFifty}
              style={({ pressed }) => [styles.presetChip, pressed && styles.presetPressed]}
            >
              <Text style={styles.presetText}>+$50</Text>
            </Pressable>
            <Pressable
              onPress={addOneHundred}
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
              <Text style={[styles.presetText, styles.presetTextSecondary]}>Round</Text>
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
              render={({ field: { onChange, onBlur, value } }) => {
                const blurMerchant = () => blurMerchantField(onBlur, value);
                return (
                <TextInput
                  style={styles.merchantInput}
                  placeholder="e.g. Starbucks, Target, Uber"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={blurMerchant}
                  maxLength={maxLen('merchant')}
                  editable={!disabled}
                />
                );
              }}
            />
          </View>
          {errors.merchant?.message ? (
            <Text style={styles.fieldErrorText}>{errors.merchant.message}</Text>
          ) : null}

          {/* Suggested Merchant Rail */}
          {/* Fixed merchant set of 5. Horizontal rail, not a growing list. */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.merchantRail}>
            {MERCHANT_SUGGESTIONS.map((merchant) => (
              <Pressable
                key={merchant}
                onPress={() => selectMerchantSuggestion(merchant)}
                style={({ pressed }) => [styles.merchantChip, pressed && styles.pressedChip]}
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

          {/* Fixed 4x2 category grid, capped at 8 tiles. */}
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
                        pressed && styles.tilePressed,
                      ]}
                      accessibilityRole="button"
                    >
                      <View
                        style={[styles.catIconCircle, categoryIconTint(cat.color)]}
                      >
                        <AppIcon name={cat.icon} size={18} color={cat.color} />
                      </View>
                      <Text
                        style={[styles.catTileLabel, isSelected && styles.catTileLabelSelected]}
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
          {/* Fixed payment methods, four tiles. */}
          <Controller
            control={control}
            name="paymentMethod"
            render={({ field: { onChange, value } }) => (
              <View style={styles.paymentMethodsRow}>
                {PAYMENT_METHODS.map((method) => {
                  const isSelected = value === method.id;

                  return (
                    <Pressable
                      key={method.id}
                      onPress={() => onChange(method.id)}
                      style={[styles.payMethodTile, isSelected && styles.payMethodTileSelected]}
                      accessibilityRole="button"
                    >
                      <AppIcon
                        name={method.icon}
                        size={18}
                        color={isSelected ? theme.colors.primary : theme.colors.textSecondary}
                      />
                      <Text style={[styles.payMethodLabel, isSelected && styles.payMethodLabelSelected]}>
                        {method.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          />
        </View>

        {/* Date & Family Split Card Duo */}
        <View style={styles.sectionWrap}>
          {/* Date Row */}
          <View style={styles.infoCardRow}>
            <View style={styles.infoCardLeft}>
              <View style={[styles.infoIconCircle, styles.infoIconCirclePrimary]}>
                <AppIcon name="calendar" size={16} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={styles.infoCardSub}>Transaction Date</Text>
                <Text style={styles.infoCardTitle}>{currentDate}</Text>
              </View>
            </View>
            <Pressable
              onPress={toggleDatePicker}
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
                  <View style={styles.datePickerWrap}>
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
          <View style={[styles.infoCardRow, styles.infoCardRowSpaced]}>
            <View style={styles.infoCardLeft}>
              <View style={[styles.infoIconCircle, styles.infoIconCircleSecondary]}>
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
              <View style={styles.receiptTextCol}>
                <Text style={styles.receiptTitle} numberOfLines={1}>
                  {receipt?.uri ? 'Receipt Attached (Tap to remove)' : 'Snap or upload receipt'}
                </Text>
                <Text style={styles.receiptSub}>Smart OCR fills merchant & tax line</Text>
              </View>
            </View>
            {receipt?.uri ? (
              <Image source={{ uri: receipt.uri }} style={styles.receiptThumb} contentFit="cover" transition={150} />
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
            {/* Fixed preset tags. */}
            <View style={styles.tagChipsRow}>
              {DEFAULT_TAG_PRESETS.map((tag) => {
                const clean = tag.slice(1);
                const isTagSelected = currentTags.includes(clean);

                return (
                  <Pressable
                    key={tag}
                    onPress={() => handleToggleTag(tag)}
                    style={[styles.tagChip, isTagSelected && styles.tagChipSelected]}
                  >
                    <Text style={[styles.tagChipText, isTagSelected && styles.tagChipTextSelected]}>
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
              pressed && styles.savePressablePressed,
              disabled && styles.savePressableDisabled,
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
