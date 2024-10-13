import { Button, Link, Stack, TextField, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { Link as RouterLink } from 'react-router-dom';

export const ForgotPasswordForm = () => {
  const { control, formState, handleSubmit } = useForm({
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = (data: unknown) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        <Typography variant="h4" component="h1">
          Forgot Password
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
        <Button type="submit" variant="contained" color="primary">
          Submit
        </Button>
        <Typography variant="body2">
          Return to{' '}
          <Link component={RouterLink} to="/">
            Login
          </Link>
        </Typography>
      </Stack>
    </form>
  );
};
