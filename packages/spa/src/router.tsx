import { createBrowserRouter } from 'react-router-dom';

import { ForgotPasswordForm } from './auth/components/ForgotPasswordForm';
import { LoginForm } from './auth/components/LoginForm';
import { RegisterForm } from './auth/components/RegisterForm';
import { ResetPasswordForm } from './auth/components/ResetPasswordForm';

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
