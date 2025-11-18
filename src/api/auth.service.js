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

  // Get user profile from database
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profileError) {
    console.warn('Profile not found, using default data');
  }

  return {
    user: {
      id: data.user.id,
      email: data.user.email,
      role: profile?.role || 'customer',
      ...profile,
    },
    token: data.session.access_token,
    session: data.session,
  };
};

/**
 * Register new user
 * @param {object} userData - User registration data (email, password, name, phone)
 * @returns {Promise} Response data
 */
export const register = async ({ email, password, name, phone, role = 'customer' }) => {
  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        phone,
      },
    },
  });

  if (authError) throw authError;

  // Create user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .insert([
      {
        id: authData.user.id,
        email,
        name,
        phone,
        role,
      },
    ])
    .select()
    .single();

  if (profileError) {
    console.error('Error creating profile:', profileError);
    // Continue even if profile creation fails
  }

  return {
    user: {
      id: authData.user.id,
      email: authData.user.email,
      role: profile?.role || role,
      ...profile,
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

  // Get user profile from database
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.warn('Profile not found');
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      role: profile?.role || 'customer',
      ...profile,
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
