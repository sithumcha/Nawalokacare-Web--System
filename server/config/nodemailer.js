const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('📧 Loading email configuration...');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_USER:', process.env.SMTP_USER);

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Test connection
transporter.verify(function(error, success) {
  if (error) {
    console.error('❌ SMTP Connection Error:', error.message);
  } else {
    console.log('✅ SMTP Server is ready to send messages');
  }
});

// Email sending function
const sendEmail = async (mailOptions) => {
  try {
    console.log('📤 Sending email to:', mailOptions.to);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Export both
module.exports = {
  transporter,
  sendEmail
};