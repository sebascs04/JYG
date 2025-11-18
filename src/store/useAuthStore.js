import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,

  // Initialize auth state from Supabase
  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        set({
          user: {
            id: session.user.id,
            email: session.user.email,
            role: profile?.role || 'customer',
            ...profile,
          },
          session,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ isLoading: false });
    }
  },

  // Login action
  login: (userData, session) => {
    set({
      user: userData,
      session,
      isAuthenticated: true,
    });
  },

  // Logout action
  logout: () => {
    set({
      user: null,
      session: null,
      isAuthenticated: false,
    });
  },

  // Update user data
  updateUser: (userData) => set({ user: userData }),

  // Check if user has specific role
  hasRole: (role) => {
    const state = get();
    return state.user?.role === role;
  },

  // Check if user has any of the specified roles
  hasAnyRole: (roles) => {
    const state = get();
    return roles.includes(state.user?.role);
  },

  // Check if user is admin
  isAdmin: () => {
    const state = get();
    return state.user?.role === 'admin';
  },

  // Check if user is employee or admin
  isEmployee: () => {
    const state = get();
    return ['employee', 'admin'].includes(state.user?.role);
  },
}));
