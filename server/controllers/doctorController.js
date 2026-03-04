













const jwt = require("jsonwebtoken");
const Doctor = require("../models/Doctor");
const { sendEmail } = require("../config/nodemailer");

// Helper to sign JWT token
function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { 
    expiresIn: process.env.JWT_EXPIRES_IN || "7d" 
  });
}

// Email template functions
const createRegistrationEmailHTML = (doctorData, plainPassword) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9fafb; }
            .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4F46E5; }
            .warning { background: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0; color: #856404; }
            .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏥 Hospital Management System</h1>
                <p>Doctor Registration Successful</p>
            </div>
            
            <div class="content">
                <h2>Welcome Dr. ${doctorData.lastName}!</h2>
                <p>Your registration has been successfully completed.</p>
                
                <div class="credentials">
                    <h3>Your Login Credentials:</h3>
                    <p><strong>Email:</strong> ${doctorData.email}</p>
                    <p><strong>Password:</strong> ${plainPassword}</p>
                    <p><strong>Doctor ID:</strong> ${doctorData._id}</p>
                </div>
                
                <div class="warning">
                    <strong>⚠️ IMPORTANT:</strong>
                    <p>Please change your password immediately after first login.</p>
                </div>
                
                <p style="text-align: center;">
                    <a href="http://localhost:3000/doctor/login" class="button">Login to Your Account</a>
                </p>
                
                <p>Best regards,<br>Hospital Management Team</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Register Doctor
exports.registerDoctor = async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      gender,
      dateOfBirth,
      nationalId,
      specialization,
      department,
      email,
      phoneNumber,
      medicalLicenseNumber,
      password,
      price,
      availableTimeSlots
    } = req.body;

    // Store plain password for email
    const plainPassword = password;

    // Validation
    if (!password || password.length < 8) {
      return res.status(400).json({ 
        error: "Password must be at least 8 characters" 
      });
    }

    if (!price || price <= 0) {
      return res.status(400).json({ 
        error: "Price is required and must be greater than 0" 
      });
    }

    // Check for duplicate doctor
    const existingDoctor = await Doctor.findOne({
      $or: [{ email: email.toLowerCase() }, { nationalId }, { medicalLicenseNumber }],
    });
    
    if (existingDoctor) {
      return res.status(409).json({
        error: "Doctor already exists with this email, national ID, or license number",
      });
    }

    const doctorData = {
      firstName,
      middleName,
      lastName,
      gender,
      dateOfBirth,
      nationalId,
      profilePicture: req.file ? req.file.path : null,
      specialization,
      department,
      email: email.toLowerCase(),
      phoneNumber,
      medicalLicenseNumber,
      password,
      price: Number(price),
      availableTimeSlots: availableTimeSlots ? JSON.parse(availableTimeSlots) : []
    };

   





    const newDoctor = await Doctor.create(doctorData);

    // ✅ Send registration email with credentials
    try {
      const htmlContent = createRegistrationEmailHTML(newDoctor.toObject(), plainPassword);
      
      // ✅ FIXED: Use verified sender email
      const mailOptions = {
        from: {
          name: process.env.EMAIL_NAME || 'NawalokaCare Clinic',
          address: process.env.EMAIL_FROM || process.env.SENDER_EMAIL || 'sithumchanukasandaruwan2002@gmail.com'
        },
        to: newDoctor.email,
        subject: 'Doctor Registration Successful - Hospital Management System',
        html: htmlContent,
        text: `Your registration was successful.\n\nEmail: ${newDoctor.email}\nPassword: ${plainPassword}\n\nLogin at: http://localhost:3000/doctor/login`
      };

      console.log("📧 Attempting to send email via Brevo...");
      console.log("📨 From:", mailOptions.from.name, "<" + mailOptions.from.address + ">");
      console.log("📨 To:", mailOptions.to);
      
      const emailResult = await sendEmail(mailOptions);
      
      if (emailResult.success) {
        console.log(`✅ Registration email sent to ${newDoctor.email}`);
      } else {
        console.warn(`⚠️ Email sending failed: ${emailResult.error}`);
      }
    } catch (emailError) {
      console.error('⚠️ Email error:', emailError.message);
      console.error('⚠️ Email error stack:', emailError.stack);
    }

    const token = signToken(newDoctor._id);
    const safeDoctor = newDoctor.toObject();
    delete safeDoctor.password;

    res.status(201).json({
      success: true,
      message: "Doctor registered successfully",
      token,
      doctor: safeDoctor,
    });
  } catch (error) {
    console.error("Error registering doctor:", error);
    res.status(500).json({ error: "Failed to register doctor" });
  }
};











