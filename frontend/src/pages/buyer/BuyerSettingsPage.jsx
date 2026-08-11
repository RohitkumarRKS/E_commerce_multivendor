import { useState, useEffect } from 'react';
import { FiSettings, FiLogOut } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { userAPI } from '../../services/api';

const BuyerSettingsPage = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
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
      });
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await userAPI.updateProfile(formData);
      updateUser(res.data.data.user);
      toast.success('Settings saved!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FiSettings size={22} className="text-gray-500" /> Account Settings
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Update your account preferences</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
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
          <button type="submit" className="btn-primary px-6 rounded-xl">Save Changes</button>
        </form>

        {/* Danger Zone */}
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-bold text-red-600 dark:text-red-400 mb-3">Danger Zone</h3>
          <button onClick={handleLogout} className="flex items-center gap-2 px-5 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold text-sm rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors border border-red-200 dark:border-red-800">
            <FiLogOut size={16} /> Sign Out of Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyerSettingsPage;
