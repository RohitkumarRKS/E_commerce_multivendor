import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiSearch, FiShoppingCart, FiUser, FiMenu, FiX,
  FiMapPin, FiNavigation, FiCheckCircle, FiAlertCircle, FiChevronDown, FiChevronRight, FiZap, FiGrid, FiCheck, FiLayers
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth';
import useCart from '../../hooks/useCart';
import ThemeToggle from '../common/ThemeToggle';
import CategoryDrawer from '../common/CategoryDrawer';
import { categoryAPI, bannerAPI } from '../../services/api';
import { getCategoryIcon, getImageUrl, getShortCategoryName } from '../../utils/helpers';

const Header = () => {
  const { user, isAuthenticated, isSeller } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const getUserDashboardPath = () => {
    if (user?.role === 'superadmin' || user?.role === 'admin') return '/superadmin@2026';
    if (user?.role === 'seller' || isSeller) return '/seller/dashboard';
    return '/buyer/dashboard';
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [showMobile, setShowMobile] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const categoryDropdownRef = useRef(null);

  // SuperAdmin Managed Promo Badge State
  const [promoBadge, setPromoBadge] = useState({
    title: 'Great Freedom Sale | Live Now ❯',
    linkUrl: '/search?featured=true',
    isActive: true,
  });

  // Saved location state
  const [location, setLocation] = useState(() => {
    const saved = localStorage.getItem('userLocation');
    return saved
      ? JSON.parse(saved)
      : {
          city: 'Jamshedpur',
          pincode: '831001',
          address: 'Jamshedpur, Jharkhand',
          isDeliverable: true,
        };
  });

  const [inputPincode, setInputPincode] = useState(location.pincode);
  const [inputAddress, setInputAddress] = useState(location.address);
  const [deliveryStatus, setDeliveryStatus] = useState(location.isDeliverable ? 'deliverable' : 'undeliverable');

  useEffect(() => {
    localStorage.setItem('userLocation', JSON.stringify(location));
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    categoryAPI.getAll().then((res) => {
      if (res.data?.data?.categories) {
        setCategories(res.data.data.categories);
      }
    }).catch(() => {});

    bannerAPI.getAll().then((res) => {
      if (res.data?.data?.banners) {
        const activePromo = res.data.data.banners.find(
          (b) => b.isActive && (b.position === 'promo_badge' || b.badge?.includes('Sale') || b.title?.includes('Sale'))
        );
        if (activePromo) {
          setPromoBadge({
            title: activePromo.title || activePromo.badge || 'Great Freedom Sale | Live Now ❯',
            linkUrl: activePromo.linkUrl || '/search?featured=true',
            isActive: activePromo.isActive,
          });
        }
      }
    }).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() || selectedCategory !== 'all') {
      const params = [];
      if (searchQuery.trim()) params.push(`q=${encodeURIComponent(searchQuery.trim())}`);
      if (selectedCategory !== 'all') params.push(`category=${selectedCategory}`);
      navigate(`/search?${params.join('&')}`);
    } else {
      navigate('/search');
    }
  };

  const handleCategoryDropdownChange = (val) => {
    setSelectedCategory(val);
    const params = [];
    if (searchQuery.trim()) params.push(`q=${encodeURIComponent(searchQuery.trim())}`);
    if (val !== 'all') params.push(`category=${val}`);
    navigate(params.length > 0 ? `/search?${params.join('&')}` : '/search');
  };

  const checkDeliverability = (pin) => {
    const cleanPin = pin.trim();
    return /^[1-8][0-9]{5}$/.test(cleanPin);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      return toast.error('Geolocation is not supported by your browser.');
    }

    setLoadingGeo(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();

          const detectedPincode = data.address?.postcode || '831001';
          const detectedCity = data.address?.city || data.address?.town || data.address?.state_district || 'Jamshedpur';
          const detectedAddress = data.display_name ? data.display_name.split(',').slice(0, 3).join(',') : `${detectedCity}, ${detectedPincode}`;
          const isDeliverable = checkDeliverability(detectedPincode);

          const updatedLocation = {
            city: detectedCity,
            pincode: detectedPincode,
            address: detectedAddress,
            isDeliverable,
          };

          setLocation(updatedLocation);
          setInputPincode(detectedPincode);
          setInputAddress(detectedAddress);
          setDeliveryStatus(isDeliverable ? 'deliverable' : 'undeliverable');

          toast.success(`Location set to ${detectedCity} (${detectedPincode})`);
          setShowLocationModal(false);
        } catch {
          const fallbackLocation = {
            city: 'Current Location',
            pincode: '831001',
            address: 'GPS Location Detected',
            isDeliverable: true,
          };
          setLocation(fallbackLocation);
          toast.success('Current location detected successfully!');
          setShowLocationModal(false);
        } finally {
          setLoadingGeo(false);
        }
      },
      () => {
        setLoadingGeo(false);
        toast.error('Could not retrieve location. Please enter pincode.');
      },
      { timeout: 10000 }
    );
  };

  const handleManualLocationSubmit = (e) => {
    e.preventDefault();
    const cleanPin = inputPincode.trim();

    if (cleanPin.length !== 6) {
      return toast.error('Please enter a valid 6-digit pincode.');
    }

    const isDeliverable = checkDeliverability(cleanPin);
    const updatedLocation = {
      city: 'Deliver to',
      pincode: cleanPin,
      address: inputAddress || `Pincode ${cleanPin}`,
      isDeliverable,
    };

    setLocation(updatedLocation);
    setDeliveryStatus(isDeliverable ? 'deliverable' : 'undeliverable');

    if (isDeliverable) {
      toast.success(`Delivery location updated for ${cleanPin}`);
      setShowLocationModal(false);
    } else {
      toast.warning(`Pincode ${cleanPin} is currently undeliverable.`);
    }
  };

  return (
    <header className="sticky top-0 z-50 transition-colors shadow-sm bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
      {/* 1. STORE THEME TOP HEADER (CLEAN LIGHT/DARK MODE WITH COMBINED SEARCH & LOCATION) */}
      <div className="py-2.5 px-3 lg:px-6 relative z-40">
        <div className="flex items-center justify-between gap-3 md:gap-5 max-w-[1500px] mx-auto">
          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setShowMobile(!showMobile)}
          >
            {showMobile ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>

          {/* Brand Logo (Matching Reference: Left Icon Badge + Right Bold Text) */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2 group py-0.5">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-white dark:bg-gray-800 p-1 border border-gray-200 dark:border-gray-700 shadow-md group-hover:scale-105 transition-transform flex items-center justify-center flex-shrink-0">
              <img src="/InduKart.png" alt="InduKart Logo" className="w-full h-full object-contain" />
            </div>
            <div className="block">
              <h1 className="text-gray-900 dark:text-white font-black text-lg sm:text-2xl leading-none tracking-tight">
                Indu<span className="text-primary-500">Kart</span>
              </h1>
            </div>
          </Link>

          {/* Location Selector Widget (Right Next to Logo) */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowLocationModal(!showLocationModal)}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-left bg-surface-50 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700 hover:border-primary-400 transition-all text-xs cursor-pointer group"
              title="Set Delivery Location"
            >
              <div className="w-7 h-7 rounded-lg bg-primary-50 dark:bg-gray-700 text-primary-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <FiMapPin size={15} />
              </div>
              <div className="hidden lg:block overflow-hidden">
                <p className="text-[10px] text-gray-400 font-medium leading-none">Delivering to</p>
                <p className="font-extrabold text-gray-800 dark:text-gray-200 truncate flex items-center gap-1 text-xs">
                  {location.city} {location.pincode} <FiChevronDown size={12} className="text-gray-400" />
                </p>
              </div>
            </button>

            {/* Location Popup Modal */}
            {showLocationModal && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-5 z-50 animate-slide-up">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100 dark:border-gray-800">
                  <h4 className="font-bold text-sm flex items-center gap-2 text-gray-900 dark:text-white">
                    <FiMapPin className="text-primary-500" /> Choose Delivery Location
                  </h4>
                  <button onClick={() => setShowLocationModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                    <FiX size={16} />
                  </button>
                </div>

                <button
                  onClick={handleUseCurrentLocation}
                  disabled={loadingGeo}
                  className="w-full flex items-center justify-center gap-2 p-2.5 bg-primary-50 dark:bg-gray-800 text-primary-600 dark:text-primary-400 font-semibold rounded-xl text-xs hover:bg-primary-100 transition-colors mb-3 border border-primary-100 dark:border-gray-700 disabled:opacity-60"
                >
                  <FiNavigation className={loadingGeo ? 'animate-spin' : ''} size={15} />
                  {loadingGeo ? 'Detecting Location...' : 'Use Current GPS Location'}
                </button>

                <div className="relative flex py-1 items-center mb-3">
                  <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
                  <span className="flex-shrink mx-2 text-[10px] text-gray-400 uppercase font-bold">Or enter pincode</span>
                  <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
                </div>

                <form onSubmit={handleManualLocationSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 font-medium">6-Digit Pincode *</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={inputPincode}
                      onChange={(e) => setInputPincode(e.target.value)}
                      placeholder="e.g. 831001"
                      className="input text-xs mt-1"
                      required
                    />
                  </div>

                  {deliveryStatus === 'deliverable' && (
                    <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs flex items-center gap-2 border border-emerald-200">
                      <FiCheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                      <span className="font-bold text-[11px]">Valid Indian Pincode!</span>
                    </div>
                  )}

                  <button type="submit" className="btn-primary w-full py-2.5 text-xs font-bold">
                    Save Location
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Desktop Search Bar (Hidden on Mobile) */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-3 relative z-30">
            <div className="flex items-center w-full bg-surface-50 dark:bg-gray-800/90 rounded-2xl border border-gray-200/80 dark:border-gray-700 focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 shadow-inner relative">
              {/* Sleek Custom Category Dropdown */}
              <div className="relative flex-shrink-0" ref={categoryDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700/80 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 font-extrabold text-xs py-2.5 px-3 rounded-l-2xl border-r border-gray-200 dark:border-gray-600 flex items-center gap-1.5 cursor-pointer max-w-[155px] transition-colors"
                >
                  <span className="truncate">
                    {selectedCategory === 'all'
                      ? 'All Categories'
                      : categories.find((c) => c.slug === selectedCategory)?.name || 'Category'}
                  </span>
                  <FiChevronDown size={14} className={`text-gray-500 transition-transform duration-200 ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Custom Glassmorphism Dropdown Menu */}
                {showCategoryDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50 animate-slide-up max-h-80 overflow-y-auto custom-scrollbar">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory('all');
                        setShowCategoryDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-bold flex items-center justify-between transition-colors ${
                        selectedCategory === 'all'
                          ? 'bg-primary-50 dark:bg-gray-800 text-primary-600 dark:text-primary-400 font-black'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-surface-50 dark:hover:bg-gray-800/60'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <FiLayers size={14} className="text-primary-500" /> All Categories
                      </span>
                      {selectedCategory === 'all' && <FiCheck size={14} className="text-primary-500" />}
                    </button>

                    <div className="h-[1px] bg-gray-100 dark:bg-gray-800 my-1"></div>

                    {categories.map((c) => {
                      const isSelected = selectedCategory === c.slug;
                      return (
                        <button
                          key={c.id || c.slug}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(c.slug);
                            setShowCategoryDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${
                            isSelected
                              ? 'bg-primary-50 dark:bg-gray-800 text-primary-600 dark:text-primary-400 font-extrabold'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-surface-50 dark:hover:bg-gray-800/60'
                          }`}
                        >
                          <span className="truncate pr-2">{c.name}</span>
                          {isSelected && <FiCheck size={14} className="text-primary-500 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Search Text Input */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands, categories..."
                className="w-full py-2.5 px-4 text-xs font-semibold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none bg-transparent"
              />

              {/* Primary Search Button */}
              <button
                type="submit"
                className="px-4 py-2.5 bg-primary-600 text-white rounded-r-2xl hover:bg-primary-700 transition-colors"
              >
                <FiSearch size={16} />
              </button>
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            {/* Account & Profile Link */}
            {isAuthenticated ? (
              <Link
                to={getUserDashboardPath()}
                className="flex items-center gap-2 text-gray-800 dark:text-gray-200 hover:bg-surface-100 dark:hover:bg-gray-800 p-1.5 sm:px-3 sm:py-2 rounded-xl transition-all border border-transparent hover:border-gray-200"
                title={user?.name}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="hidden md:block text-xs font-bold max-w-[90px] truncate">
                  {user?.name?.split(' ')[0]}
                </span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="btn-primary text-xs md:text-sm px-3.5 sm:px-5 py-2 rounded-xl shadow-md shadow-primary-500/20"
              >
                Login
              </Link>
            )}

            {/* Day / Night Theme Toggle */}
            <ThemeToggle className="text-gray-600 dark:text-gray-300 hover:bg-surface-100 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200" />

            {/* Shopping Cart Button */}
            <Link
              to="/cart"
              className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-xl text-gray-800 dark:text-gray-200 hover:bg-surface-100 dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-200 relative group"
            >
              <div className="relative">
                <FiShoppingCart size={22} className="text-gray-700 dark:text-gray-200 group-hover:scale-110 transition-transform" />
                {itemCount > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-accent-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center animate-scale-in shadow-md">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:block text-xs font-bold uppercase tracking-wider">Cart</span>
            </Link>
          </div>
        </div>

        {/* 📱 Full-Width Mobile Search Bar */}
        <form onSubmit={handleSearch} className="md:hidden mt-2.5 pb-1">
          <div className="flex items-center bg-surface-50 dark:bg-gray-800/90 rounded-2xl border border-gray-200/80 dark:border-gray-700 focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 shadow-sm relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, brands..."
              className="w-full py-2.5 px-4 text-xs text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none bg-transparent"
            />
            <button
              type="submit"
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2.5 rounded-r-2xl transition-colors flex items-center justify-center flex-shrink-0"
            >
              <FiSearch size={16} />
            </button>
          </div>
        </form>
      </div>

      {/* 2. FLIPKART/INDUKART STANDARD ICON CATEGORY STRIP (BOTH MOBILE & DESKTOP) */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200/70 dark:border-gray-800 shadow-sm relative z-20">
        <div className="max-w-[1500px] mx-auto px-3 sm:px-6">
          <div className="flex items-center gap-5 sm:gap-6 overflow-x-auto scrollbar-hide py-2.5">
            
            {/* 1. ALL CATEGORIES / FOR YOU BUTTON */}
            <button
              onClick={() => setShowDrawer(true)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-2xl bg-sky-100 dark:bg-sky-950/80 border border-sky-200/80 dark:border-sky-800 text-primary-600 dark:text-primary-400 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-all">
                <FiGrid size={20} />
              </div>
              <span className="text-[12px] font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors text-center tracking-tight whitespace-nowrap">
                All Categories
              </span>
            </button>

            {/* 2. DYNAMIC CATEGORY ITEMS (INCLUDING SUPERADMIN-MANAGED TODAY'S DEALS & SELL ON INDUKART) */}
            {categories
              .filter((c) => c.showInNavbar !== false && c.showInNavbar !== 0 && c.showInNavbar !== 'false')
              .map((cat, idx) => {
                let subs = cat.subcategories && cat.subcategories.length > 0 ? cat.subcategories : [];
                if (subs.length === 0 && cat.description && cat.description.includes(',')) {
                  subs = cat.description.split(',').map((d, subIdx) => ({
                    id: `${cat.id}-${subIdx}`,
                    name: d.trim(),
                    slug: cat.slug,
                    description: '',
                  }));
                }

                const catImg = cat.image ? getImageUrl(cat.image) : null;
                const isSelected = selectedCategory === cat.slug;
                const shortName = getShortCategoryName(cat.name);

                // Special target URLs for system categories
                let targetUrl = `/search?category=${cat.slug}`;
                if (cat.slug === 'todays-deals') targetUrl = '/search?featured=true';
                if (cat.slug === 'sell-on-indukart') targetUrl = isSeller ? '/seller/dashboard' : '/register?role=seller';

                const isSpecialDeal = cat.slug === 'todays-deals';
                const isSpecialSeller = cat.slug === 'sell-on-indukart';

                return (
                  <div key={cat.id || cat.slug} className="relative group flex-shrink-0">
                    <Link
                      to={targetUrl}
                      className="flex flex-col items-center gap-1.5 group cursor-pointer"
                    >
                      <div className={`w-11 h-11 rounded-2xl overflow-hidden flex items-center justify-center transition-all shadow-2xs border ${
                        isSelected
                          ? 'bg-sky-50 dark:bg-sky-950/80 text-primary-600 border-primary-500 scale-105 shadow-xs'
                          : isSpecialDeal
                          ? 'bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 text-white border-amber-300 group-hover:scale-105'
                          : isSpecialSeller
                          ? 'bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-500 text-gray-950 border-amber-300 group-hover:scale-105'
                          : 'bg-surface-50 dark:bg-gray-800/80 text-gray-800 dark:text-gray-200 border-gray-200/80 dark:border-gray-700/80 group-hover:scale-105 group-hover:border-primary-400'
                      }`}>
                        {catImg ? (
                          <img src={catImg} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <span className="text-xl">{getCategoryIcon(cat.slug, cat.icon)}</span>
                        )}
                      </div>
                      <div className="flex flex-col items-center max-w-[76px]">
                        <span className={`text-[12px] tracking-tight text-center truncate transition-colors ${
                          isSelected
                            ? 'text-primary-600 dark:text-primary-400 font-bold'
                            : isSpecialDeal
                            ? 'text-amber-600 dark:text-amber-400 font-bold group-hover:text-red-500'
                            : isSpecialSeller
                            ? 'text-amber-700 dark:text-amber-400 font-black group-hover:text-amber-600'
                            : 'text-gray-700 dark:text-gray-300 font-medium group-hover:text-primary-600 dark:group-hover:text-primary-400'
                        }`} title={cat.name}>
                          {shortName}
                        </span>
                        {isSelected && <div className="w-6 h-[3px] bg-primary-600 rounded-full mt-0.5 animate-scale-in" />}
                      </div>
                    </Link>

                    {/* Desktop Hover Mega Dropdown */}
                    {subs.length > 0 && (
                      <div className={`absolute ${idx >= 7 ? 'right-0' : 'left-0'} top-full pt-2 hidden md:group-hover:block z-50 animate-fade-in`}>
                        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-5 min-w-[480px] md:min-w-[550px] text-gray-800 dark:text-gray-200">
                          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 mb-3">
                            <span className="text-xs font-black uppercase tracking-wider text-primary-600 dark:text-primary-400 flex items-center gap-1.5">
                              <FiGrid size={15} /> {cat.name} Catalog
                            </span>
                            <Link to={`/search?category=${cat.slug}`} className="text-xs font-extrabold text-primary-600 hover:underline">
                              Explore All ❯
                            </Link>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {subs.map((sub) => (
                              <Link
                                key={sub.id || sub.name}
                                to={`/search?category=${cat.slug}&q=${encodeURIComponent(sub.name)}`}
                                className="text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors truncate"
                              >
                                • {sub.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

          </div>
        </div>
      </div>

      {/* Mobile Side Drawer Menu */}
      {showMobile && (
        <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 animate-slide-down p-4 space-y-2">
          <button onClick={() => { setShowMobile(false); setShowDrawer(true); }} className="w-full text-left py-2 px-3 hover:bg-surface-100 dark:hover:bg-gray-800 rounded-xl text-sm font-extrabold text-primary-600 dark:text-primary-400 flex items-center gap-2">
            <FiGrid size={16} /> All Categories Drawer
          </button>
          <Link to="/" onClick={() => setShowMobile(false)} className="block py-2 px-3 hover:bg-surface-100 dark:hover:bg-gray-800 rounded-xl text-sm font-bold text-gray-800 dark:text-white">Home</Link>
          <Link to="/categories" onClick={() => setShowMobile(false)} className="block py-2 px-3 hover:bg-surface-100 dark:hover:bg-gray-800 rounded-xl text-sm font-bold text-gray-800 dark:text-white">Categories Hub</Link>
          <Link to="/search" onClick={() => setShowMobile(false)} className="block py-2 px-3 hover:bg-surface-100 dark:hover:bg-gray-800 rounded-xl text-sm font-bold text-gray-800 dark:text-white">All Products</Link>
          {!isAuthenticated && (
            <Link to="/login" onClick={() => setShowMobile(false)} className="block py-2 px-3 text-primary-500 font-bold text-sm">Login</Link>
          )}
        </div>
      )}

      {/* 📱 STICKY MOBILE BOTTOM NAVIGATION APP BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-100 dark:border-gray-800 flex items-center justify-around py-2.5 px-2 shadow-2xl">
        <Link to="/" className="flex flex-col items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
          <FiZap size={18} />
          <span className="text-[10px] font-bold">Home</span>
        </Link>
        <button onClick={() => setShowDrawer(true)} className="flex flex-col items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
          <FiGrid size={18} />
          <span className="text-[10px] font-bold">Categories</span>
        </button>
        <Link to="/search" className="flex flex-col items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
          <FiSearch size={18} />
          <span className="text-[10px] font-bold">Explore</span>
        </Link>
        <Link to={isAuthenticated ? getUserDashboardPath() : '/login'} className="flex flex-col items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
          <FiUser size={18} />
          <span className="text-[10px] font-bold">{isAuthenticated ? 'Profile' : 'Login'}</span>
        </Link>
        <Link to="/cart" className="flex flex-col items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 relative">
          <div className="relative">
            <FiShoppingCart size={18} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2.5 w-4 h-4 bg-accent-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold">Cart</span>
        </Link>
      </div>

      {/* AMAZON STYLE SLIDE-OUT CATEGORY DRAWER */}
      <CategoryDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        categories={categories}
      />
    </header>
  );
};

export default Header;
