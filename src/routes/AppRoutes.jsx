import { createBrowserRouter, Navigate } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import AdminLayout from '../layouts/AdminLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from './ProtectedRoute';

// Auth Pages
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage';

// Public Pages
import CatalogPage from '../features/catalog/pages/CatalogPage';
import ProductDetailPage from '../features/catalog/pages/ProductDetailPage';
import CartPage from '../features/cart/pages/CartPage';
import CheckoutPage from '../features/checkout/pages/CheckoutPage';
import OrderSuccessPage from '../features/checkout/pages/OrderSuccessPage';

// Admin Pages
import DashboardPage from '../features/admin/pages/DashboardPage';
import OrdersPage from '../features/admin/pages/OrdersPage';
import InventoryPage from '../features/admin/pages/InventoryPage';
import DispatchPage from '../features/admin/pages/DispatchPage';
import DeliveryPage from '../features/admin/pages/DeliveryPage';

// 404 component
function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="mt-4 text-xl text-gray-600">Página no encontrada</p>
        <a
          href="/JYG/catalog"
          className="mt-6 inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Volver al catálogo
        </a>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  // Auth Routes
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
    ],
  },
  // Catalog Page (Standalone)
  { path: '/', element: <Navigate to="/catalog" replace /> },
  { path: '/catalog', element: <CatalogPage /> },
  // Other Public Routes
  {
    element: <PublicLayout />,
    children: [
      { path: '/catalog/:id', element: <ProductDetailPage /> },
      { path: '/cart', element: <CartPage /> },
      { path: '/checkout', element: <CheckoutPage /> },
      { path: '/order-success', element: <OrderSuccessPage /> },
    ],
  },
  // Admin Routes - Solo Admin
  {
    element: <ProtectedRoute allowedRoles={['admin']} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/admin/dashboard', element: <DashboardPage /> },
          { path: '/admin/inventory', element: <InventoryPage /> },
        ],
      },
    ],
  },
  // Admin Routes - Recepcionista
  {
    element: <ProtectedRoute allowedRoles={['admin', 'recepcionista']} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/admin/orders', element: <OrdersPage /> },
        ],
      },
    ],
  },
  // Admin Routes - Despachador
  {
    element: <ProtectedRoute allowedRoles={['admin', 'despachador']} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/admin/dispatch', element: <DispatchPage /> },
        ],
      },
    ],
  },
  // Admin Routes - Repartidor
  {
    element: <ProtectedRoute allowedRoles={['admin', 'repartidor']} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/admin/delivery', element: <DeliveryPage /> },
        ],
      },
    ],
  },
  // 404
  { path: '*', element: <NotFoundPage /> },
], {
  basename: '/JYG',
});
