import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiUser, FiX, FiChevronRight, FiChevronDown, FiArrowLeft,
  FiTrendingUp, FiShoppingBag, FiStar, FiGrid, FiHelpCircle, FiLogOut, FiShield
} from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';

// Fallback subcategories mapping for standard ecommerce categories
const DEFAULT_SUBCATEGORIES_MAP = {
  'mobiles-accessories': [
    { name: 'All Mobile Phones', filter: 'mobiles' },
    { name: 'Mobile Accessories', filter: 'accessories' },
    { name: 'Cases & Covers', filter: 'covers' },
    { name: 'Power Banks', filter: 'power-banks' },
    { name: 'Screen Protectors', filter: 'screen-protectors' },
    { name: 'Smart Watches', filter: 'smartwatches' },
    { name: 'Audio & Earphones', filter: 'earphones' },
  ],
  'electronics-tech': [
    { name: 'All Electronics', filter: 'electronics' },
    { name: 'Laptops & Computers', filter: 'laptops' },
    { name: 'TV & Home Entertainment', filter: 'tv' },
    { name: 'Cameras & Accessories', filter: 'cameras' },
    { name: 'Headphones & Speakers', filter: 'audio' },
    { name: 'Computer Accessories', filter: 'pc-acc' },
  ],
  'fashion-apparel': [
    { name: "Men's Clothing", filter: 'mens-fashion' },
    { name: "Women's Clothing", filter: 'womens-fashion' },
    { name: 'Footwear & Shoes', filter: 'footwear' },
    { name: 'Watches & Accessories', filter: 'watches' },
    { name: 'Bags & Luggage', filter: 'bags' },
    { name: 'Jewelry & Eyewear', filter: 'jewelry' },
  ],
  'home-kitchen': [
    { name: 'Kitchen & Dining', filter: 'kitchen' },
    { name: 'Home Decor & Furniture', filter: 'decor' },
    { name: 'Home Appliances', filter: 'appliances' },
    { name: 'Bedding & Furnishings', filter: 'bedding' },
    { name: 'Storage & Organization', filter: 'storage' },
  ],
  'beauty-care': [
    { name: 'Skincare & Body', filter: 'skincare' },
    { name: 'Haircare', filter: 'haircare' },
    { name: 'Makeup & Cosmetics', filter: 'makeup' },
    { name: 'Fragrances & Perfumes', filter: 'perfumes' },
    { name: 'Personal Care Appliances', filter: 'personal-care' },
  ],
};

