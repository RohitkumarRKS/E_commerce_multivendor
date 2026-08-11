import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiPlus, FiMinus, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { formatPrice, getImageUrl, truncateText } from '../../utils/helpers';
import Rating from './Rating';
import useAuth from '../../hooks/useAuth';
import useCart from '../../hooks/useCart';

const ProductCard = ({ product }) => {
  const { isAuthenticated } = useAuth();
  const { cart, addToCart, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const mainImage = product.images?.[0] || null;
  const cleanSlug = product.slug ? product.slug.replace(/-\d{10,}$/, '') : '';
  const productUrl = product.category?.slug
    ? `/category/${product.category.slug}/${cleanSlug}`
    : `/product/${cleanSlug}`;

  // Find if this product is already in user's cart
  const cartItem = cart?.items?.find(
    (item) => item.productId === product.id || item.product?.id === product.id
  );
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info('Please sign in to add items to your cart');
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (product.stock <= 0) return;

    setLoading(true);
    try {
      await addToCart(product.id, 1);
      toast.success(`Added ${truncateText(product.name, 25)} to cart!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add item to cart');
    } finally {
      setLoading(false);
    }
  };

  const handleIncrement = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!cartItem) return;
    if (quantityInCart >= product.stock) {
      toast.warning(`Only ${product.stock} items available in stock`);
      return;
    }

    setLoading(true);
    try {
      await updateQuantity(cartItem.id, quantityInCart + 1);
    } catch {
      toast.error('Failed to update quantity');
    } finally {
      setLoading(false);
    }
  };

  const handleDecrement = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!cartItem) return;

    setLoading(true);
    try {
      if (quantityInCart <= 1) {
        await removeItem(cartItem.id);
        toast.info('Item removed from cart');
      } else {
        await updateQuantity(cartItem.id, quantityInCart - 1);
      }
    } catch {
      toast.error('Failed to update quantity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link
      to={productUrl}
      className="product-card group flex flex-col justify-between rounded-2xl bg-white dark:bg-gray-800 overflow-hidden border border-gray-100 dark:border-gray-700/60 shadow-card hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
      id={`product-card-${product.id}`}
    >
      <div>
        {/* Image */}
        <div className="relative aspect-square bg-white p-4 flex items-center justify-center overflow-hidden">
          <img
            src={getImageUrl(mainImage)}
            alt={product.name}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {product.discount > 0 && (
            <span className="absolute top-2.5 left-2.5 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm">
              {product.discount}% OFF
            </span>
          )}
          {Boolean(product.isFeatured) && (
            <span className="absolute top-2.5 right-2.5 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
              Featured
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-3 sm:p-4 border-t border-gray-50 dark:border-gray-700/40">
          <p className="text-[11px] text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-1 truncate">
            {product.brand || product.category?.name || 'General'}
          </p>
          <h3 className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-100 mb-1.5 line-clamp-2 group-hover:text-primary-500 transition-colors">
            {truncateText(product.name, 60)}
          </h3>

          <Rating value={parseFloat(product.rating) || 0} count={product.numReviews || 0} />

          <div className="flex items-baseline gap-1.5 mt-2 flex-wrap">
            <span className="price text-sm sm:text-base font-black text-gray-900 dark:text-white">
              {formatPrice(product.price)}
            </span>
            {product.discount > 0 && (
              <>
                <span className="price-mrp text-xs text-gray-400 line-through">
                  {formatPrice(product.mrp)}
                </span>
                <span className="price-discount text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  {product.discount}% off
                </span>
              </>
            )}
          </div>

          {product.stock <= 5 && product.stock > 0 && (
            <p className="text-[11px] text-red-500 dark:text-red-400 mt-1 font-bold">
              Only {product.stock} left!
            </p>
          )}

          {product.seller?.storeName && (
            <p className="text-[11px] text-gray-400 dark:text-gray-400 mt-1 truncate">
              by {product.seller.storeName}
            </p>
          )}
        </div>
      </div>

      {/* Add to Cart / Quantity Controller Section */}
      <div className="p-3 sm:p-4 pt-0">
        {product.stock <= 0 ? (
          <button
            disabled
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="w-full py-2 px-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-400 text-xs font-bold cursor-not-allowed text-center"
          >
            Out of Stock
          </button>
        ) : quantityInCart > 0 ? (
          <div
            className="flex items-center justify-between bg-primary-50 dark:bg-primary-950/60 border border-primary-300 dark:border-primary-800 rounded-xl p-1 shadow-2xs"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <button
              onClick={handleDecrement}
              disabled={loading}
              className="w-7 h-7 rounded-lg bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-gray-700 flex items-center justify-center font-bold hover:bg-primary-100 transition-colors shadow-2xs disabled:opacity-50"
              title="Decrease quantity"
            >
              <FiMinus size={14} />
            </button>
            <span className="text-xs font-black text-primary-700 dark:text-primary-300 px-1 flex items-center gap-1">
              <FiShoppingCart size={13} className="text-primary-500" />
              {quantityInCart} in Cart
            </span>
            <button
              onClick={handleIncrement}
              disabled={loading || quantityInCart >= product.stock}
              className="w-7 h-7 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold hover:bg-primary-700 transition-colors shadow-2xs disabled:opacity-50"
              title="Increase quantity"
            >
              <FiPlus size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleAddToCart}
            disabled={loading}
            className="w-full py-2 px-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <FiShoppingCart size={14} />
                Add to Cart
              </>
            )}
          </button>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
