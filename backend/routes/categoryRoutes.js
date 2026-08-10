const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { upload, uploadCategory } = require('../middleware/upload');

// Public
router.get('/', categoryController.getCategories);
router.get('/all', auth, role('superadmin', 'admin'), categoryController.getAllCategories);
router.get('/:slug', categoryController.getCategory);

// Admin only
router.post('/', auth, role('superadmin', 'admin'), uploadCategory, upload.single('image'), categoryController.createCategory);
router.put('/:id', auth, role('superadmin', 'admin'), uploadCategory, upload.single('image'), categoryController.updateCategory);
router.delete('/:id', auth, role('superadmin', 'admin'), categoryController.deleteCategory);

module.exports = router;
