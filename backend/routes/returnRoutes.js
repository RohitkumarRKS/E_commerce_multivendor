const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const returnController = require('../controllers/returnController');

// Buyer routes
router.post('/request', auth, returnController.requestReturn);
router.get('/my-returns', auth, returnController.getMyReturns);

// Seller routes
router.get('/seller-returns', auth, role('seller', 'admin', 'superadmin'), returnController.getSellerReturns);

// Admin routes
router.get('/all-returns', auth, role('admin', 'superadmin'), returnController.getAllReturns);

// Shared update status route for Seller or SuperAdmin
router.put('/:id/status', auth, role('seller', 'admin', 'superadmin'), returnController.updateReturnStatus);

module.exports = router;
