import { useState, useEffect } from 'react';
import { FiMapPin, FiPlus, FiCheck, FiTrash2, FiEdit2, FiNavigation, FiX, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal'
];

export const getSavedAddresses = () => {
  try {
    const saved = localStorage.getItem('userSavedAddresses');
    if (saved) return JSON.parse(saved);
  } catch {}
  // Default Initial Address matching reference image
  return [
    {
      id: 'default-addr-1',
      name: 'Rohit Kumar',
      phone: '6206262071',
      pincode: '832108',
      locality: 'Gamharia, Seraikela Kharsawan',
      streetAddress: 'Near Vani Vidya Mandir School, Airtel Tower Campus',
      city: 'Jamshedpur',
      state: 'Jharkhand',
      landmark: 'Near Adrash Nagar, Balrampur',
      altPhone: '',
      addressType: 'Home',
      isDefault: true,
    }
  ];
};

export const saveAddressesToStorage = (addresses) => {
  localStorage.setItem('userSavedAddresses', JSON.stringify(addresses));
};

export const getActiveDeliveryAddress = () => {
  const addresses = getSavedAddresses();
  return addresses.find(a => a.isDefault) || addresses[0] || null;
};

const AddressManager = ({ onSelectAddress, activeAddressId, isModal = false, onClose }) => {
  const [addresses, setAddresses] = useState(getSavedAddresses());
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [locating, setLocating] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    pincode: '',
    locality: '',
    streetAddress: '',
    city: '',
    state: 'Jharkhand',
    landmark: '',
    altPhone: '',
    addressType: 'Home',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      pincode: '',
      locality: '',
      streetAddress: '',
      city: '',
      state: 'Jharkhand',
      landmark: '',
      altPhone: '',
      addressType: 'Home',
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleEdit = (addr) => {
    setEditingId(addr.id);
    setFormData({
      name: addr.name || '',
      phone: addr.phone || '',
      pincode: addr.pincode || '',
      locality: addr.locality || '',
      streetAddress: addr.streetAddress || '',
      city: addr.city || '',
      state: addr.state || 'Jharkhand',
      landmark: addr.landmark || '',
      altPhone: addr.altPhone || '',
      addressType: addr.addressType || 'Home',
    });
    setShowAddForm(true);
  };

  const handleDelete = (id) => {
    const updated = addresses.filter(a => a.id !== id);
    setAddresses(updated);
    saveAddressesToStorage(updated);
    toast.success('Address deleted');
  };

  const handleSetDefault = (addr) => {
    const updated = addresses.map(a => ({
      ...a,
      isDefault: a.id === addr.id
    }));
    setAddresses(updated);
    saveAddressesToStorage(updated);
    if (onSelectAddress) onSelectAddress(addr);
    toast.success(`Delivery address set to ${addr.name} (${addr.pincode})`);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      return toast.error('Geolocation is not supported by your browser');
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          // Reverse geocoding via OpenStreetMap API
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.address) {
            const addr = data.address;
            setFormData(prev => ({
              ...prev,
              pincode: addr.postcode || prev.pincode || '831001',
              locality: addr.suburb || addr.neighbourhood || addr.residential || prev.locality,
              city: addr.city || addr.town || addr.county || 'Jamshedpur',
              state: addr.state || 'Jharkhand',
              streetAddress: addr.road ? `${addr.road}, ${data.display_name.slice(0, 40)}` : prev.streetAddress
            }));
            toast.success('Current location detected successfully!');
          }
        } catch {
          toast.info('Fetched approximate GPS location.');
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        toast.error('Location access denied or unavailable. Please enter address manually.');
      }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.pincode || !formData.streetAddress || !formData.city) {
      return toast.error('Please fill in all required address fields');
    }

    let updated;
    if (editingId) {
      updated = addresses.map(a => a.id === editingId ? { ...formData, id: editingId, isDefault: a.isDefault } : a);
      toast.success('Address updated successfully!');
    } else {
      const newAddr = {
        ...formData,
        id: `addr-${Date.now()}`,
        isDefault: addresses.length === 0,
      };
      updated = [...addresses, newAddr];
      toast.success('New address added successfully!');
      if (onSelectAddress) onSelectAddress(newAddr);
    }

    setAddresses(updated);
    saveAddressesToStorage(updated);
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
        <div>
          <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
            <FiMapPin className="text-primary-500" /> Manage Delivery Addresses
          </h3>
          <p className="text-xs text-gray-400">Add, edit, or select your preferred shipping location</p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => { resetForm(); setShowAddForm(true); }}
            className="btn-primary text-xs font-extrabold px-4 py-2 flex items-center gap-1.5"
          >
            <FiPlus size={16} /> Add New Address
          </button>
        )}
      </div>

      {/* 📝 ADD / EDIT ADDRESS FORM (Matching Reference Image 3) */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-surface-50 dark:bg-gray-800/80 p-5 rounded-3xl border border-blue-200 dark:border-blue-900/50 space-y-4 animate-scale-up">
          <div className="flex items-center justify-between border-b border-gray-200/60 dark:border-gray-700/60 pb-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-primary-600 dark:text-primary-400">
              {editingId ? 'Edit Address Details' : 'ADD A NEW ADDRESS'}
            </h4>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={locating}
              className="btn-accent text-xs font-extrabold px-3 py-1.5 flex items-center gap-1.5 shadow-sm"
            >
              <FiNavigation className={locating ? 'animate-spin' : ''} size={14} />
              {locating ? 'Detecting...' : 'Use my current location'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="input-label text-xs font-bold">Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Rohit Kumar"
                className="input text-xs font-semibold"
                required
              />
            </div>
            <div>
              <label className="input-label text-xs font-bold">10-Digit Mobile Number *</label>
              <input
                type="tel"
                maxLength={10}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                placeholder="6206262071"
                className="input text-xs font-semibold"
                required
              />
            </div>
            <div>
              <label className="input-label text-xs font-bold">Pincode *</label>
              <input
                type="text"
                maxLength={6}
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                placeholder="832108"
                className="input text-xs font-semibold"
                required
              />
            </div>
            <div>
              <label className="input-label text-xs font-bold">Locality / Area</label>
              <input
                type="text"
                value={formData.locality}
                onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                placeholder="Balrampur, Gamharia"
                className="input text-xs font-semibold"
              />
            </div>
            <div className="md:col-span-2">
              <label className="input-label text-xs font-bold">Address (Area, Flat No & Street) *</label>
              <textarea
                value={formData.streetAddress}
                onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                placeholder="Near Vani Vidya Mandir School, Airtel Tower Campus"
                className="input text-xs min-h-[70px] font-semibold"
                required
              />
            </div>
            <div>
              <label className="input-label text-xs font-bold">City / District / Town *</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Jamshedpur"
                className="input text-xs font-semibold"
                required
              />
            </div>
            <div>
              <label className="input-label text-xs font-bold">State *</label>
              <select
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="input text-xs font-semibold"
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label text-xs font-bold">Landmark (Optional)</label>
              <input
                type="text"
                value={formData.landmark}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                placeholder="Near Adrash Nagar"
                className="input text-xs font-semibold"
              />
            </div>
            <div>
              <label className="input-label text-xs font-bold">Alternate Phone (Optional)</label>
              <input
                type="tel"
                maxLength={10}
                value={formData.altPhone}
                onChange={(e) => setFormData({ ...formData, altPhone: e.target.value.replace(/\D/g, '') })}
                placeholder="Optional Phone"
                className="input text-xs font-semibold"
              />
            </div>
          </div>

          {/* Address Type Selection */}
          <div>
            <label className="input-label text-xs font-bold block mb-1.5">Address Type</label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-gray-200 cursor-pointer">
                <input
                  type="radio"
                  name="addressType"
                  value="Home"
                  checked={formData.addressType === 'Home'}
                  onChange={() => setFormData({ ...formData, addressType: 'Home' })}
                  className="text-primary-600 focus:ring-primary-500"
                />
                🏠 Home (All day delivery)
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-gray-200 cursor-pointer">
                <input
                  type="radio"
                  name="addressType"
                  value="Work"
                  checked={formData.addressType === 'Work'}
                  onChange={() => setFormData({ ...formData, addressType: 'Work' })}
                  className="text-primary-600 focus:ring-primary-500"
                />
                🏢 Work (Delivery between 10 AM - 6 PM)
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="btn-primary text-xs font-extrabold px-6 py-2.5">
              SAVE ADDRESS
            </button>
            <button type="button" onClick={resetForm} className="btn text-xs px-5 py-2.5 text-gray-600">
              CANCEL
            </button>
          </div>
        </form>
      )}

      {/* 📦 SAVED ADDRESSES CARDS LIST (Matching Reference Image 4) */}
      <div className="space-y-4">
        {addresses.length === 0 ? (
          <div className="text-center py-10 bg-surface-50 dark:bg-gray-800/40 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
            <p className="text-3xl mb-2">📍</p>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">No saved addresses yet</p>
            <p className="text-xs text-gray-400">Click 'Add New Address' above to set your delivery location.</p>
          </div>
        ) : (
          addresses.map((addr) => {
            const isSelected = activeAddressId ? activeAddressId === addr.id : addr.isDefault;
            return (
              <div
                key={addr.id}
                className={`p-5 rounded-3xl border transition-all relative ${
                  isSelected
                    ? 'bg-blue-50/70 dark:bg-blue-950/40 border-primary-500 shadow-md ring-2 ring-primary-500/20'
                    : 'bg-white dark:bg-gray-800/80 border-gray-200/80 dark:border-gray-700/60 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5 flex-1 pr-6">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10px] font-black uppercase tracking-wider rounded-md">
                        {addr.addressType || 'HOME'}
                      </span>
                      {addr.isDefault && (
                        <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold rounded-md flex items-center gap-1">
                          <FiCheck size={12} /> Default Delivery Address
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                      {addr.name} <span className="text-xs font-bold text-gray-500">{addr.phone}</span>
                    </h4>

                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                      {addr.streetAddress}
                      {addr.landmark ? `, ${addr.landmark}` : ''}
                      {addr.locality ? `, ${addr.locality}` : ''}, {addr.city}, {addr.state} - <strong className="text-gray-900 dark:text-white font-extrabold">{addr.pincode}</strong>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!isSelected && (
                      <button
                        onClick={() => handleSetDefault(addr)}
                        className="btn-primary text-xs font-extrabold px-3 py-1.5 shadow-sm"
                      >
                        Deliver Here
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(addr)}
                      className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Edit Address"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40"
                      title="Delete Address"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AddressManager;
