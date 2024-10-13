import { Container, CssBaseline, ThemeProvider } from '@mui/material';
import { RouterProvider } from 'react-router-dom';

import { router } from './router';
import { theme } from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <>
        <CssBaseline />
        <Container maxWidth="xs" sx={{ paddingTop: 2 }}>
          <RouterProvider router={router} />
        </Container>
      </>
    </ThemeProvider>
  );
}

export default App;
