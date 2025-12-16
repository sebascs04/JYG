import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../../store/useAuthStore';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuthStore();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Obtener la ruta de redirección (si viene del checkout)
  const from = location.state?.from || null;

  // Si ya está autenticado, redirigir según su rol
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'recepcionista') {
        navigate('/admin/orders', { replace: true });
      } else if (user.role === 'despachador') {
        navigate('/admin/dispatch', { replace: true });
      } else if (user.role === 'repartidor') {
        navigate('/admin/delivery', { replace: true });
      } else {
        navigate('/catalog', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setError('');
    setIsLoading(true);

    try {
      // 1. Llamamos a la acción del store (que ya tiene la lógica de Supabase dentro)
      await login(data.email, data.password);
      
      // 2. Obtenemos el estado actualizado directamente del store para decidir
      // Nota: A veces React tarda un milisegundo en actualizar 'user' en el hook,
      // así que verificamos directamente con la instancia del store o asumimos la redirección.
      
      const currentUser = useAuthStore.getState().user;

      // 3. Redirección inteligente según rol
      if (from) {
        // Si venía de checkout, redirigir ahí
        navigate(from);
      } else if (currentUser?.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (currentUser?.role === 'recepcionista') {
        navigate('/admin/orders');
      } else if (currentUser?.role === 'despachador') {
        navigate('/admin/dispatch');
      } else if (currentUser?.role === 'repartidor') {
        navigate('/admin/delivery');
      } else {
        // Cliente va al catálogo
        navigate('/catalog');
      }

    } catch (err) {
      console.error(err);
      // Mostrar mensaje específico del error
      setError(err.message || 'Credenciales incorrectas o error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Iniciar Sesión
      </h2>

      {from === '/checkout' && (
        <div className="bg-blue-50 text-blue-700 p-3 rounded-lg mb-4 text-sm text-center">
          Inicia sesión para completar tu compra
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            label="Correo electrónico"
            type="email"
            placeholder="tu@email.com"
            error={errors.email?.message}
            {...register('email', {
              required: 'El correo es requerido',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Correo inválido',
              },
            })}
          />
        </div>

        <div>
          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password', {
              required: 'La contraseña es requerida',
            })}
          />
        </div>

        <Button type="submit" className="w-full bg-primary-600 hover:bg-primary-700" disabled={isLoading}>
          {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </Button>
      </form>

      <div className="mt-4 text-center text-sm text-gray-600 space-y-2">
        <p>
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
            Regístrate aquí
          </Link>
        </p>
        <p>
          <Link to="/forgot-password" className="text-gray-500 hover:text-primary-600 text-xs">
            ¿Olvidaste tu contraseña?
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;