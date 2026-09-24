import { describe, it, expect, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { AppNotificationsRow } from '../settings/AppNotificationsRow.component';
import { AutoTrackingAlternativesCard } from '../settings/AutoTrackingAlternativesCard.component';

// ThemeContext imports the Redux hooks (ESM react-redux, not transformed by jest-expo); use the
// real theme builder directly instead. (jest.mock is hoisted above the imports.)
jest.mock('@/shared/theme', () => {
  const { buildTheme } = jest.requireActual<typeof import('@/shared/theme/buildTheme')>('@/shared/theme/buildTheme');
  const { DEFAULT_ACCENT } = jest.requireActual<typeof import('@/shared/theme/palettes')>('@/shared/theme/palettes');
  const theme = buildTheme('light', DEFAULT_ACCENT, 'light');
  return { useTheme: () => theme };
});

describe('AppNotificationsRow (T8.1)', () => {
  it('reports the toggle and asks for access only while on without it', async () => {
    const onToggle = jest.fn();
    const onOpenSettings = jest.fn();
    await render(<AppNotificationsRow enabled={false} accessGranted={false} onToggle={onToggle} onOpenSettings={onOpenSettings} />);
    expect(screen.queryByText('Open Settings')).toBeNull();
    await fireEvent(screen.getByLabelText('Bank app notifications'), 'valueChange', true);
    expect(onToggle).toHaveBeenCalledWith(true);

    await render(<AppNotificationsRow enabled accessGranted={false} onToggle={onToggle} onOpenSettings={onOpenSettings} />);
    await fireEvent.press(screen.getByText('Open Settings'));
    expect(onOpenSettings).toHaveBeenCalled();

    await render(<AppNotificationsRow enabled accessGranted onToggle={onToggle} onOpenSettings={onOpenSettings} />);
    expect(screen.queryByText('Open Settings')).toBeNull();
  });
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
