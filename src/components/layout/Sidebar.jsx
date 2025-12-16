import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Truck,
  LogOut,
  User,
  Shield,
  ClipboardList,
  PackageCheck,
  Navigation,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { cn } from '../../utils/cn';

// Menú con restricciones por rol específico
// Roles: admin, recepcionista, despachador, repartidor
const menuItems = [
  {
    path: '/admin/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['admin'],
  },
  {
    path: '/admin/inventory',
    label: 'Inventario',
    icon: Package,
    roles: ['admin'],
  },
  {
    path: '/admin/orders',
    label: 'Pedidos',
    icon: ClipboardList,
    roles: ['admin', 'recepcionista'],
  },
  {
    path: '/admin/dispatch',
    label: 'Despacho',
    icon: PackageCheck,
    roles: ['admin', 'despachador'],
  },
  {
    path: '/admin/delivery',
    label: 'Entregas',
    icon: Navigation,
    roles: ['admin', 'repartidor'],
  },
];

function Sidebar() {
  const location = useLocation();
  const { logout, user } = useAuthStore();

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold">Rápidos y Plumosos</h1>
        <p className="text-sm text-gray-400 mt-1">Panel Admin</p>
      </div>

      {/* Menu Items - Filtrados por rol */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems
            .filter(item => item.roles.includes(user?.role))
            .map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                      isActive
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
        </ul>
      </nav>

      {/* Perfil y Logout */}
      <div className="p-4 border-t border-gray-800 space-y-2">
        {/* Perfil del usuario */}
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-800 rounded-lg">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            user?.role === 'admin' ? 'bg-amber-600' : 'bg-primary-600'
          )}>
            {user?.role === 'admin' ? (
              <Shield className="h-5 w-5 text-white" />
            ) : (
              <User className="h-5 w-5 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.nombre || user?.email?.split('@')[0] || 'Usuario'}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {user?.cargo || (user?.role === 'admin' ? 'Administrador' : 'Empleado')}
            </p>
          </div>
        </div>

        {/* Botón de cerrar sesión */}
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-4 py-3 w-full text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
