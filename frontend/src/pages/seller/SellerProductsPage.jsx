import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiTrash2, FiEye, FiPlus, FiShoppingBag } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { productAPI } from '../../services/api';
import { formatPrice, getImageUrl } from '../../utils/helpers';

const SellerProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await productAPI.getSellerProducts({ limit: 100 });
      setProducts(res.data.data.products);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productAPI.delete(id);
      toast.success('Product deleted');
      setProducts(products.filter(p => p.id !== id));
    } catch {
      toast.error('Failed to delete product');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
          <p className="text-sm text-gray-500">Manage all your listed products</p>
        </div>
        <Link to="/seller/add-product" className="btn-primary flex items-center gap-2">
          <FiPlus size={16} /> Add Product
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      ) : products.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Price</th>
                <th className="px-6 py-4 text-right">MRP</th>
                <th className="px-6 py-4 text-right">Stock</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-surface-50 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={getImageUrl(p.images?.[0])} alt="" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 line-clamp-1 max-w-[200px]">{p.name}</p>
                        {p.brand && <p className="text-xs text-gray-400">{p.brand}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{p.category?.name || '—'}</td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">{formatPrice(p.price)}</td>
                  <td className="px-6 py-4 text-right text-gray-500 line-through">{formatPrice(p.mrp)}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-semibold ${p.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`badge-${p.isActive ? 'success' : 'danger'}`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link to={`/product/${p.slug}`} className="text-gray-400 hover:text-primary-500 p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="View">
                        <FiEye size={16} />
                      </Link>
                      <button onClick={() => handleDelete(p.id)} className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="Delete">
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 text-center py-20">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiShoppingBag size={28} className="text-emerald-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">No products yet</h3>
          <p className="text-gray-400 text-sm mb-4">Start by adding your first product to the marketplace</p>
          <Link to="/seller/add-product" className="btn-primary">Add Your First Product</Link>
        </div>
      )}
    </div>
  );
};

export default SellerProductsPage;
