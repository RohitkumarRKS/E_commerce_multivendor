const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const EmailSetting = sequelize.define('EmailSetting', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  key: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'email_settings',
});

module.exports = EmailSetting;
