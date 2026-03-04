






const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const DoctorController = require("../controllers/doctorController");
const doctorAuth = require("../middleware/doctorauth");
const Appointment = require("../models/Appointment"); // ✅ Import Appointment model

// =============================================
// Auth routes
// =============================================
router.post("/auth/register", upload.single("profilePicture"), DoctorController.registerDoctor);
router.post("/auth/login", DoctorController.loginDoctor);
router.post("/auth/change-password", DoctorController.changePassword);

// =============================================
// CRUD routes
// =============================================
router.get("/", DoctorController.getAllDoctors);
router.get("/:id", DoctorController.getDoctorById);
router.put("/:id", upload.single("profilePicture"), DoctorController.updateDoctor);
router.delete("/:id", DoctorController.deleteDoctor);

// =============================================
// Time slot routes
// =============================================
router.post("/:doctorId/time-slots", doctorAuth, DoctorController.addTimeSlot);
router.get("/:doctorId/time-slots", doctorAuth, DoctorController.getTimeSlots);
router.get("/public/:doctorId/details", DoctorController.getDoctorDetailsPublic);
router.delete("/:doctorId/time-slots/:slotId", doctorAuth, DoctorController.deleteTimeSlot);


// PUBLIC REVENUE ENDPOINT 


/**
 * @route   GET /api/doctors/public/:doctorId/revenue
 * @desc    Get doctor revenue from completed appointments - PUBLIC ACCESS
 * @access  Public (No token needed)
 */
router.get("/public/:doctorId/revenue", async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { period = "month" } = req.query; // day, week, month, year

    console.log(`💰 PUBLIC Revenue calculation for doctor: ${doctorId}, period: ${period}`);

    // Validate doctorId
    if (!doctorId) {
      return res.status(400).json({ 
        success: false,
        error: "Doctor ID is required" 
      });
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();
    
    switch(period) {
      case "day":
        startDate.setHours(0, 0, 0, 0); // Today 00:00:00
        break;
      case "week":
        startDate.setDate(now.getDate() - 7); // Last 7 days
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1); // Last 30 days
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1); // Last 365 days
        break;
      default:
        startDate.setMonth(now.getMonth() - 1); // Default: last month
    }

    console.log(`📅 Date range: ${startDate.toISOString()} to ${now.toISOString()}`);

    // Get completed appointments (revenue)
    const completedAppointments = await Appointment.find({
      doctorId: doctorId,
      status: "completed",
      createdAt: { $gte: startDate, $lte: now }
    }).sort({ createdAt: -1 });

    // Get pending/confirmed appointments (future revenue)
    const pendingAppointments = await Appointment.find({
      doctorId: doctorId,
      status: { $in: ["pending", "confirmed"] }
    });

    console.log(`📊 Found ${completedAppointments.length} completed, ${pendingAppointments.length} pending`);

    // Calculate revenue totals
    let totalRevenue = 0;
    let todayRevenue = 0;
    let monthlyRevenue = 0;
    let pendingPayments = 0;
    let onlineRevenue = 0;
    let physicalRevenue = 0;

    // Today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Current month start
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Process completed appointments
    completedAppointments.forEach(app => {
      const price = app.price || 0;
      const appDate = new Date(app.createdAt);
      
      totalRevenue += price;
      
      // Today's revenue
      if (appDate >= today) {
        todayRevenue += price;
      }
      
      // Monthly revenue
      if (appDate >= monthStart) {
        monthlyRevenue += price;
      }
      
      // Revenue by type
      if (app.consultationType === "online") {
        onlineRevenue += price;
      } else {
        physicalRevenue += price;
      }
    });

    // Calculate pending payments
    pendingAppointments.forEach(app => {
      pendingPayments += app.price || 0;
    });

    // Group by month for chart (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      const monthName = date.toLocaleString("default", { month: "short" });
      const year = date.getFullYear();
      const monthStart2 = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      const monthApps = completedAppointments.filter(app => {
        const appDate = new Date(app.createdAt);
        return appDate >= monthStart2 && appDate <= monthEnd;
      });

      const monthRevenue = monthApps.reduce((sum, app) => sum + (app.price || 0), 0);
      
      monthlyData.push({
        month: `${monthName} ${year}`,
        amount: monthRevenue,
        count: monthApps.length
      });
    }

    // Calculate average per appointment
    const avgPerAppointment = completedAppointments.length > 0 
      ? totalRevenue / completedAppointments.length 
      : 0;

    // Send response
    res.json({
      success: true,
      doctorId,
      period,
      summary: {
        totalRevenue,
        todayRevenue,
        monthlyRevenue,
        pendingPayments,
        avgPerAppointment: Math.round(avgPerAppointment * 100) / 100,
        completedCount: completedAppointments.length,
        pendingCount: pendingAppointments.length
      },
      breakdown: {
        byType: {
          online: onlineRevenue,
          physical: physicalRevenue,
          onlinePercentage: totalRevenue > 0 ? Math.round((onlineRevenue / totalRevenue) * 100) : 0,
          physicalPercentage: totalRevenue > 0 ? Math.round((physicalRevenue / totalRevenue) * 100) : 0
        },
        monthly: monthlyData
      },
      recentAppointments: completedAppointments.slice(0, 10).map(app => ({
        id: app._id,
        appointmentNumber: app.appointmentNumber,
        patientName: app.patientDetails?.fullName || "Unknown",
        date: app.appointmentDate,
        consultationType: app.consultationType,
        price: app.price,
        createdAt: app.createdAt
      }))
    });

  } catch (error) {
    console.error("❌ Public revenue calculation error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to calculate revenue",
      error: error.message 
    });
  }
});



/**
 * @route   GET /api/doctors/:doctorId/revenue
 * @desc    Get doctor revenue - PROTECTED (requires token)
 * @access  Private
 */
router.get("/:doctorId/revenue", doctorAuth, async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { period = "month" } = req.query;

    console.log(`💰 PROTECTED Revenue calculation for doctor: ${doctorId}, period: ${period}`);

    // Check authentication
    if (!req.doctor) {
      return res.status(401).json({ 
        success: false,
        error: "Authentication failed" 
      });
    }

    // Authorization check - only the doctor can view their own revenue
    if (req.doctor.id !== doctorId) {
      return res.status(403).json({ 
        success: false,
        error: "You are not authorized to view this doctor's revenue" 
      });
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();
    
    switch(period) {
      case "day":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    // Get completed appointments
    const completedAppointments = await Appointment.find({
      doctorId: doctorId,
      status: "completed",
      createdAt: { $gte: startDate, $lte: now }
    });

    // Get pending appointments
    const pendingAppointments = await Appointment.find({
      doctorId: doctorId,
      status: { $in: ["pending", "confirmed"] }
    });

    // Calculate revenue
    let totalRevenue = 0;
    let todayRevenue = 0;
    let monthlyRevenue = 0;
    let pendingPayments = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    completedAppointments.forEach(app => {
      const price = app.price || 0;
      const appDate = new Date(app.createdAt);
      
      totalRevenue += price;
      if (appDate >= today) todayRevenue += price;
      if (appDate >= monthStart) monthlyRevenue += price;
    });

    pendingAppointments.forEach(app => {
      pendingPayments += app.price || 0;
    });

    res.json({
      success: true,
      summary: {
        totalRevenue,
        todayRevenue,
        monthlyRevenue,
        pendingPayments,
        completedCount: completedAppointments.length,
        pendingCount: pendingAppointments.length
      }
    });

  } catch (error) {
    console.error("❌ Protected revenue error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to calculate revenue" 
    });
  }
});

module.exports = router;