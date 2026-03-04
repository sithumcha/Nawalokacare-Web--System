


import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const DoctorDetailsShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [appointmentStats, setAppointmentStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedConsultationType, setSelectedConsultationType] = useState(""); // New filter
  const [selectedSlot, setSelectedSlot] = useState(null);




  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        setIsLoading(true);
        
        // Fetch doctor basic information
        const doctorResponse = await axios.get(
          `http://localhost:5000/api/doctors/${id}`
        );
        setDoctor(doctorResponse.data);

        // Fetch doctor's available time slots
        const timeSlotsResponse = await axios.get(
          `http://localhost:5000/api/doctors/${id}` // Fixed URL
        );
        setAvailableTimeSlots(timeSlotsResponse.data.availableTimeSlots || []);

        // Fetch appointment statistics
        try {
          const statsResponse = await axios.get(
            `http://localhost:5000/api/appointments/stats/${id}`
          );
          setAppointmentStats(statsResponse.data);
        } catch (statsError) {
          console.warn("Could not fetch appointment stats:", statsError);
          // If stats API is not available, initialize with default values
          const defaultStats = {};
          timeSlotsResponse.data.availableTimeSlots?.forEach(slot => {
            defaultStats[slot._id] = {
              total: slot.quantity || 20,
              booked: 0,
              available: slot.quantity || 20
            };
          });
          setAppointmentStats(defaultStats);
        }
        
      } catch (error) {
        console.error("Error fetching doctor details:", error);
        setError("Failed to load doctor details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchDoctorDetails();
    }
  }, [id]);


  

  // Calculate appointment statistics for each time slot
  const calculateSlotStats = (slot) => {
    const stats = appointmentStats[slot._id];
    
    if (stats && typeof stats === 'object') {
      // If we have proper stats object from API
      return {
        total: stats.total || slot.quantity || 20,
        booked: stats.booked || 0,
        available: stats.available || (slot.quantity || 20) - (stats.booked || 0)
      };
    } else if (typeof stats === 'number') {
      // If API returns just the count (like { "slotId": 5 })
      const total = slot.quantity || 20;
      const booked = stats;
      const available = total - booked;
      
      return { total, booked, available };
    } else {
      // If no stats available, use slot quantity
      const total = slot.quantity || 20;
      const booked = 0;
      const available = total;
      
      return { total, booked, available };
    }
  };

  // Calculate total available appointments across all slots
  const calculateTotalAvailableAppointments = () => {
    return availableTimeSlots.reduce((total, slot) => {
      const stats = calculateSlotStats(slot);
      return total + stats.available;
    }, 0);
  };

  // Calculate total appointments capacity across all slots
  const calculateTotalAppointmentCapacity = () => {
    return availableTimeSlots.reduce((total, slot) => {
      const stats = calculateSlotStats(slot);
      return total + stats.total;
    }, 0);
  };

  // Calculate booked appointments across all slots
  const calculateTotalBookedAppointments = () => {
    return availableTimeSlots.reduce((total, slot) => {
      const stats = calculateSlotStats(slot);
      return total + stats.booked;
    }, 0);
  };

  // Calculate overall booking percentage
  const calculateBookingPercentage = () => {
    const totalCapacity = calculateTotalAppointmentCapacity();
    const totalBooked = calculateTotalBookedAppointments();
    
    if (totalCapacity === 0) return 0;
    return Math.round((totalBooked / totalCapacity) * 100);
  };

  // Group time slots by day and consultation type
  const timeSlotsByDay = availableTimeSlots.reduce((acc, slot) => {
    if (!acc[slot.day]) {
      acc[slot.day] = [];
    }
    acc[slot.day].push(slot);
    return acc;
  }, {});

  // Get unique days and consultation types
  const availableDays = Object.keys(timeSlotsByDay);
  const availableConsultationTypes = [...new Set(availableTimeSlots.map(slot => slot.consultationType))].filter(Boolean);

  // Filter time slots by selected day and consultation type
  const filteredTimeSlots = availableTimeSlots.filter(slot => {
    const dayMatch = !selectedDay || slot.day === selectedDay;
    const typeMatch = !selectedConsultationType || slot.consultationType === selectedConsultationType;
    return dayMatch && typeMatch;
  });

  // Get consultation type stats
  const getConsultationTypeStats = () => {
    const stats = {
      physical: { total: 0, booked: 0, available: 0 },
      online: { total: 0, booked: 0, available: 0 }
    };

    availableTimeSlots.forEach(slot => {
      const slotStats = calculateSlotStats(slot);
      if (slot.consultationType === 'physical') {
        stats.physical.total += slotStats.total;
        stats.physical.booked += slotStats.booked;
        stats.physical.available += slotStats.available;
      } else if (slot.consultationType === 'online') {
        stats.online.total += slotStats.total;
        stats.online.booked += slotStats.booked;
        stats.online.available += slotStats.available;
      }
    });

    return stats;
  };

  const consultationTypeStats = getConsultationTypeStats();

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined || price === '') return "Not set";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const getDayColor = (day) => {
    const colors = {
      Monday: "bg-blue-100 text-blue-800 border-blue-200",
      Tuesday: "bg-green-100 text-green-800 border-green-200",
      Wednesday: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Thursday: "bg-purple-100 text-purple-800 border-purple-200",
      Friday: "bg-red-100 text-red-800 border-red-200",
      Saturday: "bg-indigo-100 text-indigo-800 border-indigo-200",
      Sunday: "bg-pink-100 text-pink-800 border-pink-200"
    };
    return colors[day] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getConsultationTypeColor = (type) => {
    const colors = {
      physical: "bg-orange-100 text-orange-800 border-orange-200",
      online: "bg-cyan-100 text-cyan-800 border-cyan-200"
    };
    return colors[type] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getConsultationTypeIcon = (type) => {
    const icons = {
      physical: "🏥",
      online: "💻"
    };
    return icons[type] || "📅";
  };

  const handleSlotSelection = (slot) => {
    const stats = calculateSlotStats(slot);
    
    if (stats.available > 0) {
      const appointmentNumber = stats.booked + 1;
      setSelectedSlot({
        ...slot,
        appointmentNumber: appointmentNumber
      });
    }
  };

  const handleBookAppointment = () => {
    if (!selectedSlot) {
      alert("Please select a time slot first");
      return;
    }
    
    const stats = calculateSlotStats(selectedSlot);
    
    if (stats.available <= 0) {
      alert("This time slot is fully booked. Please select another slot.");
      return;
    }
    
    navigate(`/book/${id}`, { 
      state: { 
        selectedSlot,
        doctor 
      } 
    });
  };

  const handleQuickBook = () => {
    navigate(`/book/${id}`);
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedDay("");
    setSelectedConsultationType("");
  };

  // Calculate totals
  const totalAvailableAppointments = calculateTotalAvailableAppointments();
  const totalAppointmentCapacity = calculateTotalAppointmentCapacity();
  const totalBookedAppointments = calculateTotalBookedAppointments();
  const bookingPercentage = calculateBookingPercentage();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-700">Loading Doctor Details</h3>
          <p className="text-gray-500 mt-2">Please wait while we load the information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
            <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-xl font-semibold text-red-800 mb-2">Error Loading Doctor Details</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition duration-200"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Doctor Not Found</h3>
          <p className="text-gray-500 mb-4">The doctor you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Doctors
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Doctor Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                {doctor.profilePicture ? (
                  <img
                    src={`http://localhost:5000/${doctor.profilePicture}`}
                    alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                    className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-white bg-opacity-20 flex items-center justify-center border-4 border-white">
                    <svg className="h-16 w-16 text-white opacity-80" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Doctor Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  Dr. {doctor.firstName} {doctor.middleName && `${doctor.middleName} `}{doctor.lastName}
                </h1>
                <p className="text-xl text-blue-100 mb-4">{doctor.specialization}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
                  <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-blue-600">
                    <strong>Department:</strong> {doctor.department}
                  </div>
                  <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-blue-600">
                    <strong>License:</strong> {doctor.medicalLicenseNumber}
                  </div>
                  {/* Price Badge */}
                  <div className="bg-green-500 bg-opacity-90 px-4 py-2 rounded-full font-bold">
                    <strong>Fee:</strong> {formatPrice(doctor.price)}
                  </div>
                  {/* Consultation Types Available */}
                  {availableConsultationTypes.length > 0 && (
                    <div className="bg-purple-500 bg-opacity-90 px-4 py-2 rounded-full font-bold">
                      <strong>Available:</strong> {availableConsultationTypes.map(type => 
                        type === 'physical' ? '🏥 Physical' : '💻 Online'
                      ).join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
            {/* Left Column - Personal Information */}
            <div className="lg:col-span-2 space-y-8">
              {/* Contact Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                  <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                    <p className="text-lg text-gray-900">{doctor.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
                    <p className="text-lg text-gray-900">{doctor.phoneNumber}</p>
                  </div>
                </div>
              </div>

              {/* Available Time Slots */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                    <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Available Time Slots
                  </h2>
                  {selectedSlot && (
                    <button
                      onClick={handleBookAppointment}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition duration-200 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Book Selected Slot
                    </button>
                  )}
                </div>

                {/* Consultation Type Statistics */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-800 font-semibold flex items-center">
                          🏥 Physical Consultations
                        </p>
                        <p className="text-2xl font-bold text-orange-700">
                          {consultationTypeStats.physical.available}
                        </p>
                        <p className="text-orange-600 text-sm">
                          {consultationTypeStats.physical.booked} booked of {consultationTypeStats.physical.total}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-cyan-50 to-cyan-100 border border-cyan-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-cyan-800 font-semibold flex items-center">
                          💻 Online Consultations
                        </p>
                        <p className="text-2xl font-bold text-cyan-700">
                          {consultationTypeStats.online.available}
                        </p>
                        <p className="text-cyan-600 text-sm">
                          {consultationTypeStats.online.booked} booked of {consultationTypeStats.online.total}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filters */}
                <div className="mb-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Day Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Day:</label>
                      <select
                        value={selectedDay}
                        onChange={(e) => setSelectedDay(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">All Days</option>
                        {availableDays.map(day => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                    </div>

                    {/* Consultation Type Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type:</label>
                      <select
                        value={selectedConsultationType}
                        onChange={(e) => setSelectedConsultationType(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">All Types</option>
                        {availableConsultationTypes.map(type => (
                          <option key={type} value={type}>
                            {type === 'physical' ? '🏥 Physical Consultation' : '💻 Online Consultation'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {(selectedDay || selectedConsultationType) && (
                    <button
                      onClick={resetFilters}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Reset Filters
                    </button>
                  )}
                </div>

                {/* Selected Slot Info */}
                {selectedSlot && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-800 font-semibold">Selected Time Slot:</p>
                        <p className="text-green-700">
                          {selectedSlot.day} • {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
                        </p>
                        <p className="text-green-600 text-sm">
                          Type: <span className={`font-bold ${selectedSlot.consultationType === 'physical' ? 'text-orange-600' : 'text-cyan-600'}`}>
                            {selectedSlot.consultationType === 'physical' ? '🏥 Physical' : '💻 Online'}
                          </span>
                        </p>
                        <p className="text-green-600 text-sm">
                          Your Appointment #: <span className="font-bold">{selectedSlot.appointmentNumber}</span>
                        </p>
                        <p className="text-green-600 text-sm">
                          Consultation Fee: {formatPrice(doctor.price)}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedSlot(null)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Time Slots Display */}
                {filteredTimeSlots.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Available Time Slots</h4>
                    <p className="text-gray-500">
                      {selectedDay || selectedConsultationType 
                        ? "No slots match your current filters. Try adjusting your criteria."
                        : "This doctor hasn't added any available time slots yet."
                      }
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTimeSlots.map((slot, index) => {
                      const stats = calculateSlotStats(slot);
                      const isAvailable = stats.available > 0;
                      const isSelected = selectedSlot?._id === slot._id;
                      const slotBookingPercentage = stats.total > 0 ? Math.round((stats.booked / stats.total) * 100) : 0;
                      const nextAppointmentNumber = stats.booked + 1;

                      return (
                        <div
                          key={index}
                          onClick={() => isAvailable && handleSlotSelection(slot)}
                          className={`border rounded-lg p-4 transition duration-200 ${
                            isSelected
                              ? 'border-green-500 bg-green-50 ring-2 ring-green-200 cursor-pointer'
                              : isAvailable
                              ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-25 cursor-pointer'
                              : 'border-red-200 bg-red-50 cursor-not-allowed opacity-70'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex flex-col space-y-2">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDayColor(slot.day)}`}>
                                {slot.day}
                              </span>
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConsultationTypeColor(slot.consultationType)}`}>
                                {getConsultationTypeIcon(slot.consultationType)} {slot.consultationType === 'physical' ? 'Physical' : 'Online'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {isSelected && (
                                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              )}
                              {!isAvailable && (
                                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                                  Fully Booked
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 text-gray-700 mb-2">
                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-semibold text-gray-900 text-lg">
                              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                            </span>
                          </div>
                          
                          {/* Enhanced Appointment Availability with Numbers */}
                          <div className="flex items-center justify-between text-sm mb-2">
                            <div className="text-gray-600">
                              <span>Next Appointment #: </span>
                              <span className={`font-semibold ${
                                isAvailable ? 'text-green-700' : 'text-red-700'
                              }`}>
                                {nextAppointmentNumber}
                              </span>
                              <span className="text-gray-500 mx-1">of</span>
                              <span className="font-semibold text-blue-700">{stats.total}</span>
                              <span className="text-xs text-gray-500 ml-2">
                                ({slotBookingPercentage}% booked)
                              </span>
                            </div>
                            <span className="font-semibold text-green-700">
                              {formatPrice(doctor.price)}
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                stats.available === 0 ? 'bg-red-500' : 
                                stats.available < stats.total / 2 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${slotBookingPercentage}%` }}
                            ></div>
                          </div>

                          {/* Current Queue Status */}
                          <div className="mt-2 text-xs text-gray-500">
                            {isAvailable ? (
                              <span className="text-green-600">
                                ✓ Next available: Appointment #{nextAppointmentNumber}
                              </span>
                            ) : (
                              <span className="text-red-600">
                                ✗ All {stats.total} appointments are booked
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Quick Actions & Summary */}
            <div className="space-y-6">
              {/* Book Appointment Card */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-blue-900 mb-4">Book an Appointment</h3>
                <div className="mb-4 p-3 bg-white rounded-lg border border-blue-200">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Consultation Fee</p>
                    <p className="text-2xl font-bold text-green-700">{formatPrice(doctor.price)}</p>
                    <p className="text-xs text-gray-500">Per session</p>
                  </div>
                </div>
                <p className="text-blue-700 mb-4">
                  Ready to schedule your {selectedSlot?.consultationType === 'physical' ? 'in-person' : 'online'} visit with Dr. {doctor.lastName}?
                </p>
                {/* {selectedSlot ? (
                  <button
                    onClick={handleBookAppointment}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200"
                  >
                    Book Selected Slot
                  </button>
                ) : (
                  <button
                    onClick={handleQuickBook}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
                  >
                    Book Appointment
                  </button>
                )} */}
                {selectedSlot && (
                  <p className="text-green-600 text-sm mt-2 text-center">
                    ✓ Appointment #{selectedSlot.appointmentNumber} at {formatTime(selectedSlot.startTime)} on {selectedSlot.day}
                    <br />
                    <span className={selectedSlot.consultationType === 'physical' ? 'text-orange-600' : 'text-cyan-600'}>
                      {selectedSlot.consultationType === 'physical' ? '🏥 Physical Consultation' : '💻 Online Consultation'}
                    </span>
                  </p>
                )}
              </div>

              {/* Consultation Type Summary */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Consultation Types</h3>
                <div className="space-y-4">
                  {/* Physical Consultations */}
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🏥</span>
                      <div>
                        <p className="font-semibold text-orange-800">Physical</p>
                        <p className="text-sm text-orange-600">
                          {consultationTypeStats.physical.available} available
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-orange-700">
                        {Math.round((consultationTypeStats.physical.booked / (consultationTypeStats.physical.total || 1)) * 100)}%
                      </p>
                      <p className="text-xs text-orange-600">booked</p>
                    </div>
                  </div>

                  {/* Online Consultations */}
                  <div className="flex items-center justify-between p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">💻</span>
                      <div>
                        <p className="font-semibold text-cyan-800">Online</p>
                        <p className="text-sm text-cyan-600">
                          {consultationTypeStats.online.available} available
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-cyan-700">
                        {Math.round((consultationTypeStats.online.booked / (consultationTypeStats.online.total || 1)) * 100)}%
                      </p>
                      <p className="text-xs text-cyan-600">booked</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Contact</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => window.location.href = `tel:${doctor.phoneNumber}`}
                    className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>Call Now</span>
                  </button>
                  <button 
                    onClick={() => window.location.href = `mailto:${doctor.email}`}
                    className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Send Email</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetailsShow;











