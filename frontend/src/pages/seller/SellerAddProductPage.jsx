import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiX, FiImage, FiTag, FiDollarSign, FiBox, FiFileText, FiLayers, FiRotateCcw } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { productAPI, categoryAPI } from '../../services/api';

const SellerAddProductPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    mrp: '',
    stock: '',
    categoryId: '',
    brand: '',
    images: [],
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryAPI.getAll();
        setCategories(res.data.data.categories);
      } catch {
        toast.error('Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    setFormData({ ...formData, images: files });

    // Generate previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.mrp || !formData.categoryId || !formData.stock) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (parseFloat(formData.price) > parseFloat(formData.mrp)) {
      toast.error('Selling price cannot exceed MRP');
      return;
    }

    setLoading(true);
    try {
      await productAPI.create(formData);
      toast.success('🎉 Product added successfully!');
      navigate('/seller/products');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  const discount = formData.price && formData.mrp && parseFloat(formData.mrp) > 0
    ? Math.round(((parseFloat(formData.mrp) - parseFloat(formData.price)) / parseFloat(formData.mrp)) * 100)
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-sm text-gray-500 mt-1">Fill in the details to list a new product on the marketplace</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FiFileText size={18} className="text-emerald-500" /> Basic Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="input-label">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input"
                placeholder="e.g., Wireless Bluetooth Headphones"
                required
              />
            </div>
            <div>
              <label className="input-label">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input min-h-[120px] resize-none"
                placeholder="Describe your product in detail — features, specifications, what's included..."
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Brand</label>
                <div className="relative group">
                  <FiTag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="Brand name"
                  />
                </div>
              </div>
              <div>
                <label className="input-label">Category *</label>
                <div className="relative group">
                  <FiLayers className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    className="input pl-10"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FiDollarSign size={18} className="text-emerald-500" /> Pricing & Stock
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="input-label">Selling Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="input"
                placeholder="999"
                min="0"
                required
              />
            </div>
            <div>
              <label className="input-label">MRP (₹) *</label>
              <input
                type="number"
                name="mrp"
                value={formData.mrp}
                onChange={handleChange}
                className="input"
                placeholder="1499"
                min="0"
                required
              />
            </div>
            <div>
              <label className="input-label">Stock Quantity *</label>
              <div className="relative group">
                <FiBox className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="100"
                  min="0"
                  required
                />
              </div>
            </div>
          </div>
          {discount > 0 && (
            <div className="mt-4 p-3 bg-emerald-50 rounded-xl flex items-center gap-2">
              <span className="text-emerald-600 text-sm font-semibold">💰 {discount}% discount</span>
              <span className="text-emerald-500 text-xs">
                — Customers save ₹{(parseFloat(formData.mrp) - parseFloat(formData.price)).toLocaleString('en-IN')}
              </span>
            </div>
          )}
        </div>

        {/* Return & Warranty Policy */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FiRotateCcw size={18} className="text-emerald-500" /> Return & Warranty Policy
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Return & Refund Policy</label>
              <select
                name="returnPolicy"
                value={formData.returnPolicy || '7 Days Replacement & Refund'}
                onChange={handleChange}
                className="input"
              >
                <option value="7 Days Replacement & Refund">7 Days Replacement & Refund</option>
                <option value="10 Days Returnable & Bank Refund">10 Days Returnable & Bank Refund</option>
                <option value="15 Days Free Return & Refund">15 Days Free Return & Refund</option>
                <option value="Non-Returnable">Non-Returnable</option>
              </select>
            </div>
            <div>
              <label className="input-label">Warranty Policy</label>
              <input
                type="text"
                name="warrantyPolicy"
                value={formData.warrantyPolicy || '1 Year Brand Warranty'}
                onChange={handleChange}
                className="input"
                placeholder="e.g. 1 Year Brand Warranty"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FiImage size={18} className="text-emerald-500" /> Product Images
          </h3>
          <p className="text-xs text-gray-400 mb-4">Upload up to 5 high-quality images. First image will be the main product image.</p>

          {previews.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-4">
              {previews.map((preview, i) => (
                <div key={i} className="relative aspect-square bg-surface-50 rounded-xl overflow-hidden border-2 border-gray-100 group">
                  <img src={preview} alt="" className="w-full h-full object-contain p-2" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiX size={12} />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 text-[9px] font-bold uppercase bg-emerald-500 text-white px-1.5 py-0.5 rounded">
                      Main
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : null}

          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer bg-surface-50 hover:bg-gray-100 hover:border-emerald-300 transition-all">
            <FiUpload size={24} className="text-gray-400 mb-2" />
            <span className="text-sm font-medium text-gray-500">Click to upload images</span>
            <span className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP — Max 5 images</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </label>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-8 py-3 text-base shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:translate-y-[-1px] transition-all bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Publishing...
              </span>
            ) : (
              '🚀 Publish Product'
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/seller/products')}
            className="btn-ghost px-6 py-3"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default SellerAddProductPage;
