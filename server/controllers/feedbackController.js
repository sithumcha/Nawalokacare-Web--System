

const Feedback = require('../models/Feedback');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User'); // Import User model

// Submit Feedback - FIXED VERSION
exports.submitFeedback = async (req, res) => {
  try {
    console.log('📥 Received feedback data:', req.body);
    
    const {
      appointmentId,
      doctorId,
      patientId,
      patientName,  // This comes from frontend
      doctorName,
      rating,
      review,
      doctorProfessionalism,
      waitingTime,
      facilityCleanliness,
      overallExperience,
      isAnonymous
    } = req.body;

    // Basic validation
    if (!appointmentId || !doctorId || !patientId || !rating || !review) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: appointmentId, doctorId, patientId, rating, review'
      });
    }

    // 1. Check if appointment exists
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    console.log('📋 Appointment found:', {
      appointmentId: appointment._id,
      patientInAppointment: appointment.patientId || appointment.userId,
      patientNameInAppointment: appointment.patientName,
      patientDetails: appointment.patientDetails
    });

    // 2. Get patient name - TRY MULTIPLE SOURCES
    let finalPatientName = patientName; // First try from frontend
    
    if (!finalPatientName) {
      console.log('🔍 Patient name not from frontend, checking other sources...');
      
      // Source 1: Check appointment.patientName
      if (appointment.patientName) {
        finalPatientName = appointment.patientName;
        console.log('✅ Got from appointment.patientName:', finalPatientName);
      }
      // Source 2: Check appointment.patientDetails.name
      else if (appointment.patientDetails && appointment.patientDetails.name) {
        finalPatientName = appointment.patientDetails.name;
        console.log('✅ Got from appointment.patientDetails.name:', finalPatientName);
      }
      // Source 3: Check appointment.patientDetails.fullName
      else if (appointment.patientDetails && appointment.patientDetails.fullName) {
        finalPatientName = appointment.patientDetails.fullName;
        console.log('✅ Got from appointment.patientDetails.fullName:', finalPatientName);
      }
      // Source 4: Fetch from User model using patientId from appointment
      else {
        try {
          // First try: Use patientId from request (logged in user)
          let userToCheck = patientId;
          
          // If appointment has different patientId, use that
          if (appointment.patientId && appointment.patientId.toString() !== patientId) {
            userToCheck = appointment.patientId;
          } else if (appointment.userId) {
            userToCheck = appointment.userId;
          }
          
          const user = await User.findById(userToCheck).select('name fullName firstName lastName');
          if (user) {
            // Try different name fields in User model
            finalPatientName = user.name || user.fullName || 
                              (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : null) ||
                              user.firstName || 
                              user.lastName;
            
            if (finalPatientName) {
              console.log('✅ Got from User model:', finalPatientName);
            } else {
              console.log('⚠️ User found but no name field');
            }
          }
        } catch (userError) {
          console.log('Could not fetch user:', userError.message);
        }
      }
    }

    // Final fallback
    if (!finalPatientName) {
      finalPatientName = 'Patient';
      console.log('⚠️ Using default patient name');
    }

    console.log('🎯 Final patient name for feedback:', finalPatientName);

    // 3. Check if feedback already exists for this appointment
    const existingFeedback = await Feedback.findOne({ appointmentId });
    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        error: 'Feedback already submitted for this appointment'
      });
    }

    // 4. Create feedback
    const feedback = new Feedback({
      appointmentId,
      doctorId,
      patientId,
      patientName: isAnonymous ? 'Anonymous' : finalPatientName,
      doctorName: doctorName || 'Doctor',
      rating,
      review,
      doctorProfessionalism: doctorProfessionalism || 5,
      waitingTime: waitingTime || 5,
      facilityCleanliness: facilityCleanliness || 5,
      overallExperience: overallExperience || 5,
      isAnonymous: isAnonymous || false,
      status: 'approved'
    });

    await feedback.save();
    console.log('✅ Feedback saved successfully:', feedback._id);

    // 5. Update appointment to mark as hasFeedback
    appointment.hasFeedback = true;
    await appointment.save();
    console.log('✅ Appointment updated with hasFeedback: true');

    // 6. Update doctor's average rating
    await updateDoctorRating(doctorId);

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback: {
        _id: feedback._id,
        appointmentId: feedback.appointmentId,
        doctorId: feedback.doctorId,
        patientId: feedback.patientId,
        patientName: feedback.patientName,
        doctorName: feedback.doctorName,
        rating: feedback.rating,
        review: feedback.review,
        doctorProfessionalism: feedback.doctorProfessionalism,
        waitingTime: feedback.waitingTime,
        facilityCleanliness: feedback.facilityCleanliness,
        overallExperience: feedback.overallExperience,
        isAnonymous: feedback.isAnonymous,
        createdAt: feedback.createdAt,
        updatedAt: feedback.updatedAt
      }
    });

  } catch (error) {
    console.error('❌ Error submitting feedback:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Feedback already exists for this appointment'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error while submitting feedback'
    });
  }
};

