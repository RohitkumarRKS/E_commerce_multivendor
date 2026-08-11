const { Order, OrderItem, Cart, CartItem, Product, User } = require('../models');
const sequelize = require('../config/db');
const { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } = require('../utils/emailService');

// Place order
exports.createOrder = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { shippingAddress, notes } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({
      where: { userId: req.user.id },
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }],
        },
      ],
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty.',
      });
    }

    // Calculate total and validate stock
    let totalAmount = 0;
    for (const item of cart.items) {
      if (!item.product.isActive) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Product "${item.product.name}" is no longer available.`,
        });
      }
      if (item.quantity > item.product.stock) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Only ${item.product.stock} units of "${item.product.name}" available.`,
        });
      }
      totalAmount += parseFloat(item.product.price) * item.quantity;
    }

    // Create order
    const order = await Order.create(
      {
        userId: req.user.id,
        totalAmount,
        shippingAddress,
        notes,
        status: 'pending',
        paymentStatus: 'pending',
      },
      { transaction }
    );

    // Create order items and update stock
    for (const item of cart.items) {
      await OrderItem.create(
        {
          orderId: order.id,
          productId: item.productId,
          sellerId: item.product.sellerId,
          quantity: item.quantity,
          price: item.product.price,
        },
        { transaction }
      );

      // Decrease stock
      await Product.update(
        { stock: item.product.stock - item.quantity },
        { where: { id: item.productId }, transaction }
      );
    }

    // Clear cart
    await CartItem.destroy({ where: { cartId: cart.id }, transaction });

    await transaction.commit();

    const fullOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            { model: Product, as: 'product', attributes: ['id', 'name', 'images', 'slug'] },
            { model: User, as: 'seller', attributes: ['id', 'name', 'storeName'] },
          ],
        },
      ],
    });

    // Send order confirmation email asynchronously
    sendOrderConfirmationEmail(req.user, fullOrder).catch(err => console.error('Failed to send order email:', err));

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: { order: fullOrder },
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Get user's orders
exports.getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const where = { userId: req.user.id };
    if (status) where.status = status;

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            { model: Product, as: 'product', attributes: ['id', 'name', 'images', 'slug'] },
          ],
        },
      ],
      offset,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get seller's orders
exports.getSellerOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const where = { sellerId: req.user.id };
    if (status) where.status = status;

    const { count, rows: orderItems } = await OrderItem.findAndCountAll({
      where,
      include: [
        {
          model: Order,
          as: 'order',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
        },
        { model: Product, as: 'product', attributes: ['id', 'name', 'images'] },
      ],
      offset,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: {
        orderItems,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all orders (admin)
exports.getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        {
          model: OrderItem,
          as: 'items',
          include: [
            { model: Product, as: 'product', attributes: ['id', 'name', 'images'] },
            { model: User, as: 'seller', attributes: ['id', 'name', 'storeName'] },
          ],
        },
      ],
      offset,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update order status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status.',
      });
    }

    const order = await Order.findByPk(id, {
      include: [{ model: User, as: 'user' }],
    });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    await Order.update({ status }, { where: { id } });

    // Also update order items status
    await OrderItem.update({ status }, { where: { orderId: id } });

    if (order.user) {
      sendOrderStatusUpdateEmail(order.user, order.orderNumber, 'Order Items', status)
        .catch(err => console.error('Failed to send status email:', err));
    }

    res.json({
      success: true,
      message: `Order status updated to ${status}.`,
    });
  } catch (error) {
    next(error);
  }
};

// Get single order
exports.getOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
        {
          model: OrderItem,
          as: 'items',
          include: [
            { model: Product, as: 'product', attributes: ['id', 'name', 'images', 'slug', 'price'] },
            { model: User, as: 'seller', attributes: ['id', 'name', 'storeName'] },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    // Check access
    if (req.user.role !== 'superadmin' && order.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
      });
    }

    res.json({
      success: true,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};
