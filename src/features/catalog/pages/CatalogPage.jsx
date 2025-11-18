import { useState, useEffect } from 'react';
import { getProducts } from '../../../api/products.service';
import { getCategories } from '../../../api/categories.service';
import Header from '../../../components/layout/Header';
import CategoryNav from '../../../components/catalog/CategoryNav';
import ProductCard from '../../../components/catalog/ProductCard';
import HeroBanner from '../../../components/catalog/HeroBanner';
import Spinner from '../../../components/ui/Spinner';
import { useCartStore } from '../../../store/useCartStore';

function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [error, setError] = useState(null);
  const { addItem } = useCartStore();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [activeCategory]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load categories
      const catData = await getCategories();
      setCategories(catData.categories || []);

      // Load initial products
      await loadProducts();
    } catch (error) {
      console.error('Error loading data:', error);
      setError('No se pudieron cargar los productos. Por favor, intenta de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const params = activeCategory ? { category: activeCategory } : {};
      const data = await getProducts(params);
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Error al cargar los productos.');
    }
  };

  const handleAddToCart = (product) => {
    addItem(product);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-luxury-bg">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-luxury-bg">
        <div className="text-center">
          <p className="text-2xl font-serif text-red-600 mb-3">{error}</p>
          <button
            onClick={loadData}
            className="px-6 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-bg">
      {/* Header */}
      <Header />

      {/* Hero Banner */}
      <HeroBanner />

      {/* Category Navigation */}
      <CategoryNav
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 lg:px-12 py-20">
        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-2xl font-serif text-stone-600 mb-3">
              No hay productos disponibles
            </p>
            <p className="text-sm text-stone-400">
              Intenta seleccionar otra categoría
            </p>
          </div>
        ) : (
          <div>
            {/* Section Title */}
            <div className="mb-16 text-center">
              <h2 className="text-4xl font-serif font-bold text-stone-900 mb-3">
                {activeCategory
                  ? categories.find(c => c.id === activeCategory)?.name || 'Productos'
                  : 'Nuestra Colección'}
              </h2>
              <p className="text-stone-500 text-sm tracking-wide">
                {products.length} {products.length === 1 ? 'producto' : 'productos'}
              </p>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CatalogPage;
