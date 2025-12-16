import { supabase } from '../lib/supabase';

/**
 * Get all active categories
 * @returns {Promise} Response data with categories
 */
export const getCategories = async () => {
  console.log('🔗 Conectando a Supabase para categorías...');

  // Timeout de 10 segundos
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout: Supabase tardó más de 10s')), 10000)
  );

  const queryPromise = supabase
    .from('categorias')
    .select('*')
    .eq('activa', true)
    .order('nombre', { ascending: true });

  try {
    const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

    if (error) {
      console.error('❌ Error de Supabase:', error);
      throw error;
    }

    console.log('✅ Categorías recibidas:', data?.length || 0);

    // Transform data to match frontend expectations
    const transformedCategories = (data || []).map(category => ({
      id: category.id_categoria,
      id_categoria: category.id_categoria,
      name: category.nombre,
      nombre: category.nombre,
      activa: category.activa,
    }));

    return { categories: transformedCategories };
  } catch (err) {
    console.error('❌ Error en getCategories:', err.message);
    // Retornar array vacío en vez de fallar
    return { categories: [] };
  }
};

/**
 * Get category by ID
 * @param {number} id - Category ID
 * @returns {Promise} Response data
 */
export const getCategoryById = async (id) => {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .eq('id_categoria', id)
    .single();

  if (error) throw error;

  return {
    category: {
      id: data.id_categoria,
      id_categoria: data.id_categoria,
      name: data.nombre,
      nombre: data.nombre,
      activa: data.activa,
    },
  };
};

/**
 * Create a new category (admin only)
 * @param {object} categoryData - Category data
 * @returns {Promise} Response data
 */
export const createCategory = async (categoryData) => {
  const { data, error } = await supabase
    .from('categorias')
    .insert([
      {
        nombre: categoryData.name || categoryData.nombre,
        activa: categoryData.activa !== undefined ? categoryData.activa : true,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return { category: data };
};

/**
 * Update a category (admin only)
 * @param {number} id - Category ID
 * @param {object} categoryData - Updated category data
 * @returns {Promise} Response data
 */
export const updateCategory = async (id, categoryData) => {
  const updateData = {};

  if (categoryData.name !== undefined) updateData.nombre = categoryData.name;
  if (categoryData.nombre !== undefined) updateData.nombre = categoryData.nombre;
  if (categoryData.activa !== undefined) updateData.activa = categoryData.activa;

  const { data, error } = await supabase
    .from('categorias')
    .update(updateData)
    .eq('id_categoria', id)
    .select()
    .single();

  if (error) throw error;

  return { category: data };
};

/**
 * Delete a category (admin only) - soft delete
 * @param {number} id - Category ID
 * @returns {Promise} Response data
 */
export const deleteCategory = async (id) => {
  const { error } = await supabase
    .from('categorias')
    .update({ activa: false })
    .eq('id_categoria', id);

  if (error) throw error;

  return { success: true };
};
