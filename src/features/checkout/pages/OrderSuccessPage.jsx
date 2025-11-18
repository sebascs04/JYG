import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Button from '../../../components/ui/Button';

function OrderSuccessPage() {
  const navigate = useNavigate();

  return (
    <div className="container-custom py-16 text-center">
      <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-6" />
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        ¡Pedido realizado con éxito!
      </h1>
      <p className="text-gray-600 mb-8">
        Tu pedido ha sido procesado. Recibirás un correo de confirmación pronto.
      </p>
      <Button onClick={() => navigate('/catalog')}>
        Continuar comprando
      </Button>
    </div>
  );
}

export default OrderSuccessPage;
