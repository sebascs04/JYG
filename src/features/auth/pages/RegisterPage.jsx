import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../../store/useAuthStore';
import { register as registerApi } from '../../../api/auth.service';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setError('');
    setIsLoading(true);

    try {
      const response = await registerApi(data);
      login(response.user, response.token);
      navigate('/catalog');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrarse');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Crear Cuenta
      </h2>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nombre completo"
          placeholder="Juan Pérez"
          error={errors.name?.message}
          {...register('name', { required: 'El nombre es requerido' })}
        />

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

        <Input
          label="Teléfono"
          type="tel"
          placeholder="300 123 4567"
          error={errors.phone?.message}
          {...register('phone', {
            required: 'El teléfono es requerido',
            pattern: {
              value: /^[0-9]{10}$/,
              message: 'Teléfono inválido (10 dígitos)',
            },
          })}
        />

        <Input
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password', {
            required: 'La contraseña es requerida',
            minLength: {
              value: 8,
              message: 'Mínimo 8 caracteres',
            },
          })}
        />

        <Input
          label="Confirmar contraseña"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Confirma tu contraseña',
            validate: (value) =>
              value === password || 'Las contraseñas no coinciden',
          })}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Registrando...' : 'Registrarse'}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
          Inicia sesión aquí
        </Link>
      </p>
    </div>
  );
}

export default RegisterPage;
