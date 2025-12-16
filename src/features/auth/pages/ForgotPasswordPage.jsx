import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { supabase } from '../../../lib/supabase';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

function ForgotPasswordPage() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setError('');
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/JYG/reset-password`,
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Error al enviar el correo');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-4">
          <h3 className="font-semibold mb-2">Correo enviado</h3>
          <p className="text-sm">
            Revisa tu bandeja de entrada. Te hemos enviado un enlace para restablecer tu contraseña.
          </p>
        </div>
        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
          Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
        Restablecer Contraseña
      </h2>
      <p className="text-gray-600 text-sm text-center mb-6">
        Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña
      </p>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Enviando...' : 'Enviar enlace'}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
          Volver al inicio de sesión
        </Link>
      </p>
    </div>
  );
}

export default ForgotPasswordPage;
