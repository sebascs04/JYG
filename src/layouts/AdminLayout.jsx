import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';

function AdminLayout() {
  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-800">
            Panel de Administración
          </h1>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
