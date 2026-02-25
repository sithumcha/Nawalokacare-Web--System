const Appointment = require("../models/Appointment");
const { transporter, sendEmail } = require("../config/nodemailer");
const path = require("path");

exports.createAppointment = async (req, res) => {
  try {
    const {
      userId,
      doctorId,
      doctorName,
      doctorSpecialization,
      consultationType,
      price,
      patientDetails,
      appointmentDate,
      timeSlot,
      timeSlotId,
      payment = {}
    } = req.body;

    console.log('📅 Creating appointment with data:', {
      userId,
      doctorId,
      timeSlotId,
      consultationType,
      price,
      patientName: patientDetails?.fullName,
      appointmentDate,
      paymentMethod: payment?.method || 'cash'
    });

    // Validate required fields
    if (!userId) {
      return res.status(400).json({
        error: "User ID is required"
      });
    }

    if (!timeSlotId) {
      return res.status(400).json({
        error: "Time slot ID is required"
      });
    }

    if (!doctorId) {
      return res.status(400).json({
        error: "Doctor ID is required"
      });
    }

    if (!consultationType) {
      return res.status(400).json({
        error: "Consultation type is required"
      });
    }

    if (!price || price <= 0) {
      return res.status(400).json({
        error: "Valid price is required"
      });
    }

    // Get doctor to check slot quantity
    const Doctor = require("../models/Doctor");
    const doctor = await Doctor.findById(doctorId);
    
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    // Find the specific time slot in doctor's available slots
    const doctorTimeSlot = doctor.availableTimeSlots.find(slot => 
      slot._id.toString() === timeSlotId
    );

    if (!doctorTimeSlot) {
      return res.status(404).json({ error: "Time slot not found for this doctor" });
    }

    const slotQuantity = doctorTimeSlot.quantity || 20;

    // Count existing appointments for this slot ON THE SAME DATE
    const existingAppointmentsCount = await Appointment.countDocuments({
      doctorId: doctorId,
      timeSlotId: timeSlotId,
      appointmentDate: new Date(appointmentDate),
      status: { $in: ["pending", "confirmed"] }
    });

    console.log(`📊 Slot ${timeSlotId} on ${appointmentDate}: ${existingAppointmentsCount}/${slotQuantity} appointments`);

    // Check if slot is full based on quantity
    if (existingAppointmentsCount >= slotQuantity) {
      return res.status(409).json({
        error: `This time slot is fully booked for the selected date. Maximum ${slotQuantity} appointments allowed.`,
        available: 0,
        booked: existingAppointmentsCount,
        capacity: slotQuantity
      });
    }

    // Generate appointment number
    const appointmentNumber = `APT${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`;

    // Create payment object with proper structure
    const paymentData = {
      method: payment?.method || 'cash',
      amount: price,

      //  status: (payment?.method === 'cash') ? 'pending' : 'pending',

      status: payment?.method === 'cash' ? 'pending' : 'paid',
      ...payment
    };

    

    // Create new appointment
    const appointment = new Appointment({
      appointmentNumber,
      userId,
      doctorId,
      doctorName,
      doctorSpecialization,
      consultationType,
      price,
      patientDetails: {
        fullName: patientDetails.fullName?.trim(),
        email: patientDetails.email?.trim() || "",
        phoneNumber: patientDetails.phoneNumber?.trim(),
        dateOfBirth: patientDetails.dateOfBirth || "",
        gender: patientDetails.gender || "",
        address: patientDetails.address || "",
        medicalConcern: patientDetails.medicalConcern?.trim(),
        previousConditions: patientDetails.previousConditions || ""
      },
      appointmentDate: new Date(appointmentDate),
      timeSlot: {
        day: timeSlot.day,
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
        consultationType: consultationType
      },
      timeSlotId: timeSlotId,
      status: "pending",
      payment: paymentData  // Use the properly structured payment object
    });

    await appointment.save();

    console.log('✅ Appointment created successfully:', {
      id: appointment._id,
      appointmentNumber: appointment.appointmentNumber,
      consultationType: appointment.consultationType,
      price: appointment.price,
      userId: userId,
      patient: patientDetails.fullName,
      timeSlot: timeSlotId,
      remainingSlots: slotQuantity - existingAppointmentsCount - 1,
      payment: appointment.payment
    });

    // Send confirmation email
    try {
      const emailResult = await sendAppointmentConfirmationEmail(appointment, doctor);
      if (emailResult.success) {
        console.log('📧 Confirmation email sent successfully');
      } else {
        console.log('⚠️ Appointment created but email not sent:', emailResult.error);
      }
    } catch (emailError) {
      console.error('❌ Error in email sending:', emailError.message);
      // Don't fail the appointment creation if email fails
    }
    
    res.status(201).json({
      message: "Appointment booked successfully!",
      appointment: {
        id: appointment._id,
        appointmentNumber: appointment.appointmentNumber,
        consultationType: appointment.consultationType,
        price: appointment.price,
        userId: appointment.userId,
        patientName: patientDetails.fullName,
        appointmentDate: appointment.appointmentDate,
        timeSlot: appointment.timeSlot,
        status: appointment.status,
        payment: appointment.payment
      },
      availability: {
        remaining: slotQuantity - existingAppointmentsCount - 1,
        booked: existingAppointmentsCount + 1,
        capacity: slotQuantity
      }
    });

  } catch (error) {
    console.error("❌ Error creating appointment:", error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(409).json({
        error: "Appointment number conflict. Please try again."
      });
    }
    
    res.status(500).json({ 
      error: "Failed to book appointment", 
      details: error.message 
    });
  }
};

