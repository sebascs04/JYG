import { Routes, Route, Navigate } from 'react-router-dom';
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

function AppRoutes() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* Catalog Page (Standalone with custom header) */}
      <Route path="/" element={<Navigate to="/catalog" replace />} />
      <Route path="/catalog" element={<CatalogPage />} />

      {/* Other Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/catalog/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />
      </Route>

      {/* Admin Routes (Protected) */}
      <Route element={<ProtectedRoute allowedRoles={['admin', 'employee']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/orders" element={<OrdersPage />} />
          <Route path="/admin/inventory" element={<InventoryPage />} />
          <Route path="/admin/dispatch" element={<DispatchPage />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<LoginPage />} />
    </Routes>
  );
}

// Simple 404 component
function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="mt-4 text-xl text-gray-600">Página no encontrada</p>
        <a
          href="/catalog"
          className="mt-6 inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Volver al catálogo
        </a>
      </div>
    </div>
  );
}

export default AppRoutes;
