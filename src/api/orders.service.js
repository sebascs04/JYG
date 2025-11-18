import { supabase } from '../lib/supabase';

/**
 * Get all orders
 * @param {object} params - Query parameters (page, limit, status, userId, etc.)
 * @returns {Promise} Response data
 */
export const getOrders = async (params = {}) => {
  let query = supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        product:products (*)
      ),
      profile:profiles (*)
    `, { count: 'exact' });

  // Apply status filter
  if (params.status) {
    query = query.eq('status', params.status);
  }

  // Apply user filter
  if (params.userId) {
    query = query.eq('user_id', params.userId);
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
    orders: data,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };
};

/**
 * Get order by ID
 * @param {string} id - Order ID
 * @returns {Promise} Response data
 */
export const getOrderById = async (id) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        product:products (*)
      ),
      profile:profiles (*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;

  return { order: data };
};

/**
 * Get user orders
 * @param {string} userId - User ID
 * @returns {Promise} Response data
 */
export const getUserOrders = async (userId) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        product:products (*)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return { orders: data };
};

/**
 * Create new order
 * @param {object} orderData - Order data (items, shippingAddress, paymentMethod, etc.)
 * @returns {Promise} Response data
 */
export const createOrder = async (orderData) => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('User not authenticated');

  // Calculate totals
  const subtotal = orderData.items.reduce(
    (sum, item) => sum + (item.price * item.quantity),
    0
  );
  const shipping = 5.00; // Fixed shipping cost
  const total = subtotal + shipping;

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([
      {
        user_id: user.id,
        status: 'pending',
        subtotal,
        shipping,
        total,
        shipping_address: orderData.shippingAddress,
        payment_method: orderData.paymentMethod,
        notes: orderData.notes || null,
      },
    ])
    .select()
    .single();

  if (orderError) throw orderError;

  // Create order items
  const orderItems = orderData.items.map(item => ({
    order_id: order.id,
    product_id: item.productId,
    quantity: item.quantity,
    price: item.price,
    subtotal: item.price * item.quantity,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    // Rollback: delete the order if items creation fails
    await supabase.from('orders').delete().eq('id', order.id);
    throw itemsError;
  }

  // Get complete order with items
  const { data: completeOrder, error: fetchError } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        product:products (*)
      )
    `)
    .eq('id', order.id)
    .single();

  if (fetchError) throw fetchError;

  return { order: completeOrder };
};

/**
 * Update order status
 * @param {string} id - Order ID
 * @param {object} updateData - Update data (status, tracking_number, etc.)
 * @returns {Promise} Response data
 */
export const updateOrder = async (id, updateData) => {
  const { data, error } = await supabase
    .from('orders')
    .update({
      ...updateData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(`
      *,
      order_items (
        *,
        product:products (*)
      )
    `)
    .single();

  if (error) throw error;

  return { order: data };
};

/**
 * Cancel order
 * @param {string} id - Order ID
 * @returns {Promise} Response data
 */
export const cancelOrder = async (id) => {
  return updateOrder(id, { status: 'cancelled' });
};

/**
 * Update order status to processing
 * @param {string} id - Order ID
 * @returns {Promise} Response data
 */
export const processOrder = async (id) => {
  return updateOrder(id, { status: 'processing' });
};

/**
 * Update order status to shipped
 * @param {string} id - Order ID
 * @param {string} trackingNumber - Tracking number
 * @returns {Promise} Response data
 */
export const shipOrder = async (id, trackingNumber) => {
  return updateOrder(id, {
    status: 'shipped',
    tracking_number: trackingNumber
  });
};

/**
 * Update order status to delivered
 * @param {string} id - Order ID
 * @returns {Promise} Response data
 */
export const deliverOrder = async (id) => {
  return updateOrder(id, { status: 'delivered' });
};
