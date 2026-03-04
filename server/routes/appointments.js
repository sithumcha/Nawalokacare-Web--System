

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





// Update meeting link for online consultation
router.put('/:id/meeting-link', appointmentController.updateMeetingLink);



module.exports = router;