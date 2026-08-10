import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { cartAPI } from '../services/api';
import { AuthContext } from './AuthContext';

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [cart, setCart] = useState(null);
  const [summary, setSummary] = useState({ totalItems: 0, totalPrice: '0.00', totalMrp: '0.00', totalDiscount: '0.00' });
  const [loading, setLoading] = useState(false);

  const loadCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      setSummary({ totalItems: 0, totalPrice: '0.00', totalMrp: '0.00', totalDiscount: '0.00' });
      return;
    }

    try {
      setLoading(true);
      const res = await cartAPI.get();
      setCart(res.data.data.cart);
      setSummary(res.data.data.summary);
    } catch {
      console.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const addToCart = async (productId, quantity = 1) => {
    const res = await cartAPI.add(productId, quantity);
    await loadCart();
    return res.data;
  };

  const updateQuantity = async (itemId, quantity) => {
    await cartAPI.update(itemId, quantity);
    await loadCart();
  };

  const removeItem = async (itemId) => {
    await cartAPI.remove(itemId);
    await loadCart();
  };

  const clearCart = async () => {
    await cartAPI.clear();
    await loadCart();
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        summary,
        loading,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart: loadCart,
        itemCount: summary.totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
