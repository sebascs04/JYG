import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,

      // Inicializar sesión al cargar la página
      initialize: async () => {
        // Si ya hay usuario en localStorage, no hacer nada
        if (get().isAuthenticated && get().user) {
          return;
        }

        try {
          const { data: { session } } = await supabase.auth.getSession();

          if (session) {
            const email = session.user.email;
            let userData = null;

            // 1. Intentar buscar en tabla CLIENTES
            const { data: cliente } = await supabase
              .from('clientes')
              .select('*')
              .eq('email', email)
              .single();

            if (cliente) {
              userData = {
                ...cliente,
                id: session.user.id,
                id_cliente: cliente.id_cliente,
                role: 'customer'
              };
            } else {
              // 2. Si no es cliente, buscar en TRABAJADORES
              const { data: trabajador } = await supabase
                .from('trabajadores')
                .select('*, roles_trabajador(nombre_rol)')
                .eq('email_corporativo', email)
                .single();

              if (trabajador) {
                const nombreRol = trabajador.roles_trabajador?.nombre_rol;
                const role = (nombreRol === 'Administrador' || nombreRol === 'Admin') ? 'admin' : 'employee';

                userData = {
                  ...trabajador,
                  id: session.user.id,
                  id_trabajador: trabajador.id_trabajador,
                  id_cliente: trabajador.id_trabajador,
                  role: role
                };
              }
            }

            if (userData) {
              set({
                user: userData,
                session,
                isAuthenticated: true,
                isLoading: false
              });
            } else {
              set({ user: { id: session.user.id, email, role: 'customer' }, session, isAuthenticated: true, isLoading: false });
            }
          } else {
            set({ user: null, session: null, isAuthenticated: false, isLoading: false });
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          set({ isLoading: false });
        }
      },

      // Iniciar Sesión
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          let userData = null;
          let session = null;

          // 1. Primero buscar en trabajadores
          const { data: trabajadorExiste } = await supabase
            .from('trabajadores')
            .select('*, roles_trabajador(nombre_rol)')
            .eq('email_corporativo', email)
            .eq('password_hash', password)
            .single();

          if (trabajadorExiste) {
            if (!trabajadorExiste.activo) {
              throw new Error('Tu cuenta ha sido desactivada. Contacta al administrador.');
            }

            const nombreRol = trabajadorExiste.roles_trabajador?.nombre_rol?.toLowerCase() || '';

            let role = 'employee';
            if (nombreRol.includes('admin') || nombreRol.includes('superadmin') || trabajadorExiste.id_rol === 1) {
              role = 'admin';
            } else if (nombreRol.includes('recepcion')) {
              role = 'recepcionista';
            } else if (nombreRol.includes('despach')) {
              role = 'despachador';
            } else if (nombreRol.includes('repart') || nombreRol.includes('delivery')) {
              role = 'repartidor';
            }

            userData = {
              ...trabajadorExiste,
              id: trabajadorExiste.id_trabajador,
              id_trabajador: trabajadorExiste.id_trabajador,
              email: trabajadorExiste.email_corporativo,
              role: role,
              cargo: trabajadorExiste.roles_trabajador?.nombre_rol || 'Empleado'
            };
            session = { user: { id: trabajadorExiste.id_trabajador, email: trabajadorExiste.email_corporativo } };
          } else {
            // 2. Buscar en clientes
            const { data: clienteExiste } = await supabase
              .from('clientes')
              .select('*')
              .eq('email', email)
              .eq('password_hash', password)
              .single();

            if (clienteExiste) {
              if (!clienteExiste.activo) {
                throw new Error('Tu cuenta ha sido desactivada. Contacta a soporte.');
              }

              userData = {
                ...clienteExiste,
                id: clienteExiste.id_cliente,
                id_cliente: clienteExiste.id_cliente,
                role: 'customer'
              };
              session = { user: { id: clienteExiste.id_cliente, email: clienteExiste.email } };
            }
          }

          // 3. Si no encontró, intentar Supabase Auth
          if (!userData) {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
            if (authError) throw new Error('Credenciales incorrectas');

            const { data: cliente } = await supabase.from('clientes').select('*').eq('email', email).single();
            if (cliente) {
              if (!cliente.activo) {
                throw new Error('Tu cuenta ha sido desactivada. Contacta a soporte.');
              }
              userData = { ...cliente, id: authData.user.id, id_cliente: cliente.id_cliente, role: 'customer' };
            } else {
              userData = { id: authData.user.id, email: authData.user.email, role: 'customer' };
            }
            session = authData.session;
          }

          if (!userData) {
            throw new Error('Credenciales incorrectas');
          }

          set({
            user: userData,
            session: session,
            isAuthenticated: true,
            isLoading: false,
          });

          return userData;

        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      // Registrar Cliente
      register: async (datos) => {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: datos.email,
          password: datos.password,
        });
        if (authError) throw authError;

        const { data: cliente, error: dbError } = await supabase.from('clientes').insert([{
          nombre: datos.nombre,
          apellido: datos.apellido,
          email: datos.email,
          telefono: datos.telefono,
          direccion: datos.direccion,
          password_hash: authData.user.id,
          fecha_registro: new Date().toISOString()
        }]).select().single();

        if (dbError) throw dbError;

        set({
          user: {
            ...cliente,
            id: authData.user.id,
            id_cliente: cliente.id_cliente,
            role: 'customer'
          },
          session: authData.session,
          isAuthenticated: true,
          isLoading: false
        });

        return authData;
      },

      // Cerrar sesión
      logout: () => {
        // Limpiar estado inmediatamente
        set({ user: null, session: null, isAuthenticated: false });

        // Intentar cerrar sesión de Supabase Auth sin bloquear
        try {
          supabase.auth.signOut().catch(() => {});
        } catch {
          // Ignorar errores
        }
      },

      // Helpers
      isAdmin: () => get().user?.role === 'admin',
      isEmployee: () => ['admin', 'employee', 'recepcionista', 'despachador', 'repartidor'].includes(get().user?.role),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
