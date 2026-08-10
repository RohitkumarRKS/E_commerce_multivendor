import { useState, useEffect } from 'react';
import { FiPackage } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { orderAPI } from '../../services/api';
import { formatPrice, formatDate } from '../../utils/helpers';

const SellerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderAPI.getSellerOrders({ limit: 50 });
        setOrders(res.data.data.orderItems || []);
      } catch {
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-sm text-gray-500">Track and manage orders for your products</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      ) : orders.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Order</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4 text-center">Qty</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-mono font-bold text-primary-600 text-xs">
                      {item.order?.orderNumber || '—'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-800 line-clamp-1 max-w-[180px]">
                      {item.product?.name || '—'}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {item.order?.user?.name || '—'}
                  </td>
                  <td className="px-6 py-4 text-center font-semibold">{item.quantity}</td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                      item.status === 'delivered' ? 'text-emerald-600 bg-emerald-50'
                        : item.status === 'cancelled' ? 'text-red-600 bg-red-50'
                        : item.status === 'shipped' ? 'text-blue-600 bg-blue-50'
                        : 'text-amber-600 bg-amber-50'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {item.order ? formatDate(item.order.createdAt) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 text-center py-20">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiPackage size={28} className="text-blue-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">No orders yet</h3>
          <p className="text-gray-400 text-sm">Orders will appear here once customers buy your products</p>
        </div>
      )}
    </div>
  );
};

export default SellerOrdersPage;
