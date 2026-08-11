const nodemailer = require('nodemailer');

const { EmailLog, EmailSetting } = require('../models');

// Create Transporter based on env settings
const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;

  if (host && user && pass && host !== 'smtp.gmail.com') { // Check if valid non-placeholder
    return nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure: parseInt(port) === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });
  }
  // Try standard transporter if valid user and pass are set
  if (user && pass && user !== 'your_email@gmail.com' && pass !== 'your_app_password') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }
  return null;
};

// Check if specific email setting is enabled
const isEmailTypeEnabled = async (type) => {
  try {
    const settingKey = `enable_${type}_email`;
    const setting = await EmailSetting.findOne({ where: { key: settingKey } });
    if (setting) {
      return setting.value === 'true' || setting.value === '1';
    }
    return true; // Enabled by default
  } catch (err) {
    return true;
  }
};

// Send mail helper with DB logging
const sendMail = async ({ to, subject, html, text, type = 'custom' }) => {
  try {
    // Check if email type enabled by superadmin
    const enabled = await isEmailTypeEnabled(type);
    if (!enabled) {
      console.log(`🚫 [EMAIL DISABLED BY ADMIN] Type: ${type} | To: ${to}`);
      return false;
    }

    const transporter = createTransporter();
    const fromName = process.env.FROM_NAME || 'InduKart';
    const fromEmail = process.env.FROM_EMAIL || 'noreply@indukart.com';

    let status = 'mocked';
    let errorMessage = null;

    if (transporter && to) {
      try {
        const info = await transporter.sendMail({
          from: `"${fromName}" <${fromEmail}>`,
          to,
          subject,
          html,
          text,
        });
        status = 'sent';
        console.log(`✉️ Email sent to ${to}: ${info.messageId}`);
      } catch (sendErr) {
        status = 'failed';
        errorMessage = sendErr.message;
        console.error(`❌ Real SMTP send failed to ${to}:`, sendErr.message);
      }
    } else {
      console.log(`📧 [MOCK EMAIL LOG] To: ${to} | Subject: ${subject}`);
    }

    // Save Email Log in database
    await EmailLog.create({
      toEmail: to,
      subject,
      type,
      html,
      status,
      errorMessage,
    }).catch(e => console.error('Failed to save EmailLog:', e.message));

    return status !== 'failed';
  } catch (error) {
    console.error(`❌ Email error to ${to}:`, error.message);
    return false;
  }
};

