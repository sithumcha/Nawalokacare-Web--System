// backend/routes/emailRoutes.js
const express = require('express');
const router = express.Router();
const { 
  sendConsultationLinkEmail, 
  sendAppointmentConfirmation 
} = require('../controllers/emailController');

// Send consultation link
router.post('/consultation-link', sendConsultationLinkEmail);

// Send appointment status update
router.post('/appointment-confirmation', sendAppointmentConfirmation);

// Test email endpoint
// Test with Gmail SMTP
// router.post('/test-gmail', async (req, res) => {
//   try {
//     const { to } = req.body;
    
//     // Create Gmail transporter
//     const gmailTransporter = nodemailer.createTransport({
//       host: 'smtp.gmail.com',
//       port: 587,
//       secure: false,
//       auth: {
//         user: process.env.GMAIL_USER || process.env.SMTP_USER,
//         pass: process.env.GMAIL_PASS || process.env.SMTP_PASS
//       }
//     });

//     const mailOptions = {
//       from: `"Medical Gmail Test" <${process.env.GMAIL_USER || process.env.SMTP_USER}>`,
//       to: to || process.env.SMTP_USER,
//       subject: 'Gmail Test - Medical System',
//       text: 'This is a test email sent via Gmail SMTP.',
//       html: '<p>This is a test email sent via Gmail SMTP.</p>'
//     };

//     const info = await gmailTransporter.sendMail(mailOptions);
    
//     res.json({
//       success: true,
//       message: 'Gmail test email sent',
//       messageId: info.messageId
//     });
//   } catch (error) {
//     console.error('Gmail test error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

module.exports = router;