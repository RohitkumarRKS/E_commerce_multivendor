import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiShoppingCart, FiPackage, FiTruck, FiStar, FiHeart, FiShield, FiUsers, FiTag } from 'react-icons/fi';
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

const FeatureItem = ({ icon, title, desc, delay }) => (
  <div className="flex items-start gap-3 animate-slide-in-left" style={{ animationDelay: delay }}>
    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <div>
      <h4 className="text-white text-sm font-semibold">{title}</h4>
      <p className="text-white/50 text-xs">{desc}</p>
    </div>
  </div>
);

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const user = await login(formData.email, formData.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'seller' ? '/seller/dashboard' : '/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Left Panel - E-Commerce Showcase */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 flex-col justify-center px-14 xl:px-20 overflow-hidden">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 auth-mesh-bg opacity-20" />
        
        {/* Floating Product Icons */}
        <FloatingIcon icon={<FiShoppingCart className="text-white/60" size={18} />} top="10%" left="15%" delay="0s" />
        <FloatingIcon icon={<FiPackage className="text-white/60" size={18} />} top="20%" left="75%" delay="2s" />
        <FloatingIcon icon={<FiTruck className="text-white/60" size={18} />} top="60%" left="10%" delay="4s" />
        <FloatingIcon icon={<FiStar className="text-white/60" size={18} />} top="75%" left="80%" delay="1s" />
        <FloatingIcon icon={<FiHeart className="text-white/60" size={18} />} top="40%" left="85%" delay="3s" />
        <FloatingIcon icon={<FiTag className="text-white/60" size={18} />} top="85%" left="40%" delay="5s" />

        {/* Content */}
        <div className="relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 mb-8 animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
            <FiShield size={14} className="text-white/80" />
            <span className="text-xs font-semibold text-white/90 tracking-wider uppercase">Trusted by 10,000+ shoppers</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl xl:text-5xl font-extrabold text-white mb-4 leading-tight animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
            Welcome to
            <span className="block text-white/90">InduKart</span>
          </h1>
          <p className="text-white/60 text-base mb-10 max-w-md animate-slide-in-left" style={{ animationDelay: '0.3s' }}>
            Discover amazing products from hundreds of verified sellers. Shop with confidence and enjoy lightning-fast delivery.
          </p>

          {/* Features */}
          <div className="space-y-4 mb-10">
            <FeatureItem
              icon={<FiShoppingCart className="text-white/80" size={16} />}
              title="500+ Quality Products"
              desc="Curated selection from verified sellers"
              delay="0.4s"
            />
            <FeatureItem
              icon={<FiTruck className="text-white/80" size={16} />}
              title="Fast & Free Delivery"
              desc="Orders delivered within 2-5 business days"
              delay="0.5s"
            />
            <FeatureItem
              icon={<FiShield className="text-white/80" size={16} />}
              title="Secure Payments"
              desc="100% secure checkout with Razorpay"
              delay="0.6s"
            />
          </div>

          {/* Stats */}
          <div className="flex gap-8 animate-slide-in-left" style={{ animationDelay: '0.7s' }}>
            {[
              { value: '10K+', label: 'Happy Customers' },
              { value: '500+', label: 'Products' },
              { value: '50+', label: 'Sellers' },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-2xl font-extrabold text-white">{stat.value}</p>
                <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-gray-50 relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #000 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }} />
        
        <div className="w-full max-w-md relative z-10">
          {/* Mobile Branding */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 bg-white rounded-2xl p-2 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary-500/25 border border-gray-100">
              <img src="/InduKart.png" alt="InduKart Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">InduKart</h1>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 overflow-hidden border border-gray-100">
            {/* Form Header */}
            <div className="px-8 pt-10 pb-2">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Welcome Back</h2>
              <p className="text-sm text-gray-400">Login to your InduKart account</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-8 pt-6 pb-8 space-y-5">
              <div>
                <label className="input-label" htmlFor="login-email">Email Address</label>
                <div className="relative group">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                  <input
                    type="email"
                    id="login-email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="input pl-11"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="input-label" htmlFor="login-password">Password</label>
                <div className="relative group">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="login-password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="input pl-11 pr-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 text-base shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 hover:translate-y-[-1px] transition-all"
                id="login-submit-btn"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Logging in...
                  </span>
                ) : (
                  'Login'
                )}
              </button>

              <p className="text-center text-sm text-gray-500">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary-500 font-semibold hover:text-primary-600">
                  Create Account
                </Link>
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

export default LoginPage;
