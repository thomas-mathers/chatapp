import { Button, Link, Stack, TextField, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export const LoginForm = () => {
  return (
    <form>
      <Stack spacing={2}>
        <Typography variant="h4" component="h1">
          Login
        </Typography>
        <TextField type="text" label="Email" />
        <TextField type="password" label="Password" />
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
