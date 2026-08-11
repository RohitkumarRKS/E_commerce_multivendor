import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiChevronRight, FiGrid, FiSearch,
  FiX, FiCheck, FiShoppingBag, FiLayers, FiFilter, FiSliders
} from 'react-icons/fi';
import { productAPI, categoryAPI, bannerAPI } from '../services/api';
import ProductCard from '../components/common/ProductCard';
import Loader from '../components/common/Loader';
import HeroBanner from '../components/common/HeroBanner';
import CustomSelect from '../components/common/CustomSelect';
import { getImageUrl } from '../utils/helpers';

const CATEGORY_PHOTO_MAP = {
  'electronics-tech': 'https://images.unsplash.com/photo-1498049860654-af1a5c566876?w=300&auto=format&fit=crop&q=80',
  'fashion-apparel': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&auto=format&fit=crop&q=80',
  'mobiles-accessories': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=80',
  'home-kitchen': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=300&auto=format&fit=crop&q=80',
  'beauty-personal-care': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&auto=format&fit=crop&q=80',
  'toys-baby-kids': 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=300&auto=format&fit=crop&q=80',
  'sports-fitness': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&auto=format&fit=crop&q=80',
  'smart-appliances': 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=300&auto=format&fit=crop&q=80',
  'footwear-shoes': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop&q=80',
  'grocery-gourmet': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&auto=format&fit=crop&q=80',
  'automotive-accessories': 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=300&auto=format&fit=crop&q=80',
  'books-stationery': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&auto=format&fit=crop&q=80',
  'gaming-consoles': 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&auto=format&fit=crop&q=80',
  'jewellery-watches': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80',
  'furniture-decor': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&auto=format&fit=crop&q=80',
  '2-wheelers-parts': 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=300&auto=format&fit=crop&q=80',
};

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Category & Filter Controls State
  const [selectedCategorySlug, setSelectedCategorySlug] = useState('all');
  const [showAllCategoriesModal, setShowAllCategoriesModal] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');

  // E-Commerce Filters & Sorting State
  const [sortBy, setSortBy] = useState('newest');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [minRating, setMinRating] = useState('all');
  const [inStockOnly, setInStockOnly] = useState(false);

  const productsSectionRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, featuredRes, categoriesRes, bannersRes] = await Promise.allSettled([
        productAPI.getAll({ limit: 100, sortBy: 'createdAt', order: 'DESC' }),
        productAPI.getAll({ limit: 12, featured: 'true' }),
        categoryAPI.getAll(),
        bannerAPI.getAll(),
      ]);

      if (productsRes.status === 'fulfilled') setProducts(productsRes.value.data.data.products || []);
      if (featuredRes.status === 'fulfilled') setFeaturedProducts(featuredRes.value.data.data.products || []);
      if (categoriesRes.status === 'fulfilled') setCategories(categoriesRes.value.data.data.categories || []);
      if (bannersRes.status === 'fulfilled' && bannersRes.value.data?.data?.banners?.length > 0) {
        setBanners(bannersRes.value.data.data.banners);
      }
    } catch (error) {
      console.error('Failed to load homepage data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get distinct brands from products
  const availableBrands = Array.from(
    new Set(products.map((p) => p.brand).filter((b) => b && b.trim() !== ''))
  );

  // Apply Category + Filters + Sorting
  let processedProducts = [...products];

  // 1. Category Filter
  if (selectedCategorySlug !== 'all') {
    processedProducts = processedProducts.filter((p) => p.category?.slug === selectedCategorySlug);
  }

  // 2. Brand Filter
  if (selectedBrand !== 'all') {
    processedProducts = processedProducts.filter((p) => p.brand === selectedBrand);
  }

  // 3. Price Range Filter
  if (priceRange === 'under_1k') {
    processedProducts = processedProducts.filter((p) => p.price < 1000);
  } else if (priceRange === '1k_5k') {
    processedProducts = processedProducts.filter((p) => p.price >= 1000 && p.price <= 5000);
  } else if (priceRange === '5k_25k') {
    processedProducts = processedProducts.filter((p) => p.price >= 5000 && p.price <= 25000);
  } else if (priceRange === 'above_25k') {
    processedProducts = processedProducts.filter((p) => p.price > 25000);
  }

  // 4. Rating Filter
  if (minRating === '4') {
    processedProducts = processedProducts.filter((p) => (p.rating || 0) >= 4.0);
  }

  // 5. In-Stock Filter
  if (inStockOnly) {
    processedProducts = processedProducts.filter((p) => p.stock > 0);
  }

  // 6. Sorting
  if (sortBy === 'price_asc') {
    processedProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price_desc') {
    processedProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    processedProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (sortBy === 'discount') {
    processedProducts.sort((a, b) => (b.discount || 0) - (a.discount || 0));
  } else if (sortBy === 'newest') {
    processedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  const selectedCategoryObj = categories.find((c) => c.slug === selectedCategorySlug);

  const handleCategorySelect = (slug) => {
    setSelectedCategorySlug(slug);
    setShowAllCategoriesModal(false);
    if (productsSectionRef.current) {
      productsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const resetAllFilters = () => {
    setSelectedCategorySlug('all');
    setSortBy('newest');
    setSelectedBrand('all');
    setPriceRange('all');
    setMinRating('all');
    setInStockOnly(false);
  };



  const filteredModalCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(categorySearchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(categorySearchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      {/* 1. Standalone Hero Banner Component */}
      <HeroBanner banners={banners} />

      {/* 2. Products Section with Advanced E-Commerce Sorting & Filter Bar */}
      <section ref={productsSectionRef} className="section">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-card overflow-hidden border border-gray-100 dark:border-gray-800">
          {/* Header Title Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 sm:p-6 border-b dark:border-gray-800 gap-3 sm:gap-4 bg-surface-50/50 dark:bg-gray-800/30">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
                  {selectedCategorySlug === 'all' ? 'All Products' : selectedCategoryObj?.name || 'Category Products'}
                </h2>
                {selectedCategorySlug !== 'all' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary-100 text-primary-700 border border-primary-200">
                    Category Active
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5 sm:mt-1">
                Showing <strong className="text-gray-700 dark:text-gray-200">{processedProducts.length}</strong> available items
              </p>
            </div>

            {(selectedCategorySlug !== 'all' || selectedBrand !== 'all' || priceRange !== 'all' || minRating !== 'all' || inStockOnly) && (
              <button
                onClick={resetAllFilters}
                className="btn-ghost text-xs text-red-500 hover:text-red-700 hover:bg-red-50 flex items-center gap-1 font-bold py-1 px-2.5"
              >
                <FiX size={14} /> Clear All Filters
              </button>
            )}
          </div>

          {/* E-Commerce Filter Toolbar */}
          <div className="p-3 sm:p-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2 text-xs overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-2 flex-nowrap sm:flex-wrap shrink-0">
              <span className="font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1 text-[11px] shrink-0">
                <FiFilter size={14} className="text-primary-500" /> Filter By:
              </span>

              {/* Custom Sort Dropdown */}
              <CustomSelect
                label="Sort"
                icon={FiSliders}
                value={sortBy}
                onChange={setSortBy}
                options={[
                  { value: 'newest', label: 'Newest First' },
                  { value: 'price_asc', label: 'Price: Low to High 📈' },
                  { value: 'price_desc', label: 'Price: High to Low 📉' },
                  { value: 'rating', label: 'Highest Rated ⭐' },
                  { value: 'discount', label: 'Biggest Discount %' },
                ]}
              />

              {/* Custom Brand Filter Dropdown */}
              {availableBrands.length > 0 && (
                <CustomSelect
                  label="Brand"
                  value={selectedBrand}
                  onChange={setSelectedBrand}
                  options={[
                    { value: 'all', label: 'All Brands' },
                    ...availableBrands.map((b) => ({ value: b, label: b })),
                  ]}
                />
              )}

              {/* Custom Price Range Filter Dropdown */}
              <CustomSelect
                label="Price"
                value={priceRange}
                onChange={setPriceRange}
                options={[
                  { value: 'all', label: 'All Prices' },
                  { value: 'under_1k', label: 'Under ₹1,000' },
                  { value: '1k_5k', label: '₹1,000 - ₹5,000' },
                  { value: '5k_25k', label: '₹5,000 - ₹25,000' },
                  { value: 'above_25k', label: 'Above ₹25,000' },
                ]}
              />

              {/* 4 Star Rating Toggle */}
              <button
                onClick={() => setMinRating(minRating === '4' ? 'all' : '4')}
                className={`px-3 py-1.5 rounded-xl font-bold border transition-colors shrink-0 ${
                  minRating === '4'
                    ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                    : 'bg-surface-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200/80 dark:border-gray-700 hover:border-amber-400'
                }`}
              >
                4.0★ & Above
              </button>

              {/* In-Stock Only Toggle */}
              <button
                onClick={() => setInStockOnly(!inStockOnly)}
                className={`px-3 py-1.5 rounded-xl font-bold border transition-colors shrink-0 ${
                  inStockOnly
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-surface-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200/80 dark:border-gray-700 hover:border-emerald-400'
                }`}
              >
                In-Stock Only
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="p-3 sm:p-6">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2.5 sm:gap-4">
                {Array.from({ length: 12 }).map((_, idx) => (
                  <div key={idx} className="animate-pulse bg-gray-100 dark:bg-gray-800/80 rounded-2xl h-72 border border-gray-200/60 dark:border-gray-700/60 p-4 flex flex-col justify-between">
                    <div className="bg-gray-200 dark:bg-gray-700/80 rounded-xl h-36 w-full mb-3"></div>
                    <div className="space-y-2">
                      <div className="bg-gray-200 dark:bg-gray-700/80 rounded h-3 w-1/3"></div>
                      <div className="bg-gray-200 dark:bg-gray-700/80 rounded h-4 w-5/6"></div>
                      <div className="bg-gray-200 dark:bg-gray-700/80 rounded h-5 w-1/2 mt-2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : processedProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2.5 sm:gap-4">
                {processedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-5xl mb-4">🔍</p>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                  No Products Match Your Filter Criteria
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto text-xs">
                  Try clearing your brand, price, or rating filters to view all available products.
                </p>
                <button
                  onClick={resetAllFilters}
                  className="btn-primary py-2.5 px-6 text-xs font-bold"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="section">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-800">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Featured Deals</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Handpicked items with top discounts</p>
              </div>
              <Link to="/search?featured=true" className="btn-outline btn-sm hidden md:flex">
                View All <FiChevronRight size={14} />
              </Link>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {featuredProducts.slice(0, 8).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. Pop-up Dialog for All E-Commerce Categories */}
      {showAllCategoriesModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <FiLayers className="text-primary-500" /> Explore All {categories.length} Shopping Categories
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Select a category or open the dedicated Categories Hub</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/categories')}
                  className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5"
                >
                  Categories Hub <FiChevronRight size={14} />
                </button>
                <button
                  onClick={() => setShowAllCategoriesModal(false)}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>

            <div className="px-6 py-3 bg-surface-50 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800">
              <div className="relative">
                <input
                  type="text"
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                  placeholder="Search 16+ categories by name or keyword..."
                  className="input pl-10 text-sm"
                />
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              </div>
            </div>

            <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[60vh]">
              <button
                onClick={() => handleCategorySelect('all')}
                className={`p-4 rounded-2xl border text-left flex items-center gap-3.5 transition-all ${
                  selectedCategorySlug === 'all'
                    ? 'bg-primary-50 dark:bg-gray-800 border-primary-500 ring-2 ring-primary-500/20'
                    : 'bg-white dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 hover:border-primary-400'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                  <FiShoppingBag size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">All Categories</h4>
                  <p className="text-xs text-gray-400">Show all {products.length} products</p>
                </div>
              </button>

              {filteredModalCategories.map((cat) => {
                const isSelected = selectedCategorySlug === cat.slug;
                const photoUrl = getImageUrl(cat.image) || CATEGORY_PHOTO_MAP[cat.slug];
                const catProductCount = products.filter((p) => p.category?.slug === cat.slug).length;

                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.slug)}
                    className={`p-4 rounded-2xl border text-left flex items-center gap-3.5 transition-all group ${
                      isSelected
                        ? 'bg-primary-50 dark:bg-gray-800 border-primary-500 ring-2 ring-primary-500/20'
                        : 'bg-white dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 hover:border-primary-400 hover:shadow-md'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-900 overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700 group-hover:scale-105 transition-transform">
                      <img src={photoUrl} alt={cat.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-xs text-gray-900 dark:text-white truncate group-hover:text-primary-500 transition-colors">
                        {cat.name}
                      </h4>
                      <p className="text-[10px] text-gray-400 truncate mt-0.5">
                        {catProductCount} Products Available
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
