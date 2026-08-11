import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiGrid, FiShoppingBag, FiFolder, FiUsers, FiPackage,
  FiLogOut, FiGlobe, FiImage, FiAward, FiPercent, FiRotateCcw, FiMail
} from 'react-icons/fi';
import { useAdminAuth } from '../../context/AdminAuthContext';

const ADMIN_BASE = '/superadmin@2026';

const AdminSidebar = ({ isOpen, onToggle, isMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuth();

  const menu = [
    { path: `${ADMIN_BASE}`, label: 'Dashboard', icon: <FiGrid size={20} /> },
    { path: `${ADMIN_BASE}/banners`, label: 'Hero Banners', icon: <FiImage size={20} /> },
    { path: `${ADMIN_BASE}/products`, label: 'Products', icon: <FiShoppingBag size={20} /> },
    { path: `${ADMIN_BASE}/categories`, label: 'Categories', icon: <FiFolder size={20} /> },
    { path: `${ADMIN_BASE}/users`, label: 'Users', icon: <FiUsers size={20} /> },
    { path: `${ADMIN_BASE}/orders`, label: 'Orders', icon: <FiPackage size={20} /> },
    { path: `${ADMIN_BASE}/returns`, label: 'Returns & Refunds', icon: <FiRotateCcw size={20} /> },
    { path: `${ADMIN_BASE}/emails`, label: 'Mail Manager', icon: <FiMail size={20} /> },
    { path: `${ADMIN_BASE}/promos`, label: 'Promo Codes', icon: <FiPercent size={20} /> },
  ];

  const handleLogout = () => {
    logout();
    navigate(`${ADMIN_BASE}/login`);
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
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-white font-extrabold text-sm">SA</span>
            </div>
            <div className="overflow-hidden">
              <h1 className="text-white font-bold text-sm leading-tight whitespace-nowrap">SuperAdmin</h1>
              <p className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase whitespace-nowrap">Control Panel</p>
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
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
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
          {admin && (
            <div className="px-3 py-2 bg-gray-800/50 rounded-xl mb-2">
              <p className="text-xs font-semibold text-white truncate">{admin.name}</p>
              <p className="text-[10px] text-gray-500 truncate">{admin.email}</p>
            </div>
          )}

          {/* Visit Website */}
          <Link
            to="/"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 transition-colors"
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

export default AdminSidebar;
