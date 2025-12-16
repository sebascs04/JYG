import { ArrowRight } from 'lucide-react';

function HeroBanner() {
  return (
    <div className="relative overflow-hidden bg-luxury-cream">
      <div className="grid md:grid-cols-2 gap-12 items-center min-h-[500px]">
        {/* Left Content */}
        <div className="px-12 py-20">
          <p className="text-sm font-medium text-stone-500 tracking-widest uppercase mb-6">
            Colección Fresca
          </p>
          <h1 className="text-6xl md:text-7xl font-serif font-bold text-stone-900 mb-8 leading-tight">
            Frescura
            <br />
            de Origen
          </h1>
          <p className="text-lg text-stone-600 mb-10 max-w-md leading-relaxed">
            Descubre productos cuidadosamente seleccionados para garantizar la máxima calidad y frescura en cada compra.
          </p>
          
        </div>

        {/* Right Image */}
        <div className="relative h-full min-h-[500px] bg-stone-200">
          <img
            src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&h=800&fit=crop"
            alt="Fresh Products"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}

export default HeroBanner;
