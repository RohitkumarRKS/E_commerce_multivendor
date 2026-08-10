import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiGrid, FiSearch, FiArrowRight, FiShoppingBag, FiLayers } from 'react-icons/fi';
import { categoryAPI, productAPI } from '../services/api';
import Loader from '../components/common/Loader';
import { getImageUrl } from '../utils/helpers';

const CATEGORY_PHOTO_MAP = {
  'electronics-tech': 'https://images.unsplash.com/photo-1498049860654-af1a5c566876?w=400&auto=format&fit=crop&q=80',
  'fashion-apparel': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&auto=format&fit=crop&q=80',
  'mobiles-accessories': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80',
  'home-kitchen': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&auto=format&fit=crop&q=80',
  'beauty-personal-care': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&auto=format&fit=crop&q=80',
  'toys-baby-kids': 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=400&auto=format&fit=crop&q=80',
  'sports-fitness': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80',
  'smart-appliances': 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400&auto=format&fit=crop&q=80',
  'footwear-shoes': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80',
  'grocery-gourmet': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80',
  'automotive-accessories': 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=400&auto=format&fit=crop&q=80',
  'books-stationery': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80',
  'gaming-consoles': 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&auto=format&fit=crop&q=80',
  'jewellery-watches': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80',
  'furniture-decor': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&auto=format&fit=crop&q=80',
  '2-wheelers-parts': 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&auto=format&fit=crop&q=80',
};

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cRes, pRes] = await Promise.allSettled([
        categoryAPI.getAll(),
        productAPI.getAll({ limit: 100 }),
      ]);
      if (cRes.status === 'fulfilled') setCategories(cRes.value.data.data.categories || []);
      if (pRes.status === 'fulfilled') setProducts(pRes.value.data.data.products || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen py-10 bg-surface-50 dark:bg-gray-950 transition-colors">
      <div className="container-main">
        {/* Page Header */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="inline-block px-3 py-1 bg-primary-50 dark:bg-gray-800 text-primary-600 dark:text-primary-400 font-extrabold text-xs rounded-full mb-2 border border-primary-100 dark:border-gray-700">
                Marketplace Categories Hub
              </span>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                <FiLayers className="text-primary-500" /> All Shopping Categories ({categories.length})
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Explore products from verified sellers organized by categories
              </p>
            </div>

            {/* Search Categories Input */}
            <div className="w-full md:w-80">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search categories..."
                  className="input pl-10 text-sm py-3"
                />
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCategories.map((cat) => {
            const photoUrl = getImageUrl(cat.image) || CATEGORY_PHOTO_MAP[cat.slug] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80';
            const catProducts = products.filter((p) => p.category?.slug === cat.slug);

            return (
              <div
                key={cat.id}
                onClick={() => navigate(`/category/${cat.slug}`)}
                className="group bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                {/* Category Hero Image */}
                <div className="relative h-44 overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    src={photoUrl}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white backdrop-blur-sm shadow-sm">
                      {catProducts.length} Products Available
                    </span>
                  </div>
                </div>

                {/* Category Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {cat.description || 'Discover genuine products in this category.'}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs font-bold text-primary-500 group-hover:text-primary-600">
                    <span>Browse Products</span>
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
            <p className="text-5xl mb-4">🔍</p>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No categories found</h3>
            <p className="text-xs text-gray-400 mt-1 mb-4">No shopping categories matching "{searchQuery}"</p>
            <button onClick={() => setSearchQuery('')} className="btn-primary py-2 px-5 text-xs font-bold">
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
