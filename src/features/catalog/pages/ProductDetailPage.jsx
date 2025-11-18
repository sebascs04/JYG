import { useParams } from 'react-router-dom';

function ProductDetailPage() {
  const { id } = useParams();

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold">Detalle del Producto #{id}</h1>
      <p className="mt-4 text-gray-600">
        Esta página mostrará los detalles del producto seleccionado.
      </p>
    </div>
  );
}

export default ProductDetailPage;
