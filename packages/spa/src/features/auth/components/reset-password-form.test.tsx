import { faker } from '@faker-js/faker';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { byLabelText, byRole, byText } from 'testing-library-selector';
import { describe, expect, it } from 'vitest';

import { TestAppProvider } from '@app/testing/provider';

import { ResetPasswordForm } from './reset-password-form';

const ui = {
  newPassword: byLabelText('Password'),
  newPasswordIsRequired: byText('Password is required'),
  confirmPassword: byLabelText('Confirm Password'),
  confirmPasswordIsRequired: byText('Confirm password is required'),
  confirmPasswordDoesNotMatch: byText('Passwords must match'),
  submit: byRole('button', { name: 'Submit' }),
};

function renderComponent() {
  const user = userEvent.setup();

  return {
    user,
    ...render(<ResetPasswordForm />, { wrapper: TestAppProvider }),
  };
}

describe('<ResetPasswordForm>', () => {
  it('should render all expected fields', () => {
    renderComponent();

    expect(ui.newPassword.get()).toBeVisible();
    expect(ui.confirmPassword.get()).toBeVisible();
    expect(ui.submit.get()).toBeVisible();
  });

  it('should display validation error when new password is not provided', async () => {
    const { user } = renderComponent();

    await user.click(ui.submit.get());

    expect(ui.newPasswordIsRequired.get()).toBeVisible();
  });

  it('should display validation error when confirm password is not provided', async () => {
    const { user } = renderComponent();

    await user.click(ui.submit.get());

    expect(ui.confirmPasswordIsRequired.get()).toBeVisible();
  });

  it('should display validation error when confirm password does not match new password', async () => {
    const { user } = renderComponent();

    const newPassword = faker.internet.password();
    const confirmPassword = faker.internet.password();

    await user.type(ui.newPassword.get(), newPassword);
    await user.type(ui.confirmPassword.get(), confirmPassword);

    await user.click(ui.submit.get());

    expect(ui.confirmPasswordDoesNotMatch.get()).toBeVisible();
  });
});
