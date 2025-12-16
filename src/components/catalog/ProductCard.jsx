import { formatPrice } from '../../utils/formatters';

function ProductCard({ product, onAddToCart }) {
  const isOutOfStock = product.stock === 0 || product.stock_actual === 0;

  return (
    <div className="group bg-transparent transition-all duration-700">
      {/* Product Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-stone-100 mb-4">
        <img
          src={product.image || product.imagen_url || 'https://via.placeholder.com/400x533'}
          alt={product.name || product.nombre}
          className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
            isOutOfStock ? 'opacity-50 grayscale' : 'group-hover:scale-105'
          }`}
        />

        {/* Badge Agotado */}
        {isOutOfStock && (
          <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
            Agotado
          </div>
        )}

        {/* Hidden Add to Cart Button - Slides up on hover */}
        {!isOutOfStock && (
          <div className="absolute inset-x-0 bottom-0 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out p-6">
            <button
              onClick={() => onAddToCart(product)}
              className="w-full bg-luxury-olive hover:bg-luxury-olive-dark text-white font-medium py-4 rounded-full transition-all duration-500 tracking-wide uppercase text-sm"
            >
              Agregar al Carrito
            </button>
          </div>
        )}

        {/* Mensaje cuando está agotado */}
        {isOutOfStock && (
          <div className="absolute inset-x-0 bottom-0 p-6">
            <div className="w-full bg-gray-400 text-white font-medium py-4 rounded-full text-center tracking-wide uppercase text-sm cursor-not-allowed">
              Sin Stock
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="px-2">
        {/* Product Title */}
        <h3 className={`font-serif text-lg mb-2 line-clamp-2 min-h-[3.5rem] ${
          isOutOfStock ? 'text-stone-500' : 'text-stone-900'
        }`}>
          {product.name || product.nombre}
        </h3>

        {/* Product Price */}
        <p className={`font-sans text-sm font-medium ${
          isOutOfStock ? 'text-stone-400' : 'text-luxury-olive'
        }`}>
          {formatPrice(product.price || product.precio_unitario)}
        </p>
      </div>
    </div>
  );
}

export default ProductCard;
