import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMutation } from '@tanstack/react-query';
import { ChangePasswordRequest } from 'chatapp.account-service-contracts';
import { ApiError } from 'chatapp.api-error';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocalStorage } from 'usehooks-ts';

import { PasswordField } from '@app/components/password-field';
import { authService } from '@app/lib/api-client';

interface ChangePasswordFormState {
  currentPassword: string;
  password: string;
  passwordConfirm: string;
}

export const ChangePasswordForm = () => {
  const { control, formState, handleSubmit } = useForm<ChangePasswordFormState>(
    {
      defaultValues: {
        currentPassword: '',
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
    mutate({ oldPassword: data.currentPassword, newPassword: data.password });
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
            name="currentPassword"
            control={control}
            rules={{
              required: t('change-password-form.current-password-is-required'),
            }}
            render={({ field }) => (
              <PasswordField
                {...field}
                label={t('change-password-form.current-password')}
                helperText={formState.errors.currentPassword?.message}
                error={Boolean(formState.errors.currentPassword)}
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
