import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiEdit2, FiStar, FiShoppingBag, FiEye, FiX, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { adminProductAPI, adminCategoryAPI } from '../services/adminApi';
import { formatPrice, getImageUrl } from '../../utils/helpers';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    mrp: '',
    stock: '',
    categoryId: '',
    brand: '',
    isFeatured: false,
    isActive: true,
    images: [],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        adminProductAPI.getAll({ limit: 100 }),
        adminCategoryAPI.getAll(),
      ]);
      setProducts(pRes.data.data.products || []);
      setCategories(cRes.data.data.categories || []);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      mrp: '',
      stock: '',
      categoryId: '',
      brand: '',
      isFeatured: false,
      isActive: true,
      isCodAvailable: true,
      isFreeDelivery: true,
      warrantyPolicy: '90-day warranty',
      returnPolicy: '10-Day Return',
      minOrderQuantity: 1,
      specificationsText: '',
      qaText: '',
      images: [],
    });
    setShowAddForm(false);
    setEditingProduct(null);
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    let specStr = '';
    if (product.specifications && typeof product.specifications === 'object') {
      const filteredSpecs = { ...product.specifications };
      delete filteredSpecs.qaText;
      specStr = Object.entries(filteredSpecs).map(([k, v]) => `${k}: ${v}`).join(' | ');
    }
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      mrp: product.mrp || '',
      stock: product.stock || '',
      categoryId: product.categoryId || '',
      brand: product.brand || '',
      isFeatured: !!product.isFeatured,
      isActive: !!product.isActive,
      isCodAvailable: product.isCodAvailable !== false,
      isFreeDelivery: product.isFreeDelivery !== false,
      warrantyPolicy: product.warrantyPolicy || '90-day warranty',
      returnPolicy: product.returnPolicy || '10-Day Return',
      minOrderQuantity: product.minOrderQuantity || 1,
      specificationsText: specStr,
      qaText: product.specifications?.qaText || '',
      images: [],
    });
    setShowAddForm(true);
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.mrp || !formData.categoryId || formData.stock === '') {
      return toast.error('Please fill in all required fields');
    }

    try {
      let specsObj = {};
      if (formData.specificationsText) {
        formData.specificationsText.split('|').forEach(part => {
          const [k, v] = part.split(':');
          if (k && v) specsObj[k.trim()] = v.trim();
        });
      }
      if (formData.qaText) {
        specsObj.qaText = formData.qaText;
      }

      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === 'images') {
          formData.images.forEach((img) => payload.append('images', img));
        } else if (key !== 'specificationsText') {
          payload.append(key, formData[key]);
        }
      });
      payload.append('specifications', JSON.stringify(specsObj));

      if (editingProduct) {
        await adminProductAPI.update(editingProduct.id, payload);
        toast.success('Product updated successfully!');
      } else {
        await adminProductAPI.create(payload);
        toast.success('Product published successfully!');
      }
      resetForm();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleToggleFeatured = async (product) => {
    try {
      await adminProductAPI.update(product.id, { isFeatured: !product.isFeatured });
      toast.success(`Product ${!product.isFeatured ? 'marked as Featured' : 'removed from Featured'}`);
      fetchData();
    } catch {
      toast.error('Failed to update product status');
    }
  };

  const handleToggleActive = async (product) => {
    try {
      await adminProductAPI.update(product.id, { isActive: !product.isActive });
      toast.success(`Product ${!product.isActive ? 'activated' : 'deactivated'}`);
      fetchData();
    } catch {
      toast.error('Failed to update product status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product permanently?')) return;
    try {
      await adminProductAPI.delete(id);
      toast.success('Product deleted');
      setProducts(products.filter((p) => p.id !== id));
    } catch {
      toast.error('Failed to delete product');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage All Products</h1>
          <p className="text-sm text-gray-500">View, add, edit, and moderate marketplace products across all categories</p>
        </div>
        <button
          onClick={() => {
            if (showAddForm) resetForm();
            else setShowAddForm(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          {showAddForm ? <FiX size={16} /> : <FiPlus size={16} />}
          {showAddForm ? 'Close Form' : 'Add New Product'}
        </button>
      </div>

      {/* Add / Edit Product Form */}
      {showAddForm && (
        <form onSubmit={handleCreateOrUpdate} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 animate-slide-up">
          <h3 className="font-bold text-lg text-gray-900">
            {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Upload New Product (SuperAdmin)'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="input-label">Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                placeholder="e.g. ProBook Ultra Slim Laptop i7"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="input-label">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input min-h-[90px]"
                placeholder="Product specs, features, and details..."
                required
              />
            </div>

            <div>
              <label className="input-label">Selling Price (₹) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="input"
                placeholder="2999"
                required
              />
            </div>

            <div>
              <label className="input-label">MRP (₹) *</label>
              <input
                type="number"
                value={formData.mrp}
                onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                className="input"
                placeholder="5999"
                required
              />
            </div>

            <div>
              <label className="input-label">Stock Quantity *</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="input"
                placeholder="50"
                required
              />
            </div>

            <div>
              <label className="input-label">Category *</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="input"
                required
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="input-label">Brand Name</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="input"
                placeholder="e.g. Sony, Apple, Nike"
              />
            </div>

            <div>
              <label className="input-label">Minimum Order Quantity (MOQ)</label>
              <input
                type="number"
                min="1"
                value={formData.minOrderQuantity}
                onChange={(e) => setFormData({ ...formData, minOrderQuantity: parseInt(e.target.value) || 1 })}
                className="input"
                placeholder="Default: 1 unit"
              />
            </div>

            <div>
              <label className="input-label">Upload Product Images</label>
              <input
                type="file"
                multiple
                onChange={(e) => setFormData({ ...formData, images: Array.from(e.target.files) })}
                className="input text-xs"
              />
            </div>
          </div>

          {/* Policy & Availability Controls */}
          <div className="bg-gray-50 p-4 rounded-xl space-y-3 border border-gray-200/80">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Product Policies & Badges</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Warranty Policy Text</label>
                <input
                  type="text"
                  value={formData.warrantyPolicy}
                  onChange={(e) => setFormData({ ...formData, warrantyPolicy: e.target.value })}
                  className="input text-xs"
                  placeholder="e.g. 90-day warranty or 1 Year Warranty"
                />
              </div>
              <div>
                <label className="input-label">Return Policy Text</label>
                <input
                  type="text"
                  value={formData.returnPolicy}
                  onChange={(e) => setFormData({ ...formData, returnPolicy: e.target.value })}
                  className="input text-xs"
                  placeholder="e.g. 10-Day Return or 7 Days Replacement"
                />
              </div>
              <div className="col-span-2">
                <label className="input-label">Product Highlights & Specifications (e.g. Color: White, Blue | Material: Croslite | Sole: Croslite)</label>
                <input
                  type="text"
                  value={formData.specificationsText}
                  onChange={(e) => setFormData({ ...formData, specificationsText: e.target.value })}
                  className="input text-xs"
                  placeholder="Format: Key: Value | Key: Value (e.g. Color: White, Blue | Strap Material: Crosslite)"
                />
              </div>
              <div className="col-span-2">
                <label className="input-label">Product Questions & Answers (Format: Q: Question text | A: Answer text)</label>
                <textarea
                  value={formData.qaText || ''}
                  onChange={(e) => setFormData({ ...formData, qaText: e.target.value })}
                  className="input text-xs min-h-[60px]"
                  placeholder="e.g. Q: Is this original brand? | A: 100% Original Authentic Product | Q: Is COD available? | A: Yes Cash on Delivery Available"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-1">
              <label className="flex items-center gap-2 text-sm text-gray-800 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isCodAvailable}
                  onChange={(e) => setFormData({ ...formData, isCodAvailable: e.target.checked })}
                  className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4"
                />
                💵 Pay on Delivery (COD) Available
              </label>

              <label className="flex items-center gap-2 text-sm text-gray-800 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFreeDelivery}
                  onChange={(e) => setFormData({ ...formData, isFreeDelivery: e.target.checked })}
                  className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4"
                />
                🚚 Free Delivery
              </label>

              <label className="flex items-center gap-2 text-sm text-gray-800 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4"
                />
                ⭐ Mark as Featured
              </label>

              <label className="flex items-center gap-2 text-sm text-gray-800 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4"
                />
                🟢 Active in Marketplace
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn-primary">
              {editingProduct ? 'Update Product' : 'Publish Product'}
            </button>
            <button type="button" onClick={resetForm} className="btn-ghost">Cancel</button>
          </div>
        </form>
      )}

      {/* Products Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Price</th>
                <th className="px-6 py-4 text-right">Stock</th>
                <th className="px-6 py-4 text-center">Featured</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-surface-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center p-1 border">
                        {p.images?.[0] ? (
                          <img src={getImageUrl(p.images[0])} alt="" className="w-full h-full object-contain" />
                        ) : (
                          <FiShoppingBag size={20} className="text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 line-clamp-1 max-w-[200px]">{p.name}</p>
                        <p className="text-xs text-gray-400">
                          {p.brand || 'No Brand'} • Seller: {p.seller?.storeName || p.seller?.name || 'SuperAdmin'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                      {p.category?.name || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">
                    {formatPrice(p.price)}
                    {p.discount > 0 && (
                      <span className="block text-[10px] text-emerald-600 font-semibold">{p.discount}% OFF</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold">
                    <span className={p.stock > 0 ? 'text-gray-800' : 'text-red-500'}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleToggleFeatured(p)}
                      className={`p-2 rounded-xl transition-all ${
                        p.isFeatured ? 'text-amber-500 bg-amber-50' : 'text-gray-300 hover:text-amber-500 hover:bg-gray-50'
                      }`}
                      title="Toggle Featured"
                    >
                      <FiStar size={18} fill={p.isFeatured ? 'currentColor' : 'none'} />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleToggleActive(p)}
                      className={`px-3 py-1 text-xs rounded-full font-semibold transition-colors ${
                        p.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                      }`}
                    >
                      {p.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEditClick(p)}
                        className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Edit product"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete product"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    No products listed yet. Click "Add New Product" to publish your first product!
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

export default ProductsPage;
