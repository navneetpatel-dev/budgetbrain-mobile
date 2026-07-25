import { StackScrollScreen, FormSection, FormActions, Button, DateInput } from '@/shared/components/ui';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { useExportReports } from '@/features/reports/hooks/useExportReports';

export default function ReportsScreen() {
  const { startDate, setStartDate, endDate, setEndDate, loading, downloadCsv, downloadPdf } = useExportReports();

  return (
    <StackScrollScreen
      header={
        <ProfileStackHeader
          screen="reports"
          subtitle="Download your transaction history as CSV or PDF"
        />
      }
    >
      <FormSection title="Date range" subtitle="Leave empty to export all transactions">
        <DateInput label="Start date" value={startDate} onChange={setStartDate} disabled={loading} />
        <DateInput label="End date" value={endDate} onChange={setEndDate} disabled={loading} />
      </FormSection>

      <FormSection title="Download">
        <FormActions primaryTitle="Download CSV" onPrimary={downloadCsv} primaryLoading={loading} />
        <Button title="Download PDF" onPress={downloadPdf} variant="outline" loading={loading} />
      </FormSection>
    </StackScrollScreen>
  );
}
