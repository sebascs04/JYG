import axiosInstance from './axios.config';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Get all inventory items
 * @param {object} params - Query parameters
 * @returns {Promise} Response data
 */
export const getInventory = async (params = {}) => {
  const response = await axiosInstance.get(API_ENDPOINTS.INVENTORY.LIST, { params });
  return response.data;
};

/**
 * Update inventory item
 * @param {string} id - Inventory item ID
 * @param {object} updateData - Update data (quantity, price, etc.)
 * @returns {Promise} Response data
 */
export const updateInventory = async (id, updateData) => {
  const response = await axiosInstance.put(API_ENDPOINTS.INVENTORY.UPDATE(id), updateData);
  return response.data;
};

/**
 * Get low stock items
 * @param {number} threshold - Stock threshold
 * @returns {Promise} Response data
 */
export const getLowStockItems = async (threshold = 10) => {
  const response = await axiosInstance.get(API_ENDPOINTS.INVENTORY.LIST, {
    params: { lowStock: threshold },
  });
  return response.data;
};
