import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { byLabelText, byRole } from 'testing-library-selector';
import { describe, expect, it } from 'vitest';

import { server } from '@app/testing/mocks/server';
import { TestAppProvider } from '@app/testing/provider';

import { LoginForm } from './login-form';

const ui = {
  username: byLabelText('Username'),
  password: byLabelText('Password'),
  submit: byRole('button', { name: 'Login' }),
};

function renderComponent() {
  const user = userEvent.setup();
  return {
    ...render(<LoginForm />, { wrapper: TestAppProvider }),
    user,
  };
}

describe('<LoginForm>', () => {
  it('should render all expected fields', () => {
    renderComponent();

    expect(ui.username.get()).toBeVisible();
    expect(ui.password.get()).toBeVisible();
    expect(ui.submit.get()).toBeVisible();
  });

  it('should display validation error when username is not provided', async () => {
    const { user } = renderComponent();

    await user.click(ui.submit.get());

    expect(ui.username.get()).toBeInvalid();
  });

  it('should display validation error when password is not provided', async () => {
    const { user } = renderComponent();

    await user.click(ui.submit.get());

    expect(ui.password.get()).toBeInvalid();
  });

  it('should display an error message when the username or password is incorrect', async () => {
    const errorMessage = 'Invalid username or password';

    server.use(
      http.post('/auth/login', () => {
        return HttpResponse.json({ message: errorMessage }, { status: 401 });
      }),
    );

    const { user } = renderComponent();

    await user.type(ui.username.get(), 'invalid-username');
    await user.type(ui.password.get(), 'invalid-password');

    await user.click(ui.submit.get());

    expect(await screen.findByText(errorMessage)).toBeVisible();
  });

  it('should display a success message when the login is successful', async () => {
    const successMessage = 'Login successful';

    const { user } = renderComponent();

    await user.type(ui.username.get(), 'valid-username');
    await user.type(ui.password.get(), 'valid-password');

    await user.click(ui.submit.get());

    expect(await screen.findByText(successMessage)).toBeVisible();
  });
});
