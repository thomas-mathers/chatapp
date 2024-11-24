import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { byLabelText, byRole, byText } from 'testing-library-selector';
import { describe, expect, it } from 'vitest';

import { TestAppProvider } from '@app/testing/provider';

import { ForgotPasswordForm } from './forgot-password-form';

const ui = {
  email: byLabelText('Email'),
  emailIsMissing: byText('Email is required'),
  submit: byRole('button', { name: 'Submit' }),
};

function renderComponent() {
  const user = userEvent.setup();
  return {
    ...render(<ForgotPasswordForm />, { wrapper: TestAppProvider }),
    user,
  };
}

describe('<ForgotPasswordForm>', () => {
  it('should render all expected fields', () => {
    renderComponent();

    expect(ui.email.get()).toBeVisible();
    expect(ui.submit.get()).toBeVisible();
  });

  it('should display error message when email is not provided', async () => {
    const { user } = renderComponent();

    await user.click(ui.submit.get());

    expect(ui.emailIsMissing.get()).toBeVisible();
  });
});
