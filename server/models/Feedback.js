const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  appointmentId: {
    type: String,
    required: true
  },
  doctorId: {
    type: String,
    required: true
  },
  patientId: {
    type: String,
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  doctorName: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    required: true
  },
  doctorProfessionalism: {
    type: Number,
    default: 5,
    min: 1,
    max: 5
  },
  waitingTime: {
    type: Number,
    default: 5,
    min: 1,
    max: 5
  },
  facilityCleanliness: {
    type: Number,
    default: 5,
    min: 1,
    max: 5
  },
  overallExperience: {
    type: Number,
    default: 5,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

// Prevent duplicate feedback for same appointment
feedbackSchema.index({ appointmentId: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);