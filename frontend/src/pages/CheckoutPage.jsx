import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMapPin, FiCreditCard, FiCheckCircle, FiShield, FiArrowRight, FiPlus, FiShoppingBag, FiCheck, FiTruck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import useAuth from '../hooks/useAuth';
import useCart from '../hooks/useCart';
import { orderAPI, paymentAPI } from '../services/api';
import { formatPrice, getImageUrl } from '../utils/helpers';
import Loader from '../components/common/Loader';
import AddressManager, { getSavedAddresses, getActiveDeliveryAddress } from '../components/common/AddressManager';

const CheckoutPage = () => {
  const { user } = useAuth();
  const { cart, summary, clearCart } = useCart();
  const navigate = useNavigate();

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Address State
  const [address, setAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    pincode: user?.pincode || '',
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);

  const items = cart?.items || [];

  // Load Saved Addresses on Mount
  useEffect(() => {
    const list = getSavedAddresses();
    setSavedAddresses(list);
    const active = getActiveDeliveryAddress();
    if (active) {
      setSelectedAddressId(active.id);
      setAddress({
        name: active.fullName || user?.name || '',
        phone: active.mobile || user?.phone || '',
        street: `${active.flatBuilding ? active.flatBuilding + ', ' : ''}${active.areaStreet || ''}`,
        city: active.city || user?.city || '',
        state: active.state || user?.state || '',
        pincode: active.pincode || user?.pincode || '',
      });
    }
  }, [user]);

  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setAddress({
      name: addr.fullName,
      phone: addr.mobile,
      street: `${addr.flatBuilding ? addr.flatBuilding + ', ' : ''}${addr.areaStreet || ''}`,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    });
  };

  const handleAddressSaved = () => {
    const list = getSavedAddresses();
    setSavedAddresses(list);
    const active = getActiveDeliveryAddress();
    if (active) {
      handleSelectAddress(active);
    }
    setShowAddressModal(false);
  };

  if (items.length === 0) {
    return (
      <div className="section text-center py-20 min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-6xl mb-4">🛒</p>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Your Cart is Empty</h2>
        <p className="text-xs text-gray-500 mb-6 max-w-sm">Add products to your cart before proceeding to checkout.</p>
        <Link to="/search" className="btn-primary py-3 px-6 text-xs font-extrabold shadow-md">
          Explore Products
        </Link>
      </div>
    );
  }

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!address.name || !address.phone || !address.street || !address.city || !address.state || !address.pincode) {
      toast.error('Please select or complete delivery address');
      return;
    }

    setLoading(true);
    try {
      // 1. Create order in backend
      const orderRes = await orderAPI.create({
        shippingAddress: address,
      });

      const newOrder = orderRes.data.data.order;

      if (paymentMethod === 'cod') {
        toast.success('Order placed successfully! 🎉');
        await clearCart();
        navigate(`/order-confirmation/${newOrder.id}`);
        return;
      }

      // 2. Razorpay payment flow
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error('Razorpay SDK failed to load. Please check internet connection.');
        setLoading(false);
        return;
      }

      const payOrderRes = await paymentAPI.createOrder(newOrder.id);
      const payData = payOrderRes.data.data;

      const options = {
        key: payData.keyId,
        amount: payData.amount,
        currency: payData.currency,
        name: 'InduKart MultiVendor Store',
        description: `Payment for Order #${newOrder.orderNumber}`,
        order_id: payData.razorpayOrderId,
        handler: async (response) => {
          try {
            await paymentAPI.verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: newOrder.id,
            });
            toast.success('Payment successful!');
            await clearCart();
            navigate(`/order-confirmation/${newOrder.id}`);
          } catch {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: address.name,
          email: user?.email,
          contact: address.phone,
        },
        theme: {
          color: '#2874f0',
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

      paymentObject.on('payment.failed', function () {
        toast.error('Payment failed. You can retry from My Orders.');
        navigate(`/order-confirmation/${newOrder.id}`);
      });

    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen py-8">
      {loading && <Loader fullScreen />}
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Checkout Header Title */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <FiShoppingBag className="text-primary-600 dark:text-primary-400" size={26} />
              Fast Secure Checkout
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Select delivery address and payment option to complete your order
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-800">
            <FiShield size={16} /> 100% Buyer Protection Secured
          </div>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Steps Content (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 📍 STEP 1: DELIVERY ADDRESS SELECTION */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-primary-600 text-white font-black text-xs flex items-center justify-center shadow-xs">1</span>
                  Delivery Address
                </h2>

                <button
                  type="button"
                  onClick={() => setShowAddressModal(true)}
                  className="text-xs font-extrabold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                >
                  <FiPlus size={14} /> Add New Address
                </button>
              </div>

              {/* Saved Addresses List Cards */}
              {savedAddresses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {savedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => handleSelectAddress(addr)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/40 ring-2 ring-primary-500/20'
                            : 'border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 hover:border-gray-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                              {addr.addressType === 'work' ? '🏢 Work' : '🏠 Home'}
                            </span>
                            {isSelected && (
                              <span className="text-xs font-black text-primary-600 flex items-center gap-1">
                                <FiCheckCircle size={14} /> Selected
                              </span>
                            )}
                          </div>
                          <p className="font-extrabold text-xs text-gray-900 dark:text-white">{addr.fullName}</p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-snug">
                            {addr.flatBuilding && `${addr.flatBuilding}, `}{addr.areaStreet}, {addr.city}, {addr.state} - <strong className="text-gray-800 dark:text-gray-200">{addr.pincode}</strong>
                          </p>
                          <p className="text-[11px] text-gray-400 mt-1">📞 Phone: {addr.mobile}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Manual Address Form Fallback */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={address.name}
                      onChange={(e) => setAddress({ ...address, name: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Street Address / Flat No. *</label>
                    <input
                      type="text"
                      required
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">State *</label>
                    <input
                      type="text"
                      required
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Pincode *</label>
                    <input
                      type="text"
                      required
                      value={address.pincode}
                      onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                      className="input font-extrabold"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 📦 STEP 2: ORDER ITEMS REVIEW */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
              <h2 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                <span className="w-7 h-7 rounded-xl bg-primary-600 text-white font-black text-xs flex items-center justify-center shadow-xs">2</span>
                Order Items ({items.length})
              </h2>

              <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-80 overflow-y-auto pr-1 space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="pt-3 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl p-1.5 border border-gray-100 dark:border-gray-700 flex items-center justify-center flex-shrink-0">
                        <img
                          src={getImageUrl(item.product?.images?.[0])}
                          alt={item.product?.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-gray-900 dark:text-white text-sm line-clamp-1">{item.product?.name}</h4>
                        <p className="text-gray-400 mt-0.5">Quantity: <strong className="text-gray-800 dark:text-gray-200">{item.quantity} units</strong></p>
                        {item.product?.minOrderQuantity > 1 && (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                            MOQ: {item.product.minOrderQuantity} units
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-sm text-gray-900 dark:text-white">{formatPrice(item.price * item.quantity)}</p>
                      <p className="text-[11px] text-gray-400">{formatPrice(item.price)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 💳 STEP 3: PAYMENT METHOD */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
              <h2 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                <span className="w-7 h-7 rounded-xl bg-primary-600 text-white font-black text-xs flex items-center justify-center shadow-xs">3</span>
                Select Payment Mode
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Cash on Delivery */}
                <label
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    paymentMethod === 'cod'
                      ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/40 ring-2 ring-primary-500/20'
                      : 'border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="w-4 h-4 text-primary-600 mt-1"
                  />
                  <div>
                    <p className="font-black text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
                      💵 Cash on Delivery (COD)
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Pay with cash upon doorstep delivery</p>
                  </div>
                </label>

                {/* Online Payment */}
                <label
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    paymentMethod === 'razorpay'
                      ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/40 ring-2 ring-primary-500/20'
                      : 'border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                    className="w-4 h-4 text-primary-600 mt-1"
                  />
                  <div>
                    <p className="font-black text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
                      📱 Online Payment (UPI, Cards, NetBanking)
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Pay via Razorpay / GPay / PhonePe</p>
                  </div>
                </label>
              </div>
            </div>

          </div>

          {/* Sidebar Order Price Breakdown & Place Order CTA */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 sticky top-24 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-3">
                Price Details ({summary.totalItems} items)
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-gray-600 dark:text-gray-400 font-medium">
                  <span>Total MRP</span>
                  <span>{formatPrice(summary.totalMrp)}</span>
                </div>

                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-extrabold">
                  <span>Product Discount</span>
                  <span>−{formatPrice(summary.totalDiscount)}</span>
                </div>

                <div className="flex justify-between text-gray-600 dark:text-gray-400 font-medium">
                  <span>Delivery Charges</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">FREE</span>
                </div>

                <hr className="my-2 border-gray-100 dark:border-gray-800" />

                <div className="flex justify-between text-base font-black text-gray-900 dark:text-white pt-1">
                  <span>Total Amount</span>
                  <span className="text-primary-600 dark:text-primary-400">{formatPrice(summary.totalPrice)}</span>
                </div>

                {parseFloat(summary.totalDiscount) > 0 && (
                  <p className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-xl text-center border border-emerald-100 dark:border-emerald-800">
                    🎉 You save {formatPrice(summary.totalDiscount)} on this order!
                  </p>
                )}
              </div>

              {/* PLACE ORDER BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="btn-accent w-full py-4 text-sm font-black shadow-lg hover:shadow-xl rounded-2xl flex items-center justify-center gap-2 mt-4"
                id="checkout-confirm-btn"
              >
                PLACE ORDER <FiArrowRight size={18} />
              </button>

              <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-gray-400">
                <FiTruck size={14} className="text-emerald-500" />
                <span>Express Insured Shipping</span>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Address Manager Modal for Adding Address */}
      {showAddressModal && (
        <AddressManager
          isModal={true}
          onClose={() => setShowAddressModal(false)}
          onAddressSelect={handleAddressSaved}
        />
      )}
    </div>
  );
};

export default CheckoutPage;
