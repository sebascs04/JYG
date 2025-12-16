import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';

function Header() {
  const navigate = useNavigate();
  const { getTotalItems } = useCartStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const totalItems = getTotalItems();

  const handleLogout = async () => {
    await logout();
    navigate('/catalog');
  };

  return (
    <header className="sticky top-0 z-50 bg-luxury-bg/80 backdrop-blur-md border-b border-stone-200/50">
      <div className="max-w-7xl mx-auto px-8 lg:px-12">
        <div className="flex items-center justify-between py-6">
          {/* Logo - Left */}
          <Link to="/catalog" className="flex-shrink-0 group">
            <h1 className="text-3xl font-serif font-bold text-luxury-olive tracking-tight transition-all duration-500 group-hover:text-luxury-olive-dark">
              JyG
            </h1>
          </Link>

          {/* Actions - Right */}
          <div className="flex items-center gap-6 flex-shrink-0">
            {isAuthenticated ? (
              <>
                {/* User Name & Menu */}
                <div className="flex items-center gap-3">
                  <span className="text-stone-700 font-medium text-sm">
                    Hola, {user?.nombre || user?.email?.split('@')[0]}
                  </span>
                  {(user?.role === 'admin' || user?.role === 'employee') && (
                    <Link
                      to="/admin/inventory"
                      className="text-xs bg-luxury-olive text-white px-3 py-1 rounded-full hover:bg-luxury-olive-dark transition-colors"
                    >
                      Panel Admin
                    </Link>
                  )}
                </div>
                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="text-stone-500 hover:text-red-600 transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="h-5 w-5" strokeWidth={1.5} />
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="text-stone-600 hover:text-luxury-olive transition-all duration-500 flex items-center gap-2"
              >
                <User className="h-5 w-5" strokeWidth={1.5} />
                <span className="text-sm font-medium">Ingresar</span>
              </Link>
            )}

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
