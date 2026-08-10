import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FiShoppingCart, FiZap, FiTruck, FiShield, FiChevronRight, FiMinus, FiPlus,
  FiShare2, FiX, FiCheckCircle, FiArrowRight, FiMapPin, FiRotateCcw, FiChevronDown,
  FiThumbsUp, FiHelpCircle, FiStar
} from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { productAPI, reviewAPI } from '../services/api';
import { formatPrice, getImageUrl } from '../utils/helpers';
import Rating from '../components/common/Rating';
import Loader from '../components/common/Loader';
import AddressManager, { getActiveDeliveryAddress } from '../components/common/AddressManager';
import useAuth from '../hooks/useAuth';
import useCart from '../hooks/useCart';

const ProductPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const slug = params.slug || params.categorySlug;
  const { isAuthenticated } = useAuth();
  const { addToCart, summary, itemCount } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAddedToCartModal, setShowAddedToCartModal] = useState(false);

  // Accordion Section States
  const [openHighlights, setOpenHighlights] = useState(true);
  const [openAllDetails, setOpenAllDetails] = useState(true);
  const [openRatings, setOpenRatings] = useState(true);
  const [openQA, setOpenQA] = useState(true);

  // Location State & Modal
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [activeAddress, setActiveAddress] = useState(getActiveDeliveryAddress());

  // Reviews State & Modal
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [reviewsList, setReviewsList] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Write Review State
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [showInPageReview, setShowInPageReview] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchReviews = async (productId) => {
    setLoadingReviews(true);
    try {
      const res = await reviewAPI.getByProduct(productId);
      setReviewsList(res.data.data.reviews || []);
    } catch {
      // Fallback
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      try {
        const res = await productAPI.getBySlug(slug);
        const prodData = res.data.data.product;
        setProduct(prodData);
        if (prodData && prodData.minOrderQuantity && prodData.minOrderQuantity > 1) {
          setQuantity(prodData.minOrderQuantity);
        }
      } catch {
        toast.error('Product not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  useEffect(() => {
    if (product?.id) {
      fetchReviews(product.id);
    }
  }, [product?.id]);

  const handleSaveLocation = (pincode, city) => {
    const locObj = { pincode, city: city || 'Selected City' };
    localStorage.setItem('userLocation', JSON.stringify(locObj));
    setShowLocationModal(false);
    toast.success(`Delivery pincode set to ${pincode}`);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    if (!newReviewTitle || !newReviewComment) {
      return toast.error('Please fill in review title and details');
    }
    setSubmittingReview(true);
    try {
      const res = await reviewAPI.create(product.id, {
        rating: newRating,
        title: newReviewTitle,
        comment: newReviewComment,
      });
      toast.success('Thank you! Your review has been published.');
      setReviewsList(res.data.data.reviews || []);
      setProduct((prev) => ({
        ...prev,
        rating: res.data.data.rating,
        numReviews: res.data.data.numReviews,
      }));
      setShowWriteReview(false);
      setShowInPageReview(false);
      setNewReviewTitle('');
      setNewReviewComment('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    setAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
      setShowAddedToCartModal(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add item to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    setAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
      navigate('/checkout');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process checkout');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) return <Loader fullScreen />;
  if (!product) return (
    <div className="section text-center py-20">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Product Not Found</h2>
      <Link to="/" className="btn-primary">Return to Store</Link>
    </div>
  );

  const images = product.images?.length > 0 ? product.images : [null];

  return (
    <div className="bg-surface-50 dark:bg-gray-950 min-h-screen pb-20 md:pb-12">
      {/* Breadcrumb */}
      <div className="container-main py-3">
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <Link to="/" className="hover:text-primary-500">Home</Link>
          <FiChevronRight size={12} />
          {product.category && (
            <>
              <Link to={`/category/${product.category.slug}`} className="hover:text-primary-500">{product.category.name}</Link>
              <FiChevronRight size={12} />
            </>
          )}
          <span className="text-gray-800 dark:text-gray-200 truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      {/* Product Detail */}
      <div className="container-main">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-card overflow-hidden border border-gray-100 dark:border-gray-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left: Product Images Gallery */}
            <div className="p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-800">
              <div className="sticky top-24 space-y-4">
                {/* Main Showcase Image */}
                <div className="aspect-square bg-surface-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center p-8 overflow-hidden border border-gray-100 dark:border-gray-700/60 relative">
                  <img
                    src={getImageUrl(images[selectedImage])}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
                  />
                  {product.discount > 0 && (
                    <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-md">
                      {product.discount}% OFF
                    </span>
                  )}
                </div>
                {/* Image Thumbnails */}
                {images.length > 1 && (
                  <div className="flex gap-3 justify-center overflow-x-auto py-1">
                    {images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImage(i)}
                        className={`w-16 h-16 rounded-xl border-2 overflow-hidden flex items-center justify-center bg-surface-50 dark:bg-gray-800 transition-all ${
                          selectedImage === i ? 'border-primary-500 shadow-md' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <img src={getImageUrl(img)} alt="" className="max-h-full max-w-full object-contain p-1" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Detailed Product Information & Controls */}
            <div className="p-6 lg:p-8 space-y-6">
              <div>
                {product.brand && (
                  <span className="text-xs font-extrabold text-primary-600 dark:text-primary-400 uppercase tracking-widest block mb-1">
                    {product.brand}
                  </span>
                )}
                <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white leading-tight">
                  {product.name}
                </h1>
                <Rating value={parseFloat(product.rating) || 0} count={product.numReviews || 0} size="md" />
              </div>

              {/* Price Banner */}
              <div className="bg-surface-50 dark:bg-gray-800/80 rounded-2xl p-5 border border-gray-100 dark:border-gray-700/60">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-gray-900 dark:text-white">{formatPrice(product.price)}</span>
                  {product.discount > 0 && (
                    <>
                      <span className="text-lg text-gray-400 line-through">{formatPrice(product.mrp)}</span>
                      <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">{product.discount}% off</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">Inclusive of all taxes • Best Price Guaranteed</p>
              </div>

              {/* Quantity Selector & MOQ Badge */}
              {product.stock > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Quantity:</span>
                    <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
                      <button
                        onClick={() => setQuantity(Math.max(product.minOrderQuantity || 1, quantity - 1))}
                        disabled={quantity <= (product.minOrderQuantity || 1)}
                        className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                        title={quantity <= (product.minOrderQuantity || 1) ? `Minimum Order Quantity is ${product.minOrderQuantity || 1}` : 'Decrease'}
                      >
                        <FiMinus size={16} />
                      </button>
                      <span className="px-4 text-sm font-extrabold text-gray-800 dark:text-gray-200 border-x border-gray-200 dark:border-gray-700 min-w-[2.5rem] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
                      >
                        <FiPlus size={16} />
                      </button>
                    </div>
                  </div>

                  {product.minOrderQuantity > 1 && (
                    <div className="p-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl inline-flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
                      <span className="font-black text-amber-600">📦 Minimum Order Quantity:</span>
                      <span className="font-extrabold">{product.minOrderQuantity} units required per order</span>
                    </div>
                  )}
                </div>
              )}

              {/* Desktop Desktop Actions */}
              <div className="hidden md:flex gap-3 pt-1">
                <button onClick={handleAddToCart} disabled={addingToCart || product.stock === 0}
                  className="btn-primary flex-1 py-3.5 text-sm font-extrabold shadow-md hover:shadow-lg" id="add-to-cart-btn">
                  {addingToCart ? 'Adding...' : <><FiShoppingCart size={18} /> Add to Cart</>}
                </button>
                <button onClick={handleBuyNow} disabled={addingToCart || product.stock === 0}
                  className="btn-accent flex-1 py-3.5 text-sm font-black uppercase tracking-wider shadow-md hover:shadow-lg" id="buy-now-btn">
                  <FiZap size={18} /> Buy Now
                </button>
              </div>

              {/* 🚚 Delivery Details Widget */}
              <div className="bg-surface-50 dark:bg-gray-800/60 rounded-2xl p-4 border border-gray-200/80 dark:border-gray-700/60 space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400">Delivery details</h4>
                
                <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950/40 p-3.5 rounded-2xl border border-blue-100 dark:border-blue-900/50">
                  <div className="flex items-center gap-2.5 text-xs font-bold text-gray-900 dark:text-white">
                    <FiMapPin className="text-primary-500 flex-shrink-0" size={18} />
                    <div>
                      <p className="font-extrabold text-gray-900 dark:text-white">
                        Deliver to: {activeAddress ? `${activeAddress.name} - ${activeAddress.pincode}` : 'Rohit Kumar - 832108'}
                      </p>
                      <p className="text-[11px] text-gray-500 font-medium line-clamp-1">
                        {activeAddress ? `${activeAddress.streetAddress}, ${activeAddress.city}` : 'Near Vani Vidya Mandir School, Jamshedpur'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowLocationModal(true)}
                    className="text-xs text-primary-600 dark:text-primary-400 font-black cursor-pointer hover:underline bg-transparent border-0 flex-shrink-0 ml-2"
                  >
                    Select location &gt;
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700">
                  <span className="text-emerald-600 dark:text-emerald-400 italic font-black">EXPRESS</span>
                  <span>Delivery in 2 days</span>
                </div>

                {product.seller && (
                  <div className="text-xs text-gray-600 dark:text-gray-300 pt-1 flex items-start gap-2">
                    <div className="w-5 h-5 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold mt-0.5">
                      🏪
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 dark:text-gray-200">
                        Fulfilled by {product.seller.storeName || product.seller.name || 'InduKart RetailNet'}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        4.4★ • 10 years with InduKart
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Brand / Product Warranty Banner (Managed by SuperAdmin) */}
              {product.warrantyPolicy && product.warrantyPolicy !== 'No Warranty' && product.warrantyPolicy !== 'None' && (
                <div className="bg-blue-50/60 dark:bg-blue-950/40 p-3.5 rounded-2xl border border-blue-100 dark:border-blue-900/50 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 flex items-center justify-center shadow-xs border border-blue-100 dark:border-gray-700 flex-shrink-0">
                    <FiShield size={18} />
                  </div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    {product.warrantyPolicy.toLowerCase().includes('covered') || product.warrantyPolicy.toLowerCase().includes('warranty') || product.warrantyPolicy.toLowerCase().includes('guarantee')
                      ? product.warrantyPolicy
                      : `${product.brand ? `${product.brand} ` : ''}Products are covered by ${product.warrantyPolicy}`}
                  </p>
                </div>
              )}

              {/* 3-Column Policy Icons */}
              <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-100 dark:border-gray-800 text-center">
                <div className="p-2 flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-gray-800 text-blue-500 flex items-center justify-center mb-1">
                    <FiRotateCcw size={16} />
                  </div>
                  <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 leading-tight">
                    {product.returnPolicy || '10-Day Return'}
                  </span>
                </div>
                {product.isCodAvailable !== false && (
                  <div className="p-2 flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-gray-800 text-emerald-500 flex items-center justify-center mb-1">
                      <FiZap size={16} />
                    </div>
                    <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 leading-tight">Cash on Delivery</span>
                  </div>
                )}
                {product.isFreeDelivery !== false && (
                  <div className="p-2 flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-gray-800 text-indigo-500 flex items-center justify-center mb-1">
                      <FiShield size={16} />
                    </div>
                    <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 leading-tight">Free Delivery</span>
                  </div>
                )}
              </div>

              {/* Product Highlights Section */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => setOpenHighlights(!openHighlights)}
                  className="w-full flex items-center justify-between py-2 text-left"
                >
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Product highlights</h3>
                  <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                    <FiChevronDown className={`transition-transform duration-200 ${openHighlights ? 'rotate-180' : ''}`} size={16} />
                  </div>
                </button>
                
                {openHighlights && (
                  <div className="grid grid-cols-2 gap-4 pt-3 text-xs">
                    <div>
                      <span className="text-gray-400 font-medium block mb-0.5">Brand</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200">{product.brand || 'InduKart Direct'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block mb-0.5">Category</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200">{product.category?.name || 'General'}</span>
                    </div>
                    {product.specifications && Object.entries(product.specifications).slice(0, 4).map(([k, v]) => (
                      <div key={k}>
                        <span className="text-gray-400 font-medium block mb-0.5">{k}</span>
                        <span className="font-bold text-gray-800 dark:text-gray-200">{v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* All Details Section */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => setOpenAllDetails(!openAllDetails)}
                  className="w-full flex items-center justify-between py-2 text-left"
                >
                  <div>
                    <h3 className="text-base font-extrabold text-gray-900 dark:text-white">All details</h3>
                    <p className="text-xs text-gray-400">Features, description and specs</p>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                    <FiChevronDown className={`transition-transform duration-200 ${openAllDetails ? 'rotate-180' : ''}`} size={16} />
                  </div>
                </button>
                
                {openAllDetails && (
                  <div className="space-y-4 pt-3 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                    <p className="whitespace-pre-line">{product.description}</p>
                    
                    {product.specifications && Object.keys(product.specifications).length > 0 && (
                      <div className="bg-surface-50 dark:bg-gray-800/60 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 space-y-2">
                        <h4 className="font-extrabold text-gray-800 dark:text-gray-200 text-xs uppercase tracking-wider mb-2">Technical Specifications</h4>
                        {Object.entries(product.specifications).map(([key, value]) => (
                          <div key={key} className="flex py-1 border-b border-gray-200/60 dark:border-gray-700/60 last:border-0">
                            <span className="w-1/3 text-gray-400 font-semibold">{key}</span>
                            <span className="w-2/3 text-gray-800 dark:text-gray-200 font-bold">{value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Ratings and Reviews Section */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => setOpenRatings(!openRatings)}
                  className="w-full flex items-center justify-between py-2 text-left"
                >
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Ratings and reviews</h3>
                  <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                    <FiChevronDown className={`transition-transform duration-200 ${openRatings ? 'rotate-180' : ''}`} size={16} />
                  </div>
                </button>

                {openRatings && (
                  <div className="space-y-5 pt-3">
                    {/* ✍️ ALWAYS VISIBLE IN-PAGE REVIEW FORM */}
                    <form onSubmit={handleReviewSubmit} className="bg-surface-50 dark:bg-gray-800/80 p-5 rounded-3xl border border-primary-200 dark:border-primary-900/50 space-y-4 shadow-sm">
                      <div className="flex items-center justify-between border-b border-gray-200/60 dark:border-gray-700/60 pb-3">
                        <h4 className="text-xs font-black uppercase tracking-wider text-primary-600 dark:text-primary-400 flex items-center gap-1.5">
                          ✍️ Rate & Review this Product
                        </h4>
                        <span className="text-[10px] text-gray-400 font-semibold">Share your honest feedback</span>
                      </div>

                      {/* Interactive Star Rating Selector */}
                      <div>
                        <label className="input-label text-xs font-bold block mb-1">Your Rating *</label>
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewRating(star)}
                              className="p-1 cursor-pointer transition-transform hover:scale-110 focus:outline-none"
                            >
                              <FaStar
                                size={24}
                                className={star <= newRating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}
                              />
                            </button>
                          ))}
                          <span className="text-xs font-black text-amber-500 ml-2">
                            {newRating} / 5 Stars
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="input-label text-xs font-bold">Review Title / Headline *</label>
                        <input
                          type="text"
                          value={newReviewTitle}
                          onChange={(e) => setNewReviewTitle(e.target.value)}
                          placeholder="e.g. Excellent quality product & fast delivery!"
                          className="input text-xs font-semibold"
                          required
                        />
                      </div>

                      <div>
                        <label className="input-label text-xs font-bold">Detailed Review Comment *</label>
                        <textarea
                          value={newReviewComment}
                          onChange={(e) => setNewReviewComment(e.target.value)}
                          placeholder="Write your detailed experience about the material, fit, performance..."
                          className="input text-xs min-h-[90px] font-medium"
                          required
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-1">
                        <button
                          type="submit"
                          disabled={submittingReview}
                          className="btn-accent text-xs font-extrabold px-6 py-2.5 flex items-center gap-2 shadow-sm"
                        >
                          {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </button>
                      </div>
                    </form>

                    {/* 📊 EXISTING REVIEWS OR ZERO STATE */}
                    {product.numReviews > 0 && reviewsList.length > 0 ? (
                      <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                        {/* Overall Score Pill */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-1">
                              {parseFloat(product.rating).toFixed(1)} <FaStar className="text-emerald-500" size={18} />
                            </span>
                            <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs rounded-lg border border-emerald-200 dark:border-emerald-900/50">
                              {parseFloat(product.rating) >= 4 ? 'Very Good' : parseFloat(product.rating) >= 3 ? 'Good' : 'Average'}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {product.numReviews} {product.numReviews === 1 ? 'rating' : 'ratings'}
                          </span>
                        </div>

                        {/* Real Verified Reviews Cards */}
                        <div className="space-y-3 pt-1">
                          {reviewsList.map((rev) => (
                            <div key={rev.id} className="bg-surface-50 dark:bg-gray-800/80 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/60 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="px-1.5 py-0.5 bg-emerald-600 text-white font-extrabold text-[11px] rounded flex items-center gap-0.5">
                                    {rev.rating} ★
                                  </span>
                                  <h5 className="font-extrabold text-xs text-gray-900 dark:text-white">{rev.title}</h5>
                                </div>
                                <span className="text-[10px] text-gray-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-300">{rev.comment}</p>
                              <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                                <span className="font-semibold text-gray-500 dark:text-gray-400">{rev.user?.name || 'Customer'}</span>
                                <span className="flex items-center gap-1 font-bold text-gray-600 dark:text-gray-300"><FiThumbsUp size={12} /> {rev.helpfulCount || 1}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-surface-50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 text-center">
                        <p className="text-xs text-gray-400">No customer reviews yet. Be the first to submit a review above!</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Questions and Answers FAQ Accordion */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => setOpenQA(!openQA)}
                  className="w-full flex items-center justify-between py-2 text-left"
                >
                  <div>
                    <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Questions and Answers</h3>
                    <p className="text-xs text-gray-400">Find answers to commonly asked questions</p>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                    <FiChevronDown className={`transition-transform duration-200 ${openQA ? 'rotate-180' : ''}`} size={16} />
                  </div>
                </button>

                {openQA && (
                  <div className="space-y-3 pt-3 text-xs">
                    {(() => {
                      const customQaText = product.specifications?.qaText;
                      let qaList = [];
                      if (customQaText) {
                        customQaText.split('|').forEach(part => {
                          const [qPart, aPart] = part.split(': A:');
                          if (qPart && aPart) {
                            qaList.push({
                              q: qPart.replace(/^Q:\s*/i, '').trim(),
                              a: aPart.trim()
                            });
                          } else {
                            const matchQ = part.match(/Q:\s*(.*?)(?=\s*A:|$)/i);
                            const matchA = part.match(/A:\s*(.*)/i);
                            if (matchQ && matchA) {
                              qaList.push({ q: matchQ[1].trim(), a: matchA[1].trim() });
                            }
                          }
                        });
                      }

                      if (qaList.length === 0) {
                        qaList = [
                          {
                            q: 'Is this product covered under brand warranty?',
                            a: `Yes, 100% original product directly covered by ${product.warrantyPolicy || '1 Year Brand Warranty'}.`
                          },
                          {
                            q: 'Can I return or exchange this item?',
                            a: `Yes, ${product.returnPolicy || '7 Days Replacement Policy'} applies from delivery date.`
                          },
                          {
                            q: 'Is Cash on Delivery (COD) available for this product?',
                            a: product.isCodAvailable !== false ? 'Yes, Cash on Delivery is available for all verified pincodes.' : 'Prepaid payment required for this item.'
                          }
                        ];
                      }

                      return qaList.map((qaItem, idx) => (
                        <div key={idx} className="p-3.5 bg-surface-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60 space-y-1.5">
                          <p className="font-extrabold text-gray-900 dark:text-white flex items-start gap-2">
                            <FiHelpCircle className="text-primary-500 mt-0.5 flex-shrink-0" size={16} />
                            <span>Q: {qaItem.q}</span>
                          </p>
                          <p className="text-gray-600 dark:text-gray-300 pl-6 font-medium text-xs leading-relaxed">
                            A: {qaItem.a}
                          </p>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 📱 STICKY MOBILE BOTTOM ACTION BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 p-3 flex gap-3 shadow-2xl">
        <button
          onClick={handleAddToCart}
          disabled={addingToCart || product.stock === 0}
          className="btn border-2 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5"
        >
          <FiShoppingCart size={16} /> Add to Cart
        </button>
        <button
          onClick={handleBuyNow}
          disabled={addingToCart || product.stock === 0}
          className="btn-accent flex-1 py-3 text-xs font-black uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5"
        >
          Buy at {formatPrice(product.price)}
        </button>
      </div>

      {/* Sleek High-Converting Login Required Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-800 text-center relative animate-scale-in">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <FiX size={20} />
            </button>
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl shadow-sm">
              🛍️
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">
              Sign In to Continue
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              Please log in to your InduKart account to add <strong className="text-gray-800 dark:text-gray-200">"{product?.name}"</strong> to your cart and complete your purchase.
            </p>
            <div className="space-y-2.5">
              <Link
                to={`/login?redirect=${encodeURIComponent(window.location.pathname)}`}
                className="btn-primary w-full py-3 text-sm font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                Sign In Now <FiChevronRight size={16} />
              </Link>
              <Link
                to="/register"
                className="btn border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 w-full py-3 text-sm font-bold flex items-center justify-center"
              >
                Create New Account
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Amazon-Style Added to Cart Confirmation Modal */}
      {showAddedToCartModal && product && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-gray-100 dark:border-gray-800 relative animate-scale-in">
            <button
              onClick={() => setShowAddedToCartModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <FiX size={20} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Left: Product Thumbnail & Success Status */}
              <div className="flex items-center gap-4 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 pb-4 md:pb-0 md:pr-6">
                <div className="w-20 h-20 bg-surface-50 dark:bg-gray-800 rounded-2xl p-2 border border-gray-200 dark:border-gray-700 flex items-center justify-center flex-shrink-0">
                  <img src={getImageUrl(product.images?.[0])} alt={product.name} className="max-h-full max-w-full object-contain" />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-base mb-1">
                    <FiCheckCircle size={20} /> Added to Cart
                  </div>
                  <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 line-clamp-2">{product.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">Qty: {quantity} • {formatPrice(product.price * quantity)}</p>
                </div>
              </div>

              {/* Right: Cart Subtotal & Action CTAs */}
              <div className="space-y-4">
                {/* Free Delivery Bar */}
                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-900/50">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-1.5">
                    <span>🚚 Eligible for FREE Delivery</span>
                    <span>100%</span>
                  </div>
                  <div className="w-full bg-emerald-200 dark:bg-emerald-900 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-full rounded-full animate-pulse"></div>
                  </div>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cart Subtotal:</span>
                  <span className="text-xl font-black text-gray-900 dark:text-white">
                    {formatPrice(summary?.totalPrice || product.price * quantity)}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <Link
                    to="/checkout"
                    className="btn-accent flex-1 py-3 text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg flex items-center justify-center gap-1.5"
                  >
                    Proceed to Buy ({itemCount || 1} items) <FiArrowRight size={16} />
                  </Link>
                  <Link
                    to="/cart"
                    className="btn border-2 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 flex-1 py-3 text-xs font-bold flex items-center justify-center"
                  >
                    Go to Cart
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 📍 DELIVERY LOCATION & ADDRESS MANAGEMENT MODAL */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 dark:border-gray-800 relative animate-scale-up space-y-4">
            <button
              onClick={() => setShowLocationModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full"
            >
              <FiX size={18} />
            </button>

            <AddressManager
              isModal={true}
              activeAddressId={activeAddress?.id}
              onSelectAddress={(addr) => {
                setActiveAddress(addr);
                setShowLocationModal(false);
                toast.success(`Delivery address set to ${addr.name} (${addr.pincode})`);
              }}
              onClose={() => setShowLocationModal(false)}
            />
          </div>
        </div>
      )}

      {/* ⭐ ALL PRODUCT REVIEWS & WRITE REVIEW MODAL */}
      {showReviewsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 dark:border-gray-800 relative animate-scale-up space-y-5">
            <button
              onClick={() => setShowReviewsModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full"
            >
              <FiX size={18} />
            </button>

            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white">Product Reviews & Ratings</h3>
                <p className="text-xs text-gray-400">Real customer feedback for {product.name}</p>
              </div>
              <button
                onClick={() => {
                  if (!isAuthenticated) setShowAuthModal(true);
                  else setShowWriteReview(!showWriteReview);
                }}
                className="btn-accent text-xs font-extrabold px-4 py-2"
              >
                ✍️ Write a Review
              </button>
            </div>

            {/* Write Review Form */}
            {showWriteReview && (
              <form onSubmit={handleReviewSubmit} className="bg-surface-50 dark:bg-gray-800/80 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-700 space-y-3">
                <h4 className="font-extrabold text-xs text-gray-900 dark:text-white uppercase tracking-wider">Share Your Product Rating</h4>
                
                {/* 5 Star Picker */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-500 mr-2">Select Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      className="p-1 hover:scale-125 transition-transform cursor-pointer"
                    >
                      <FaStar size={22} className={star <= newRating ? 'text-amber-500' : 'text-gray-300 dark:text-gray-600'} />
                    </button>
                  ))}
                  <span className="text-xs font-extrabold text-amber-500 ml-2">{newRating} Stars</span>
                </div>

                <input
                  type="text"
                  value={newReviewTitle}
                  onChange={(e) => setNewReviewTitle(e.target.value)}
                  placeholder="Review Headline (e.g. Superb quality & comfortable fit!)"
                  className="input text-xs font-semibold"
                  required
                />

                <textarea
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  placeholder="Write your detailed experience with this product..."
                  className="input text-xs min-h-[80px]"
                  required
                />

                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowWriteReview(false)} className="btn text-xs px-3 py-1.5">
                    Cancel
                  </button>
                  <button type="submit" disabled={submittingReview} className="btn-primary text-xs font-extrabold px-5 py-1.5">
                    {submittingReview ? 'Publishing...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            )}

            {/* Reviews List */}
            {loadingReviews ? (
              <div className="py-8 text-center text-xs text-gray-400">Loading reviews...</div>
            ) : reviewsList.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <p className="text-3xl">⭐</p>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">No reviews submitted yet</p>
                <p className="text-xs text-gray-400">Be the first verified customer to leave a review for this product!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviewsList.map((rev) => (
                  <div key={rev.id} className="bg-surface-50 dark:bg-gray-800/80 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 bg-emerald-600 text-white font-extrabold text-[11px] rounded flex items-center gap-0.5">
                          {rev.rating} ★
                        </span>
                        <h5 className="font-extrabold text-xs text-gray-900 dark:text-white">{rev.title}</h5>
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300">{rev.comment}</p>
                    <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                      <span className="font-semibold text-gray-500 dark:text-gray-400">
                        {rev.user?.name || 'Customer'}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-gray-600 dark:text-gray-300">
                        <FiThumbsUp size={12} /> {rev.helpfulCount || 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;
