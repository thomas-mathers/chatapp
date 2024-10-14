import { createBrowserRouter } from 'react-router-dom';

import { ProtectedRoute } from './components/ProtectedRoute';
import {
  ChangePasswordForm,
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
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/change-password',
        element: <ChangePasswordForm />,
      },
      {
        path: '/dashboard',
        element: <div>Dashboard</div>,
      },
    ],
  },
]);
