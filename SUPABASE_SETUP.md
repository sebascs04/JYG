# Configuración de Supabase para Rápidos y Plumosos

Este proyecto ahora usa Supabase como backend. Sigue estos pasos para configurarlo:

## 1. Crear un Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com) y crea una cuenta si no tienes una
2. Crea un nuevo proyecto
3. Guarda la **URL del proyecto** y la **anon/public key** que aparecen en la configuración

## 2. Configurar las Variables de Entorno

1. Abre el archivo `.env` en la raíz del proyecto
2. Reemplaza los valores con tus credenciales de Supabase:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
VITE_APP_NAME=Rápidos y Plumosos
```

Las credenciales las encuentras en:
- **Settings** → **API** → **Project URL** (VITE_SUPABASE_URL)
- **Settings** → **API** → **Project API keys** → **anon/public** (VITE_SUPABASE_ANON_KEY)

## 3. Ejecutar el Schema SQL en Supabase

1. En tu proyecto de Supabase, ve a **SQL Editor**
2. Abre el archivo `supabase-schema.sql` que se encuentra en la raíz de este proyecto
3. Copia todo el contenido del archivo
4. Pégalo en el editor SQL de Supabase
5. Haz clic en **Run** para ejecutar el script

Esto creará:
- Tablas: `profiles`, `products`, `orders`, `order_items`
- Índices para mejor rendimiento
- Políticas de Row Level Security (RLS)
- Datos de ejemplo (productos)

## 4. Configurar la Autenticación en Supabase (Opcional)

Si quieres habilitar confirmación de email:

1. Ve a **Authentication** → **Providers** → **Email**
2. Configura según tus necesidades:
   - **Confirm email**: Habilitar/Deshabilitar confirmación de email
   - **Secure email change**: Habilitar para mayor seguridad

Para desarrollo, te recomiendo **deshabilitar** la confirmación de email.

## 5. Crear un Usuario Admin (Opcional)

Para tener un usuario administrador:

1. Registra un usuario normal desde la aplicación
2. Ve a **Authentication** → **Users** en Supabase
3. Copia el UUID del usuario
4. Ve a **Table Editor** → **profiles**
5. Busca el perfil con ese UUID
6. Cambia el campo `role` de `customer` a `admin`

## 6. Ejecutar el Proyecto

```bash
npm run dev
```

## Estructura de la Base de Datos

### Tabla: profiles
Almacena información de los usuarios registrados.
- `id` (UUID): ID del usuario (referencia a auth.users)
- `email` (TEXT): Email del usuario
- `name` (TEXT): Nombre completo
- `phone` (TEXT): Teléfono
- `role` (TEXT): Rol del usuario (customer, employee, admin)

### Tabla: products
Almacena los productos disponibles.
- `id` (UUID): ID del producto
- `name` (TEXT): Nombre del producto
- `description` (TEXT): Descripción
- `price` (DECIMAL): Precio
- `category` (TEXT): Categoría (pollo, cerdo, pavita, abarrotes)
- `image` (TEXT): URL de la imagen
- `stock` (INTEGER): Cantidad en inventario

### Tabla: orders
Almacena las órdenes de compra.
- `id` (UUID): ID de la orden
- `user_id` (UUID): ID del usuario que hizo la orden
- `status` (TEXT): Estado (pending, processing, shipped, delivered, cancelled)
- `subtotal` (DECIMAL): Subtotal
- `shipping` (DECIMAL): Costo de envío
- `total` (DECIMAL): Total
- `shipping_address` (JSONB): Dirección de envío
- `payment_method` (TEXT): Método de pago
- `tracking_number` (TEXT): Número de seguimiento

### Tabla: order_items
Almacena los items de cada orden.
- `id` (UUID): ID del item
- `order_id` (UUID): ID de la orden
- `product_id` (UUID): ID del producto
- `quantity` (INTEGER): Cantidad
- `price` (DECIMAL): Precio al momento de la compra
- `subtotal` (DECIMAL): Subtotal del item

## Políticas de Seguridad (RLS)

El schema incluye políticas de Row Level Security que garantizan:

- Los productos son visibles para todos
- Solo admins pueden crear/editar/eliminar productos
- Los usuarios solo pueden ver sus propias órdenes
- Admins y empleados pueden ver todas las órdenes
- Los usuarios solo pueden crear órdenes para sí mismos

## Funcionalidades Implementadas

Los siguientes servicios ya están listos para usar con Supabase:

- **Autenticación**: Login, registro, logout, recuperación de contraseña
- **Productos**: Listar, buscar, filtrar por categoría, CRUD completo
- **Órdenes**: Crear, listar, actualizar estado, cancelar
- **Inventario**: Ver stock, actualizar cantidades, alertas de stock bajo

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Verifica que el archivo `.env` tenga las variables correctas
- Reinicia el servidor de desarrollo después de cambiar las variables

### Error: "relation does not exist"
- Asegúrate de haber ejecutado el schema SQL completo en Supabase
- Ve a **Table Editor** y verifica que las tablas existan

### No puedo crear productos/órdenes
- Verifica que las políticas de RLS estén habilitadas
- Asegúrate de que tu usuario tenga el rol correcto en la tabla `profiles`

## Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
