import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Spinner from '../../../components/ui/Spinner';
import { Navigation, CheckCircle, Clock, MapPin, Phone, User, Package } from 'lucide-react';
import { formatPrice } from '../../../utils/formatters';

// Helper para parsear observaciones
function parseObservaciones(obs) {
  if (!obs) return { direccion: '', telefono: '', comentarios: '' };
  try {
    const parsed = JSON.parse(obs);
    return {
      direccion: parsed.direccion || '',
      telefono: parsed.telefono || '',
      comentarios: parsed.comentarios || '',
    };
  } catch {
    if (obs.startsWith('Dirección:')) {
      const parts = obs.replace('Dirección:', '').split('.');
      return {
        direccion: parts[0]?.trim() || obs,
        telefono: '',
        comentarios: parts.slice(1).join('.').trim() || '',
      };
    }
    return { direccion: '', telefono: '', comentarios: obs };
  }
}

function DeliveryPage() {
  const [pedidos, setPedidos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [entregadosHoy, setEntregadosHoy] = useState(0);

  useEffect(() => {
    loadPedidos();
  }, []);

  const loadPedidos = async () => {
    try {
      setIsLoading(true);

      // Obtener pedidos en camino (estado 5)
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
        .eq('id_estado_actual', 5)
        .order('fecha_pedido', { ascending: true }); // Los más antiguos primero

      if (error) throw error;
      setPedidos(data || []);

      // Contar entregados hoy
      const hoy = new Date().toISOString().split('T')[0];
      const { count } = await supabase
        .from('pedidos')
        .select('*', { count: 'exact', head: true })
        .eq('id_estado_actual', 6)
        .gte('fecha_pedido', hoy);

      setEntregadosHoy(count || 0);
    } catch (error) {
      console.error('Error cargando pedidos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const marcarEntregado = async (pedidoId) => {
    try {
      setUpdatingId(pedidoId);

      const { error } = await supabase
        .from('pedidos')
        .update({ id_estado_actual: 6 })
        .eq('id_pedido', pedidoId);

      if (error) throw error;

      // Actualizar lista local
      setPedidos(pedidos.filter(p => p.id_pedido !== pedidoId));
      setEntregadosHoy(prev => prev + 1);
    } catch (error) {
      console.error('Error actualizando estado:', error);
    } finally {
      setUpdatingId(null);
    }
  };

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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Entregas</h1>
          <p className="text-gray-500 mt-1">Pedidos en camino para entregar</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg">
            <span className="text-2xl font-bold">{entregadosHoy}</span>
            <span className="text-sm ml-2">entregados hoy</span>
          </div>
          <Button onClick={loadPedidos} variant="outline">
            Actualizar
          </Button>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <Card.Body>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-100 rounded-lg">
                <Navigation className="h-6 w-6 text-cyan-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{pedidos.length}</p>
                <p className="text-sm text-gray-500">Pedidos por entregar</p>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Lista de Pedidos */}
      {pedidos.length === 0 ? (
        <Card>
          <Card.Body>
            <div className="text-center py-12 text-gray-500">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">¡Todo entregado!</h3>
              <p>No tienes pedidos pendientes de entrega.</p>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <div className="space-y-4">
          {pedidos.map((pedido) => {
            const obsData = parseObservaciones(pedido.observaciones_cliente);

            return (
              <Card key={pedido.id_pedido} className="border-l-4 border-l-cyan-500">
                <Card.Body>
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Info del pedido */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-lg font-bold text-gray-900">
                          {pedido.codigo_pedido}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800">
                          <Navigation className="inline h-3 w-3 mr-1" />
                          En Camino
                        </span>
                      </div>

                      {/* Cliente y contacto */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex items-start gap-2">
                            <User className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {pedido.clientes?.nombre} {pedido.clientes?.apellido}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                            <a
                              href={`tel:${obsData.telefono || pedido.clientes?.telefono}`}
                              className="text-blue-600 hover:underline font-medium"
                            >
                              {obsData.telefono || pedido.clientes?.telefono || 'Sin teléfono'}
                            </a>
                          </div>
                        </div>

                        {/* Dirección destacada */}
                        <div className="mt-3 p-3 bg-white rounded-lg border-2 border-cyan-200">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-5 w-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-gray-500 uppercase font-medium">Dirección de entrega</p>
                              <p className="text-gray-900 font-medium">
                                {obsData.direccion || 'Sin dirección especificada'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {obsData.comentarios && (
                          <p className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">Nota:</span> {obsData.comentarios}
                          </p>
                        )}
                      </div>

                      {/* Productos resumidos */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Package className="h-4 w-4" />
                        <span>
                          {pedido.detalle_pedidos?.length || 0} producto(s) -
                          <span className="font-semibold text-green-600 ml-1">
                            {formatPrice(pedido.total)}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-col gap-2 lg:w-48">
                      <div className="text-xs text-gray-500 mb-2">
                        <Clock className="inline h-3 w-3 mr-1" />
                        {new Date(pedido.fecha_pedido).toLocaleString('es-PE')}
                      </div>

                      <Button
                        onClick={() => marcarEntregado(pedido.id_pedido)}
                        disabled={updatingId === pedido.id_pedido}
                        className="bg-green-600 hover:bg-green-700 w-full"
                      >
                        {updatingId === pedido.id_pedido ? (
                          <Spinner size="sm" />
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Marcar Entregado
                          </>
                        )}
                      </Button>
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

export default DeliveryPage;