// Email sending function - FIXED VERSION
const sendAppointmentConfirmationEmail = async (appointment, doctor) => {
  try {
    const patientEmail = appointment.patientDetails?.email;
    
    if (!patientEmail) {
      console.log('⚠️ No email provided for patient, skipping email');
      return { success: false, error: 'No email provided' };
    }

    const formattedDate = new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const formattedTime = (time) => {
      if (!time) return 'N/A';
      return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };

    // Safely get payment method with fallback
    const paymentMethod = appointment.payment?.method || 'cash';
    
    // Safely get consultation type with fallback
    const consultationType = appointment.consultationType || 'physical';
    
    // Safely get price with fallback
    const price = appointment.price || 0;

    const mailOptions = {
      from: {
        name: process.env.EMAIL_NAME || 'MediCare Clinic',
        address: process.env.EMAIL_FROM || process.env.SENDER_EMAIL || 'noreply@medicare.com'
      },
      to: patientEmail,
      subject: `Appointment Confirmation - #${appointment.appointmentNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .highlight { color: #667eea; font-weight: bold; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                .badge { display: inline-block; padding: 5px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; }
                .badge-success { background: #d1fae5; color: #065f46; }
                .badge-warning { background: #fef3c7; color: #92400e; }
                .section { margin-bottom: 25px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Appointment Confirmed!</h1>
                    <p>Your appointment has been successfully booked</p>
                </div>
                
                <div class="content">
                    <div class="section">
                        <h2>Hello ${appointment.patientDetails?.fullName || 'Patient'},</h2>
                        <p>Thank you for booking an appointment with MediCare Clinic. Here are your appointment details:</p>
                    </div>

                    <div class="details">
                        <h3>📋 Appointment Summary</h3>
                        <p><strong>Appointment Number:</strong> <span class="highlight">${appointment.appointmentNumber || 'N/A'}</span></p>
                        <p><strong>Date:</strong> ${formattedDate}</p>
                        <p><strong>Time:</strong> ${formattedTime(appointment.timeSlot?.startTime)} - ${formattedTime(appointment.timeSlot?.endTime)}</p>
                        <p><strong>Doctor:</strong> Dr. ${doctor?.firstName || ''} ${doctor?.lastName || ''}</p>
                        <p><strong>Specialization:</strong> ${doctor?.specialization || 'N/A'}</p>
                        <p><strong>Consultation Type:</strong> 
                            <span class="badge ${consultationType === 'online' ? 'badge-success' : 'badge-warning'}">
                                ${consultationType === 'online' ? '💻 Online' : '🏥 Physical'} Consultation
                            </span>
                        </p>
                        <p><strong>Fee:</strong> ₹Rs.{price}</p>
                        <p><strong>Payment Method:</strong> ${paymentMethod}</p>
                        <p><strong>Status:</strong> <span class="badge badge-success">Confirmed</span></p>
                    </div>

                    <div class="section">
                        <h3>👨‍⚕️ Doctor Information</h3>
                        <p><strong>Name:</strong> Dr. ${doctor?.firstName || ''} ${doctor?.lastName || ''}</p>
                        <p><strong>Department:</strong> ${doctor?.department || 'N/A'}</p>
                        <p><strong>Phone:</strong> ${doctor?.phoneNumber || 'N/A'}</p>
                        <p><strong>Email:</strong> ${doctor?.email || 'N/A'}</p>
                    </div>

                    <div class="section">
                        <h3>📍 Clinic Address</h3>
                        <p>123 Health Street, Medical City</p>
                        <p>Phone: (555) 123-4567 | Email: info@medicare.com</p>
                    </div>

                    <div class="section">
                        <h3>📝 Important Instructions</h3>
                        <ul>
                            <li>Please arrive 15 minutes before your scheduled time</li>
                            <li>Bring your ID proof and this confirmation email</li>
                            ${consultationType === 'physical' ? 
                                '<li>Carry all relevant medical reports and prescriptions</li>' : 
                                '<li>Ensure you have a stable internet connection for the online consultation</li>'
                            }
                            <li>In case of cancellation, please inform us at least 24 hours in advance</li>
                        </ul>
                    </div>

                    <div class="section">
                        <p>For any queries or to reschedule, please contact us at (555) 123-4567 or reply to this email.</p>
                        <p>We look forward to serving you!</p>
                    </div>
                </div>

                <div class="footer">
                    <p>This is an automated email. Please do not reply directly to this message.</p>
                    <p>© ${new Date().getFullYear()} MediCare Clinic. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
      `
    };

    const result = await sendEmail(mailOptions);
    if (result.success) {
      console.log(`✅ Confirmation email sent to ${patientEmail}`);
      return { success: true };
    } else {
      console.error(`❌ Failed to send email to ${patientEmail}:`, result.error);
      return { success: false, error: result.error };
    }
    
  } catch (error) {
    console.error('❌ Error in sendAppointmentConfirmationEmail:', error.message);
    console.error('Error stack:', error.stack);
    return { success: false, error: error.message };
  }
};


