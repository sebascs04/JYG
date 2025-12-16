import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../../store/useAuthStore';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuthStore();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  // Validación de contraseña segura (8 chars, 1 número, 1 mayúscula)
  const validatePassword = (value) => {
    if (value.length < 8) return 'Mínimo 8 caracteres';
    if (!/[A-Z]/.test(value)) return 'Debe contener al menos una mayúscula';
    if (!/[0-9]/.test(value)) return 'Debe contener al menos un número';
    return true;
  };

  const onSubmit = async (data) => {
    setError('');
    setIsLoading(true);

    try {
      await registerUser({
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        telefono: data.telefono,
        direccion: data.direccion,
        password: data.password,
      });
      navigate('/catalog');
    } catch (err) {
      if (err.message?.includes('already registered')) {
        setError('Este correo ya está registrado');
      } else {
        setError(err.message || 'Error al registrarse');
      }
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
        <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nombres"
            placeholder="Juan"
            error={errors.nombre?.message}
            {...register('nombre', { required: 'El nombre es requerido' })}
          />

          <Input
            label="Apellidos"
            placeholder="Pérez García"
            error={errors.apellido?.message}
            {...register('apellido', { required: 'El apellido es requerido' })}
          />
        </div>

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
          placeholder="987654321"
          error={errors.telefono?.message}
          {...register('telefono', {
            required: 'El teléfono es requerido',
            pattern: {
              value: /^[0-9]{9}$/,
              message: 'Teléfono inválido (9 dígitos)',
            },
          })}
        />

        <Input
          label="Dirección de entrega"
          placeholder="Av. Principal 123, Lima"
          error={errors.direccion?.message}
          {...register('direccion', { required: 'La dirección es requerida' })}
        />

        <Input
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password', {
            required: 'La contraseña es requerida',
            validate: validatePassword,
          })}
        />
        <p className="text-xs text-gray-500 -mt-2">
          Mínimo 8 caracteres, 1 mayúscula y 1 número
        </p>

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
