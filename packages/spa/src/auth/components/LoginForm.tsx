import { Button, Link, Stack, TextField, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { Link as RouterLink } from 'react-router-dom';

interface LoginFormState {
  email: string;
  password: string;
}

export const LoginForm = () => {
  const { control, formState, handleSubmit } = useForm<LoginFormState>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormState) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        <Typography variant="h4" component="h1">
          Login
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
        <Link component={RouterLink} to="/forgot-password">
          <Typography variant="body2">Forgot Password?</Typography>
        </Link>
        <Button type="submit" variant="contained" color="primary">
          Login
        </Button>
        <Typography variant="body2">
          Don't have an account?{' '}
          <Link component={RouterLink} to="/register">
            Register
          </Link>
        </Typography>
      </Stack>
    </form>
  );
};
