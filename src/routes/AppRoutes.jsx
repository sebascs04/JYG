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
import DeliveryPage from '../features/admin/pages/DeliveryPage';

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

      {/* Admin Routes - Solo Admin (todo) */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/inventory" element={<InventoryPage />} />
        </Route>
      </Route>

      {/* Admin Routes - Recepcionista (pedidos) */}
      <Route element={<ProtectedRoute allowedRoles={['admin', 'recepcionista']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/orders" element={<OrdersPage />} />
        </Route>
      </Route>

      {/* Admin Routes - Despachador (despacho) */}
      <Route element={<ProtectedRoute allowedRoles={['admin', 'despachador']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dispatch" element={<DispatchPage />} />
        </Route>
      </Route>

      {/* Admin Routes - Repartidor (entregas) */}
      <Route element={<ProtectedRoute allowedRoles={['admin', 'repartidor']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/delivery" element={<DeliveryPage />} />
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
