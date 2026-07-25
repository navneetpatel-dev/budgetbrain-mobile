import { Controller } from 'react-hook-form';
import { Button, Input, StackScrollScreen, GroupedCard, ListRow, FormSection, FormActions, FormErrorBanner, FormSuccessBanner, SupportSkeleton } from '@/shared/components/ui';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { useSupportTickets } from '@/features/support/hooks/useSupportTickets';
import { FieldLimits, maxLen, textRules, ValidationMessages } from '@/shared/validation/fieldLimits';

export default function SupportScreen() {
  const { loading, isLoading, tickets, control, handleSubmit, errors, onSubmit, submitError, submitSuccess } = useSupportTickets();

  return (
    <StackScrollScreen
      header={
        <ProfileStackHeader
          screen="support"
          subtitle="Describe your issue and we will get back to you"
        />
      }
    >
      {isLoading ? <SupportSkeleton /> : null}
      {!isLoading && (
        <>
          <FormSection title="New ticket" subtitle="We typically respond within 24 hours">
            {submitError ? <FormErrorBanner message={submitError} /> : null}
            {submitSuccess ? <FormSuccessBanner message={submitSuccess} /> : null}
            <Controller
              control={control}
              name="subject"
              rules={textRules('subject')}
              render={({ field: { onChange, value } }) => (
                <Input label="Subject" value={value} onChangeText={onChange} maxLength={maxLen('subject')} error={errors.subject?.message} leftIcon="support" placeholder="Brief summary of your issue" disabled={loading} />
              )}
            />
            <Controller
              control={control}
              name="message"
              rules={textRules('message')}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Message"
                  value={value}
                  onChangeText={onChange}
                  maxLength={maxLen('message')}
                  multiline
                  error={errors.message?.message}
                  placeholder="Describe what happened and how we can help..."
                  helperText={ValidationMessages.minChars(FieldLimits.message.min)}
                  disabled={loading}
                />
              )}
            />
            <FormActions primaryTitle="Submit Ticket" onPrimary={handleSubmit(onSubmit)} primaryLoading={loading} />
          </FormSection>

          {tickets.length > 0 && (
            <GroupedCard title="Your tickets">
              {tickets.map((t, i) => (
                <ListRow
                  key={t.id}
                  label={t.subject}
                  subtitle={t.status.replace('_', ' ')}
                  value={new Date(t.createdAt).toLocaleDateString()}
                  isLast={i === tickets.length - 1}
                />
              ))}
            </GroupedCard>
          )}
        </>
      )}
    </StackScrollScreen>
  );
}
