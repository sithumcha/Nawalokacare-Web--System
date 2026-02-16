// // routes/appointments.js
// const express = require("express");
// const router = express.Router();
// const appointmentController = require("../controllers/appointmentController");

// // Public routes
// router.post("/", appointmentController.createAppointment);
// router.get("/:id", appointmentController.getAppointmentById);
// router.get("/", appointmentController.getAllAppointments);


// router.get("/user/:userId", appointmentController.getAppointmentsByUser); // NEW ROUTE

// // Protected routes (would add auth middleware later)
// router.get("/doctor/:doctorId", appointmentController.getAppointmentsByDoctor);
// router.put("/:id/status", appointmentController.updateAppointmentStatus);

// router.put("/:id/cancel", appointmentController.cancelAppointment); // NEW ROUTE

// router.get("/stats/:doctorId", appointmentController.getAppointmentStats);

// // Add this to your routes/appointments.js
// router.delete("/:id", appointmentController.deleteAppointment);



// module.exports = router;










const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

// Create a new appointment
router.post('/', appointmentController.createAppointment);

// Get all appointments
router.get('/', appointmentController.getAllAppointments);

// Get appointment by ID
router.get('/:id', appointmentController.getAppointmentById);

// Get appointments by user ID
router.get('/user/:userId', appointmentController.getAppointmentsByUser);

// Get appointments by doctor ID
router.get('/doctor/:doctorId', appointmentController.getAppointmentsByDoctor);

// Get appointment statistics for a doctor
router.get('/stats/:doctorId', appointmentController.getAppointmentStats);

// Update appointment status
router.put('/:id/status', appointmentController.updateAppointmentStatus);

// Cancel appointment
router.put('/:id/cancel', appointmentController.cancelAppointment);

// Delete appointment
router.delete('/:id', appointmentController.deleteAppointment);

// Send reminder emails (for cron job or manual trigger)
router.get('/send/reminders', appointmentController.sendReminderEmails);

// Test email endpoint
router.post('/test-email', appointmentController.testEmail);

module.exports = router;