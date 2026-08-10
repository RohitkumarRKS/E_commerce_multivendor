import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiUser, FiPackage, FiEdit3, FiMapPin, FiMail, FiPhone, FiCalendar, FiBriefcase, FiGrid, FiShoppingBag, FiHeart, FiSettings } from 'react-icons/fi';
import { toast } from 'react-toastify';
import useAuth from '../hooks/useAuth';
import { userAPI, orderAPI } from '../services/api';
import { formatPrice, formatDate, getStatusColor } from '../utils/helpers';
import Loader from '../components/common/Loader';
import AddressManager from '../components/common/AddressManager';

const ProfilePage = () => {
  const { user, updateUser, isSeller } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
        storeName: user.storeName || '',
        storeDescription: user.storeDescription || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'orders') {
      const fetchOrders = async () => {
        setLoading(true);
        try {
          const res = await orderAPI.getMyOrders({});
          setOrders(res.data.data.orders);
        } catch {
          toast.error('Failed to load orders');
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    }
  }, [activeTab]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await userAPI.updateProfile(formData);
      updateUser(res.data.data.user);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  const setTab = (tab) => {
    setSearchParams({ tab });
  };

  if (!user) return <Loader fullScreen />;

  const tabs = [
    { key: 'profile', label: 'My Profile', icon: <FiUser size={18} /> },
    { key: 'orders', label: 'My Orders', icon: <FiPackage size={18} /> },
    { key: 'addresses', label: 'Manage Addresses', icon: <FiMapPin size={18} /> },
    { key: 'settings', label: 'Settings', icon: <FiSettings size={18} /> },
  ];

  if (isSeller) {
    tabs.push({ key: 'store', label: 'Store Info', icon: <FiBriefcase size={18} /> });
  }

  return (
    <div className="bg-surface-50 min-h-screen">
      <div className="container-main py-8">
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="h-24 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 relative">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-3 left-10 w-20 h-20 bg-white rounded-full blur-2xl"></div>
              <div className="absolute bottom-2 right-20 w-28 h-28 bg-accent-400 rounded-full blur-2xl"></div>
            </div>
          </div>
          <div className="px-6 pb-6 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-10">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-xl border-4 border-white">
                <span className="text-white text-2xl font-bold">{user.name?.[0]?.toUpperCase()}</span>
              </div>
              <div className="flex-1 pt-2 sm:pt-0">
                <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-sm text-gray-500">{user.email}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                    user.role === 'seller' ? 'bg-emerald-50 text-emerald-600' : 'bg-primary-50 text-primary-600'
                  }`}>
                    {user.role}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <FiCalendar size={12} /> Joined {formatDate(user.createdAt)}
                  </span>
                </div>
              </div>
              {(user?.role === 'superadmin' || user?.role === 'admin') && (
                <Link to="/superadmin@2026" className="btn-primary btn-sm flex items-center gap-1.5 mt-2 sm:mt-0 bg-indigo-600 hover:bg-indigo-700 shadow-md">
                  <FiGrid size={14} /> SuperAdmin Dashboard
                </Link>
              )}
              {isSeller && user?.role !== 'superadmin' && (
                <Link to="/seller/dashboard" className="btn-primary btn-sm flex items-center gap-1.5 mt-2 sm:mt-0">
                  <FiGrid size={14} /> Seller Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 space-y-1 sticky top-24">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setTab(tab.key)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/20'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                    }`}
                  >
                    <span className={isActive ? 'text-white' : 'text-gray-400'}>{tab.icon}</span>
                    {tab.label}
                  </button>
                );
              })}

              {/* Quick Stats */}
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 px-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Total Orders</span>
                  <span className="font-bold text-gray-700">{orders.length || 0}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Account Status</span>
                  <span className="font-bold text-emerald-600">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
                  <button onClick={() => setEditing(!editing)} className="btn-ghost btn-sm">
                    <FiEdit3 size={14} /> {editing ? 'Cancel' : 'Edit'}
                  </button>
                </div>

                {editing ? (
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="input-label">Full Name</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input" />
                      </div>
                      <div>
                        <label className="input-label">Phone</label>
                        <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="input" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="input-label">Address</label>
                        <textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="input min-h-[80px]" />
                      </div>
                      <div>
                        <label className="input-label">City</label>
                        <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="input" />
                      </div>
                      <div>
                        <label className="input-label">State</label>
                        <input type="text" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} className="input" />
                      </div>
                      <div>
                        <label className="input-label">Pincode</label>
                        <input type="text" value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} className="input" />
                      </div>
                    </div>
                    <button type="submit" className="btn-primary">Save Changes</button>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { icon: <FiUser />, label: 'Name', value: user.name },
                      { icon: <FiMail />, label: 'Email', value: user.email },
                      { icon: <FiPhone />, label: 'Phone', value: user.phone || 'Not added' },
                      { icon: <FiMapPin />, label: 'Address', value: user.address ? `${user.address}, ${user.city || ''} ${user.state || ''} ${user.pincode || ''}` : 'Not added' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-surface-50 rounded-xl">
                        <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-primary-500 flex-shrink-0 shadow-sm">
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{item.label}</p>
                          <p className="text-sm text-gray-800 font-medium">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900">My Orders</h2>
                {loading ? <Loader /> : orders.length > 0 ? (
                  orders.map((order) => (
                    <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-bold text-gray-800">{order.orderNumber}</p>
                          <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <span className={getStatusColor(order.status)}>{order.status}</span>
                          <p className="text-sm font-bold text-gray-900 mt-1">{formatPrice(order.totalAmount)}</p>
                        </div>
                      </div>
                      {order.items?.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 py-2 border-t">
                          <div className="w-12 h-12 bg-surface-50 rounded-lg p-1 flex-shrink-0">
                            <img src={item.product?.images?.[0] ? `http://localhost:5000${item.product.images[0]}` : 'https://via.placeholder.com/48'} alt="" className="w-full h-full object-contain" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800 truncate">{item.product?.name}</p>
                            <p className="text-xs text-gray-400">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 text-center py-16">
                    <p className="text-4xl mb-3">📦</p>
                    <p className="text-gray-500 mb-4">No orders yet</p>
                    <Link to="/search" className="btn-primary">Start Shopping</Link>
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Account Settings</h2>
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">Full Name</label>
                      <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input" />
                    </div>
                    <div>
                      <label className="input-label">Phone</label>
                      <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="input" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="input-label">Address</label>
                      <textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="input min-h-[80px]" />
                    </div>
                    <div>
                      <label className="input-label">City</label>
                      <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="input" />
                    </div>
                    <div>
                      <label className="input-label">State</label>
                      <input type="text" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} className="input" />
                    </div>
                    <div>
                      <label className="input-label">Pincode</label>
                      <input type="text" value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} className="input" />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary">Save Changes</button>
                </form>
              </div>
            )}

            {/* Manage Addresses Tab (Matching Reference Image 4) */}
            {activeTab === 'addresses' && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                <AddressManager />
              </div>
            )}

            {/* Store Tab (Seller) */}
            {activeTab === 'store' && isSeller && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Store Information</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-surface-50 rounded-xl">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Store Name</p>
                    <p className="text-gray-800 font-semibold">{user.storeName || 'Not set'}</p>
                  </div>
                  <div className="p-4 bg-surface-50 rounded-xl">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Store Description</p>
                    <p className="text-sm text-gray-600">{user.storeDescription || 'No description added'}</p>
                  </div>
                  <Link to="/seller/settings" className="btn-primary inline-flex items-center gap-2">
                    <FiSettings size={14} /> Edit in Seller Dashboard
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
