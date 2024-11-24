import { render } from '@testing-library/react';
import { describe, it } from 'vitest';

import { TestAppProvider } from '@app/testing/provider';

import { ResetPasswordForm } from './reset-password-form';

function renderComponent() {
  return render(<ResetPasswordForm />, { wrapper: TestAppProvider });
}

describe('<ResetPasswordForm>', () => {
  it('should render without crashing', () => {
    renderComponent();
  });
});
