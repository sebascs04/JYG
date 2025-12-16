import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Header from '../../../components/layout/Header'; // Reusamos tu header

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [categorias, setCategorias] = useState([]);
  // Formulario nuevo producto
  const [newProd, setNewProd] = useState({ nombre: '', precio_unitario: '', stock_actual: '', id_categoria: '' });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: p } = await supabase.from('productos').select('*').order('id_producto');
    const { data: c } = await supabase.from('categorias').select('*');
    setProducts(p || []);
    setCategorias(c || []);
  }

  async function handleUpdateStock(id, newStock) {
    await supabase.from('productos').update({ stock_actual: newStock }).eq('id_producto', id);
    alert("Stock actualizado");
  }

  async function handleCreate(e) {
    e.preventDefault();
    const { error } = await supabase.from('productos').insert([newProd]);
    if(error) alert(error.message);
    else {
      alert("Producto creado");
      fetchData();
      setNewProd({ nombre: '', precio_unitario: '', stock_actual: '', id_categoria: '' });
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-green-800 mb-8">Panel de Inventario</h1>
        
        {/* Formulario Crear */}
        <div className="bg-white p-6 rounded-xl shadow mb-8">
          <h2 className="text-xl font-bold mb-4">Nuevo Producto</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <input placeholder="Nombre" className="border p-2 rounded" value={newProd.nombre} onChange={e=>setNewProd({...newProd, nombre: e.target.value})} required />
            <input placeholder="Precio" type="number" className="border p-2 rounded" value={newProd.precio_unitario} onChange={e=>setNewProd({...newProd, precio_unitario: e.target.value})} required />
            <input placeholder="Stock" type="number" className="border p-2 rounded" value={newProd.stock_actual} onChange={e=>setNewProd({...newProd, stock_actual: e.target.value})} required />
            <select className="border p-2 rounded" value={newProd.id_categoria} onChange={e=>setNewProd({...newProd, id_categoria: e.target.value})} required>
              <option value="">Categoría</option>
              {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
            </select>
            <button className="bg-green-600 text-white rounded hover:bg-green-700">Guardar</button>
          </form>
        </div>

        {/* Tabla Productos */}
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4">Nombre</th>
                <th className="p-4">Precio</th>
                <th className="p-4">Stock (Editar)</th>
                <th className="p-4">Estado</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id_producto} className="border-b hover:bg-gray-50">
                  <td className="p-4">{p.nombre}</td>
                  <td className="p-4">S/ {p.precio_unitario}</td>
                  <td className="p-4">
                    <input 
                      type="number" 
                      defaultValue={p.stock_actual}
                      onBlur={(e) => handleUpdateStock(p.id_producto, e.target.value)}
                      className="border p-1 w-24 rounded text-center"
                    />
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${p.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}