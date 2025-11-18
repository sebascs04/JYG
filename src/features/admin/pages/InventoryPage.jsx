import Card from '../../../components/ui/Card';

function InventoryPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Gestión de Inventario</h1>

      <Card>
        <Card.Header>
          <h2 className="text-xl font-semibold">Control de Stock</h2>
        </Card.Header>
        <Card.Body>
          <div className="text-center py-8 text-gray-600">
            No hay productos en inventario. Conecta el backend para gestionar el inventario.
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default InventoryPage;
