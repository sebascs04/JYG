function CategoryNav({ activeCategory, onCategoryChange, categories = [] }) {
  return (
    <div className="bg-luxury-bg border-b border-stone-200/50">
      <div className="max-w-7xl mx-auto px-8 lg:px-12">
        <div className="flex justify-center gap-12 py-8">
          {/* All Products Option */}
          <button
            onClick={() => onCategoryChange(null)}
            className={`
              relative pb-2 text-sm font-medium tracking-wide uppercase transition-all duration-500
              ${
                activeCategory === null
                  ? 'text-luxury-olive'
                  : 'text-stone-500 hover:text-stone-700'
              }
            `}
          >
            Todos
            {activeCategory === null && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-luxury-olive" />
            )}
          </button>

          {/* Category Tabs */}
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`
                relative pb-2 text-sm font-medium tracking-wide uppercase transition-all duration-500
                ${
                  activeCategory === category.id
                    ? 'text-luxury-olive'
                    : 'text-stone-500 hover:text-stone-700'
                }
              `}
            >
              {category.name}
              {activeCategory === category.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-luxury-olive" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CategoryNav;
