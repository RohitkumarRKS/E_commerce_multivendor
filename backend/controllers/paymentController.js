const Razorpay = require('razorpay');
const crypto = require('crypto');
const { Order } = require('../models');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order
exports.createPaymentOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    if (order.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
      });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Order is already paid.',
      });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(parseFloat(order.totalAmount) * 100), // Amount in paise
      currency: 'INR',
      receipt: order.orderNumber,
      notes: {
        orderId: order.id,
        userId: req.user.id,
      },
    });

    // Store razorpay order ID
    await Order.update(
      { razorpayOrderId: razorpayOrder.id },
      { where: { id: orderId } }
    );

    res.json({
      success: true,
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Verify payment
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      await Order.update(
        { paymentStatus: 'failed' },
        { where: { id: orderId } }
      );
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed.',
      });
    }

    // Update order
    await Order.update(
      {
        paymentId: razorpay_payment_id,
        paymentStatus: 'paid',
        status: 'confirmed',
      },
      { where: { id: orderId } }
    );

    res.json({
      success: true,
      message: 'Payment verified successfully!',
      data: {
        paymentId: razorpay_payment_id,
      },
    });
  } catch (error) {
    next(error);
  }
};
