import { supabase } from '../lib/supabase';

/**
 * Get all products
 * @param {object} params - Query parameters (page, limit, category, etc.)
 * @returns {Promise} Response data
 */
export const getProducts = async (params = {}) => {
  let query = supabase
    .from('products')
    .select('*', { count: 'exact' });

  // Apply category filter
  if (params.category) {
    query = query.eq('category', params.category);
  }

  // Apply pagination
  const page = params.page || 1;
  const limit = params.limit || 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.range(from, to);

  // Apply ordering
  query = query.order('created_at', { ascending: false });

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    products: data,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };
};

/**
 * Get product by ID
 * @param {string} id - Product ID
 * @returns {Promise} Response data
 */
export const getProductById = async (id) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;

  return { product: data };
};

/**
 * Search products
 * @param {string} query - Search query
 * @param {object} filters - Additional filters
 * @returns {Promise} Response data
 */
export const searchProducts = async (query, filters = {}) => {
  let supabaseQuery = supabase
    .from('products')
    .select('*', { count: 'exact' });

  // Text search on name and description
  if (query) {
    supabaseQuery = supabaseQuery.or(
      `name.ilike.%${query}%,description.ilike.%${query}%`
    );
  }

  // Apply additional filters
  if (filters.category) {
    supabaseQuery = supabaseQuery.eq('category', filters.category);
  }

  if (filters.minPrice) {
    supabaseQuery = supabaseQuery.gte('price', filters.minPrice);
  }

  if (filters.maxPrice) {
    supabaseQuery = supabaseQuery.lte('price', filters.maxPrice);
  }

  // Apply ordering
  supabaseQuery = supabaseQuery.order('created_at', { ascending: false });

  const { data, error, count } = await supabaseQuery;

  if (error) throw error;

  return {
    products: data,
    total: count,
  };
};

/**
 * Get products by category
 * @param {string} categoryId - Category ID
 * @param {object} params - Query parameters
 * @returns {Promise} Response data
 */
export const getProductsByCategory = async (categoryId, params = {}) => {
  return getProducts({ ...params, category: categoryId });
};

/**
 * Create a new product (admin only)
 * @param {object} productData - Product data
 * @returns {Promise} Response data
 */
export const createProduct = async (productData) => {
  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select()
    .single();

  if (error) throw error;

  return { product: data };
};

/**
 * Update a product (admin only)
 * @param {string} id - Product ID
 * @param {object} productData - Updated product data
 * @returns {Promise} Response data
 */
export const updateProduct = async (id, productData) => {
  const { data, error } = await supabase
    .from('products')
    .update(productData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return { product: data };
};

/**
 * Delete a product (admin only)
 * @param {string} id - Product ID
 * @returns {Promise} Response data
 */
export const deleteProduct = async (id) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;

  return { success: true };
};
