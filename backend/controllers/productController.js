const { Op } = require('sequelize');
const { Product, Category, User } = require('../models');

// Get all products (public, with search/filter/pagination)
exports.getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      search,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      order = 'DESC',
      brand,
      featured,
    } = req.query;

    const offset = (page - 1) * limit;
    const where = { isActive: true };

    if (category) {
      const cat = await Category.findOne({ where: { slug: category } });
      if (cat) where.categoryId = cat.id;
    }

    const likeOp = process.env.DB_DIALECT === 'postgres' ? Op.iLike : Op.like;

    if (search) {
      where[Op.or] = [
        { name: { [likeOp]: `%${search}%` } },
        { description: { [likeOp]: `%${search}%` } },
        { brand: { [likeOp]: `%${search}%` } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }

    if (brand) where.brand = { [likeOp]: `%${brand}%` };
    if (featured === 'true') where.isFeatured = true;

    const validSortFields = ['price', 'createdAt', 'rating', 'name', 'discount'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: User, as: 'seller', attributes: ['id', 'name', 'storeName'] },
      ],
      offset,
      limit: parseInt(limit),
      order: [[sortField, sortOrder]],
    });

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get single product by slug
exports.getProduct = async (req, res, next) => {
  try {
    const { slug } = req.params;
    let product = await Product.findOne({
      where: { slug, isActive: true },
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: User, as: 'seller', attributes: ['id', 'name', 'storeName', 'avatar'] },
      ],
    });

    if (!product) {
      // Clean slug fallback (strip timestamp suffix if passed)
      const cleanSlug = slug.replace(/-\d{10,}$/, '');
      const products = await Product.findAll({
        where: { isActive: true },
        include: [
          { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
          { model: User, as: 'seller', attributes: ['id', 'name', 'storeName', 'avatar'] },
        ],
      });

      product = products.find(
        (p) => p.slug === cleanSlug || p.slug.startsWith(cleanSlug) || p.id === slug
      );
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    res.json({
      success: true,
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

// Create product (seller/admin)
exports.createProduct = async (req, res, next) => {
  try {
    const {
      name, description, price, mrp, stock, categoryId, brand, specifications,
      isCodAvailable, isFreeDelivery, warrantyPolicy, returnPolicy
    } = req.body;

    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        images.push(`/uploads/products/${file.filename}`);
      });
    }

    const product = await Product.create({
      name,
      description,
      price: parseFloat(price),
      mrp: parseFloat(mrp),
      stock: parseInt(stock),
      categoryId,
      brand,
      specifications: typeof specifications === 'string' ? JSON.parse(specifications) : (specifications || {}),
      isCodAvailable: isCodAvailable !== undefined ? (isCodAvailable === 'true' || isCodAvailable === true) : true,
      isFreeDelivery: isFreeDelivery !== undefined ? (isFreeDelivery === 'true' || isFreeDelivery === true) : true,
      warrantyPolicy: warrantyPolicy || '1 Year Warranty',
      returnPolicy: returnPolicy || '7 Days Replacement',
      images,
      sellerId: req.user.id,
    });

    const fullProduct = await Product.findByPk(product.id, {
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: User, as: 'seller', attributes: ['id', 'name', 'storeName'] },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: { product: fullProduct },
    });
  } catch (error) {
    next(error);
  }
};

// Update product (seller who owns it / admin)
exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    // Only the seller who owns it or admin can update
    if (req.user.role !== 'superadmin' && product.sellerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own products.',
      });
    }

    const {
      name, description, price, mrp, stock, categoryId, brand, specifications,
      isActive, isFeatured, isCodAvailable, isFreeDelivery, warrantyPolicy, returnPolicy
    } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price) updateData.price = parseFloat(price);
    if (mrp) updateData.mrp = parseFloat(mrp);
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (categoryId) updateData.categoryId = categoryId;
    if (brand) updateData.brand = brand;
    if (specifications) updateData.specifications = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
    if (isActive !== undefined) updateData.isActive = (isActive === true || isActive === 'true');
    if (req.user.role === 'superadmin' && isFeatured !== undefined) {
      updateData.isFeatured = (isFeatured === true || isFeatured === 'true');
    }
    if (isCodAvailable !== undefined) updateData.isCodAvailable = (isCodAvailable === true || isCodAvailable === 'true');
    if (isFreeDelivery !== undefined) updateData.isFreeDelivery = (isFreeDelivery === true || isFreeDelivery === 'true');
    if (warrantyPolicy !== undefined) updateData.warrantyPolicy = warrantyPolicy;
    if (returnPolicy !== undefined) updateData.returnPolicy = returnPolicy;

    // Handle new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => `/uploads/products/${file.filename}`);
      updateData.images = [...(product.images || []), ...newImages];
    }

    // Recalculate discount
    const finalPrice = updateData.price || product.price;
    const finalMrp = updateData.mrp || product.mrp;
    if (finalPrice && finalMrp) {
      updateData.discount = Math.round(((finalMrp - finalPrice) / finalMrp) * 100);
    }

    await Product.update(updateData, { where: { id } });

    const updatedProduct = await Product.findByPk(id, {
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: User, as: 'seller', attributes: ['id', 'name', 'storeName'] },
      ],
    });

    res.json({
      success: true,
      message: 'Product updated successfully.',
      data: { product: updatedProduct },
    });
  } catch (error) {
    next(error);
  }
};

// Delete product
exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    if (req.user.role !== 'superadmin' && product.sellerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own products.',
      });
    }

    await Product.destroy({ where: { id } });

    res.json({
      success: true,
      message: 'Product deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// Get seller's own products
exports.getSellerProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: products } = await Product.findAndCountAll({
      where: { sellerId: req.user.id },
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
      ],
      offset,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
