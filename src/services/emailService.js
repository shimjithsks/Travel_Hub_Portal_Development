// Email Notification Service
// Uses Firebase Trigger Email Extension
// Setup: Firebase Console → Extensions → Install "Trigger Email" → Configure SMTP

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';

// Company details for emails
const COMPANY_NAME = 'Travel Axis';
const COMPANY_EMAIL = 'partners@travelaxis.com';
const COMPANY_PHONE = '+91 1800 123 4567';
const LOGIN_URL = 'https://travelaxis.com/agent-login';
const SET_PASSWORD_URL = 'https://travelaxis.com/set-password';

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

export default {
  sendApprovalEmail,
  sendRejectionEmail,
  sendWelcomeEmail,
  sendPasswordSetupEmail,
  generateTemporaryPassword
};
