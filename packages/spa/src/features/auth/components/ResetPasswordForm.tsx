import { LoadingButton } from '@mui/lab';
import { Alert, Stack, TextField, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { PasswordResetRequest } from 'chatapp.account-service-contracts';
import { ApiError } from 'chatapp.api';
import { Controller, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import { useAuthService } from '@app/hooks';

interface ResetPasswordFormState {
  newPassword: string;
  newPasswordConfirm: string;
}

export const ResetPasswordForm = () => {
  const { token } = useParams<{ token: string }>();

  const { control, formState, handleSubmit } = useForm<ResetPasswordFormState>({
    defaultValues: {
      newPassword: '',
      newPasswordConfirm: '',
    },
  });

  const authService = useAuthService();

  const { mutate, isPending, error } = useMutation<
    void,
    ApiError,
    PasswordResetRequest
  >({
    mutationFn: (data) => authService.resetPassword(data),
  });

  const onSubmit = (data: ResetPasswordFormState) => {
    mutate({ newPassword: data.newPassword, token: token! });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        <Typography variant="h4" component="h1">
          Reset Password
        </Typography>
        <Controller
          name="newPassword"
          control={control}
          rules={{ required: 'New Password is required' }}
          render={({ field }) => (
            <TextField
              {...field}
              type="password"
              label="New Password"
              helperText={formState.errors.newPassword?.message}
              error={Boolean(formState.errors.newPassword)}
            />
          )}
        />
        <Controller
          name="newPasswordConfirm"
          control={control}
          rules={{ required: 'Confirm New Password is required' }}
          render={({ field }) => (
            <TextField
              {...field}
              type="password"
              label="Confirm New Password"
              helperText={formState.errors.newPasswordConfirm?.message}
              error={Boolean(formState.errors.newPasswordConfirm)}
            />
          )}
        />
        <LoadingButton type="submit" variant="contained" loading={isPending}>
          Submit
        </LoadingButton>
        {error && <Alert severity="error">{error.message}</Alert>}
      </Stack>
    </form>
  );
};
