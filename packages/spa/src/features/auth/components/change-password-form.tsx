import { LoadingButton } from '@mui/lab';
import { Alert, Container, Stack, TextField, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { ChangePasswordRequest } from 'chatapp.account-service-contracts';
import { ApiError } from 'chatapp.api-error';
import { Controller, useForm } from 'react-hook-form';
import { useLocalStorage } from 'usehooks-ts';

import { useAuthService } from '@app/hooks';

interface ChangePasswordFormState {
  oldPassword: string;
  password: string;
  passwordConfirm: string;
}

export const ChangePasswordForm = () => {
  const { control, formState, handleSubmit } = useForm<ChangePasswordFormState>(
    {
      defaultValues: {
        oldPassword: '',
        password: '',
        passwordConfirm: '',
      },
    },
  );

  const authService = useAuthService();

  const [jwt] = useLocalStorage('jwt', '');

  const { mutate, isPending, error } = useMutation<
    void,
    ApiError,
    ChangePasswordRequest
  >({
    mutationFn: (data) => authService.changePassword(data, jwt),
  });

  const onSubmit = (data: ChangePasswordFormState) => {
    mutate({ oldPassword: data.oldPassword, newPassword: data.password });
  };

  return (
    <Container maxWidth="xs" sx={{ paddingTop: 2 }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Typography variant="h4" component="h1">
            Change Password
          </Typography>
          <Controller
            name="oldPassword"
            control={control}
            rules={{ required: 'Current password is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                type="text"
                label="Current Password"
                helperText={formState.errors.oldPassword?.message}
                error={Boolean(formState.errors.oldPassword)}
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
          <Controller
            name="passwordConfirm"
            control={control}
            rules={{ required: 'Password is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                type="password"
                label="Confirm Password"
                helperText={formState.errors.passwordConfirm?.message}
                error={Boolean(formState.errors.passwordConfirm)}
              />
            )}
          />
          <LoadingButton type="submit" loading={isPending} variant="contained">
            Submit
          </LoadingButton>
          {error && <Alert severity="error">{error.message}</Alert>}
        </Stack>
      </form>
    </Container>
  );
};
