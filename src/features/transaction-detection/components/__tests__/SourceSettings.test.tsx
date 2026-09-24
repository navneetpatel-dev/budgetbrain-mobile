import { describe, it, expect, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { AutoTrackingAlternativesCard } from '../settings/AutoTrackingAlternativesCard.component';
import { DetectionPausedNotice } from '../settings/DetectionPausedNotice.component';

// ThemeContext imports the Redux hooks (ESM react-redux, not transformed by jest-expo); use the
// real theme builder directly instead. (jest.mock is hoisted above the imports.)
jest.mock('@/shared/theme', () => {
  const { buildTheme } = jest.requireActual<typeof import('@/shared/theme/buildTheme')>('@/shared/theme/buildTheme');
  const { DEFAULT_ACCENT } = jest.requireActual<typeof import('@/shared/theme/palettes')>('@/shared/theme/palettes');
  const theme = buildTheme('light', DEFAULT_ACCENT, 'light');
  return { useTheme: () => theme };
});

describe('AutoTrackingAlternativesCard (T8.4)', () => {
  it('explains why and offers paste or import', async () => {
    const onPasteOrImport = jest.fn();
    await render(<AutoTrackingAlternativesCard reason="iPhones don't let apps read SMS." onPasteOrImport={onPasteOrImport} />);
    expect(screen.getByText("iPhones don't let apps read SMS.")).toBeTruthy();
    expect(screen.getByText('Import a statement')).toBeTruthy();
    await fireEvent.press(screen.getByText('Paste or Import'));
    expect(onPasteOrImport).toHaveBeenCalled();
  });
});

describe('DetectionPausedNotice (T9.3)', () => {
  it('says the rollout has not reached the account, or that detection is paused', async () => {
    const onPasteOrImport = jest.fn();
    await render(<DetectionPausedNotice rolledOut={false} onPasteOrImport={onPasteOrImport} />);
    expect(screen.getByText('Coming to your account soon')).toBeTruthy();
    await fireEvent.press(screen.getByText('Paste or Import'));
    expect(onPasteOrImport).toHaveBeenCalled();
    await render(<DetectionPausedNotice rolledOut onPasteOrImport={onPasteOrImport} />);
    expect(screen.getByText('Automatic detection is paused')).toBeTruthy();
  });
});
