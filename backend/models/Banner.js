const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Banner = sequelize.define('Banner', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  subtitle: {
    type: DataTypes.STRING(300),
    allowNull: true,
  },
  badge: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: '🎉 Special Offer',
  },
  discount: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  linkUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    defaultValue: '/search',
  },
  image: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  bgColor: {
    type: DataTypes.STRING(100),
    defaultValue: 'from-primary-600 via-primary-500 to-primary-700',
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  position: {
    type: DataTypes.STRING(50),
    defaultValue: 'hero',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'banners',
});

module.exports = Banner;
