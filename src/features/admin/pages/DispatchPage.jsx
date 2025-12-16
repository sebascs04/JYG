import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Spinner from '../../../components/ui/Spinner';
import { Truck, Package, CheckCircle, Clock, MapPin, Phone, User } from 'lucide-react';
import { formatPrice } from '../../../utils/formatters';

function DispatchPage() {
  const [pedidos, setPedidos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [filter, setFilter] = useState('todos'); // todos, listos, en_camino

  useEffect(() => {
    loadPedidos();
  }, []);

  const loadPedidos = async () => {
    try {
      setIsLoading(true);

      // Obtener pedidos que están listos para despacho o en camino (estados 3, 4, 5)
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          clientes (nombre, apellido, telefono, email),
          estados_pedido (nombre_estado),
          detalle_pedidos (
            cantidad,
            precio_historico,
            productos (nombre)
          )
        `)
        .in('id_estado_actual', [3, 4, 5])
        .order('fecha_pedido', { ascending: false });

      if (error) throw error;
      setPedidos(data || []);
    } catch (error) {
      console.error('Error cargando pedidos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateEstado = async (pedidoId, nuevoEstado) => {
    try {
      setUpdatingId(pedidoId);

      const { error } = await supabase
        .from('pedidos')
        .update({ id_estado_actual: nuevoEstado })
        .eq('id_pedido', pedidoId);

      if (error) throw error;

      // Recargar pedidos
      await loadPedidos();
    } catch (error) {
      console.error('Error actualizando estado:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const estadoConfig = {
    3: {
      label: 'En Preparación',
      color: 'bg-purple-100 text-purple-800',
      icon: Package,
      nextEstado: 4,
      nextLabel: 'Marcar Listo'
    },
    4: {
      label: 'Listo para Despacho',
      color: 'bg-orange-100 text-orange-800',
      icon: Truck,
      nextEstado: 5,
      nextLabel: 'Iniciar Envío'
    },
    5: {
      label: 'En Camino',
      color: 'bg-cyan-100 text-cyan-800',
      icon: Truck,
      nextEstado: 6,
      nextLabel: 'Marcar Entregado'
    },
  };

  const filteredPedidos = pedidos.filter(pedido => {
    if (filter === 'todos') return true;
    if (filter === 'listos') return pedido.id_estado_actual === 4;
    if (filter === 'en_camino') return pedido.id_estado_actual === 5;
    if (filter === 'preparacion') return pedido.id_estado_actual === 3;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Despachos</h1>
        <Button onClick={loadPedidos} variant="outline">
          Actualizar
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('todos')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'todos'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todos ({pedidos.length})
        </button>
        <button
          onClick={() => setFilter('preparacion')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'preparacion'
              ? 'bg-purple-600 text-white'
              : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
          }`}
        >
          En Preparación ({pedidos.filter(p => p.id_estado_actual === 3).length})
        </button>
        <button
          onClick={() => setFilter('listos')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'listos'
              ? 'bg-orange-600 text-white'
              : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
          }`}
        >
          Listos ({pedidos.filter(p => p.id_estado_actual === 4).length})
        </button>
        <button
          onClick={() => setFilter('en_camino')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'en_camino'
              ? 'bg-cyan-600 text-white'
              : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
          }`}
        >
          En Camino ({pedidos.filter(p => p.id_estado_actual === 5).length})
        </button>
      </div>

      {/* Lista de Pedidos */}
      {filteredPedidos.length === 0 ? (
        <Card>
          <Card.Body>
            <div className="text-center py-12 text-gray-500">
              <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay pedidos en esta categoría.</p>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPedidos.map((pedido) => {
            const config = estadoConfig[pedido.id_estado_actual] || {};
            const EstadoIcon = config.icon || Package;

            return (
              <Card key={pedido.id_pedido}>
                <Card.Body>
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Info del pedido */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-lg font-bold text-gray-900">
                          {pedido.codigo_pedido}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                          <EstadoIcon className="inline h-3 w-3 mr-1" />
                          {config.label || pedido.estados_pedido?.nombre_estado}
                        </span>
                      </div>

                      {/* Cliente */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-start gap-2">
                          <User className="h-4 w-4 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {pedido.clientes?.nombre} {pedido.clientes?.apellido}
                            </p>
                            <p className="text-xs text-gray-500">{pedido.clientes?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                          <p className="text-sm text-gray-600">{pedido.clientes?.telefono || 'Sin teléfono'}</p>
                        </div>
                      </div>

                      {/* Dirección */}
                      <div className="flex items-start gap-2 mb-4">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                        <p className="text-sm text-gray-600">
                          {pedido.observaciones_cliente || 'Sin dirección especificada'}
                        </p>
                      </div>

                      {/* Productos */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-500 mb-2">Productos:</p>
                        <ul className="space-y-1">
                          {pedido.detalle_pedidos?.map((detalle, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex justify-between">
                              <span>{detalle.cantidad}x {detalle.productos?.nombre}</span>
                              <span className="text-gray-500">{formatPrice(detalle.precio_historico * detalle.cantidad)}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="border-t mt-2 pt-2 flex justify-between font-medium">
                          <span>Total:</span>
                          <span className="text-green-600">{formatPrice(pedido.total)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-col gap-2 lg:w-48">
                      <div className="text-xs text-gray-500 mb-2">
                        <Clock className="inline h-3 w-3 mr-1" />
                        {new Date(pedido.fecha_pedido).toLocaleString('es-PE')}
                      </div>

                      {config.nextEstado && (
                        <Button
                          onClick={() => updateEstado(pedido.id_pedido, config.nextEstado)}
                          disabled={updatingId === pedido.id_pedido}
                          className={
                            config.nextEstado === 6
                              ? 'bg-green-600 hover:bg-green-700'
                              : config.nextEstado === 5
                                ? 'bg-cyan-600 hover:bg-cyan-700'
                                : 'bg-orange-600 hover:bg-orange-700'
                          }
                        >
                          {updatingId === pedido.id_pedido ? (
                            <Spinner size="sm" />
                          ) : (
                            <>
                              {config.nextEstado === 6 && <CheckCircle className="h-4 w-4 mr-2" />}
                              {config.nextEstado === 5 && <Truck className="h-4 w-4 mr-2" />}
                              {config.nextLabel}
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DispatchPage;
