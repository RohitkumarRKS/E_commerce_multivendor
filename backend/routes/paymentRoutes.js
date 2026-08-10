const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');

router.post('/create-order', auth, paymentController.createPaymentOrder);
router.post('/verify', auth, paymentController.verifyPayment);

module.exports = router;