// 1. Welcome / Registration Email
exports.sendWelcomeEmail = async (user) => {
  const subject = `Welcome to InduKart, ${user.name}! 🚀`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px;">
      <h2 style="color: #2563eb; text-align: center;">Welcome to InduKart!</h2>
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>Thank you for registering with InduKart as a <strong>${user.role ? user.role.toUpperCase() : 'BUYER'}</strong>.</p>
      <p>Your account email is: <code>${user.email}</code></p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; color: #4b5563;">You can now log in, explore thousands of products, place orders, and manage your account seamlessly.</p>
      </div>
      <p>Happy Shopping,<br/><strong>The InduKart Team</strong></p>
    </div>
  `;
  return sendMail({ to: user.email, subject, html, type: 'welcome' });
};

// 2. Order Confirmation Email
exports.sendOrderConfirmationEmail = async (user, order) => {
  const itemsHtml = (order.items || []).map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.product?.name || 'Product'}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price}</td>
    </tr>
  `).join('');

  const subject = `Order Confirmation #${order.orderNumber} - InduKart`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px;">
      <h2 style="color: #16a34a; text-align: center;">Order Placed Successfully! 🎉</h2>
      <p>Hi <strong>${user.name || 'Customer'}</strong>,</p>
      <p>Thank you for shopping on InduKart. We have received your order <strong>#${order.orderNumber}</strong>.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #f8fafc;">
            <th style="padding: 8px; text-align: left;">Item</th>
            <th style="padding: 8px; text-align: center;">Qty</th>
            <th style="padding: 8px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      
      <div style="text-align: right; font-size: 16px; font-weight: bold; margin-top: 10px;">
        Total Amount: ₹${order.totalAmount}
      </div>

      <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 13px; color: #1e40af;">
        <strong>Delivery Address:</strong><br/>
        ${order.shippingAddress?.name || ''}, ${order.shippingAddress?.street || ''}, ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.pincode || ''}<br/>
        Phone: ${order.shippingAddress?.phone || ''}
      </div>

      <p>Regards,<br/>InduKart Team</p>
    </div>
  `;
  return sendMail({ to: user.email, subject, html, type: 'order_confirmation' });
};

// 3. Order Status Update Email
exports.sendOrderStatusUpdateEmail = async (user, orderNumber, productName, newStatus) => {
  const subject = `Order #${orderNumber} Update: Status changed to ${newStatus.toUpperCase()}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px;">
      <h2 style="color: #2563eb;">Order Status Notification</h2>
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>Your item <strong>${productName}</strong> in Order <strong>#${orderNumber}</strong> has been updated to:</p>
      <div style="display: inline-block; background-color: #2563eb; color: #fff; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 14px; text-transform: uppercase;">
        ${newStatus}
      </div>
      <p style="margin-top: 20px; font-size: 13px; color: #6b7280;">You can view detailed tracking by logging into your account dashboard.</p>
    </div>
  `;
  return sendMail({ to: user.email, subject, html, type: 'order_status' });
};

// 4. Return Request Submitted Email
exports.sendReturnRequestedEmail = async (user, returnReq, itemInfo) => {
  const subject = `Return Request Received for Order #${itemInfo.orderNumber}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px;">
      <h2 style="color: #ea580c;">Return Request Received</h2>
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>We have received your return request for <strong>${itemInfo.productName}</strong>.</p>
      
      <div style="background-color: #fff7ed; border-left: 4px solid #f97316; padding: 15px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0;"><strong>Reason:</strong> ${returnReq.reason}</p>
        <p style="margin: 0 0 8px 0;"><strong>Refund Amount:</strong> ₹${returnReq.refundAmount}</p>
        <p style="margin: 0;"><strong>Refund Mode:</strong> Direct Bank Transfer (A/C: ${returnReq.accountNumber.slice(-4).padStart(returnReq.accountNumber.length, '*')})</p>
      </div>

      <p style="font-size: 13px; color: #4b5563;">Our seller/admin team will inspect the request. Once approved and picked up, your refund will be credited to your bank account within <strong>2 to 3 working days</strong>.</p>
      
      <p>Thank you for your patience,<br/>InduKart Support</p>
    </div>
  `;
  return sendMail({ to: user.email, subject, html, type: 'return_request' });
};

// 5. Refund Processed Email (Money credited in 2-3 working days)
exports.sendRefundProcessedEmail = async (user, returnReq, itemInfo) => {
  const subject = `Refund Processed: ₹${returnReq.refundAmount} for Order #${itemInfo.orderNumber}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px;">
      <h2 style="color: #16a34a; text-align: center;">Refund Initiated Successfully! 💰</h2>
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>Great news! Your refund for <strong>${itemInfo.productName}</strong> has been processed by seller/admin.</p>
      
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 18px; border-radius: 10px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #15803d;">Bank Refund Details</h3>
        <p style="margin: 4px 0;"><strong>Amount:</strong> ₹${returnReq.refundAmount}</p>
        <p style="margin: 4px 0;"><strong>Bank Name:</strong> ${returnReq.bankName}</p>
        <p style="margin: 4px 0;"><strong>Account Holder:</strong> ${returnReq.accountHolderName}</p>
        <p style="margin: 4px 0;"><strong>Account Number:</strong> ${returnReq.accountNumber}</p>
        <p style="margin: 4px 0;"><strong>IFSC Code:</strong> ${returnReq.ifscCode}</p>
        ${returnReq.upiId ? `<p style="margin: 4px 0;"><strong>UPI ID:</strong> ${returnReq.upiId}</p>` : ''}
        ${returnReq.refundTransactionId ? `<p style="margin: 4px 0;"><strong>Transaction Ref:</strong> ${returnReq.refundTransactionId}</p>` : ''}
      </div>

      <div style="background-color: #fef3c7; border: 1px solid #fde68a; padding: 12px; border-radius: 8px; font-size: 13px; color: #92400e;">
        ⏳ <strong>Estimated Credit Time:</strong> The amount will be reflected in your bank account within <strong>2 to 3 working days</strong>.
      </div>

      <p style="margin-top: 20px;">If you have any questions, feel free to contact our customer support.</p>
      <p>Warm regards,<br/><strong>InduKart Accounts & Refunds Team</strong></p>
    </div>
  `;
  return sendMail({ to: user.email, subject, html, type: 'refund_processed' });
};

// 6. Test Email
exports.sendTestEmail = async (toEmail) => {
  const subject = `InduKart Test Notification Email`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px;">
      <h2 style="color: #2563eb; text-align: center;">Test Notification Email</h2>
      <p>Hello Admin,</p>
      <p>This is a test notification email generated from the <strong>SuperAdmin Mail Control Panel</strong>.</p>
      <p>Sent at: <strong>${new Date().toLocaleString()}</strong></p>
      <p>Status: All email parameters are working correctly!</p>
    </div>
  `;
  return sendMail({ to: toEmail, subject, html, type: 'test' });
};
