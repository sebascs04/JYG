import { supabase } from '../lib/supabase';

/**
 * Get all inventory items (products with stock info)
 * @param {object} params - Query parameters
 * @returns {Promise} Response data
 */
export const getInventory = async (params = {}) => {
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

  // Apply low stock filter
  if (params.lowStock !== undefined) {
    query = query.lte('stock_actual', params.lowStock);
  }

  // Apply pagination
  const page = params.page || 1;
  const limit = params.limit || 50;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.range(from, to);

  // Apply ordering
  query = query.order('stock_actual', { ascending: true });

  const { data, error, count } = await query;

  if (error) throw error;

  // Transform data to match frontend expectations
  const transformedItems = data.map(product => ({
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
    items: transformedItems,
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
  const dbUpdate = {};

  if (updateData.stock !== undefined) dbUpdate.stock_actual = updateData.stock;
  if (updateData.stock_actual !== undefined) dbUpdate.stock_actual = updateData.stock_actual;
  if (updateData.price !== undefined) dbUpdate.precio_unitario = updateData.price;
  if (updateData.precio_unitario !== undefined) dbUpdate.precio_unitario = updateData.precio_unitario;

  const { data, error } = await supabase
    .from('productos')
    .update(dbUpdate)
    .eq('id_producto', id)
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
    .from('productos')
    .select(`
      *,
      categorias (
        id_categoria,
        nombre,
        activa
      )
    `)
    .eq('activo', true)
    .lte('stock_actual', threshold)
    .order('stock_actual', { ascending: true });

  if (error) throw error;

  // Transform data to match frontend expectations
  const transformedItems = data.map(product => ({
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

  return { items: transformedItems };
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
    .from('productos')
    .select('stock_actual')
    .eq('id_producto', id)
    .single();

  if (getError) throw getError;

  const newStock = parseFloat(product.stock_actual) + quantity;

  if (newStock < 0) {
    throw new Error('Stock cannot be negative');
  }

  // Update stock
  const { data, error } = await supabase
    .from('productos')
    .update({
      stock_actual: newStock,
    })
    .eq('id_producto', id)
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
    .from('productos')
    .select(`
      stock_actual,
      precio_unitario,
      categorias (
        nombre
      )
    `)
    .eq('activo', true);

  if (error) throw error;

  const stats = {
    totalProducts: data.length,
    totalValue: data.reduce((sum, item) => {
      return sum + (parseFloat(item.stock_actual) * parseFloat(item.precio_unitario));
    }, 0),
    lowStockCount: data.filter(item => parseFloat(item.stock_actual) <= 10).length,
    outOfStockCount: data.filter(item => parseFloat(item.stock_actual) === 0).length,
    byCategory: {},
  };

  // Group by category
  data.forEach(item => {
    const categoryName = item.categorias?.nombre || 'Sin categoría';
    if (!stats.byCategory[categoryName]) {
      stats.byCategory[categoryName] = {
        count: 0,
        totalStock: 0,
        totalValue: 0,
      };
    }
    stats.byCategory[categoryName].count++;
    stats.byCategory[categoryName].totalStock += parseFloat(item.stock_actual);
    stats.byCategory[categoryName].totalValue += (parseFloat(item.stock_actual) * parseFloat(item.precio_unitario));
  });

  return { stats };
};
