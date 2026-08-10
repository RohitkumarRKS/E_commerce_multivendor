import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiPhone, FiShoppingBag, FiBriefcase, FiShield, FiTruck, FiStar, FiHeart, FiTag, FiGlobe, FiAward, FiPackage } from 'react-icons/fi';
import { toast } from 'react-toastify';
import useAuth from '../hooks/useAuth';

const FloatingIcon = ({ icon, top, left, delay, size = 'w-10 h-10' }) => (
  <div
    className={`absolute ${size} rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center animate-float-icon`}
    style={{ top, left, animationDelay: delay }}
  >
    {icon}
  </div>
);

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') === 'seller' ? 'seller' : 'buyer';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: defaultRole,
    storeName: '',
    storeDescription: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.role === 'seller' && !formData.storeName) {
      toast.error('Store name is required for sellers');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      // Log out immediately so user has to login manually
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.success('Account created successfully! Please login to continue.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Left Panel - E-Commerce Showcase */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-gradient-to-br from-accent-600 via-primary-500 to-primary-700 flex-col justify-center px-14 xl:px-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 auth-mesh-bg opacity-20" />
        
        {/* Floating Icons */}
        <FloatingIcon icon={<FiStar className="text-white/60" size={18} />} top="8%" left="20%" delay="0s" />
        <FloatingIcon icon={<FiGlobe className="text-white/60" size={18} />} top="25%" left="78%" delay="2s" />
        <FloatingIcon icon={<FiHeart className="text-white/60" size={18} />} top="55%" left="8%" delay="4s" />
        <FloatingIcon icon={<FiTag className="text-white/60" size={18} />} top="80%" left="75%" delay="1s" />
        <FloatingIcon icon={<FiAward className="text-white/60" size={18} />} top="45%" left="88%" delay="3s" />

        {/* Content */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 mb-8 animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
            <FiShield size={14} className="text-white/80" />
            <span className="text-xs font-semibold text-white/90 tracking-wider uppercase">Join our marketplace</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold text-white mb-4 leading-tight animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
            Start Your
            <span className="block text-white/90">Journey Today</span>
          </h1>
          <p className="text-white/60 text-base mb-10 max-w-md animate-slide-in-left" style={{ animationDelay: '0.3s' }}>
            Whether you're a buyer looking for great deals or a seller ready to grow your business — we've got you covered.
          </p>

          {/* Benefits */}
          <div className="space-y-4 mb-10">
            {[
              { icon: <FiShoppingBag className="text-white/80" size={16} />, title: 'Buy or Sell', desc: 'Flexible platform for both buyers and sellers', delay: '0.4s' },
              { icon: <FiTruck className="text-white/80" size={16} />, title: 'Pan-India Delivery', desc: 'We deliver to every corner of the country', delay: '0.5s' },
              { icon: <FiPackage className="text-white/80" size={16} />, title: 'Easy Returns', desc: '7-day hassle-free return policy', delay: '0.6s' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 animate-slide-in-left" style={{ animationDelay: item.delay }}>
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-white text-sm font-semibold">{item.title}</h4>
                  <p className="text-white/50 text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonial Bubble */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-5 max-w-sm animate-slide-in-left" style={{ animationDelay: '0.8s' }}>
            <div className="flex items-center gap-1 mb-2">
              {[1,2,3,4,5].map(i => <FiStar key={i} size={12} className="text-yellow-300" fill="currentColor" />)}
            </div>
            <p className="text-white/80 text-sm italic mb-3">"Absolutely love this platform! Found amazing deals and the delivery was super fast."</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">R</div>
              <div>
                <p className="text-white text-xs font-semibold">Rahul S.</p>
                <p className="text-white/40 text-[10px]">Verified Buyer</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center px-6 py-10 bg-gray-50 relative overflow-y-auto">
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #000 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }} />

        <div className="w-full max-w-lg relative z-10">
          {/* Mobile Branding */}
          <div className="lg:hidden text-center mb-6">
            <div className="w-14 h-14 bg-white rounded-2xl p-2 flex items-center justify-center mx-auto mb-3 shadow-xl border border-gray-100">
              <img src="/InduKart.png" alt="InduKart Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">InduKart</h1>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="px-8 pt-8 pb-2">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Create Account</h2>
              <p className="text-sm text-gray-400">Join InduKart today</p>
            </div>

            {/* Role Selector */}
            <div className="flex border-b mx-8 mt-4 rounded-xl overflow-hidden bg-gray-100">
              <button
                onClick={() => setFormData({ ...formData, role: 'buyer' })}
                className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all rounded-xl ${
                  formData.role === 'buyer'
                    ? 'text-white bg-primary-500 shadow-md'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                id="register-role-buyer"
              >
                <FiShoppingBag size={16} /> Buyer
              </button>
              <button
                onClick={() => setFormData({ ...formData, role: 'seller' })}
                className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all rounded-xl ${
                  formData.role === 'seller'
                    ? 'text-white bg-primary-500 shadow-md'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                id="register-role-seller"
              >
                <FiBriefcase size={16} /> Seller
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-8 pt-6 pb-8 space-y-4">
              <div>
                <label className="input-label" htmlFor="register-name">Full Name *</label>
                <div className="relative group">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                  <input type="text" id="register-name" name="name" value={formData.name} onChange={handleChange}
                    placeholder="Enter your full name" className="input pl-11" required />
                </div>
              </div>

              <div>
                <label className="input-label" htmlFor="register-email">Email Address *</label>
                <div className="relative group">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                  <input type="email" id="register-email" name="email" value={formData.email} onChange={handleChange}
                    placeholder="Enter your email" className="input pl-11" required />
                </div>
              </div>

              <div>
                <label className="input-label" htmlFor="register-phone">Phone Number</label>
                <div className="relative group">
                  <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                  <input type="tel" id="register-phone" name="phone" value={formData.phone} onChange={handleChange}
                    placeholder="Enter your phone number" className="input pl-11" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label" htmlFor="register-password">Password *</label>
                  <div className="relative group">
                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                    <input type={showPassword ? 'text' : 'password'} id="register-password" name="password"
                      value={formData.password} onChange={handleChange} placeholder="Min 6 characters" className="input pl-11" required />
                  </div>
                </div>
                <div>
                  <label className="input-label" htmlFor="register-confirm-password">Confirm Password *</label>
                  <div className="relative group">
                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                    <input type={showPassword ? 'text' : 'password'} id="register-confirm-password" name="confirmPassword"
                      value={formData.confirmPassword} onChange={handleChange} placeholder="Repeat password" className="input pl-11" required />
                  </div>
                </div>
              </div>

              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
                {showPassword ? <FiEyeOff size={12} /> : <FiEye size={12} />}
                {showPassword ? 'Hide' : 'Show'} password
              </button>

              {/* Seller Fields */}
              {formData.role === 'seller' && (
                <div className="space-y-4 pt-3 border-t">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Store Information</p>
                  <div>
                    <label className="input-label" htmlFor="register-store-name">Store Name *</label>
                    <div className="relative group">
                      <FiBriefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                      <input type="text" id="register-store-name" name="storeName" value={formData.storeName} onChange={handleChange}
                        placeholder="Your store name" className="input pl-11" required />
                    </div>
                  </div>
                  <div>
                    <label className="input-label" htmlFor="register-store-desc">Store Description</label>
                    <textarea id="register-store-desc" name="storeDescription" value={formData.storeDescription} onChange={handleChange}
                      placeholder="Describe your store and what you sell..."
                      className="input min-h-[80px] resize-none" rows={3} />
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="btn-accent w-full py-3.5 text-base mt-2 shadow-lg shadow-accent-500/20 hover:shadow-accent-500/30 hover:translate-y-[-1px] transition-all"
                id="register-submit-btn"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </span>
                ) : (
                  `Create ${formData.role === 'seller' ? 'Seller' : 'Buyer'} Account`
                )}
              </button>

              <p className="text-center text-sm text-gray-500">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-500 font-semibold hover:text-primary-600">Login</Link>
              </p>
            </form>
          </div>

          {/* Bottom note */}
          <p className="text-center text-[10px] text-gray-400 mt-6 flex items-center justify-center gap-1.5">
            <FiShield size={10} />
            Your data is protected with industry-standard encryption
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
