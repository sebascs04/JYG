import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('authToken'),
  isAuthenticated: !!localStorage.getItem('authToken'),

  // Login action
  login: (userData, token) => {
    localStorage.setItem('authToken', token);
    set({ user: userData, token, isAuthenticated: true });
  },

  // Logout action
  logout: () => {
    localStorage.removeItem('authToken');
    set({ user: null, token: null, isAuthenticated: false });
  },

  // Update user data
  updateUser: (userData) => set({ user: userData }),

  // Check if user has specific role
  hasRole: (role) => {
    const state = useAuthStore.getState();
    return state.user?.role === role;
  },

  // Check if user has any of the specified roles
  hasAnyRole: (roles) => {
    const state = useAuthStore.getState();
    return roles.includes(state.user?.role);
  },
}));
