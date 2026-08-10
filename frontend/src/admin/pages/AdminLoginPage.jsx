import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiUser, FiShield, FiEye, FiEyeOff, FiZap, FiGlobe, FiTrendingUp, FiUsers, FiShoppingBag, FiBarChart2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAdminAuth } from '../context/AdminAuthContext';

const FloatingOrb = ({ size, color, top, left, delay, duration }) => (
  <div
    className="absolute rounded-full opacity-20 animate-float-orb"
    style={{
      width: size,
      height: size,
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      top,
      left,
      animationDelay: delay,
      animationDuration: duration,
    }}
  />
);

const FeatureCard = ({ icon, title, desc, delay }) => (
  <div
    className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 animate-slide-in-left"
    style={{ animationDelay: delay }}
  >
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/30 to-indigo-500/30 flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <div>
      <h4 className="text-white text-sm font-semibold mb-0.5">{title}</h4>
      <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
    </div>
  </div>
);

const AdminLoginPage = () => {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success('Welcome SuperAdmin!');
      navigate('/superadmin@2026');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-gray-950">
      {/* Background Animated Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
      <div className="absolute inset-0 auth-mesh-bg opacity-30" />

      {/* Floating Orbs */}
      <FloatingOrb size="500px" color="#3b82f6" top="-10%" left="-10%" delay="0s" duration="20s" />
      <FloatingOrb size="400px" color="#6366f1" top="60%" left="70%" delay="5s" duration="25s" />
      <FloatingOrb size="300px" color="#8b5cf6" top="30%" left="40%" delay="10s" duration="22s" />

      {/* Left Panel - Admin Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-center px-16 xl:px-20">
        {/* Admin Badge */}
        <div className="animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8">
            <FiShield size={14} className="text-blue-400" />
            <span className="text-xs font-semibold text-blue-300 tracking-wider uppercase">Super Admin Portal</span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-4xl xl:text-5xl font-extrabold text-white mb-4 leading-tight animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
          Command Center
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
            for Your Empire
          </span>
        </h1>
        <p className="text-gray-400 text-base mb-10 max-w-md animate-slide-in-left" style={{ animationDelay: '0.3s' }}>
          Full control over your multi-vendor marketplace. Manage products, users, orders, and revenue from a single powerful dashboard.
        </p>

        {/* Feature Cards */}
        <div className="space-y-3 mb-10">
          <FeatureCard
            icon={<FiBarChart2 className="text-blue-400" size={18} />}
            title="Real-Time Analytics"
            desc="Monitor sales, revenue, and user activity in real-time"
            delay="0.4s"
          />
          <FeatureCard
            icon={<FiUsers className="text-indigo-400" size={18} />}
            title="User Management"
            desc="Control sellers, buyers, and access permissions"
            delay="0.5s"
          />
          <FeatureCard
            icon={<FiGlobe className="text-purple-400" size={18} />}
            title="Full Platform Control"
            desc="Products, categories, orders — everything in one place"
            delay="0.6s"
          />
        </div>

        {/* Stats Row */}
        <div className="flex gap-8 animate-slide-in-left" style={{ animationDelay: '0.7s' }}>
          {[
            { label: 'Uptime', value: '99.9%', icon: <FiZap size={14} className="text-emerald-400" /> },
            { label: 'Security', value: 'AES-256', icon: <FiShield size={14} className="text-blue-400" /> },
            { label: 'Speed', value: '<50ms', icon: <FiTrendingUp size={14} className="text-purple-400" /> },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                {stat.icon}
                <span className="text-lg font-extrabold text-white">{stat.value}</span>
              </div>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 relative z-10 flex items-center justify-center px-6 py-12">
        {/* Glassmorphism Card */}
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/25">
              <FiShield size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Admin Portal</h1>
            <p className="text-sm text-gray-400">Secure access to the control panel</p>
          </div>

          <div className="bg-gray-800/60 backdrop-blur-2xl rounded-3xl p-8 md:p-10 border border-gray-700/50 shadow-2xl shadow-black/20">
            {/* Form Header */}
            <div className="text-center mb-8 hidden lg:block">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/25 animate-pulse-slow">
                <FiShield size={28} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">Welcome Back</h2>
              <p className="text-sm text-gray-400">Enter your credentials to continue</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Username</label>
                <div className="relative group">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                  <input
                    type="text"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-gray-900/60 border border-gray-700 text-white text-sm rounded-xl pl-11 pr-4 py-3.5
                               focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all
                               placeholder-gray-500"
                    placeholder="admin"
                    required
                    id="admin-login-username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Password</label>
                <div className="relative group">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-gray-900/60 border border-gray-700 text-white text-sm rounded-xl pl-11 pr-12 py-3.5
                               focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all
                               placeholder-gray-500"
                    placeholder="••••••••"
                    required
                    id="admin-login-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500
                           text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/25
                           hover:shadow-blue-500/40 active:scale-[0.98] cursor-pointer disabled:opacity-50 mt-2
                           hover:translate-y-[-1px]"
                id="admin-login-submit"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  'Access Dashboard'
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 pt-5 border-t border-gray-700/50 text-center">
              <p className="text-[11px] text-gray-500">
                Default credentials: <span className="text-gray-400 font-medium">admin</span> / <span className="text-gray-400 font-medium">admin@123</span>
              </p>
            </div>
          </div>

          {/* Bottom Security Note */}
          <div className="mt-6 text-center">
            <p className="text-[10px] text-gray-600 flex items-center justify-center gap-1.5">
              <FiLock size={10} />
              Secured with end-to-end encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