// Get Feedback for Specific Appointment
exports.getFeedbackByAppointment = async (req, res) => {
  try {
    const { appointmentId, userId } = req.params;
    
    console.log('🔍 Looking for feedback for appointment:', appointmentId, 'user:', userId);

    const feedback = await Feedback.findOne({ 
      appointmentId,
      patientId: userId 
    });

    if (!feedback) {
      return res.status(200).json({
        success: true,
        message: 'No feedback found for this appointment',
        feedback: null
      });
    }

    res.json({
      success: true,
      feedback
    });
  } catch (error) {
    console.error('❌ Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching feedback'
    });
  }
};

// Get All Feedbacks for a Doctor (with pagination)
exports.getDoctorFeedbacks = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { page = 1, limit = 10, rating, sortBy = 'newest' } = req.query;

    console.log('👨‍⚕️ Fetching feedbacks for doctor:', doctorId);

    // Build query
    let query = { doctorId };
    
    if (rating) {
      const minRating = parseInt(rating);
      if (!isNaN(minRating)) {
        query.rating = { $gte: minRating };
      }
    }

    // Build sort options
    let sortOptions = {};
    if (sortBy === 'newest') {
      sortOptions.createdAt = -1;
    } else if (sortBy === 'oldest') {
      sortOptions.createdAt = 1;
    } else if (sortBy === 'highest') {
      sortOptions.rating = -1;
    } else if (sortBy === 'lowest') {
      sortOptions.rating = 1;
    } else {
      sortOptions.createdAt = -1;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const feedbacks = await Feedback.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .select('_id patientName rating review doctorProfessionalism waitingTime facilityCleanliness overallExperience createdAt isAnonymous');

    const total = await Feedback.countDocuments(query);

    // Calculate average ratings
    const avgRatings = await Feedback.aggregate([
      { $match: { doctorId: doctorId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          avgProfessionalism: { $avg: '$doctorProfessionalism' },
          avgWaitingTime: { $avg: '$waitingTime' },
          avgCleanliness: { $avg: '$facilityCleanliness' },
          avgExperience: { $avg: '$overallExperience' },
          totalFeedbacks: { $sum: 1 }
        }
      }
    ]);

    const ratingSummary = avgRatings[0] || {
      averageRating: 0,
      avgProfessionalism: 0,
      avgWaitingTime: 0,
      avgCleanliness: 0,
      avgExperience: 0,
      totalFeedbacks: 0
    };

    res.json({
      success: true,
      feedbacks,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalFeedbacks: total,
        hasMore: total > skip + feedbacks.length
      },
      ratingSummary: {
        averageRating: parseFloat(ratingSummary.averageRating.toFixed(1)) || 0,
        averageProfessionalism: parseFloat(ratingSummary.avgProfessionalism.toFixed(1)) || 0,
        averageWaitingTime: parseFloat(ratingSummary.avgWaitingTime.toFixed(1)) || 0,
        averageCleanliness: parseFloat(ratingSummary.avgCleanliness.toFixed(1)) || 0,
        averageExperience: parseFloat(ratingSummary.avgExperience.toFixed(1)) || 0,
        totalFeedbacks: ratingSummary.totalFeedbacks || 0
      }
    });
  } catch (error) {
    console.error('❌ Error fetching doctor feedbacks:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching feedbacks'
    });
  }
};

// Get Patient's All Feedbacks
exports.getPatientFeedbacks = async (req, res) => {
  try {
    const { patientId } = req.params;

    const feedbacks = await Feedback.find({ patientId })
      .sort({ createdAt: -1 })
      .populate('doctorId', 'name specialization')
      .populate('appointmentId', 'appointmentDate timeSlot');

    res.json({
      success: true,
      feedbacks,
      total: feedbacks.length
    });
  } catch (error) {
    console.error('❌ Error fetching patient feedbacks:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching feedbacks'
    });
  }
};

// Update Feedback
exports.updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    console.log('✏️ Updating feedback:', id, 'with:', updates);

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found'
      });
    }

    // Check authorization
    if (feedback.patientId.toString() !== req.body.patientId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to update this feedback'
      });
    }

    // Update allowed fields
    const allowedUpdates = ['rating', 'review', 'doctorProfessionalism', 'waitingTime', 'facilityCleanliness', 'overallExperience', 'isAnonymous'];
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        feedback[field] = updates[field];
      }
    });

    // Update patientName if isAnonymous changed
    if (updates.isAnonymous !== undefined) {
      if (updates.isAnonymous) {
        feedback.patientName = 'Anonymous';
      } else {
        // Try to get original patient name
        const appointment = await Appointment.findById(feedback.appointmentId);
        if (appointment && appointment.patientName) {
          feedback.patientName = appointment.patientName;
        }
      }
    }

    await feedback.save();

    // Update doctor's average rating
    await updateDoctorRating(feedback.doctorId);

    res.json({
      success: true,
      message: 'Feedback updated successfully',
      feedback
    });
  } catch (error) {
    console.error('❌ Error updating feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating feedback'
    });
  }
};

