import { useAdminAuth } from '../../context/AdminAuthContext';
import { FiMenu, FiBell, FiSearch, FiX } from 'react-icons/fi';
import ThemeToggle from '../../../components/common/ThemeToggle';

const AdminHeader = ({ onToggleSidebar, isMobile, sidebarOpen }) => {
  const { admin } = useAdminAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30 flex items-center justify-between px-6 transition-all duration-300 ml-0 lg:ml-64">
      <div className="flex items-center gap-4">
        {/* Mobile-only hamburger */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-gray-500 hover:text-gray-800 rounded-xl hover:bg-gray-100 transition-all active:scale-95"
          id="admin-sidebar-toggle"
          title="Toggle sidebar"
        >
          {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>

        {/* Search */}
        <div className="hidden md:flex items-center bg-surface-50 rounded-xl px-4 py-2 gap-2 w-72">
          <FiSearch size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search anything..."
            className="bg-transparent text-sm text-gray-700 focus:outline-none w-full placeholder-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Day / Night Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <button className="relative p-2.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors">
          <FiBell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Admin Profile */}
        <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
            {admin?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-gray-800 leading-tight">{admin?.name}</p>
            <p className="text-[10px] text-gray-400">Super Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
