import { zodResolver } from '@hookform/resolvers/zod';
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useMutation } from '@tanstack/react-query';
import { PasswordResetTokenRequest } from 'chatapp.account-service-contracts';
import { ApiError } from 'chatapp.api-error';
import { useSnackbar } from 'notistack';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { z } from 'zod';

import { authService } from '@app/lib/api-client';

const forgotPasswordFormSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Email is invalid'),
});

type ForgotPasswordFormState = z.infer<typeof forgotPasswordFormSchema>;

export const ForgotPasswordForm = () => {
  const { control, formState, handleSubmit } = useForm<ForgotPasswordFormState>(
    {
      defaultValues: {
        email: '',
      },
      resolver: zodResolver(forgotPasswordFormSchema),
    },
  );

  const { mutate, isPending, error } = useMutation<
    void,
    ApiError,
    PasswordResetTokenRequest
  >({
    mutationFn: (data) => authService.forgotPassword(data),
    onSuccess: () => {
      enqueueSnackbar(t('forgot-password-form.email-sent'), {
        variant: 'success',
      });
    },
  });

  const onSubmit = (data: ForgotPasswordFormState) => {
    mutate(data);
  };

  const { t } = useTranslation();

  const { enqueueSnackbar } = useSnackbar();

  return (
    <Container maxWidth="xs" sx={{ paddingTop: 2 }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Typography variant="h4" component="h1">
            {t('forgot-password-form.forgot-password')}
          </Typography>
          <Controller
            name="email"
            control={control}
            rules={{ required: t('forgot-password-form.email-is-required') }}
            render={({ field }) => (
              <TextField
                {...field}
                type="text"
                label={t('forgot-password-form.email')}
                helperText={formState.errors.email?.message}
                error={Boolean(formState.errors.email)}
              />
            )}
          />
          <LoadingButton type="submit" loading={isPending} variant="contained">
            {t('forgot-password-form.submit')}
          </LoadingButton>
          {error && <Alert severity="error">{error.message}</Alert>}
          <Typography variant="body2">
            {t('forgot-password-form.return-to')}{' '}
            <Link component={RouterLink} to="/">
              {t('forgot-password-form.login')}
            </Link>
          </Typography>
        </Stack>
      </form>
    </Container>
  );
};
