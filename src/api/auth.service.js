import axiosInstance from './axios.config';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Login user
 * @param {object} credentials - User credentials
 * @returns {Promise} Response data
 */
export const login = async (credentials) => {
  const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
  return response.data;
};

/**
 * Register new user
 * @param {object} userData - User registration data
 * @returns {Promise} Response data
 */
export const register = async (userData) => {
  const response = await axiosInstance.post(API_ENDPOINTS.AUTH.REGISTER, userData);
  return response.data;
};

/**
 * Logout user
 * @returns {Promise} Response data
 */
export const logout = async () => {
  const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT);
  return response.data;
};

/**
 * Refresh authentication token
 * @returns {Promise} Response data
 */
export const refreshToken = async () => {
  const response = await axiosInstance.post(API_ENDPOINTS.AUTH.REFRESH);
  return response.data;
};

/**
 * Get current user profile
 * @returns {Promise} Response data
 */
export const getCurrentUser = async () => {
  const response = await axiosInstance.get('/auth/me');
  return response.data;
};
