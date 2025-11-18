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
          // Get user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          login({
            id: session.user.id,
            email: session.user.email,
            role: profile?.role || 'customer',
            ...profile,
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
