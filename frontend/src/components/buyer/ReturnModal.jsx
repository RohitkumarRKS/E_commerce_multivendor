import { useState } from 'react';
import { FiX, FiRefreshCw, FiAlertCircle, FiCheckCircle, FiClock, FiDollarSign } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { returnAPI } from '../../services/api';
import { formatPrice } from '../../utils/helpers';

const ReturnModal = ({ isOpen, onClose, orderItem, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    reason: 'Defective Product',
    details: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    upiId: '',
  });

  if (!isOpen || !orderItem) return null;

  const refundAmount = parseFloat(orderItem.price) * (orderItem.quantity || 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.accountHolderName || !formData.accountNumber || !formData.ifscCode || !formData.bankName) {
      toast.error('Please fill in all bank details');
      return;
    }

    setLoading(true);
    try {
      await returnAPI.request({
        orderItemId: orderItem.id,
        ...formData,
      });
      toast.success('Return & Refund request submitted! Money will be credited to bank in 2-3 working days after approval.');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit return request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <FiX size={20} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
            <FiRefreshCw size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900 dark:text-white">Request Return & Refund</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Direct Bank Account Credit within 2-3 Working Days</p>
          </div>
        </div>

        {/* Product Preview */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-3.5 border border-gray-100 dark:border-gray-800 mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-800 dark:text-gray-200 line-clamp-1">{orderItem.product?.name || 'Product'}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Qty: {orderItem.quantity} unit(s)</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{formatPrice(refundAmount)}</span>
            <span className="text-[10px] block text-gray-400 font-bold uppercase">Refund Amount</span>
          </div>
        </div>

        {/* Notice Banner */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200/70 dark:border-amber-800/40 rounded-2xl p-3.5 mb-5 flex items-start gap-2.5">
          <FiClock className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" size={16} />
          <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
            <strong>Refund Guarantee:</strong> Once approved and picked up, your refund of <strong>{formatPrice(refundAmount)}</strong> will be credited directly to your bank account within <strong>2 to 3 working days</strong>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Reason Selection */}
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Return Reason *</label>
            <select
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="input text-xs"
              required
            >
              <option value="Defective Product">Defective or Non-working Product</option>
              <option value="Wrong Item Delivered">Wrong Item Delivered</option>
              <option value="Quality Not as Expected">Quality Not as Expected</option>
              <option value="Damaged Packaging/Item">Damaged Packaging / Item</option>
              <option value="Size or Fitting Issue">Size or Fitting Issue</option>
              <option value="Changed Mind / No Longer Needed">Changed Mind / No Longer Needed</option>
            </select>
          </div>

          {/* Details */}
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Additional Details (Optional)</label>
            <textarea
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              placeholder="Describe the issue with the product..."
              className="input text-xs min-h-[60px]"
            />
          </div>

          {/* Bank Account Details Form */}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-3">
            <h4 className="font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5 text-xs">
              <FiDollarSign className="text-emerald-500" size={14} />
              Bank Account Details (For Refund Credit)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Account Holder Name *</label>
                <input
                  type="text"
                  required
                  value={formData.accountHolderName}
                  onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="input text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Bank Name *</label>
                <input
                  type="text"
                  required
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="e.g. HDFC Bank / SBI"
                  className="input text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Account Number *</label>
                <input
                  type="text"
                  required
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  placeholder="e.g. 5010023456789"
                  className="input text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">IFSC Code *</label>
                <input
                  type="text"
                  required
                  value={formData.ifscCode}
                  onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                  placeholder="e.g. HDFC0001234"
                  className="input text-xs font-mono uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">UPI ID (Optional)</label>
              <input
                type="text"
                value={formData.upiId}
                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                placeholder="e.g. rahul@upi / 9876543210@paytm"
                className="input text-xs"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary py-2.5 px-6 font-bold shadow-md hover:shadow-lg flex items-center gap-2"
            >
              {loading ? 'Submitting...' : 'Confirm Return & Refund'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReturnModal;
