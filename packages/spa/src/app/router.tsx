import { createBrowserRouter } from 'react-router-dom';

import { ProtectedRoute } from '../components/protected-route';
import {
  ChangePasswordForm,
  ForgotPasswordForm,
  LoginForm,
  RegisterForm,
  ResetPasswordForm,
} from '../features/auth';
import { Dashboard } from '../features/dashboard';

export const router = createBrowserRouter(
  [
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
    {
      element: <ProtectedRoute />,
      children: [
        {
          path: '/change-password',
          element: <ChangePasswordForm />,
        },
        {
          path: '/dashboard',
          element: <Dashboard />,
        },
      ],
    },
  ],
  {
    future: {
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_relativeSplatPath: true,
      v7_skipActionErrorRevalidation: true,
    },
  },
);
