import { zodResolver } from '@hookform/resolvers/zod';
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useMutation } from '@tanstack/react-query';
import {
  AccountRegistrationRequest,
  AccountSummary,
} from 'chatapp.account-service-contracts';
import { ApiError } from 'chatapp.api-error';
import { useSnackbar } from 'notistack';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { PasswordField } from '@app/components/password-field';
import { accountService } from '@app/lib/api-client';

const registerFormSchema = z
  .object({
    email: z.string().min(1, 'Email is required').email(),
    password: z.string().min(1, 'Password is required'),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
    username: z.string().min(1, 'Username is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords must match',
  });

type RegisterFormState = z.infer<typeof registerFormSchema>;

export const RegisterForm = () => {
  const navigate = useNavigate();

  const { control, formState, handleSubmit } = useForm<RegisterFormState>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      username: '',
    },
    resolver: zodResolver(registerFormSchema),
  });

  const { mutate, isPending, error } = useMutation<
    AccountSummary,
    ApiError,
    AccountRegistrationRequest
  >({
    mutationFn: (data) => accountService.createAccount(data),
    onSuccess: () => {
      enqueueSnackbar(t('register-form.success'), { variant: 'success' });
      navigate('/');
    },
  });

  const onSubmit = (data: RegisterFormState) => {
    mutate(data);
  };

  const { t } = useTranslation();

  const { enqueueSnackbar } = useSnackbar();

  return (
    <Container maxWidth="xs" sx={{ paddingTop: 2 }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Typography variant="h4" component="h1">
            {t('register-form.register')}
          </Typography>
          <Controller
            name="username"
            control={control}
            rules={{ required: t('register-form.username-is-required') }}
            render={({ field }) => (
              <TextField
                {...field}
                type="text"
                label={t('register-form.username')}
                helperText={formState.errors.username?.message}
                error={Boolean(formState.errors.username)}
              />
            )}
          />
          <Controller
            name="email"
            control={control}
            rules={{ required: t('register-form.email-is-required') }}
            render={({ field }) => (
              <TextField
                {...field}
                type="email"
                label={t('register-form.email')}
                helperText={formState.errors.email?.message}
                error={Boolean(formState.errors.email)}
              />
            )}
          />
          <Controller
            name="password"
            control={control}
            rules={{ required: t('register-form.password-is-required') }}
            render={({ field }) => (
              <PasswordField
                {...field}
                label={t('register-form.password')}
                helperText={formState.errors.password?.message}
                error={Boolean(formState.errors.password)}
              />
            )}
          />
          <Controller
            name="confirmPassword"
            control={control}
            rules={{
              required: t('register-form.confirm-password-is-required'),
            }}
            render={({ field }) => (
              <PasswordField
                {...field}
                label={t('register-form.confirm-password')}
                helperText={formState.errors.confirmPassword?.message}
                error={Boolean(formState.errors.confirmPassword)}
              />
            )}
          />
          <LoadingButton type="submit" loading={isPending} variant="contained">
            {t('register-form.submit')}
          </LoadingButton>
          {error && <Alert severity="error">{error.message}</Alert>}
          <Typography variant="body2">
            {t('register-form.already-have-an-account')}{' '}
            <Link component={RouterLink} to="/">
              {t('register-form.login')}
            </Link>
          </Typography>
        </Stack>
      </form>
    </Container>
  );
};
