import { Link } from 'react-router-dom';
import { FiChevronRight, FiZap } from 'react-icons/fi';

const OfferBannerCard = ({ banner }) => {
  const bgImage = banner.image
    ? `http://localhost:5000${banner.image}`
    : null;

  return (
    <Link
      to={banner.linkUrl || '/search'}
      className="col-span-full group"
    >
      <div
        className={`relative w-full overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 shadow-md hover:shadow-xl transition-all duration-300 ${
          bgImage ? '' : `bg-gradient-to-r ${banner.bgColor || 'from-primary-600 via-primary-500 to-primary-700'}`
        }`}
        style={{ minHeight: '120px' }}
      >
        {/* Background Image */}
        {bgImage && (
          <img
            src={bgImage}
            alt={banner.title}
            className="w-full h-full object-cover absolute inset-0 group-hover:scale-[1.02] transition-transform duration-500"
          />
        )}

        {/* Overlay gradient for readability */}
        <div className={`absolute inset-0 ${
          bgImage
            ? 'bg-gradient-to-r from-black/60 via-black/30 to-transparent'
            : ''
        }`} />

        {/* Content */}
        <div className="relative z-10 flex items-center justify-between p-4 sm:p-6 h-full min-h-[120px]">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {/* Badge */}
            {banner.badge && (
              <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm text-white flex-shrink-0">
                <FiZap size={22} />
              </div>
            )}
            <div className="min-w-0">
              {banner.badge && (
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-amber-400 text-gray-900 mb-1.5">
                  {banner.badge}
                </span>
              )}
              <h3 className="text-sm sm:text-lg font-black text-white leading-tight truncate">
                {banner.title}
              </h3>
              {banner.subtitle && (
                <p className="text-[11px] sm:text-xs text-white/80 mt-0.5 truncate max-w-md">
                  {banner.subtitle}
                </p>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
            {banner.discount && (
              <span className="hidden md:inline-block px-3 py-1.5 rounded-xl text-xs font-black bg-white text-gray-900 shadow-sm">
                {banner.discount}
              </span>
            )}
            <span className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-white text-[11px] font-bold group-hover:bg-white/30 transition-colors whitespace-nowrap">
              Shop Now <FiChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default OfferBannerCard;
