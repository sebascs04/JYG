import { supabase } from '../lib/supabase';

/**
 * Get all inventory items (products with stock info)
 * @param {object} params - Query parameters
 * @returns {Promise} Response data
 */
export const getInventory = async (params = {}) => {
  let query = supabase
    .from('products')
    .select('*', { count: 'exact' });

  // Apply category filter
  if (params.category) {
    query = query.eq('category', params.category);
  }

  // Apply low stock filter
  if (params.lowStock !== undefined) {
    query = query.lte('stock', params.lowStock);
  }

  // Apply pagination
  const page = params.page || 1;
  const limit = params.limit || 50;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.range(from, to);

  // Apply ordering
  query = query.order('stock', { ascending: true });

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    items: data,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };
};

/**
 * Update inventory item (product stock and price)
 * @param {string} id - Product ID
 * @param {object} updateData - Update data (stock, price, etc.)
 * @returns {Promise} Response data
 */
export const updateInventory = async (id, updateData) => {
  const { data, error } = await supabase
    .from('products')
    .update({
      ...updateData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return { item: data };
};

/**
 * Get low stock items
 * @param {number} threshold - Stock threshold
 * @returns {Promise} Response data
 */
export const getLowStockItems = async (threshold = 10) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .lte('stock', threshold)
    .order('stock', { ascending: true });

  if (error) throw error;

  return { items: data };
};

/**
 * Adjust stock for a product
 * @param {string} id - Product ID
 * @param {number} quantity - Quantity to add (positive) or subtract (negative)
 * @returns {Promise} Response data
 */
export const adjustStock = async (id, quantity) => {
  // Get current stock
  const { data: product, error: getError } = await supabase
    .from('products')
    .select('stock')
    .eq('id', id)
    .single();

  if (getError) throw getError;

  const newStock = product.stock + quantity;

  if (newStock < 0) {
    throw new Error('Stock cannot be negative');
  }

  // Update stock
  const { data, error } = await supabase
    .from('products')
    .update({
      stock: newStock,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return { item: data };
};

/**
 * Get inventory statistics
 * @returns {Promise} Response data with statistics
 */
export const getInventoryStats = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('stock, price, category');

  if (error) throw error;

  const stats = {
    totalProducts: data.length,
    totalValue: data.reduce((sum, item) => sum + (item.stock * item.price), 0),
    lowStockCount: data.filter(item => item.stock <= 10).length,
    outOfStockCount: data.filter(item => item.stock === 0).length,
    byCategory: {},
  };

  // Group by category
  data.forEach(item => {
    if (!stats.byCategory[item.category]) {
      stats.byCategory[item.category] = {
        count: 0,
        totalStock: 0,
        totalValue: 0,
      };
    }
    stats.byCategory[item.category].count++;
    stats.byCategory[item.category].totalStock += item.stock;
    stats.byCategory[item.category].totalValue += (item.stock * item.price);
  });

  return { stats };
};
