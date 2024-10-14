import { createBrowserRouter } from 'react-router-dom';

import {
  ForgotPasswordForm,
  LoginForm,
  RegisterForm,
  ResetPasswordForm,
} from './features/auth';

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
