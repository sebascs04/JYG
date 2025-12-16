import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, ChevronDown } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';

function Header() {
  const navigate = useNavigate();
  const { getTotalItems } = useCartStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const totalItems = getTotalItems();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = async () => {
    setShowProfileMenu(false);
    await logout();
    navigate('/catalog');
  };

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
                {/* User Profile Dropdown */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 text-stone-700 hover:text-luxury-olive transition-colors"
                  >
                    <div className="w-8 h-8 bg-luxury-olive rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium text-sm hidden sm:block">
                      {user?.nombre || user?.email?.split('@')[0]}
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-stone-200 py-2 z-50">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-stone-100">
                        <p className="text-sm font-medium text-stone-900">
                          {user?.nombre} {user?.apellido}
                        </p>
                        <p className="text-xs text-stone-500 truncate">
                          {user?.email}
                        </p>
                        <span className="inline-block mt-1 text-xs bg-luxury-olive/10 text-luxury-olive px-2 py-0.5 rounded-full">
                          {user?.role === 'admin' ? 'Administrador' : user?.role === 'employee' ? 'Empleado' : 'Cliente'}
                        </span>
                      </div>

                      {/* Menu Options */}
                      <div className="py-1">
                        {(user?.role === 'admin' || user?.role === 'employee') && (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setShowProfileMenu(false)}
                            className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                          >
                            Panel de Administración
                          </Link>
                        )}
                      </div>

                      {/* Logout */}
                      <div className="border-t border-stone-100 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                        >
                          <LogOut className="h-4 w-4" />
                          Cerrar sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
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
