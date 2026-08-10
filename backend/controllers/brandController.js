const { Brand } = require('../models');

// Get all active brands for store, or all brands for superadmin
const getBrands = async (req, res) => {
  try {
    const isSuperAdmin = req.user && req.user.role === 'superadmin';
    const whereClause = isSuperAdmin ? {} : { isActive: true };

    const brands = await Brand.findAll({
      where: whereClause,
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
    });

    res.json({
      success: true,
      data: { brands },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new brand (SuperAdmin)
const createBrand = async (req, res) => {
  try {
    const { name, logo, website, sortOrder, isActive } = req.body;
    let logoPath = logo || null;

    if (req.file) {
      logoPath = `/uploads/${req.file.filename}`;
    }

    const brand = await Brand.create({
      name,
      logo: logoPath,
      website,
      sortOrder: sortOrder || 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      success: true,
      message: 'Brand created successfully',
      data: { brand },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update a brand (SuperAdmin)
const updateBrand = async (req, res) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }

    const { name, logo, website, sortOrder, isActive } = req.body;

    if (name) brand.name = name;
    if (website !== undefined) brand.website = website;
    if (sortOrder !== undefined) brand.sortOrder = sortOrder;
    if (isActive !== undefined) brand.isActive = isActive;
    if (logo) brand.logo = logo;

    if (req.file) {
      brand.logo = `/uploads/${req.file.filename}`;
    }

    await brand.save();

    res.json({
      success: true,
      message: 'Brand updated successfully',
      data: { brand },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete a brand (SuperAdmin)
const deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }

    await brand.destroy();

    res.json({
      success: true,
      message: 'Brand deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
};
