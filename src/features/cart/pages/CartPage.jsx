import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../../store/useCartStore';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import { formatPrice } from '../../../utils/formatters';

function CartPage() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, getSubtotal, getIGV, getTotalPrice } = useCartStore();

  const subtotal = getSubtotal();
  const igv = getIGV();
  const total = getTotalPrice();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl shadow-lg p-12">
          <ShoppingBag className="h-20 w-20 text-gray-300 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Tu carrito está vacío
          </h1>
          <p className="text-gray-600 mb-8">
            Agrega productos desde el catálogo para comenzar
          </p>
          <Button onClick={() => navigate('/catalog')}>
            Ir al catálogo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Carrito de Compras</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const itemPrice = item.price || item.precio_unitario || 0;
              const itemQuantity = item.quantity || item.cantidad || 1;
              const subtotal = itemPrice * itemQuantity;

              return (
                <Card key={item.id || item.id_producto}>
                  <Card.Body>
                    <div className="flex items-center gap-4">
                      <img
                        src={item.image || item.imagen_url || 'https://via.placeholder.com/100'}
                        alt={item.name || item.nombre}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {item.name || item.nombre}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          Precio unitario: {formatPrice(itemPrice)}
                        </p>
                        {/* Subtotal del ítem */}
                        <p className="text-green-600 font-semibold mt-1">
                          Subtotal: {formatPrice(subtotal)}
                        </p>
                      </div>

                      {/* Controles de cantidad */}
                      <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
                        <button
                          onClick={() => updateQuantity(item.id || item.id_producto, itemQuantity - 1)}
                          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-10 text-center font-medium">{itemQuantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id || item.id_producto, itemQuantity + 1)}
                          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Botón eliminar */}
                      <button
                        onClick={() => removeItem(item.id || item.id_producto)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar del carrito"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </Card.Body>
                </Card>
              );
            })}
          </div>

          {/* Summary */}
          <div>
            <Card className="sticky top-24">
              <Card.Header>
                <h2 className="text-xl font-semibold">Resumen del pedido</h2>
              </Card.Header>
              <Card.Body>
                <div className="space-y-3">
                  {/* Desglose por ítem */}
                  {items.map((item) => {
                    const itemPrice = item.price || item.precio_unitario || 0;
                    const itemQuantity = item.quantity || item.cantidad || 1;
                    return (
                      <div key={item.id || item.id_producto} className="flex justify-between text-sm">
                        <span className="text-gray-600 truncate max-w-[150px]">
                          {item.name || item.nombre} x{itemQuantity}
                        </span>
                        <span className="font-medium">{formatPrice(itemPrice * itemQuantity)}</span>
                      </div>
                    );
                  })}

                  <div className="border-t pt-3 mt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>IGV (18%)</span>
                      <span>{formatPrice(igv)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Envío</span>
                      <span>Gratis</span>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex justify-between font-bold text-xl">
                      <span>Total</span>
                      <span className="text-green-600">{formatPrice(total)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Incluye IGV</p>
                  </div>
                </div>
              </Card.Body>
              <Card.Footer>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => navigate('/checkout')}
                >
                  Proceder al pago
                </Button>
                <button
                  onClick={() => navigate('/catalog')}
                  className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  Continuar comprando
                </button>
              </Card.Footer>
            </Card>
          </div>
        </div>
    </div>
  );
}

export default CartPage;
