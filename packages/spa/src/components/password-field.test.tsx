import { TextFieldProps } from '@mui/material/TextField';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { vi } from 'vitest';

import { PasswordField } from './password-field';

function renderComponent(props: TextFieldProps = {}) {
  const user = userEvent.setup();
  return {
    ...render(<PasswordField {...props} label="Password" />),
    user,
  };
}

const ui = {
  textbox: () => screen.getByLabelText('Password'),
  togglePasswordButton: () => screen.getByRole('button'),
};

describe('<PasswordField>', () => {
  it('should render the supplied password', () => {
    const value = '123456';

    renderComponent({ value });

    expect(screen.getByDisplayValue(value)).toBeVisible();
  });

  it('should toggle the password visibility', async () => {
    const { user } = renderComponent();

    const textbox = ui.textbox();
    const togglePasswordButton = ui.togglePasswordButton();

    expect(textbox).toHaveAttribute('type', 'password');
    expect(togglePasswordButton).toHaveAttribute(
      'aria-label',
      'password hidden',
    );

    await user.click(togglePasswordButton);

    expect(textbox).toHaveAttribute('type', 'text');
    expect(togglePasswordButton).toHaveAttribute(
      'aria-label',
      'password visible',
    );
  });

  it('should call the onChange handler', async () => {
    const onChange = vi.fn();

    const { user } = renderComponent({ onChange });

    const textbox = ui.textbox();

    await user.type(textbox, '123456');

    expect(onChange).toHaveBeenCalledTimes(6);
  });
});
