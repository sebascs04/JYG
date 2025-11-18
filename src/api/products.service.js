import { supabase } from '../lib/supabase';

/**
 * Get all products
 * @param {object} params - Query parameters (page, limit, category, etc.)
 * @returns {Promise} Response data
 */
export const getProducts = async (params = {}) => {
  let query = supabase
    .from('productos')
    .select(`
      *,
      categorias (
        id_categoria,
        nombre,
        activa
      )
    `, { count: 'exact' })
    .eq('activo', true);

  // Apply category filter
  if (params.category) {
    query = query.eq('id_categoria', params.category);
  }

  // Apply pagination
  const page = params.page || 1;
  const limit = params.limit || 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.range(from, to);

  // Apply ordering
  query = query.order('id_producto', { ascending: false });

  const { data, error, count } = await query;

  if (error) throw error;

  // Transform data to match frontend expectations
  const transformedProducts = data.map(product => ({
    id: product.id_producto,
    id_producto: product.id_producto,
    name: product.nombre,
    description: product.descripcion,
    price: parseFloat(product.precio_unitario),
    stock: parseFloat(product.stock_actual),
    category: product.categorias?.nombre || '',
    id_categoria: product.id_categoria,
    image: product.imagen_url,
    sku: product.sku,
    unidad_medida: product.unidad_medida,
    activo: product.activo,
  }));

  return {
    products: transformedProducts,
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
    .from('productos')
    .select(`
      *,
      categorias (
        id_categoria,
        nombre,
        activa
      )
    `)
    .eq('id_producto', id)
    .single();

  if (error) throw error;

  // Transform data to match frontend expectations
  const product = {
    id: data.id_producto,
    id_producto: data.id_producto,
    name: data.nombre,
    description: data.descripcion,
    price: parseFloat(data.precio_unitario),
    stock: parseFloat(data.stock_actual),
    category: data.categorias?.nombre || '',
    id_categoria: data.id_categoria,
    image: data.imagen_url,
    sku: data.sku,
    unidad_medida: data.unidad_medida,
    activo: data.activo,
  };

  return { product };
};

/**
 * Search products
 * @param {string} query - Search query
 * @param {object} filters - Additional filters
 * @returns {Promise} Response data
 */
export const searchProducts = async (query, filters = {}) => {
  let supabaseQuery = supabase
    .from('productos')
    .select(`
      *,
      categorias (
        id_categoria,
        nombre,
        activa
      )
    `, { count: 'exact' })
    .eq('activo', true);

  // Text search on name and description
  if (query) {
    supabaseQuery = supabaseQuery.or(
      `nombre.ilike.%${query}%,descripcion.ilike.%${query}%`
    );
  }

  // Apply additional filters
  if (filters.category) {
    supabaseQuery = supabaseQuery.eq('id_categoria', filters.category);
  }

  if (filters.minPrice) {
    supabaseQuery = supabaseQuery.gte('precio_unitario', filters.minPrice);
  }

  if (filters.maxPrice) {
    supabaseQuery = supabaseQuery.lte('precio_unitario', filters.maxPrice);
  }

  // Apply ordering
  supabaseQuery = supabaseQuery.order('id_producto', { ascending: false });

  const { data, error, count } = await supabaseQuery;

  if (error) throw error;

  // Transform data to match frontend expectations
  const transformedProducts = data.map(product => ({
    id: product.id_producto,
    id_producto: product.id_producto,
    name: product.nombre,
    description: product.descripcion,
    price: parseFloat(product.precio_unitario),
    stock: parseFloat(product.stock_actual),
    category: product.categorias?.nombre || '',
    id_categoria: product.id_categoria,
    image: product.imagen_url,
    sku: product.sku,
    unidad_medida: product.unidad_medida,
    activo: product.activo,
  }));

  return {
    products: transformedProducts,
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
  const dbProduct = {
    id_categoria: productData.id_categoria,
    sku: productData.sku,
    nombre: productData.name || productData.nombre,
    descripcion: productData.description || productData.descripcion,
    precio_unitario: productData.price || productData.precio_unitario,
    stock_actual: productData.stock || productData.stock_actual || 0,
    unidad_medida: productData.unidad_medida || 'UNIDAD',
    imagen_url: productData.image || productData.imagen_url,
    activo: productData.activo !== undefined ? productData.activo : true,
  };

  const { data, error } = await supabase
    .from('productos')
    .insert([dbProduct])
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
  const dbProduct = {};

  if (productData.id_categoria !== undefined) dbProduct.id_categoria = productData.id_categoria;
  if (productData.sku !== undefined) dbProduct.sku = productData.sku;
  if (productData.name !== undefined) dbProduct.nombre = productData.name;
  if (productData.nombre !== undefined) dbProduct.nombre = productData.nombre;
  if (productData.description !== undefined) dbProduct.descripcion = productData.description;
  if (productData.descripcion !== undefined) dbProduct.descripcion = productData.descripcion;
  if (productData.price !== undefined) dbProduct.precio_unitario = productData.price;
  if (productData.precio_unitario !== undefined) dbProduct.precio_unitario = productData.precio_unitario;
  if (productData.stock !== undefined) dbProduct.stock_actual = productData.stock;
  if (productData.stock_actual !== undefined) dbProduct.stock_actual = productData.stock_actual;
  if (productData.unidad_medida !== undefined) dbProduct.unidad_medida = productData.unidad_medida;
  if (productData.image !== undefined) dbProduct.imagen_url = productData.image;
  if (productData.imagen_url !== undefined) dbProduct.imagen_url = productData.imagen_url;
  if (productData.activo !== undefined) dbProduct.activo = productData.activo;

  const { data, error } = await supabase
    .from('productos')
    .update(dbProduct)
    .eq('id_producto', id)
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
  // Soft delete - just mark as inactive
  const { error } = await supabase
    .from('productos')
    .update({ activo: false })
    .eq('id_producto', id);

  if (error) throw error;

  return { success: true };
};
