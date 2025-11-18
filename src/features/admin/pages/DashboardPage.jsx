import Card from '../../../components/ui/Card';
import { ShoppingBag, Package, Truck, DollarSign } from 'lucide-react';

function DashboardPage() {
  const stats = [
    {
      title: 'Pedidos Totales',
      value: '0',
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Productos',
      value: '0',
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'En Despacho',
      value: '0',
      icon: Truck,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Ventas Totales',
      value: '$0',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
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
          <h2 className="text-xl font-semibold">Actividad Reciente</h2>
        </Card.Header>
        <Card.Body>
          <p className="text-gray-600">
            Conecta el backend para ver la actividad reciente.
          </p>
        </Card.Body>
      </Card>
    </div>
  );
}

export default DashboardPage;
