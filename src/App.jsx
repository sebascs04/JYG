import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { useAuthStore } from './store/useAuthStore';

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    // Solo inicializar al cargar
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter basename="/JYG">
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;