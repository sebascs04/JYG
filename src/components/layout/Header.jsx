import { Link } from 'react-router-dom';
import { ShoppingCart, User } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';

function Header() {
  const { getTotalItems } = useCartStore();
  const totalItems = getTotalItems();

  return (
    <header className="sticky top-0 z-50 bg-luxury-bg/80 backdrop-blur-md border-b border-stone-200/50">
      <div className="max-w-7xl mx-auto px-8 lg:px-12">
        <div className="flex items-center justify-between py-6">
          {/* Logo - Left */}
          <Link to="/" className="flex-shrink-0 group">
            <h1 className="text-3xl font-serif font-bold text-luxury-olive tracking-tight transition-all duration-500 group-hover:text-luxury-olive-dark">
              JyG
            </h1>
          </Link>

          {/* Navigation - Center (Optional) */}
          <nav className="hidden md:flex items-center gap-12">
            <Link
              to="/catalog"
              className="text-sm font-medium text-stone-600 hover:text-luxury-olive transition-all duration-500 tracking-wide uppercase"
            >
              Catálogo
            </Link>
          </nav>

          {/* Actions - Right */}
          <div className="flex items-center gap-8 flex-shrink-0">
            {/* User Icon */}
            <Link
              to="/login"
              className="text-stone-600 hover:text-luxury-olive transition-all duration-500"
            >
              <User className="h-6 w-6" strokeWidth={1.5} />
            </Link>

            {/* Cart with Badge */}
            <Link
              to="/cart"
              className="relative text-stone-600 hover:text-luxury-olive transition-all duration-500"
            >
              <ShoppingCart className="h-6 w-6" strokeWidth={1.5} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-luxury-olive text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
