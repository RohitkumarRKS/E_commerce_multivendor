import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiShoppingBag, FiPackage, FiDollarSign, FiTrendingUp,
  FiArrowUpRight, FiClock, FiTruck, FiBox, FiGift,
  FiMapPin, FiUser, FiEdit3, FiArrowRight, FiCheckCircle,
  FiCalendar, FiAward, FiPercent, FiShield, FiStar
} from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import { orderAPI } from '../../services/api';
import { formatPrice, formatDate, getStatusColor } from '../../utils/helpers';

const BuyerDashboardPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await orderAPI.getMyOrders({});
        setOrders(res.data.data.orders || []);
      } catch (err) {
        console.error('Failed to load buyer data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-primary-100 dark:border-primary-900/30 border-t-primary-500 rounded-full animate-spin" />
          <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-b-blue-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
        </div>
      </div>
    );
  }

  const totalSpent = orders.reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅 Good Morning';
    if (hour < 17) return '☀️ Good Afternoon';
    return '🌙 Good Evening';
  };

  const statCards = [
    {
      label: 'TOTAL ORDERS',
      value: orders.length,
      icon: <FiShoppingBag size={22} />,
      gradient: 'from-blue-500 to-indigo-600',
      shadow: 'shadow-blue-500/20',
      change: `${deliveredOrders} delivered`,
      changeColor: 'text-emerald-500',
    },
    {
      label: 'PENDING',
      value: pendingOrders,
      icon: <FiClock size={22} />,
      gradient: 'from-amber-500 to-orange-600',
      shadow: 'shadow-amber-500/20',
      change: 'Active',
      changeColor: 'text-amber-500',
    },
    {
      label: 'DELIVERED',
      value: deliveredOrders,
      icon: <FiTruck size={22} />,
      gradient: 'from-emerald-500 to-green-600',
      shadow: 'shadow-emerald-500/20',
      change: 'Completed',
      changeColor: 'text-emerald-500',
    },
    {
      label: 'TOTAL SPENT',
      value: formatPrice(totalSpent),
      icon: <FiDollarSign size={22} />,
      gradient: 'from-purple-500 to-violet-600',
      shadow: 'shadow-purple-500/20',
      change: 'All time',
      changeColor: 'text-purple-500',
    },
  ];

  const recentOrders = orders.slice(0, 6);

  return (
    <div className="space-y-7">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            {getGreeting()}, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">Here's your account overview and recent activity.</p>
        </div>
        <Link to="/search" className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary-500 to-blue-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all duration-300 active:scale-95">
          <FiShoppingBag size={16} /> Shop Now
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((card, i) => (
          <div key={i} className={`bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-xl ${card.shadow} transition-all duration-300 hover:-translate-y-1 group cursor-default`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br ${card.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {card.icon}
              </div>
              <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${card.changeColor} bg-gray-50 dark:bg-gray-800`}>
                <FiArrowUpRight size={12} />
                {card.change}
              </span>
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{card.value}</h3>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: <FiPackage size={22} />, label: 'Track Orders', link: '/buyer/orders', gradient: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/20', hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-900/10' },
          { icon: <FiMapPin size={22} />, label: 'My Addresses', link: '/buyer/addresses', gradient: 'from-purple-500 to-violet-600', shadow: 'shadow-purple-500/20', hoverBg: 'hover:bg-purple-50 dark:hover:bg-purple-900/10' },
          { icon: <FiGift size={22} />, label: 'Offers & Deals', link: '/search?featured=true', gradient: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/20', hoverBg: 'hover:bg-amber-50 dark:hover:bg-amber-900/10' },
          { icon: <FiUser size={22} />, label: 'Edit Profile', link: '/buyer/profile', gradient: 'from-emerald-500 to-green-600', shadow: 'shadow-emerald-500/20', hoverBg: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/10' },
        ].map((action, i) => (
          <Link
            key={i}
            to={action.link}
            className={`bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-xl ${action.shadow} ${action.hoverBg} transition-all duration-300 hover:-translate-y-1 group flex flex-col items-center gap-3 text-center active:scale-95`}
          >
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
              {action.icon}
            </div>
            <p className="text-xs font-bold text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white">{action.label}</p>
          </Link>
        ))}
      </div>

      {/* Main Grid: Account Info + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account Info */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800/50">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-500">
                <FiUser size={16} />
              </div>
              Account Info
            </h3>
            <Link to="/buyer/profile" className="text-xs text-primary-500 font-bold hover:underline flex items-center gap-1 hover:gap-2 transition-all">
              Edit <FiEdit3 size={11} />
            </Link>
          </div>
          <div className="p-5 space-y-1">
            {[
              { label: 'Name', value: user?.name },
              { label: 'Email', value: user?.email },
              { label: 'Phone', value: user?.phone || 'Not added' },
              { label: 'Location', value: user?.city && user?.state ? `${user.city}, ${user.state}` : (user?.address || 'Not added') },
              { label: 'Member Since', value: formatDate(user?.createdAt) },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group cursor-default">
                <span className="text-xs text-gray-400 dark:text-gray-500 font-medium group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">{item.label}</span>
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 max-w-[60%] truncate text-right">{item.value}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/10 rounded-xl mt-3 border border-emerald-100 dark:border-emerald-900/30">
              <FiShield size={16} className="text-emerald-500 flex-shrink-0" />
              <div>
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">Verified Account</span>
                <p className="text-[9px] text-emerald-500/60">Protected & secure</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800/50">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500">
                <FiPackage size={16} />
              </div>
              Recent Orders
            </h3>
            <Link to="/buyer/orders" className="text-xs text-primary-500 font-bold hover:underline flex items-center gap-1 hover:gap-2 transition-all">
              View All <FiArrowRight size={12} />
            </Link>
          </div>
          {recentOrders.length > 0 ? (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {recentOrders.map((order) => (
                <div key={order.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-all duration-200 group cursor-default">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <FiBox size={18} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{order.orderNumber}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                        <FiCalendar size={10} /> {formatDate(order.createdAt)}
                        {order.items && <span> • {order.items.length} item{order.items.length > 1 ? 's' : ''}</span>}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-gray-900 dark:text-white">{formatPrice(order.totalAmount)}</p>
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-14 text-center">
              <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📦</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-1">No orders yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Start shopping to see your orders here</p>
              <Link to="/search" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-blue-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                <FiShoppingBag size={14} /> Browse Products
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Member Benefits Banner */}
      <div className="bg-gradient-to-r from-primary-600 via-blue-500 to-indigo-600 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-primary-500/15 hover:shadow-2xl hover:shadow-primary-500/20 transition-shadow duration-300">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-2 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-20 w-32 h-32 bg-yellow-300 rounded-full blur-3xl"></div>
          <div className="absolute top-10 left-1/2 w-24 h-24 bg-purple-300 rounded-full blur-2xl"></div>
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <FiAward size={22} className="text-yellow-300" />
              </div>
              <h3 className="text-xl font-black">InduKart Member Benefits</h3>
            </div>
            <p className="text-sm text-white/80 max-w-lg leading-relaxed">Enjoy free delivery on orders above ₹499, exclusive deals, early access to sales, and priority customer support.</p>
          </div>
          <Link to="/search?featured=true" className="flex-shrink-0 px-6 py-3 bg-white text-primary-600 font-bold text-sm rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg flex items-center gap-2 hover:-translate-y-0.5 active:scale-95">
            <FiPercent size={16} /> View Deals
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboardPage;
