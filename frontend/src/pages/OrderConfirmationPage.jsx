import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCheckCircle, FiPackage, FiShoppingBag, FiTruck, FiMapPin } from 'react-icons/fi';
import { orderAPI } from '../services/api';
import { formatPrice, formatDate, getImageUrl } from '../utils/helpers';
import Loader from '../components/common/Loader';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderAPI.getOrder(orderId);
        setOrder(res.data.data.order);
      } catch {
        console.error('Failed to load order');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) return <Loader fullScreen />;

  return (
    <div className="bg-surface-50 min-h-screen py-10">
      <div className="container-main max-w-3xl">
        <div className="bg-white rounded-2xl shadow-card p-8 text-center mb-6">
          <div className="w-16 h-16 bg-green-100 text-success rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-in">
            <FiCheckCircle size={36} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-500 text-sm mb-4">
            Thank you for your order. We've received your request and are processing it.
          </p>

          {order && (
            <div className="inline-block bg-surface-50 px-4 py-2 rounded-lg text-sm font-semibold text-gray-800 border">
              Order ID: <span className="text-primary-600 font-mono">{order.orderNumber}</span>
            </div>
          )}
        </div>

        {order && (
          <div className="bg-white rounded-2xl shadow-card p-6 space-y-6">
            {/* Order Status Header */}
            <div className="flex flex-wrap items-center justify-between border-b pb-4 gap-4">
              <div>
                <p className="text-xs text-gray-400">Order Date</p>
                <p className="text-sm font-medium text-gray-800">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Payment Status</p>
                <span className={`badge-${order.paymentStatus === 'paid' ? 'success' : 'warning'}`}>
                  {order.paymentStatus?.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-400">Total Amount</p>
                <p className="text-lg font-bold text-gray-900">{formatPrice(order.totalAmount)}</p>
              </div>
            </div>

            {/* Items */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Order Items</h3>
              <div className="space-y-3 divide-y">
                {order.items?.map((item) => (
                  <div key={item.id} className="pt-3 flex items-center gap-4">
                    <img
                      src={getImageUrl(item.product?.images?.[0])}
                      alt=""
                      className="w-14 h-14 object-contain rounded-lg bg-surface-50 p-1 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 line-clamp-1">{item.product?.name}</p>
                      <p className="text-xs text-gray-500">Seller: {item.seller?.storeName || item.seller?.name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-gray-900 text-sm">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <FiMapPin className="text-primary-500" /> Delivery Address
              </h3>
              <div className="text-sm text-gray-700 bg-surface-50 p-4 rounded-xl space-y-1">
                <p className="font-semibold text-gray-900">{order.shippingAddress?.name}</p>
                <p>{order.shippingAddress?.street}</p>
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
                <p className="text-xs text-gray-500 pt-1">Phone: {order.shippingAddress?.phone}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t pt-4 flex flex-col sm:flex-row gap-3">
              <Link to="/profile?tab=orders" className="btn-primary flex-1">
                <FiPackage size={16} /> View All Orders
              </Link>
              <Link to="/" className="btn-outline flex-1">
                <FiShoppingBag size={16} /> Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