// Send appointment cancellation email
const sendAppointmentCancellationEmail = async (appointment, doctor, cancellationReason) => {
  try {
    const patientEmail = appointment.patientDetails.email;
    
    if (!patientEmail) {
      console.log('⚠️ No email provided for patient, skipping cancellation email');
      return;
    }

    const mailOptions = {
      from: {
        name: process.env.EMAIL_NAME || 'MediCare Clinic',
        address: process.env.EMAIL_FROM || process.env.SENDER_EMAIL
      },
      to: patientEmail,
      subject: `Appointment Cancelled - #${appointment.appointmentNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #dc2626; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .highlight { color: #dc2626; font-weight: bold; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Appointment Cancelled</h1>
                    <p>Your appointment has been cancelled</p>
                </div>
                
                <div class="content">
                    <h2>Hello ${appointment.patientDetails.fullName},</h2>
                    <p>Your appointment with MediCare Clinic has been cancelled. Here are the details:</p>
                    
                    <div class="details">
                        <h3>Cancelled Appointment Details</h3>
                        <p><strong>Appointment Number:</strong> <span class="highlight">${appointment.appointmentNumber}</span></p>
                        <p><strong>Doctor:</strong> Dr. ${doctor.firstName} ${doctor.lastName}</p>
                        <p><strong>Specialization:</strong> ${doctor.specialization}</p>
                        <p><strong>Original Date:</strong> ${new Date(appointment.appointmentDate).toLocaleDateString()}</p>
                        <p><strong>Cancellation Reason:</strong> ${cancellationReason || 'Not specified'}</p>
                        <p><strong>Cancelled On:</strong> ${new Date().toLocaleString()}</p>
                    </div>

                    <p>If this was a mistake or you wish to reschedule, please contact us at (555) 123-4567 or reply to this email.</p>
                    <p>We hope to serve you again in the future.</p>
                </div>

                <div class="footer">
                    <p>This is an automated email. Please do not reply directly to this message.</p>
                    <p>© ${new Date().getFullYear()} MediCare Clinic. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Cancellation email sent to ${patientEmail}`);
    
  } catch (error) {
    console.error('❌ Error sending cancellation email:', error);
    throw error;
  }
};

