const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const protect = require('../middleware/auth');
const role = require('../middleware/role');
const { upload } = require('../middleware/upload');

// Public route for home page banners
router.get('/', bannerController.getBanners);

// SuperAdmin routes
router.get('/all', protect, role('superadmin', 'admin'), bannerController.getAllBannersAdmin);
router.post('/', protect, role('superadmin', 'admin'), upload.single('image'), bannerController.createBanner);
router.put('/:id', protect, role('superadmin', 'admin'), upload.single('image'), bannerController.updateBanner);
router.delete('/:id', protect, role('superadmin', 'admin'), bannerController.deleteBanner);

module.exports = router;
