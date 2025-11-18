import axiosInstance from './axios.config';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Get all orders
 * @param {object} params - Query parameters (page, limit, status, etc.)
 * @returns {Promise} Response data
 */
export const getOrders = async (params = {}) => {
  const response = await axiosInstance.get(API_ENDPOINTS.ORDERS.LIST, { params });
  return response.data;
};

/**
 * Get order by ID
 * @param {string} id - Order ID
 * @returns {Promise} Response data
 */
export const getOrderById = async (id) => {
  const response = await axiosInstance.get(API_ENDPOINTS.ORDERS.DETAIL(id));
  return response.data;
};

/**
 * Create new order
 * @param {object} orderData - Order data
 * @returns {Promise} Response data
 */
export const createOrder = async (orderData) => {
  const response = await axiosInstance.post(API_ENDPOINTS.ORDERS.CREATE, orderData);
  return response.data;
};

/**
 * Update order status
 * @param {string} id - Order ID
 * @param {object} updateData - Update data
 * @returns {Promise} Response data
 */
export const updateOrder = async (id, updateData) => {
  const response = await axiosInstance.put(API_ENDPOINTS.ORDERS.UPDATE(id), updateData);
  return response.data;
};

/**
 * Cancel order
 * @param {string} id - Order ID
 * @returns {Promise} Response data
 */
export const cancelOrder = async (id) => {
  const response = await axiosInstance.patch(API_ENDPOINTS.ORDERS.UPDATE(id), {
    status: 'cancelled',
  });
  return response.data;
};
