import { describe, it, expect, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { TemplateLearningRow } from '../settings/TemplateLearningRow.component';

// ThemeContext imports the Redux hooks (ESM react-redux, not transformed by jest-expo); use the
// real theme builder directly instead. (jest.mock is hoisted above the imports.)
jest.mock('@/shared/theme', () => {
  const { buildTheme } = jest.requireActual<typeof import('@/shared/theme/buildTheme')>('@/shared/theme/buildTheme');
  const { DEFAULT_ACCENT } = jest.requireActual<typeof import('@/shared/theme/palettes')>('@/shared/theme/palettes');
  const theme = buildTheme('light', DEFAULT_ACCENT, 'light');
  return { useTheme: () => theme };
});

describe('TemplateLearningRow (T7.4, D-5)', () => {
  it('explains what is shared and reports the new value', async () => {
    const onToggle = jest.fn();
    await render(<TemplateLearningRow value={false} disabled={false} onToggle={onToggle} />);
    expect(screen.getByText('Help Improve Detection')).toBeTruthy();
    expect(screen.getByText(/Never the message itself/)).toBeTruthy();
    const toggle = screen.getByLabelText('Help improve detection');
    expect(toggle.props.value).toBe(false);
    await fireEvent(toggle, 'valueChange', true);
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('is disabled until the server setting is known', async () => {
    await render(<TemplateLearningRow value={false} disabled onToggle={jest.fn()} />);
    expect(screen.getByLabelText('Help improve detection').props.disabled).toBe(true);
  });
});
