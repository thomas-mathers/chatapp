import { createBrowserRouter } from 'react-router-dom';

import { ForgotPasswordForm } from './features/auth/components/ForgotPasswordForm';
import { LoginForm } from './features/auth/components/LoginForm';
import { RegisterForm } from './features/auth/components/RegisterForm';
import { ResetPasswordForm } from './features/auth/components/ResetPasswordForm';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginForm />,
  },
  {
    path: '/register',
    element: <RegisterForm />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordForm />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordForm />,
  },
]);
