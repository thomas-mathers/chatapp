import { Button, Link, Stack, TextField, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { Link as RouterLink } from 'react-router-dom';

import { useAuthService } from '../../../hooks/useAuthService';

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

  const authService = useAuthService();

  const { mutate } = useMutation({
    mutationFn: authService.forgotPassword,
  });

  const onSubmit = (data: ForgotPasswordFormState) => {
    mutate(data);
  };

  return (
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
        <Button type="submit" variant="contained" color="primary">
          Submit
        </Button>
        <Typography variant="body2">
          Return to{' '}
          <Link component={RouterLink} to="/">
            Login
          </Link>
        </Typography>
      </Stack>
    </form>
  );
};
