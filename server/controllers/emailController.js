// backend/controllers/emailController.js
const { sendEmail } = require('../config/nodemailer');

// Function to send consultation link email
const sendConsultationLinkEmail = async (req, res) => {
  try {
    const { 
      to, 
      patientName, 
      doctorName, 
      doctorSpecialization,
      appointmentDate, 
      appointmentTime,
      consultationLink,
      platform,
      instructions = ''
    } = req.body;

    // Validate required fields
    if (!to || !patientName || !doctorName || !consultationLink) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Platform-specific instructions
    const platformInstructions = {
      google: "Please join using your Google account. No additional software needed.",
      zoom: "Please download Zoom client or use the web version.",
      teams: "Works best with Microsoft Teams app installed."
    };

    // Default instructions if not provided
    const defaultInstructions = platformInstructions[platform] || 
      "Please ensure you have a stable internet connection and test your audio/video before joining.";

    // Email template
    const mailOptions = {
      // from: `"Medical Consultation" <${process.env.SMTP_USER}>`,
      from: {
  name: process.env.EMAIL_NAME || 'Naawloka Hospital',
  address: process.env.EMAIL_FROM || 'sithumchanukasandaruwan2002@gmail.com'
},
      to: to,
      replyTo: process.env.REPLY_TO_EMAIL || process.env.SMTP_USER,
      subject: `Online Consultation Link - Dr. ${doctorName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
            .header p { margin: 5px 0 0; opacity: 0.9; }
            .content { padding: 30px; }
            .appointment-details { background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #3b82f6; }
            .button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; transition: transform 0.2s; }
            .button:hover { transform: translateY(-2px); }
            .instructions { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .footer { text-align: center; color: #64748b; font-size: 14px; padding: 20px; border-top: 1px solid #e2e8f0; }
            .info-item { margin-bottom: 12px; }
            .info-label { font-weight: 600; color: #475569; }
            .info-value { color: #1e293b; }
            .link-box { background: white; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 15px; margin: 15px 0; word-break: break-all; }
            .platform-badge { display: inline-block; background: #e0e7ff; color: #3730a3; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-left: 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Online Consultation Link</h1>
              <p>${doctorName} - ${doctorSpecialization}</p>
            </div>
            
            <div class="content">
              <p>Dear <strong>${patientName}</strong>,</p>
              
              <p>Your online consultation with <strong>Dr. ${doctorName}</strong> has been scheduled. Please find your appointment details below:</p>
              
              <div class="appointment-details">
                <div class="info-item">
                  <span class="info-label">👨‍⚕️ Doctor:</span>
                  <span class="info-value">Dr. ${doctorName} (${doctorSpecialization})</span>
                </div>
                <div class="info-item">
                  <span class="info-label">📅 Date:</span>
                  <span class="info-value">${appointmentDate}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">⏰ Time:</span>
                  <span class="info-value">${appointmentTime}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">💻 Platform:</span>
                  <span class="info-value">${platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                  <span class="platform-badge">${platform}</span>
                </div>
              </div>
              
              <div style="text-align: center;">
                <a href="${consultationLink}" class="button" target="_blank">🎥 Join Online Consultation</a>
              </div>
              
              <div class="link-box">
                <div style="font-weight: 600; color: #475569; margin-bottom: 8px;">Alternative Link:</div>
                <a href="${consultationLink}" style="color: #3b82f6; text-decoration: none;">${consultationLink}</a>
              </div>
              
              <div class="instructions">
                <div style="font-weight: 600; color: #92400e; margin-bottom: 10px;">📋 Important Instructions:</div>
                <p>${defaultInstructions}</p>
                ${instructions ? `<p><strong>Additional Instructions:</strong> ${instructions}</p>` : ''}
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Join 5-10 minutes before your scheduled time</li>
                  <li>Test your audio and video equipment beforehand</li>
                  <li>Ensure a stable internet connection</li>
                  <li>Find a quiet, private location</li>
                </ul>
              </div>
              
              <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <strong>Need Help?</strong><br>
                If you have technical difficulties or need to reschedule, please contact us at least 30 minutes before your appointment.
              </p>
            </div>
            
            <div class="footer">
              <p>This is an automated message from the medical consultation system.</p>
              <p>Please do not reply to this email.</p>
              <p>© ${new Date().getFullYear()} Medical Consultation System. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Online Consultation Link - Dr. ${doctorName}

Dear ${patientName},

Your online consultation with Dr. ${doctorName} has been scheduled.

APPOINTMENT DETAILS:
Doctor: Dr. ${doctorName} (${doctorSpecialization})
Date: ${appointmentDate}
Time: ${appointmentTime}
Platform: ${platform}

CONSULTATION LINK:
${consultationLink}

INSTRUCTIONS:
${defaultInstructions}

${instructions ? `ADDITIONAL INSTRUCTIONS: ${instructions}\n` : ''}
• Join 5-10 minutes before your scheduled time
• Test your audio and video equipment beforehand
• Ensure a stable internet connection
• Find a quiet, private location

Need Help?
If you have technical difficulties or need to reschedule, please contact us at least 30 minutes before your appointment.

This is an automated message from the medical consultation system.
Please do not reply to this email.
      `.trim()
    };

    // Send email
    const result = await sendEmail(mailOptions);
    
    if (result.success) {
      console.log(`✅ Consultation link email sent to ${patientName} (${to})`);
      
      // Return success response with email details
      return res.status(200).json({
        success: true,
        message: 'Consultation link email sent successfully',
        emailDetails: {
          to: to,
          patientName: patientName,
          messageId: result.messageId,
          timestamp: new Date().toISOString(),
          appointmentTime: appointmentTime,
          platform: platform
        }
      });
    } else {
      throw new Error(result.error || 'Failed to send email');
    }
    
  } catch (error) {
    console.error('❌ Error in sendConsultationLinkEmail:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to send consultation link email',
      details: error.message
    });
  }
};

