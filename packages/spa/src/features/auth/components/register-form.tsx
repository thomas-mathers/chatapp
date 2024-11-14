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
  AccountRegistrationRequest,
  AccountSummary,
} from 'chatapp.account-service-contracts';
import { ApiError } from 'chatapp.api-error';
import { Controller, useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import { PasswordField } from '@app/components/password-field';
import { useAccountService } from '@app/hooks';

interface RegisterFormState {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
}

export const RegisterForm = () => {
  const navigate = useNavigate();

  const { control, formState, handleSubmit } = useForm<RegisterFormState>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      username: '',
    },
  });

  const accountService = useAccountService();

  const { mutate, isPending, error } = useMutation<
    AccountSummary,
    ApiError,
    AccountRegistrationRequest
  >({
    mutationFn: (data) => accountService.createAccount(data),
    onSuccess: () => {
      navigate('/');
    },
  });

  const onSubmit = (data: RegisterFormState) => {
    mutate(data);
  };

  return (
    <Container maxWidth="xs" sx={{ paddingTop: 2 }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Typography variant="h4" component="h1">
            Register
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
            name="email"
            control={control}
            rules={{ required: 'Email is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                type="email"
                label="Email"
                helperText={formState.errors.email?.message}
                error={Boolean(formState.errors.email)}
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
                type="password"
                label="Password"
                helperText={formState.errors.password?.message}
                error={Boolean(formState.errors.password)}
              />
            )}
          />
          <Controller
            name="confirmPassword"
            control={control}
            rules={{
              required: 'Confirm Password is required',
            }}
            render={({ field }) => (
              <PasswordField
                {...field}
                type="password"
                label="Confirm Password"
                helperText={formState.errors.confirmPassword?.message}
                error={Boolean(formState.errors.confirmPassword)}
              />
            )}
          />
          <LoadingButton type="submit" loading={isPending} variant="contained">
            Submit
          </LoadingButton>
          {error && <Alert severity="error">{error.message}</Alert>}
          <Typography variant="body2">
            Already have an account?{' '}
            <Link component={RouterLink} to="/">
              Login
            </Link>
          </Typography>
        </Stack>
      </form>
    </Container>
  );
};
