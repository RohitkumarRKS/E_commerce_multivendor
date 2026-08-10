import { useState, useEffect } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { FiFilter, FiX, FiChevronDown, FiRotateCcw, FiCheck, FiStar } from 'react-icons/fi';
import { productAPI, categoryAPI } from '../services/api';
import ProductCard from '../components/common/ProductCard';
import Loader from '../components/common/Loader';
import CustomSelect from '../components/common/CustomSelect';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { slug: categorySlug } = useParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  const query = searchParams.get('q') || '';
  const categoryQueryParam = searchParams.get('category') || '';
  const activeCategorySlug = categoryQueryParam || categorySlug || '';
  const brandParam = searchParams.get('brand') || '';
  const priceRange = searchParams.get('price') || 'all';
  const minRating = searchParams.get('rating') || 'all';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const order = searchParams.get('order') || 'DESC';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 20, sortBy, order };
        if (query) params.search = query;
        if (activeCategorySlug) params.category = activeCategorySlug;
        if (brandParam) params.brand = brandParam;
        if (priceRange !== 'all') params.priceRange = priceRange;
        if (minRating !== 'all') params.minRating = minRating;

        const [productsRes, categoriesRes, fallbackRes] = await Promise.all([
          productAPI.getAll(params),
          categoryAPI.getAll(),
          productAPI.getAll({ limit: 12, sortBy: 'rating', order: 'DESC' }),
        ]);

        setProducts(productsRes.data.data.products);
        setPagination(productsRes.data.data.pagination);
        setCategories(categoriesRes.data.data.categories);
        setRecommendedProducts(fallbackRes.data.data.products || []);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [query, sortBy, order, page, categorySlug, categoryQueryParam, activeCategorySlug, brandParam, priceRange, minRating]);

  const handleSort = (value) => {
    const [newSortBy, newOrder] = value.split('-');
    setSearchParams((prev) => {
      prev.set('sortBy', newSortBy);
      prev.set('order', newOrder);
      prev.set('page', '1');
      return prev;
    });
  };

  const handleCategoryFilter = (catSlug) => {
    setSearchParams((prev) => {
      if (catSlug === 'all') {
        prev.delete('category');
      } else {
        prev.set('category', catSlug);
      }
      prev.set('page', '1');
      return prev;
    });
    setShowMobileFilters(false);
  };

  const handlePriceFilter = (range) => {
    setSearchParams((prev) => {
      if (range === 'all') {
        prev.delete('price');
      } else {
        prev.set('price', range);
      }
      prev.set('page', '1');
      return prev;
    });
  };

  const handleRatingFilter = (rating) => {
    setSearchParams((prev) => {
      if (rating === 'all') {
        prev.delete('rating');
      } else {
        prev.set('rating', rating);
      }
      prev.set('page', '1');
      return prev;
    });
  };

  const resetAllFilters = () => {
    setSearchParams((prev) => {
      prev.delete('category');
      prev.delete('price');
      prev.delete('rating');
      prev.set('page', '1');
      return prev;
    });
    setShowMobileFilters(false);
  };

  const handlePageChange = (newPage) => {
    setSearchParams((prev) => {
      prev.set('page', newPage.toString());
      return prev;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-gray-950 transition-colors">
      <div className="container-main py-6">
        {/* Header & Quick Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">
              {brandParam
                ? `Brand: ${brandParam}`
                : activeCategorySlug
                ? `Category: ${activeCategorySlug.replace(/-/g, ' ')}`
                : query
                ? `Results for "${query}"`
                : 'All Products'}
            </h1>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Showing {products.length} of {pagination.total} available items
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="btn-primary btn-sm flex md:hidden items-center gap-2 py-2 px-4 shadow-md"
            >
              <FiFilter size={16} /> Filters
            </button>

            {/* Custom Sort Select Dropdown */}
            <CustomSelect
              label="Sort"
              value={`${sortBy}-${order}`}
              onChange={handleSort}
              options={[
                { value: 'createdAt-DESC', label: 'Newest First' },
                { value: 'price-ASC', label: 'Price: Low to High 📈' },
                { value: 'price-DESC', label: 'Price: High to Low 📉' },
                { value: 'rating-DESC', label: 'Best Rating ⭐' },
                { value: 'discount-DESC', label: 'Best Discount %' },
                { value: 'name-ASC', label: 'Name: A-Z' },
              ]}
            />
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="flex gap-6">
          {/* DESKTOP FULL-SCREEN HEIGHT STICKY SIDEBAR FILTERS */}
          <aside className="hidden md:block w-72 flex-shrink-0">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-5 sticky top-24 h-[calc(100vh-110px)] max-h-[850px] overflow-y-auto custom-scrollbar flex flex-col justify-between">
              
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
                    <FiFilter className="text-primary-500" /> Filters
                  </h3>
                  {(activeCategorySlug || priceRange !== 'all' || minRating !== 'all') && (
                    <button
                      onClick={resetAllFilters}
                      className="text-xs text-primary-600 dark:text-primary-400 font-bold hover:underline flex items-center gap-1"
                    >
                      <FiRotateCcw size={12} /> Reset
                    </button>
                  )}
                </div>

                {/* 1. Categories Section */}
                <div>
                  <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5">
                    Categories
                  </h4>
                  <div className="space-y-1">
                    <button
                      onClick={() => handleCategoryFilter('all')}
                      className={`w-full text-left text-xs py-2 px-3 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-between ${
                        !activeCategorySlug
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <span>All Categories</span>
                      {!activeCategorySlug && <FiCheck size={14} />}
                    </button>

                    {categories.map((cat) => {
                      const isActive = activeCategorySlug === cat.slug;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => handleCategoryFilter(cat.slug)}
                          className={`w-full text-left text-xs py-2 px-3 rounded-xl font-medium transition-all cursor-pointer flex items-center justify-between ${
                            isActive
                              ? 'bg-primary-50 dark:bg-gray-800 text-primary-600 dark:text-primary-400 font-bold border border-primary-200 dark:border-gray-700'
                              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/60'
                          }`}
                        >
                          <span className="truncate">{cat.name}</span>
                          {isActive && <span className="w-2 h-2 rounded-full bg-primary-500"></span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Price Filter Section */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                  <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5">
                    Price Range
                  </h4>
                  <div className="space-y-1.5">
                    {[
                      { id: 'all', label: 'All Prices' },
                      { id: 'under_1k', label: 'Under ₹1,000' },
                      { id: '1k_5k', label: '₹1,000 - ₹5,000' },
                      { id: '5k_25k', label: '₹5,000 - ₹25,000' },
                      { id: 'above_25k', label: 'Above ₹25,000' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handlePriceFilter(p.id)}
                        className={`w-full text-left text-xs py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
                          priceRange === p.id
                            ? 'bg-primary-50 dark:bg-gray-800 text-primary-600 dark:text-primary-400 font-bold'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Customer Rating Section */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                  <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5">
                    Rating
                  </h4>
                  <div className="space-y-1.5">
                    {[
                      { id: 'all', label: 'All Ratings' },
                      { id: '4', label: '4.0★ & Above' },
                      { id: '3', label: '3.0★ & Above' },
                    ].map((r) => (
                      <button
                        key={r.id}
                        onClick={() => handleRatingFilter(r.id)}
                        className={`w-full text-left text-xs py-1.5 px-3 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                          minRating === r.id
                            ? 'bg-amber-50 dark:bg-gray-800 text-amber-600 dark:text-amber-400 font-bold'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        {r.id !== 'all' && <FiStar className="text-amber-500 fill-amber-500" size={13} />}
                        <span>{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar Footer Reset Button */}
              <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={resetAllFilters}
                  className="w-full py-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </aside>

          {/* MOBILE PHONE FULL SCREEN SLIDE-UP BOTTOM SHEET MODAL */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden flex flex-col justify-end animate-fade-in">
              <div className="bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl h-[85vh] flex flex-col overflow-hidden animate-slide-up">
                
                {/* Mobile Sheet Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-surface-50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-1"></div>
                    <h3 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
                      <FiFilter className="text-primary-500" /> Filter Products
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <FiX size={22} />
                  </button>
                </div>

                {/* Mobile Sheet Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                  {/* Categories */}
                  <div>
                    <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                      Categories
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleCategoryFilter('all')}
                        className={`p-2.5 rounded-xl text-xs font-bold text-left transition-all ${
                          !activeCategorySlug
                            ? 'bg-primary-500 text-white shadow-md'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        All Categories
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => handleCategoryFilter(cat.slug)}
                          className={`p-2.5 rounded-xl text-xs font-bold text-left transition-all truncate ${
                            activeCategorySlug === cat.slug
                              ? 'bg-primary-500 text-white shadow-md'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                      Price Range
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'all', label: 'All Prices' },
                        { id: 'under_1k', label: 'Under ₹1,000' },
                        { id: '1k_5k', label: '₹1k - ₹5k' },
                        { id: '5k_25k', label: '₹5k - ₹25k' },
                        { id: 'above_25k', label: 'Above ₹25k' },
                      ].map((p) => (
                        <button
                          key={p.id}
                          onClick={() => handlePriceFilter(p.id)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                            priceRange === p.id
                              ? 'bg-primary-500 text-white shadow-sm'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                      Rating
                    </h4>
                    <div className="flex gap-2">
                      {[
                        { id: 'all', label: 'All' },
                        { id: '4', label: '4.0★ & Above' },
                        { id: '3', label: '3.0★ & Above' },
                      ].map((r) => (
                        <button
                          key={r.id}
                          onClick={() => handleRatingFilter(r.id)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            minRating === r.id
                              ? 'bg-amber-500 text-white shadow-sm'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mobile Sheet Footer Action Bar */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center gap-3">
                  <button
                    onClick={resetAllFilters}
                    className="w-1/3 py-3 text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="w-2/3 btn-primary py-3 text-xs font-extrabold shadow-lg"
                  >
                    Apply ({products.length} Items)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <Loader />
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page <= 1}
                      className="btn-ghost btn-sm disabled:opacity-30"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                            page === pageNum
                              ? 'bg-primary-500 text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= pagination.pages}
                      className="btn-ghost btn-sm disabled:opacity-30"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card text-center py-12 px-6">
                  <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-gray-800 text-amber-500 flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
                    🛍️
                  </div>
                  <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-1">
                    {brandParam ? `No Products Currently Available for "${brandParam}"` : 'No Products Match Your Filter Criteria'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
                    {brandParam
                      ? `We don't have active listings for "${brandParam}" right now, but new stock is coming soon!`
                      : 'Try adjusting your search query, price range, or category filter.'}
                  </p>
                  <button onClick={resetAllFilters} className="btn-primary py-2.5 px-6 text-xs font-bold shadow-md">
                    Reset All Filters
                  </button>
                </div>

                {/* Display Related / Recommended Products */}
                {recommendedProducts.length > 0 && (
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                    <h4 className="font-extrabold text-base text-gray-900 dark:text-white mb-1">
                      Explore Popular Recommended Products
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                      Top customer choices and best-selling items across our marketplace
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {recommendedProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
