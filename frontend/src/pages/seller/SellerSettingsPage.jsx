import { useState, useEffect } from 'react';
import { FiSettings, FiSave } from 'react-icons/fi';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth';
import { userAPI } from '../../services/api';

const SellerSettingsPage = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    storeName: '',
    storeDescription: '',
  });

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await userAPI.updateProfile(formData);
      updateUser(res.data.data.user);
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Update your personal and store information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FiSettings size={18} className="text-emerald-500" /> Store Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="input-label">Store Name</label>
              <input type="text" name="storeName" value={formData.storeName} onChange={handleChange} className="input" placeholder="Your store name" />
            </div>
            <div>
              <label className="input-label">Store Description</label>
              <textarea name="storeDescription" value={formData.storeDescription} onChange={handleChange} className="input min-h-[100px] resize-none" placeholder="Describe what your store sells..." />
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="input-label">Phone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input" placeholder="+91..." />
            </div>
            <div className="md:col-span-2">
              <label className="input-label">Address</label>
              <textarea name="address" value={formData.address} onChange={handleChange} className="input min-h-[80px] resize-none" placeholder="Full address" />
            </div>
            <div>
              <label className="input-label">City</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="input-label">State</label>
              <input type="text" name="state" value={formData.state} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="input-label">Pincode</label>
              <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className="input" />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary px-8 py-3 flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/20"
        >
          <FiSave size={16} />
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
};

export default SellerSettingsPage;
