const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { PromoCode, PromoUsage, User, Product, Category } = require('../models');
const { Op } = require('sequelize');

// ═══════════════════════════════════════════════
// GET /api/promo — List promo codes (seller sees own, superadmin sees all)
// ═══════════════════════════════════════════════
router.get('/', auth, role('seller', 'superadmin', 'admin'), async (req, res) => {
  try {
    const where = {};
    if (req.user.role === 'seller') {
      where.sellerId = req.user.id;
    }

    const promos = await PromoCode.findAll({
      where,
      include: [
        { model: User, as: 'seller', attributes: ['id', 'name', 'email', 'storeName'] },
        { model: PromoUsage, as: 'usages', attributes: ['id'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: { promos },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════════════
// POST /api/promo — Create promo code
// ═══════════════════════════════════════════════
router.post('/', auth, role('seller', 'superadmin', 'admin'), async (req, res) => {
  try {
    const {
      code, description, discountType, discountValue,
      minOrderAmount, maxDiscount, usageLimit, perUserLimit,
      startDate, endDate, productIds, categoryIds,
    } = req.body;

    if (!code || !discountValue) {
      return res.status(400).json({ success: false, message: 'Code and discount value are required.' });
    }

    // Check for duplicate code
    const existing = await PromoCode.findOne({ where: { code: code.toUpperCase().trim() } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A promo code with this name already exists.' });
    }

    // Validate discount
    if (discountType === 'percentage' && (discountValue < 1 || discountValue > 90)) {
      return res.status(400).json({ success: false, message: 'Percentage discount must be between 1 and 90.' });
    }

    const promo = await PromoCode.create({
      code,
      description,
      discountType: discountType || 'percentage',
      discountValue,
      minOrderAmount: minOrderAmount || 0,
      maxDiscount: maxDiscount || null,
      usageLimit: usageLimit || null,
      perUserLimit: perUserLimit || 1,
      startDate: startDate || null,
      endDate: endDate || null,
      isActive: true,
      sellerId: req.user.role === 'seller' ? req.user.id : null,
      productIds: productIds || null,
      categoryIds: categoryIds || null,
    });

    res.status(201).json({
      success: true,
      message: 'Promo code created successfully!',
      data: { promo },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════════════
// PUT /api/promo/:id — Update promo code
// ═══════════════════════════════════════════════
router.put('/:id', auth, role('seller', 'superadmin', 'admin'), async (req, res) => {
  try {
    const promo = await PromoCode.findByPk(req.params.id);
    if (!promo) {
      return res.status(404).json({ success: false, message: 'Promo code not found.' });
    }

    // Sellers can only edit their own codes
    if (req.user.role === 'seller' && promo.sellerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only edit your own promo codes.' });
    }

    const allowedFields = [
      'code', 'description', 'discountType', 'discountValue',
      'minOrderAmount', 'maxDiscount', 'usageLimit', 'perUserLimit',
      'startDate', 'endDate', 'isActive', 'productIds', 'categoryIds',
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        promo[field] = req.body[field];
      }
    });

    await promo.save();

    res.json({
      success: true,
      message: 'Promo code updated successfully!',
      data: { promo },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════════════
// DELETE /api/promo/:id — Delete promo code
// ═══════════════════════════════════════════════
router.delete('/:id', auth, role('seller', 'superadmin', 'admin'), async (req, res) => {
  try {
    const promo = await PromoCode.findByPk(req.params.id);
    if (!promo) {
      return res.status(404).json({ success: false, message: 'Promo code not found.' });
    }

    if (req.user.role === 'seller' && promo.sellerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only delete your own promo codes.' });
    }

    await promo.destroy();

    res.json({ success: true, message: 'Promo code deleted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════════════
// POST /api/promo/validate — Validate & calculate discount
// ═══════════════════════════════════════════════
router.post('/validate', auth, async (req, res) => {
  try {
    const { code, cartTotal, productIds } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Promo code is required.' });
    }

    const promo = await PromoCode.findOne({
      where: { code: code.toUpperCase().trim(), isActive: true },
    });

    if (!promo) {
      return res.status(404).json({ success: false, message: 'Invalid promo code.' });
    }

    // Check date validity
    const now = new Date();
    if (promo.startDate && new Date(promo.startDate) > now) {
      return res.status(400).json({ success: false, message: 'This promo code is not yet active.' });
    }
    if (promo.endDate && new Date(promo.endDate) < now) {
      return res.status(400).json({ success: false, message: 'This promo code has expired.' });
    }

    // Check total usage limit
    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
      return res.status(400).json({ success: false, message: 'This promo code has reached its usage limit.' });
    }

    // Check per-user limit
    const userUsageCount = await PromoUsage.count({
      where: { promoCodeId: promo.id, userId: req.user.id },
    });
    if (promo.perUserLimit && userUsageCount >= promo.perUserLimit) {
      return res.status(400).json({ success: false, message: 'You have already used this promo code.' });
    }

    // Check minimum order amount
    const total = parseFloat(cartTotal) || 0;
    if (promo.minOrderAmount && total < parseFloat(promo.minOrderAmount)) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is ₹${promo.minOrderAmount} to use this code.`,
      });
    }

    // Calculate discount
    let discount = 0;
    if (promo.discountType === 'percentage') {
      discount = (total * parseFloat(promo.discountValue)) / 100;
      if (promo.maxDiscount && discount > parseFloat(promo.maxDiscount)) {
        discount = parseFloat(promo.maxDiscount);
      }
    } else {
      discount = parseFloat(promo.discountValue);
    }

    // Ensure discount doesn't exceed cart total
    if (discount > total) {
      discount = total;
    }

    discount = Math.round(discount * 100) / 100;

    res.json({
      success: true,
      message: 'Promo code applied successfully!',
      data: {
        promoId: promo.id,
        code: promo.code,
        description: promo.description,
        discountType: promo.discountType,
        discountValue: parseFloat(promo.discountValue),
        discount,
        finalTotal: Math.round((total - discount) * 100) / 100,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════════════
// GET /api/promo/available — List active public promos for buyers
// ═══════════════════════════════════════════════
router.get('/available', auth, async (req, res) => {
  try {
    const now = new Date();
    const promos = await PromoCode.findAll({
      where: {
        isActive: true,
        [Op.or]: [
          { startDate: null },
          { startDate: { [Op.lte]: now } },
        ],
        [Op.or]: [
          { endDate: null },
          { endDate: { [Op.gte]: now } },
        ],
      },
      attributes: ['id', 'code', 'description', 'discountType', 'discountValue', 'minOrderAmount', 'maxDiscount', 'endDate'],
      order: [['createdAt', 'DESC']],
      limit: 20,
    });

    res.json({ success: true, data: { promos } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
