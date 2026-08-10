const { User } = require('../models');

// Get own profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    res.json({
      success: true,
      data: { user: user.toJSON() },
    });
  } catch (error) {
    next(error);
  }
};

// Update own profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, city, state, pincode, storeName, storeDescription } = req.body;

    const updateData = { name, phone, address, city, state, pincode };

    if (req.user.role === 'seller') {
      updateData.storeName = storeName;
      updateData.storeDescription = storeDescription;
    }

    // Handle avatar upload
    if (req.file) {
      updateData.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    await User.update(updateData, { where: { id: req.user.id } });

    const updatedUser = await User.findByPk(req.user.id);

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: { user: updatedUser.toJSON() },
    });
  } catch (error) {
    next(error);
  }
};

// Get all users (admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (role) where.role = role;

    const { count, rows: users } = await User.findAndCountAll({
      where,
      offset,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password'] },
    });

    res.json({
      success: true,
      data: {
        users,
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

// Update user (admin)
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive, role, name, phone, address, city, state, pincode, storeName } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const updateData = {};
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (role && ['buyer', 'seller', 'admin', 'superadmin'].includes(role)) updateData.role = role;
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (pincode !== undefined) updateData.pincode = pincode;
    if (storeName !== undefined) updateData.storeName = storeName;

    await User.update(updateData, { where: { id } });

    const updatedUser = await User.findByPk(id);

    res.json({
      success: true,
      message: 'User updated successfully.',
      data: { user: updatedUser.toJSON() },
    });
  } catch (error) {
    next(error);
  }
};

// Delete user (admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    await user.destroy();
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get seller profile (public)
exports.getSellerProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const seller = await User.findOne({
      where: { id, role: 'seller', isActive: true },
      attributes: ['id', 'name', 'avatar', 'storeName', 'storeDescription', 'createdAt'],
    });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found.',
      });
    }

    res.json({
      success: true,
      data: { seller },
    });
  } catch (error) {
    next(error);
  }
};
