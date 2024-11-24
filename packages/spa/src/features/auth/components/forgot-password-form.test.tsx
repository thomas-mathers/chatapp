import { render } from '@testing-library/react';
import { describe, it } from 'vitest';

import { TestAppProvider } from '@app/testing/provider';

import { ForgotPasswordForm } from './forgot-password-form';

function renderComponent() {
  return render(<ForgotPasswordForm />, { wrapper: TestAppProvider });
}

describe('<ForgotPasswordForm>', () => {
  it('should render without crashing', () => {
    renderComponent();
  });
});
