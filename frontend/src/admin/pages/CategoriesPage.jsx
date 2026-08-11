import { useState, useEffect } from 'react';
import { 
  FiPlus, FiTrash2, FiEdit2, FiFolder, FiImage, FiCheck, FiX, 
  FiCornerDownRight, FiLayers, FiList, FiGrid, FiChevronDown, FiChevronRight, FiSearch
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { adminCategoryAPI } from '../services/adminApi';
import Loader from '../../components/common/Loader';
import { getImageUrl } from '../../utils/helpers';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentId: '',
    sortOrder: 0,
    showInNavbar: true,
    icon: '',
    image: null,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await adminCategoryAPI.getAll();
      setCategories(res.data.data.categories || []);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', parentId: '', sortOrder: 0, showInNavbar: true, icon: '', image: null });
    setImagePreview(null);
    setShowAddForm(false);
    setEditingCategory(null);
  };

  const handleOpenAddForm = (parentId = '') => {
    resetForm();
    setFormData((prev) => ({ ...prev, parentId }));
    setShowAddForm(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name) return toast.error('Category name is required');
    try {
      await adminCategoryAPI.create(formData);
      toast.success(formData.parentId ? 'Subcategory created successfully!' : 'Parent category created!');
      resetForm();
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create category');
    }
  };

  const handleEditClick = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      description: category.description || '',
      parentId: category.parentId || '',
      sortOrder: category.sortOrder || 0,
      showInNavbar: category.showInNavbar !== false,
      icon: category.icon || '',
      image: null,
    });
    setImagePreview(category.image ? getImageUrl(category.image) : null);
    setShowAddForm(true);
  };

  const handleToggleNavbar = async (category) => {
    try {
      const nextVal = !category.showInNavbar;
      await adminCategoryAPI.update(category.id, { showInNavbar: nextVal });
      toast.success(`"${category.name}" ${nextVal ? 'will now show' : 'is now hidden from'} Navbar Sub-Header`);
      fetchCategories();
    } catch {
      toast.error('Failed to update category navbar visibility');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingCategory) return;
    try {
      await adminCategoryAPI.update(editingCategory.id, formData);
      toast.success('Category updated successfully!');
      resetForm();
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update category');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"? Any subcategories under it will also be affected.`)) return;
    try {
      await adminCategoryAPI.delete(id);
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch {
      toast.error('Failed to delete category');
    }
  };

  // Organize Categories into Parent & Subcategory Hierarchy
  const parentCategories = categories.filter((c) => !c.parentId);
  const subcategoriesMap = {};
  categories.forEach((c) => {
    if (c.parentId) {
      if (!subcategoriesMap[c.parentId]) subcategoriesMap[c.parentId] = [];
      subcategoriesMap[c.parentId].push(c);
    }
  });

  // Filter Categories by Search
  const filteredParents = parentCategories.filter((parent) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchParent = parent.name.toLowerCase().includes(q);
    const subs = subcategoriesMap[parent.id] || [];
    const matchSub = subs.some((s) => s.name.toLowerCase().includes(q));
    return matchParent || matchSub;
  });

  if (loading) return <Loader fullScreen />;

  return (
    <div className="p-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <FiLayers className="text-primary-600 dark:text-primary-400" size={26} />
            Categories & Subcategories Management
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Organize main shopping categories and subcategories displayed in the website hover dropdown menu
          </p>
        </div>
        <button
          onClick={() => {
            if (showAddForm) resetForm();
            else handleOpenAddForm('');
          }}
          className="btn-primary text-xs font-extrabold py-2.5 px-4 flex items-center gap-2 rounded-xl shadow-md"
        >
          {showAddForm ? <FiX size={16} /> : <FiPlus size={16} />}
          {showAddForm ? 'Close Form' : 'Add Main Category'}
        </button>
      </div>

      {/* Add / Edit Form Modal/Drawer */}
      {showAddForm && (
        <form
          onSubmit={editingCategory ? handleUpdate : handleCreate}
          className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-xl border border-primary-200 dark:border-primary-800 space-y-4 animate-scale-up"
        >
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
            <h3 className="font-black text-base text-gray-900 dark:text-white flex items-center gap-2">
              <FiFolder className="text-primary-600" />
              {editingCategory
                ? `Edit Category: ${editingCategory.name}`
                : formData.parentId
                ? `Add New Subcategory under "${categories.find((c) => c.id === formData.parentId)?.name || 'Parent'}"`
                : 'Create New Main Shopping Category'}
            </h3>
            <button type="button" onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <FiX size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-extrabold text-gray-800 dark:text-gray-200 mb-1">Category / Subcategory Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input font-semibold"
                placeholder="e.g. Smartwatches, Men's Clothing, Electronics"
                required
              />
            </div>

            <div>
              <label className="block font-extrabold text-gray-800 dark:text-gray-200 mb-1">Parent Category Selection</label>
              <select
                value={formData.parentId}
                onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                className="input font-semibold"
              >
                <option value="">📁 None (Main Top-Level Category)</option>
                {parentCategories
                  .filter((c) => !editingCategory || c.id !== editingCategory.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      ↳ Subcategory under: {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block font-extrabold text-gray-800 dark:text-gray-200 mb-1">Description (Optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input font-medium"
                placeholder="Brief summary of products in this category..."
                rows={2}
              />
            </div>

            <div>
              <label className="block font-extrabold text-gray-800 dark:text-gray-200 mb-1">Display Sort Order</label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                className="input font-semibold"
              />
            </div>

            <div>
              <label className="block font-extrabold text-gray-800 dark:text-gray-200 mb-1">Category Icon Emoji</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="input font-semibold text-center text-lg w-16"
                  placeholder="📱"
                />
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-1">
                  {['💻', '👕', '📱', '🛋️', '💄', '🧸', '🏏', '📺', '👟', '🛒', '🪖', '📚', '🎮', '⌚', '🛵', '⚡'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: emoji })}
                      className="w-7 h-7 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-primary-100 dark:hover:bg-gray-700 text-xs flex items-center justify-center transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block font-extrabold text-gray-800 dark:text-gray-200 mb-1">Category Image File Upload</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="input text-xs file:mr-3 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-primary-50 file:text-primary-600"
              />
              {imagePreview && (
                <div className="mt-2 w-14 h-14 rounded-2xl border overflow-hidden bg-gray-50 p-1">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                </div>
              )}
            </div>

            <div className="md:col-span-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showInNavbar}
                  onChange={(e) => setFormData({ ...formData, showInNavbar: e.target.checked })}
                  className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                />
                <span className="font-extrabold text-xs text-gray-900 dark:text-white">
                  📌 Show in Sub-Header Navbar Bar (Desktop Header Navigation)
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <button type="button" onClick={resetForm} className="btn-ghost py-2 px-4 text-xs">
              Cancel
            </button>
            <button type="submit" className="btn-primary py-2.5 px-6 text-xs font-black shadow-md">
              {editingCategory ? 'Update Category' : 'Save Category'}
            </button>
          </div>
        </form>
      )}

      {/* Filter / Search Bar */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories or subcategories..."
            className="input pl-10 text-xs py-2.5"
          />
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        </div>
        <p className="text-xs font-bold text-gray-400">
          Main Categories: {parentCategories.length} | Subcategories: {Object.values(subcategoriesMap).flat().length}
        </p>
      </div>

      {/* 📁 HIERARCHICAL PARENT CATEGORY CARDS WITH NESTED SUBCATEGORIES */}
      <div className="space-y-4">
        {filteredParents.length > 0 ? (
          filteredParents.map((parent) => {
            const subs = subcategoriesMap[parent.id] || [];
            return (
              <div
                key={parent.id}
                className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all space-y-3"
              >
                {/* Parent Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-gray-800 p-2 border border-primary-100 dark:border-gray-700 flex items-center justify-center text-xl flex-shrink-0">
                      {parent.image ? (
                        <img src={getImageUrl(parent.image)} alt={parent.name} className="max-h-full max-w-full object-contain" />
                      ) : (
                        '📁'
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-base text-gray-900 dark:text-white">{parent.name}</h3>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                          Main Category
                        </span>
                        {parent.showInNavbar !== false ? (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                            📌 In Navbar
                          </span>
                        ) : (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                            👁️ Hidden
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">Slug: /{parent.slug}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleNavbar(parent)}
                      className={`px-2.5 py-1.5 rounded-xl font-extrabold text-xs transition-colors flex items-center gap-1 border ${
                        parent.showInNavbar !== false
                          ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                          : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                      }`}
                      title="Toggle Navbar Display"
                    >
                      {parent.showInNavbar !== false ? '📌 In Navbar' : '➕ Add to Navbar'}
                    </button>
                    <button
                      onClick={() => handleOpenAddForm(parent.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs hover:bg-emerald-100 transition-colors flex items-center gap-1 border border-emerald-200 dark:border-emerald-800"
                    >
                      <FiPlus size={14} /> Add Subcategory
                    </button>
                    <button
                      onClick={() => handleEditClick(parent)}
                      className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      title="Edit Category"
                    >
                      <FiEdit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(parent.id, parent.name)}
                      className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      title="Delete Category"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Subcategories List */}
                <div>
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
                    <FiCornerDownRight className="text-primary-500" size={14} /> Subcategories ({subs.length})
                  </h4>

                  {subs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                      {subs.map((sub) => (
                        <div
                          key={sub.id}
                          className="bg-gray-50/80 dark:bg-gray-800/40 rounded-2xl p-3 border border-gray-200/70 dark:border-gray-700/60 flex items-center justify-between gap-2 group hover:border-primary-300 transition-all"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs text-primary-500 font-extrabold">↳</span>
                            <div className="min-w-0">
                              <p className="font-extrabold text-xs text-gray-900 dark:text-white truncate">{sub.name}</p>
                              <p className="text-[10px] text-gray-400 font-mono truncate">/{sub.slug}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditClick(sub)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Edit Subcategory"
                            >
                              <FiEdit2 size={12} />
                            </button>
                            <button
                              onClick={() => handleDelete(sub.id, sub.name)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Delete Subcategory"
                            >
                              <FiTrash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50/50 dark:bg-gray-800/20 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 text-xs text-gray-400 flex items-center justify-between">
                      <span>No subcategories created for "{parent.name}" yet.</span>
                      <button
                        onClick={() => handleOpenAddForm(parent.id)}
                        className="text-primary-600 font-bold hover:underline"
                      >
                        + Create First Subcategory
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 text-gray-400">
            <FiLayers size={36} className="mx-auto mb-2 opacity-50" />
            <p className="font-extrabold text-sm text-gray-800 dark:text-gray-200">No shopping categories found</p>
            <p className="text-xs text-gray-400 mt-1">Click "+ Add Main Category" above to build your marketplace catalog.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
