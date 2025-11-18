import { supabase } from '../lib/supabase';

/**
 * Login user
 * @param {object} credentials - User credentials (email, password)
 * @returns {Promise} Response data with user and session
 */
export const login = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  // Get client profile from database
  const { data: cliente, error: clienteError } = await supabase
    .from('clientes')
    .select('*')
    .eq('email', data.user.email)
    .single();

  if (clienteError) {
    console.warn('Cliente not found, using default data');
  }

  return {
    user: {
      id: cliente?.id_cliente || data.user.id,
      id_cliente: cliente?.id_cliente,
      email: data.user.email,
      nombre: cliente?.nombre,
      apellido: cliente?.apellido,
      telefono: cliente?.telefono,
      role: 'customer', // Los clientes siempre son 'customer'
      es_invitado: cliente?.es_invitado || false,
      activo: cliente?.activo !== undefined ? cliente.activo : true,
    },
    token: data.session.access_token,
    session: data.session,
  };
};

/**
 * Register new user
 * @param {object} userData - User registration data (email, password, nombre, apellido, telefono)
 * @returns {Promise} Response data
 */
export const register = async ({ email, password, nombre, apellido, telefono, name, phone }) => {
  // Handle both naming conventions
  const clienteNombre = nombre || (name ? name.split(' ')[0] : '');
  const clienteApellido = apellido || (name ? name.split(' ').slice(1).join(' ') : '');
  const clienteTelefono = telefono || phone || '';

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nombre: clienteNombre,
        apellido: clienteApellido,
        telefono: clienteTelefono,
      },
    },
  });

  if (authError) throw authError;

  // Hash password for clientes table (in real app, this should be done server-side)
  // For now, we'll skip password_hash since Supabase handles auth

  // Create client profile
  const { data: cliente, error: clienteError } = await supabase
    .from('clientes')
    .insert([
      {
        nombre: clienteNombre,
        apellido: clienteApellido,
        email,
        telefono: clienteTelefono,
        password_hash: 'handled_by_supabase_auth', // Placeholder
        es_invitado: false,
        activo: true,
      },
    ])
    .select()
    .single();

  if (clienteError) {
    console.error('Error creating cliente:', clienteError);
    // Continue even if cliente creation fails
  }

  return {
    user: {
      id: cliente?.id_cliente || authData.user.id,
      id_cliente: cliente?.id_cliente,
      email: authData.user.email,
      nombre: cliente?.nombre || clienteNombre,
      apellido: cliente?.apellido || clienteApellido,
      telefono: cliente?.telefono || clienteTelefono,
      role: 'customer',
      es_invitado: false,
      activo: true,
    },
    token: authData.session?.access_token,
    session: authData.session,
  };
};

/**
 * Logout user
 * @returns {Promise} Response data
 */
export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return { success: true };
};

/**
 * Refresh authentication token
 * @returns {Promise} Response data
 */
export const refreshToken = async () => {
  const { data, error } = await supabase.auth.refreshSession();
  if (error) throw error;
  return {
    token: data.session.access_token,
    session: data.session,
  };
};

/**
 * Get current user profile
 * @returns {Promise} Response data
 */
export const getCurrentUser = async () => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error('No user logged in');

  // Get client profile from database
  const { data: cliente, error: clienteError } = await supabase
    .from('clientes')
    .select('*')
    .eq('email', user.email)
    .single();

  if (clienteError) {
    console.warn('Cliente not found');
  }

  return {
    user: {
      id: cliente?.id_cliente || user.id,
      id_cliente: cliente?.id_cliente,
      email: user.email,
      nombre: cliente?.nombre,
      apellido: cliente?.apellido,
      telefono: cliente?.telefono,
      role: 'customer',
      es_invitado: cliente?.es_invitado || false,
      activo: cliente?.activo !== undefined ? cliente.activo : true,
    },
  };
};

/**
 * Reset password
 * @param {string} email - User email
 * @returns {Promise} Response data
 */
export const resetPassword = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) throw error;
  return { success: true };
};

/**
 * Update password
 * @param {string} newPassword - New password
 * @returns {Promise} Response data
 */
export const updatePassword = async (newPassword) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
  return { success: true };
};
