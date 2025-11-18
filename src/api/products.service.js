import axiosInstance from './axios.config';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Get all products
 * @param {object} params - Query parameters (page, limit, category, etc.)
 * @returns {Promise} Response data
 */
export const getProducts = async (params = {}) => {
  const response = await axiosInstance.get(API_ENDPOINTS.PRODUCTS.LIST, { params });
  return response.data;
};

/**
 * Get product by ID
 * @param {string} id - Product ID
 * @returns {Promise} Response data
 */
export const getProductById = async (id) => {
  const response = await axiosInstance.get(API_ENDPOINTS.PRODUCTS.DETAIL(id));
  return response.data;
};

/**
 * Search products
 * @param {string} query - Search query
 * @param {object} filters - Additional filters
 * @returns {Promise} Response data
 */
export const searchProducts = async (query, filters = {}) => {
  const response = await axiosInstance.get(API_ENDPOINTS.PRODUCTS.SEARCH, {
    params: { q: query, ...filters },
  });
  return response.data;
};

/**
 * Get products by category
 * @param {string} categoryId - Category ID
 * @param {object} params - Query parameters
 * @returns {Promise} Response data
 */
export const getProductsByCategory = async (categoryId, params = {}) => {
  const response = await axiosInstance.get(API_ENDPOINTS.PRODUCTS.LIST, {
    params: { category: categoryId, ...params },
  });
  return response.data;
};
