import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,

  // Inicializar sesión al cargar la página
  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        const email = session.user.email;
        let userData = null;
        let userRole = 'customer';

        // 1. Intentar buscar en tabla CLIENTES
        const { data: cliente } = await supabase
          .from('clientes')
          .select('*')
          .eq('email', email)
          .single();

        if (cliente) {
          userData = {
            ...cliente,
            id: session.user.id, // ID de Auth (UUID)
            id_cliente: cliente.id_cliente, // ID SQL (BigInt)
            role: 'customer'
          };
        } else {
          // 2. Si no es cliente, buscar en TRABAJADORES (Admin/Empleado)
          const { data: trabajador } = await supabase
            .from('trabajadores')
            .select('*, roles_trabajador(nombre_rol)')
            .eq('email_corporativo', email)
            .single();
          
          if (trabajador) {
            // Normalizamos el rol para que el frontend lo entienda
            const nombreRol = trabajador.roles_trabajador?.nombre_rol;
            const role = (nombreRol === 'Administrador' || nombreRol === 'Admin') ? 'admin' : 'employee';
            
            userData = {
              ...trabajador,
              id: session.user.id,
              id_trabajador: trabajador.id_trabajador,
              // Mapeamos a id_cliente para evitar errores si algún componente lo pide prestado
              id_cliente: trabajador.id_trabajador, 
              role: role
            };
          }
        }

        // Si encontramos datos (sea cliente o admin), actualizamos el estado
        if (userData) {
          set({ 
            user: userData, 
            session, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } else {
          // Usuario autenticado en Supabase pero sin perfil en tablas (Fallback)
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
      // 1. Autenticar con Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Nota: No necesitamos buscar los datos aquí manualmente porque
      // al hacer login exitoso, Supabase dispara el evento 'SIGNED_IN'
      // y tu App.jsx llamará a initialize() o login() de nuevo.
      // Pero para actualizar el estado rápido, hacemos la misma búsqueda doble:
      
      let userData = null;
      
      // A. Buscar Cliente
      const { data: cliente } = await supabase.from('clientes').select('*').eq('email', email).single();
      
      if (cliente) {
        userData = { ...cliente, id: data.user.id, id_cliente: cliente.id_cliente, role: 'customer' };
      } else {
        // B. Buscar Trabajador
        const { data: trabajador } = await supabase
          .from('trabajadores')
          .select('*, roles_trabajador(nombre_rol)')
          .eq('email_corporativo', email)
          .single();
          
        if (trabajador) {
          const nombreRol = trabajador.roles_trabajador?.nombre_rol;
          const role = (nombreRol === 'Administrador' || nombreRol === 'Admin') ? 'admin' : 'employee';
          userData = { ...trabajador, id: data.user.id, id_trabajador: trabajador.id_trabajador, id_cliente: trabajador.id_trabajador, role: role };
        }
      }

      // Guardar en estado
      set({
        user: userData || { id: data.user.id, email: data.user.email, role: 'customer' },
        session: data.session,
        isAuthenticated: true,
        isLoading: false,
      });

    } catch (error) {
      console.error('Login error:', error);
      set({ isLoading: false });
      throw error; 
    }
  },

  // Registrar Cliente
  register: async (datos) => {
    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: datos.email,
      password: datos.password,
    });
    if (authError) throw authError;

    // 2. Insertar en tabla CLIENTES
    const { error: dbError } = await supabase.from('clientes').insert([{
      nombre: datos.nombre,
      apellido: datos.apellido,
      email: datos.email,
      telefono: datos.telefono,
      password_hash: authData.user.id, // Referencia
      fecha_registro: new Date().toISOString()
    }]);
    
    if (dbError) throw dbError;
    return authData;
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, isAuthenticated: false });
  },

  // Helpers para proteger rutas
  isAdmin: () => {
    const role = get().user?.role;
    return role === 'admin';
  },
  isEmployee: () => {
    const role = get().user?.role;
    return ['admin', 'employee'].includes(role);
  }
}));