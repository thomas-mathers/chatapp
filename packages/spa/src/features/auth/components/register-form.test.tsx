import { render } from '@testing-library/react';
import { describe, it } from 'vitest';

import { TestAppProvider } from '@app/testing/provider';

import { RegisterForm } from './register-form';

function renderComponent() {
  return render(<RegisterForm />, { wrapper: TestAppProvider });
}

describe('<RegisterForm>', () => {
  it('should render without crashing', () => {
    renderComponent();
  });
});
