const { ReturnRequest, OrderItem, Order, Product, User } = require('../models');
const { sendReturnRequestedEmail, sendRefundProcessedEmail } = require('../utils/emailService');

// Buyer submits a return/refund request with bank details
exports.requestReturn = async (req, res, next) => {
  try {
    const {
      orderItemId, reason, details,
      accountHolderName, accountNumber, ifscCode, bankName, upiId,
    } = req.body;

    if (!orderItemId || !reason || !accountHolderName || !accountNumber || !ifscCode || !bankName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields including bank details (Account Holder Name, Account Number, IFSC, Bank Name).',
      });
    }

    const orderItem = await OrderItem.findByPk(orderItemId, {
      include: [
        { model: Order, as: 'order' },
        { model: Product, as: 'product' },
        { model: User, as: 'seller' },
      ],
    });

    if (!orderItem) {
      return res.status(404).json({ success: false, message: 'Order item not found.' });
    }

    if (orderItem.order.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Check if return request already exists
    const existing = await ReturnRequest.findOne({ where: { orderItemId } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Return request already submitted (Status: ${existing.status}).`,
      });
    }

    const refundAmount = parseFloat(orderItem.price) * orderItem.quantity;

    const returnReq = await ReturnRequest.create({
      orderId: orderItem.orderId,
      orderItemId: orderItem.id,
      userId: req.user.id,
      sellerId: orderItem.sellerId,
      reason,
      details,
      accountHolderName,
      accountNumber,
      ifscCode: ifscCode.toUpperCase().trim(),
      bankName,
      upiId: upiId ? upiId.trim() : null,
      refundAmount,
      status: 'pending',
    });

    // Send Confirmation Email to Buyer
    sendReturnRequestedEmail(req.user, returnReq, {
      orderNumber: orderItem.order.orderNumber,
      productName: orderItem.product.name,
    }).catch(err => console.error('Failed to send return email:', err));

    res.status(201).json({
      success: true,
      message: 'Return request submitted successfully. Refund will be credited to your bank account within 2-3 working days after approval.',
      data: { returnRequest: returnReq },
    });
  } catch (error) {
    next(error);
  }
};

// Buyer views their return requests
exports.getMyReturns = async (req, res, next) => {
  try {
    const returns = await ReturnRequest.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: OrderItem,
          as: 'orderItem',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'images', 'slug'] }],
        },
        { model: Order, as: 'order', attributes: ['id', 'orderNumber', 'createdAt'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, data: { returns } });
  } catch (error) {
    next(error);
  }
};

// Seller views return requests for items they sold
exports.getSellerReturns = async (req, res, next) => {
  try {
    const returns = await ReturnRequest.findAll({
      where: { sellerId: req.user.id },
      include: [
        {
          model: OrderItem,
          as: 'orderItem',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'images'] }],
        },
        { model: Order, as: 'order', attributes: ['id', 'orderNumber', 'createdAt'] },
        { model: User, as: 'buyer', attributes: ['id', 'name', 'email', 'phone'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, data: { returns } });
  } catch (error) {
    next(error);
  }
};

// Superadmin views all return requests across all sellers
exports.getAllReturns = async (req, res, next) => {
  try {
    const returns = await ReturnRequest.findAll({
      include: [
        {
          model: OrderItem,
          as: 'orderItem',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'images'] }],
        },
        { model: Order, as: 'order', attributes: ['id', 'orderNumber', 'createdAt'] },
        { model: User, as: 'buyer', attributes: ['id', 'name', 'email', 'phone'] },
        { model: User, as: 'seller', attributes: ['id', 'name', 'storeName', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, data: { returns } });
  } catch (error) {
    next(error);
  }
};

// Update Return Status & Refund Processing
exports.updateReturnStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminComment, refundTransactionId } = req.body;

    const returnReq = await ReturnRequest.findByPk(id, {
      include: [
        { model: User, as: 'buyer' },
        {
          model: OrderItem,
          as: 'orderItem',
          include: [
            { model: Order, as: 'order' },
            { model: Product, as: 'product' },
          ],
        },
      ],
    });

    if (!returnReq) {
      return res.status(404).json({ success: false, message: 'Return request not found.' });
    }

    // Check seller or admin permission
    if (req.user.role !== 'superadmin' && req.user.role !== 'admin' && returnReq.sellerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    returnReq.status = status || returnReq.status;
    if (adminComment !== undefined) returnReq.adminComment = adminComment;
    if (refundTransactionId !== undefined) returnReq.refundTransactionId = refundTransactionId;

    await returnReq.save();

    // If status is 'refund_processed', send email to buyer with bank credit notification
    if (status === 'refund_processed' && returnReq.buyer) {
      sendRefundProcessedEmail(returnReq.buyer, returnReq, {
        orderNumber: returnReq.orderItem?.order?.orderNumber || 'N/A',
        productName: returnReq.orderItem?.product?.name || 'Item',
      }).catch(err => console.error('Failed to send refund email:', err));
    }

    res.json({
      success: true,
      message: `Return request updated to ${status}. ${status === 'refund_processed' ? 'Buyer notified that refund will be credited in 2-3 working days.' : ''}`,
      data: { returnRequest: returnReq },
    });
  } catch (error) {
    next(error);
  }
};
