import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
} from 'react-native';
import { useTheme } from '@/shared/theme';
import { AppIcon } from '@/features/navigation/components/AppIcon.component';
import { useScreenInsets, useBottomSafeInset } from '@/shared/hooks/useLayout.hook';
import {
  getStoredAppLockPin,
  setStoredAppLockPin,
  clearStoredAppLockPin,
  getPinLockoutSecondsRemaining,
  recordFailedPinAttempt,
  resetPinAttempts,
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
  onRetryBiometrics?: () => void;
  onSignOut?: () => void;
  allowEmptyPin?: boolean;
}

export function PinPadModal({
  visible,
  mode,
  onClose,
  onSuccess,
  onRetryBiometrics,
  onSignOut,
  allowEmptyPin = false,
}: PinPadModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const bottomSafe = useBottomSafeInset();
  const { paddingHorizontal } = useScreenInsets();
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
  /** Seconds remaining in an escalating lockout after repeated wrong-PIN guesses
   * (persisted in secure storage so it survives an app kill, not just this component). */
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  useEffect(() => {
    if (visible) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the modal's transient step/pin state on open; a key-remount restructure would need to touch both of this modal's call sites, an accepted tradeoff for one extra render pass in this security-sensitive flow.
      setStep(0);
      setPin('');
      setFirstPin('');
      setError(null);
      getPinLockoutSecondsRemaining().then(setLockoutSeconds);
    }
  }, [visible, mode]);

  const isLockedOut = lockoutSeconds > 0;

  useEffect(() => {
    if (!isLockedOut) return;
    const id = setInterval(() => {
      setLockoutSeconds((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [isLockedOut]);

  /** Verifies a 4-digit guess against the stored PIN, applying/clearing the lockout counter. */
  const verifyPin = useCallback(async (guess: string): Promise<boolean> => {
    const stored = await getStoredAppLockPin();
    if (stored === guess) {
      await resetPinAttempts();
      return true;
    }
    const seconds = await recordFailedPinAttempt();
    setLockoutSeconds(seconds);
    return false;
  }, []);

  const getTitle = () => {
    if (mode === 'unlock' && allowEmptyPin) return 'Unlock BudgetBrain';
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
    if (mode === 'unlock' && allowEmptyPin) {
      return 'No PIN is set. Try biometrics again, or sign out to recover access.';
    }
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
      if (pin.length >= 4 || lockoutSeconds > 0) return;
      const next = pin + digit;
      setPin(next);
      setError(null);

      if (next.length === 4) {
        // Evaluate completion of current step
        if (mode === 'unlock') {
          if (await verifyPin(next)) {
            onSuccess();
          } else {
            setError('Incorrect PIN. Try again.');
            setPin('');
          }
        } else if (mode === 'remove') {
          if (await verifyPin(next)) {
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
            if (await verifyPin(next)) {
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
    [pin, mode, step, firstPin, lockoutSeconds, verifyPin, dispatch, onSuccess, onClose],
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
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.sheetContainer,
            { marginHorizontal: paddingHorizontal, marginBottom: bottomSafe, paddingBottom: theme.spacing.lg },
          ]}
        >
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

          {lockoutSeconds > 0 ? (
            <Text style={styles.errorText}>
              Too many incorrect attempts. Try again in {lockoutSeconds}s.
            </Text>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          {(onRetryBiometrics || onSignOut) && (
            <View style={{ gap: 10, marginBottom: 16, alignItems: 'center' }}>
              {onRetryBiometrics && (
                <Pressable onPress={onRetryBiometrics} style={styles.retryBtn}>
                  <Text style={styles.actionText}>Try biometrics again</Text>
                </Pressable>
              )}
              {onSignOut && (
                <Pressable onPress={onSignOut} style={styles.retryBtn}>
                  <Text style={styles.actionText}>Sign out</Text>
                </Pressable>
              )}
            </View>
          )}

          {!allowEmptyPin && (
          <>
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
          <View style={[styles.keypadGrid, lockoutSeconds > 0 && { opacity: 0.4 }]}>
            <View style={styles.keypadRow}>
              {['1', '2', '3'].map((d) => (
                <Pressable
                  key={d}
                  onPress={() => handleDigit(d)}
                  disabled={lockoutSeconds > 0}
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
                  disabled={lockoutSeconds > 0}
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
                  disabled={lockoutSeconds > 0}
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
                disabled={lockoutSeconds > 0}
                style={({ pressed }) => [
                  styles.keyButton,
                  pressed && styles.keyButtonPressed,
                ]}
              >
                <Text style={styles.actionText}>Clear</Text>
              </Pressable>

              <Pressable
                onPress={() => handleDigit('0')}
                disabled={lockoutSeconds > 0}
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
          </>
          )}
        </View>
      </View>
    </Modal>
  );
}
