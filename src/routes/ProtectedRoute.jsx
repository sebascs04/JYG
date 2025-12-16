import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import Spinner from '../components/ui/Spinner';

// Obtener la ruta home según el rol
function getHomeByRole(role) {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'recepcionista':
      return '/admin/orders';
    case 'despachador':
      return '/admin/dispatch';
    case 'repartidor':
      return '/admin/delivery';
    default:
      return '/catalog';
  }
}

function ProtectedRoute({ allowedRoles = [] }) {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  // Mostrar spinner mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirigir a la página home según su rol
    const homePath = getHomeByRole(user?.role);
    return <Navigate to={homePath} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
