import { formatPrice } from '../../utils/formatters';

function ProductCard({ product, onAddToCart }) {
  return (
    <div className="group bg-transparent transition-all duration-700">
      {/* Product Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-stone-100 mb-4">
        <img
          src={product.image || 'https://via.placeholder.com/400x533'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Hidden Add to Cart Button - Slides up on hover */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out p-6">
          <button
            onClick={() => onAddToCart(product)}
            className="w-full bg-luxury-olive hover:bg-luxury-olive-dark text-white font-medium py-4 rounded-full transition-all duration-500 tracking-wide uppercase text-sm"
          >
            Agregar al Carrito
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="px-2">
        {/* Product Title */}
        <h3 className="font-serif text-lg text-stone-900 mb-2 line-clamp-2 min-h-[3.5rem]">
          {product.name}
        </h3>

        {/* Product Price */}
        <p className="font-sans text-sm text-luxury-olive font-medium">
          {formatPrice(product.price)}
        </p>
      </div>
    </div>
  );
}

export default ProductCard;
