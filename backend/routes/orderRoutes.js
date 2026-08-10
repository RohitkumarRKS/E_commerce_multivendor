const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.post('/', auth, orderController.createOrder);
router.get('/mine', auth, orderController.getMyOrders);
router.get('/seller', auth, role('seller'), orderController.getSellerOrders);
router.get('/', auth, role('superadmin'), orderController.getAllOrders);
router.get('/:id', auth, orderController.getOrder);
router.put('/:id/status', auth, role('seller', 'superadmin'), orderController.updateOrderStatus);

module.exports = router;
