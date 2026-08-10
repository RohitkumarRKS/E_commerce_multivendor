const { Review, Product, User } = require('../models');

// Get all reviews for a product
exports.getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.findAll({
      where: { productId },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'avatar'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: { reviews },
    });
  } catch (error) {
    next(error);
  }
};

// Create a review for a product (authenticated)
exports.createReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment } = req.body;
    const userId = req.user.id;

    if (!rating || !title || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Rating, title, and comment are required.',
      });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      where: { productId, userId },
    });

    if (existingReview) {
      existingReview.rating = parseInt(rating);
      existingReview.title = title;
      existingReview.comment = comment;
      await existingReview.save();
    } else {
      await Review.create({
        productId,
        userId,
        rating: parseInt(rating),
        title,
        comment,
      });
    }

    // Recalculate average rating & review count for the product
    const allReviews = await Review.findAll({ where: { productId } });
    const numReviews = allReviews.length;
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = numReviews > 0 ? (totalRating / numReviews).toFixed(1) : 0;

    product.rating = parseFloat(avgRating);
    product.numReviews = numReviews;
    await product.save();

    const updatedReviews = await Review.findAll({
      where: { productId },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'avatar'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your review!',
      data: {
        reviews: updatedReviews,
        rating: product.rating,
        numReviews: product.numReviews,
      },
    });
  } catch (error) {
    next(error);
  }
};
