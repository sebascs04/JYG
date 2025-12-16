import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../../../api/products.service';
import { useCartStore } from '../../../store/useCartStore';
import Spinner from '../../../components/ui/Spinner';
import Header from '../../../components/layout/Header';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function load() {
      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleAddToCart = () => {
    if (quantity > product.stock) return alert("Stock insuficiente");
    addItem(product, quantity); // Se guarda en el carrito temporal
    alert("Producto agregado");
    navigate('/catalog');
  };

  if (loading) return <Spinner />;
  if (!product) return <div>Producto no encontrado</div>;

  return (
    <div className="min-h-screen bg-luxury-bg">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <button onClick={() => navigate(-1)} className="mb-6 text-stone-500 hover:text-green-700">
          ← Volver al catálogo
        </button>
        
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
          {/* Imagen */}
          <div className="h-96 md:h-full bg-gray-100">
            <img src={product.image || 'https://via.placeholder.com/400'} alt={product.name} className="w-full h-full object-cover" />
          </div>
          
          {/* Info */}
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <span className="text-green-600 font-bold tracking-widest text-sm uppercase mb-2">{product.category}</span>
            <h1 className="text-4xl font-serif font-bold text-stone-900 mb-4">{product.name}</h1>
            <p className="text-stone-600 mb-8 leading-relaxed">{product.description || "Sin descripción disponible."}</p>
            
            <div className="text-3xl font-bold text-green-700 mb-8">S/ {Number(product.price).toFixed(2)}</div>
            
            {/* Selector Cantidad */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center border border-gray-300 rounded-full">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-4 py-2 hover:bg-gray-100 rounded-l-full">-</button>
                <span className="px-4 font-bold">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="px-4 py-2 hover:bg-gray-100 rounded-r-full">+</button>
              </div>
              <span className="text-sm text-gray-500">{product.stock} disponibles</span>
            </div>

            <button 
              onClick={handleAddToCart}
              className="w-full bg-green-700 text-white py-4 rounded-full font-bold hover:bg-green-800 transition-all shadow-lg hover:shadow-green-200/50"
            >
              Añadir al Carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}