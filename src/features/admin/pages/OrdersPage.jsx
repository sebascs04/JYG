import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/useAuthStore';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Spinner from '../../../components/ui/Spinner';
import { formatPrice } from '../../../utils/formatters';
import { Package, Clock, Truck, CheckCircle, Eye, ChevronDown, X, ChevronLeft, ChevronRight, MapPin, MessageSquare } from 'lucide-react';

// Estados según la BD (id_estado_actual)
const ESTADOS = {
  1: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  2: { label: 'Pagado', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  3: { label: 'En Preparación', color: 'bg-purple-100 text-purple-800', icon: Package },
  4: { label: 'Listo', color: 'bg-orange-100 text-orange-800', icon: Package },
  5: { label: 'En Camino', color: 'bg-cyan-100 text-cyan-800', icon: Truck },
  6: { label: 'Entregado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
};

const ITEMS_PER_PAGE = 10;

// Helper para parsear observaciones (puede ser JSON o texto plano)
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
    // Si no es JSON, es formato antiguo (texto plano)
    // Intentar extraer dirección si tiene el formato "Dirección: xxx. comentarios"
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

function OrdersPage() {
  const { user } = useAuthStore();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchPedidos();
  }, [currentPage, filtroEstado]);

  async function fetchPedidos() {
    setLoading(true);
    try {
      // Primero obtener el total
      let countQuery = supabase
        .from('pedidos')
        .select('*', { count: 'exact', head: true });

      if (filtroEstado !== 'todos') {
        countQuery = countQuery.eq('id_estado_actual', parseInt(filtroEstado));
      }

      const { count } = await countQuery;
      setTotalCount(count || 0);

      // Luego obtener los datos paginados
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('pedidos')
        .select(`
          *,
          clientes (nombre, apellido, email, telefono),
          estados_pedido (nombre_estado)
        `)
        .order('fecha_pedido', { ascending: false })
        .range(from, to);

      if (filtroEstado !== 'todos') {
        query = query.eq('id_estado_actual', parseInt(filtroEstado));
      }

      const { data, error } = await query;
      if (error) throw error;
      setPedidos(data || []);
    } catch (error) {
      console.error('Error fetching pedidos:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchDetalles(idPedido) {
    const { data, error } = await supabase
      .from('detalle_pedidos')
      .select(`
        *,
        productos (nombre, imagen_url)
      `)
      .eq('id_pedido', idPedido);

    if (!error) {
      setDetalles(data || []);
    }
  }

  async function handleCambiarEstado(idPedido, nuevoEstado) {
    try {
      setUpdatingId(idPedido);

      const { error } = await supabase
        .from('pedidos')
        .update({ id_estado_actual: nuevoEstado })
        .eq('id_pedido', idPedido);

      if (error) throw error;

      setPedidos(pedidos.map(p =>
        p.id_pedido === idPedido ? { ...p, id_estado_actual: nuevoEstado } : p
      ));
    } catch (error) {
      console.error('Error updating estado:', error);
      alert('Error al actualizar el estado');
    } finally {
      setUpdatingId(null);
    }
  }

  function handleVerDetalles(pedido) {
    setPedidoSeleccionado(pedido);
    fetchDetalles(pedido.id_pedido);
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Pedidos</h1>
        <div className="flex gap-2">
          <select
            value={filtroEstado}
            onChange={(e) => {
              setFiltroEstado(e.target.value);
              setCurrentPage(1);
            }}
            className="border rounded-lg px-4 py-2 bg-white"
          >
            <option value="todos">Todos los estados</option>
            {Object.entries(ESTADOS).map(([id, estado]) => (
              <option key={id} value={id}>{estado.label}</option>
            ))}
          </select>
          <Button onClick={fetchPedidos} variant="outline">
            Actualizar
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      ) : pedidos.length === 0 ? (
        <Card>
          <Card.Body>
            <div className="text-center py-12 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay pedidos {filtroEstado !== 'todos' ? `en estado "${ESTADOS[filtroEstado]?.label}"` : ''}</p>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {pedidos.map((pedido) => {
              const estadoInfo = ESTADOS[pedido.id_estado_actual] || ESTADOS[1];
              const Icon = estadoInfo.icon;
              const obsData = parseObservaciones(pedido.observaciones_cliente);

              return (
                <Card key={pedido.id_pedido} className="hover:shadow-md transition-shadow">
                  <Card.Body>
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      {/* Info del pedido */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="text-xl font-bold text-gray-900">
                            {pedido.codigo_pedido || `#${pedido.id_pedido}`}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${estadoInfo.color}`}>
                            <Icon className="h-3 w-3" />
                            {estadoInfo.label}
                          </span>
                        </div>

                        <div className="text-sm text-gray-600 space-y-1">
                          <p>
                            <span className="font-medium">Cliente:</span>{' '}
                            {pedido.clientes?.nombre} {pedido.clientes?.apellido}
                          </p>
                          <p>
                            <span className="font-medium">Fecha:</span>{' '}
                            {new Date(pedido.fecha_pedido).toLocaleDateString('es-PE', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>

                          {/* Dirección separada */}
                          {obsData.direccion && (
                            <p className="flex items-start gap-1">
                              <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <span>
                                <span className="font-medium">Dirección:</span> {obsData.direccion}
                              </span>
                            </p>
                          )}

                          {/* Comentarios separados */}
                          {obsData.comentarios && (
                            <p className="flex items-start gap-1">
                              <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <span>
                                <span className="font-medium">Comentarios:</span> {obsData.comentarios}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Total y acciones */}
                      <div className="flex flex-col items-end gap-3">
                        <p className="text-2xl font-bold text-green-600">
                          {formatPrice(pedido.total)}
                        </p>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleVerDetalles(pedido)}
                            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            Ver detalles
                          </button>

                          {pedido.id_estado_actual !== 6 && (
                            <div className="relative">
                              <select
                                value={pedido.id_estado_actual}
                                onChange={(e) => handleCambiarEstado(pedido.id_pedido, parseInt(e.target.value))}
                                disabled={updatingId === pedido.id_pedido}
                                className="appearance-none bg-green-600 text-white px-4 py-2 pr-8 rounded-lg text-sm font-medium cursor-pointer hover:bg-green-700 transition-colors disabled:opacity-50"
                              >
                                {Object.entries(ESTADOS).map(([id, estado]) => (
                                  <option key={id} value={id}>{estado.label}</option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-white pointer-events-none" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              );
            })}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600">
                Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} de {totalCount} pedidos
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-green-600 text-white'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de detalles */}
      {pedidoSeleccionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  {pedidoSeleccionado.codigo_pedido || `Pedido #${pedidoSeleccionado.id_pedido}`}
                </h2>
                <button
                  onClick={() => setPedidoSeleccionado(null)}
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Info del cliente y entrega */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-2">Datos del cliente</h3>
                <p className="text-sm">
                  {pedidoSeleccionado.clientes?.nombre} {pedidoSeleccionado.clientes?.apellido}
                </p>
                <p className="text-sm text-gray-600">{pedidoSeleccionado.clientes?.email}</p>
                <p className="text-sm text-gray-600">{pedidoSeleccionado.clientes?.telefono}</p>

                {(() => {
                  const obsData = parseObservaciones(pedidoSeleccionado.observaciones_cliente);
                  return (
                    <>
                      {obsData.direccion && (
                        <p className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">Dirección de entrega:</span> {obsData.direccion}
                        </p>
                      )}
                      {obsData.comentarios && (
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Comentarios:</span> {obsData.comentarios}
                        </p>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Productos */}
              <h3 className="font-semibold mb-3">Productos</h3>
              <div className="space-y-3">
                {detalles.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Cargando productos...</p>
                ) : (
                  detalles.map((detalle, idx) => (
                    <div key={detalle.id_detalle || idx} className="flex items-center gap-4 py-3 border-b">
                      <img
                        src={detalle.productos?.imagen_url || 'https://via.placeholder.com/50'}
                        alt={detalle.productos?.nombre}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{detalle.productos?.nombre}</p>
                        <p className="text-sm text-gray-500">
                          {detalle.cantidad} x {formatPrice(detalle.precio_historico)}
                        </p>
                      </div>
                      <p className="font-semibold">{formatPrice(detalle.precio_historico * detalle.cantidad)}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Total */}
              <div className="border-t mt-4 pt-4 flex justify-between items-center">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatPrice(pedidoSeleccionado.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrdersPage;
