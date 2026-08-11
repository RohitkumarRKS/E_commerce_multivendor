import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiImage, FiCheck, FiX, FiInfo, FiExternalLink } from 'react-icons/fi';
import { toast } from 'react-toastify';
import adminApi, { adminBannerAPI } from '../services/adminApi';

const BannersPage = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [newBanner, setNewBanner] = useState({
    title: '',
    subtitle: '',
    badge: '🎉 Special Offer',
    discount: 'Up to 70% OFF',
    linkUrl: '/search',
    bgColor: 'from-primary-600 via-primary-500 to-primary-700',
    image: null,
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await adminBannerAPI.getAll();
      setBanners(res.data.data.banners || []);
    } catch {
      try {
        const publicRes = await adminApi.get('/banners');
        setBanners(publicRes.data.data.banners || []);
      } catch {
        setBanners([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewBanner({ ...newBanner, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newBanner.title) {
      return toast.error('Banner title is required');
    }
    try {
      await adminBannerAPI.create(newBanner);
      toast.success('Banner created successfully!');
      setShowAddForm(false);
      setImagePreview(null);
      setNewBanner({
        title: '',
        subtitle: '',
        badge: '🎉 Special Offer',
        discount: 'Up to 70% OFF',
        linkUrl: '/search',
        bgColor: 'from-primary-600 via-primary-500 to-primary-700',
        image: null,
      });
      fetchBanners();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create banner');
    }
  };

  const handleToggleStatus = async (banner) => {
    try {
      await adminBannerAPI.update(banner.id, { isActive: !banner.isActive });
      toast.success(`Banner ${!banner.isActive ? 'activated' : 'deactivated'}`);
      fetchBanners();
    } catch {
      toast.error('Failed to update banner');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner permanently?')) return;
    try {
      await adminBannerAPI.delete(id);
      toast.success('Banner deleted');
      setBanners(banners.filter((b) => b.id !== id));
    } catch {
      toast.error('Failed to delete banner');
    }
  };

  const gradientOptions = [
    { label: 'Royal Blue', value: 'from-primary-600 via-primary-500 to-primary-700' },
    { label: 'Sunset Orange', value: 'from-amber-500 via-orange-500 to-red-600' },
    { label: 'Emerald Teal', value: 'from-emerald-600 via-teal-500 to-cyan-600' },
    { label: 'Purple Galaxy', value: 'from-purple-600 via-indigo-600 to-blue-700' },
    { label: 'Midnight Dark', value: 'from-gray-900 via-gray-800 to-gray-950' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Banners & Offers</h1>
          <p className="text-sm text-gray-500">Upload hero slides, promotional offer banners between products, and sale badges</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus size={16} /> Add Banner
        </button>
      </div>

      {/* Recommended Dimensions Banner Note */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3 text-blue-900">
        <FiInfo size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm">Recommended Banner Size & Specifications</h4>
          <p className="text-xs text-blue-700 mt-1 leading-relaxed">
            • <strong>Hero Carousel:</strong> 1200 × 400 px (3:1 ratio). Auto-plays every <strong>5 seconds</strong>.<br />
            • <strong>In-Grid Offer Banner:</strong> 1200 × 200 px (6:1 ratio). Displays between products on the homepage.<br />
            • <strong>Format:</strong> PNG, JPG, or WebP (transparent background recommended for side graphic).
          </p>
        </div>
      </div>

      {/* Add Banner Form */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 animate-slide-up">
          <h3 className="font-bold text-lg text-gray-900">New Hero Banner</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Banner Title *</label>
              <input
                type="text"
                value={newBanner.title}
                onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                className="input"
                placeholder="e.g. Mega Summer Discount Sale!"
                required
              />
            </div>

            <div>
              <label className="input-label">Offer Badge Text</label>
              <input
                type="text"
                value={newBanner.badge}
                onChange={(e) => setNewBanner({ ...newBanner, badge: e.target.value })}
                className="input"
                placeholder="e.g. 🎉 Up to 80% OFF"
              />
            </div>

            <div className="col-span-2">
              <label className="input-label">Subtitle / Description</label>
              <input
                type="text"
                value={newBanner.subtitle}
                onChange={(e) => setNewBanner({ ...newBanner, subtitle: e.target.value })}
                className="input"
                placeholder="e.g. Discover unbeatable prices on electronics, fashion, and home appliances."
              />
            </div>

            <div>
              <label className="input-label">Target Link URL</label>
              <input
                type="text"
                value={newBanner.linkUrl}
                onChange={(e) => setNewBanner({ ...newBanner, linkUrl: e.target.value })}
                className="input"
                placeholder="/search or /category/electronics"
              />
            </div>

            <div>
              <label className="input-label">Banner Display Position *</label>
              <select
                value={newBanner.position || 'hero'}
                onChange={(e) => setNewBanner({ ...newBanner, position: e.target.value })}
                className="input"
              >
                <option value="hero">Hero Carousel Banner (Home Page)</option>
                <option value="offer_grid">In-Grid Offer Banner (Between Products)</option>
                <option value="promo_badge">Sub-Header Promo Sale Badge (Top Header Bar)</option>
              </select>
            </div>

            <div>
              <label className="input-label">Background Theme Style</label>
              <select
                value={newBanner.bgColor}
                onChange={(e) => setNewBanner({ ...newBanner, bgColor: e.target.value })}
                className="input"
              >
                {gradientOptions.map((g, i) => (
                  <option key={i} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="input-label">Banner Image (Recommended size: 1200 x 400 px)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="input text-xs"
              />
              {imagePreview && (
                <div className="mt-3 relative w-48 h-24 border rounded-xl overflow-hidden bg-gray-50">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary">Save & Publish Banner</button>
            <button type="button" onClick={() => setShowAddForm(false)} className="btn-ghost">Cancel</button>
          </div>
        </form>
      )}

      {/* Banners List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Banner</th>
                <th className="px-6 py-4">Badge / Offer</th>
                <th className="px-6 py-4">Position</th>
                <th className="px-6 py-4">Target Link</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {banners.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-14 h-10 rounded-lg flex items-center justify-center text-white bg-gradient-to-r ${b.bgColor} overflow-hidden shadow-sm flex-shrink-0`}>
                        {b.image ? (
                          <img src={`http://localhost:5000${b.image}`} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <FiImage size={18} />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{b.title}</p>
                        {b.subtitle && <p className="text-xs text-gray-400 line-clamp-1">{b.subtitle}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600">
                      {b.badge || b.discount || 'Special Offer'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                      b.position === 'offer_grid'
                        ? 'bg-purple-50 text-purple-600 border border-purple-200'
                        : b.position === 'promo_badge'
                        ? 'bg-teal-50 text-teal-600 border border-teal-200'
                        : 'bg-blue-50 text-blue-600 border border-blue-200'
                    }`}>
                      {b.position === 'offer_grid' ? '📦 In-Grid' : b.position === 'promo_badge' ? '🏷️ Promo' : '🖼️ Hero'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500 font-mono flex items-center gap-1">
                    {b.linkUrl} <FiExternalLink size={12} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleToggleStatus(b)}
                      className={`px-3 py-1 text-xs rounded-full font-semibold transition-colors ${
                        b.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {b.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="text-red-500 hover:text-red-700 p-2"
                      title="Delete banner"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {banners.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    No custom banners created yet. Built-in promo slides will be displayed on the Home Page hero slider.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BannersPage;
