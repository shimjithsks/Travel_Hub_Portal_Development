// Email Notification Service
// Uses Firebase Trigger Email Extension
// Setup: Firebase Console → Extensions → Install "Trigger Email" → Configure SMTP

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';

// Company details for emails
const COMPANY_NAME = 'Travel Axis';
const COMPANY_EMAIL = 'partners@travelaxis.com';
const COMPANY_PHONE = '+91 1800 123 4567';
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://shimjithsks.github.io/Travel_Hub_Portal_Development'
  : 'http://localhost:3000';
const LOGIN_URL = `${BASE_URL}/#/agent-login`;
const SET_PASSWORD_URL = `${BASE_URL}/#/set-password`;

// Firestore collection for emails (used by Firebase Trigger Email extension)
const MAIL_COLLECTION = 'mail';

/**
 * Send email via Firebase Trigger Email Extension
 * Writes to 'mail' collection which triggers the extension to send email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Plain text content
 * @param {string} html - HTML content
 * @returns {Promise}
 */
const sendEmail = async (to, subject, text, html) => {
  try {
    const mailRef = collection(db, MAIL_COLLECTION);
    
    await addDoc(mailRef, {
      to: to,
      message: {
        subject: subject,
        text: text,
        html: html
      },
      createdAt: serverTimestamp()
    });

    console.log('Email queued successfully for:', to);
    return { success: true, message: 'Email queued for delivery' };
  } catch (error) {
    console.error('Error queuing email:', error);
    // Log email content for demo/debugging
    console.log('='.repeat(50));
    console.log('EMAIL NOTIFICATION (Would be sent)');
    console.log('='.repeat(50));
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('-'.repeat(50));
    console.log(text);
    console.log('='.repeat(50));
    
    return { success: false, error: error.message, demo: true };
  }
};

/**
 * Send partner approval email
 * @param {Object} partner - Partner data
 * @returns {Promise}
 */
