

// const Appointment = require("../models/Appointment");

// // Create appointment with user ID
// exports.createAppointment = async (req, res) => {
//   try {
//     const {
//       userId,  // NEW - Get userId from request body
//       doctorId,
//       doctorName,
//       doctorSpecialization,
//       patientDetails,
//       appointmentDate,
//       timeSlot,
//       timeSlotId
//     } = req.body;

//     console.log('📅 Creating appointment with data:', {
//       userId,
//       doctorId,
//       timeSlotId,
//       patientName: patientDetails?.fullName,
//       appointmentDate
//     });

//     // Validate required fields
//     if (!userId) {
//       return res.status(400).json({
//         error: "User ID is required"
//       });
//     }

//     if (!timeSlotId) {
//       return res.status(400).json({
//         error: "Time slot ID is required"
//       });
//     }

//     if (!doctorId) {
//       return res.status(400).json({
//         error: "Doctor ID is required"
//       });
//     }

//     // Get doctor to check slot quantity
//     const Doctor = require("../models/Doctor");
//     const doctor = await Doctor.findById(doctorId);
    
//     if (!doctor) {
//       return res.status(404).json({ error: "Doctor not found" });
//     }

//     // Find the specific time slot in doctor's available slots
//     const doctorTimeSlot = doctor.availableTimeSlots.find(slot => 
//       slot._id.toString() === timeSlotId
//     );

//     if (!doctorTimeSlot) {
//       return res.status(404).json({ error: "Time slot not found for this doctor" });
//     }

//     const slotQuantity = doctorTimeSlot.quantity || 20;

//     // Count existing appointments for this slot
//     const existingAppointmentsCount = await Appointment.countDocuments({
//       doctorId: doctorId,
//       timeSlotId: timeSlotId,
//       status: { $in: ["pending", "confirmed"] }
//     });

//     console.log(`📊 Slot ${timeSlotId}: ${existingAppointmentsCount}/${slotQuantity} appointments`);

//     // Check if slot is full based on quantity
//     if (existingAppointmentsCount >= slotQuantity) {
//       return res.status(409).json({
//         error: `This time slot is fully booked. Maximum ${slotQuantity} appointments allowed.`,
//         available: 0,
//         booked: existingAppointmentsCount,
//         capacity: slotQuantity
//       });
//     }

//     // Check for duplicate appointments for the same patient in the same slot
//     const duplicateAppointment = await Appointment.findOne({
//       doctorId: doctorId,
//       timeSlotId: timeSlotId,
//       "patientDetails.phoneNumber": patientDetails.phoneNumber,
//       status: { $in: ["pending", "confirmed"] }
//     });

//     if (duplicateAppointment) {
//       return res.status(409).json({
//         error: "You already have an appointment booked for this time slot.",
//         existingAppointment: {
//           id: duplicateAppointment._id,
//           appointmentDate: duplicateAppointment.appointmentDate
//         }
//       });
//     }

//     // Create new appointment
//     const appointment = new Appointment({
//       userId,  // NEW - Include userId
//       doctorId,
//       doctorName,
//       doctorSpecialization,
//       patientDetails: {
//         fullName: patientDetails.fullName?.trim(),
//         email: patientDetails.email?.trim() || "",
//         phoneNumber: patientDetails.phoneNumber?.trim(),
//         dateOfBirth: patientDetails.dateOfBirth || "",
//         gender: patientDetails.gender || "",
//         address: patientDetails.address || "",
//         medicalConcern: patientDetails.medicalConcern?.trim(),
//         previousConditions: patientDetails.previousConditions || ""
//       },
//       appointmentDate: new Date(appointmentDate),
//       timeSlot: {
//         day: timeSlot.day,
//         startTime: timeSlot.startTime,
//         endTime: timeSlot.endTime
//       },
//       timeSlotId: timeSlotId,
//       status: "pending"
//     });

//     await appointment.save();

//     console.log('✅ Appointment created successfully:', {
//       id: appointment._id,
//       appointmentNumber: appointment.appointmentNumber,
//       userId: userId,
//       patient: patientDetails.fullName,
//       timeSlot: timeSlotId,
//       remainingSlots: slotQuantity - existingAppointmentsCount - 1
//     });
    