// Login Doctor
exports.loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const doctor = await Doctor.findOne({ email: email.toLowerCase() }).select("+password");
    if (!doctor) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValidPassword = await doctor.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = signToken(doctor._id);
    const safeDoctor = doctor.toObject();
    delete safeDoctor.password;

    res.status(200).json({
      message: "Login successful",
      token,
      doctor: safeDoctor,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Failed to login" });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new passwords are required" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters" });
    }

    const doctor = await Doctor.findById(req.user.id).select("+password");
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    const isValidPassword = await doctor.comparePassword(currentPassword);
    if (!isValidPassword) return res.status(401).json({ error: "Current password is incorrect" });

    doctor.password = newPassword;
    await doctor.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: "Failed to change password" });
  }
};

// Get all doctors
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().select("-password");
    res.status(200).json(doctors);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ error: "Failed to fetch doctors" });
  }
};

// Get doctor by ID
exports.getDoctorById = async (req, res) => {
  const { id } = req.params;
  try {
    const doctor = await Doctor.findById(id).select("-password");
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    res.status(200).json(doctor);
  } catch (error) {
    console.error("Error fetching doctor:", error);
    res.status(500).json({ error: "Failed to fetch doctor" });
  }
};

// Update doctor by ID
exports.updateDoctor = async (req, res) => {
  const { id } = req.params;
  try {
    const updateData = {
      ...(req.body.firstName && { firstName: req.body.firstName }),
      ...(req.body.middleName && { middleName: req.body.middleName }),
      ...(req.body.lastName && { lastName: req.body.lastName }),
      ...(req.body.gender && { gender: req.body.gender }),
      ...(req.body.dateOfBirth && { dateOfBirth: req.body.dateOfBirth }),
      ...(req.body.nationalId && { nationalId: req.body.nationalId }),
      ...(req.body.specialization && { specialization: req.body.specialization }),
      ...(req.body.department && { department: req.body.department }),
      ...(req.body.email && { email: req.body.email.toLowerCase() }),
      ...(req.body.phoneNumber && { phoneNumber: req.body.phoneNumber }),
      ...(req.body.medicalLicenseNumber && { medicalLicenseNumber: req.body.medicalLicenseNumber }),
      ...(req.body.price && { price: Number(req.body.price) }),
    };

    if (req.file) {
      updateData.profilePicture = req.file.path;
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(id, updateData, { 
      new: true,
      runValidators: true 
    });
    if (!updatedDoctor) return res.status(404).json({ error: "Doctor not found" });
    res.status(200).json({ message: "Doctor updated successfully", doctor: updatedDoctor });
  } catch (error) {
    console.error("Error updating doctor:", error);
    res.status(500).json({ error: "Failed to update doctor" });
  }
};

// Delete doctor by ID
exports.deleteDoctor = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedDoctor = await Doctor.findByIdAndDelete(id);
    if (!deletedDoctor) return res.status(404).json({ error: "Doctor not found" });
    res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (error) {
    console.error("Error deleting doctor:", error);
    res.status(500).json({ error: "Failed to delete doctor" });
  }
};

