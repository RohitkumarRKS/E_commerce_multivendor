import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiGrid, FiShoppingBag, FiPlusCircle, FiPackage,
  FiSettings, FiLogOut, FiHome, FiGlobe
} from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';

const SellerSidebar = ({ isOpen, onToggle, isMobile, user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menu = [
    { path: '/seller/dashboard', label: 'Dashboard', icon: <FiGrid size={20} /> },
    { path: '/seller/products', label: 'My Products', icon: <FiShoppingBag size={20} /> },
    { path: '/seller/add-product', label: 'Add Product', icon: <FiPlusCircle size={20} /> },
    { path: '/seller/orders', label: 'Orders', icon: <FiPackage size={20} /> },
    { path: '/seller/settings', label: 'Store Settings', icon: <FiSettings size={20} /> },
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
        <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={onToggle} />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64 bg-gray-900 text-gray-300 flex flex-col
          border-r border-gray-800 transition-transform duration-300 ease-in-out
          ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
        `}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-4 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-white font-extrabold text-sm">
                {user?.storeName?.[0]?.toUpperCase() || 'S'}
              </span>
            </div>
            <div className="overflow-hidden">
              <h1 className="text-white font-bold text-sm leading-tight whitespace-nowrap truncate max-w-[160px]">
                {user?.storeName || 'My Store'}
              </h1>
              <p className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase whitespace-nowrap">
                Seller Panel
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {menu.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all
                  ${isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
                    : 'hover:bg-gray-800 hover:text-white text-gray-400'
                  }
                `}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 border-t border-gray-800 space-y-1 flex-shrink-0">
          {/* Visit Website */}
          <Link
            to="/"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 transition-colors"
          >
            <FiGlobe size={18} />
            <span>Visit Website</span>
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <FiLogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default SellerSidebar;
