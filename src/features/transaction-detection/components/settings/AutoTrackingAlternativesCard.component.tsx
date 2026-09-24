import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/shared/theme';
import { createStyles } from './AutoTrackingAlternativesCard.styles';

export interface AutoTrackingAlternativesCardProps {
  /** Why automatic tracking isn't available, e.g. on iPhone. */
  reason: string;
  onPasteOrImport: () => void;
}

/**
 * Where the phone can't read bank SMS or notifications (iOS, plan T8.4): explains why and offers
 * the ways that work everywhere, pasting a bank message or importing a statement file.
 */
export function AutoTrackingAlternativesCard({ reason, onPasteOrImport }: AutoTrackingAlternativesCardProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Automatic SMS Tracking</Text>
      <Text style={styles.body}>{reason}</Text>
      <View style={styles.option}>
        <Text style={styles.optionTitle}>Paste a bank message</Text>
        <Text style={styles.optionDesc}>Copy an SMS or email alert and paste it; the amount, date and merchant are read for you.</Text>
      </View>
      <View style={styles.option}>
        <Text style={styles.optionTitle}>Import a statement</Text>
        <Text style={styles.optionDesc}>CSV, OFX, QIF, MT940 or CAMT.053 from your bank&apos;s website. Repeated imports add nothing twice.</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={onPasteOrImport} accessibilityRole="button" activeOpacity={0.8}>
        <Text style={styles.buttonText}>Paste or Import</Text>
      </TouchableOpacity>
    </View>
  );
}
