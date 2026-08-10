const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(300),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(350),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  mrp: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  discount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100,
    },
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  specifications: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  brand: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  sellerId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  rating: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 0,
  },
  numReviews: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isCodAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isFreeDelivery: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  warrantyPolicy: {
    type: DataTypes.STRING(150),
    defaultValue: '1 Year Warranty',
  },
  returnPolicy: {
    type: DataTypes.STRING(150),
    defaultValue: '7 Days Replacement',
  },
  minOrderQuantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1,
    },
  },
}, {
  tableName: 'products',
  hooks: {
    beforeValidate: (product) => {
      if (product.name && !product.slug) {
        const baseSlug = product.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        product.slug = baseSlug;
      }
      if (product.price && product.mrp) {
        product.discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);
      }
    },
  },
});

module.exports = Product;