// Delete Feedback
exports.deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { patientId } = req.body;

    console.log('🗑️ Deleting feedback:', id, 'by patient:', patientId);

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found'
      });
    }

    if (feedback.patientId.toString() !== patientId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to delete this feedback'
      });
    }

    // Update appointment to remove feedback flag
    await Appointment.findByIdAndUpdate(feedback.appointmentId, {
      hasFeedback: false
    });

    await feedback.deleteOne();

    // Update doctor's average rating
    await updateDoctorRating(feedback.doctorId);

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting feedback'
    });
  }
};

// Get Feedback by ID
exports.getFeedbackById = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findById(id)
      .populate('doctorId', 'name specialization profileImage')
      .populate('appointmentId', 'appointmentDate timeSlot patientName')
      .populate('patientId', 'name email');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found'
      });
    }

    res.json({
      success: true,
      feedback
    });
  } catch (error) {
    console.error('❌ Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching feedback'
    });
  }
};

// Get Feedback Summary for Dashboard
exports.getFeedbackSummary = async (req, res) => {
  try {
    const { doctorId, startDate, endDate } = req.query;
    
    let matchQuery = {};
    
    if (doctorId) {
      matchQuery.doctorId = doctorId;
    }
    
    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const summary = await Feedback.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalFeedbacks: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      },
      {
        $project: {
          totalFeedbacks: 1,
          averageRating: { $round: ['$averageRating', 1] },
          ratingDistribution: {
            '5': { $size: { $filter: { input: '$ratingDistribution', as: 'rating', cond: { $eq: ['$$rating', 5] } } } },
            '4': { $size: { $filter: { input: '$ratingDistribution', as: 'rating', cond: { $eq: ['$$rating', 4] } } } },
            '3': { $size: { $filter: { input: '$ratingDistribution', as: 'rating', cond: { $eq: ['$$rating', 3] } } } },
            '2': { $size: { $filter: { input: '$ratingDistribution', as: 'rating', cond: { $eq: ['$$rating', 2] } } } },
            '1': { $size: { $filter: { input: '$ratingDistribution', as: 'rating', cond: { $eq: ['$$rating', 1] } } } }
          }
        }
      }
    ]);

    res.json({
      success: true,
      summary: summary[0] || {
        totalFeedbacks: 0,
        averageRating: 0,
        ratingDistribution: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 }
      }
    });
  } catch (error) {
    console.error('❌ Error fetching feedback summary:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching feedback summary'
    });
  }
};

// Helper function to update doctor's average rating
const updateDoctorRating = async (doctorId) => {
  try {
    console.log('📊 Updating doctor rating for:', doctorId);
    
    const result = await Feedback.aggregate([
      { $match: { doctorId: doctorId } },
      {
        $group: {
          _id: '$doctorId',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          avgProfessionalism: { $avg: '$doctorProfessionalism' },
          avgWaitingTime: { $avg: '$waitingTime' },
          avgCleanliness: { $avg: '$facilityCleanliness' },
          avgExperience: { $avg: '$overallExperience' }
        }
      }
    ]);

    if (result.length > 0) {
      const { averageRating, totalReviews, avgProfessionalism, avgWaitingTime, avgCleanliness, avgExperience } = result[0];
      
      const updateData = {
        averageRating: parseFloat(averageRating.toFixed(1)),
        totalReviews: totalReviews,
        ratingDetails: {
          professionalism: parseFloat(avgProfessionalism.toFixed(1)),
          waitingTime: parseFloat(avgWaitingTime.toFixed(1)),
          cleanliness: parseFloat(avgCleanliness.toFixed(1)),
          experience: parseFloat(avgExperience.toFixed(1))
        },
        updatedAt: new Date()
      };
      
      await Doctor.findByIdAndUpdate(doctorId, updateData);
      
      console.log('✅ Doctor rating updated:', updateData);
    } else {
      console.log('ℹ️ No feedbacks found for doctor, resetting ratings');
      await Doctor.findByIdAndUpdate(doctorId, {
        averageRating: 0,
        totalReviews: 0,
        ratingDetails: {
          professionalism: 0,
          waitingTime: 0,
          cleanliness: 0,
          experience: 0
        },
        updatedAt: new Date()
      });
    }
  } catch (error) {
    console.error('❌ Error updating doctor rating:', error);
  }
};

