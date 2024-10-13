import { Button, Link, Stack, TextField, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export const ForgotPasswordForm = () => {
  return (
    <form>
      <Stack spacing={2}>
        <Typography variant="h4" component="h1">
          Forgot Password
        </Typography>
        <TextField label="Email" type="email" />
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
