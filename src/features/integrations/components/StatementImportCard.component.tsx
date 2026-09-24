import React, { useMemo } from 'react';
import { Text } from 'react-native';
import { Button, FormErrorBanner, FormInfoBanner, FormSection, FormSuccessBanner } from '@/shared/components/ui';
import { useTheme } from '@/shared/theme';
import { createStyles } from './StatementImportCard.styles';

export interface StatementImportCardProps {
  fileName: string | null;
  isPreviewing: boolean;
  summary: string | null;
  needsMapping: boolean;
  canImport: boolean;
  isImporting: boolean;
  result: string | null;
  error: string | null;
  onPick: () => void;
  onImport: () => void;
}

/** Bank statement import with a preview first (plan T6.5). */
export function StatementImportCard(props: StatementImportCardProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <FormSection title="Import a statement" subtitle="CSV, OFX, QFX, QIF, MT940 or CAMT.053">
      <Button
        title={props.fileName ? 'Choose another file' : 'Choose statement file'}
        variant="outline"
        onPress={props.onPick}
        loading={props.isPreviewing}
      />
      {props.fileName ? <Text style={styles.fileName}>{props.fileName}</Text> : null}
      {props.summary ? <FormInfoBanner message={props.summary} /> : null}
      {props.needsMapping ? (
        <FormInfoBanner message="We couldn't recognise this CSV's columns. Import it from the web app, where you can choose them." />
      ) : null}
      {props.result ? <FormSuccessBanner message={props.result} /> : null}
      {props.error ? <FormErrorBanner message={props.error} /> : null}
      {props.canImport ? <Button title="Import" onPress={props.onImport} loading={props.isImporting} /> : null}
      <Text style={styles.hint}>Nothing is added until you press Import. Importing the same statement again adds nothing twice.</Text>
    </FormSection>
  );
}
