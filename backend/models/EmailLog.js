const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const EmailLog = sequelize.define('EmailLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  toEmail: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'custom',
    comment: 'welcome, order_confirmation, order_status, return_request, refund_processed, test',
  },
  html: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('sent', 'failed', 'mocked'),
    defaultValue: 'sent',
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'email_logs',
});

module.exports = EmailLog;
