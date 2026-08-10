const { Cart, CartItem, Product, Category } = require('../models');

// Get user's cart
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({
      where: { userId: req.user.id },
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'slug', 'price', 'mrp', 'discount', 'images', 'stock', 'isActive'],
              include: [
                { model: Category, as: 'category', attributes: ['id', 'name'] },
              ],
            },
          ],
        },
      ],
    });

    if (!cart) {
      cart = await Cart.create({ userId: req.user.id });
      cart.items = [];
    }

    // Calculate totals
    let totalItems = 0;
    let totalPrice = 0;
    let totalMrp = 0;

    if (cart.items) {
      cart.items.forEach((item) => {
        totalItems += item.quantity;
        totalPrice += parseFloat(item.price) * item.quantity;
        if (item.product) {
          totalMrp += parseFloat(item.product.mrp) * item.quantity;
        }
      });
    }

    res.json({
      success: true,
      data: {
        cart,
        summary: {
          totalItems,
          totalPrice: totalPrice.toFixed(2),
          totalMrp: totalMrp.toFixed(2),
          totalDiscount: (totalMrp - totalPrice).toFixed(2),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Add item to cart
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findByPk(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or unavailable.',
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock.`,
      });
    }

    // Get or create cart
    let cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id });
    }

    // Check if item already in cart
    let cartItem = await CartItem.findOne({
      where: { cartId: cart.id, productId },
    });

    if (cartItem) {
      const newQuantity = cartItem.quantity + parseInt(quantity);
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Only ${product.stock} items available.`,
        });
      }
      await CartItem.update(
        { quantity: newQuantity, price: product.price },
        { where: { id: cartItem.id } }
      );
    } else {
      await CartItem.create({
        cartId: cart.id,
        productId,
        quantity: parseInt(quantity),
        price: product.price,
      });
    }

    // Return updated cart
    const updatedCart = await Cart.findOne({
      where: { userId: req.user.id },
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'slug', 'price', 'mrp', 'discount', 'images', 'stock'],
            },
          ],
        },
      ],
    });

    res.json({
      success: true,
      message: 'Item added to cart.',
      data: { cart: updatedCart },
    });
  } catch (error) {
    next(error);
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found.',
      });
    }

    const cartItem = await CartItem.findOne({
      where: { id: itemId, cartId: cart.id },
      include: [{ model: Product, as: 'product' }],
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart.',
      });
    }

    if (quantity > cartItem.product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${cartItem.product.stock} items available.`,
      });
    }

    if (quantity <= 0) {
      await CartItem.destroy({ where: { id: itemId } });
    } else {
      await CartItem.update({ quantity }, { where: { id: itemId } });
    }

    res.json({
      success: true,
      message: 'Cart updated.',
    });
  } catch (error) {
    next(error);
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found.',
      });
    }

    const deleted = await CartItem.destroy({
      where: { id: itemId, cartId: cart.id },
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart.',
      });
    }

    res.json({
      success: true,
      message: 'Item removed from cart.',
    });
  } catch (error) {
    next(error);
  }
};

// Clear cart
exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (cart) {
      await CartItem.destroy({ where: { cartId: cart.id } });
    }

    res.json({
      success: true,
      message: 'Cart cleared.',
    });
  } catch (error) {
    next(error);
  }
};
