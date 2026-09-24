import React, { useMemo } from 'react';
import { Text } from 'react-native';
import {
  Button,
  FormErrorBanner,
  FormInfoBanner,
  FormSection,
  FormSuccessBanner,
  Input,
  OptionChipList,
  OptionChips,
} from '@/shared/components/ui';
import { useTheme } from '@/shared/theme';
import type { PasteKind } from '../types/ingest.types';
import type { Tone } from '../utils/ingestMessages';
import { createStyles } from './PasteMessageForm.styles';

export interface PasteMessageFormProps {
  kind: PasteKind;
  text: string;
  sender: string;
  subject: string;
  needsBank: boolean;
  institutionId: string;
  institutionItems: { id: string; label: string }[];
  isSubmitting: boolean;
  outcome: { tone: Tone; text: string } | null;
  error: string | null;
  setKind: (kind: PasteKind) => void;
  setText: (text: string) => void;
  setSender: (text: string) => void;
  setSubject: (text: string) => void;
  setInstitutionId: (id: string) => void;
  submit: () => void;
}

const KIND_LABELS: Record<PasteKind, string> = { sms: 'Bank SMS', email: 'Bank email' };
const kindLabel = (kind: PasteKind) => KIND_LABELS[kind];

/** Paste a bank SMS or email (plan T6.2). It is read on our server and not kept. */
export function PasteMessageForm(props: PasteMessageFormProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isEmail = props.kind === 'email';
  return (
    <FormSection title="Add from a message" subtitle="Paste a transaction alert from your bank">
      <OptionChips<PasteKind> options={['sms', 'email']} value={props.kind} onChange={props.setKind} getLabel={kindLabel} />
      <Input
        label={isEmail ? 'From address' : 'Sender (optional)'}
        value={props.sender}
        onChangeText={props.setSender}
        placeholder={isEmail ? 'alerts@yourbank.com' : 'e.g. VM-HDFCBK'}
        autoCapitalize="none"
      />
      {isEmail ? <Input label="Subject" value={props.subject} onChangeText={props.setSubject} placeholder="Optional" /> : null}
      <Input
        label={isEmail ? 'Email text' : 'Message'}
        value={props.text}
        onChangeText={props.setText}
        multiline
        maxLength={20000}
        placeholder="Paste the bank's message here"
      />
      {props.needsBank ? (
        <>
          <FormInfoBanner message="We couldn't tell which bank sent this. Pick the bank and try again." />
          <OptionChipList items={props.institutionItems} selectedId={props.institutionId} onSelect={props.setInstitutionId} />
        </>
      ) : null}
      {props.outcome?.tone === 'success' ? <FormSuccessBanner message={props.outcome.text} /> : null}
      {props.outcome?.tone === 'info' ? <FormInfoBanner message={props.outcome.text} /> : null}
      {props.outcome?.tone === 'error' ? <FormErrorBanner message={props.outcome.text} /> : null}
      {props.error ? <FormErrorBanner message={props.error} /> : null}
      <Button title="Read message" onPress={props.submit} loading={props.isSubmitting} disabled={!props.text.trim()} />
      <Text style={styles.privacy}>
        We read the amount, date, merchant, the last digits of the account and the reference. The message itself is not stored.
      </Text>
    </FormSection>
  );
}
