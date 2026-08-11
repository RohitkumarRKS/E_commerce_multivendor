import { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import BuyerSidebar from './BuyerSidebar';
import { FiMenu, FiBell, FiSearch, FiX, FiShoppingCart } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import ThemeToggle from '../common/ThemeToggle';
import useCart from '../../hooks/useCart';

const BuyerLayout = () => {
  const { user, loading } = useAuth();
  const { itemCount } = useCart();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary-100 dark:border-primary-900/30 border-t-primary-500 rounded-full animate-spin" />
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-b-blue-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
          </div>
          <p className="text-sm text-gray-400 font-medium animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-gray-950">
      <BuyerSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} isMobile={isMobile} user={user} />

      {/* Header */}
      <header className="h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 transition-all duration-300 ml-0 lg:ml-64">
        <div className="flex items-center gap-4">
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95"
          >
            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
          <div className="hidden md:flex items-center bg-surface-50 dark:bg-gray-800 rounded-xl px-4 py-2.5 gap-2 w-72 border border-gray-100 dark:border-gray-700 focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-400 transition-all">
            <FiSearch size={16} className="text-gray-400" />
            <input type="text" placeholder="Search orders, settings..." className="bg-transparent text-sm text-gray-700 dark:text-gray-200 focus:outline-none w-full placeholder-gray-400 dark:placeholder-gray-500" />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          {/* Cart */}
          <Link to="/cart" className="relative p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:scale-105">
            <FiShoppingCart size={18} />
            {itemCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-accent-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-scale-in">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>

          {/* Notifications */}
          <button className="relative p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:scale-105">
            <FiBell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900" />
          </button>

          {/* User Info */}
          <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-700">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-primary-500/20 ring-2 ring-primary-400/20">
              {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">{user.name}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500">My Account</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6 md:p-8 transition-all duration-300 ml-0 lg:ml-64">
        <Outlet />
      </main>
    </div>
  );
};

export default BuyerLayout;
