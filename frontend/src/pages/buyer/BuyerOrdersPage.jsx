import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiBox, FiCalendar, FiSearch, FiRotateCcw, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { orderAPI, returnAPI } from '../../services/api';
import { formatPrice, formatDate, getStatusColor, getImageUrl } from '../../utils/helpers';
import ReturnModal from '../../components/buyer/ReturnModal';

const BuyerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'returns'
  const [filterStatus, setFilterStatus] = useState('all');

  // Return Modal state
  const [selectedOrderItem, setSelectedOrderItem] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(false);

  const fetchData = async () => {
    try {
      const [orderRes, returnRes] = await Promise.all([
        orderAPI.getMyOrders({}),
        returnAPI.getMyReturns(),
      ]);
      setOrders(orderRes.data.data.orders || []);
      setReturns(returnRes.data.data.returns || []);
    } catch (err) {
      console.error('Failed to load orders or returns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenReturnModal = (item) => {
    setSelectedOrderItem(item);
    setShowReturnModal(true);
  };

  const filteredOrders = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Orders & Returns</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track orders and manage return & refund requests</p>
        </div>
        <Link to="/search" className="btn-primary flex items-center gap-2 rounded-xl text-sm">
          <FiSearch size={14} /> Browse Products
        </Link>
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 ${
            activeTab === 'orders'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          My Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('returns')}
          className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'returns'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <FiRotateCcw size={14} />
          Returns & Refund Status ({returns.length})
        </button>
      </div>

      {/* TAB 1: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Status Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize ${
                  filterStatus === status
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {status === 'all' ? `All (${orders.length})` : status}
              </button>
            ))}
          </div>

          {filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{order.orderNumber}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
                        <FiCalendar size={11} /> {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <p className="text-base font-black text-gray-900 dark:text-white mt-1.5">{formatPrice(order.totalAmount)}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {order.items?.map((item) => {
                      const hasReturnRequest = returns.some(r => r.orderItemId === item.id);
                      return (
                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 bg-surface-50 dark:bg-gray-800 rounded-xl p-1.5 flex-shrink-0 border border-gray-100 dark:border-gray-700">
                              <img src={getImageUrl(item.product?.images?.[0])} alt="" className="w-full h-full object-contain" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm text-gray-800 dark:text-gray-200 font-semibold line-clamp-1">{item.product?.name}</p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                            </div>
                          </div>

                          {/* Action Button for Returns */}
                          <div className="flex items-center gap-2">
                            {order.status === 'delivered' && (
                              hasReturnRequest ? (
                                <span className="text-[11px] font-extrabold text-orange-600 bg-orange-50 dark:bg-orange-950/40 px-3 py-1.5 rounded-xl border border-orange-200 dark:border-orange-900/40 flex items-center gap-1">
                                  <FiRotateCcw size={12} /> Return Requested
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleOpenReturnModal(item)}
                                  className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1"
                                >
                                  <FiRotateCcw size={12} /> Request Return
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-center py-16">
              <p className="text-5xl mb-3">📦</p>
              <p className="text-gray-500 dark:text-gray-400 mb-4 font-medium">
                {filterStatus === 'all' ? 'No orders yet' : `No ${filterStatus} orders`}
              </p>
              <Link to="/search" className="btn-primary rounded-xl px-6">Start Shopping</Link>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RETURNS & REFUNDS */}
      {activeTab === 'returns' && (
        <div className="space-y-4">
          {returns.length > 0 ? (
            <div className="space-y-4">
              {returns.map((ret) => (
                <div key={ret.id} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 hover:shadow-md transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div>
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Order #{ret.order?.orderNumber}</span>
                      <p className="text-xs text-gray-400">Requested on: {formatDate(ret.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full ${
                        ret.status === 'refund_processed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                        ret.status === 'approved' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                        ret.status === 'rejected' ? 'bg-red-50 text-red-600 border border-red-200' :
                        'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}>
                        {ret.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-xl p-1 border border-gray-100 dark:border-gray-700 flex-shrink-0">
                      <img src={getImageUrl(ret.orderItem?.product?.images?.[0])} alt="" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{ret.orderItem?.product?.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Reason: <strong>{ret.reason}</strong></p>
                      <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-1">Refund Amount: {formatPrice(ret.refundAmount)}</p>
                    </div>
                  </div>

                  {/* Bank Credit Info */}
                  <div className="bg-surface-50 dark:bg-gray-800/40 rounded-xl p-3 text-xs border border-gray-100 dark:border-gray-800 space-y-1">
                    <p className="font-bold text-gray-700 dark:text-gray-300">🏦 Refund Bank Account Details:</p>
                    <p className="text-gray-500 dark:text-gray-400">Account: <strong>{ret.accountNumber}</strong> ({ret.bankName}) | IFSC: <strong>{ret.ifscCode}</strong></p>
                    <p className="text-gray-500 dark:text-gray-400">Holder: {ret.accountHolderName} {ret.upiId && `| UPI: ${ret.upiId}`}</p>
                  </div>

                  {/* 2-3 Days Banner */}
                  <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                    <FiClock size={16} />
                    <span>Estimated Bank Credit: {ret.estimatedCreditTime || '2 to 3 Working Days'}</span>
                  </div>

                  {ret.adminComment && (
                    <p className="text-xs text-gray-500 mt-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                      <strong>Seller/Admin Comment:</strong> {ret.adminComment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-center py-16">
              <FiRotateCcw size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">No return or refund requests found.</p>
            </div>
          )}
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && (
        <ReturnModal
          isOpen={showReturnModal}
          onClose={() => setShowReturnModal(false)}
          orderItem={selectedOrderItem}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
};

export default BuyerOrdersPage;
