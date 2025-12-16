import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useCartStore } from '../../../store/useCartStore';
import { useAuthStore } from '../../../store/useAuthStore';
import { supabase } from '../../../lib/supabase';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Card from '../../../components/ui/Card';
import { formatPrice } from '../../../utils/formatters';

function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getSubtotal, getIGV, getTotalPrice, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: datos, 2: resumen
  const [orderCompleted, setOrderCompleted] = useState(false); // Para evitar redirección después de completar
  const isProcessingRef = useRef(false); // Ref para prevenir doble click

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();

  // Observar valores del formulario
  const formData = watch();

  // Pre-cargar datos del usuario
  useEffect(() => {
    if (user) {
      setValue('nombre', user.nombre || '');
      setValue('apellido', user.apellido || '');
      setValue('telefono', user.telefono || '');
      setValue('direccion', user.direccion || '');
      setValue('email', user.email || '');
    }
  }, [user, setValue]);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
    }
  }, [isAuthenticated, navigate]);

  // Redirigir si el carrito está vacío (pero no si acabamos de completar el pedido)
  useEffect(() => {
    if (items.length === 0 && !orderCompleted) {
      navigate('/cart');
    }
  }, [items, navigate, orderCompleted]);

  const subtotal = getSubtotal();
  const igv = getIGV();
  const total = getTotalPrice();

  const onSubmitStep1 = (data) => {
    // Guardar datos y pasar al resumen
    setStep(2);
  };

  const handleConfirmOrder = async () => {
    // Prevenir doble click con ref (más seguro que estado)
    if (isProcessingRef.current || isLoading) return;
    isProcessingRef.current = true;

    setError('');
    setIsLoading(true);

    try {
      // 0. Generar código único de pedido (máx 20 caracteres)
      const timestamp = Date.now().toString(36).toUpperCase(); // Base36 más corto
      const codigoPedido = `ORD-${timestamp}`;

      // 1. Determinar cliente y dirección
      // Si es cliente normal usa su id, si es admin/trabajador o invitado usa cliente 1
      const clienteId = user?.id_cliente || 1;

      // Buscar dirección existente del cliente o usar la 1 por defecto
      let idDireccion = 1;

      if (user?.id_cliente) {
        const { data: direccionExistente } = await supabase
          .from('direcciones_cliente')
          .select('id_direccion')
          .eq('id_cliente', user.id_cliente)
          .eq('es_principal', true)
          .single();

        if (direccionExistente) {
          idDireccion = direccionExistente.id_direccion;
        }
      }

      // 2. Crear el pedido en la base de datos
      // Guardamos dirección y comentarios en formato JSON parseable
      const observacionesData = JSON.stringify({
        direccion: formData.direccion,
        telefono: formData.telefono,
        comentarios: formData.comentarios || '',
      });

      const { data: pedido, error: pedidoError } = await supabase
        .from('pedidos')
        .insert([{
          codigo_pedido: codigoPedido,
          id_cliente: clienteId,
          id_direccion_entrega: idDireccion,
          id_estado_actual: 1, // Estado: PENDIENTE
          subtotal: subtotal,
          costo_envio: 0,
          total: total,
          observaciones_cliente: observacionesData,
        }])
        .select()
        .single();

      if (pedidoError) throw pedidoError;

      // 3. Insertar los detalles del pedido
      const detalles = items.map(item => {
        const precio = item.precio_unitario || item.price || 0;
        const cantidad = item.cantidad || item.quantity || 1;
        return {
          id_pedido: pedido.id_pedido,
          id_producto: item.id_producto || item.id,
          cantidad: cantidad,
          precio_historico: precio, // Usar precio_historico según el esquema
          // subtotal se calcula automáticamente en la BD
        };
      });

      const { error: detallesError } = await supabase
        .from('detalle_pedidos') // Tabla correcta con 's'
        .insert(detalles);

      if (detallesError) throw detallesError;

      // 3. Actualizar stock de productos
      for (const item of items) {
        const stockActual = item.stock_actual || item.stock || 0;
        const cantidad = item.cantidad || item.quantity || 1;
        const { error: stockError } = await supabase
          .from('productos')
          .update({
            stock_actual: stockActual - cantidad
          })
          .eq('id_producto', item.id_producto || item.id);

        if (stockError) console.error('Error actualizando stock:', stockError);
      }

      // 4. Navegar primero, luego limpiar carrito
      navigate('/order-success', {
        state: {
          orderId: pedido.id_pedido,
          codigoPedido: codigoPedido,
          total: total
        }
      });
      // Limpiar carrito después de navegar
      setTimeout(() => clearCart(), 100);

    } catch (err) {
      console.error('Error al crear pedido:', err);
      setError(err.message || 'Error al procesar el pedido');
      isProcessingRef.current = false; // Permitir reintentar si hay error
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {step === 1 ? 'Datos de Envío' : 'Confirmar Pedido'}
        </h1>

        {/* Progress Steps */}
        <div className="flex items-center mb-8">
          <div className={`flex items-center ${step >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${step >= 1 ? 'bg-green-600' : 'bg-gray-300'}`}>1</span>
            <span className="ml-2 font-medium">Datos</span>
          </div>
          <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center ${step >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${step >= 2 ? 'bg-green-600' : 'bg-gray-300'}`}>2</span>
            <span className="ml-2 font-medium">Confirmar</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 1 ? (
              <Card>
                <Card.Body>
                  <form id="checkout-form" onSubmit={handleSubmit(onSubmitStep1)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Nombres"
                        error={errors.nombre?.message}
                        {...register('nombre', { required: 'Requerido' })}
                      />
                      <Input
                        label="Apellidos"
                        error={errors.apellido?.message}
                        {...register('apellido', { required: 'Requerido' })}
                      />
                    </div>

                    <Input
                      label="Correo electrónico"
                      type="email"
                      error={errors.email?.message}
                      {...register('email', { required: 'Requerido' })}
                    />

                    <Input
                      label="Teléfono"
                      type="tel"
                      error={errors.telefono?.message}
                      {...register('telefono', { required: 'Requerido' })}
                    />

                    <Input
                      id="direccion"
                      label="Dirección de entrega"
                      error={errors.direccion?.message}
                      {...register('direccion', { required: 'Requerido' })}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Comentarios adicionales
                      </label>
                      <textarea
                        id="comentarios"
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Instrucciones especiales para la entrega..."
                        {...register('comentarios')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de comprobante
                      </label>
                      <select
                        id="comprobante"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        {...register('comprobante', { required: true })}
                      >
                        <option value="boleta">Boleta</option>
                        <option value="factura">Factura</option>
                      </select>
                    </div>
                  </form>
                </Card.Body>
                <Card.Footer>
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => navigate('/cart')}>
                      Volver al carrito
                    </Button>
                    <Button type="submit" form="checkout-form">
                      Continuar
                    </Button>
                  </div>
                </Card.Footer>
              </Card>
            ) : (
              <Card>
                <Card.Header>
                  <h2 className="text-xl font-semibold">Resumen del Pedido</h2>
                </Card.Header>
                <Card.Body>
                  {/* Lista de productos */}
                  <div className="space-y-4 mb-6">
                    {items.map((item) => {
                      const precio = item.precio_unitario || item.price || 0;
                      const cantidad = item.cantidad || item.quantity || 1;
                      return (
                        <div key={item.id_producto || item.id} className="flex items-center gap-4 py-3 border-b">
                          <img
                            src={item.imagen_url || item.image || 'https://via.placeholder.com/60'}
                            alt={item.nombre || item.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{item.nombre || item.name}</h4>
                            <p className="text-sm text-gray-500">
                              {cantidad} x {formatPrice(precio)}
                            </p>
                          </div>
                          <p className="font-semibold">
                            {formatPrice(precio * cantidad)}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Datos de entrega */}
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <h3 className="font-semibold text-gray-900 mb-3">Datos de entrega</h3>
                    <p className="text-sm"><span className="text-gray-500">Dirección:</span> {formData.direccion}</p>
                    <p className="text-sm"><span className="text-gray-500">Teléfono:</span> {formData.telefono}</p>
                    <p className="text-sm"><span className="text-gray-500">Comprobante:</span> {formData.comprobante === 'boleta' ? 'Boleta' : 'Factura'}</p>
                    {formData.comentarios && (
                      <p className="text-sm"><span className="text-gray-500">Comentarios:</span> {formData.comentarios}</p>
                    )}
                  </div>
                </Card.Body>
                <Card.Footer>
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      Modificar datos
                    </Button>
                    <Button
                      onClick={handleConfirmOrder}
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isLoading ? 'Procesando...' : 'Confirmar Pedido'}
                    </Button>
                  </div>
                </Card.Footer>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <Card>
              <Card.Header>
                <h2 className="text-lg font-semibold">Tu Pedido</h2>
              </Card.Header>
              <Card.Body>
                <div className="space-y-3">
                  {items.map((item) => {
                    const precio = item.precio_unitario || item.price || 0;
                    const cantidad = item.cantidad || item.quantity || 1;
                    return (
                      <div key={item.id_producto || item.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.nombre || item.name} x{cantidad}
                        </span>
                        <span>{formatPrice(precio * cantidad)}</span>
                      </div>
                    );
                  })}

                  <div className="border-t pt-3 mt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>IGV (18%)</span>
                      <span>{formatPrice(igv)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Envío</span>
                      <span>Gratis</span>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-green-600">{formatPrice(total)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Incluye IGV</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
    </div>
  );
}

export default CheckoutPage;
