import CssBaseline from '@mui/material/CssBaseline';
import { RouterProvider } from 'react-router-dom';

import { AppProvider } from './provider';
import { router } from './router';

function App() {
  return (
    <AppProvider>
      <>
        <CssBaseline />
        <RouterProvider router={router} />
      </>
    </AppProvider>
  );
}

export default App;
