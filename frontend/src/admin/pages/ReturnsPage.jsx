import { useState, useEffect } from 'react';
import { FiRotateCcw, FiCheckCircle, FiXCircle, FiClock, FiDollarSign, FiUser, FiPackage, FiSend, FiShoppingBag } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { returnAPI } from '../../services/api';
import { formatPrice, formatDate, getImageUrl } from '../../utils/helpers';

const AdminReturnsPage = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [statusMap, setStatusMap] = useState({});
  const [commentMap, setCommentMap] = useState({});
  const [txnMap, setTxnMap] = useState({});

  const fetchReturns = async () => {
    try {
      const res = await returnAPI.getAllReturns();
      setReturns(res.data.data.returns || []);
    } catch (err) {
      console.error('Failed to load admin returns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleUpdateStatus = async (retId) => {
    const newStatus = statusMap[retId] || 'approved';
    const comment = commentMap[retId] || '';
    const txnId = txnMap[retId] || '';

    setUpdatingId(retId);
    try {
      await returnAPI.updateStatus(retId, {
        status: newStatus,
        adminComment: comment,
        refundTransactionId: txnId,
      });
      toast.success(`Return request updated to ${newStatus}! Notification email sent to buyer.`);
      fetchReturns();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update return request');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiRotateCcw className="text-blue-600" />
          Global Returns & Refund Control
        </h1>
        <p className="text-sm text-gray-500 mt-1">Superadmin access to all buyer return requests, bank details, and 2-3 working days refund processing</p>
      </div>

      {/* List */}
      {returns.length > 0 ? (
        <div className="space-y-4">
          {returns.map((ret) => (
            <div key={ret.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                <div>
                  <span className="text-xs font-bold text-gray-400">Order #{ret.order?.orderNumber}</span>
                  <p className="text-xs text-gray-500">Requested: {formatDate(ret.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold bg-purple-50 text-purple-600 px-2.5 py-1 rounded-full border border-purple-100">
                    Seller: {ret.seller?.storeName || ret.seller?.name || 'Store'}
                  </span>
                  <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full ${
                    ret.status === 'refund_processed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                    ret.status === 'approved' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                    ret.status === 'rejected' ? 'bg-red-50 text-red-600 border border-red-200' :
                    'bg-amber-50 text-amber-600 border border-amber-200'
                  }`}>
                    {ret.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Product Info & Buyer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 bg-gray-50 rounded-xl p-1 border border-gray-100 flex-shrink-0">
                    <img src={getImageUrl(ret.orderItem?.product?.images?.[0])} alt="" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">{ret.orderItem?.product?.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Reason: <strong className="text-orange-600">{ret.reason}</strong></p>
                    <p className="text-xs font-black text-emerald-600 mt-1">Refund Amount: {formatPrice(ret.refundAmount)}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl text-xs space-y-1">
                  <p className="font-bold text-gray-700">👤 Buyer Details:</p>
                  <p className="text-gray-600">Name: {ret.buyer?.name} | Email: {ret.buyer?.email}</p>
                  <p className="text-gray-600">Phone: {ret.buyer?.phone || 'N/A'}</p>
                </div>
              </div>

              {/* Buyer Bank Details Box */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100 text-xs space-y-1">
                <h4 className="font-extrabold text-blue-900 flex items-center gap-1.5 mb-2">
                  <FiDollarSign className="text-blue-500" />
                  Buyer's Direct Bank Refund Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-gray-700">
                  <p>Account Holder: <strong>{ret.accountHolderName}</strong></p>
                  <p>Bank: <strong>{ret.bankName}</strong></p>
                  <p>Account No: <strong className="font-mono">{ret.accountNumber}</strong></p>
                  <p>IFSC Code: <strong className="font-mono uppercase">{ret.ifscCode}</strong></p>
                  {ret.upiId && <p className="sm:col-span-2">UPI ID: <strong>{ret.upiId}</strong></p>}
                </div>
              </div>

              {/* Action Form */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
                <h4 className="font-bold text-xs text-gray-800">Superadmin Status Override & Refund Credit Email:</h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Status</label>
                    <select
                      value={statusMap[ret.id] || ret.status}
                      onChange={(e) => setStatusMap({ ...statusMap, [ret.id]: e.target.value })}
                      className="input text-xs"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approve Return</option>
                      <option value="rejected">Reject Return</option>
                      <option value="item_picked">Item Picked Up</option>
                      <option value="refund_processed">Refund Processed (Send 2-3 Days Bank Credit Email)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Txn / UTR Ref</label>
                    <input
                      type="text"
                      placeholder="e.g. UTR12345678"
                      value={txnMap[ret.id] !== undefined ? txnMap[ret.id] : (ret.refundTransactionId || '')}
                      onChange={(e) => setTxnMap({ ...txnMap, [ret.id]: e.target.value })}
                      className="input text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Admin Comment</label>
                    <input
                      type="text"
                      placeholder="Comment..."
                      value={commentMap[ret.id] !== undefined ? commentMap[ret.id] : (ret.adminComment || '')}
                      onChange={(e) => setCommentMap({ ...commentMap, [ret.id]: e.target.value })}
                      className="input text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-gray-400 italic">
                    ℹ️ Email will be sent to {ret.buyer?.email} automatically.
                  </span>
                  <button
                    onClick={() => handleUpdateStatus(ret.id)}
                    disabled={updatingId === ret.id}
                    className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 font-bold shadow-xs"
                  >
                    <FiSend size={12} /> Save Status & Notify
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 text-center py-16">
          <FiRotateCcw size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No return requests found across the platform.</p>
        </div>
      )}
    </div>
  );
};

export default AdminReturnsPage;
