import { useEffect, useMemo, useRef } from 'react';
import { Text, TextInput, View, type NativeSyntheticEvent, type TextInputKeyPressEventData,  } from 'react-native';
import { useTheme } from '@/shared/theme';
import { createStyles } from './OtpInput.styles';

const OTP_LENGTH = 6;

function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

export function OtpInput({
  label = 'Verification code',
  value,
  onChange,
  onComplete,
  error,
  disabled,
  autoFocus,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (code: string) => void;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const inputsRef = useRef<Array<TextInput | null>>([]);
  const digits = useMemo(() => {
    const chars = onlyDigits(value).slice(0, OTP_LENGTH).split('');
    while (chars.length < OTP_LENGTH) chars.push('');
    return chars;
  }, [value]);

  useEffect(() => {
    if (!autoFocus || disabled) return;
    const t = setTimeout(() => inputsRef.current[0]?.focus(), 50);
    return () => clearTimeout(t);
  }, [autoFocus, disabled]);

  const focusAt = (index: number) => {
    inputsRef.current[Math.max(0, Math.min(OTP_LENGTH - 1, index))]?.focus();
  };

  const applyBulk = (raw: string, startIndex = 0) => {
    const incoming = onlyDigits(raw);
    if (!incoming) return;
    const next = [...digits];
    let cursor = startIndex;
    for (const ch of incoming) {
      if (cursor >= OTP_LENGTH) break;
      next[cursor] = ch;
      cursor += 1;
    }
    const code = next.join('').slice(0, OTP_LENGTH);
    onChange(code);
    focusAt(Math.min(cursor, OTP_LENGTH - 1));
    if (code.length === OTP_LENGTH && onComplete) {
      onComplete(code);
    }
  };

  const onChangeText = (index: number, text: string) => {
    if (disabled) return;
    // Autofill / paste often arrives as the full code in one box.
    if (text.length > 1) {
      applyBulk(text, index === 0 ? 0 : index);
      return;
    }
    const digit = onlyDigits(text).slice(-1);
    const next = [...digits];
    next[index] = digit;
    const code = next.join('').slice(0, OTP_LENGTH);
    onChange(code);
    if (digit) {
      if (index < OTP_LENGTH - 1) {
        focusAt(index + 1);
      }
      if (code.length === OTP_LENGTH && onComplete) {
        onComplete(code);
      }
    }
  };

  const onKeyPress = (
    index: number,
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
  ) => {
    if (disabled) return;
    const key = e.nativeEvent.key;
    if (key === 'Backspace' || key === 'Delete') {
      const next = [...digits];
      if (next[index]) {
        // Current box has digit: clear it and move to previous box
        next[index] = '';
        onChange(next.join(''));
        if (index > 0) {
          focusAt(index - 1);
        }
      } else if (index > 0) {
        // Current box is empty: clear previous box and focus it
        next[index - 1] = '';
        onChange(next.join(''));
        focusAt(index - 1);
      }
      return;
    }

    if (key === 'ArrowLeft' && index > 0) {
      focusAt(index - 1);
    } else if (key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      focusAt(index + 1);
    }
  };

  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.row}>
        {digits.map((digit, index) => (
          <TextInput
            key={index}
            ref={(el) => { inputsRef.current[index] = el; }}
            value={digit}
            onChangeText={(text) => onChangeText(index, text)}
            onKeyPress={(e) => onKeyPress(index, e)}
            keyboardType="number-pad"
            textContentType={index === 0 ? 'oneTimeCode' : 'none'}
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            maxLength={OTP_LENGTH}
            editable={!disabled}
            selectTextOnFocus
            style={[
              styles.box,
              !!digit && styles.boxFilled,
              !!error && styles.boxError,
            ]}
            accessibilityLabel={`Digit ${index + 1} of ${OTP_LENGTH}`}
          />
        ))}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}
