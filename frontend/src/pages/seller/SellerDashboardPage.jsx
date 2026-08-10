import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiPackage, FiDollarSign, FiTrendingUp, FiArrowUpRight, FiPlus, FiEye } from 'react-icons/fi';
import { productAPI, orderAPI } from '../../services/api';
import { formatPrice, formatDate } from '../../utils/helpers';

const SellerDashboardPage = () => {
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
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.price || 0) * (o.quantity || 0), 0);
  const activeProducts = products.filter(p => p.isActive).length;

  const statCards = [
    {
      label: 'Total Revenue',
      value: formatPrice(totalRevenue),
      icon: <FiDollarSign size={22} />,
      bgColor: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      change: '+12.5%',
    },
    {
      label: 'Total Orders',
      value: orders.length,
      icon: <FiPackage size={22} />,
      bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
      change: '+8.3%',
    },
    {
      label: 'Active Products',
      value: activeProducts,
      icon: <FiShoppingBag size={22} />,
      bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
      change: `${products.length} total`,
    },
    {
      label: 'Growth',
      value: '+15%',
      icon: <FiTrendingUp size={22} />,
      bgColor: 'bg-gradient-to-br from-amber-500 to-orange-500',
      change: 'This month',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back! Here's your store overview.</p>
        </div>
        <Link to="/seller/add-product" className="btn-primary flex items-center gap-2">
          <FiPlus size={16} /> Add Product
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${card.bgColor} shadow-lg`}>
                {card.icon}
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full text-emerald-600 bg-emerald-50">
                <FiArrowUpRight size={12} />
                {card.change}
              </span>
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-1">{card.value}</h3>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Products */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <FiShoppingBag size={18} className="text-emerald-500" />
              Recent Products
            </h3>
            <Link to="/seller/products" className="text-xs text-primary-500 font-semibold hover:underline">View All</Link>
          </div>
          {products.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {products.slice(0, 5).map((p) => (
                <div key={p.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-surface-50 rounded-xl flex items-center justify-center overflow-hidden">
                      {p.images?.[0] ? (
                        <img src={`http://localhost:5000${p.images[0]}`} alt="" className="w-full h-full object-contain" />
                      ) : (
                        <FiShoppingBag size={16} className="text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 line-clamp-1 max-w-[150px]">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.category?.name || 'No category'}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{formatPrice(p.price)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-4xl mb-3">📦</p>
              <p className="text-gray-400 text-sm">No products yet</p>
              <Link to="/seller/add-product" className="btn-primary btn-sm mt-3 inline-flex">Add Product</Link>
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <FiPackage size={18} className="text-blue-500" />
              Recent Orders
            </h3>
            <Link to="/seller/orders" className="text-xs text-primary-500 font-semibold hover:underline">View All</Link>
          </div>
          {orders.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {orders.slice(0, 6).map((item) => (
                <div key={item.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                      <FiPackage size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{item.order?.orderNumber || 'Order'}</p>
                      <p className="text-xs text-gray-400">
                        {item.product?.name || 'Product'} • Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      item.status === 'delivered' ? 'text-emerald-600 bg-emerald-50'
                        : item.status === 'cancelled' ? 'text-red-600 bg-red-50'
                        : 'text-amber-600 bg-amber-50'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-gray-400 text-sm">No orders yet. Products will appear here once buyers order.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboardPage;
