const { Banner } = require('../models');

// Get active banners (public)
exports.getBanners = async (req, res, next) => {
  try {
    const banners = await Banner.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: { banners },
    });
  } catch (error) {
    next(error);
  }
};

// Get all banners (admin)
exports.getAllBannersAdmin = async (req, res, next) => {
  try {
    const banners = await Banner.findAll({
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: { banners },
    });
  } catch (error) {
    next(error);
  }
};

// Create banner (admin)
exports.createBanner = async (req, res, next) => {
  try {
    const { title, subtitle, badge, discount, linkUrl, bgColor, position, sortOrder } = req.body;
    let image = null;

    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    const banner = await Banner.create({
      title,
      subtitle,
      badge,
      discount,
      linkUrl: linkUrl || '/search',
      image,
      bgColor: bgColor || 'from-primary-600 via-primary-500 to-primary-700',
      position: position || 'hero',
      sortOrder: sortOrder || 0,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Banner created successfully!',
      data: { banner },
    });
  } catch (error) {
    next(error);
  }
};

// Update banner status or fields (admin)
exports.updateBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    const { title, subtitle, badge, discount, linkUrl, bgColor, position, sortOrder, isActive } = req.body;

    if (title !== undefined) banner.title = title;
    if (subtitle !== undefined) banner.subtitle = subtitle;
    if (badge !== undefined) banner.badge = badge;
    if (discount !== undefined) banner.discount = discount;
    if (linkUrl !== undefined) banner.linkUrl = linkUrl;
    if (bgColor !== undefined) banner.bgColor = bgColor;
    if (position !== undefined) banner.position = position;
    if (sortOrder !== undefined) banner.sortOrder = sortOrder;
    if (isActive !== undefined) banner.isActive = isActive;

    if (req.file) {
      banner.image = `/uploads/${req.file.filename}`;
    }

    await banner.save();

    res.json({
      success: true,
      message: 'Banner updated successfully!',
      data: { banner },
    });
  } catch (error) {
    next(error);
  }
};

// Delete banner (admin)
exports.deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    await banner.destroy();

    res.json({
      success: true,
      message: 'Banner deleted successfully!',
    });
  } catch (error) {
    next(error);
  }
};
