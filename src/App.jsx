import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { supabase } from './lib/supabase';
import { useAuthStore } from './store/useAuthStore';

function App() {
  const { initialize, login, logout } = useAuthStore();

  useEffect(() => {
    // Initialize auth state
    initialize();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Get client profile
          const { data: cliente } = await supabase
            .from('clientes')
            .select('*')
            .eq('email', session.user.email)
            .single();

          login({
            id: cliente?.id_cliente || session.user.id,
            id_cliente: cliente?.id_cliente,
            email: session.user.email,
            nombre: cliente?.nombre,
            apellido: cliente?.apellido,
            telefono: cliente?.telefono,
            role: 'customer',
            es_invitado: cliente?.es_invitado || false,
            activo: cliente?.activo !== undefined ? cliente.activo : true,
          }, session);
        } else if (event === 'SIGNED_OUT') {
          logout();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [initialize, login, logout]);

  return (
    <BrowserRouter basename="/JYG">
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