const CategoryDrawer = ({ isOpen, onClose, categories = [] }) => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState(null);
  const [showAllCategories, setShowAllCategories] = useState(false);

  if (!isOpen) return null;

  const handleLinkClick = (path) => {
    onClose();
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/login');
  };

  // Determine categories to display
  const displayedCategories = showAllCategories ? categories : categories.slice(0, 6);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Dark Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-Out Drawer Panel */}
      <div className="fixed inset-y-0 left-0 max-w-full flex">
        <div className="w-80 sm:w-96 bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col relative z-50 transform transition-transform duration-300 ease-in-out">
          
          {/* Floating Close Button X outside top right */}
          <button
            onClick={onClose}
            className="absolute left-[330px] sm:left-[395px] top-3 text-white hover:text-amber-400 text-2xl font-bold p-2 focus:outline-none transition-colors cursor-pointer"
            title="Close Menu"
          >
            <FiX size={28} />
          </button>

          {/* 1. AMAZON STYLE TOP USER BANNER */}
          <div className="bg-[#232f3e] text-white p-4 flex items-center justify-between shadow-md">
            <div
              onClick={() => handleLinkClick(isAuthenticated ? '/profile' : '/login')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full bg-gray-700 text-amber-400 flex items-center justify-center font-bold text-lg border border-gray-600 group-hover:scale-105 transition-transform">
                <FiUser size={22} />
              </div>
              <div>
                <p className="font-extrabold text-base leading-tight flex items-center gap-1 group-hover:text-amber-400 transition-colors">
                  Hello, {isAuthenticated ? user?.name : 'sign in'}
                </p>
                <p className="text-[11px] text-gray-300 font-medium">
                  {isAuthenticated ? 'View Your Profile' : 'Sign in for best experience'}
                </p>
              </div>
            </div>
          </div>

          {/* 2. DRAWER CONTENT CONTAINER */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {activeCategory ? (
              /* SUB-CATEGORY DRILL-DOWN VIEW */
              <div className="animate-slide-left">
                {/* Main Menu Back Button */}
                <button
                  onClick={() => setActiveCategory(null)}
                  className="w-full flex items-center gap-2.5 px-5 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 font-bold border-b border-gray-200 dark:border-gray-700 text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <FiArrowLeft size={16} className="text-primary-500" />
                  <span>MAIN MENU</span>
                </button>

                {/* Sub-Category Title Header */}
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-surface-50/50 dark:bg-gray-800/40">
                  <h3 className="font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wider">
                    {activeCategory.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Explore sub-categories & collections</p>
                </div>

                {/* Subcategories List */}
                <div className="py-2">
                  <button
                    onClick={() => handleLinkClick(`/search?category=${activeCategory.slug}`)}
                    className="w-full text-left px-6 py-3 text-xs font-bold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800"
                  >
                    All {activeCategory.name} Products
                  </button>

                  {/* Subcategories from DB or Fallback */}
                  {(activeCategory.subcategories?.length > 0
                    ? activeCategory.subcategories
                    : (DEFAULT_SUBCATEGORIES_MAP[activeCategory.slug] || [
                        { name: `All ${activeCategory.name}`, filter: activeCategory.slug },
                        { name: `Trending ${activeCategory.name}`, filter: activeCategory.slug },
                        { name: `New ${activeCategory.name} Arrivals`, filter: activeCategory.slug },
                        { name: `Top Brands in ${activeCategory.name}`, filter: activeCategory.slug },
                      ])
                  ).map((sub, idx) => (
                    <button
                      key={sub.id || idx}
                      onClick={() =>
                        handleLinkClick(
                          sub.slug
                            ? `/search?category=${sub.slug}`
                            : `/search?category=${activeCategory.slug}&q=${encodeURIComponent(sub.name || sub.filter)}`
                        )
                      }
                      className="w-full flex items-center justify-between px-6 py-3 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer text-left"
                    >
                      <span>{sub.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* MAIN DRAWER MENU VIEW */
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {/* SECTION 1: TRENDING */}
                <div className="py-3">
                  <h4 className="px-5 py-2 text-[11px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    Trending
                  </h4>
                  <button
                    onClick={() => handleLinkClick('/search?sort=rating')}
                    className="w-full flex items-center justify-between px-5 py-2.5 text-xs font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <span>Bestsellers</span>
                  </button>
                  <button
                    onClick={() => handleLinkClick('/search?sort=newest')}
                    className="w-full flex items-center justify-between px-5 py-2.5 text-xs font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <span>New Releases</span>
                  </button>
                  <button
                    onClick={() => handleLinkClick('/search?featured=true')}
                    className="w-full flex items-center justify-between px-5 py-2.5 text-xs font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <span>Movers & Shakers / Deals</span>
                  </button>
                </div>

                {/* SECTION 2: SHOP BY CATEGORY */}
                <div className="py-3">
                  <h4 className="px-5 py-2 text-[11px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    Shop by Category
                  </h4>
                  {displayedCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat)}
                      className="w-full flex items-center justify-between px-5 py-2.5 text-xs font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group"
                    >
                      <span>{cat.name}</span>
                      <FiChevronRight size={14} className="text-gray-400 group-hover:text-primary-500 transition-colors" />
                    </button>
                  ))}

                  {categories.length > 6 && (
                    <button
                      onClick={() => setShowAllCategories(!showAllCategories)}
                      className="w-full flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      <span>{showAllCategories ? 'See less' : 'See all'}</span>
                      <FiChevronDown size={14} className={`transform transition-transform ${showAllCategories ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>

                {/* SECTION 3: PROGRAMS & FEATURES */}
                <div className="py-3">
                  <h4 className="px-5 py-2 text-[11px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    Programs & Features
                  </h4>
                  <button
                    onClick={() => handleLinkClick('/categories')}
                    className="w-full flex items-center justify-between px-5 py-2.5 text-xs font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <span>All Store Categories Hub</span>
                  </button>
                  <button
                    onClick={() => handleLinkClick(isAuthenticated ? '/seller/dashboard' : '/register?role=seller')}
                    className="w-full flex items-center justify-between px-5 py-2.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <span>Sell on InduKart</span>
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleLinkClick('/superadmin@2026/dashboard')}
                      className="w-full flex items-center justify-between px-5 py-2.5 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5"><FiShield size={13} /> SuperAdmin Control Portal</span>
                    </button>
                  )}
                </div>

                {/* SECTION 4: HELP & SETTINGS */}
                <div className="py-3">
                  <h4 className="px-5 py-2 text-[11px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    Help & Settings
                  </h4>
                  <button
                    onClick={() => handleLinkClick(isAuthenticated ? '/profile' : '/login')}
                    className="w-full flex items-center justify-between px-5 py-2.5 text-xs font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <span>Your Account</span>
                  </button>
                  <button
                    onClick={() => handleLinkClick('/search')}
                    className="w-full flex items-center justify-between px-5 py-2.5 text-xs font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <span>Customer Service</span>
                  </button>

                  {isAuthenticated ? (
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between px-5 py-2.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5"><FiLogOut size={13} /> Sign Out</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleLinkClick('/login')}
                      className="w-full flex items-center justify-between px-5 py-2.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      <span>Sign In</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryDrawer;
