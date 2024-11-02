import { LoadingButton } from '@mui/lab';
import {
  Alert,
  Container,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import {
  AccountServiceErrorCode,
  LoginResponse,
} from 'chatapp.account-service-contracts';
import { ApiError } from 'chatapp.api-error';
import { Controller, useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import { PasswordField } from '@app/components/passwordField';
import { useAuthService } from '@app/hooks';

interface LoginFormState {
  username: string;
  password: string;
}

export const LoginForm = () => {
  const navigate = useNavigate();

  const { control, formState, handleSubmit } = useForm<LoginFormState>({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const authService = useAuthService();

  const { mutate, isPending, error } = useMutation<
    LoginResponse,
    ApiError<AccountServiceErrorCode>,
    LoginFormState
  >({
    mutationFn: (data) => authService.login(data),
    onSuccess: () => {
      navigate('/dashboard');
    },
  });

  const onSubmit = (data: LoginFormState) => {
    mutate(data);
  };

  return (
    <Container maxWidth="xs" sx={{ paddingTop: 2 }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Typography variant="h4" component="h1">
            Login
          </Typography>
          <Controller
            name="username"
            control={control}
            rules={{ required: 'Username is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                type="text"
                label="Username"
                helperText={formState.errors.username?.message}
                error={Boolean(formState.errors.username)}
              />
            )}
          />
          <Controller
            name="password"
            control={control}
            rules={{ required: 'Password is required' }}
            render={({ field }) => (
              <PasswordField
                {...field}
                label="Password"
                helperText={formState.errors.password?.message}
                error={Boolean(formState.errors.password)}
              />
            )}
          />
          <Link component={RouterLink} to="/forgot-password">
            <Typography variant="body2">Forgot Password?</Typography>
          </Link>
          <LoadingButton type="submit" loading={isPending} variant="contained">
            Login
          </LoadingButton>
          {error && <Alert severity="error">{error.message}</Alert>}
          <Typography variant="body2">
            Don't have an account?{' '}
            <Link component={RouterLink} to="/register">
              Register
            </Link>
          </Typography>
        </Stack>
      </form>
    </Container>
  );
};
