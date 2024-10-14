import { Container, CssBaseline } from '@mui/material';
import { RouterProvider } from 'react-router-dom';

import { AppProvider } from './providers/AppProvider';
import { router } from './router';

function App() {
  return (
    <AppProvider>
      <>
        <CssBaseline />
        <Container maxWidth="xs" sx={{ paddingTop: 2 }}>
          <RouterProvider router={router} />
        </Container>
      </>
    </AppProvider>
  );
}

export default App;
