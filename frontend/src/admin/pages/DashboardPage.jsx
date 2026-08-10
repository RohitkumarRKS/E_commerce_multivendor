import { useState, useEffect } from 'react';
import { FiUsers, FiShoppingBag, FiPackage, FiDollarSign, FiTrendingUp, FiArrowUpRight, FiArrowDownRight } from 'react-icons/fi';
import { adminStatsAPI } from '../services/adminApi';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminStatsAPI.getStats();
        setStats(res.data.data.stats);
        setRecentOrders(res.data.data.recentOrders || []);
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Revenue',
      value: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`,
      icon: <FiDollarSign size={22} />,
      bgColor: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      lightBg: 'bg-emerald-50',
      change: '+12.5%',
      positive: true,
    },
    {
      label: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: <FiPackage size={22} />,
      bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
      lightBg: 'bg-blue-50',
      change: '+8.3%',
      positive: true,
    },
    {
      label: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: <FiShoppingBag size={22} />,
      bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
      lightBg: 'bg-purple-50',
      change: '+15.2%',
      positive: true,
    },
    {
      label: 'Active Users',
      value: stats?.totalUsers || 0,
      icon: <FiUsers size={22} />,
      bgColor: 'bg-gradient-to-br from-amber-500 to-orange-500',
      lightBg: 'bg-amber-50',
      change: '+5.1%',
      positive: true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back! Here's what's happening with your marketplace.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${card.bgColor} shadow-lg`}>
                {card.icon}
              </div>
              <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                card.positive ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'
              }`}>
                {card.positive ? <FiArrowUpRight size={12} /> : <FiArrowDownRight size={12} />}
                {card.change}
              </span>
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-1">{card.value}</h3>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Breakdown */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
            <FiUsers size={18} className="text-primary-500" />
            User Breakdown
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm font-medium text-gray-700">Sellers</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{stats?.totalSellers || 0}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${stats?.totalUsers ? ((stats?.totalSellers || 0) / stats.totalUsers * 100) : 0}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-sm font-medium text-gray-700">Buyers</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{stats?.totalBuyers || 0}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all"
                style={{ width: `${stats?.totalUsers ? ((stats?.totalBuyers || 0) / stats.totalUsers * 100) : 0}%` }}
              ></div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 pt-4 border-t space-y-3">
            <div className="flex justify-between items-center p-3 bg-surface-50 rounded-xl">
              <span className="text-sm text-gray-600">Seller Ratio</span>
              <span className="text-sm font-bold text-primary-600">
                {stats?.totalUsers ? ((stats?.totalSellers || 0) / stats.totalUsers * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-surface-50 rounded-xl">
              <span className="text-sm text-gray-600">Avg. Revenue/Order</span>
              <span className="text-sm font-bold text-emerald-600">
                ₹{stats?.totalOrders ? Math.round((stats?.totalRevenue || 0) / stats.totalOrders).toLocaleString('en-IN') : 0}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <FiTrendingUp size={18} className="text-primary-500" />
              Recent Platform Orders
            </h3>
            <span className="text-xs text-gray-400 font-medium">{recentOrders.length} latest</span>
          </div>

          {recentOrders.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {recentOrders.slice(0, 6).map((order) => (
                <div key={order.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                      <FiPackage size={18} className="text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{order.orderNumber}</p>
                      <p className="text-xs text-gray-400">{order.user?.name || 'Unknown'} • {order.user?.email || ''}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">₹{parseFloat(order.totalAmount).toLocaleString('en-IN')}</p>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      order.paymentStatus === 'paid'
                        ? 'text-emerald-600 bg-emerald-50'
                        : 'text-amber-600 bg-amber-50'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-4xl mb-3">📦</p>
              <p className="text-gray-400 text-sm">No orders recorded yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