export const sendApprovalEmail = async (partner) => {
  const to = partner.email;
  const subject = `Congratulations! Your ${COMPANY_NAME} Partner Application is Approved`;
  
  const text = `
Dear ${partner.title} ${partner.contactFirstName} ${partner.contactLastName},

Great news! Your partner application for ${partner.companyName} has been approved.

Your Partner Details:
━━━━━━━━━━━━━━━━━━━━━━━━
Partner ID: ${partner.partnerId}
Company: ${partner.companyName}
Email: ${partner.email}
Status: APPROVED ✓

Next Steps:
1. Set your password: ${SET_PASSWORD_URL}?email=${encodeURIComponent(partner.email)}
2. Login to your Partner Dashboard: ${LOGIN_URL}
3. Start booking and earning commissions!

Benefits of being a Travel Axis Partner:
• 5% commission on all bookings
• Access to exclusive deals and offers
• Real-time booking management
• 24/7 dedicated partner support
• Quick and secure payouts

If you have any questions, feel free to reach out to us:
Email: ${COMPANY_EMAIL}
Phone: ${COMPANY_PHONE}

Welcome to the Travel Axis family!

Best Regards,
The ${COMPANY_NAME} Team
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #14b8a6, #0d9488); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
    .details-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #14b8a6; }
    .badge { display: inline-block; background: #10b981; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
    .btn { display: inline-block; background: #14b8a6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
    .btn:hover { background: #0d9488; }
    .benefits { background: white; padding: 15px 20px; border-radius: 8px; margin: 20px 0; }
    .benefits li { margin: 8px 0; }
    .footer { text-align: center; color: #666; font-size: 14px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Congratulations!</h1>
      <p>Your Partner Application is Approved</p>
    </div>
    <div class="content">
      <p>Dear ${partner.title} ${partner.contactFirstName} ${partner.contactLastName},</p>
      <p>Great news! Your partner application for <strong>${partner.companyName}</strong> has been approved.</p>
      
      <div class="details-box">
        <h3>Your Partner Details</h3>
        <p><strong>Partner ID:</strong> ${partner.partnerId}</p>
        <p><strong>Company:</strong> ${partner.companyName}</p>
        <p><strong>Email:</strong> ${partner.email}</p>
        <p><strong>Status:</strong> <span class="badge">APPROVED ✓</span></p>
      </div>

      <h3>Next Steps</h3>
      <p>
        <a href="${SET_PASSWORD_URL}?email=${encodeURIComponent(partner.email)}" class="btn">Set Your Password</a>
        <a href="${LOGIN_URL}" class="btn">Login to Dashboard</a>
      </p>

      <div class="benefits">
        <h4>Benefits of being a Travel Axis Partner:</h4>
        <ul>
          <li>✅ 5% commission on all bookings</li>
          <li>✅ Access to exclusive deals and offers</li>
          <li>✅ Real-time booking management</li>
          <li>✅ 24/7 dedicated partner support</li>
          <li>✅ Quick and secure payouts</li>
        </ul>
      </div>

      <p>If you have any questions, feel free to reach out:</p>
      <p>📧 ${COMPANY_EMAIL} | 📞 ${COMPANY_PHONE}</p>

      <p><strong>Welcome to the Travel Axis family!</strong></p>
      
      <div class="footer">
        <p>Best Regards,<br>The ${COMPANY_NAME} Team</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  return sendEmail(to, subject, text, html);
};

/**
 * Send partner rejection email
 * @param {Object} partner - Partner data
 * @param {string} reason - Rejection reason
 * @returns {Promise}
 */
export const sendRejectionEmail = async (partner, reason) => {
  const to = partner.email;
  const subject = `Update on Your ${COMPANY_NAME} Partner Application`;
  
  const text = `
Dear ${partner.title} ${partner.contactFirstName} ${partner.contactLastName},

Thank you for your interest in becoming a ${COMPANY_NAME} partner.

After careful review of your application for ${partner.companyName}, we regret to inform you that we are unable to approve your partnership request at this time.

Reason:
${reason}

What you can do:
• Review and address the issues mentioned above
• Submit a new application with updated/correct information
• Contact our support team for clarification

If you believe this decision was made in error or have additional documentation to support your application, please don't hesitate to reach out to us:

Email: ${COMPANY_EMAIL}
Phone: ${COMPANY_PHONE}

We appreciate your understanding and hope to work with you in the future.

Best Regards,
The ${COMPANY_NAME} Team
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #64748b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
    .reason-box { background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107; }
    .next-steps { background: white; padding: 15px 20px; border-radius: 8px; margin: 20px 0; }
    .next-steps li { margin: 8px 0; }
    .footer { text-align: center; color: #666; font-size: 14px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Application Update</h1>
      <p>Partner Program Application Status</p>
    </div>
    <div class="content">
      <p>Dear ${partner.title} ${partner.contactFirstName} ${partner.contactLastName},</p>
      <p>Thank you for your interest in becoming a ${COMPANY_NAME} partner.</p>
      <p>After careful review of your application for <strong>${partner.companyName}</strong>, we regret to inform you that we are unable to approve your partnership request at this time.</p>
      
      <div class="reason-box">
        <h4>⚠️ Reason:</h4>
        <p>${reason}</p>
      </div>

      <div class="next-steps">
        <h4>What you can do:</h4>
        <ul>
          <li>📝 Review and address the issues mentioned above</li>
          <li>🔄 Submit a new application with updated/correct information</li>
          <li>📞 Contact our support team for clarification</li>
        </ul>
      </div>

      <p>If you believe this decision was made in error, please reach out:</p>
      <p>📧 ${COMPANY_EMAIL} | 📞 ${COMPANY_PHONE}</p>

      <p>We appreciate your understanding and hope to work with you in the future.</p>
      
      <div class="footer">
        <p>Best Regards,<br>The ${COMPANY_NAME} Team</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  return sendEmail(to, subject, text, html);
};

/**
 * Send welcome/registration confirmation email
 * @param {Object} partner - Partner data
 * @returns {Promise}
 */
export const sendWelcomeEmail = async (partner) => {
  const to = partner.email;
  const subject = `Application Received - ${COMPANY_NAME} Partner Program`;
  
  const text = `
Dear ${partner.title} ${partner.contactFirstName} ${partner.contactLastName},

Thank you for applying to the ${COMPANY_NAME} Partner Program!

We have received your application for:
━━━━━━━━━━━━━━━━━━━━━━━━
Company: ${partner.companyName}
Email: ${partner.email}
Phone: ${partner.mobile}
Location: ${partner.city}, ${partner.state}

What happens next?
1. Our team will review your application within 2-3 business days
2. We may contact you for additional information if needed
3. You will receive an email notification once your application is processed

Application Status: PENDING REVIEW

While you wait, you can:
• Prepare your business documents
• Familiarize yourself with our services at travelaxis.com
• Follow us on social media for updates

If you have any questions, please contact us:
Email: ${COMPANY_EMAIL}
Phone: ${COMPANY_PHONE}

Thank you for choosing Travel Axis!

Best Regards,
The ${COMPANY_NAME} Team
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #14b8a6, #0d9488); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
    .details-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #14b8a6; }
    .badge { display: inline-block; background: #f59e0b; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
    .steps { background: white; padding: 15px 20px; border-radius: 8px; margin: 20px 0; }
    .steps li { margin: 8px 0; }
    .footer { text-align: center; color: #666; font-size: 14px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 Application Received</h1>
      <p>Thank you for applying!</p>
    </div>
    <div class="content">
      <p>Dear ${partner.title} ${partner.contactFirstName} ${partner.contactLastName},</p>
      <p>Thank you for applying to the <strong>${COMPANY_NAME} Partner Program</strong>!</p>
      
      <div class="details-box">
        <h3>Application Details</h3>
        <p><strong>Company:</strong> ${partner.companyName}</p>
        <p><strong>Email:</strong> ${partner.email}</p>
        <p><strong>Phone:</strong> ${partner.mobile}</p>
        <p><strong>Location:</strong> ${partner.city}, ${partner.state}</p>
        <p><strong>Status:</strong> <span class="badge">PENDING REVIEW</span></p>
      </div>

      <div class="steps">
        <h4>What happens next?</h4>
        <ol>
          <li>🔍 Our team will review your application within 2-3 business days</li>
          <li>📞 We may contact you for additional information if needed</li>
          <li>📧 You will receive an email notification once processed</li>
        </ol>
      </div>

      <p>If you have any questions, please contact us:</p>
      <p>📧 ${COMPANY_EMAIL} | 📞 ${COMPANY_PHONE}</p>

      <p><strong>Thank you for choosing Travel Axis!</strong></p>
      
      <div class="footer">
        <p>Best Regards,<br>The ${COMPANY_NAME} Team</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  return sendEmail(to, subject, text, html);
};

/**
 * Generate a temporary password for new partners
 * @returns {string}
 */
export const generateTemporaryPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

/**
 * Send password setup email
 * @param {Object} partner - Partner data
 * @param {string} tempPassword - Temporary password (optional)
 * @returns {Promise}
 */
export const sendPasswordSetupEmail = async (partner, tempPassword = null) => {
  const to = partner.email;
  const subject = `Set Your ${COMPANY_NAME} Partner Account Password`;
  
  const text = tempPassword ? `
Dear ${partner.title} ${partner.contactFirstName},

Your temporary password has been generated for your ${COMPANY_NAME} Partner account.

━━━━━━━━━━━━━━━━━━━━━━━━
Partner ID: ${partner.partnerId}
Email: ${partner.email}
Temporary Password: ${tempPassword}
━━━━━━━━━━━━━━━━━━━━━━━━

Please login and change your password immediately: ${LOGIN_URL}

For security reasons:
• This temporary password expires in 24 hours
• Please create a strong password after first login
• Never share your password with anyone

Best Regards,
The ${COMPANY_NAME} Team
  `.trim() : `
Dear ${partner.title} ${partner.contactFirstName},

Please set up your password to access your ${COMPANY_NAME} Partner account.

Click the link below to create your password:
${SET_PASSWORD_URL}?email=${encodeURIComponent(partner.email)}

Your Partner ID: ${partner.partnerId}

This link expires in 24 hours. If you did not request this, please ignore this email.

Best Regards,
The ${COMPANY_NAME} Team
  `.trim();

  const html = tempPassword ? `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #14b8a6, #0d9488); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
    .credentials-box { background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px dashed #14b8a6; text-align: center; }
    .password { font-size: 24px; font-family: monospace; color: #14b8a6; letter-spacing: 2px; }
    .warning { background: #fef3cd; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .btn { display: inline-block; background: #14b8a6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; }
    .footer { text-align: center; color: #666; font-size: 14px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Your Temporary Password</h1>
    </div>
    <div class="content">
      <p>Dear ${partner.title} ${partner.contactFirstName},</p>
      <p>Your temporary password has been generated for your ${COMPANY_NAME} Partner account.</p>
      
      <div class="credentials-box">
        <p><strong>Partner ID:</strong> ${partner.partnerId}</p>
        <p><strong>Email:</strong> ${partner.email}</p>
        <p><strong>Temporary Password:</strong></p>
        <p class="password">${tempPassword}</p>
      </div>

      <p style="text-align: center;">
        <a href="${LOGIN_URL}" class="btn">Login Now</a>
      </p>

      <div class="warning">
        <h4>⚠️ Security Notice:</h4>
        <ul>
          <li>This temporary password expires in 24 hours</li>
          <li>Please change your password after first login</li>
          <li>Never share your password with anyone</li>
        </ul>
      </div>
      
      <div class="footer">
        <p>Best Regards,<br>The ${COMPANY_NAME} Team</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim() : `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #14b8a6, #0d9488); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
    .btn { display: inline-block; background: #14b8a6; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-size: 18px; }
    .footer { text-align: center; color: #666; font-size: 14px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Set Your Password</h1>
    </div>
    <div class="content">
      <p>Dear ${partner.title} ${partner.contactFirstName},</p>
      <p>Please set up your password to access your ${COMPANY_NAME} Partner account.</p>
      
      <p style="text-align: center; margin: 30px 0;">
        <a href="${SET_PASSWORD_URL}?email=${encodeURIComponent(partner.email)}" class="btn">Set Password</a>
      </p>

      <p><strong>Your Partner ID:</strong> ${partner.partnerId}</p>
      <p style="color: #666; font-size: 14px;">This link expires in 24 hours. If you did not request this, please ignore this email.</p>
      
      <div class="footer">
        <p>Best Regards,<br>The ${COMPANY_NAME} Team</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  return sendEmail(to, subject, text, html);
};

/**
 * Send password reset email
 * @param {Object} partner - Partner data
 * @param {string} resetToken - Reset token for verification
 * @returns {Promise}
 */
export const sendPasswordResetEmail = async (partner, resetToken) => {
  const to = partner.email;
  const subject = `Reset Your ${COMPANY_NAME} Partner Password`;
  const RESET_PASSWORD_URL = `${BASE_URL}/#/set-password?email=${encodeURIComponent(partner.email)}&token=${resetToken}`;
  
  const text = `
Dear ${partner.title} ${partner.contactFirstName} ${partner.contactLastName},

We received a request to reset the password for your ${COMPANY_NAME} Partner account.

━━━━━━━━━━━━━━━━━━━━━━━━
Partner ID: ${partner.partnerId}
Company: ${partner.companyName}
Email: ${partner.email}
━━━━━━━━━━━━━━━━━━━━━━━━

To reset your password, click the link below:
${RESET_PASSWORD_URL}

⚠️ IMPORTANT:
• This link will expire in 1 hour
• If you didn't request this password reset, please ignore this email
• Your password will remain unchanged until you create a new one

For security reasons, we recommend:
• Use a strong password with letters, numbers, and symbols
• Don't share your password with anyone
• Enable two-factor authentication if available

If you continue to have problems or did not request this change, please contact us:
Email: ${COMPANY_EMAIL}
Phone: ${COMPANY_PHONE}

Best Regards,
The ${COMPANY_NAME} Partner Team
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
    .btn { display: inline-block; background: #14b8a6; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-size: 18px; }
    .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .warning { background: #fef3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .warning i { color: #856404; }
    .footer { text-align: center; color: #666; font-size: 14px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Password Reset Request</h1>
    </div>
    <div class="content">
      <p>Dear ${partner.title} ${partner.contactFirstName},</p>
      <p>We received a request to reset the password for your <strong>${COMPANY_NAME}</strong> Partner account.</p>
      
      <div class="details">
        <p><strong>Partner ID:</strong> ${partner.partnerId}</p>
        <p><strong>Company:</strong> ${partner.companyName}</p>
        <p><strong>Email:</strong> ${partner.email}</p>
      </div>

      <p style="text-align: center; margin: 30px 0;">
        <a href="${RESET_PASSWORD_URL}" class="btn">Reset Password</a>
      </p>

      <div class="warning">
        <p><strong>⚠️ Important:</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>This link will expire in <strong>1 hour</strong></li>
          <li>If you didn't request this, please ignore this email</li>
          <li>Your password will remain unchanged until you create a new one</li>
        </ul>
      </div>

      <p style="color: #666; font-size: 14px;">
        If you're having trouble clicking the button, copy and paste this URL into your browser:<br>
        <span style="word-break: break-all; color: #14b8a6;">${RESET_PASSWORD_URL}</span>
      </p>
      
      <div class="footer">
        <p>Best Regards,<br>The ${COMPANY_NAME} Partner Team</p>
        <p style="font-size: 12px; color: #999;">
          Email: ${COMPANY_EMAIL} | Phone: ${COMPANY_PHONE}
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  return sendEmail(to, subject, text, html);
};

/**
 * Send password changed confirmation email
 * @param {Object} partner - Partner data
 * @returns {Promise}
 */
export const sendPasswordChangedEmail = async (partner) => {
  const to = partner.email;
  const subject = `✅ Your ${COMPANY_NAME} Password Has Been Changed`;
  const changedAt = new Date().toLocaleString('en-IN', { 
    dateStyle: 'full', 
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata'
  });
  
  const text = `
Dear ${partner.title} ${partner.contactFirstName} ${partner.contactLastName},

Your ${COMPANY_NAME} Partner account password has been successfully changed.

━━━━━━━━━━━━━━━━━━━━━━━━
Account Details:
━━━━━━━━━━━━━━━━━━━━━━━━
Partner ID: ${partner.partnerId}
Company: ${partner.companyName}
Email: ${partner.email}
Changed On: ${changedAt}
━━━━━━━━━━━━━━━━━━━━━━━━

If you made this change, no further action is required. You can now login with your new password.

⚠️ DIDN'T MAKE THIS CHANGE?
If you did not change your password, your account may be compromised. Please take these steps immediately:
1. Reset your password: ${BASE_URL}/#/forgot-password
2. Contact our support team: ${COMPANY_EMAIL}
3. Review your recent account activity

Security Tips:
• Never share your password with anyone
• Use a unique password for your Travel Axis account
• Update your password regularly
• Be cautious of phishing emails

If you have any questions or concerns, please contact us:
Email: ${COMPANY_EMAIL}
Phone: ${COMPANY_PHONE}

Best Regards,
The ${COMPANY_NAME} Partner Security Team
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .header-icon { font-size: 60px; margin-bottom: 10px; }
    .content { background: #f8f9fa; padding: 30px; }
    .success-box { background: linear-gradient(135deg, #dcfce7, #bbf7d0); border: 2px solid #22c55e; border-radius: 12px; padding: 25px; margin: 20px 0; text-align: center; }
    .success-box h3 { color: #166534; margin: 0 0 10px 0; font-size: 20px; }
    .success-box p { color: #15803d; margin: 0; }
    .details { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #22c55e; }
    .details-row { display: flex; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
    .details-label { font-weight: 600; color: #666; width: 120px; }
    .details-value { color: #333; }
    .warning-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 20px; margin: 25px 0; }
    .warning-box h4 { color: #dc2626; margin: 0 0 12px 0; }
    .warning-box ul { margin: 10px 0; padding-left: 20px; color: #7f1d1d; }
    .warning-box li { margin: 5px 0; }
    .btn { display: inline-block; background: linear-gradient(135deg, #14b8a6, #0d9488); color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; }
    .tips { background: #eff6ff; border-radius: 10px; padding: 20px; margin: 20px 0; }
    .tips h4 { color: #1e40af; margin: 0 0 12px 0; }
    .tips ul { margin: 0; padding-left: 20px; color: #1e3a8a; }
    .tips li { margin: 5px 0; }
    .footer { background: #1e293b; color: #94a3b8; padding: 25px; text-align: center; border-radius: 0 0 10px 10px; }
    .footer a { color: #5eead4; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-icon">🔒</div>
      <h1 style="margin: 0;">Password Changed Successfully</h1>
    </div>
    <div class="content">
      <p>Dear ${partner.title} ${partner.contactFirstName},</p>
      
      <div class="success-box">
        <h3>✅ Your Password Has Been Updated</h3>
        <p>Your ${COMPANY_NAME} Partner account is now secured with your new password.</p>
      </div>

      <div class="details">
        <div class="details-row">
          <span class="details-label">Partner ID:</span>
          <span class="details-value">${partner.partnerId}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Company:</span>
          <span class="details-value">${partner.companyName}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Email:</span>
          <span class="details-value">${partner.email}</span>
        </div>
        <div class="details-row" style="border-bottom: none;">
          <span class="details-label">Changed On:</span>
          <span class="details-value">${changedAt}</span>
        </div>
      </div>

      <p style="text-align: center; margin: 25px 0;">
        <a href="${LOGIN_URL}" class="btn">Login to Dashboard →</a>
      </p>

      <div class="warning-box">
        <h4>🚨 Didn't Make This Change?</h4>
        <p style="margin: 0 0 10px 0; color: #991b1b;">If you did not change your password, your account may be compromised. Please:</p>
        <ul>
          <li>Reset your password immediately</li>
          <li>Contact our support team at ${COMPANY_EMAIL}</li>
          <li>Review your recent account activity</li>
        </ul>
      </div>

      <div class="tips">
        <h4>🛡️ Security Tips</h4>
        <ul>
          <li>Never share your password with anyone</li>
          <li>Use a unique password for your Travel Axis account</li>
          <li>Update your password regularly</li>
          <li>Be cautious of phishing emails</li>
        </ul>
      </div>
    </div>
    <div class="footer">
      <p style="margin: 0 0 10px 0;">Need help? Contact us anytime</p>
      <p style="margin: 0;">
        <a href="mailto:${COMPANY_EMAIL}">${COMPANY_EMAIL}</a> | ${COMPANY_PHONE}
      </p>
      <p style="margin: 15px 0 0 0; font-size: 12px; color: #64748b;">
        © 2026 ${COMPANY_NAME}. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return sendEmail(to, subject, text, html);
};

/**
 * Send customer password reset email
 * @param {Object} customer - Customer data { email, name }
 * @param {string} resetToken - Reset token for verification
 * @returns {Promise}
 */
export const sendCustomerPasswordResetEmail = async (customer) => {
  const to = customer.email;
  const subject = `🔐 Password Reset Request - ${COMPANY_NAME}`;
  
  const text = `
Dear ${customer.name || 'Valued Customer'},

We received a request to reset the password for your ${COMPANY_NAME} account.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Account Email: ${customer.email}
Request Time: ${new Date().toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Asia/Kolkata' })}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📧 CHECK YOUR INBOX
A separate email with the password reset link has been sent to your inbox.
Please check your email (including spam/junk folder) for the reset link.

⚠️ IMPORTANT SECURITY INFORMATION:
• The reset link will expire in 1 hour
• If you didn't request this password reset, please ignore both emails
• Your password will remain unchanged until you create a new one
• Never share your password or reset link with anyone

🔒 PASSWORD TIPS:
• Use a strong password with at least 8 characters
• Include uppercase, lowercase, numbers, and symbols
• Don't reuse passwords from other websites

If you continue to have problems, please contact us:
Email: ${COMPANY_EMAIL}
Phone: ${COMPANY_PHONE}

Safe Travels!
The ${COMPANY_NAME} Team
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f0f4f8; }
    .wrapper { padding: 30px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
    .header-icon { font-size: 60px; margin-bottom: 15px; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
    .header p { margin: 10px 0 0; opacity: 0.9; font-size: 16px; }
    .content { padding: 40px 30px; }
    .greeting { font-size: 18px; color: #333; margin-bottom: 20px; }
    .info-card { background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%); border: 1px solid #e0e7ff; border-radius: 12px; padding: 25px; margin: 25px 0; }
    .info-card h3 { margin: 0 0 15px; color: #667eea; font-size: 16px; display: flex; align-items: center; gap: 10px; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed #d0d7ff; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #666; font-size: 14px; }
    .info-value { color: #333; font-weight: 600; font-size: 14px; }
    .action-box { background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%); border: 2px solid #81c784; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center; }
    .action-box h3 { margin: 0 0 10px; color: #2e7d32; font-size: 18px; }
    .action-box p { margin: 0; color: #558b2f; font-size: 15px; }
    .action-icon { font-size: 40px; margin-bottom: 10px; }
    .security-box { background: linear-gradient(135deg, #fff8e1 0%, #fff3e0 100%); border: 1px solid #ffe082; border-radius: 12px; padding: 20px; margin: 25px 0; }
    .security-box h4 { margin: 0 0 15px; color: #f57c00; font-size: 15px; display: flex; align-items: center; gap: 8px; }
    .security-list { margin: 0; padding-left: 20px; }
    .security-list li { margin: 8px 0; color: #bf360c; font-size: 14px; }
    .tips-box { background: #f5f5f5; border-radius: 12px; padding: 20px; margin: 25px 0; }
    .tips-box h4 { margin: 0 0 15px; color: #424242; font-size: 15px; display: flex; align-items: center; gap: 8px; }
    .tips-list { margin: 0; padding-left: 20px; }
    .tips-list li { margin: 8px 0; color: #616161; font-size: 14px; }
    .footer { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
    .footer-brand { font-size: 20px; font-weight: 600; margin-bottom: 10px; }
    .footer-contact { font-size: 14px; opacity: 0.9; }
    .footer-contact a { color: white; text-decoration: none; }
    .divider { height: 1px; background: linear-gradient(90deg, transparent, #e0e0e0, transparent); margin: 25px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="header-icon">🔐</div>
        <h1>Password Reset Request</h1>
        <p>We're here to help you get back into your account</p>
      </div>
      
      <div class="content">
        <p class="greeting">Dear <strong>${customer.name || 'Valued Customer'}</strong>,</p>
        <p>We received a request to reset the password for your <strong>${COMPANY_NAME}</strong> account.</p>
        
        <div class="info-card">
          <h3>📋 Request Details</h3>
          <div class="info-row">
            <span class="info-label">Account Email</span>
            <span class="info-value">${customer.email}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Request Time</span>
            <span class="info-value">${new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })}</span>
          </div>
        </div>

        <div class="action-box">
          <div class="action-icon">📧</div>
          <h3>Check Your Inbox!</h3>
          <p>A separate email with the password reset link has been sent.<br>
          Please check your inbox (and spam folder) for the reset link.</p>
        </div>

        <div class="security-box">
          <h4>⚠️ Important Security Information</h4>
          <ul class="security-list">
            <li>The reset link will <strong>expire in 1 hour</strong></li>
            <li>If you didn't request this, please ignore both emails</li>
            <li>Your password will remain unchanged until you create a new one</li>
            <li><strong>Never share</strong> your password or reset link with anyone</li>
          </ul>
        </div>

        <div class="tips-box">
          <h4>🔒 Password Tips</h4>
          <ul class="tips-list">
            <li>Use a strong password with at least 8 characters</li>
            <li>Include uppercase, lowercase, numbers, and symbols</li>
            <li>Don't reuse passwords from other websites</li>
          </ul>
        </div>

        <div class="divider"></div>
        
        <p style="color: #666; font-size: 14px; text-align: center;">
          Having trouble? Contact us at <a href="mailto:${COMPANY_EMAIL}" style="color: #667eea;">${COMPANY_EMAIL}</a>
        </p>
      </div>
      
      <div class="footer">
        <div class="footer-brand">✈️ ${COMPANY_NAME}</div>
        <div class="footer-contact">
          📧 <a href="mailto:${COMPANY_EMAIL}">${COMPANY_EMAIL}</a> &nbsp;|&nbsp; 
          📞 ${COMPANY_PHONE}
        </div>
        <p style="margin: 15px 0 0; font-size: 12px; opacity: 0.8;">Safe Travels! 🌍</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  return sendEmail(to, subject, text, html);
};

/**
 * Send customer password changed confirmation email
 * @param {Object} customer - Customer data { email, name }
 * @returns {Promise}
 */
export const sendCustomerPasswordChangedEmail = async (customer) => {
  const to = customer.email;
  const subject = `✅ Password Changed Successfully - ${COMPANY_NAME}`;
  const changedAt = new Date().toLocaleString('en-IN', { 
    dateStyle: 'full', 
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata'
  });
  
  const text = `
Dear ${customer.name || 'Valued Customer'},

Great news! Your ${COMPANY_NAME} account password has been successfully changed.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Account Email: ${customer.email}
Changed On: ${changedAt}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ If you made this change, no further action is required.
You can now log in with your new password.

🚨 DIDN'T MAKE THIS CHANGE?
If you did not change your password, your account may be compromised. 
Please take immediate action:
1. Reset your password immediately
2. Contact our support team: ${COMPANY_EMAIL}
3. Review your recent account activity

🔒 SECURITY TIPS:
• Never share your password with anyone
• Use unique passwords for each account
• Enable two-factor authentication when available

If you have any questions, contact us:
Email: ${COMPANY_EMAIL}
Phone: ${COMPANY_PHONE}

Safe Travels!
The ${COMPANY_NAME} Team
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f0f4f8; }
    .wrapper { padding: 30px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 30px; text-align: center; }
    .header-icon { font-size: 60px; margin-bottom: 15px; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
    .header p { margin: 10px 0 0; opacity: 0.9; font-size: 16px; }
    .content { padding: 40px 30px; }
    .greeting { font-size: 18px; color: #333; margin-bottom: 20px; }
    .success-card { background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 2px solid #10b981; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center; }
    .success-card .icon { font-size: 50px; margin-bottom: 10px; }
    .success-card h3 { margin: 0 0 10px; color: #065f46; font-size: 20px; }
    .success-card p { margin: 0; color: #047857; font-size: 15px; }
    .info-card { background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 25px 0; }
    .info-card h3 { margin: 0 0 15px; color: #334155; font-size: 16px; display: flex; align-items: center; gap: 10px; }
    .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px dashed #cbd5e1; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #64748b; font-size: 14px; }
    .info-value { color: #1e293b; font-weight: 600; font-size: 14px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); }
    .btn:hover { background: linear-gradient(135deg, #059669, #047857); }
    .warning-box { background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 2px solid #f87171; border-radius: 12px; padding: 25px; margin: 25px 0; }
    .warning-box h4 { margin: 0 0 15px; color: #dc2626; font-size: 16px; display: flex; align-items: center; gap: 10px; }
    .warning-list { margin: 0; padding-left: 20px; }
    .warning-list li { margin: 8px 0; color: #991b1b; font-size: 14px; }
    .tips-box { background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 1px solid #93c5fd; border-radius: 12px; padding: 20px; margin: 25px 0; }
    .tips-box h4 { margin: 0 0 15px; color: #1d4ed8; font-size: 15px; display: flex; align-items: center; gap: 8px; }
    .tips-list { margin: 0; padding-left: 20px; }
    .tips-list li { margin: 8px 0; color: #1e40af; font-size: 14px; }
    .footer { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; }
    .footer-brand { font-size: 20px; font-weight: 600; margin-bottom: 10px; }
    .footer-contact { font-size: 14px; opacity: 0.9; }
    .footer-contact a { color: white; text-decoration: none; }
    .divider { height: 1px; background: linear-gradient(90deg, transparent, #e0e0e0, transparent); margin: 25px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="header-icon">🔐</div>
        <h1>Password Changed Successfully!</h1>
        <p>Your account is now secured with your new password</p>
      </div>
      
      <div class="content">
        <p class="greeting">Dear <strong>${customer.name || 'Valued Customer'}</strong>,</p>
        <p>Great news! Your <strong>${COMPANY_NAME}</strong> account password has been successfully updated.</p>
        
        <div class="success-card">
          <div class="icon">✅</div>
          <h3>Password Update Complete</h3>
          <p>You can now log in with your new password</p>
        </div>

        <div class="info-card">
          <h3>📋 Change Details</h3>
          <div class="info-row">
            <span class="info-label">Account Email</span>
            <span class="info-value">${customer.email}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Changed On</span>
            <span class="info-value">${changedAt}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Status</span>
            <span class="info-value" style="color: #10b981;">✓ Successful</span>
          </div>
        </div>

        <p style="text-align: center; margin: 30px 0;">
          <a href="${BASE_URL}" class="btn">Continue to Travel Axis →</a>
        </p>

        <div class="warning-box">
          <h4>🚨 Didn't Make This Change?</h4>
          <p style="margin: 0 0 15px; color: #991b1b;">If you did not authorize this password change, your account may be at risk. Take immediate action:</p>
          <ul class="warning-list">
            <li><strong>Reset your password</strong> immediately</li>
            <li><strong>Contact our support</strong> at ${COMPANY_EMAIL}</li>
            <li><strong>Review your account</strong> for any unauthorized activity</li>
          </ul>
        </div>

        <div class="tips-box">
          <h4>🛡️ Keep Your Account Secure</h4>
          <ul class="tips-list">
            <li>Never share your password with anyone</li>
            <li>Use unique passwords for each account</li>
            <li>Be cautious of phishing emails</li>
          </ul>
        </div>

        <div class="divider"></div>
        
        <p style="color: #666; font-size: 14px; text-align: center;">
          Need help? Contact us at <a href="mailto:${COMPANY_EMAIL}" style="color: #10b981;">${COMPANY_EMAIL}</a>
        </p>
      </div>
      
      <div class="footer">
        <div class="footer-brand">✈️ ${COMPANY_NAME}</div>
        <div class="footer-contact">
          📧 <a href="mailto:${COMPANY_EMAIL}">${COMPANY_EMAIL}</a> &nbsp;|&nbsp; 
          📞 ${COMPANY_PHONE}
        </div>
        <p style="margin: 15px 0 0; font-size: 12px; opacity: 0.8;">Safe Travels! 🌍</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  return sendEmail(to, subject, text, html);
};

export default {
  sendApprovalEmail,
  sendRejectionEmail,
  sendWelcomeEmail,
  sendPasswordSetupEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendCustomerPasswordResetEmail,
  sendCustomerPasswordChangedEmail,
  generateTemporaryPassword
};
