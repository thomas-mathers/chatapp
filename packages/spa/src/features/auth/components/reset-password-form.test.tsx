import { faker } from '@faker-js/faker';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { byLabelText, byRole, byText } from 'testing-library-selector';
import { describe, expect, it } from 'vitest';

import { server } from '@app/testing/mocks/server';
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

  it('should display an error message when there is a backend error', async () => {
    const errorMessage = 'Internal Server Error';

    server.use(
      http.post('/auth/password-resets', () => {
        return HttpResponse.json({ message: errorMessage }, { status: 500 });
      }),
    );

    const { user } = renderComponent();

    const newPassword = faker.internet.password();
    const confirmPassword = newPassword;

    await user.type(ui.newPassword.get(), newPassword);
    await user.type(ui.confirmPassword.get(), confirmPassword);

    await user.click(ui.submit.get());

    expect(await screen.findByText(errorMessage)).toBeVisible();
  });

  it('should display a success message when the password reset is successful', async () => {
    const successMessage = 'Password reset successful';

    const { user } = renderComponent();

    const newPassword = faker.internet.password();
    const confirmPassword = newPassword;

    await user.type(ui.newPassword.get(), newPassword);
    await user.type(ui.confirmPassword.get(), confirmPassword);

    await user.click(ui.submit.get());

    expect(await screen.findByText(successMessage)).toBeVisible();
  });
});
