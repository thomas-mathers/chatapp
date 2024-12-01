import CssBaseline from '@mui/material/CssBaseline';
import { RouterProvider } from 'react-router-dom';

import { AppProvider } from './provider';
import { router } from './router';

function App() {
  return (
    <AppProvider>
      <>
        <CssBaseline />
        <RouterProvider router={router} future={{ v7_startTransition: true }} />
      </>
    </AppProvider>
  );
}

export default App;