//     res.status(201).json({
//       message: "Appointment booked successfully!",
//       appointment: {
//         id: appointment._id,
//         appointmentNumber: appointment.appointmentNumber,
//         userId: appointment.userId,
//         patientName: patientDetails.fullName,
//         appointmentDate: appointment.appointmentDate,
//         timeSlot: appointment.timeSlot,
//         status: appointment.status
//       },
//       availability: {
//         remaining: slotQuantity - existingAppointmentsCount - 1,
//         booked: existingAppointmentsCount + 1,
//         capacity: slotQuantity
//       }
//     });

//   } catch (error) {
//     console.error("❌ Error creating appointment:", error);
    
//     // Handle duplicate key errors (if any)
//     if (error.code === 11000) {
//       return res.status(409).json({
//         error: "Appointment already exists with these details.",
//         details: "Duplicate appointment detected"
//       });
//     }
    
//     res.status(500).json({ 
//       error: "Failed to book appointment", 
//       details: error.message 
//     });
//   }
// };

// // Get appointments by user ID - NEW FUNCTION
// exports.getAppointmentsByUser = async (req, res) => {
//   try {
//     const { userId } = req.params;
    
//     console.log(`📋 Fetching appointments for user: ${userId}`);
    
//     // Validate userId
//     if (!userId) {
//       return res.status(400).json({ error: "User ID is required" });
//     }

//     const appointments = await Appointment.find({ userId })
//       .sort({ appointmentDate: -1, createdAt: -1 });

//     console.log(`✅ Found ${appointments.length} appointments for user ${userId}`);
    
//     res.status(200).json({
//       success: true,
//       message: "Appointments fetched successfully",
//       appointments: appointments
//     });
//   } catch (error) {
//     console.error("❌ Error fetching user appointments:", error);
//     res.status(500).json({ 
//       success: false,
//       error: "Failed to fetch appointments", 
//       details: error.message 
//     });
//   }
// };

// // Get appointment statistics for a doctor
// exports.getAppointmentStats = async (req, res) => {
//   try {
//     const { doctorId } = req.params;
    
//     console.log(`📊 Fetching appointment stats for doctor: ${doctorId}`);
    
//     // Validate doctorId
//     if (!doctorId) {
//       return res.status(400).json({ error: "Doctor ID is required" });
//     }

//     // Get all confirmed and pending appointments for this doctor
//     const appointments = await Appointment.find({
//       doctorId: doctorId,
//       status: { $in: ["pending", "confirmed"] }
//     });

//     console.log(`✅ Found ${appointments.length} appointments for doctor ${doctorId}`);

//     // Count appointments per timeSlotId
//     const stats = {};
//     appointments.forEach(appointment => {
//       const slotId = appointment.timeSlotId?.toString();
//       if (slotId) {
//         if (!stats[slotId]) {
//           stats[slotId] = 0;
//         }
//         stats[slotId]++;
//       }
//     });

//     console.log('📈 Appointment stats:', stats);
//     res.status(200).json(stats);
//   } catch (error) {
//     console.error("❌ Error fetching appointment stats:", error);
//     res.status(500).json({ 
//       error: "Failed to fetch appointment statistics", 
//       details: error.message 
//     });
//   }
// };

// // Get all appointments
// exports.getAllAppointments = async (req, res) => {
//   try {
//     const appointments = await Appointment.find()
//       .populate('userId', 'username email')  // NEW - Populate user data
//       .sort({ appointmentDate: -1, createdAt: -1 });
    
//     console.log(`Found ${appointments.length} appointments`);
    
//     res.status(200).json(appointments);
//   } catch (error) {
//     console.error("Error fetching appointments:", error);
//     res.status(500).json({ 
//       error: "Failed to fetch appointments", 
//       details: error.message 
//     });
//   }
// };

// // Get appointments by doctor ID
// exports.getAppointmentsByDoctor = async (req, res) => {
//   try {
//     const { doctorId } = req.params;
    
//     const appointments = await Appointment.find({ doctorId })
//       .populate('userId', 'username email')  // NEW - Populate user data
//       .sort({ appointmentDate: 1, "timeSlot.startTime": 1 });

//     res.status(200).json(appointments);
//   } catch (error) {
//     console.error("Error fetching appointments:", error);
//     res.status(500).json({ 
//       error: "Failed to fetch appointments", 
//       details: error.message 
//     });
//   }
// };

