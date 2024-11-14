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
import { PasswordResetTokenRequest } from 'chatapp.account-service-contracts';
import { ApiError } from 'chatapp.api-error';
import { Controller, useForm } from 'react-hook-form';
import { Link as RouterLink } from 'react-router-dom';

import { authService } from '@app/lib/api-client';

interface ForgotPasswordFormState {
  email: string;
}

export const ForgotPasswordForm = () => {
  const { control, formState, handleSubmit } = useForm<ForgotPasswordFormState>(
    {
      defaultValues: {
        email: '',
      },
    },
  );

  const { mutate, isPending, error } = useMutation<
    void,
    ApiError,
    PasswordResetTokenRequest
  >({
    mutationFn: (data) => authService.forgotPassword(data),
  });

  const onSubmit = (data: ForgotPasswordFormState) => {
    mutate(data);
  };

  return (
    <Container maxWidth="xs" sx={{ paddingTop: 2 }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Typography variant="h4" component="h1">
            Forgot Password
          </Typography>
          <Controller
            name="email"
            control={control}
            rules={{ required: 'Email is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                type="text"
                label="Email"
                helperText={formState.errors.email?.message}
                error={Boolean(formState.errors.email)}
              />
            )}
          />
          <LoadingButton type="submit" loading={isPending} variant="contained">
            Submit
          </LoadingButton>
          {error && <Alert severity="error">{error.message}</Alert>}
          <Typography variant="body2">
            Return to{' '}
            <Link component={RouterLink} to="/">
              Login
            </Link>
          </Typography>
        </Stack>
      </form>
    </Container>
  );
};
