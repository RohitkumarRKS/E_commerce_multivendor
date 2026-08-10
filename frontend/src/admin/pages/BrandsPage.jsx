import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiCheck, FiX, FiGlobe, FiEye, FiEyeOff, FiUploadCloud, FiLink, FiImage, FiInfo } from 'react-icons/fi';
import { brandAPI } from '../../services/api';
import { toast } from 'react-toastify';
import Loader from '../../components/common/Loader';
import { getImageUrl } from '../../utils/helpers';

const BrandsPage = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  // Dual Logo Input Options: 'file' or 'url'
  const [logoMode, setLogoMode] = useState('file');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    website: '',
    sortOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const res = await brandAPI.getAll();
      if (res.data?.data?.brands) {
        setBrands(res.data.data.brands);
      }
    } catch {
      toast.error('Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (brand = null) => {
    setLogoFile(null);
    setLogoPreview(null);
    if (brand) {
      setEditingBrand(brand);
      setFormData({
        name: brand.name,
        logo: brand.logo || '',
        website: brand.website || '',
        sortOrder: brand.sortOrder || 0,
        isActive: brand.isActive,
      });
      setLogoMode(brand.logo && !brand.logo.startsWith('/uploads/') ? 'url' : 'file');
      if (brand.logo) {
        setLogoPreview(getImageUrl(brand.logo));
      }
    } else {
      setEditingBrand(null);
      setFormData({
        name: '',
        logo: '',
        website: '',
        sortOrder: brands.length + 1,
        isActive: true,
      });
      setLogoMode('file');
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBrand(null);
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        return toast.error('File size must be under 2MB');
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return toast.error('Brand name is required');

    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('website', formData.website || '');
      payload.append('sortOrder', formData.sortOrder);
      payload.append('isActive', formData.isActive);

      if (logoMode === 'file' && logoFile) {
        payload.append('logoFile', logoFile);
      } else if (formData.logo) {
        payload.append('logo', formData.logo);
      }

      if (editingBrand) {
        await brandAPI.update(editingBrand.id, payload);
        toast.success('Brand updated successfully!');
      } else {
        await brandAPI.create(payload);
        toast.success('Brand added successfully!');
      }
      handleCloseModal();
      fetchBrands();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save brand');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete brand "${name}"?`)) return;
    try {
      await brandAPI.delete(id);
      toast.success('Brand deleted successfully');
      fetchBrands();
    } catch {
      toast.error('Failed to delete brand');
    }
  };

  const handleToggleActive = async (brand) => {
    try {
      await brandAPI.update(brand.id, { isActive: !brand.isActive });
      toast.success(`Brand ${brand.name} is now ${!brand.isActive ? 'Active' : 'Hidden'}`);
      fetchBrands();
    } catch {
      toast.error('Failed to toggle status');
    }
  };

  if (loading) return <Loader fullScreen />;

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Page Title Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            Trusted Brands Management
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Manage brand logos displayed in the "TRUSTED BRANDS ON MULTIVENDOR" showcase bar
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="btn-primary text-xs font-bold py-2.5 px-4 flex items-center gap-2 rounded-xl shadow-md"
        >
          <FiPlus size={16} /> Add New Brand
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mb-6 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search brands by name..."
            className="input pl-10 text-xs py-2.5"
          />
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        </div>
        <p className="text-xs font-bold text-gray-400">Total Brands: {brands.length}</p>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredBrands.map((brand) => (
          <div
            key={brand.id}
            className={`bg-white dark:bg-gray-900 rounded-2xl p-4 border transition-all shadow-sm flex flex-col justify-between ${
              brand.isActive ? 'border-gray-200 dark:border-gray-800' : 'border-red-200 bg-red-50/20 opacity-70'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">
                Order #{brand.sortOrder}
              </span>
              <button
                onClick={() => handleToggleActive(brand)}
                title={brand.isActive ? 'Active (Click to Hide)' : 'Hidden (Click to Activate)'}
                className={`p-1 rounded-lg ${brand.isActive ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400 bg-gray-100'}`}
              >
                {brand.isActive ? <FiEye size={14} /> : <FiEyeOff size={14} />}
              </button>
            </div>

            <div className="w-full h-16 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center p-2 mb-3 border border-gray-100 dark:border-gray-700">
              {brand.logo ? (
                <img src={getImageUrl(brand.logo)} alt={brand.name} className="max-h-full max-w-full object-contain" />
              ) : (
                <span className="text-xs font-bold text-gray-400">{brand.name}</span>
              )}
            </div>

            <h3 className="font-extrabold text-xs text-gray-900 dark:text-white text-center truncate mb-3">
              {brand.name}
            </h3>

            <div className="flex items-center justify-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => handleOpenModal(brand)}
                className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                title="Edit Brand"
              >
                <FiEdit2 size={13} />
              </button>
              <button
                onClick={() => handleDelete(brand.id, brand.name)}
                className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                title="Delete Brand"
              >
                <FiTrash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white">
                  {editingBrand ? 'Edit Brand' : 'Add New Brand'}
                </h3>
                <p className="text-xs text-gray-400">Configure brand name, logo image, and display order</p>
              </div>
              <button onClick={handleCloseModal} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full">
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-extrabold text-gray-800 dark:text-gray-200 mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sony, Apple, Nike"
                  className="input font-semibold"
                />
              </div>

              {/* 🖼️ DUAL LOGO INPUT OPTIONS (UPLOAD FILE vs IMAGE URL) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-extrabold text-gray-800 dark:text-gray-200">Brand Logo Image</label>
                  <div className="flex bg-gray-100 dark:bg-gray-800 p-0.5 rounded-xl border border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => setLogoMode('file')}
                      className={`px-3 py-1 text-[11px] font-extrabold rounded-lg flex items-center gap-1 transition-all ${
                        logoMode === 'file'
                          ? 'bg-primary-600 text-white shadow-xs'
                          : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                      }`}
                    >
                      <FiUploadCloud size={13} /> Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogoMode('url')}
                      className={`px-3 py-1 text-[11px] font-extrabold rounded-lg flex items-center gap-1 transition-all ${
                        logoMode === 'url'
                          ? 'bg-primary-600 text-white shadow-xs'
                          : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                      }`}
                    >
                      <FiLink size={13} /> Image URL
                    </button>
                  </div>
                </div>

                {/* 📐 RECOMMENDED SIZE & DIMENSIONS INDICATOR */}
                <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-2xl border border-blue-100 dark:border-blue-900/50 flex items-start gap-2.5">
                  <FiInfo className="text-primary-500 mt-0.5 flex-shrink-0" size={16} />
                  <div className="text-[11px] text-gray-600 dark:text-gray-300 leading-snug">
                    <p className="font-extrabold text-primary-700 dark:text-primary-300">Recommended Image Specifications:</p>
                    <p>• <strong>Dimensions:</strong> 200 × 200 pixels (1:1 Square ratio)</p>
                    <p>• <strong>Format:</strong> PNG, JPG, WebP, SVG (Transparent PNG recommended)</p>
                    <p>• <strong>Max File Size:</strong> 2 MB</p>
                  </div>
                </div>

                {/* FILE UPLOAD INPUT */}
                {logoMode === 'file' ? (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="input file:mr-3 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100"
                    />
                  </div>
                ) : (
                  /* IMAGE URL INPUT */
                  <div>
                    <input
                      type="text"
                      value={formData.logo}
                      onChange={(e) => {
                        setFormData({ ...formData, logo: e.target.value });
                        setLogoPreview(e.target.value);
                      }}
                      placeholder="https://brandwebsite.com/logo.png"
                      className="input font-medium"
                    />
                  </div>
                )}

                {/* LIVE FIXED ASPECT RATIO PREVIEW BOX */}
                {logoPreview && (
                  <div className="pt-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Logo Preview (Fixed 1:1 Box)</p>
                    <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-center p-2 shadow-xs">
                      <img src={logoPreview} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-extrabold text-gray-800 dark:text-gray-200 mb-1">Website URL (Optional)</label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://brandwebsite.com"
                  className="input font-medium"
                />
              </div>

              <div>
                <label className="block font-extrabold text-gray-800 dark:text-gray-200 mb-1">Display Order</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  className="input font-semibold"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <label htmlFor="isActive" className="font-extrabold text-gray-800 dark:text-gray-200">
                  Active (Show in Showcase Bar)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button type="button" onClick={handleCloseModal} className="btn-ghost py-2.5 px-5 font-bold">
                  Cancel
                </button>
                <button type="submit" className="btn-primary py-2.5 px-6 font-extrabold shadow-md">
                  Save Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandsPage;
