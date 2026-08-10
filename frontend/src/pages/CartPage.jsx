import { Link } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { toast } from 'react-toastify';
import useCart from '../hooks/useCart';
import useAuth from '../hooks/useAuth';
import { formatPrice, getImageUrl } from '../utils/helpers';
import Loader from '../components/common/Loader';

const CartPage = () => {
  const { isAuthenticated } = useAuth();
  const { cart, summary, loading, updateQuantity, removeItem } = useCart();

  if (!isAuthenticated) {
    return (
      <div className="section text-center py-20">
        <p className="text-5xl mb-4">🛒</p>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Please Login</h2>
        <p className="text-gray-500 mb-6">Login to view your cart and start shopping</p>
        <Link to="/login" className="btn-primary">Login Now</Link>
      </div>
    );
  }

  if (loading) return <Loader />;

  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <div className="section text-center py-20">
        <p className="text-5xl mb-4">🛒</p>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't added anything yet</p>
        <Link to="/search" className="btn-primary">Start Shopping <FiShoppingBag size={16} /></Link>
      </div>
    );
  }

  const handleUpdateQuantity = async (itemId, newQty) => {
    try {
      await updateQuantity(itemId, newQty);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update');
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await removeItem(itemId);
      toast.success('Item removed from cart');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  return (
    <div className="bg-surface-50 min-h-screen">
      <div className="container-main py-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6">
          Shopping Cart ({summary.totalItems} item{summary.totalItems !== 1 ? 's' : ''})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-card p-4 flex gap-4 animate-fade-in">
                <Link to={`/product/${item.product?.slug}`} className="flex-shrink-0">
                  <img
                    src={getImageUrl(item.product?.images?.[0])}
                    alt={item.product?.name}
                    className="w-24 h-24 object-contain rounded-lg bg-surface-50 p-2"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.product?.slug}`}>
                    <h3 className="text-sm font-medium text-gray-800 hover:text-primary-500 transition-colors line-clamp-2">
                      {item.product?.name}
                    </h3>
                  </Link>
                  {item.product?.category && (
                    <p className="text-xs text-gray-400 mt-0.5">{item.product.category.name}</p>
                  )}

                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="font-bold text-gray-900">{formatPrice(item.price)}</span>
                    {item.product?.discount > 0 && (
                      <>
                        <span className="text-xs text-gray-400 line-through">{formatPrice(item.product.mrp)}</span>
                        <span className="text-xs font-semibold text-success">{item.product.discount}% off</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border rounded-lg">
                      <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 hover:bg-gray-50 transition-colors" disabled={item.quantity <= 1}>
                        <FiMinus size={14} />
                      </button>
                      <span className="px-3 text-sm font-semibold border-x">{item.quantity}</span>
                      <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 hover:bg-gray-50 transition-colors">
                        <FiPlus size={14} />
                      </button>
                    </div>
                    <button onClick={() => handleRemove(item.id)}
                      className="text-gray-400 hover:text-danger transition-colors p-1.5" title="Remove">
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Price Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-card p-6 sticky top-24">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Price Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Price ({summary.totalItems} items)</span>
                  <span className="text-gray-800">{formatPrice(summary.totalMrp)}</span>
                </div>
                <div className="flex justify-between text-success">
                  <span>Discount</span>
                  <span>−{formatPrice(summary.totalDiscount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span className="text-success font-medium">FREE</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between text-base font-bold text-gray-900">
                  <span>Total Amount</span>
                  <span>{formatPrice(summary.totalPrice)}</span>
                </div>
                {parseFloat(summary.totalDiscount) > 0 && (
                  <p className="text-xs text-success font-medium">
                    You will save {formatPrice(summary.totalDiscount)} on this order
                  </p>
                )}
              </div>

              <Link to="/checkout" className="btn-accent w-full py-3 mt-6 text-base" id="cart-checkout-btn">
                Place Order <FiArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