// // Get appointment by ID
// exports.getAppointmentById = async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     const appointment = await Appointment.findById(id)
//       .populate('userId', 'username email');  // NEW - Populate user data
    
//     if (!appointment) {
//       return res.status(404).json({ error: "Appointment not found" });
//     }

//     res.status(200).json(appointment);
//   } catch (error) {
//     console.error("Error fetching appointment:", error);
//     res.status(500).json({ 
//       error: "Failed to fetch appointment", 
//       details: error.message 
//     });
//   }
// };

// // Update appointment status
// exports.updateAppointmentStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     const validStatuses = ["pending", "confirmed", "cancelled", "completed"];
//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({ error: "Invalid status" });
//     }

//     const appointment = await Appointment.findByIdAndUpdate(
//       id,
//       { status },
//       { new: true }
//     );

//     if (!appointment) {
//       return res.status(404).json({ error: "Appointment not found" });
//     }

//     res.status(200).json({
//       message: "Appointment status updated successfully",
//       appointment
//     });
//   } catch (error) {
//     console.error("Error updating appointment:", error);
//     res.status(500).json({ 
//       error: "Failed to update appointment", 
//       details: error.message 
//     });
//   }
// };

// // Updated cancel function with better logging
// exports.cancelAppointment = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { userId, cancellationReason } = req.body;

//     console.log('🎯 Cancel request received:', { id, userId, cancellationReason });

//     const appointment = await Appointment.findById(id);
    
//     if (!appointment) {
//       console.log('❌ Appointment not found for ID:', id);
//       return res.status(404).json({ 
//         success: false,
//         error: "Appointment not found" 
//       });
//     }

//     console.log('📋 Found appointment:', {
//       id: appointment._id,
//       appointmentUserId: appointment.userId,
//       requestedUserId: userId,
//       status: appointment.status
//     });

//     // Check user ownership - FIXED
//     if (appointment.userId.toString() !== userId) {
//       console.log('🚫 User not authorized:', {
//         appointmentUserId: appointment.userId.toString(),
//         requestedUserId: userId
//       });
//       return res.status(403).json({ 
//         success: false,
//         error: "You are not authorized to cancel this appointment" 
//       });
//     }

//     // Check status
//     if (!["pending", "confirmed"].includes(appointment.status)) {
//       console.log('❌ Invalid status for cancellation:', appointment.status);
//       return res.status(400).json({ 
//         success: false,
//         error: `Cannot cancel appointment with status: ${appointment.status}` 
//       });
//     }

//     // Update appointment
//     appointment.status = "cancelled";
//     appointment.cancellationReason = cancellationReason;
//     appointment.cancelledAt = new Date();
    
//     await appointment.save();

//     console.log('✅ Appointment cancelled successfully');

//     res.json({
//       success: true,
//       message: "Appointment cancelled successfully",
//       appointment
//     });

//   } catch (error) {
//     console.error("❌ Server error:", error);
//     res.status(500).json({ 
//       success: false,
//       error: "Server error: " + error.message 
//     });
//   }
// };


// // Add this to your appointmentController.js

// // Delete appointment
// exports.deleteAppointment = async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     const appointment = await Appointment.findByIdAndDelete(id);
    
//     if (!appointment) {
//       return res.status(404).json({ 
//         success: false,
//         error: "Appointment not found" 
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Appointment deleted successfully",
//       deletedAppointment: appointment
//     });
//   } catch (error) {
//     console.error("❌ Error deleting appointment:", error);
//     res.status(500).json({ 
//       success: false,
//       error: "Failed to delete appointment", 
//       details: error.message 
//     });
//   }
// };








const Appointment = require("../models/Appointment");

