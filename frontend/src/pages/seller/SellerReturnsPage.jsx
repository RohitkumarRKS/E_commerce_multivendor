import { useState, useEffect } from 'react';
import { FiRotateCcw, FiCheckCircle, FiXCircle, FiClock, FiDollarSign, FiUser, FiPackage, FiTruck, FiSend } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { returnAPI } from '../../services/api';
import { formatPrice, formatDate, getImageUrl } from '../../utils/helpers';

const SellerReturnsPage = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [statusMap, setStatusMap] = useState({});
  const [commentMap, setCommentMap] = useState({});
  const [txnMap, setTxnMap] = useState({});

  const fetchReturns = async () => {
    try {
      const res = await returnAPI.getSellerReturns();
      setReturns(res.data.data.returns || []);
    } catch (err) {
      console.error('Failed to load seller returns:', err);
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
      toast.success(`Return request updated to ${newStatus}! Email sent to buyer.`);
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
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/25">
            <FiRotateCcw size={20} />
          </div>
          Returns & Refund Management
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review buyer return requests, inspect bank details, and process refunds (2-3 working days credit notice)</p>
      </div>

      {/* List */}
      {returns.length > 0 ? (
        <div className="space-y-4">
          {returns.map((ret) => (
            <div key={ret.id} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <span className="text-xs font-bold text-gray-400">Order #{ret.order?.orderNumber}</span>
                  <p className="text-xs text-gray-500">Requested: {formatDate(ret.createdAt)}</p>
                </div>
                <div>
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

              {/* Product Info & Reason */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-xl p-1.5 border border-gray-100 dark:border-gray-700 flex-shrink-0">
                  <img src={getImageUrl(ret.orderItem?.product?.images?.[0])} alt="" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white">{ret.orderItem?.product?.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">Reason: <strong className="text-orange-600">{ret.reason}</strong></p>
                  {ret.details && <p className="text-xs text-gray-400 mt-0.5 font-sans italic">"{ret.details}"</p>}
                  <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-1">Refund Amount: {formatPrice(ret.refundAmount)}</p>
                </div>
              </div>

              {/* Buyer Bank Details Box */}
              <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/30 text-xs space-y-1">
                <h4 className="font-extrabold text-blue-900 dark:text-blue-300 flex items-center gap-1.5 mb-2">
                  <FiDollarSign className="text-blue-500" />
                  Buyer's Bank Refund Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-gray-700 dark:text-gray-300">
                  <p>Account Holder: <strong>{ret.accountHolderName}</strong></p>
                  <p>Bank: <strong>{ret.bankName}</strong></p>
                  <p>Account No: <strong className="font-mono">{ret.accountNumber}</strong></p>
                  <p>IFSC: <strong className="font-mono uppercase">{ret.ifscCode}</strong></p>
                  {ret.upiId && <p className="sm:col-span-2">UPI ID: <strong>{ret.upiId}</strong></p>}
                </div>
              </div>

              {/* Action Form */}
              <div className="bg-gray-50 dark:bg-gray-800/40 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 space-y-3">
                <h4 className="font-bold text-xs text-gray-800 dark:text-gray-200">Update Return Status & Notify Buyer:</h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Status</label>
                    <select
                      value={statusMap[ret.id] || ret.status}
                      onChange={(e) => setStatusMap({ ...statusMap, [ret.id]: e.target.value })}
                      className="input text-xs"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approve Return Request</option>
                      <option value="rejected">Reject Request</option>
                      <option value="item_picked">Item Picked Up</option>
                      <option value="refund_processed">Refund Processed (Send 2-3 Days Credit Email)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Transaction Ref / UTR (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. TXN98765432"
                      value={txnMap[ret.id] !== undefined ? txnMap[ret.id] : (ret.refundTransactionId || '')}
                      onChange={(e) => setTxnMap({ ...txnMap, [ret.id]: e.target.value })}
                      className="input text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Comment for Buyer</label>
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
                    ℹ️ Buyer will automatically receive an email update upon status change.
                  </span>
                  <button
                    onClick={() => handleUpdateStatus(ret.id)}
                    disabled={updatingId === ret.id}
                    className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 font-bold shadow-xs"
                  >
                    <FiSend size={12} /> Save & Send Email
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-center py-16">
          <FiRotateCcw size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No return requests from buyers yet.</p>
        </div>
      )}
    </div>
  );
};

export default SellerReturnsPage;
