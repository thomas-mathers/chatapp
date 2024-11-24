import { render } from '@testing-library/react';
import { describe, it } from 'vitest';

import { TestAppProvider } from '@app/testing/provider';

import { LoginForm } from './login-form';

function renderComponent() {
  return render(<LoginForm />, { wrapper: TestAppProvider });
}

describe('<LoginForm>', () => {
  it('should render without crashing', () => {
    renderComponent();
  });
});
