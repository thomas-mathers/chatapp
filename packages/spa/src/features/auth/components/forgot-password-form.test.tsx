import { faker } from '@faker-js/faker';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { MemoryRouter } from 'react-router-dom';
import { byLabelText, byRole, byText } from 'testing-library-selector';
import { describe, expect, it } from 'vitest';

import { AppProvider } from '@app/app/provider';
import { server } from '@app/testing/mocks/server';

import { ForgotPasswordForm } from './forgot-password-form';

const ui = {
  email: byLabelText('Email'),
  emailIsMissing: byText('Email is required'),
  emailIsInvalid: byText('Email is invalid'),
  submit: byRole('button', { name: 'Submit' }),
};

function renderComponent() {
  const user = userEvent.setup();
  return {
    ...render(
      <MemoryRouter>
        <ForgotPasswordForm />
      </MemoryRouter>,
      { wrapper: AppProvider },
    ),
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

  it('should display error message when email is invalid', async () => {
    const { user } = renderComponent();

    await user.type(ui.email.get(), 'invalid-email');

    await user.click(ui.submit.get());

    expect(ui.emailIsInvalid.get()).toBeVisible();
  });

  it('should display error message when there is a backend error', async () => {
    const errorMessage = 'Internal Server Error';

    server.use(
      http.post('/auth/password-reset-requests', () => {
        return HttpResponse.json({ message: errorMessage }, { status: 500 });
      }),
    );

    const { user } = renderComponent();

    const email = faker.internet.email();

    await user.type(ui.email.get(), email);

    await user.click(ui.submit.get());

    expect(await screen.findByText(errorMessage)).toBeVisible();
  });

  it('should display success message when request is successful', async () => {
    const successMessage =
      'An email has been sent to you with instructions on how to reset your password.';

    const { user } = renderComponent();

    const email = faker.internet.email();

    await user.type(ui.email.get(), email);

    await user.click(ui.submit.get());

    expect(await screen.findByText(successMessage)).toBeVisible();
  });
});
