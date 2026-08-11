const { EmailLog, EmailSetting } = require('../models');
const { sendTestEmail } = require('../utils/emailService');

// Get all email logs (superadmin)
exports.getEmailLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (type && type !== 'all') where.type = type;

    const { count, rows: logs } = await EmailLog.findAndCountAll({
      where,
      offset,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: {
        logs,
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

// Get email settings (superadmin)
exports.getEmailSettings = async (req, res, next) => {
  try {
    const settings = await EmailSetting.findAll();
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });

    // Provide defaults if not yet created in DB
    const defaultSettings = {
      enable_welcome_email: 'true',
      enable_order_confirmation_email: 'true',
      enable_order_status_email: 'true',
      enable_return_request_email: 'true',
      enable_refund_processed_email: 'true',
      from_name: process.env.FROM_NAME || 'InduKart Official',
      from_email: process.env.FROM_EMAIL || 'noreply@indukart.com',
      smtp_host: process.env.SMTP_HOST || 'smtp.gmail.com',
    };

    res.json({
      success: true,
      data: { settings: { ...defaultSettings, ...settingsObj } },
    });
  } catch (error) {
    next(error);
  }
};

// Update email settings (superadmin)
exports.updateEmailSettings = async (req, res, next) => {
  try {
    const { settings } = req.body; // e.g. { enable_welcome_email: 'true', enable_order_confirmation_email: 'false' }

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ success: false, message: 'Settings object is required.' });
    }

    for (const [key, value] of Object.entries(settings)) {
      const stringValue = String(value);
      const existing = await EmailSetting.findOne({ where: { key } });
      if (existing) {
        existing.value = stringValue;
        await existing.save();
      } else {
        await EmailSetting.create({ key, value: stringValue });
      }
    }

    res.json({
      success: true,
      message: 'Email notification settings updated successfully!',
    });
  } catch (error) {
    next(error);
  }
};

// Trigger test email (superadmin)
exports.triggerTestEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const targetEmail = email || req.user.email;

    const sent = await sendTestEmail(targetEmail);

    res.json({
      success: true,
      message: `Test email dispatched to ${targetEmail}. Check your inbox or Email Logs tab.`,
      data: { sent },
    });
  } catch (error) {
    next(error);
  }
};
