import { LoadingButton } from '@mui/lab';
import { Alert, Link, Stack, TextField, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { LoginResponse } from 'chatapp.account-service-contracts';
import { Controller, useForm } from 'react-hook-form';
import { Link as RouterLink } from 'react-router-dom';

import { useAuthService } from '../../../hooks/useAuthService';

interface LoginFormState {
  username: string;
  password: string;
}

export const LoginForm = () => {
  const { control, formState, handleSubmit } = useForm<LoginFormState>({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const authService = useAuthService();

  const { mutate, isPending, error } = useMutation<
    LoginResponse,
    Error,
    LoginFormState
  >({
    mutationFn: (data) => authService.login(data),
  });

  const onSubmit = (data: LoginFormState) => {
    mutate(data);
  };

  return (
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
            <TextField
              {...field}
              type="password"
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
  );
};