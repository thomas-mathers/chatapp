import { Button, Link, Stack, TextField, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export const RegisterForm = () => {
  return (
    <form>
      <Stack spacing={2}>
        <Typography variant="h4" component="h1">
          Register
        </Typography>
        <TextField label="Username" type="text" />
        <TextField label="Email" type="email" />
        <TextField label="Password" type="password" />
        <TextField label="Confirm Password" type="password" />
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
