import { LoadingButton } from '@mui/lab';
import { Alert, Container, Stack, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { ChangePasswordRequest } from 'chatapp.account-service-contracts';
import { ApiError } from 'chatapp.api-error';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocalStorage } from 'usehooks-ts';

import { PasswordField } from '@app/components/password-field';
import { authService } from '@app/lib/api-client';

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

  const { t } = useTranslation();

  return (
    <Container maxWidth="xs" sx={{ paddingTop: 2 }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Typography variant="h4" component="h1">
            {t('change-password-form.change-password')}
          </Typography>
          <Controller
            name="oldPassword"
            control={control}
            rules={{
              required: t('change-password-form.current-password-is-required'),
            }}
            render={({ field }) => (
              <PasswordField
                {...field}
                label={t('change-password-form.current-password')}
                helperText={formState.errors.oldPassword?.message}
                error={Boolean(formState.errors.oldPassword)}
              />
            )}
          />
          <Controller
            name="password"
            control={control}
            rules={{
              required: t('change-password-form.password-is-required'),
            }}
            render={({ field }) => (
              <PasswordField
                {...field}
                label={t('change-password-form.password')}
                helperText={formState.errors.password?.message}
                error={Boolean(formState.errors.password)}
              />
            )}
          />
          <Controller
            name="passwordConfirm"
            control={control}
            rules={{
              required: t('change-password-form.confirm-password-is-required'),
            }}
            render={({ field }) => (
              <PasswordField
                {...field}
                label={t('change-password-form.confirm-password')}
                helperText={formState.errors.passwordConfirm?.message}
                error={Boolean(formState.errors.passwordConfirm)}
              />
            )}
          />
          <LoadingButton type="submit" loading={isPending} variant="contained">
            {t('change-password-form.submit')}
          </LoadingButton>
          {error && <Alert severity="error">{error.message}</Alert>}
        </Stack>
      </form>
    </Container>
  );
};
