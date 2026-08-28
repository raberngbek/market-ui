import React, { useState, useEffect } from 'react';
import { getMarketPlaceHome, getCategories } from '../api/marketPlaceService';

const HomePage = () => {
  const [data, setData] = useState({ featured: [], products: [] });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [homeData, cats] = await Promise.all([
          getMarketPlaceHome(),
          getCategories()
        ]);
        setData(homeData);
        setCategories(cats);
      } catch (err) {
        setError('Failed to load marketplace data. Please ensure the API is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-600 text-lg">Loading marketplace...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

  const filteredProducts = selectedCategory === 'all' 
    ? data.products 
    : data.products?.filter(p => p.categoryId === selectedCategory);

  return (
    <div>
      <div className="flex overflow-x-auto space-x-4 pb-4 mb-8 border-b scrollbar-hide">
        <button 
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${selectedCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
        >
          All Items
        </button>
        {categories?.map(cat => (
          <button 
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${selectedCategory === cat.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {selectedCategory === 'all' && data.featured?.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Featured Items</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {data.featured.map(item => (
              <ProductCard key={item.id} product={item} featured />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">{selectedCategory === 'all' ? 'All Products' : 'Filtered Products'}</h2>
        {filteredProducts?.length === 0 ? (
          <p className="text-gray-500 bg-gray-50 p-8 text-center rounded-lg border border-dashed border-gray-300">No products found for this category.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts?.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ProductCard = ({ product, featured }) => (
  <div className={`bg-white rounded-lg overflow-hidden transition-shadow hover:shadow-lg ${featured ? 'border-2 border-yellow-400 shadow-md' : 'border border-gray-200 shadow-sm'}`}>
    <div className="h-48 bg-gray-100 flex items-center justify-center">
      {product.imageUrl ? (
        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
      ) : (
        <span className="text-gray-400">No Image</span>
      )}
    </div>
    <div className="p-4">
      <h3 className="font-semibold text-lg mb-1 text-gray-800 truncate">{product.name}</h3>
      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
      <div className="flex justify-between items-center mt-auto">
        <span className="font-bold text-xl text-blue-600">${product.price}</span>
        <button className="px-3 py-1.5 bg-blue-50 text-blue-700 font-medium rounded hover:bg-blue-100 transition-colors">Add to Cart</button>
      </div>
    </div>
  </div>
);

export default HomePage;
