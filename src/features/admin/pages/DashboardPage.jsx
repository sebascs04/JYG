import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import Spinner from '../../../components/ui/Spinner';
import { ShoppingBag, Package, Truck, DollarSign, Clock } from 'lucide-react';
import { formatPrice } from '../../../utils/formatters';

function DashboardPage() {
  const [stats, setStats] = useState({
    totalPedidos: 0,
    totalProductos: 0,
    enDespacho: 0,
    ventasTotales: 0,
  });
  const [pedidosRecientes, setPedidosRecientes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Obtener total de pedidos
      const { count: totalPedidos } = await supabase
        .from('pedidos')
        .select('*', { count: 'exact', head: true });

      // Obtener total de productos activos
      const { count: totalProductos } = await supabase
        .from('productos')
        .select('*', { count: 'exact', head: true })
        .eq('activo', true);

      // Obtener pedidos en despacho (estado 4 o 5)
      const { count: enDespacho } = await supabase
        .from('pedidos')
        .select('*', { count: 'exact', head: true })
        .in('id_estado_actual', [4, 5]);

      // Obtener suma de ventas totales
      const { data: ventasData } = await supabase
        .from('pedidos')
        .select('total');

      const ventasTotales = ventasData?.reduce((sum, p) => sum + (parseFloat(p.total) || 0), 0) || 0;

      // Obtener pedidos recientes
      const { data: recientes } = await supabase
        .from('pedidos')
        .select(`
          *,
          clientes (nombre, apellido),
          estados_pedido (nombre_estado)
        `)
        .order('fecha_pedido', { ascending: false })
        .limit(5);

      setStats({
        totalPedidos: totalPedidos || 0,
        totalProductos: totalProductos || 0,
        enDespacho: enDespacho || 0,
        ventasTotales: ventasTotales,
      });

      setPedidosRecientes(recientes || []);
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const estadoColors = {
    1: 'bg-yellow-100 text-yellow-800', // Pendiente
    2: 'bg-blue-100 text-blue-800',     // Pagado
    3: 'bg-purple-100 text-purple-800', // En preparación
    4: 'bg-orange-100 text-orange-800', // Listo
    5: 'bg-cyan-100 text-cyan-800',     // En camino
    6: 'bg-green-100 text-green-800',   // Entregado
  };

  const statsConfig = [
    {
      title: 'Pedidos Totales',
      value: stats.totalPedidos,
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Productos',
      value: stats.totalProductos,
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'En Despacho',
      value: stats.enDespacho,
      icon: Truck,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Ventas Totales',
      value: formatPrice(stats.ventasTotales),
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsConfig.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <Card.Body>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          );
        })}
      </div>

      <Card>
        <Card.Header>
          <h2 className="text-xl font-semibold">Pedidos Recientes</h2>
        </Card.Header>
        <Card.Body>
          {pedidosRecientes.length === 0 ? (
            <p className="text-gray-600">No hay pedidos recientes.</p>
          ) : (
            <div className="space-y-4">
              {pedidosRecientes.map((pedido) => (
                <div
                  key={pedido.id_pedido}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {pedido.codigo_pedido}
                      </p>
                      <p className="text-sm text-gray-500">
                        {pedido.clientes?.nombre} {pedido.clientes?.apellido}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {formatPrice(pedido.total)}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${estadoColors[pedido.id_estado_actual] || 'bg-gray-100'}`}>
                      {pedido.estados_pedido?.nombre_estado || 'Pendiente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

export default DashboardPage;
