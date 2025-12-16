import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/AppRoutes';
import { useAuthStore } from './store/useAuthStore';

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <RouterProvider router={router} />;
}

export default App;
