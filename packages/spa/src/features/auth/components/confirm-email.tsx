import { useQuery } from '@tanstack/react-query';
import { Navigate, useSearchParams } from 'react-router-dom';

import { useAuthService } from '@app/hooks';

export const ConfirmEmail = () => {
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');

  const authService = useAuthService();

  const { status } = useQuery({
    queryKey: ['confirm-email', token],
    queryFn: async () => {
      await authService.confirmEmail({ token: token! });
      return {};
    },
  });

  if (status === 'pending') {
    return <div>Confirming email...</div>;
  }

  if (status === 'error') {
    return <div>Failed to confirm email</div>;
  }

  return <Navigate to="/" replace />;
};
