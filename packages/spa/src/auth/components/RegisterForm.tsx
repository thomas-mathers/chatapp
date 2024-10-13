import { Button, Link, Stack, TextField, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { Link as RouterLink } from 'react-router-dom';

interface RegisterFormState {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
}

export const RegisterForm = () => {
  const { control, formState, handleSubmit } = useForm<RegisterFormState>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      username: '',
    },
  });

  const onSubmit = (data: RegisterFormState) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        <Typography variant="h4" component="h1">
          Register
        </Typography>
        <Controller
          name="username"
          control={control}
          rules={{ required: 'Username is required' }}
          render={({ field }) => (
            <TextField
              {...field}
              type="text"
              label="Username"
              helperText={formState.errors.username?.message}
              error={Boolean(formState.errors.username)}
            />
          )}
        />
        <Controller
          name="email"
          control={control}
          rules={{ required: 'Email is required' }}
          render={({ field }) => (
            <TextField
              {...field}
              type="email"
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
        <Controller
          name="confirmPassword"
          control={control}
          rules={{
            required: 'Confirm Password is required',
          }}
          render={({ field }) => (
            <TextField
              {...field}
              type="password"
              label="Confirm Password"
              helperText={formState.errors.confirmPassword?.message}
              error={Boolean(formState.errors.confirmPassword)}
            />
          )}
        />
        <Button type="submit" variant="contained" color="primary">
          Submit
        </Button>
        <Typography variant="body2">
          Already have an account?{' '}
          <Link component={RouterLink} to="/">
            Login
          </Link>
        </Typography>
      </Stack>
    </form>
  );
};
