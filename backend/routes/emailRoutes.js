const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const emailController = require('../controllers/emailController');

// SuperAdmin only routes
router.get('/logs', auth, role('superadmin', 'admin'), emailController.getEmailLogs);
router.get('/settings', auth, role('superadmin', 'admin'), emailController.getEmailSettings);
router.put('/settings', auth, role('superadmin', 'admin'), emailController.updateEmailSettings);
router.post('/test', auth, role('superadmin', 'admin'), emailController.triggerTestEmail);

module.exports = router;
