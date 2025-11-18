import { useState, useEffect } from 'react';
import { getProducts } from '../../../api/products.service';
import { MOCK_PRODUCTS } from '../../../utils/constants';
import Header from '../../../components/layout/Header';
import CategoryNav from '../../../components/catalog/CategoryNav';
import ProductCard from '../../../components/catalog/ProductCard';
import HeroBanner from '../../../components/catalog/HeroBanner';
import Spinner from '../../../components/ui/Spinner';
import { useCartStore } from '../../../store/useCartStore';

function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const { addItem } = useCartStore();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await getProducts();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
      // Fallback to mock data if API fails
      setProducts(MOCK_PRODUCTS);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addItem(product);
  };

  // Filter products by category
  const filteredProducts = products.filter((product) => {
    const matchesCategory = activeCategory === null || product.category === activeCategory;
    return matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-luxury-bg">
        <Spinner size="xl" />
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
        {filteredProducts.length === 0 ? (
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
                  ? `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}`
                  : 'Nuestra Colección'}
              </h2>
              <p className="text-stone-500 text-sm tracking-wide">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
              </p>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
              {filteredProducts.map((product) => (
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
