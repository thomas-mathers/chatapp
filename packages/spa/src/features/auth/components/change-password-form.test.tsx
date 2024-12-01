import { faker } from '@faker-js/faker';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { MemoryRouter } from 'react-router-dom';
import { byLabelText, byRole, byText } from 'testing-library-selector';
import { describe, expect, it } from 'vitest';

import { AppProvider } from '@app/app/provider';
import { server } from '@app/testing/mocks/server';

import { ChangePasswordForm } from './change-password-form';

const ui = {
  currentPassword: byLabelText('Current Password'),
  currentPaswordIsMissingError: byText('Current password is required'),
  newPassword: byLabelText('Password'),
  newPasswordIsMissingError: byText('Password is required'),
  confirmNewPassword: byLabelText('Confirm Password'),
  confirmNewPasswordIsMissingError: byText('Confirm password is required'),
  confirmNewPasswordDoesNotMatchError: byText('Passwords do not match'),
  submitButton: byRole('button', { name: 'Submit' }),
};

function renderComponent() {
  const user = userEvent.setup();

  return {
    user,
    ...render(
      <MemoryRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <ChangePasswordForm />
      </MemoryRouter>,
      { wrapper: AppProvider },
    ),
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

  it('should display validation error when current password is not provided', async () => {
    const { user } = renderComponent();

    await user.click(ui.submitButton.get());

    expect(ui.currentPaswordIsMissingError.get()).toBeVisible();
  });

  it('should display validation error when new password is not provided', async () => {
    const { user } = renderComponent();

    await user.click(ui.submitButton.get());

    expect(ui.newPasswordIsMissingError.get()).toBeVisible();
  });

  it('should display validation error when confirm new password is not provided', async () => {
    const { user } = renderComponent();

    await user.click(ui.submitButton.get());

    expect(ui.confirmNewPasswordIsMissingError.get()).toBeVisible();
  });

  it('should display validation error when passwords do not match', async () => {
    const { user } = renderComponent();

    const oldPassword = faker.internet.password();
    const newPassword = faker.internet.password();
    const confirmNewPassword = faker.internet.password();

    await user.type(ui.currentPassword.get(), oldPassword);
    await user.type(ui.newPassword.get(), newPassword);
    await user.type(ui.confirmNewPassword.get(), confirmNewPassword);

    await user.click(ui.submitButton.get());

    expect(ui.confirmNewPasswordDoesNotMatchError.get()).toBeVisible();
  });

  it('should display an error message if the current password is incorrect', async () => {
    const errorMessage = 'Password is incorrect';

    server.use(
      http.put('/auth/me/password', () => {
        return HttpResponse.json({ message: errorMessage }, { status: 401 });
      }),
    );

    const { user } = renderComponent();

    const oldPassword = faker.internet.password();
    const newPassword = faker.internet.password();
    const confirmNewPassword = newPassword;

    await user.type(ui.currentPassword.get(), oldPassword);
    await user.type(ui.newPassword.get(), newPassword);
    await user.type(ui.confirmNewPassword.get(), confirmNewPassword);

    await user.click(ui.submitButton.get());

    expect(await screen.findByText(errorMessage)).toBeVisible();
  });

  it('should display a success message if the password is updated successfully', async () => {
    const successMessage = 'Password changed successfully';

    const { user } = renderComponent();

    const oldPassword = faker.internet.password();
    const newPassword = faker.internet.password();
    const confirmNewPassword = newPassword;

    await user.type(ui.currentPassword.get(), oldPassword);
    await user.type(ui.newPassword.get(), newPassword);
    await user.type(ui.confirmNewPassword.get(), confirmNewPassword);

    await user.click(ui.submitButton.get());

    expect(await screen.findByText(successMessage)).toBeVisible();
  });
});
