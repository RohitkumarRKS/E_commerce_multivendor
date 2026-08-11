const { Category } = require('../models');

// Get all categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      where: { isActive: true, parentId: null },
      include: [
        {
          model: Category,
          as: 'subcategories',
          where: { isActive: true },
          required: false,
        },
      ],
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
    });

    res.json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
};

// Get all categories (flat, for admin)
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      include: [
        { model: Category, as: 'parent', attributes: ['id', 'name'] },
      ],
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
    });

    res.json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
};

// Get single category
exports.getCategory = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({
      where: { slug, isActive: true },
      include: [
        { model: Category, as: 'subcategories', where: { isActive: true }, required: false },
      ],
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    res.json({
      success: true,
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

// Create category (admin)
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description, parentId, sortOrder, showInNavbar, icon } = req.body;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const existingCategory = await Category.findOne({ where: { slug } });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'A category with this name already exists.',
      });
    }

    const categoryData = { name, slug, description, parentId, sortOrder, icon };
    if (typeof showInNavbar === 'boolean') categoryData.showInNavbar = showInNavbar;
    if (typeof showInNavbar === 'string') categoryData.showInNavbar = showInNavbar === 'true';

    if (req.file) {
      categoryData.image = `/uploads/categories/${req.file.filename}`;
    }

    const category = await Category.create(categoryData);

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

// Update category (admin)
exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, parentId, sortOrder, isActive, showInNavbar, icon } = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    const updateData = {};
    if (name) {
      updateData.name = name;
      updateData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    if (description !== undefined) updateData.description = description;
    if (parentId !== undefined) updateData.parentId = parentId;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
    if (icon !== undefined) updateData.icon = icon;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (typeof showInNavbar === 'boolean') updateData.showInNavbar = showInNavbar;
    if (typeof showInNavbar === 'string') updateData.showInNavbar = showInNavbar === 'true';

    if (req.file) {
      updateData.image = `/uploads/categories/${req.file.filename}`;
    }

    await Category.update(updateData, { where: { id } });
    const updatedCategory = await Category.findByPk(id);

    res.json({
      success: true,
      message: 'Category updated successfully.',
      data: { category: updatedCategory },
    });
  } catch (error) {
    next(error);
  }
};

// Delete category (admin)
exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    await Category.destroy({ where: { id } });

    res.json({
      success: true,
      message: 'Category deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
