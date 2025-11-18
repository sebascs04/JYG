import Card from '../../../components/ui/Card';

function DispatchPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Gestión de Despachos</h1>

      <Card>
        <Card.Header>
          <h2 className="text-xl font-semibold">Pedidos para Despacho</h2>
        </Card.Header>
        <Card.Body>
          <div className="text-center py-8 text-gray-600">
            No hay pedidos pendientes de despacho. Conecta el backend para ver los despachos.
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default DispatchPage;
