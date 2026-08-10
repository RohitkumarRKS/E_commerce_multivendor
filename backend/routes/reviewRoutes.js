const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');

router.get('/product/:productId', reviewController.getProductReviews);
router.post('/product/:productId', auth, reviewController.createReview);

module.exports = router;
