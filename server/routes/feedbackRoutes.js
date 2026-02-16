const express = require('express');
const router = express.Router();
const {
  submitFeedback,
  getFeedbackByAppointment,
  getDoctorFeedbacks,
  getPatientFeedbacks,
  updateFeedback,
  deleteFeedback,
  getFeedbackById,
  getFeedbackSummary
} = require('../controllers/feedbackController');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Feedback routes working!' });
});

// All feedback routes
router.post('/', submitFeedback);
router.get('/appointment/:appointmentId/user/:userId', getFeedbackByAppointment);
router.get('/doctor/:doctorId', getDoctorFeedbacks);
router.get('/patient/:patientId', getPatientFeedbacks);
router.get('/summary', getFeedbackSummary);
router.put('/:id', updateFeedback);
router.delete('/:id', deleteFeedback);
router.get('/:id', getFeedbackById);

module.exports = router;