// Function to send appointment confirmation
const sendAppointmentConfirmation = async (req, res) => {
  try {
    const {
      to,
      patientName,
      doctorName,
      doctorSpecialization,
      appointmentDate,
      appointmentTime,
      appointmentType,
      status
    } = req.body;

    const mailOptions = {
      // from: `"Medical Consultation" <${process.env.SMTP_USER}>`,
      // ✅ FIXED: Use verified sender here too
from: {
  name: process.env.EMAIL_NAME || 'Naawloka Hospital',
  address: process.env.EMAIL_FROM || 'sithumchanukasandaruwan2002@gmail.com'
},
      to: to,
      subject: `Appointment ${status} - Dr. ${doctorName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: ${status === 'confirmed' ? '#10b981' : status === 'cancelled' ? '#ef4444' : '#3b82f6'}; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9fafb; }
            .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; padding: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Appointment ${status}</h1>
            </div>
            <div class="content">
              <p>Dear ${patientName},</p>
              <p>Your appointment has been <strong>${status}</strong>.</p>
              <div class="appointment-details">
                <p><strong>Doctor:</strong> Dr. ${doctorName} (${doctorSpecialization})</p>
                <p><strong>Date:</strong> ${appointmentDate}</p>
                <p><strong>Time:</strong> ${appointmentTime}</p>
                <p><strong>Type:</strong> ${appointmentType}</p>
              </div>
              <p>If you have any questions, please contact the clinic.</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await sendEmail(mailOptions);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Appointment confirmation email sent'
      });
    } else {
      throw new Error('Failed to send email');
    }
    
  } catch (error) {
    console.error('Error sending appointment confirmation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send appointment confirmation email'
    });
  }
};

module.exports = {
  sendConsultationLinkEmail,
  sendAppointmentConfirmation
};