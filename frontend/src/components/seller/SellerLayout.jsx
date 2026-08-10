import { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import SellerSidebar from './SellerSidebar';
import { FiMenu, FiBell, FiSearch, FiX } from 'react-icons/fi';
import ThemeToggle from '../common/ThemeToggle';

const SellerLayout = () => {
  const { user, loading } = useAuth();
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
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading seller panel...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'seller') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <SellerSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} isMobile={isMobile} user={user} />

      {/* Header */}
      <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30 flex items-center justify-between px-6 transition-all duration-300 ml-0 lg:ml-64">
        <div className="flex items-center gap-4">
          {/* Mobile-only hamburger */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-800 rounded-xl hover:bg-gray-100 transition-all active:scale-95"
          >
            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
          <div className="hidden md:flex items-center bg-surface-50 rounded-xl px-4 py-2 gap-2 w-72">
            <FiSearch size={16} className="text-gray-400" />
            <input type="text" placeholder="Search products, orders..." className="bg-transparent text-sm text-gray-700 focus:outline-none w-full placeholder-gray-400" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Day / Night Theme Toggle */}
          <ThemeToggle />

          <button className="relative p-2.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors">
            <FiBell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
              {user.name?.[0]?.toUpperCase() || 'S'}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-gray-800 leading-tight">{user.storeName || user.name}</p>
              <p className="text-[10px] text-gray-400">Seller Account</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content — always offset by sidebar width on desktop */}
      <main className="p-6 md:p-8 transition-all duration-300 ml-0 lg:ml-64">
        <Outlet />
      </main>
    </div>
  );
};

export default SellerLayout;
