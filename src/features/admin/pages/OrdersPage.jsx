import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/useAuthStore';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Header from '../../../components/layout/Header';
import { formatPrice } from '../../../utils/formatters';
import { Package, Clock, Truck, CheckCircle, XCircle, Eye, ChevronDown } from 'lucide-react';

const ESTADOS = [
  { value: 'Recibido', label: 'Recibido', color: 'blue', icon: Clock },
  { value: 'Revisado', label: 'Revisado', color: 'purple', icon: Eye },
  { value: 'Preparando', label: 'Preparando', color: 'yellow', icon: Package },
  { value: 'Preparado', label: 'Preparado', color: 'orange', icon: Package },
  { value: 'Enviando', label: 'Enviando', color: 'indigo', icon: Truck },
  { value: 'Entregado', label: 'Entregado', color: 'green', icon: CheckCircle },
  { value: 'Anulado', label: 'Anulado', color: 'red', icon: XCircle },
];

function OrdersPage() {
  const { user } = useAuthStore();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [detalles, setDetalles] = useState([]);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchPedidos();
  }, []);

  async function fetchPedidos() {
    setLoading(true);
    try {
      let query = supabase
        .from('pedidos')
        .select(`
          *,
          clientes (nombre, apellido, email, telefono)
        `)
        .order('fecha_pedido', { ascending: false });

      // Empleados no ven Entregado ni Anulado
      if (!isAdmin) {
        query = query.not('estado', 'in', '("Entregado","Anulado")');
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
      .from('detalle_pedido')
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
      const { error } = await supabase
        .from('pedidos')
        .update({ estado: nuevoEstado })
        .eq('id_pedido', idPedido);

      if (error) throw error;

      // Actualizar lista local
      setPedidos(pedidos.map(p =>
        p.id_pedido === idPedido ? { ...p, estado: nuevoEstado } : p
      ));

      alert(`Pedido #${idPedido} actualizado a: ${nuevoEstado}`);
    } catch (error) {
      console.error('Error updating estado:', error);
      alert('Error al actualizar el estado');
    }
  }

  function handleVerDetalles(pedido) {
    setPedidoSeleccionado(pedido);
    fetchDetalles(pedido.id_pedido);
  }

  const pedidosFiltrados = filtroEstado === 'todos'
    ? pedidos
    : pedidos.filter(p => p.estado === filtroEstado);

  // Agrupar por estado para vista de tablero
  const pedidosPorEstado = ESTADOS.reduce((acc, estado) => {
    acc[estado.value] = pedidos.filter(p => p.estado === estado.value);
    return acc;
  }, {});

  const getEstadoInfo = (estado) => ESTADOS.find(e => e.value === estado) || ESTADOS[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Pedidos
          </h1>
          <div className="flex gap-2">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="border rounded-lg px-4 py-2 bg-white"
            >
              <option value="todos">Todos los estados</option>
              {ESTADOS.map(e => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Cargando pedidos...</div>
        ) : pedidosFiltrados.length === 0 ? (
          <Card>
            <Card.Body>
              <div className="text-center py-12 text-gray-500">
                No hay pedidos {filtroEstado !== 'todos' ? `en estado "${filtroEstado}"` : ''}
              </div>
            </Card.Body>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pedidosFiltrados.map((pedido) => {
              const estadoInfo = getEstadoInfo(pedido.estado);
              const Icon = estadoInfo.icon;

              return (
                <Card key={pedido.id_pedido} className="hover:shadow-md transition-shadow">
                  <Card.Body>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Info del pedido */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xl font-bold text-gray-900">
                            Pedido #{pedido.id_pedido}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-${estadoInfo.color}-100 text-${estadoInfo.color}-700`}>
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
                          <p>
                            <span className="font-medium">Dirección:</span>{' '}
                            {pedido.direccion_entrega || 'No especificada'}
                          </p>
                          {pedido.comentarios && (
                            <p>
                              <span className="font-medium">Comentarios:</span>{' '}
                              {pedido.comentarios}
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
                            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            Ver detalles
                          </button>

                          {pedido.estado !== 'Entregado' && pedido.estado !== 'Anulado' && (
                            <div className="relative">
                              <select
                                value={pedido.estado}
                                onChange={(e) => handleCambiarEstado(pedido.id_pedido, e.target.value)}
                                className="appearance-none bg-green-600 text-white px-4 py-2 pr-8 rounded-lg text-sm font-medium cursor-pointer hover:bg-green-700 transition-colors"
                              >
                                {ESTADOS.filter(e => isAdmin || (e.value !== 'Entregado' && e.value !== 'Anulado')).map(e => (
                                  <option key={e.value} value={e.value}>{e.label}</option>
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
        )}

        {/* Modal de detalles */}
        {pedidoSeleccionado && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">
                    Pedido #{pedidoSeleccionado.id_pedido}
                  </h2>
                  <button
                    onClick={() => setPedidoSeleccionado(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Info del cliente */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold mb-2">Datos del cliente</h3>
                  <p className="text-sm">
                    {pedidoSeleccionado.clientes?.nombre} {pedidoSeleccionado.clientes?.apellido}
                  </p>
                  <p className="text-sm text-gray-600">{pedidoSeleccionado.clientes?.email}</p>
                  <p className="text-sm text-gray-600">{pedidoSeleccionado.clientes?.telefono}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    <span className="font-medium">Dirección:</span> {pedidoSeleccionado.direccion_entrega}
                  </p>
                </div>

                {/* Productos */}
                <h3 className="font-semibold mb-3">Productos</h3>
                <div className="space-y-3">
                  {detalles.map((detalle) => (
                    <div key={detalle.id_detalle} className="flex items-center gap-4 py-3 border-b">
                      <img
                        src={detalle.productos?.imagen_url || 'https://via.placeholder.com/50'}
                        alt={detalle.productos?.nombre}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{detalle.productos?.nombre}</p>
                        <p className="text-sm text-gray-500">
                          {detalle.cantidad} x {formatPrice(detalle.precio_unitario)}
                        </p>
                      </div>
                      <p className="font-semibold">{formatPrice(detalle.subtotal)}</p>
                    </div>
                  ))}
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
    </div>
  );
}

export default OrdersPage;