// Updated cancel function to send email
exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, cancellationReason } = req.body;

    console.log('🎯 Cancel request received:', { id, userId, cancellationReason });

    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      console.log('❌ Appointment not found for ID:', id);
      return res.status(404).json({ 
        success: false,
        error: "Appointment not found" 
      });
    }

    // Check user ownership
    if (appointment.userId.toString() !== userId) {
      console.log('🚫 User not authorized:', {
        appointmentUserId: appointment.userId.toString(),
        requestedUserId: userId
      });
      return res.status(403).json({ 
        success: false,
        error: "You are not authorized to cancel this appointment" 
      });
    }

    // Check status
    if (!["pending", "confirmed"].includes(appointment.status)) {
      console.log('❌ Invalid status for cancellation:', appointment.status);
      return res.status(400).json({ 
        success: false,
        error: `Cannot cancel appointment with status: ${appointment.status}` 
      });
    }

    // Get doctor information for email
    const Doctor = require("../models/Doctor");
    const doctor = await Doctor.findById(appointment.doctorId);

    // Update appointment
    appointment.status = "cancelled";
    appointment.cancellationReason = cancellationReason;
    appointment.cancelledAt = new Date();
    
    await appointment.save();

    console.log('✅ Appointment cancelled successfully');

    // Send cancellation email
    try {
      if (doctor) {
        await sendAppointmentCancellationEmail(appointment, doctor, cancellationReason);
        console.log('📧 Cancellation email sent successfully');
      }
    } catch (emailError) {
      console.error('❌ Failed to send cancellation email:', emailError);
      // Don't fail the cancellation if email fails
    }

    res.json({
      success: true,
      message: "Appointment cancelled successfully",
      appointment
    });

  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ 
      success: false,
      error: "Server error: " + error.message 
    });
  }
};

// Get appointments by user ID
exports.getAppointmentsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`📋 Fetching appointments for user: ${userId}`);
    
    // Validate userId
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const appointments = await Appointment.find({ userId })
      .sort({ appointmentDate: -1, createdAt: -1 });

    console.log(`✅ Found ${appointments.length} appointments for user ${userId}`);
    
    res.status(200).json({
      success: true,
      message: "Appointments fetched successfully",
      appointments: appointments
    });
  } catch (error) {
    console.error("❌ Error fetching user appointments:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch appointments", 
      details: error.message 
    });
  }
};

// Get appointment statistics for a doctor
exports.getAppointmentStats = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    console.log(`📊 Fetching appointment stats for doctor: ${doctorId}`);
    
    // Validate doctorId
    if (!doctorId) {
      return res.status(400).json({ error: "Doctor ID is required" });
    }

    // Get all confirmed and pending appointments for this doctor
    const appointments = await Appointment.find({
      doctorId: doctorId,
      status: { $in: ["pending", "confirmed"] }
    });

    console.log(`✅ Found ${appointments.length} appointments for doctor ${doctorId}`);

    // Count appointments per timeSlotId
    const stats = {};
    appointments.forEach(appointment => {
      const slotId = appointment.timeSlotId?.toString();
      if (slotId) {
        if (!stats[slotId]) {
          stats[slotId] = 0;
        }
        stats[slotId]++;
      }
    });

    console.log('📈 Appointment stats:', stats);
    res.status(200).json(stats);
  } catch (error) {
    console.error("❌ Error fetching appointment stats:", error);
    res.status(500).json({ 
      error: "Failed to fetch appointment statistics", 
      details: error.message 
    });
  }
};

// Get all appointments
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('userId', 'username email')
      .sort({ appointmentDate: -1, createdAt: -1 });
    
    console.log(`Found ${appointments.length} appointments`);
    
    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ 
      error: "Failed to fetch appointments", 
      details: error.message 
    });
  }
};

// Get appointments by doctor ID
exports.getAppointmentsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    const appointments = await Appointment.find({ doctorId })
      .populate('userId', 'username email')
      .sort({ appointmentDate: 1, "timeSlot.startTime": 1 });

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ 
      error: "Failed to fetch appointments", 
      details: error.message 
    });
  }
};

// Get appointment by ID
exports.getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointment = await Appointment.findById(id)
      .populate('userId', 'username email');
    
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.status(200).json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({ 
      error: "Failed to fetch appointment", 
      details: error.message 
    });
  }
};

// Update appointment status with email notification
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notificationMessage } = req.body;

    const validStatuses = ["pending", "confirmed", "cancelled", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    const oldStatus = appointment.status;
    appointment.status = status;
    
    // Add status update history
    if (!appointment.statusHistory) {
      appointment.statusHistory = [];
    }
    appointment.statusHistory.push({
      status: status,
      changedAt: new Date(),
      changedBy: req.user?._id || 'system',
      message: notificationMessage
    });

    await appointment.save();

    // Send status update email if status changed
    if (oldStatus !== status && appointment.patientDetails.email) {
      try {
        const Doctor = require("../models/Doctor");
        const doctor = await Doctor.findById(appointment.doctorId);
        
        if (doctor) {
          await sendStatusUpdateEmail(appointment, doctor, oldStatus, status, notificationMessage);
          console.log(`📧 Status update email sent for appointment ${appointment.appointmentNumber}`);
        }
      } catch (emailError) {
        console.error('❌ Failed to send status update email:', emailError);
      }
    }

    res.status(200).json({
      message: "Appointment status updated successfully",
      appointment
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({ 
      error: "Failed to update appointment", 
      details: error.message 
    });
  }
};

// Delete appointment
exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointment = await Appointment.findByIdAndDelete(id);
    
    if (!appointment) {
      return res.status(404).json({ 
        success: false,
        error: "Appointment not found" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Appointment deleted successfully",
      deletedAppointment: appointment
    });
  } catch (error) {
    console.error("❌ Error deleting appointment:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to delete appointment", 
      details: error.message 
    });
  }
};

