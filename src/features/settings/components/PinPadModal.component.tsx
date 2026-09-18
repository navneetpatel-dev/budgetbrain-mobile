import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
} from 'react-native';
import { useTheme } from '@/shared/theme';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import {
  getStoredAppLockPin,
  setStoredAppLockPin,
  clearStoredAppLockPin,
} from '@/shared/services/secureStorage';
import { useAppDispatch } from '@/shared/store/hooks';
import { setAppLockPin } from '@/shared/store/settingsSlice';
import { createStyles } from './PinPadModal.styles';

export type PinPadMode = 'set' | 'change' | 'remove' | 'unlock';

export interface PinPadModalProps {
  visible: boolean;
  mode: PinPadMode;
  onClose: () => void;
  onSuccess: () => void;
}

export function PinPadModal({
  visible,
  mode,
  onClose,
  onSuccess,
}: PinPadModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useAppDispatch();

  // Step tracking for multi-step modes
  // 'set': step 0 = enter new, step 1 = confirm new
  // 'change': step 0 = enter current, step 1 = enter new, step 2 = confirm new
  // 'remove': step 0 = enter current
  // 'unlock': step 0 = enter current
  const [step, setStep] = useState(0);
  const [pin, setPin] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setStep(0);
      setPin('');
      setFirstPin('');
      setError(null);
    }
  }, [visible, mode]);

  const getTitle = () => {
    if (mode === 'unlock') return 'Enter PIN to Unlock';
    if (mode === 'remove') return 'Enter Current PIN';
    if (mode === 'set') {
      return step === 0 ? 'Create 4-Digit PIN' : 'Confirm Your PIN';
    }
    if (mode === 'change') {
      if (step === 0) return 'Enter Current PIN';
      if (step === 1) return 'Enter New PIN';
      return 'Confirm New PIN';
    }
    return 'App Lock PIN';
  };

  const getSubtitle = () => {
    if (mode === 'unlock') return 'Enter your 4-digit code to access BudgetBrain';
    if (mode === 'remove') return 'Confirm your identity to disable app PIN';
    if (mode === 'set') {
      return step === 0
        ? 'Choose a 4-digit passcode for app security'
        : 'Re-enter the same 4-digit passcode';
    }
    if (mode === 'change') {
      if (step === 0) return 'Verify your current passcode';
      if (step === 1) return 'Choose a new 4-digit passcode';
      return 'Re-enter your new passcode';
    }
    return '';
  };

  const handleDigit = useCallback(
    async (digit: string) => {
      if (pin.length >= 4) return;
      const next = pin + digit;
      setPin(next);
      setError(null);

      if (next.length === 4) {
        // Evaluate completion of current step
        if (mode === 'unlock') {
          const stored = await getStoredAppLockPin();
          if (stored === next) {
            onSuccess();
          } else {
            setError('Incorrect PIN. Try again.');
            setPin('');
          }
        } else if (mode === 'remove') {
          const stored = await getStoredAppLockPin();
          if (stored === next) {
            await clearStoredAppLockPin();
            dispatch(setAppLockPin(null));
            onSuccess();
            onClose();
          } else {
            setError('Incorrect PIN.');
            setPin('');
          }
        } else if (mode === 'set') {
          if (step === 0) {
            setFirstPin(next);
            setPin('');
            setStep(1);
          } else {
            if (next === firstPin) {
              await setStoredAppLockPin(next);
              dispatch(setAppLockPin('configured'));
              onSuccess();
              onClose();
            } else {
              setError('PINs did not match. Start again.');
              setFirstPin('');
              setPin('');
              setStep(0);
            }
          }
        } else if (mode === 'change') {
          if (step === 0) {
            const stored = await getStoredAppLockPin();
            if (stored === next) {
              setPin('');
              setStep(1);
            } else {
              setError('Incorrect PIN.');
              setPin('');
            }
          } else if (step === 1) {
            setFirstPin(next);
            setPin('');
            setStep(2);
          } else {
            if (next === firstPin) {
              await setStoredAppLockPin(next);
              dispatch(setAppLockPin('configured'));
              onSuccess();
              onClose();
            } else {
              setError('PINs did not match. Start again.');
              setFirstPin('');
              setPin('');
              setStep(1);
            }
          }
        }
      }
    },
    [pin, mode, step, firstPin, dispatch, onSuccess, onClose],
  );

  const handleBackspace = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      setError(null);
    }
  };

  const handleClear = () => {
    setPin('');
    setError(null);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          <View style={styles.dragHandle} />

          {mode !== 'unlock' && (
            <Pressable
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityLabel="Close"
            >
              <AppIcon name="close" size={16} color={theme.colors.textSecondary} />
            </Pressable>
          )}

          <Text style={styles.title}>{getTitle()}</Text>
          <Text style={styles.subtitle}>{getSubtitle()}</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Dots Indicator */}
          <View style={styles.dotsContainer}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i < pin.length && styles.dotFilled,
                ]}
              />
            ))}
          </View>

          {/* Keypad Grid */}
          <View style={styles.keypadGrid}>
            <View style={styles.keypadRow}>
              {['1', '2', '3'].map((d) => (
                <Pressable
                  key={d}
                  onPress={() => handleDigit(d)}
                  style={({ pressed }) => [
                    styles.keyButton,
                    pressed && styles.keyButtonPressed,
                  ]}
                >
                  <Text style={styles.keyText}>{d}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.keypadRow}>
              {['4', '5', '6'].map((d) => (
                <Pressable
                  key={d}
                  onPress={() => handleDigit(d)}
                  style={({ pressed }) => [
                    styles.keyButton,
                    pressed && styles.keyButtonPressed,
                  ]}
                >
                  <Text style={styles.keyText}>{d}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.keypadRow}>
              {['7', '8', '9'].map((d) => (
                <Pressable
                  key={d}
                  onPress={() => handleDigit(d)}
                  style={({ pressed }) => [
                    styles.keyButton,
                    pressed && styles.keyButtonPressed,
                  ]}
                >
                  <Text style={styles.keyText}>{d}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.keypadRow}>
              <Pressable
                onPress={handleClear}
                style={({ pressed }) => [
                  styles.keyButton,
                  pressed && styles.keyButtonPressed,
                ]}
              >
                <Text style={styles.actionText}>Clear</Text>
              </Pressable>

              <Pressable
                onPress={() => handleDigit('0')}
                style={({ pressed }) => [
                  styles.keyButton,
                  pressed && styles.keyButtonPressed,
                ]}
              >
                <Text style={styles.keyText}>0</Text>
              </Pressable>

              <Pressable
                onPress={handleBackspace}
                style={({ pressed }) => [
                  styles.keyButton,
                  pressed && styles.keyButtonPressed,
                ]}
              >
                <AppIcon name="arrowLeft" size={20} color={theme.colors.text} />
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
