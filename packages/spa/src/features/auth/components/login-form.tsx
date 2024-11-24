import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useMutation } from '@tanstack/react-query';
import { LoginResponse } from 'chatapp.account-service-contracts';
import { ApiError } from 'chatapp.api-error';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Link as RouterLink,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { useLocalStorage } from 'usehooks-ts';

import { PasswordField } from '@app/components/password-field';
import { authService } from '@app/lib/api-client';

interface LoginFormState {
  username: string;
  password: string;
}

export const LoginForm = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const { control, formState, handleSubmit } = useForm<LoginFormState>({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const [, setAccessToken] = useLocalStorage('jwt', '');

  const {
    mutate,
    isPending,
    error: loginError,
  } = useMutation<LoginResponse, ApiError, LoginFormState>({
    mutationFn: (data) => authService.login(data),
    onSuccess: ({ accessToken }) => {
      setAccessToken(accessToken);
      navigate('/dashboard');
    },
  });

  const onSubmit = (data: LoginFormState) => {
    mutate(data);
  };

  useEffect(() => {
    const code = searchParams.get('code');

    if (code) {
      searchParams.delete('code');
      setSearchParams(searchParams);

      authService.exchangeAuthCodeForToken({ code }).then(({ accessToken }) => {
        setAccessToken(accessToken);
        navigate('/dashboard');
      });
    }

    const token = searchParams.get('token');

    if (token) {
      searchParams.delete('token');
      setSearchParams(searchParams);

      authService.confirmEmail({ token });
    }
  }, [searchParams, setSearchParams, navigate, setAccessToken]);

  const { t } = useTranslation();

  return (
    <Container maxWidth="xs" sx={{ paddingTop: 2 }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Typography variant="h4" component="h1">
            {t('login-form.login')}
          </Typography>
          <Controller
            name="username"
            control={control}
            rules={{ required: t('login-form.username-is-required') }}
            render={({ field }) => (
              <TextField
                {...field}
                type="text"
                label={t('login-form.username')}
                helperText={formState.errors.username?.message}
                error={Boolean(formState.errors.username)}
              />
            )}
          />
          <Controller
            name="password"
            control={control}
            rules={{ required: t('login-form.password-is-required') }}
            render={({ field }) => (
              <PasswordField
                {...field}
                label={t('login-form.password')}
                helperText={formState.errors.password?.message}
                error={Boolean(formState.errors.password)}
              />
            )}
          />
          <Link component={RouterLink} to="/forgot-password">
            <Typography variant="body2">
              {t('login-form.forgot-password')}
            </Typography>
          </Link>
          <LoadingButton type="submit" loading={isPending} variant="contained">
            {t('login-form.login')}
          </LoadingButton>
          {loginError && <Alert severity="error">{loginError.message}</Alert>}
          <Typography variant="body2">
            {t('login-form.do-not-have-an-account')}{' '}
            <Link component={RouterLink} to="/register">
              {t('login-form.register')}
            </Link>
          </Typography>
          <Divider>{t('login-form.or')}</Divider>
          <Button
            href="http://localhost:3000/oauth2/google/login"
            variant="contained"
            color="primary"
            fullWidth
          >
            {t('login-form.continue-with-google')}
          </Button>
          <Button
            href="http://localhost:3000/oauth2/facebook/login"
            variant="contained"
            color="primary"
            fullWidth
          >
            {t('login-form.continue-with-facebook')}
          </Button>
        </Stack>
      </form>
    </Container>
  );
};