// Helper function to send status update emails
const sendStatusUpdateEmail = async (appointment, doctor, oldStatus, newStatus, message) => {
  try {
    const patientEmail = appointment.patientDetails.email;
    
    if (!patientEmail) {
      return;
    }

    const statusColors = {
      pending: '#fbbf24',
      confirmed: '#10b981',
      cancelled: '#ef4444',
      completed: '#3b82f6'
    };

    const statusTexts = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      cancelled: 'Cancelled',
      completed: 'Completed'
    };

    const mailOptions = {
      from: {
        name: process.env.EMAIL_NAME || 'MediCare Clinic',
        address: process.env.EMAIL_FROM || process.env.SENDER_EMAIL
      },
      to: patientEmail,
      subject: `Appointment Status Updated - #${appointment.appointmentNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: ${statusColors[newStatus]}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .status-change { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 14px; font-weight: bold; color: white; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Appointment Status Updated</h1>
                    <p>Your appointment status has been changed</p>
                </div>
                
                <div class="content">
                    <h2>Hello ${appointment.patientDetails.fullName},</h2>
                    <p>The status of your appointment with MediCare Clinic has been updated.</p>
                    
                    <div class="status-change">
                        <h3>Appointment Status Change</h3>
                        <p><strong>Appointment Number:</strong> ${appointment.appointmentNumber}</p>
                        <p><strong>Doctor:</strong> Dr. ${doctor.firstName} ${doctor.lastName}</p>
                        <p><strong>Date:</strong> ${new Date(appointment.appointmentDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        
                        <div style="display: flex; align-items: center; margin: 20px 0;">
                            <div style="flex: 1; text-align: center;">
                                <div class="badge" style="background: ${statusColors[oldStatus]}">${statusTexts[oldStatus]}</div>
                                <p>Previous Status</p>
                            </div>
                            <div style="margin: 0 20px; font-size: 24px;">→</div>
                            <div style="flex: 1; text-align: center;">
                                <div class="badge" style="background: ${statusColors[newStatus]}">${statusTexts[newStatus]}</div>
                                <p>New Status</p>
                            </div>
                        </div>
                        
                        ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
                    </div>

                    ${newStatus === 'cancelled' ? `
                        <p>If this was unexpected or you wish to reschedule, please contact us at (555) 123-4567.</p>
                    ` : newStatus === 'confirmed' ? `
                        <p>Your appointment is now confirmed. Please arrive 15 minutes before your scheduled time.</p>
                    ` : newStatus === 'completed' ? `
                        <p>Thank you for visiting MediCare Clinic. We hope you had a good experience.</p>
                    ` : ''}

                    <p>For any questions, please contact us at (555) 123-4567 or reply to this email.</p>
                </div>

                <div class="footer">
                    <p>This is an automated email. Please do not reply directly to this message.</p>
                    <p>© ${new Date().getFullYear()} MediCare Clinic. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Status update email sent to ${patientEmail}`);
    
  } catch (error) {
    console.error('❌ Error sending status update email:', error);
    throw error;
  }
};