// Create appointment with user ID
exports.createAppointment = async (req, res) => {
  try {
    const {
      userId,  // NEW - Get userId from request body
      doctorId,
      doctorName,
      doctorSpecialization,
      patientDetails,
      appointmentDate,
      timeSlot,
      timeSlotId
    } = req.body;

    console.log('📅 Creating appointment with data:', {
      userId,
      doctorId,
      timeSlotId,
      patientName: patientDetails?.fullName,
      appointmentDate
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

    // Count existing appointments for this slot
    const existingAppointmentsCount = await Appointment.countDocuments({
      doctorId: doctorId,
      timeSlotId: timeSlotId,
      status: { $in: ["pending", "confirmed"] }
    });

    console.log(`📊 Slot ${timeSlotId}: ${existingAppointmentsCount}/${slotQuantity} appointments`);

    // Check if slot is full based on quantity
    if (existingAppointmentsCount >= slotQuantity) {
      return res.status(409).json({
        error: `This time slot is fully booked. Maximum ${slotQuantity} appointments allowed.`,
        available: 0,
        booked: existingAppointmentsCount,
        capacity: slotQuantity
      });
    }

    // Check for duplicate appointments for the same patient in the same slot
    // const duplicateAppointment = await Appointment.findOne({
    //   doctorId: doctorId,
    //   timeSlotId: timeSlotId,
    //   "patientDetails.phoneNumber": patientDetails.phoneNumber,
    //   status: { $in: ["pending", "confirmed"] }
    // });




     const duplicateAppointment = await Appointment.findOne({
      $or: [
        // Same user, same slot
        {
          userId: userId,
          doctorId: doctorId,
          timeSlotId: timeSlotId,
          status: { $in: ["pending", "confirmed"] }
        },
        // Same phone number, same slot (for guest bookings)
        {
          doctorId: doctorId,
          timeSlotId: timeSlotId,
          "patientDetails.phoneNumber": patientDetails.phoneNumber,
          status: { $in: ["pending", "confirmed"] }
        }
      ]
    });

    if (duplicateAppointment) {
      return res.status(409).json({
        error: "You already have an appointment booked for this time slot.",
        existingAppointment: {
          id: duplicateAppointment._id,
          appointmentDate: duplicateAppointment.appointmentDate,
          appointmentNumber: duplicateAppointment.appointmentNumber
        }
      });
    }

    if (duplicateAppointment) {
      return res.status(409).json({
        error: "You already have an appointment booked for this time slot.",
        existingAppointment: {
          id: duplicateAppointment._id,
          appointmentDate: duplicateAppointment.appointmentDate
        }
      });
    }

    // Create new appointment
    const appointment = new Appointment({
      userId,  // NEW - Include userId
      doctorId,
      doctorName,
      doctorSpecialization,
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
        endTime: timeSlot.endTime
      },
      timeSlotId: timeSlotId,
      status: "pending"
    });

    await appointment.save();

    console.log('✅ Appointment created successfully:', {
      id: appointment._id,
      appointmentNumber: appointment.appointmentNumber,
      userId: userId,
      patient: patientDetails.fullName,
      timeSlot: timeSlotId,
      remainingSlots: slotQuantity - existingAppointmentsCount - 1
    });
    
    res.status(201).json({
      message: "Appointment booked successfully!",
      appointment: {
        id: appointment._id,
        appointmentNumber: appointment.appointmentNumber,
        userId: appointment.userId,
        patientName: patientDetails.fullName,
        appointmentDate: appointment.appointmentDate,
        timeSlot: appointment.timeSlot,
        status: appointment.status
      },
      availability: {
        remaining: slotQuantity - existingAppointmentsCount - 1,
        booked: existingAppointmentsCount + 1,
        capacity: slotQuantity
      }
    });

  } catch (error) {
    console.error("❌ Error creating appointment:", error);
    
    // Handle duplicate key errors (if any)
    if (error.code === 11000) {
      return res.status(409).json({
        error: "Appointment already exists with these details.",
        details: "Duplicate appointment detected"
      });
    }
    
    res.status(500).json({ 
      error: "Failed to book appointment", 
      details: error.message 
    });
  }
};

// Get appointments by user ID - NEW FUNCTION
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
      .populate('userId', 'username email')  // NEW - Populate user data
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
      .populate('userId', 'username email')  // NEW - Populate user data
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
      .populate('userId', 'username email');  // NEW - Populate user data
    
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

// Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "confirmed", "cancelled", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
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

// Updated cancel function with better logging
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

    console.log('📋 Found appointment:', {
      id: appointment._id,
      appointmentUserId: appointment.userId,
      requestedUserId: userId,
      status: appointment.status
    });

    // Check user ownership - FIXED
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

    // Update appointment
    appointment.status = "cancelled";
    appointment.cancellationReason = cancellationReason;
    appointment.cancelledAt = new Date();
    
    await appointment.save();

    console.log('✅ Appointment cancelled successfully');

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


// Add this to your appointmentController.js

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