import { zodResolver } from '@hookform/resolvers/zod';
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
import z from 'zod';

import { PasswordField } from '@app/components/password-field';
import { authService } from '@app/lib/api-client';

const changePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    password: z.string().min(1, 'Password is required'),
    passwordConfirm: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ['passwordConfirm'],
    message: 'Passwords do not match',
  });

type ChangePasswordFormState = z.infer<typeof changePasswordFormSchema>;

export const ChangePasswordForm = () => {
  const { control, formState, handleSubmit } = useForm<ChangePasswordFormState>(
    {
      defaultValues: {
        currentPassword: '',
        password: '',
        passwordConfirm: '',
      },
      resolver: zodResolver(changePasswordFormSchema),
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