// Send reminder email for upcoming appointments
exports.sendReminderEmails = async (req, res) => {
  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dayAfterTomorrow = new Date(now);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    // Find appointments for tomorrow and day after tomorrow
    const upcomingAppointments = await Appointment.find({
      appointmentDate: {
        $gte: tomorrow,
        $lt: dayAfterTomorrow
      },
      status: { $in: ["pending", "confirmed"] },
      'patientDetails.email': { $exists: true, $ne: '' }
    }).populate('doctorId');

    console.log(`📧 Sending reminder emails for ${upcomingAppointments.length} appointments`);

    let sentCount = 0;
    for (const appointment of upcomingAppointments) {
      try {
        const mailOptions = {
          from: {
            name: process.env.EMAIL_NAME || 'MediCare Clinic',
            address: process.env.EMAIL_FROM || process.env.SENDER_EMAIL
          },
          to: appointment.patientDetails.email,
          subject: `Appointment Reminder - #${appointment.appointmentNumber}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #3b82f6; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .reminder { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                    .highlight { color: #3b82f6; font-weight: bold; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Appointment Reminder</h1>
                        <p>Friendly reminder about your upcoming appointment</p>
                    </div>
                    
                    <div class="content">
                        <h2>Hello ${appointment.patientDetails.fullName},</h2>
                        <p>This is a friendly reminder about your upcoming appointment with MediCare Clinic.</p>
                        
                        <div class="reminder">
                            <h3>Appointment Details</h3>
                            <p><strong>Appointment Number:</strong> <span class="highlight">${appointment.appointmentNumber}</span></p>
                            <p><strong>Date:</strong> ${new Date(appointment.appointmentDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            <p><strong>Time:</strong> ${appointment.timeSlot.startTime} - ${appointment.timeSlot.endTime}</p>
                            <p><strong>Doctor:</strong> Dr. ${appointment.doctorId?.firstName} ${appointment.doctorId?.lastName}</p>
                            <p><strong>Specialization:</strong> ${appointment.doctorId?.specialization}</p>
                            <p><strong>Consultation Type:</strong> ${appointment.consultationType === 'online' ? '💻 Online' : '🏥 Physical'}</p>
                            <p><strong>Fee:</strong> ₹${appointment.price}</p>
                        </div>

                        <h3>Important Reminders</h3>
                        <ul>
                            <li>Please arrive 15 minutes before your scheduled time</li>
                            <li>Bring your ID and this email confirmation</li>
                            ${appointment.consultationType === 'physical' ? 
                                '<li>Carry all relevant medical reports and prescriptions</li>' : 
                                '<li>Ensure you have a stable internet connection</li>'
                            }
                            <li>In case of cancellation, please inform us at least 24 hours in advance</li>
                        </ul>

                        <p>For any changes or cancellations, please contact us at (555) 123-4567.</p>
                        <p>We look forward to seeing you!</p>
                    </div>

                    <div class="footer">
                        <p>This is an automated reminder email. Please do not reply directly to this message.</p>
                        <p>© ${new Date().getFullYear()} MediCare Clinic. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Reminder email sent for appointment ${appointment.appointmentNumber}`);
        sentCount++;
        
      } catch (error) {
        console.error(`❌ Failed to send reminder email for appointment ${appointment._id}:`, error);
      }
    }

    res.json({
      success: true,
      message: `Reminder emails sent successfully`,
      sent: sentCount,
      total: upcomingAppointments.length
    });
    
  } catch (error) {
    console.error('❌ Error sending reminder emails:', error);
    res.status(500).json({ 
      success: false,
      error: "Failed to send reminder emails", 
      details: error.message 
    });
  }
};

// Test email endpoint (optional - for testing)
exports.testEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false,
        error: "Email is required for testing" 
      });
    }

    const mailOptions = {
      from: {
        name: process.env.EMAIL_NAME || 'MediCare Clinic',
        address: process.env.EMAIL_FROM || process.env.SENDER_EMAIL
      },
      to: email,
      subject: 'Test Email from MediCare Clinic',
      text: 'This is a test email from your appointment booking system.',
      html: '<h1>Test Email</h1><p>This is a test email from your appointment booking system.</p>'
    };
    
    await transporter.sendMail(mailOptions);
    
    res.json({ 
      success: true, 
      message: 'Test email sent successfully' 
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send test email',
      details: error.message 
    });
  }
};



// Update meeting link for online consultation
exports.updateMeetingLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { meetingLink } = req.body;

    console.log(`🔗 Updating meeting link for appointment: ${id}`);
    console.log('📝 Meeting link:', meetingLink);

    if (!meetingLink) {
      return res.status(400).json({ 
        success: false, 
        error: 'Meeting link is required' 
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { 
        meetingLink: meetingLink,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        error: 'Appointment not found' 
      });
    }

    console.log(`✅ Meeting link updated successfully for appointment ${id}`);
    
    res.json({ 
      success: true, 
      message: 'Meeting link updated successfully',
      appointment: {
        _id: appointment._id,
        meetingLink: appointment.meetingLink
      }
    });

  } catch (error) {
    console.error('❌ Error updating meeting link:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update meeting link' 
    });
  }
};