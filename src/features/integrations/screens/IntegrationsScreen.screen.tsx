import React from 'react';
import { Button, FormSection, StackScrollScreen } from '@/shared/components/ui';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader.component';
import { usePasteMessage } from '../hooks/usePasteMessage.hook';
import { useStatementImport } from '../hooks/useStatementImport.hook';
import { useIntegrationsLinks } from '../hooks/useIntegrationsLinks.hook';
import { PasteMessageForm } from '../components/PasteMessageForm.component';
import { StatementImportCard } from '../components/StatementImportCard.component';

/**
 * Pasted messages and statement files (plan T6.3): both go through the server's detection
 * pipeline; anything that needs a look waits in the same Review list as SMS detection.
 */
export function IntegrationsScreen() {
  const paste = usePasteMessage();
  const statement = useStatementImport();
  const links = useIntegrationsLinks();

  return (
    <StackScrollScreen header={<ProfileStackHeader screen="integrations" subtitle="Paste bank messages or import statements" />}>
      <FormSection title="Detected transactions" subtitle={links.pendingReviewCount ? `${links.pendingReviewCount} waiting for review` : 'Review, confirm and undo'}>
        <Button title="Review" onPress={links.openReview} />
        <Button title="History and undo" variant="outline" onPress={links.openHistory} />
      </FormSection>
      <PasteMessageForm {...paste} />
      <StatementImportCard
        fileName={statement.fileName}
        isPreviewing={statement.isPreviewing}
        summary={statement.summary}
        needsMapping={statement.needsMapping}
        canImport={statement.canImport}
        isImporting={statement.isImporting}
        result={statement.result}
        error={statement.error}
        onPick={statement.pick}
        onImport={statement.runImport}
      />
    </StackScrollScreen>
  );
}
