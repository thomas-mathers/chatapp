import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { byLabelText, byRole } from 'testing-library-selector';
import { describe, expect, it } from 'vitest';

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
});
