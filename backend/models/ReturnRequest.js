const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ReturnRequest = sequelize.define('ReturnRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  orderItemId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  sellerId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  reason: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Bank Account Details for direct credit
  accountHolderName: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  accountNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  ifscCode: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  bankName: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  upiId: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  refundAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'item_picked', 'refund_processed'),
    defaultValue: 'pending',
  },
  adminComment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  refundTransactionId: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  estimatedCreditTime: {
    type: DataTypes.STRING(50),
    defaultValue: '2 to 3 Working Days',
  },
}, {
  tableName: 'return_requests',
});

module.exports = ReturnRequest;
