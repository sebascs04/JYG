import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (producto, cantidad = 1) => {
        const items = get().items;
        // Usamos 'id_producto' porque así se llama en tu tabla SQL
        const existe = items.find(p => p.id_producto === producto.id_producto);

        // Validación de stock (Visual)
        if (producto.stock_actual < cantidad) {
          alert("Stock insuficiente para agregar esa cantidad");
          return;
        }

        if (existe) {
          const nuevaCantidad = existe.cantidad + cantidad;
          if (nuevaCantidad > producto.stock_actual) {
             alert("No puedes agregar más del stock disponible");
             return;
          }
          
          set({
            items: items.map(p => 
              p.id_producto === producto.id_producto
                ? { ...p, cantidad: nuevaCantidad }
                : p
            )
          });
        } else {
          // Guardamos producto completo
          set({ items: [...items, { ...producto, cantidad }] });
        }
      },

      removeItem: (idProducto) => set({ 
        items: get().items.filter(p => p.id_producto !== idProducto) 
      }),

      updateQuantity: (idProducto, cantidad) => {
        if (cantidad <= 0) {
            // Si baja a 0, lo borramos
            set({ items: get().items.filter(p => p.id_producto !== idProducto) });
            return;
        }
        set({
            items: get().items.map(p => 
                p.id_producto === idProducto ? { ...p, cantidad } : p
            )
        });
      },

      clearCart: () => set({ items: [] }),

      // Subtotal sin IGV
      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          const precio = item.precio_unitario || item.price || 0;
          const cantidad = item.cantidad || item.quantity || 0;
          return total + (precio * cantidad);
        }, 0);
      },

      // IGV (18%)
      getIGV: () => {
        return get().getSubtotal() * 0.18;
      },

      // Total con IGV
      getTotalPrice: () => {
        const subtotal = get().getSubtotal();
        const igv = subtotal * 0.18;
        return subtotal + igv;
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => {
          const cantidad = item.cantidad || item.quantity || 0;
          return total + cantidad;
        }, 0);
      }
    }),
    { name: 'carrito-jyg' }
  )
);