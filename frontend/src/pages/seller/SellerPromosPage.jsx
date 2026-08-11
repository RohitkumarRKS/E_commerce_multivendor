import { useState, useEffect } from 'react';
import {
  FiPercent, FiPlus, FiEdit3, FiTrash2, FiCalendar, FiTag,
  FiDollarSign, FiUsers, FiCheckCircle, FiXCircle, FiCopy,
  FiPackage, FiSearch, FiX, FiArrowRight, FiShoppingBag
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { promoAPI, productAPI } from '../../services/api';
import { formatPrice, formatDate } from '../../utils/helpers';

const SellerPromosPage = () => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [products, setProducts] = useState([]);
  const [searchProduct, setSearchProduct] = useState('');
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: '',
    maxDiscount: '',
    usageLimit: '',
    perUserLimit: '1',
    startDate: '',
    endDate: '',
    productIds: [],
  });

  useEffect(() => {
    fetchPromos();
    fetchProducts();
  }, []);

  const fetchPromos = async () => {
    try {
      const res = await promoAPI.getAll();
      setPromos(res.data.data.promos);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await productAPI.getSellerProducts({ limit: 100 });
      setProducts(res.data.data.products || []);
    } catch { /* silent */ }
  };

  const resetForm = () => {
    setFormData({
      code: '', description: '', discountType: 'percentage', discountValue: '',
      minOrderAmount: '', maxDiscount: '', usageLimit: '', perUserLimit: '1',
      startDate: '', endDate: '', productIds: [],
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : 0,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        perUserLimit: formData.perUserLimit ? parseInt(formData.perUserLimit) : 1,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        productIds: formData.productIds.length > 0 ? formData.productIds : null,
      };

      if (editingId) {
        await promoAPI.update(editingId, payload);
        toast.success('Promo code updated!');
      } else {
        await promoAPI.create(payload);
        toast.success('Promo code created!');
      }
      resetForm();
      fetchPromos();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save promo code');
    }
  };

  const handleEdit = (promo) => {
    setFormData({
      code: promo.code,
      description: promo.description || '',
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      minOrderAmount: promo.minOrderAmount || '',
      maxDiscount: promo.maxDiscount || '',
      usageLimit: promo.usageLimit || '',
      perUserLimit: promo.perUserLimit || '1',
      startDate: promo.startDate ? promo.startDate.slice(0, 10) : '',
      endDate: promo.endDate ? promo.endDate.slice(0, 10) : '',
      productIds: promo.productIds || [],
    });
    setEditingId(promo.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this promo code?')) return;
    try {
      await promoAPI.delete(id);
      toast.success('Promo code deleted!');
      fetchPromos();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    }
  };

  const handleToggle = async (promo) => {
    try {
      await promoAPI.update(promo.id, { isActive: !promo.isActive });
      toast.success(promo.isActive ? 'Promo deactivated' : 'Promo activated');
      fetchPromos();
    } catch (error) {
      toast.error('Failed to toggle');
    }
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'INDU';
    for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    setFormData({ ...formData, code });
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied: ${code}`);
  };

  const toggleProductSelection = (productId) => {
    setFormData(prev => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter(id => id !== productId)
        : [...prev.productIds, productId],
    }));
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchProduct.toLowerCase())
  );

  const isExpired = (promo) => promo.endDate && new Date(promo.endDate) < new Date();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/25">
              <FiPercent size={20} />
            </div>
            Promo Codes
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create and manage discount codes for your products</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
        >
          {showForm ? <><FiX size={16} /> Cancel</> : <><FiPlus size={16} /> Create Promo</>}
        </button>
      </div>

      {/* ════════════════════════════════════════════ */}
      {/* CREATE / EDIT FORM */}
      {/* ════════════════════════════════════════════ */}
      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-6 animate-fade-in">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
            <FiTag className="text-orange-500" />
            {editingId ? 'Edit Promo Code' : 'Create New Promo Code'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Row 1: Code + Generate */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="input-label">Promo Code *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. SAVE20"
                    className="input flex-1 uppercase font-bold tracking-wider"
                    required
                  />
                  <button
                    type="button"
                    onClick={generateCode}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold text-xs rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors whitespace-nowrap"
                  >
                    Auto Generate
                  </button>
                </div>
              </div>
              <div>
                <label className="input-label">Discount Type *</label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  className="input"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>
            </div>

            {/* Row 2: Value + Min Order + Max Discount */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="input-label">
                  Discount Value * {formData.discountType === 'percentage' ? '(%)' : '(₹)'}
                </label>
                <input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  placeholder={formData.discountType === 'percentage' ? '10' : '100'}
                  className="input"
                  min="1"
                  max={formData.discountType === 'percentage' ? '90' : '999999'}
                  required
                />
              </div>
              <div>
                <label className="input-label">Min Order Amount (₹)</label>
                <input
                  type="number"
                  value={formData.minOrderAmount}
                  onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                  placeholder="499"
                  className="input"
                  min="0"
                />
              </div>
              {formData.discountType === 'percentage' && (
                <div>
                  <label className="input-label">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    placeholder="500"
                    className="input"
                    min="1"
                  />
                </div>
              )}
            </div>

            {/* Row 3: Description */}
            <div>
              <label className="input-label">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Get 20% off on all electronics! Valid till end of month."
                className="input min-h-[70px]"
              />
            </div>

            {/* Row 4: Dates + Limits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="input-label">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="input-label">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="input-label">Total Usage Limit</label>
                <input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  placeholder="Unlimited"
                  className="input"
                  min="1"
                />
              </div>
              <div>
                <label className="input-label">Per User Limit</label>
                <input
                  type="number"
                  value={formData.perUserLimit}
                  onChange={(e) => setFormData({ ...formData, perUserLimit: e.target.value })}
                  placeholder="1"
                  className="input"
                  min="1"
                />
              </div>
            </div>

            {/* Product Selection */}
            <div>
              <label className="input-label">Apply to Specific Products (optional — leave empty for all)</label>
              <div className="bg-surface-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2 mb-3">
                  <FiSearch size={14} className="text-gray-400" />
                  <input
                    type="text"
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    placeholder="Search your products..."
                    className="bg-transparent text-sm text-gray-700 dark:text-gray-200 focus:outline-none w-full placeholder-gray-400"
                  />
                  {formData.productIds.length > 0 && (
                    <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-full whitespace-nowrap">
                      {formData.productIds.length} selected
                    </span>
                  )}
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1 custom-scrollbar">
                  {filteredProducts.map((p) => (
                    <label
                      key={p.id}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                        formData.productIds.includes(p.id)
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.productIds.includes(p.id)}
                        onChange={() => toggleProductSelection(p.id)}
                        className="accent-emerald-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate">{p.name}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">{formatPrice(p.price)}</span>
                    </label>
                  ))}
                  {filteredProducts.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">No products found</p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-3 pt-2">
              <button type="submit" className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95">
                {editingId ? 'Update Promo Code' : 'Create Promo Code'}
              </button>
              <button type="button" onClick={resetForm} className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold text-sm rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ════════════════════════════════════════════ */}
      {/* PROMO CODES LIST */}
      {/* ════════════════════════════════════════════ */}
      {promos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {promos.map((promo) => (
            <div
              key={promo.id}
              className={`bg-white dark:bg-gray-900 rounded-2xl shadow-sm border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group ${
                isExpired(promo) ? 'border-red-200 dark:border-red-900/30 opacity-70' :
                promo.isActive ? 'border-gray-100 dark:border-gray-800' : 'border-amber-200 dark:border-amber-900/30 opacity-80'
              }`}
            >
              {/* Card Header */}
              <div className={`px-5 py-4 flex items-center justify-between ${
                isExpired(promo) ? 'bg-red-50 dark:bg-red-900/10' :
                promo.isActive ? 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10' :
                'bg-amber-50 dark:bg-amber-900/10'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                    isExpired(promo) ? 'bg-red-100 dark:bg-red-900/30 text-red-500' :
                    promo.isActive ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white' :
                    'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
                  }`}>
                    <FiPercent size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-base font-black text-gray-900 dark:text-white tracking-wider">{promo.code}</p>
                      <button onClick={() => copyCode(promo.code)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors opacity-0 group-hover:opacity-100">
                        <FiCopy size={12} />
                      </button>
                    </div>
                    <span className={`text-[10px] font-bold uppercase ${
                      isExpired(promo) ? 'text-red-500' : promo.isActive ? 'text-emerald-500' : 'text-amber-500'
                    }`}>
                      {isExpired(promo) ? 'Expired' : promo.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-gray-900 dark:text-white">
                    {promo.discountType === 'percentage' ? `${promo.discountValue}%` : formatPrice(promo.discountValue)}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase">
                    {promo.discountType === 'percentage' ? 'Percent Off' : 'Flat Off'}
                  </p>
                </div>
              </div>

              {/* Card Body */}
              <div className="px-5 py-4 space-y-2.5">
                {promo.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{promo.description}</p>
                )}

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                    <FiDollarSign size={12} className="text-gray-400" />
                    Min: {promo.minOrderAmount ? formatPrice(promo.minOrderAmount) : 'None'}
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                    <FiUsers size={12} className="text-gray-400" />
                    Used: {promo.usedCount || 0}{promo.usageLimit ? `/${promo.usageLimit}` : ''}
                  </div>
                  {promo.maxDiscount && (
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                      <FiTag size={12} className="text-gray-400" />
                      Max: {formatPrice(promo.maxDiscount)}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                    <FiCalendar size={12} className="text-gray-400" />
                    {promo.endDate ? formatDate(promo.endDate) : 'No expiry'}
                  </div>
                </div>

                {promo.productIds && promo.productIds.length > 0 && (
                  <div className="flex items-center gap-1.5 text-[10px] text-purple-500 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/10 px-2.5 py-1.5 rounded-lg">
                    <FiPackage size={11} />
                    Applied to {promo.productIds.length} product{promo.productIds.length > 1 ? 's' : ''}
                  </div>
                )}
              </div>

              {/* Card Actions */}
              <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
                <button
                  onClick={() => handleToggle(promo)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                    promo.isActive
                      ? 'bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 hover:bg-amber-100'
                      : 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
                  }`}
                >
                  {promo.isActive ? <><FiXCircle size={12} /> Deactivate</> : <><FiCheckCircle size={12} /> Activate</>}
                </button>
                <button
                  onClick={() => handleEdit(promo)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-all"
                >
                  <FiEdit3 size={12} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(promo.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all ml-auto"
                >
                  <FiTrash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-center py-16">
          <div className="w-20 h-20 bg-orange-50 dark:bg-orange-900/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <FiPercent size={32} className="text-orange-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">No Promo Codes Yet</h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-5 max-w-md mx-auto">Create your first promo code to offer discounts and boost sales.</p>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <FiPlus size={16} /> Create Your First Promo
          </button>
        </div>
      )}
    </div>
  );
};

export default SellerPromosPage;
