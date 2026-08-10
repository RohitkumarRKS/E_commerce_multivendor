const express = require('express');
const router = express.Router();
const { getBrands, createBrand, updateBrand, deleteBrand } = require('../controllers/brandController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { upload } = require('../middleware/upload');

router.get('/', getBrands);

// Protected SuperAdmin routes
router.post('/', auth, role('superadmin', 'admin'), upload.single('logoFile'), createBrand);
router.put('/:id', auth, role('superadmin', 'admin'), upload.single('logoFile'), updateBrand);
router.delete('/:id', auth, role('superadmin', 'admin'), deleteBrand);

module.exports = router;
