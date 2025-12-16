import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Header from '../../../components/layout/Header';
import { formatPrice } from '../../../utils/formatters';

function OrderSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId, total } = location.state || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Pedido realizado con éxito!
          </h1>

          {orderId && (
            <div className="bg-gray-50 rounded-lg p-4 my-6">
              <p className="text-sm text-gray-500 mb-1">Número de pedido</p>
              <p className="text-2xl font-bold text-green-600">#{orderId}</p>
              {total && (
                <p className="text-gray-600 mt-2">
                  Total: <span className="font-semibold">{formatPrice(total)}</span>
                </p>
              )}
            </div>
          )}

          <div className="space-y-3 text-left bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">¿Qué sigue?</p>
                <ul className="text-sm text-gray-600 mt-1 space-y-1">
                  <li>1. Recibirás un correo de confirmación</li>
                  <li>2. Prepararemos tu pedido</li>
                  <li>3. Te notificaremos cuando esté en camino</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => navigate('/catalog')}
              className="flex items-center justify-center gap-2"
            >
              Continuar comprando
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccessPage;
