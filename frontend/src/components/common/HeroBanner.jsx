import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import { getImageUrl } from '../../utils/helpers';

const DEFAULT_SLIDES = [
  {
    id: 'default-1',
    badge: '🎉 Big Sale — Up to 70% Off!',
    title: 'Discover Amazing Products Today',
    subtitle: 'Shop from thousands of verified sellers across India. Unbeatable prices on electronics, fashion & home essentials.',
    linkUrl: '/search',
    bgColor: 'from-primary-600 via-primary-500 to-primary-700',
    stat1: '10,000+ Products',
    stat2: '500+ Sellers',
  },
  {
    id: 'default-2',
    badge: '⚡ Limited Time Mega Offer',
    title: 'Top Electronics & Tech Gadgets',
    subtitle: 'Upgrade your digital life with smartphones, laptops, 4K TVs, audio gear and accessories at wholesale prices.',
    linkUrl: '/search?category=electronics',
    bgColor: 'from-purple-700 via-indigo-600 to-blue-700',
    stat1: 'Fast Shipping',
    stat2: '100% Genuine',
  },
  {
    id: 'default-3',
    badge: '🔥 Season Clearance Deals',
    title: 'Trending Fashion & Lifestyle Collection',
    subtitle: 'Express your personal style with top clothing brands, designer sarees, sneakers & accessories with instant discounts.',
    linkUrl: '/search?category=fashion',
    bgColor: 'from-amber-600 via-orange-500 to-red-600',
    stat1: 'New Arrivals',
    stat2: 'Best Quality',
  },
];

const HeroBanner = ({ banners = [] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const activeSlides = banners.length > 0 ? banners : DEFAULT_SLIDES;

  // 5-second auto-slide hero timer
  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  return (
    <section className="relative overflow-hidden">
      {activeSlides.map((slide, index) => {
        const isCurrent = index === currentSlide;
        const bgGradient = slide.bgColor || 'from-primary-600 via-primary-500 to-primary-700';

        return (
          <div
            key={slide.id || index}
            className={`transition-all duration-700 ease-in-out ${
              isCurrent ? 'block opacity-100' : 'hidden opacity-0'
            }`}
          >
            <div className={`relative bg-gradient-to-r ${bgGradient} text-white py-8 sm:py-12 lg:py-20 overflow-hidden`}>
              {/* Background Orbs */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 right-10 w-60 h-60 bg-accent-400 rounded-full blur-3xl"></div>
              </div>

              <div className="container-main relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
                  {/* Left Slide Content */}
                  <div className="text-center lg:text-left max-w-xl animate-fade-in">
                    <span className="inline-block bg-white/20 text-white text-[11px] sm:text-xs font-bold px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full mb-2.5 sm:mb-3 backdrop-blur-sm shadow-sm">
                      {slide.badge || slide.discount || '🎉 Special Offer'}
                    </span>
                    <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white mb-2.5 sm:mb-4 leading-tight">
                      {slide.title}
                    </h2>
                    <p className="text-white/90 text-xs sm:text-sm md:text-base mb-4 sm:mb-6 leading-relaxed max-w-md mx-auto lg:mx-0">
                      {slide.subtitle || 'Shop from top verified sellers with instant discounts.'}
                    </p>
                    <div className="flex flex-row gap-2.5 justify-center lg:justify-start">
                      <Link
                        to={slide.linkUrl || '/search'}
                        className="btn bg-white text-primary-600 hover:bg-gray-50 font-bold px-5 py-2.5 sm:px-8 sm:py-3 text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all"
                      >
                        Explore Deals <FiArrowRight size={16} />
                      </Link>
                      <Link
                        to="/categories"
                        className="btn border-2 border-white/50 text-white hover:bg-white/10 font-medium px-4 py-2.5 sm:px-8 sm:py-3 text-xs sm:text-sm backdrop-blur-sm"
                      >
                        All Categories
                      </Link>
                    </div>
                  </div>

                  {/* Right Side Visual Showcase Card */}
                  <div className="hidden lg:block">
                    <div className="relative w-96 h-72 flex items-center justify-center">
                      {slide.image ? (
                        <div className="w-full h-64 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20">
                          <img src={getImageUrl(slide.image)} alt={slide.title} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="relative w-96 h-72">
                          <div className="absolute top-0 right-0 w-64 h-56 bg-white/10 rounded-3xl backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl">
                            <div className="text-center text-white">
                              <p className="text-5xl mb-2">🛍️</p>
                              <p className="text-xl font-black">{slide.stat1 || '10,000+'}</p>
                              <p className="text-xs text-white/80">Products Available</p>
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 w-44 h-40 bg-accent-500/20 rounded-2xl backdrop-blur-md border border-accent-400/30 flex items-center justify-center shadow-lg">
                            <div className="text-center text-white">
                              <p className="text-3xl mb-1">🏪</p>
                              <p className="text-base font-bold">{slide.stat2 || '500+'}</p>
                              <p className="text-[10px] text-white/80">Verified Sellers</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Slide Navigation Buttons */}
      {activeSlides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/25 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-sm transition-all z-20 shadow-md"
            title="Previous Banner"
          >
            <FiChevronLeft size={20} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/25 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-sm transition-all z-20 shadow-md"
            title="Next Banner"
          >
            <FiChevronRight size={20} />
          </button>
        </>
      )}

      {/* Carousel Dots */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {activeSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2.5 rounded-full transition-all ${
                idx === currentSlide ? 'w-8 bg-white' : 'w-2.5 bg-white/40 hover:bg-white/70'
              }`}
              title={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroBanner;
