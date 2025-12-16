import { supabase } from '../lib/supabase';

/**
 * Login user
 */
export const login = async ({ email, password }) => {
  // 1. Login Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  // 2. Buscar perfil (Doble búsqueda)
  let finalUser = null;
  
  // A. Buscar en Clientes
  const { data: cliente } = await supabase
    .from('clientes')
    .select('*')
    .eq('email', data.user.email)
    .single();

  if (cliente) {
    finalUser = { ...cliente, id_cliente: cliente.id_cliente, role: 'customer' };
  } else {
    // B. Buscar en Trabajadores
    const { data: trabajador } = await supabase
      .from('trabajadores')
      .select('*, roles_trabajador(nombre_rol)')
      .eq('email_corporativo', data.user.email)
      .single();
      
    if (trabajador) {
       const nombreRol = trabajador.roles_trabajador?.nombre_rol;
       const role = (nombreRol === 'Administrador' || nombreRol === 'Admin') ? 'admin' : 'employee';
       finalUser = { ...trabajador, id_cliente: trabajador.id_trabajador, role: role };
    }
  }

  return {
    user: {
      id: data.user.id,
      ...(finalUser || { role: 'customer' }), // Default
    },
    token: data.session.access_token,
    session: data.session,
  };
};

/**
 * Register new user (Solo clientes)
 */
export const register = async ({ email, password, nombre, apellido, telefono }) => {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) throw authError;

  const { data: cliente, error: clienteError } = await supabase
    .from('clientes')
    .insert([{
      nombre,
      apellido,
      email,
      telefono,
      password_hash: authData.user.id,
      es_invitado: false,
      activo: true,
    }])
    .select()
    .single();

  if (clienteError) console.error('Error creating cliente:', clienteError);

  return {
    user: {
      id: authData.user.id,
      ...cliente,
      role: 'customer',
    },
    token: authData.session?.access_token,
    session: authData.session,
  };
};

export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return { success: true };
};

export const getCurrentUser = async () => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error('No user logged in');

  // Misma lógica de búsqueda doble
  let finalData = null;
  
  const { data: cliente } = await supabase.from('clientes').select('*').eq('email', user.email).single();
  if (cliente) {
    finalData = { ...cliente, role: 'customer' };
  } else {
    const { data: trab } = await supabase.from('trabajadores').select('*, roles_trabajador(nombre_rol)').eq('email_corporativo', user.email).single();
    if (trab) {
      const role = (trab.roles_trabajador?.nombre_rol === 'Administrador') ? 'admin' : 'employee';
      finalData = { ...trab, role: role };
    }
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      ...(finalData || { role: 'customer' }),
    },
  };
};

// ... resto de funciones (resetPassword, updatePassword) se quedan igual
export const resetPassword = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
  return { success: true };
};

export const updatePassword = async (newPassword) => {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return { success: true };
};