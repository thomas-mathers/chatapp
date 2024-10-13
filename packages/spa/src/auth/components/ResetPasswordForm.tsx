import { Button, Stack, TextField, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';

export const ResetPasswordForm = () => {
  const { control, formState, handleSubmit } = useForm({
    defaultValues: {
      newPassword: '',
      newPasswordConfirm: '',
    },
  });

  const onSubmit = (data: unknown) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        <Typography variant="h4" component="h1">
          Reset Password
        </Typography>
        <Controller
          name="newPassword"
          control={control}
          rules={{ required: 'New Password is required' }}
          render={({ field }) => (
            <TextField
              {...field}
              type="password"
              label="New Password"
              helperText={formState.errors.newPassword?.message}
              error={Boolean(formState.errors.newPassword)}
            />
          )}
        />
        <Controller
          name="newPasswordConfirm"
          control={control}
          rules={{ required: 'Confirm New Password is required' }}
          render={({ field }) => (
            <TextField
              {...field}
              type="password"
              label="Confirm New Password"
              helperText={formState.errors.newPasswordConfirm?.message}
              error={Boolean(formState.errors.newPasswordConfirm)}
            />
          )}
        />
        <Button type="submit" variant="contained" color="primary">
          Submit
        </Button>
      </Stack>
    </form>
  );
};