// Add time slot
exports.addTimeSlot = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { day, startTime, endTime, consultationType, quantity } = req.body;

    if (!day || !startTime || !endTime || !consultationType || !quantity) {
      return res.status(400).json({ 
        error: "Day, start time, end time, consultation type, and quantity are required" 
      });
    }

    if (!['physical', 'online'].includes(consultationType)) {
      return res.status(400).json({ 
        error: "Consultation type must be either 'physical' or 'online'" 
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({ error: "End time must be after start time" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const newTimeSlot = {
      day, 
      startTime, 
      endTime, 
      consultationType,
      quantity: Number(quantity)
    };

    doctor.availableTimeSlots.push(newTimeSlot);
    await doctor.save();

    res.status(200).json({
      message: "Time slot added successfully",
      timeSlot: newTimeSlot,
      availableTimeSlots: doctor.availableTimeSlots,
    });
  } catch (error) {
    console.error("Error adding time slot:", error);
    res.status(500).json({ error: "Failed to add time slot" });
  }
};

// Get time slots
exports.getTimeSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await Doctor.findById(doctorId).select("availableTimeSlots");
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    res.status(200).json({ availableTimeSlots: doctor.availableTimeSlots });
  } catch (error) {
    console.error("Error fetching time slots:", error);
    res.status(500).json({ error: "Failed to fetch time slots" });
  }
};

// Get time slots by type
exports.getTimeSlotsByType = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { consultationType } = req.query;

    if (!consultationType || !['physical', 'online'].includes(consultationType)) {
      return res.status(400).json({ 
        error: "Valid consultation type (physical or online) is required" 
      });
    }

    const doctor = await Doctor.findById(doctorId).select("availableTimeSlots");
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const filteredSlots = doctor.availableTimeSlots.filter(
      slot => slot.consultationType === consultationType
    );

    res.status(200).json({ 
      consultationType,
      availableTimeSlots: filteredSlots 
    });
  } catch (error) {
    console.error("Error fetching time slots by type:", error);
    res.status(500).json({ error: "Failed to fetch time slots" });
  }
};

// Get doctor details public
exports.getDoctorDetailsPublic = async (req, res) => {
  const { doctorId } = req.params;
  try {
    const doctor = await Doctor.findById(doctorId).select("-password");
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    res.status(200).json({
      doctor: doctor,
      price: doctor.price,
      availableTimeSlots: doctor.availableTimeSlots || [],
    });
  } catch (error) {
    console.error("Error fetching doctor details:", error);
    res.status(500).json({ error: "Failed to fetch doctor details" });
  }
};

// Delete time slot
exports.deleteTimeSlot = async (req, res) => {
  try {
    const { doctorId, slotId } = req.params;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    doctor.availableTimeSlots = doctor.availableTimeSlots.filter(
      (slot) => slot._id.toString() !== slotId
    );

    await doctor.save();

    res.status(200).json({
      message: "Time slot deleted successfully",
      availableTimeSlots: doctor.availableTimeSlots,
    });
  } catch (error) {
    console.error("Error deleting time slot:", error);
    res.status(500).json({ error: "Failed to delete time slot" });
  }
};

// Update time slot
exports.updateTimeSlot = async (req, res) => {
  try {
    const { doctorId, slotId } = req.params;
    const { day, startTime, endTime, consultationType, quantity } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    const timeSlot = doctor.availableTimeSlots.id(slotId);
    if (!timeSlot) return res.status(404).json({ error: "Time slot not found" });

    if (day) timeSlot.day = day;
    if (startTime) timeSlot.startTime = startTime;
    if (endTime) timeSlot.endTime = endTime;
    if (consultationType) {
      if (!['physical', 'online'].includes(consultationType)) {
        return res.status(400).json({ 
          error: "Consultation type must be either 'physical' or 'online'" 
        });
      }
      timeSlot.consultationType = consultationType;
    }
    if (quantity) timeSlot.quantity = Number(quantity);

    if (timeSlot.startTime >= timeSlot.endTime) {
      return res.status(400).json({ error: "End time must be after start time" });
    }

    await doctor.save();

    res.status(200).json({
      message: "Time slot updated successfully",
      timeSlot: timeSlot,
      availableTimeSlots: doctor.availableTimeSlots,
    });
  } catch (error) {
    console.error("Error updating time slot:", error);
    res.status(500).json({ error: "Failed to update time slot" });
  }
};
