import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiUser, FiPackage, FiMapPin, FiMail, FiPhone, FiCalendar,
  FiGrid, FiShoppingBag, FiHeart, FiSettings, FiEdit3, FiChevronRight,
  FiCreditCard, FiTruck, FiStar, FiClock, FiShield, FiBell,
  FiGift, FiPercent, FiArrowRight, FiCheckCircle, FiAlertCircle,
  FiRefreshCw, FiLogOut, FiExternalLink, FiBriefcase, FiHome,
  FiBox, FiDollarSign, FiTrendingUp, FiAward
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import useAuth from '../hooks/useAuth';
import { userAPI, orderAPI } from '../services/api';
import { formatPrice, formatDate, getStatusColor } from '../utils/helpers';
import Loader from '../components/common/Loader';
import AddressManager from '../components/common/AddressManager';

const AccountDashboardPage = () => {
  const { user, updateUser, isSeller, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalSpent: 0,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
        storeName: user.storeName || '',
        storeDescription: user.storeDescription || '',
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await orderAPI.getMyOrders({});
        const fetchedOrders = res.data.data.orders || [];
        setOrders(fetchedOrders);
        setStats({
          totalOrders: fetchedOrders.length,
          pendingOrders: fetchedOrders.filter(o => o.status === 'pending' || o.status === 'processing').length,
          deliveredOrders: fetchedOrders.filter(o => o.status === 'delivered').length,
          totalSpent: fetchedOrders.reduce((acc, o) => acc + (parseFloat(o.totalAmount) || 0), 0),
        });
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await userAPI.updateProfile(formData);
      updateUser(res.data.data.user);
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return <Loader fullScreen />;

  const menuItems = [
    { key: 'overview', label: 'Dashboard Overview', icon: <FiGrid size={18} />, color: 'from-blue-500 to-blue-600' },
    { key: 'orders', label: 'My Orders', icon: <FiPackage size={18} />, color: 'from-amber-500 to-orange-500' },
    { key: 'profile', label: 'Personal Info', icon: <FiUser size={18} />, color: 'from-emerald-500 to-green-500' },
    { key: 'addresses', label: 'Manage Addresses', icon: <FiMapPin size={18} />, color: 'from-purple-500 to-violet-500' },
    { key: 'settings', label: 'Account Settings', icon: <FiSettings size={18} />, color: 'from-gray-500 to-gray-600' },
  ];

  if (isSeller) {
    menuItems.splice(4, 0, { key: 'store', label: 'Store Info', icon: <FiBriefcase size={18} />, color: 'from-pink-500 to-rose-500' });
  }

  const quickActions = [
    { icon: <FiPackage size={20} />, label: 'Track Orders', desc: 'View order status', onClick: () => setActiveSection('orders'), color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400', borderColor: 'border-blue-100 dark:border-blue-800' },
    { icon: <FiMapPin size={20} />, label: 'Addresses', desc: 'Manage delivery', onClick: () => setActiveSection('addresses'), color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400', borderColor: 'border-purple-100 dark:border-purple-800' },
    { icon: <FiShoppingBag size={20} />, label: 'Shop Now', desc: 'Browse products', onClick: () => navigate('/search'), color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400', borderColor: 'border-emerald-100 dark:border-emerald-800' },
    { icon: <FiGift size={20} />, label: 'Offers', desc: 'View deals', onClick: () => navigate('/search?featured=true'), color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400', borderColor: 'border-amber-100 dark:border-amber-800' },
    { icon: <FiShield size={20} />, label: 'Security', desc: 'Account safety', onClick: () => setActiveSection('settings'), color: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400', borderColor: 'border-rose-100 dark:border-rose-800' },
    { icon: <FiEdit3 size={20} />, label: 'Edit Profile', desc: 'Update info', onClick: () => { setActiveSection('profile'); setEditing(true); }, color: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400', borderColor: 'border-indigo-100 dark:border-indigo-800' },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="bg-surface-50 dark:bg-gray-950 min-h-screen">
      <div className="container-main py-6 lg:py-8">

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* HERO PROFILE BANNER */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden mb-6">
          {/* Gradient background with pattern */}
          <div className="h-32 sm:h-36 bg-gradient-to-r from-primary-600 via-primary-500 to-blue-500 relative">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 left-16 w-32 h-32 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-24 w-40 h-40 bg-accent-400 rounded-full blur-3xl"></div>
              <div className="absolute top-8 right-40 w-20 h-20 bg-yellow-300 rounded-full blur-2xl"></div>
            </div>
            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}></div>
          </div>

          <div className="px-5 sm:px-8 pb-6 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-14 sm:-mt-12">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-primary-400 via-primary-500 to-primary-700 rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white dark:border-gray-900 group-hover:scale-105 transition-transform">
                  <span className="text-white text-3xl sm:text-4xl font-black">{user.name?.[0]?.toUpperCase()}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
                  <FiCheckCircle size={14} className="text-white" />
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 pt-2 sm:pt-0 sm:pb-1">
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{getGreeting()},</p>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">{user.name}</h1>
                <div className="flex flex-wrap items-center gap-2.5 mt-2">
                  <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full tracking-wider ${
                    user.role === 'seller' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : user.role === 'superadmin' || user.role === 'admin' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                    : 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800'
                  }`}>
                    {user.role === 'superadmin' ? '👑 Admin' : user.role}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                    <FiMail size={12} /> {user.email}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                    <FiCalendar size={12} /> Joined {formatDate(user.createdAt)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                {(user?.role === 'superadmin' || user?.role === 'admin') && (
                  <Link to="/superadmin@2026" className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all">
                    <FiShield size={14} /> Admin Panel
                  </Link>
                )}
                {isSeller && user?.role !== 'superadmin' && (
                  <Link to="/seller/dashboard" className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all">
                    <FiBriefcase size={14} /> Seller Dashboard
                  </Link>
                )}
                <button onClick={handleLogout} className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all border border-gray-200 dark:border-gray-700">
                  <FiLogOut size={14} /> Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* MAIN LAYOUT: SIDEBAR + CONTENT */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ─────── LEFT SIDEBAR ─────── */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-3 space-y-1 sticky top-24">
              {menuItems.map((item) => {
                const isActive = activeSection === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveSection(item.key)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${
                      isActive
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <span className={isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'}>{item.icon}</span>
                    <span className="flex-1 text-left">{item.label}</span>
                    {isActive && <FiChevronRight size={14} className="text-white/70" />}
                  </button>
                );
              })}

              {/* Account Summary */}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3 px-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 dark:text-gray-500 font-medium">Total Orders</span>
                  <span className="font-black text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-lg">{stats.totalOrders}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 dark:text-gray-500 font-medium">Pending</span>
                  <span className="font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-lg">{stats.pendingOrders}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 dark:text-gray-500 font-medium">Account Status</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <FiCheckCircle size={10} /> Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ─────── RIGHT CONTENT AREA ─────── */}
          <div className="lg:col-span-4 space-y-6">

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* SECTION: OVERVIEW DASHBOARD */}
            {/* ═══════════════════════════════════════════════════════════ */}
            {activeSection === 'overview' && (
              <div className="space-y-6 animate-fade-in">

                {/* Stats Cards Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Orders', value: stats.totalOrders, icon: <FiShoppingBag size={22} />, gradient: 'from-blue-500 to-blue-600', bgLight: 'bg-blue-50 dark:bg-blue-900/20', textColor: 'text-blue-600 dark:text-blue-400' },
                    { label: 'Pending', value: stats.pendingOrders, icon: <FiClock size={22} />, gradient: 'from-amber-500 to-orange-500', bgLight: 'bg-amber-50 dark:bg-amber-900/20', textColor: 'text-amber-600 dark:text-amber-400' },
                    { label: 'Delivered', value: stats.deliveredOrders, icon: <FiTruck size={22} />, gradient: 'from-emerald-500 to-green-500', bgLight: 'bg-emerald-50 dark:bg-emerald-900/20', textColor: 'text-emerald-600 dark:text-emerald-400' },
                    { label: 'Total Spent', value: formatPrice(stats.totalSpent), icon: <FiDollarSign size={22} />, gradient: 'from-purple-500 to-violet-500', bgLight: 'bg-purple-50 dark:bg-purple-900/20', textColor: 'text-purple-600 dark:text-purple-400' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 hover:shadow-md transition-all hover:-translate-y-0.5 group">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-11 h-11 rounded-xl ${stat.bgLight} flex items-center justify-center ${stat.textColor} group-hover:scale-110 transition-transform`}>
                          {stat.icon}
                        </div>
                      </div>
                      <p className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Quick Actions Grid */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FiGrid size={18} className="text-primary-500" /> Quick Actions
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {quickActions.map((action, i) => (
                      <button
                        key={i}
                        onClick={action.onClick}
                        className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border ${action.borderColor} ${action.color} hover:shadow-md hover:-translate-y-0.5 transition-all group cursor-pointer`}
                      >
                        <div className="group-hover:scale-110 transition-transform">{action.icon}</div>
                        <div className="text-center">
                          <p className="text-xs font-bold">{action.label}</p>
                          <p className="text-[10px] opacity-60 mt-0.5">{action.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Two Column: Recent Orders + Account Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {/* Recent Orders */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FiPackage size={18} className="text-amber-500" /> Recent Orders
                      </h3>
                      <button onClick={() => setActiveSection('orders')} className="text-xs text-primary-600 dark:text-primary-400 font-bold hover:underline flex items-center gap-1">
                        View All <FiArrowRight size={12} />
                      </button>
                    </div>

                    {loading ? <Loader /> : recentOrders.length > 0 ? (
                      <div className="space-y-3">
                        {recentOrders.map((order) => (
                          <div key={order.id} className="flex items-center gap-3 p-3 bg-surface-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group cursor-pointer">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center text-primary-600 dark:text-primary-400 flex-shrink-0">
                              <FiBox size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{order.orderNumber}</p>
                              <p className="text-[10px] text-gray-400 dark:text-gray-500">{formatDate(order.createdAt)}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>{order.status}</span>
                              <p className="text-xs font-black text-gray-900 dark:text-white mt-1">{formatPrice(order.totalAmount)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <div className="text-4xl mb-3">📦</div>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mb-3">No orders yet</p>
                        <Link to="/search" className="btn-primary text-xs px-4 py-2 rounded-xl">Start Shopping</Link>
                      </div>
                    )}
                  </div>

                  {/* Account Info Card */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FiUser size={18} className="text-emerald-500" /> Account Details
                      </h3>
                      <button onClick={() => { setActiveSection('profile'); setEditing(true); }} className="text-xs text-primary-600 dark:text-primary-400 font-bold hover:underline flex items-center gap-1">
                        Edit <FiEdit3 size={12} />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {[
                        { icon: <FiUser size={16} />, label: 'Full Name', value: user.name, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                        { icon: <FiMail size={16} />, label: 'Email', value: user.email, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                        { icon: <FiPhone size={16} />, label: 'Phone', value: user.phone || 'Not added', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                        { icon: <FiMapPin size={16} />, label: 'Location', value: user.city && user.state ? `${user.city}, ${user.state}` : (user.address || 'Not added'), color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 dark:bg-gray-800/50">
                          <div className={`w-9 h-9 rounded-lg ${item.bg} flex items-center justify-center ${item.color} flex-shrink-0`}>
                            {item.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">{item.label}</p>
                            <p className="text-sm text-gray-800 dark:text-gray-200 font-semibold truncate">{item.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Account Security */}
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30">
                        <FiShield size={18} className="text-emerald-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Account Secured</p>
                          <p className="text-[10px] text-emerald-500/70 dark:text-emerald-500/50">Your account is protected</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Member Benefits Banner */}
                <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-blue-500 rounded-2xl p-6 text-white relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-2 right-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-20 w-24 h-24 bg-yellow-300 rounded-full blur-2xl"></div>
                  </div>
                  <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <FiAward size={20} className="text-yellow-300" />
                        <h3 className="text-lg font-black">InduKart Member Benefits</h3>
                      </div>
                      <p className="text-sm text-white/80 max-w-md">Enjoy free delivery, exclusive deals, and priority customer support as an InduKart member.</p>
                    </div>
                    <Link to="/search?featured=true" className="flex-shrink-0 px-5 py-2.5 bg-white text-primary-600 font-bold text-sm rounded-xl hover:bg-gray-50 transition-colors shadow-lg flex items-center gap-2">
                      <FiPercent size={16} /> View Deals
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* SECTION: MY ORDERS */}
            {/* ═══════════════════════════════════════════════════════════ */}
            {activeSection === 'orders' && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                  <h2 className="text-lg font-black text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                    <FiPackage size={20} className="text-amber-500" /> My Orders
                  </h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">Track and manage all your orders</p>

                  {loading ? <Loader /> : orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="bg-surface-50 dark:bg-gray-800/50 rounded-2xl p-5 hover:shadow-md transition-all border border-gray-100 dark:border-gray-800">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{order.orderNumber}</p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
                                <FiCalendar size={11} /> {formatDate(order.createdAt)}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full ${getStatusColor(order.status)}`}>{order.status}</span>
                              <p className="text-base font-black text-gray-900 dark:text-white mt-1.5">{formatPrice(order.totalAmount)}</p>
                            </div>
                          </div>
                          {order.items?.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 py-2.5 border-t border-gray-200 dark:border-gray-700">
                              <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-xl p-1.5 flex-shrink-0 border border-gray-100 dark:border-gray-700">
                                <img src={item.product?.images?.[0] ? `http://localhost:5000${item.product.images[0]}` : 'https://via.placeholder.com/56'} alt="" className="w-full h-full object-contain" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-800 dark:text-gray-200 font-semibold truncate">{item.product?.name}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="text-5xl mb-3">📦</div>
                      <p className="text-gray-500 dark:text-gray-400 mb-4 font-medium">No orders yet</p>
                      <Link to="/search" className="btn-primary rounded-xl px-6">Start Shopping</Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* SECTION: PERSONAL INFO */}
            {/* ═══════════════════════════════════════════════════════════ */}
            {activeSection === 'profile' && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                      <FiUser size={20} className="text-emerald-500" /> Personal Information
                    </h2>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Manage your personal details</p>
                  </div>
                  <button onClick={() => setEditing(!editing)} className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <FiEdit3 size={13} /> {editing ? 'Cancel' : 'Edit'}
                  </button>
                </div>

                {editing ? (
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="input-label">Full Name</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input" />
                      </div>
                      <div>
                        <label className="input-label">Phone</label>
                        <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="input" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="input-label">Address</label>
                        <textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="input min-h-[80px]" />
                      </div>
                      <div>
                        <label className="input-label">City</label>
                        <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="input" />
                      </div>
                      <div>
                        <label className="input-label">State</label>
                        <input type="text" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} className="input" />
                      </div>
                      <div>
                        <label className="input-label">Pincode</label>
                        <input type="text" value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} className="input" />
                      </div>
                    </div>
                    <button type="submit" className="btn-primary px-6 rounded-xl">Save Changes</button>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { icon: <FiUser />, label: 'Name', value: user.name, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                      { icon: <FiMail />, label: 'Email', value: user.email, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                      { icon: <FiPhone />, label: 'Phone', value: user.phone || 'Not added', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                      { icon: <FiMapPin />, label: 'Address', value: user.address ? `${user.address}, ${user.city || ''} ${user.state || ''} ${user.pincode || ''}` : 'Not added', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                      { icon: <FiCalendar />, label: 'Member Since', value: formatDate(user.createdAt), color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-900/20' },
                      { icon: <FiShield />, label: 'Account Type', value: user.role?.charAt(0).toUpperCase() + user.role?.slice(1), color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-surface-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                        <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center ${item.color} flex-shrink-0`}>
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">{item.label}</p>
                          <p className="text-sm text-gray-800 dark:text-gray-200 font-semibold mt-0.5">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* SECTION: MANAGE ADDRESSES */}
            {/* ═══════════════════════════════════════════════════════════ */}
            {activeSection === 'addresses' && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 animate-fade-in">
                <div className="mb-4">
                  <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <FiMapPin size={20} className="text-purple-500" /> Manage Addresses
                  </h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Add and manage your delivery addresses</p>
                </div>
                <AddressManager />
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* SECTION: ACCOUNT SETTINGS */}
            {/* ═══════════════════════════════════════════════════════════ */}
            {activeSection === 'settings' && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 animate-fade-in">
                <div className="mb-6">
                  <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <FiSettings size={20} className="text-gray-500" /> Account Settings
                  </h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Update your account preferences</p>
                </div>
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">Full Name</label>
                      <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input" />
                    </div>
                    <div>
                      <label className="input-label">Phone</label>
                      <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="input" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="input-label">Address</label>
                      <textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="input min-h-[80px]" />
                    </div>
                    <div>
                      <label className="input-label">City</label>
                      <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="input" />
                    </div>
                    <div>
                      <label className="input-label">State</label>
                      <input type="text" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} className="input" />
                    </div>
                    <div>
                      <label className="input-label">Pincode</label>
                      <input type="text" value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} className="input" />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary px-6 rounded-xl">Save Changes</button>
                </form>

                {/* Danger Zone */}
                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                  <h3 className="text-sm font-bold text-red-600 dark:text-red-400 mb-3">Danger Zone</h3>
                  <button onClick={handleLogout} className="flex items-center gap-2 px-5 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold text-sm rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors border border-red-200 dark:border-red-800">
                    <FiLogOut size={16} /> Sign Out of Account
                  </button>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* SECTION: STORE INFO (Seller Only) */}
            {/* ═══════════════════════════════════════════════════════════ */}
            {activeSection === 'store' && isSeller && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 animate-fade-in">
                <div className="mb-6">
                  <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <FiBriefcase size={20} className="text-pink-500" /> Store Information
                  </h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Your seller store details</p>
                </div>
                <div className="space-y-4">
                  <div className="p-5 bg-surface-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-1.5">Store Name</p>
                    <p className="text-gray-800 dark:text-gray-200 font-bold text-base">{user.storeName || 'Not set'}</p>
                  </div>
                  <div className="p-5 bg-surface-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-1.5">Store Description</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{user.storeDescription || 'No description added'}</p>
                  </div>
                  <Link to="/seller/settings" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                    <FiSettings size={14} /> Edit in Seller Dashboard
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDashboardPage;
