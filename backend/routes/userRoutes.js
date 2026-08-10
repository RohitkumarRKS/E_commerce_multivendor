const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { upload, uploadAvatar } = require('../middleware/upload');

router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, uploadAvatar, upload.single('avatar'), userController.updateProfile);
router.get('/seller/:id', userController.getSellerProfile);

// Admin routes
router.get('/', auth, role('superadmin', 'admin'), userController.getAllUsers);
router.put('/:id', auth, role('superadmin', 'admin'), userController.updateUser);
router.delete('/:id', auth, role('superadmin', 'admin'), userController.deleteUser);

module.exports = router;
