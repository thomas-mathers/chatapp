import { Button, Stack, TextField, Typography } from '@mui/material';

export const ResetPasswordForm = () => {
  return (
    <form>
      <Stack spacing={2}>
        <Typography variant="h4" component="h1">
          Reset Password
        </Typography>
        <TextField type="password" label="New Password" />
        <TextField type="password" label="Confirm New Password" />
        <Button type="submit" variant="contained" color="primary">
          Submit
        </Button>
      </Stack>
    </form>
  );
};
