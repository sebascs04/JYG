import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';

function OrdersPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Gestión de Pedidos</h1>

      <Card>
        <Card.Header>
          <h2 className="text-xl font-semibold">Lista de Pedidos</h2>
        </Card.Header>
        <Card.Body>
          <div className="text-center py-8 text-gray-600">
            No hay pedidos disponibles. Conecta el backend para ver los pedidos.
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default OrdersPage;
