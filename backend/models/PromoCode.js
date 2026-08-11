const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PromoCode = sequelize.define('PromoCode', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  discountType: {
    type: DataTypes.ENUM('percentage', 'fixed'),
    allowNull: false,
    defaultValue: 'percentage',
  },
  discountValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  minOrderAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
  },
  maxDiscount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Max discount cap for percentage type',
  },
  usageLimit: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Max total uses across all users. null = unlimited',
  },
  usedCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  perUserLimit: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Max uses per individual user',
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  sellerId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'null = global/superadmin code',
  },
  productIds: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of product UUIDs. null = applies to all products',
  },
  categoryIds: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of category UUIDs. null = applies to all categories',
  },
}, {
  tableName: 'promo_codes',
  hooks: {
    beforeCreate: (promo) => {
      promo.code = promo.code.toUpperCase().trim();
    },
    beforeUpdate: (promo) => {
      if (promo.changed('code')) {
        promo.code = promo.code.toUpperCase().trim();
      }
    },
  },
});

module.exports = PromoCode;
