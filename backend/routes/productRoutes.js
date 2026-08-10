const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { upload, uploadProduct } = require('../middleware/upload');

// Seller - MUST be before /:slug to avoid route conflict
router.get('/seller/mine', auth, role('seller', 'superadmin'), productController.getSellerProducts);

// Public
router.get('/', productController.getProducts);
router.get('/:slug', productController.getProduct);

// Seller / Admin
router.post('/', auth, role('seller', 'superadmin'), uploadProduct, upload.array('images', 5), productController.createProduct);
router.put('/:id', auth, role('seller', 'superadmin'), uploadProduct, upload.array('images', 5), productController.updateProduct);
router.delete('/:id', auth, role('seller', 'superadmin'), productController.deleteProduct);

module.exports = router;
