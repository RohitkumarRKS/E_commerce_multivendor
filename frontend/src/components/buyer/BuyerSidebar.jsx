import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiGrid, FiPackage, FiMapPin, FiUser,
  FiSettings, FiLogOut, FiGlobe, FiHeart, FiShoppingBag, FiChevronRight
} from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';

const BuyerSidebar = ({ isOpen, onToggle, isMobile, user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menu = [
    { path: '/buyer/dashboard', label: 'Dashboard', icon: <FiGrid size={20} />, badge: null },
    { path: '/buyer/orders', label: 'My Orders', icon: <FiPackage size={20} />, badge: null },
    { path: '/buyer/addresses', label: 'Addresses', icon: <FiMapPin size={20} />, badge: null },
    { path: '/buyer/profile', label: 'My Profile', icon: <FiUser size={20} />, badge: null },
    { path: '/buyer/wishlist', label: 'Wishlist', icon: <FiHeart size={20} />, badge: null },
    { path: '/buyer/settings', label: 'Settings', icon: <FiSettings size={20} />, badge: null },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = () => {
    if (isMobile) onToggle();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={onToggle} />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64 flex flex-col
          border-r transition-transform duration-300 ease-in-out
          bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a]
          border-gray-800/50
          ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
        `}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-4 border-b border-white/5 flex-shrink-0 relative overflow-hidden">
          {/* Subtle glow */}
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl"></div>
          <div className="flex items-center gap-3 min-w-0 relative z-10">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-500/30 ring-2 ring-primary-400/20">
              <span className="text-white font-extrabold text-sm">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="overflow-hidden">
              <h1 className="text-white font-bold text-sm leading-tight whitespace-nowrap truncate max-w-[160px]">
                {user?.name || 'User'}
              </h1>
              <p className="text-[10px] text-primary-400 font-semibold tracking-wider uppercase whitespace-nowrap">
                My Account
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          <p className="px-3 pb-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Menu</p>
          {menu.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative
                  ${isActive
                    ? 'bg-gradient-to-r from-primary-600 to-blue-600 text-white shadow-lg shadow-primary-600/25'
                    : 'hover:bg-white/5 hover:text-white text-gray-400 hover:translate-x-1'
                  }
                `}
              >
                {/* Active indicator bar */}
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full -ml-3"></div>}
                <span className={`flex-shrink-0 transition-transform duration-200 ${!isActive ? 'group-hover:scale-110' : ''}`}>{item.icon}</span>
                <span className="whitespace-nowrap flex-1">{item.label}</span>
                {isActive && <FiChevronRight size={14} className="text-white/50" />}
                {item.badge && (
                  <span className="bg-accent-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{item.badge}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 border-t border-white/5 space-y-1 flex-shrink-0">
          <Link
            to="/"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-primary-400 hover:bg-primary-500/10 hover:text-primary-300 transition-all duration-200 group"
          >
            <FiGlobe size={18} className="group-hover:rotate-12 transition-transform duration-300" />
            <span>Visit Website</span>
          </Link>

          <Link
            to="/search"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 transition-all duration-200 group"
          >
            <FiShoppingBag size={18} className="group-hover:scale-110 transition-transform duration-300" />
            <span>Shop Now</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 group"
          >
            <FiLogOut size={18} className="group-hover:-translate-x-0.5 transition-transform duration-300" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default BuyerSidebar;
