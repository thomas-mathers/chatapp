import { faker } from '@faker-js/faker';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { byLabelText, byRole, byText } from 'testing-library-selector';
import { describe, expect, it } from 'vitest';

import { TestAppProvider } from '@app/testing/provider';

import { RegisterForm } from './register-form';

const ui = {
  username: byLabelText('Username'),
  usernameIsRequired: byText('Username is required'),
  email: byLabelText('Email'),
  emailIsRequired: byText('Email is required'),
  password: byLabelText('Password'),
  passwordIsRequired: byText('Password is required'),
  confirmPassword: byLabelText('Confirm Password'),
  confirmPasswordIsRequired: byText('Confirm password is required'),
  confirmPasswordDoesNotMatch: byText('Passwords must match'),
  submit: byRole('button', { name: 'Submit' }),
};

function renderComponent() {
  const user = userEvent.setup();
  return {
    ...render(<RegisterForm />, { wrapper: TestAppProvider }),
    user,
  };
}

describe('<RegisterForm>', () => {
  it('should render all expected fields', () => {
    renderComponent();

    expect(ui.username.get()).toBeVisible();
    expect(ui.email.get()).toBeVisible();
    expect(ui.password.get()).toBeVisible();
    expect(ui.confirmPassword.get()).toBeVisible();
    expect(ui.submit.get()).toBeVisible();
  });

  it('should display validation error when username is not provided', async () => {
    const { user } = renderComponent();

    await user.click(ui.submit.get());

    expect(ui.usernameIsRequired.get()).toBeVisible();
  });

  it('should display validation error when email is not provided', async () => {
    const { user } = renderComponent();

    await user.click(ui.submit.get());

    expect(ui.emailIsRequired.get()).toBeVisible();
  });

  it('should display validation error when password is not provided', async () => {
    const { user } = renderComponent();

    await user.click(ui.submit.get());

    expect(ui.passwordIsRequired.get()).toBeVisible();
  });

  it('should display validation error when confirm password is not provided', async () => {
    const { user } = renderComponent();

    await user.click(ui.submit.get());

    expect(ui.confirmPasswordIsRequired.get()).toBeVisible();
  });

  it('should display validation error when passwords do not match', async () => {
    const { user } = renderComponent();

    const newPassword = faker.internet.password();
    const confirmNewPassword = faker.internet.password();

    await user.type(ui.password.get(), newPassword);
    await user.type(ui.confirmPassword.get(), confirmNewPassword);

    await user.click(ui.submit.get());

    expect(ui.confirmPasswordDoesNotMatch.get()).toBeVisible();
  });
});
