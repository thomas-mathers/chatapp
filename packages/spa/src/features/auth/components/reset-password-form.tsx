import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMutation } from '@tanstack/react-query';
import { PasswordResetRequest } from 'chatapp.account-service-contracts';
import { ApiError } from 'chatapp.api-error';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { PasswordField } from '@app/components/password-field';
import { authService } from '@app/lib/api-client';

interface ResetPasswordFormState {
  newPassword: string;
  newPasswordConfirm: string;
}

export const ResetPasswordForm = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');

  const { control, formState, handleSubmit } = useForm<ResetPasswordFormState>({
    defaultValues: {
      newPassword: '',
      newPasswordConfirm: '',
    },
  });

  const { mutate, isPending, error } = useMutation<
    void,
    ApiError,
    PasswordResetRequest
  >({
    mutationFn: (data) => authService.resetPassword(data),
    onSuccess: () => {
      navigate('/');
    },
  });

  const onSubmit = (data: ResetPasswordFormState) => {
    mutate({ newPassword: data.newPassword, token: token! });
  };

  const { t } = useTranslation();

  return (
    <Container maxWidth="xs" sx={{ paddingTop: 2 }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Typography variant="h4" component="h1">
            {t('reset-password-form.reset-password')}
          </Typography>
          <Controller
            name="newPassword"
            control={control}
            rules={{
              required: t('reset-password-form.new-password-is-required'),
            }}
            render={({ field }) => (
              <PasswordField
                {...field}
                label={t('reset-password-form.new-password')}
                helperText={formState.errors.newPassword?.message}
                error={Boolean(formState.errors.newPassword)}
              />
            )}
          />
          <Controller
            name="newPasswordConfirm"
            control={control}
            rules={{
              required: t('reset-password-form.confirm-password-is-required'),
            }}
            render={({ field }) => (
              <PasswordField
                {...field}
                label={t('reset-password-form.confirm-password')}
                helperText={formState.errors.newPasswordConfirm?.message}
                error={Boolean(formState.errors.newPasswordConfirm)}
              />
            )}
          />
          <LoadingButton type="submit" variant="contained" loading={isPending}>
            {t('reset-password-form.submit')}
          </LoadingButton>
          {error && <Alert severity="error">{error.message}</Alert>}
        </Stack>
      </form>
    </Container>
  );
};
