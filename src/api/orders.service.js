import { supabase } from '../lib/supabase';

/**
 * Get all orders/pedidos
 * @param {object} params - Query parameters (page, limit, status, userId, etc.)
 * @returns {Promise} Response data
 */
export const getOrders = async (params = {}) => {
  let query = supabase
    .from('pedidos')
    .select(`
      *,
      cliente:clientes!id_cliente (*),
      estado:estados_pedido!id_estado_actual (*),
      direccion:direcciones_cliente!id_direccion_entrega (*),
      repartidor:trabajadores!id_repartidor_asignado (*),
      detalle_pedidos (
        *,
        producto:productos (
          *,
          categorias (*)
        )
      )
    `, { count: 'exact' });

  // Apply status filter
  if (params.status) {
    query = query.eq('id_estado_actual', params.status);
  }

  // Apply user filter
  if (params.userId) {
    query = query.eq('id_cliente', params.userId);
  }

  // Apply pagination
  const page = params.page || 1;
  const limit = params.limit || 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.range(from, to);

  // Apply ordering
  query = query.order('fecha_pedido', { ascending: false });

  const { data, error, count } = await query;

  if (error) throw error;

  // Transform to match frontend expectations
  const transformedOrders = data.map(pedido => ({
    id: pedido.id_pedido,
    id_pedido: pedido.id_pedido,
    codigo_pedido: pedido.codigo_pedido,
    id_cliente: pedido.id_cliente,
    cliente: pedido.cliente,
    status: pedido.estado?.nombre_estado || 'pending',
    estado: pedido.estado,
    subtotal: parseFloat(pedido.subtotal),
    shipping: parseFloat(pedido.costo_envio),
    total: parseFloat(pedido.total),
    created_at: pedido.fecha_pedido,
    fecha_pedido: pedido.fecha_pedido,
    observaciones_cliente: pedido.observaciones_cliente,
    direccion_entrega: pedido.direccion,
    repartidor: pedido.repartidor,
    items: pedido.detalle_pedidos?.map(detalle => ({
      id: detalle.id_detalle,
      product_id: detalle.id_producto,
      quantity: parseFloat(detalle.cantidad),
      price: parseFloat(detalle.precio_historico),
      subtotal: parseFloat(detalle.subtotal),
      product: detalle.producto ? {
        id: detalle.producto.id_producto,
        name: detalle.producto.nombre,
        description: detalle.producto.descripcion,
        price: parseFloat(detalle.producto.precio_unitario),
        stock: parseFloat(detalle.producto.stock_actual),
        image: detalle.producto.imagen_url,
        category: detalle.producto.categorias?.nombre,
      } : null,
    })) || [],
  }));

  return {
    orders: transformedOrders,
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
    .from('pedidos')
    .select(`
      *,
      cliente:clientes!id_cliente (*),
      estado:estados_pedido!id_estado_actual (*),
      direccion:direcciones_cliente!id_direccion_entrega (*),
      repartidor:trabajadores!id_repartidor_asignado (*),
      detalle_pedidos (
        *,
        producto:productos (
          *,
          categorias (*)
        )
      )
    `)
    .eq('id_pedido', id)
    .single();

  if (error) throw error;

  // Transform to match frontend expectations
  const order = {
    id: data.id_pedido,
    id_pedido: data.id_pedido,
    codigo_pedido: data.codigo_pedido,
    id_cliente: data.id_cliente,
    cliente: data.cliente,
    status: data.estado?.nombre_estado || 'pending',
    estado: data.estado,
    subtotal: parseFloat(data.subtotal),
    shipping: parseFloat(data.costo_envio),
    total: parseFloat(data.total),
    created_at: data.fecha_pedido,
    fecha_pedido: data.fecha_pedido,
    observaciones_cliente: data.observaciones_cliente,
    direccion_entrega: data.direccion,
    repartidor: data.repartidor,
    items: data.detalle_pedidos?.map(detalle => ({
      id: detalle.id_detalle,
      product_id: detalle.id_producto,
      quantity: parseFloat(detalle.cantidad),
      price: parseFloat(detalle.precio_historico),
      subtotal: parseFloat(detalle.subtotal),
      product: detalle.producto ? {
        id: detalle.producto.id_producto,
        name: detalle.producto.nombre,
        description: detalle.producto.descripcion,
        price: parseFloat(detalle.producto.precio_unitario),
        stock: parseFloat(detalle.producto.stock_actual),
        image: detalle.producto.imagen_url,
        category: detalle.producto.categorias?.nombre,
      } : null,
    })) || [],
  };

  return { order };
};

/**
 * Get user orders
 * @param {string} userId - User ID (id_cliente)
 * @returns {Promise} Response data
 */
export const getUserOrders = async (userId) => {
  return getOrders({ userId });
};

/**
 * Create new order
 * @param {object} orderData - Order data (items, shippingAddress, paymentMethod, etc.)
 * @returns {Promise} Response data
 */
export const createOrder = async (orderData) => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('User not authenticated');

  // Get cliente ID
  const { data: cliente } = await supabase
    .from('clientes')
    .select('id_cliente')
    .eq('email', user.email)
    .single();

  if (!cliente) throw new Error('Cliente not found');

  // Calculate totals
  const subtotal = orderData.items.reduce(
    (sum, item) => sum + (item.price * item.quantity),
    0
  );
  const shipping = orderData.shipping || 5.00;
  const total = subtotal + shipping;

  // Generate unique order code
  const codigo_pedido = `PED-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Get direccion_entrega ID or create one
  let id_direccion_entrega = orderData.id_direccion_entrega;

  if (!id_direccion_entrega && orderData.shippingAddress) {
    const { data: newDireccion, error: direccionError } = await supabase
      .from('direcciones_cliente')
      .insert([
        {
          id_cliente: cliente.id_cliente,
          direccion_completa: orderData.shippingAddress.address || orderData.shippingAddress.direccion_completa,
          referencia: orderData.shippingAddress.reference || orderData.shippingAddress.referencia,
          ciudad: orderData.shippingAddress.city || orderData.shippingAddress.ciudad || 'Lima',
          codigo_postal: orderData.shippingAddress.zip || orderData.shippingAddress.codigo_postal,
          alias: orderData.shippingAddress.alias || 'Principal',
        },
      ])
      .select()
      .single();

    if (direccionError) throw direccionError;
    id_direccion_entrega = newDireccion.id_direccion;
  }

  // Get estado "pending" ID
  const { data: estadoPending } = await supabase
    .from('estados_pedido')
    .select('id_estado')
    .eq('nombre_estado', 'Pendiente')
    .single();

  const id_estado_actual = estadoPending?.id_estado || 1;

  // Create pedido
  const { data: pedido, error: pedidoError } = await supabase
    .from('pedidos')
    .insert([
      {
        codigo_pedido,
        id_cliente: cliente.id_cliente,
        id_direccion_entrega,
        id_estado_actual,
        subtotal,
        costo_envio: shipping,
        total,
        observaciones_cliente: orderData.notes || orderData.observaciones_cliente || null,
      },
    ])
    .select()
    .single();

  if (pedidoError) throw pedidoError;

  // Create detalle_pedidos
  const detalleItems = orderData.items.map(item => ({
    id_pedido: pedido.id_pedido,
    id_producto: item.productId || item.id_producto || item.product_id || item.id,
    cantidad: item.quantity || item.cantidad,
    precio_historico: item.price || item.precio,
    // subtotal is auto-calculated by database
  }));

  const { error: detalleError } = await supabase
    .from('detalle_pedidos')
    .insert(detalleItems);

  if (detalleError) {
    // Rollback: delete the pedido if items creation fails
    await supabase.from('pedidos').delete().eq('id_pedido', pedido.id_pedido);
    throw detalleError;
  }

  // Get complete order with relations
  return getOrderById(pedido.id_pedido);
};

/**
 * Update order status
 * @param {string} id - Order ID
 * @param {object} updateData - Update data (status, tracking_number, etc.)
 * @returns {Promise} Response data
 */
export const updateOrder = async (id, updateData) => {
  const dbUpdate = {};

  if (updateData.status !== undefined) {
    // Get estado ID from nombre_estado
    const { data: estado } = await supabase
      .from('estados_pedido')
      .select('id_estado')
      .eq('nombre_estado', updateData.status)
      .single();

    if (estado) {
      dbUpdate.id_estado_actual = estado.id_estado;
    }
  }

  if (updateData.id_estado_actual !== undefined) {
    dbUpdate.id_estado_actual = updateData.id_estado_actual;
  }

  if (updateData.id_repartidor_asignado !== undefined) {
    dbUpdate.id_repartidor_asignado = updateData.id_repartidor_asignado;
  }

  if (updateData.observaciones_cliente !== undefined) {
    dbUpdate.observaciones_cliente = updateData.observaciones_cliente;
  }

  const { error } = await supabase
    .from('pedidos')
    .update(dbUpdate)
    .eq('id_pedido', id);

  if (error) throw error;

  // Return updated order
  return getOrderById(id);
};

/**
 * Cancel order
 * @param {string} id - Order ID
 * @returns {Promise} Response data
 */
export const cancelOrder = async (id) => {
  // Get estado "Cancelado" ID
  const { data: estadoCancelado } = await supabase
    .from('estados_pedido')
    .select('id_estado')
    .eq('nombre_estado', 'Cancelado')
    .single();

  return updateOrder(id, { id_estado_actual: estadoCancelado?.id_estado || 5 });
};

/**
 * Update order status to processing
 * @param {string} id - Order ID
 * @returns {Promise} Response data
 */
export const processOrder = async (id) => {
  const { data: estado } = await supabase
    .from('estados_pedido')
    .select('id_estado')
    .eq('nombre_estado', 'En Proceso')
    .single();

  return updateOrder(id, { id_estado_actual: estado?.id_estado || 2 });
};

/**
 * Update order status to shipped/en camino
 * @param {string} id - Order ID
 * @param {string} trackingNumber - Tracking number (optional)
 * @returns {Promise} Response data
 */
export const shipOrder = async (id, trackingNumber) => {
  const { data: estado } = await supabase
    .from('estados_pedido')
    .select('id_estado')
    .eq('nombre_estado', 'En Camino')
    .single();

  return updateOrder(id, { id_estado_actual: estado?.id_estado || 3 });
};

/**
 * Update order status to delivered/entregado
 * @param {string} id - Order ID
 * @returns {Promise} Response data
 */
export const deliverOrder = async (id) => {
  const { data: estado } = await supabase
    .from('estados_pedido')
    .select('id_estado')
    .eq('nombre_estado', 'Entregado')
    .single();

  return updateOrder(id, { id_estado_actual: estado?.id_estado || 4 });
};
