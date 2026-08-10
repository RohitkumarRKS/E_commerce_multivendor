import { useState, useEffect } from 'react';
import { 
  FiUsers, FiShoppingBag, FiShield, FiSearch, FiCheck, FiX, 
  FiEye, FiEdit2, FiTrash2, FiUserCheck, FiUserX, FiBriefcase, 
  FiMail, FiPhone, FiMapPin, FiCalendar, FiFilter, FiCheckCircle
} from 'react-icons/fi';
import { adminUserAPI } from '../services/adminApi';
import { toast } from 'react-toastify';
import Loader from '../../components/common/Loader';
import { getImageUrl } from '../../utils/helpers';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleTab, setRoleTab] = useState('all'); // 'all', 'buyer', 'seller', 'admin'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'suspended'
  
  // Selected user for details modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminUserAPI.getAll();
      if (res.data?.data?.users) {
        setUsers(res.data.data.users);
      }
    } catch {
      toast.error('Failed to load users list');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await adminUserAPI.update(user.id, { isActive: !user.isActive });
      toast.success(`User "${user.name}" is now ${!user.isActive ? 'Active' : 'Suspended'}`);
      fetchUsers();
      if (selectedUser?.id === user.id) {
        setSelectedUser({ ...selectedUser, isActive: !user.isActive });
      }
    } catch {
      toast.error('Failed to update user status');
    }
  };

  const handleRoleChange = async () => {
    if (!selectedUser || !selectedRole) return;
    try {
      await adminUserAPI.update(selectedUser.id, { role: selectedRole });
      toast.success(`Role for ${selectedUser.name} updated to "${selectedRole.toUpperCase()}"`);
      setSelectedUser({ ...selectedUser, role: selectedRole });
      setIsEditingRole(false);
      fetchUsers();
    } catch {
      toast.error('Failed to update user role');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${user.name}" (${user.email})?`)) return;
    try {
      await adminUserAPI.delete(user.id);
      toast.success('User account deleted');
      if (selectedUser?.id === user.id) {
        setSelectedUser(null);
      }
      fetchUsers();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  // Section-wise Count Calculations
  const totalUsersCount = users.length;
  const buyersCount = users.filter((u) => u.role === 'buyer').length;
  const sellersCount = users.filter((u) => u.role === 'seller').length;
  const adminsCount = users.filter((u) => u.role === 'admin' || u.role === 'superadmin').length;

  // Filtered Users List
  const filteredUsers = users.filter((u) => {
    // Role filter
    if (roleTab === 'buyer' && u.role !== 'buyer') return false;
    if (roleTab === 'seller' && u.role !== 'seller') return false;
    if (roleTab === 'admin' && u.role !== 'admin' && u.role !== 'superadmin') return false;

    // Status filter
    if (statusFilter === 'active' && !u.isActive) return false;
    if (statusFilter === 'suspended' && u.isActive) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = u.name?.toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      const matchPhone = u.phone?.toLowerCase().includes(q);
      const matchStore = u.storeName?.toLowerCase().includes(q);
      return matchName || matchEmail || matchPhone || matchStore;
    }

    return true;
  });

  if (loading) return <Loader fullScreen />;

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <FiUsers className="text-primary-600 dark:text-primary-400" size={26} />
            User Management & Directory
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Monitor, manage roles, inspect profiles, and control account statuses for all marketplace members
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="btn-ghost text-xs py-2 px-3 flex items-center gap-1.5 font-bold rounded-xl border border-gray-200 dark:border-gray-700"
        >
          🔄 Refresh Directory
        </button>
      </div>

      {/* 📊 SECTION-WISE STATS CARDS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div
          onClick={() => setRoleTab('all')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all shadow-sm hover:shadow-md flex items-center gap-4 ${
            roleTab === 'all'
              ? 'bg-primary-50/70 dark:bg-primary-950/40 border-primary-300 dark:border-primary-700 ring-2 ring-primary-500/20'
              : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center font-black text-xl shadow-md flex-shrink-0">
            <FiUsers size={22} />
          </div>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">Total Members</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">{totalUsersCount}</h3>
            <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400">Entire Platform</span>
          </div>
        </div>

        {/* Sellers / Merchants */}
        <div
          onClick={() => setRoleTab('seller')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all shadow-sm hover:shadow-md flex items-center gap-4 ${
            roleTab === 'seller'
              ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 ring-2 ring-blue-500/20'
              : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-md flex-shrink-0">
            <FiBriefcase size={22} />
          </div>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">Sellers & Merchants</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">{sellersCount}</h3>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">Verified Vendors</span>
          </div>
        </div>

        {/* Buyers / Customers */}
        <div
          onClick={() => setRoleTab('buyer')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all shadow-sm hover:shadow-md flex items-center gap-4 ${
            roleTab === 'buyer'
              ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-500/20'
              : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-md flex-shrink-0">
            <FiShoppingBag size={22} />
          </div>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">Buyers & Customers</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">{buyersCount}</h3>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Active Shoppers</span>
          </div>
        </div>

        {/* Admins & SuperAdmins */}
        <div
          onClick={() => setRoleTab('admin')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all shadow-sm hover:shadow-md flex items-center gap-4 ${
            roleTab === 'admin'
              ? 'bg-purple-50/70 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700 ring-2 ring-purple-500/20'
              : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black text-xl shadow-md flex-shrink-0">
            <FiShield size={22} />
          </div>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">Admins & Control</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">{adminsCount}</h3>
            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">Platform Staff</span>
          </div>
        </div>
      </div>

      {/* 🔍 FILTER & ROLE TABS BAR */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Role Tabs */}
          <div className="flex flex-wrap bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl w-full md:w-auto">
            <button
              onClick={() => setRoleTab('all')}
              className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all ${
                roleTab === 'all'
                  ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 shadow-xs'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              All Members ({totalUsersCount})
            </button>
            <button
              onClick={() => setRoleTab('seller')}
              className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 ${
                roleTab === 'seller'
                  ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              🏪 Sellers ({sellersCount})
            </button>
            <button
              onClick={() => setRoleTab('buyer')}
              className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 ${
                roleTab === 'buyer'
                  ? 'bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              🛍️ Buyers ({buyersCount})
            </button>
            <button
              onClick={() => setRoleTab('admin')}
              className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 ${
                roleTab === 'admin'
                  ? 'bg-white dark:bg-gray-900 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              🛡️ Admins ({adminsCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, store, phone..."
              className="input pl-10 text-xs py-2.5 font-medium"
            />
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          </div>
        </div>

        {/* Status Dropdown Filter */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-gray-400 flex items-center gap-1">
              <FiFilter size={13} /> Filter Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input py-1 px-3 text-xs w-auto font-semibold bg-gray-50 dark:bg-gray-800"
            >
              <option value="all">All Statuses (Active & Banned)</option>
              <option value="active">🟢 Active Users Only</option>
              <option value="suspended">🔴 Suspended Users Only</option>
            </select>
          </div>

          <p className="text-gray-400 font-bold">Showing {filteredUsers.length} of {totalUsersCount} accounts</p>
        </div>
      </div>

      {/* 📋 USERS TABLE */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 uppercase text-[11px] font-black tracking-wider border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4">User Profile</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Role Section</th>
                <th className="px-6 py-4">Store Name</th>
                <th className="px-6 py-4 text-center">Account Status</th>
                <th className="px-6 py-4 text-center">SuperAdmin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors">
                    {/* User Profile */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-xs flex-shrink-0 border border-primary-200">
                          {u.avatar ? (
                            <img src={getImageUrl(u.avatar)} alt={u.name} className="w-full h-full object-cover rounded-2xl" />
                          ) : (
                            u.name?.[0]?.toUpperCase() || 'U'
                          )}
                        </div>
                        <div>
                          <p className="font-extrabold text-gray-900 dark:text-white text-sm">{u.name}</p>
                          <p className="text-[11px] text-gray-400 flex items-center gap-1">
                            <FiCalendar size={11} /> Joined {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Recently'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5 truncate max-w-[200px]">
                        <FiMail className="text-gray-400" size={13} /> {u.email}
                      </p>
                      {u.phone && (
                        <p className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                          <FiPhone size={11} /> {u.phone}
                        </p>
                      )}
                    </td>

                    {/* Role Section */}
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 ${
                        u.role === 'superadmin'
                          ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700'
                          : u.role === 'admin'
                          ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700'
                          : u.role === 'seller'
                          ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                          : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700'
                      }`}>
                        {u.role === 'seller' ? <FiBriefcase size={12} /> : u.role === 'buyer' ? <FiShoppingBag size={12} /> : <FiShield size={12} />}
                        {u.role}
                      </span>
                    </td>

                    {/* Store Name */}
                    <td className="px-6 py-4">
                      {u.role === 'seller' ? (
                        <span className="font-extrabold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                          <FiBriefcase size={13} /> {u.storeName || 'InduKart Seller'}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic text-[11px]">N/A (Shopper)</span>
                      )}
                    </td>

                    {/* Account Status */}
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                        u.isActive
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                      }`}>
                        {u.isActive ? <FiUserCheck size={12} /> : <FiUserX size={12} />}
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>

                    {/* SuperAdmin Actions */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* View Details */}
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setSelectedRole(u.role);
                            setIsEditingRole(false);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 font-extrabold hover:bg-primary-100 transition-colors flex items-center gap-1 shadow-2xs"
                          title="View Full Profile Details"
                        >
                          <FiEye size={14} /> View Details
                        </button>

                        {/* Ban / Activate */}
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`p-1.5 rounded-xl border transition-all ${
                            u.isActive
                              ? 'border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950'
                              : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900 dark:hover:bg-emerald-950'
                          }`}
                          title={u.isActive ? 'Suspend User Account' : 'Reactivate User Account'}
                        >
                          {u.isActive ? <FiUserX size={15} /> : <FiUserCheck size={15} />}
                        </button>

                        {/* Delete User */}
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 rounded-xl border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 transition-colors"
                          title="Delete User Account"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400">
                    <FiUsers size={36} className="mx-auto mb-2 opacity-50" />
                    <p className="font-extrabold text-sm text-gray-700 dark:text-gray-300">No users match your criteria</p>
                    <p className="text-xs text-gray-400 mt-0.5">Try clearing filters or search keyword</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔍 COMPREHENSIVE SUPERADMIN USER DETAILS DRAWER MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-6 animate-scale-up max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-600 via-indigo-600 to-primary-700 text-white font-black flex items-center justify-center text-xl shadow-md border-2 border-white dark:border-gray-800 flex-shrink-0">
                  {selectedUser.avatar ? (
                    <img src={getImageUrl(selectedUser.avatar)} alt={selectedUser.name} className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    selectedUser.name?.[0]?.toUpperCase() || 'U'
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white">{selectedUser.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      selectedUser.isActive
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : 'bg-red-50 text-red-600 border border-red-200'
                    }`}>
                      {selectedUser.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{selectedUser.email}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Profile Information Sections */}
            <div className="space-y-4 text-xs">
              {/* Account Role Management */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-200/80 dark:border-gray-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <FiShield className="text-primary-500" size={15} /> Account Authorization Role
                  </span>
                  {!isEditingRole && (
                    <button
                      onClick={() => setIsEditingRole(true)}
                      className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1"
                    >
                      <FiEdit2 size={12} /> Change Role
                    </button>
                  )}
                </div>

                {isEditingRole ? (
                  <div className="flex items-center gap-2 pt-1">
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="input font-bold text-xs py-1.5"
                    >
                      <option value="buyer">🛍️ Buyer (Customer Shopper)</option>
                      <option value="seller">🏪 Seller (Merchant Store)</option>
                      <option value="admin">🛡️ Admin (Staff Manager)</option>
                      <option value="superadmin">👑 SuperAdmin (Full Control)</option>
                    </select>
                    <button onClick={handleRoleChange} className="btn-primary py-1.5 px-3 text-xs font-bold shadow-xs">
                      Save
                    </button>
                    <button onClick={() => setIsEditingRole(false)} className="btn-ghost py-1.5 px-2 text-xs">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <p className="font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wider">
                    Current Role: <span className="text-primary-600">{selectedUser.role}</span>
                  </p>
                )}
              </div>

              {/* Personal Details */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-gray-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <FiUsers size={14} className="text-primary-500" /> Personal & Contact Info
                </h4>
                <div className="grid grid-cols-2 gap-3 bg-white dark:bg-gray-900 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <div>
                    <span className="text-gray-400 font-bold block text-[10px]">Full Name</span>
                    <span className="font-extrabold text-gray-800 dark:text-gray-200">{selectedUser.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold block text-[10px]">Email Address</span>
                    <span className="font-extrabold text-gray-800 dark:text-gray-200 truncate block">{selectedUser.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold block text-[10px]">Mobile Phone</span>
                    <span className="font-extrabold text-gray-800 dark:text-gray-200">{selectedUser.phone || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold block text-[10px]">Joined Date</span>
                    <span className="font-extrabold text-gray-800 dark:text-gray-200">
                      {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-gray-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <FiMapPin size={14} className="text-primary-500" /> Address Details
                </h4>
                <div className="bg-white dark:bg-gray-900 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-1">
                  <p className="font-bold text-gray-800 dark:text-gray-200">{selectedUser.address || 'No street address saved'}</p>
                  <p className="text-gray-400 font-medium">
                    {selectedUser.city ? `${selectedUser.city}, ` : ''}{selectedUser.state ? `${selectedUser.state} ` : ''}{selectedUser.pincode || ''}
                  </p>
                </div>
              </div>

              {/* Merchant Store Info (If Seller) */}
              {selectedUser.role === 'seller' && (
                <div className="space-y-2">
                  <h4 className="font-extrabold text-blue-600 dark:text-blue-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <FiBriefcase size={14} /> Merchant Store Profile
                  </h4>
                  <div className="bg-blue-50/60 dark:bg-blue-950/40 p-3.5 rounded-2xl border border-blue-100 dark:border-blue-900/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                        <FiCheckCircle className="text-emerald-500" size={15} /> {selectedUser.storeName || 'InduKart Merchant Store'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px]">
                        Verified Vendor
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      {selectedUser.storeDescription || 'No store description provided yet by merchant.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => handleDeleteUser(selectedUser)}
                className="text-red-600 hover:text-red-700 font-bold text-xs flex items-center gap-1"
              >
                <FiTrash2 size={14} /> Delete Account
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(selectedUser)}
                  className={`btn-ghost py-2 px-4 font-extrabold text-xs rounded-xl border ${
                    selectedUser.isActive ? 'border-red-200 text-red-600' : 'border-emerald-200 text-emerald-600'
                  }`}
                >
                  {selectedUser.isActive ? 'Suspend User' : 'Activate Account'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="btn-primary py-2 px-5 font-bold text-xs shadow-md"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
