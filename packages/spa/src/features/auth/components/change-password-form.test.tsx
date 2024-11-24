import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { byLabelText, byRole, byText } from 'testing-library-selector';
import { describe, expect, it } from 'vitest';

import { TestAppProvider } from '@app/testing/provider';

import { ChangePasswordForm } from './change-password-form';

const ui = {
  currentPassword: byLabelText('Current Password'),
  currentPaswordIsMissingError: byText('Current Password is required'),
  newPassword: byLabelText('Password'),
  newPasswordIsMissingError: byText('Password is required'),
  confirmNewPassword: byLabelText('Confirm Password'),
  confirmNewPasswordIsMissingError: byText('Confirm Password is required'),
  confirmNewPasswordDoesNotMatchError: byText('New passwords do not match'),
  submitButton: byRole('button', { name: 'Submit' }),
};

function renderComponent() {
  const user = userEvent.setup();

  return {
    user,
    ...render(<ChangePasswordForm />, { wrapper: TestAppProvider }),
  };
}

describe('<ChangePasswordForm>', () => {
  it('should render all expected fields', async () => {
    renderComponent();

    expect(ui.currentPassword.get()).toBeVisible();
    expect(ui.newPassword.get()).toBeVisible();
    expect(ui.confirmNewPassword.get()).toBeVisible();
    expect(ui.submitButton.get()).toBeVisible();
  });

  it('should display validation errors when fields are empty', async () => {
    const { user } = renderComponent();

    await user.click(ui.submitButton.get());

    expect(ui.currentPaswordIsMissingError.get()).toBeVisible();
    expect(ui.newPasswordIsMissingError.get()).toBeVisible();
    expect(ui.confirmNewPasswordIsMissingError.get()).toBeVisible();
  });
});
