import { useState, useEffect } from 'react';
import {
  FiPercent, FiPlus, FiEdit3, FiTrash2, FiCalendar, FiTag,
  FiDollarSign, FiUsers, FiCheckCircle, FiXCircle, FiCopy,
  FiPackage, FiSearch, FiX
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { promoAPI } from '../../services/api';
import { formatDate } from '../../utils/helpers';

const formatPrice = (price) => `₹${parseFloat(price || 0).toLocaleString('en-IN')}`;

const AdminPromosPage = () => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    code: '', description: '', discountType: 'percentage', discountValue: '',
    minOrderAmount: '', maxDiscount: '', usageLimit: '', perUserLimit: '1',
    startDate: '', endDate: '',
  });

  useEffect(() => { fetchPromos(); }, []);

  const fetchPromos = async () => {
    try {
      const res = await promoAPI.getAll();
      setPromos(res.data.data.promos);
    } catch { /* silent */ } finally { setLoading(false); }
  };

  const resetForm = () => {
    setFormData({
      code: '', description: '', discountType: 'percentage', discountValue: '',
      minOrderAmount: '', maxDiscount: '', usageLimit: '', perUserLimit: '1',
      startDate: '', endDate: '',
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
      };
      if (editingId) {
        await promoAPI.update(editingId, payload);
        toast.success('Promo code updated!');
      } else {
        await promoAPI.create(payload);
        toast.success('Global promo code created!');
      }
      resetForm();
      fetchPromos();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save');
    }
  };

  const handleEdit = (promo) => {
    setFormData({
      code: promo.code, description: promo.description || '',
      discountType: promo.discountType, discountValue: promo.discountValue,
      minOrderAmount: promo.minOrderAmount || '', maxDiscount: promo.maxDiscount || '',
      usageLimit: promo.usageLimit || '', perUserLimit: promo.perUserLimit || '1',
      startDate: promo.startDate ? promo.startDate.slice(0, 10) : '',
      endDate: promo.endDate ? promo.endDate.slice(0, 10) : '',
    });
    setEditingId(promo.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this promo code?')) return;
    try {
      await promoAPI.delete(id);
      toast.success('Deleted!');
      fetchPromos();
    } catch (error) { toast.error('Failed to delete'); }
  };

  const handleToggle = async (promo) => {
    try {
      await promoAPI.update(promo.id, { isActive: !promo.isActive });
      toast.success(promo.isActive ? 'Deactivated' : 'Activated');
      fetchPromos();
    } catch { toast.error('Failed'); }
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'INDU';
    for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    setFormData({ ...formData, code });
  };

  const copyCode = (code) => { navigator.clipboard.writeText(code); toast.success(`Copied: ${code}`); };
  const isExpired = (p) => p.endDate && new Date(p.endDate) < new Date();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promo Codes</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all promo codes across the platform</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="btn-primary flex items-center gap-2">
          {showForm ? <><FiX size={16} /> Cancel</> : <><FiPlus size={16} /> Create Global Promo</>}
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiTag className="text-orange-500" /> {editingId ? 'Edit Promo' : 'New Global Promo Code'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="input-label">Promo Code *</label>
                <div className="flex gap-2">
                  <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. INDUSALE50" className="input flex-1 uppercase font-bold" required />
                  <button type="button" onClick={generateCode} className="px-3 py-2 bg-gray-100 text-gray-600 font-bold text-xs rounded-xl hover:bg-gray-200">
                    Generate
                  </button>
                </div>
              </div>
              <div>
                <label className="input-label">Type</label>
                <select value={formData.discountType} onChange={(e) => setFormData({ ...formData, discountType: e.target.value })} className="input">
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed (₹)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="input-label">Value *</label>
                <input type="number" value={formData.discountValue} onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  className="input" min="1" required />
              </div>
              <div>
                <label className="input-label">Min Order (₹)</label>
                <input type="number" value={formData.minOrderAmount} onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })} className="input" min="0" />
              </div>
              {formData.discountType === 'percentage' && (
                <div>
                  <label className="input-label">Max Discount (₹)</label>
                  <input type="number" value={formData.maxDiscount} onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })} className="input" min="1" />
                </div>
              )}
            </div>
            <div>
              <label className="input-label">Description</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input min-h-[60px]" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><label className="input-label">Start</label><input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="input" /></div>
              <div><label className="input-label">End</label><input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="input" /></div>
              <div><label className="input-label">Total Limit</label><input type="number" value={formData.usageLimit} onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })} className="input" placeholder="∞" /></div>
              <div><label className="input-label">Per User</label><input type="number" value={formData.perUserLimit} onChange={(e) => setFormData({ ...formData, perUserLimit: e.target.value })} className="input" placeholder="1" /></div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary px-6">{editingId ? 'Update' : 'Create'}</button>
              <button type="button" onClick={resetForm} className="px-6 py-2 bg-gray-100 text-gray-600 font-bold text-sm rounded-xl hover:bg-gray-200">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Codes', value: promos.length, color: 'text-blue-600 bg-blue-50' },
          { label: 'Active', value: promos.filter(p => p.isActive && !isExpired(p)).length, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Expired', value: promos.filter(p => isExpired(p)).length, color: 'text-red-600 bg-red-50' },
          { label: 'Total Used', value: promos.reduce((s, p) => s + (p.usedCount || 0), 0), color: 'text-purple-600 bg-purple-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-2xl font-black text-gray-900">{s.value}</p>
            <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 px-2 py-0.5 rounded-full inline-block ${s.color}`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Promo List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Code</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Discount</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase hidden md:table-cell">Min Order</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase hidden lg:table-cell">Created By</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Usage</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {promos.map((promo) => (
                <tr key={promo.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-gray-900 tracking-wider">{promo.code}</span>
                      <button onClick={() => copyCode(promo.code)} className="text-gray-300 hover:text-gray-500"><FiCopy size={12} /></button>
                    </div>
                    {promo.description && <p className="text-[10px] text-gray-400 mt-0.5 max-w-[200px] truncate">{promo.description}</p>}
                  </td>
                  <td className="px-5 py-3 font-bold text-gray-900">
                    {promo.discountType === 'percentage' ? `${promo.discountValue}%` : formatPrice(promo.discountValue)}
                    {promo.maxDiscount && <span className="text-[10px] text-gray-400 block">max {formatPrice(promo.maxDiscount)}</span>}
                  </td>
                  <td className="px-5 py-3 text-gray-600 hidden md:table-cell">
                    {promo.minOrderAmount ? formatPrice(promo.minOrderAmount) : '—'}
                  </td>
                  <td className="px-5 py-3 text-gray-600 hidden lg:table-cell">
                    {promo.seller ? (
                      <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold">{promo.seller.storeName || promo.seller.name}</span>
                    ) : (
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">Global</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {promo.usedCount || 0}{promo.usageLimit ? `/${promo.usageLimit}` : ''}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                      isExpired(promo) ? 'text-red-600 bg-red-50' : promo.isActive ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'
                    }`}>
                      {isExpired(promo) ? 'Expired' : promo.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleToggle(promo)} className={`p-1.5 rounded-lg transition-colors ${promo.isActive ? 'hover:bg-amber-50 text-amber-500' : 'hover:bg-emerald-50 text-emerald-500'}`}>
                        {promo.isActive ? <FiXCircle size={14} /> : <FiCheckCircle size={14} />}
                      </button>
                      <button onClick={() => handleEdit(promo)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"><FiEdit3 size={14} /></button>
                      <button onClick={() => handleDelete(promo.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><FiTrash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {promos.length === 0 && (
          <div className="text-center py-16">
            <FiPercent size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No promo codes yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPromosPage;
