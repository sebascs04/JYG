import { supabase } from '../lib/supabase';

/**
 * Get all active categories
 * @returns {Promise} Response data with categories
 */
export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .eq('activa', true)
    .order('nombre', { ascending: true });

  if (error) throw error;

  // Transform data to match frontend expectations
  const transformedCategories = data.map(category => ({
    id: category.id_categoria,
    id_categoria: category.id_categoria,
    name: category.nombre,
    nombre: category.nombre,
    activa: category.activa,
  }));

  return { categories: transformedCategories };
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
