import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiFacebook, FiTwitter, FiInstagram, FiYoutube, FiMail,
  FiPhone, FiMapPin, FiChevronRight, FiAward
} from 'react-icons/fi';
import { brandAPI } from '../../services/api';
import { getImageUrl } from '../../utils/helpers';

const DEFAULT_BRANDS = [
  { id: 'b1', name: 'Apple', logo: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=200&auto=format&fit=crop&q=80' },
  { id: 'b2', name: 'Sony', logo: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200&auto=format&fit=crop&q=80' },
  { id: 'b3', name: 'Samsung', logo: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&auto=format&fit=crop&q=80' },
  { id: 'b4', name: 'Nike', logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=80' },
  { id: 'b5', name: 'Xiaomi (Mi)', logo: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&auto=format&fit=crop&q=80' },
  { id: 'b6', name: 'Bata', logo: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=200&auto=format&fit=crop&q=80' },
  { id: 'b7', name: 'OPPO', logo: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=200&auto=format&fit=crop&q=80' },
  { id: 'b8', name: 'Vivo', logo: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=200&auto=format&fit=crop&q=80' },
  { id: 'b9', name: 'Mamaearth', logo: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&auto=format&fit=crop&q=80' },
  { id: 'b10', name: 'WOW Skin Science', logo: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&auto=format&fit=crop&q=80' },
  { id: 'b11', name: 'Plum', logo: 'https://images.unsplash.com/photo-1608248597263-0044e3e21422?w=200&auto=format&fit=crop&q=80' },
  { id: 'b12', name: 'SoundPro', logo: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80' },
];

const Footer = () => {
  const [brands, setBrands] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const res = await brandAPI.getAll();
      if (res.data?.data?.brands && res.data.data.brands.length > 0) {
        setBrands(res.data.data.brands);
      } else {
        setBrands(DEFAULT_BRANDS);
      }
    } catch {
      setBrands(DEFAULT_BRANDS);
    }
  };

  const activeBrands = brands.length > 0 ? brands : DEFAULT_BRANDS;
  // Duplicate array to form a continuous infinite loop ticker
  const tickerBrands = [...activeBrands, ...activeBrands];

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 mt-auto border-t border-gray-800 transition-colors">
      {/* Main Footer Links */}
      <div className="container-main py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3 group py-1">
              <div className="w-11 h-11 rounded-2xl bg-white p-1 border border-gray-200 shadow-md group-hover:scale-105 transition-transform flex items-center justify-center flex-shrink-0">
                <img src="/InduKart.png" alt="InduKart Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-white font-black text-2xl leading-none tracking-tight">
                  Indu<span className="text-primary-400">Kart</span>
                </h3>
                <p className="text-gray-400 text-[10px] font-bold tracking-widest uppercase mt-0.5">
                  India's Premier Marketplace
                </p>
              </div>
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              Connecting millions of buyers with verified sellers across India. Shop genuine electronics, fashion, home essentials, and lifestyle products with complete confidence.
            </p>
            <div className="pt-2">
              <p className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3">Connect With Us</p>
              <div className="flex gap-2.5">
                {[
                  { icon: <FiFacebook size={16} />, label: 'Facebook' },
                  { icon: <FiTwitter size={16} />, label: 'Twitter' },
                  { icon: <FiInstagram size={16} />, label: 'Instagram' },
                  { icon: <FiYoutube size={16} />, label: 'YouTube' },
                ].map((social, i) => (
                  <a
                    key={i}
                    href="#"
                    aria-label={social.label}
                    className="w-9 h-9 bg-gray-800 hover:bg-primary-500 text-gray-400 hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 hover:-translate-y-1 shadow-sm"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-primary-500 pl-2">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 group">
                  <FiChevronRight size={12} className="text-primary-500 group-hover:translate-x-1 transition-transform" /> Home
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 group">
                  <FiChevronRight size={12} className="text-primary-500 group-hover:translate-x-1 transition-transform" /> Categories Hub
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 group">
                  <FiChevronRight size={12} className="text-primary-500 group-hover:translate-x-1 transition-transform" /> All Products
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 group">
                  <FiChevronRight size={12} className="text-primary-500 group-hover:translate-x-1 transition-transform" /> Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 group">
                  <FiChevronRight size={12} className="text-primary-500 group-hover:translate-x-1 transition-transform" /> My Orders & Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-accent-500 pl-2">
              Customer Support
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center & FAQ</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Track Your Order</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Return & Refund Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Shipping & Delivery Info</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-emerald-500 pl-2">
              Contact Us
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5 text-gray-400">
                <FiMapPin size={16} className="text-primary-400 flex-shrink-0 mt-0.5" />
                <span>123 InduKart Tower, Tech Park, Bandra East, Mumbai, Maharashtra 400051</span>
              </li>
              <li className="flex items-center gap-2.5 text-gray-400">
                <FiPhone size={15} className="text-primary-400 flex-shrink-0" />
                <span>+91 (022) 1800-456-7890</span>
              </li>
              <li className="flex items-center gap-2.5 text-gray-400">
                <FiMail size={15} className="text-primary-400 flex-shrink-0" />
                <span>support@indukart.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Bottom Footer & Accepted Payments */}
      <div className="bg-gray-950 border-t border-gray-800/80 py-5">
        <div className="container-main flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} <strong className="text-gray-400">InduKart Marketplaces Ltd.</strong> All rights reserved.
          </p>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">100% Safe Payments:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {['Visa', 'Mastercard', 'UPI', 'RuPay', 'NetBanking', 'EMI'].map((method) => (
                <span
                  key={method}
                  className="bg-gray-800 text-gray-300 text-[10px] font-bold px-2.5 py-1 rounded-md border border-gray-700/60 shadow-sm"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
