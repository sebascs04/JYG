import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Header from '../../../components/layout/Header';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { Plus, Edit2, Save, X, Package, AlertTriangle } from 'lucide-react';

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    precio_unitario: '',
    stock_actual: '',
    id_categoria: '',
    imagen_url: '',
    activo: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        supabase.from('productos').select('*, categorias(nombre)').order('id_producto'),
        supabase.from('categorias').select('*')
      ]);
      setProducts(prodRes.data || []);
      setCategorias(catRes.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      codigo: '',
      nombre: '',
      descripcion: '',
      precio_unitario: '',
      stock_actual: '',
      id_categoria: '',
      imagen_url: '',
      activo: true
    });
    setEditingId(null);
    setShowForm(false);
  }

  function handleEdit(product) {
    setFormData({
      codigo: product.codigo || '',
      nombre: product.nombre || '',
      descripcion: product.descripcion || '',
      precio_unitario: product.precio_unitario || '',
      stock_actual: product.stock_actual || '',
      id_categoria: product.id_categoria || '',
      imagen_url: product.imagen_url || '',
      activo: product.activo !== false
    });
    setEditingId(product.id_producto);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const dataToSave = {
        codigo: formData.codigo,
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio_unitario: parseFloat(formData.precio_unitario),
        stock_actual: parseInt(formData.stock_actual),
        id_categoria: formData.id_categoria ? parseInt(formData.id_categoria) : null,
        imagen_url: formData.imagen_url,
        activo: formData.activo
      };

      if (editingId) {
        const { error } = await supabase
          .from('productos')
          .update(dataToSave)
          .eq('id_producto', editingId);
        if (error) throw error;
        alert('Producto actualizado');
      } else {
        const { error } = await supabase
          .from('productos')
          .insert([dataToSave]);
        if (error) throw error;
        alert('Producto creado');
      }

      fetchData();
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + error.message);
    }
  }

  async function handleUpdateStock(id, newStock) {
    try {
      const { error } = await supabase
        .from('productos')
        .update({ stock_actual: parseInt(newStock) })
        .eq('id_producto', id);
      if (error) throw error;

      setProducts(products.map(p =>
        p.id_producto === id ? { ...p, stock_actual: parseInt(newStock) } : p
      ));
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar stock');
    }
  }

  async function toggleActivo(id, currentActivo) {
    try {
      const { error } = await supabase
        .from('productos')
        .update({ activo: !currentActivo })
        .eq('id_producto', id);
      if (error) throw error;

      setProducts(products.map(p =>
        p.id_producto === id ? { ...p, activo: !currentActivo } : p
      ));
    } catch (error) {
      console.error('Error:', error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Inventario de Productos</h1>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nuevo Producto
          </Button>
        </div>

        {/* Formulario Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold">
                  {editingId ? 'Editar Producto' : 'Nuevo Producto'}
                </h2>
                <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código (único)
                    </label>
                    <input
                      type="text"
                      value={formData.codigo}
                      onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="SKU-001"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría
                    </label>
                    <select
                      value={formData.id_categoria}
                      onChange={(e) => setFormData({ ...formData, id_categoria: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                      required
                    >
                      <option value="">Seleccionar...</option>
                      {categorias.map(c => (
                        <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del producto
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Pollo entero"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    rows={3}
                    placeholder="Descripción detallada del producto..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio unitario (S/)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.precio_unitario}
                      onChange={(e) => setFormData({ ...formData, precio_unitario: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="15.50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock (unidades)
                    </label>
                    <input
                      type="number"
                      value={formData.stock_actual}
                      onChange={(e) => setFormData({ ...formData, stock_actual: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="100"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL de imagen
                  </label>
                  <input
                    type="url"
                    value={formData.imagen_url}
                    onChange={(e) => setFormData({ ...formData, imagen_url: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                  {formData.imagen_url && (
                    <img
                      src={formData.imagen_url}
                      alt="Preview"
                      className="mt-2 w-24 h-24 object-cover rounded-lg border"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="activo"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="activo" className="text-sm text-gray-700">
                    Producto activo (visible en catálogo)
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {editingId ? 'Guardar cambios' : 'Crear producto'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tabla de productos */}
        {loading ? (
          <div className="text-center py-12">Cargando productos...</div>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-600">Producto</th>
                    <th className="text-left p-4 font-medium text-gray-600">Código</th>
                    <th className="text-left p-4 font-medium text-gray-600">Categoría</th>
                    <th className="text-left p-4 font-medium text-gray-600">Precio</th>
                    <th className="text-left p-4 font-medium text-gray-600">Stock</th>
                    <th className="text-left p-4 font-medium text-gray-600">Estado</th>
                    <th className="text-left p-4 font-medium text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map(product => (
                    <tr key={product.id_producto} className="hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.imagen_url || 'https://via.placeholder.com/40'}
                            alt={product.nombre}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{product.nombre}</p>
                            <p className="text-xs text-gray-500 line-clamp-1">
                              {product.descripcion || 'Sin descripción'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{product.codigo || '-'}</td>
                      <td className="p-4 text-sm text-gray-600">{product.categorias?.nombre || '-'}</td>
                      <td className="p-4 font-medium">S/ {Number(product.precio_unitario).toFixed(2)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            defaultValue={product.stock_actual}
                            onBlur={(e) => handleUpdateStock(product.id_producto, e.target.value)}
                            className="w-20 border rounded px-2 py-1 text-center"
                          />
                          {product.stock_actual === 0 && (
                            <span className="flex items-center gap-1 text-xs text-red-600">
                              <AlertTriangle className="h-3 w-3" />
                              Agotado
                            </span>
                          )}
                          {product.stock_actual > 0 && product.stock_actual <= 10 && (
                            <span className="text-xs text-yellow-600">Bajo</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => toggleActivo(product.id_producto, product.activo)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            product.activo
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {product.activo ? 'Activo' : 'Inactivo'}
                        </button>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
