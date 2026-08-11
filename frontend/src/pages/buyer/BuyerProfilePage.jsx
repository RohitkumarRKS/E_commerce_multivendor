import { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit3, FiCalendar, FiShield } from 'react-icons/fi';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth';
import { userAPI } from '../../services/api';
import { formatDate } from '../../utils/helpers';

const BuyerProfilePage = () => {
  const { user, updateUser } = useAuth();
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
      });
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await userAPI.updateProfile(formData);
      updateUser(res.data.data.user);
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your personal information</p>
        </div>
        <button onClick={() => setEditing(!editing)} className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <FiEdit3 size={13} /> {editing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
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
            <button type="submit" className="btn-primary px-6 rounded-xl">Save Changes</button>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: <FiUser />, label: 'Full Name', value: user?.name, bg: 'bg-blue-50 dark:bg-blue-900/20', color: 'text-blue-500' },
              { icon: <FiMail />, label: 'Email', value: user?.email, bg: 'bg-emerald-50 dark:bg-emerald-900/20', color: 'text-emerald-500' },
              { icon: <FiPhone />, label: 'Phone', value: user?.phone || 'Not added', bg: 'bg-amber-50 dark:bg-amber-900/20', color: 'text-amber-500' },
              { icon: <FiMapPin />, label: 'Address', value: user?.address ? `${user.address}, ${user.city || ''} ${user.state || ''} ${user.pincode || ''}` : 'Not added', bg: 'bg-purple-50 dark:bg-purple-900/20', color: 'text-purple-500' },
              { icon: <FiCalendar />, label: 'Member Since', value: formatDate(user?.createdAt), bg: 'bg-pink-50 dark:bg-pink-900/20', color: 'text-pink-500' },
              { icon: <FiShield />, label: 'Account Type', value: user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1), bg: 'bg-indigo-50 dark:bg-indigo-900/20', color: 'text-indigo-500' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-surface-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center ${item.color} flex-shrink-0`}>
                  {item.icon}
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">{item.label}</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200 font-semibold mt-0.5">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerProfilePage;
