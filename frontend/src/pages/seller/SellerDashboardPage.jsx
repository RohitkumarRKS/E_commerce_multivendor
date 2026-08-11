import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiShoppingBag, FiPackage, FiDollarSign, FiTrendingUp,
  FiArrowUpRight, FiPlus, FiCalendar, FiBox, FiStar,
  FiArrowRight, FiPercent, FiAward, FiTarget, FiBarChart2
} from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import { productAPI, orderAPI } from '../../services/api';
import { formatPrice, formatDate } from '../../utils/helpers';

const SellerDashboardPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, oRes] = await Promise.all([
          productAPI.getSellerProducts({ limit: 50 }),
          orderAPI.getSellerOrders({ limit: 20 }),
        ]);
        setProducts(pRes.data.data.products);
        setOrders(oRes.data.data.orderItems || []);
      } catch (err) {
        console.error('Failed to load seller data:', err);
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
          <div className="w-12 h-12 border-4 border-emerald-100 dark:border-emerald-900/30 border-t-emerald-500 rounded-full animate-spin" />
          <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-b-teal-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
        </div>
      </div>
    );
  }

  const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.price || 0) * (o.quantity || 0), 0);
  const activeProducts = products.filter(p => p.isActive).length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅 Good Morning';
    if (hour < 17) return '☀️ Good Afternoon';
    return '🌙 Good Evening';
  };

  const statCards = [
    {
      label: 'TOTAL REVENUE',
      value: formatPrice(totalRevenue),
      icon: <FiDollarSign size={22} />,
      gradient: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/20',
      change: '+12.5%',
      changeColor: 'text-emerald-500',
    },
    {
      label: 'TOTAL ORDERS',
      value: orders.length,
      icon: <FiPackage size={22} />,
      gradient: 'from-blue-500 to-indigo-600',
      shadow: 'shadow-blue-500/20',
      change: '+8.3%',
      changeColor: 'text-blue-500',
    },
    {
      label: 'ACTIVE PRODUCTS',
      value: activeProducts,
      icon: <FiShoppingBag size={22} />,
      gradient: 'from-purple-500 to-violet-600',
      shadow: 'shadow-purple-500/20',
      change: `${products.length} total`,
      changeColor: 'text-purple-500',
    },
    {
      label: 'GROWTH',
      value: '+15%',
      icon: <FiTrendingUp size={22} />,
      gradient: 'from-amber-500 to-orange-600',
      shadow: 'shadow-amber-500/20',
      change: 'This month',
      changeColor: 'text-amber-500',
    },
  ];

  return (
    <div className="space-y-7">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            {getGreeting()}, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">Here's your store overview and performance.</p>
        </div>
        <Link to="/seller/add-product" className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-300 active:scale-95">
          <FiPlus size={16} /> Add Product
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
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{card.value}</h3>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: <FiPlus size={22} />, label: 'Add Product', link: '/seller/add-product', gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20', hoverBg: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/10' },
          { icon: <FiPackage size={22} />, label: 'View Orders', link: '/seller/orders', gradient: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/20', hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-900/10' },
          { icon: <FiShoppingBag size={22} />, label: 'Products', link: '/seller/products', gradient: 'from-purple-500 to-violet-600', shadow: 'shadow-purple-500/20', hoverBg: 'hover:bg-purple-50 dark:hover:bg-purple-900/10' },
          { icon: <FiBarChart2 size={22} />, label: 'Store Settings', link: '/seller/settings', gradient: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/20', hoverBg: 'hover:bg-amber-50 dark:hover:bg-amber-900/10' },
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Products */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800/50">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500">
                <FiShoppingBag size={16} />
              </div>
              Recent Products
            </h3>
            <Link to="/seller/products" className="text-xs text-primary-500 font-bold hover:underline flex items-center gap-1 hover:gap-2 transition-all">
              View All <FiArrowRight size={12} />
            </Link>
          </div>
          {products.length > 0 ? (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {products.slice(0, 5).map((p) => (
                <div key={p.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-all duration-200 group cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-surface-50 dark:bg-gray-800 rounded-xl flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-700 group-hover:scale-110 transition-transform duration-200">
                      {p.images?.[0] ? (
                        <img src={`http://localhost:5000${p.images[0]}`} alt="" className="w-full h-full object-contain" />
                      ) : (
                        <FiShoppingBag size={16} className="text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200 line-clamp-1 max-w-[150px]">{p.name}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{p.category?.name || 'No category'}</p>
                    </div>
                  </div>
                  <p className="text-sm font-black text-gray-900 dark:text-white">{formatPrice(p.price)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-14 text-center">
              <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📦</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-1">No products yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Add your first product to start selling</p>
              <Link to="/seller/add-product" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                <FiPlus size={14} /> Add Product
              </Link>
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800/50">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                <FiPackage size={16} />
              </div>
              Recent Orders
            </h3>
            <Link to="/seller/orders" className="text-xs text-primary-500 font-bold hover:underline flex items-center gap-1 hover:gap-2 transition-all">
              View All <FiArrowRight size={12} />
            </Link>
          </div>
          {orders.length > 0 ? (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {orders.slice(0, 6).map((item) => (
                <div key={item.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-all duration-200 group cursor-default">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <FiBox size={18} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{item.order?.orderNumber || 'Order'}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {item.product?.name || 'Product'} • Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-gray-900 dark:text-white">{formatPrice(item.price * item.quantity)}</p>
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      item.status === 'delivered' ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20'
                        : item.status === 'cancelled' ? 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20'
                        : 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-14 text-center">
              <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📋</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-1">No orders yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Products will appear here once buyers order.</p>
            </div>
          )}
        </div>
      </div>

      {/* Seller Performance Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-emerald-500/15 hover:shadow-2xl hover:shadow-emerald-500/20 transition-shadow duration-300">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-2 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-20 w-32 h-32 bg-yellow-300 rounded-full blur-3xl"></div>
          <div className="absolute top-10 left-1/2 w-24 h-24 bg-cyan-200 rounded-full blur-2xl"></div>
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <FiTarget size={22} className="text-yellow-300" />
              </div>
              <h3 className="text-xl font-black">Grow Your Business</h3>
            </div>
            <p className="text-sm text-white/80 max-w-lg leading-relaxed">Add more products, optimize your listings, and reach millions of buyers on InduKart. Use promotions and deals to boost visibility.</p>
          </div>
          <Link to="/seller/add-product" className="flex-shrink-0 px-6 py-3 bg-white text-emerald-600 font-bold text-sm rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg flex items-center gap-2 hover:-translate-y-0.5 active:scale-95">
            <FiPlus size={16} /> Add Product
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboardPage;
