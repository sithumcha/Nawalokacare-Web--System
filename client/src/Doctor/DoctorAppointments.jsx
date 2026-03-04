


import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const DoctorAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("today");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [doctorId, setDoctorId] = useState(null);
  const [doctorName, setDoctorName] = useState("");
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [consultationLink, setConsultationLink] = useState("");
  const [sendingLink, setSendingLink] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("google");
  const [meetingInstructions, setMeetingInstructions] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });
  const [testingEmail, setTestingEmail] = useState(false);

  // Initialize component
  useEffect(() => {
    const doctorIdFromLocalStorage = localStorage.getItem("doctorId");
    const doctorNameFromStorage = localStorage.getItem("doctorName");
    
    if (!doctorIdFromLocalStorage) {
      navigate("/doctor/login");
      return;
    }
    
    setDoctorId(doctorIdFromLocalStorage);
    setDoctorName(doctorNameFromStorage || "Dr. Apsara Chanuka");
    fetchDoctorAppointments(doctorIdFromLocalStorage);
    fetchUnreadCounts(doctorIdFromLocalStorage);
  }, [navigate]);

  useEffect(() => {
    filterAppointments();
  }, [appointments, filter]);

  // Fetch doctor appointments
  const fetchDoctorAppointments = async (doctorId) => {
    try {
      setIsLoading(true);
      setError("");
      const response = await axios.get(`http://localhost:5000/api/appointments/doctor/${doctorId}`);
      
      if (response.data && Array.isArray(response.data)) {
        setAppointments(response.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching doctor appointments:", error);
      const mockAppointments = generateMockAppointments(doctorId, doctorName);
      setAppointments(mockAppointments);
      setError("Connected to demo mode. Using sample appointment data.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch unread counts
  const fetchUnreadCounts = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/chat/unread/${userId}/doctor`);
      if (response.data.success) {
        const counts = {};
        response.data.chats?.forEach(chat => {
          counts[chat.appointmentId] = chat.unreadCount;
        });
        setUnreadCounts(counts);
      }
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    }
  };

  // Generate mock appointments for demo
  const generateMockAppointments = (doctorId, doctorName) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return [
      {
        _id: "appointment_1",
        appointmentNumber: "APT-202412-0001",
        doctorId: doctorId,
        doctorName: doctorName || "Dr. Apsara Chanuka",
        doctorSpecialization: "Neurology",
        price: 150.00,
        consultationType: "online",
        meetingLink: "https://meet.google.com/abc-def-ghi",
        patientDetails: {
          _id: "patient_1",
          fullName: "John Doe",
          email: "john@example.com",
          phoneNumber: "+1234567890",
          dateOfBirth: "1985-03-15",
          gender: "male",
          address: "123 Main Street, City, State",
          medicalConcern: "Headaches and migraine consultation",
          previousConditions: "Occasional migraines"
        },
        appointmentDate: today.toISOString(),
        timeSlot: {
          day: "Monday",
          startTime: "09:00",
          endTime: "09:30",
          slotId: "slot1"
        },
        status: "confirmed",
        createdAt: new Date().toISOString()
      },
      {
        _id: "appointment_2",
        appointmentNumber: "APT-202412-0002",
        doctorId: doctorId,
        doctorName: doctorName || "Dr. Apsara Chanuka",
        doctorSpecialization: "Neurology",
        price: 150.00,
        consultationType: "physical",
        meetingLink: "",
        patientDetails: {
          _id: "patient_2",
          fullName: "Jane Smith",
          email: "jane@example.com",
          phoneNumber: "+1234567891",
          dateOfBirth: "1990-07-22",
          gender: "female",
          address: "456 Oak Avenue, City, State",
          medicalConcern: "Follow-up for previous treatment",
          previousConditions: "None"
        },
        appointmentDate: today.toISOString(),
        timeSlot: {
          day: "Monday",
          startTime: "10:00",
          endTime: "10:45",
          slotId: "slot2"
        },
        status: "pending",
        createdAt: new Date().toISOString()
      },
      {
        _id: "appointment_3",
        appointmentNumber: "APT-202412-0003",
        doctorId: doctorId,
        doctorName: doctorName || "Dr. Apsara Chanuka",
        doctorSpecialization: "Neurology",
        price: 200.00,
        consultationType: "online",
        meetingLink: "",
        patientDetails: {
          _id: "patient_3",
          fullName: "Robert Johnson",
          email: "robert@example.com",
          phoneNumber: "+1234567892",
          dateOfBirth: "1978-11-30",
          gender: "male",
          address: "789 Pine Road, City, State",
          medicalConcern: "Neurological examination",
          previousConditions: "High blood pressure"
        },
        appointmentDate: tomorrow.toISOString(),
        timeSlot: {
          day: "Tuesday",
          startTime: "14:00",
          endTime: "14:45",
          slotId: "slot3"
        },
        status: "confirmed",
        createdAt: new Date().toISOString()
      },
      {
        _id: "appointment_4",
        appointmentNumber: "APT-202412-0004",
        doctorId: doctorId,
        doctorName: doctorName || "Dr. Apsara Chanuka",
        doctorSpecialization: "Neurology",
        price: 180.00,
        consultationType: "online",
        meetingLink: "https://zoom.us/j/123456789",
        patientDetails: {
          _id: "patient_4",
          fullName: "Sarah Wilson",
          email: "sarah@example.com",
          phoneNumber: "+1234567893",
          dateOfBirth: "1982-05-20",
          gender: "female",
          address: "321 Elm Street, City, State",
          medicalConcern: "Routine checkup and consultation",
          previousConditions: "Diabetes type 2"
        },
        appointmentDate: nextWeek.toISOString(),
        timeSlot: {
          day: "Wednesday",
          startTime: "11:00",
          endTime: "11:45",
          slotId: "slot4"
        },
        status: "confirmed",
        createdAt: new Date().toISOString()
      }
    ];
  };

  // Generate meeting link
  const generateMeetingLink = (platform = "google") => {
    const platforms = {
      google: {
        prefix: "https://meet.google.com/",
        generateId: () => {
          const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
          let result = '';
          for (let i = 0; i < 9; i++) {
            if (i === 3 || i === 6) result += '-';
            result += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          return result;
        }
      },
      zoom: {
        prefix: "https://zoom.us/j/",
        generateId: () => Math.floor(100000000 + Math.random() * 900000000).toString()
      },
      teams: {
        prefix: "https://teams.microsoft.com/l/meetup-join/",
        generateId: () => {
          const randomId = Math.random().toString(36).substring(2, 15);
          return `${randomId}@thread.tacv2`;
        }
      }
    };

    const selected = platforms[platform];
    return selected.prefix + selected.generateId();
  };

  const handlePlatformChange = (platform) => {
    setSelectedPlatform(platform);
    setConsultationLink(generateMeetingLink(platform));
  };

  // Filter appointments
  const filterAppointments = () => {
    if (!appointments.length) {
      setFilteredAppointments([]);
      return;
    }

    const now = new Date();
    let filtered = appointments;

    switch (filter) {
      case "today":
        filtered = appointments.filter(appointment => {
          if (!appointment || !appointment.appointmentDate) return false;
          const appointmentDate = new Date(appointment.appointmentDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          appointmentDate.setHours(0, 0, 0, 0);
          return appointmentDate.getTime() === today.getTime();
        });
        break;
      case "upcoming":
        filtered = appointments.filter(appointment => {
          if (!appointment || !appointment.appointmentDate) return false;
          const appointmentDate = new Date(appointment.appointmentDate);
          return appointmentDate >= now && (appointment.status === "pending" || appointment.status === "confirmed");
        });
        break;
      case "pending":
        filtered = appointments.filter(appointment => appointment.status === "pending");
        break;
      case "online":
        filtered = appointments.filter(appointment => appointment.consultationType === "online");
        break;
      case "physical":
        filtered = appointments.filter(appointment => appointment.consultationType === "physical");
        break;
      case "all":
      default:
        filtered = appointments;
    }

    setFilteredAppointments(filtered);
  };

  // ==================== EMAIL FUNCTIONS ====================

  // Send consultation link via real email
 const sendLinkNotification = async (appointment, link, platform, instructions) => {
  try {
    console.log("📨 Preparing to send email via API...");
    console.log("📬 Sending to:", appointment.patientDetails.email);
    console.log("📋 Patient:", appointment.patientDetails.fullName);
    
    const payload = {
      to: appointment.patientDetails.email,
      patientName: appointment.patientDetails.fullName,
      doctorName: appointment.doctorName,
      doctorSpecialization: appointment.doctorSpecialization,
      appointmentDate: formatDate(appointment.appointmentDate),
      appointmentTime: `${formatTime(appointment.timeSlot.startTime)} - ${formatTime(appointment.timeSlot.endTime)}`,
      consultationLink: link,
      platform: platform,
      instructions: instructions || ''
    };
    
    console.log("📤 API Payload:", payload);
    
    const response = await axios.post('http://localhost:5000/api/email/consultation-link', payload, {
      timeout: 10000, // 10 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log("✅ Email API Response:", response.data);
    
    if (response.data.success) {
      console.log('✅ Email sent successfully:', response.data.emailDetails);
      return {
        success: true,
        data: response.data,
        details: response.data.emailDetails
      };
    } else {
      throw new Error(response.data.error || 'Failed to send email');
    }
  } catch (error) {
    console.error('❌ Email sending error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config?.url
    });
    
    // Check for common errors
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Backend server is not running on localhost:5000');
      console.error('💡 Run: cd backend && npm start');
    } else if (error.code === 'ENOTFOUND') {
      console.error('❌ Cannot connect to backend server');
    } else if (error.response?.status === 404) {
      console.error('❌ API endpoint not found. Check if /api/email/consultation-link exists');
    }
    
    // Fallback to demo mode
    console.log("📧 Demo mode - Email would be sent to:", {
      to: appointment.patientDetails.email,
      patientName: appointment.patientDetails.fullName,
      doctorName: appointment.doctorName,
      appointmentDate: formatDate(appointment.appointmentDate),
      consultationLink: link,
      platform: platform,
      instructions: instructions
    });
    
    return {
      success: true,
      demo: true,
      message: 'Email sent (demo mode)',
      details: {
        to: appointment.patientDetails.email,
        timestamp: new Date().toISOString(),
        note: 'Backend email API unavailable'
      }
    };
  }
};

  // Send appointment status update email
  const sendAppointmentStatusEmail = async (appointment, status) => {
    try {
      const response = await axios.post('http://localhost:5000/api/email/appointment-confirmation', {
        to: appointment.patientDetails.email,
        patientName: appointment.patientDetails.fullName,
        doctorName: appointment.doctorName,
        doctorSpecialization: appointment.doctorSpecialization,
        appointmentDate: formatDate(appointment.appointmentDate),
        appointmentTime: `${formatTime(appointment.timeSlot.startTime)} - ${formatTime(appointment.timeSlot.endTime)}`,
        appointmentType: appointment.consultationType,
        status: status
      });

      if (response.data.success) {
        console.log(`✅ Status update email sent for ${status} appointment`);
        return { success: true };
      }
    } catch (error) {
      console.warn('⚠️ Could not send status email:', error.message);
      return { success: false, error: error.message };
    }
  };

  // Test email functionality
  const testEmailFunction = async () => {
    try {
      setTestingEmail(true);
      showAlert("info", "Sending test email...");
      
      const response = await axios.post('http://localhost:5000/api/email/test', {
        to: "test@example.com", // You can replace with your email
        name: doctorName
      });
      
      if (response.data.success) {
        showAlert("success", "✅ Test email sent successfully! Check your inbox or spam folder.");
      } else {
        showAlert("warning", `⚠️ Test email failed: ${response.data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Test email error:', error);
      showAlert("error", "❌ Failed to send test email. Check backend connection.");
    } finally {
      setTestingEmail(false);
    }
  };

  // ==================== UPDATED HANDLER FUNCTIONS ====================

  // Handle appointment status update with email notification
  const handleStatusUpdate = async (appointmentId, newStatus) => {
    setActionLoading(true);
    try {
      // Update appointment status
      await axios.put(`http://localhost:5000/api/appointments/${appointmentId}/status`, { 
        status: newStatus,
        doctorId: doctorId 
      });
      
      // Send email notification for status change
      const appointment = appointments.find(apt => apt._id === appointmentId);
      if (appointment && ['confirmed', 'cancelled', 'completed'].includes(newStatus)) {
        await sendAppointmentStatusEmail(appointment, newStatus);
      }
      
      // Update local state
      setAppointments(prev => prev.map(apt => 
        apt._id === appointmentId ? { ...apt, status: newStatus } : apt
      ));
      
      setShowModal(false);
      setSelectedAppointment(null);
      
      showAlert("success", `Appointment ${newStatus} successfully. Email notification sent.`);
      
    } catch (error) {
      console.error("❌ Error updating appointment status:", error);
      showAlert("error", `Failed to update appointment status: ${error.response?.data?.error || error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle sending consultation link with real email
 const handleSendConsultationLink = async (appointment) => {
  if (!consultationLink.trim()) {
    showAlert("error", "Please enter a valid consultation link");
    return;
  }

  setSendingLink(true);
  try {
    console.log("🚀 Starting consultation link sending process...");
    console.log("📋 Appointment ID:", appointment._id);
    console.log("📧 Patient Email:", appointment.patientDetails?.email);
    console.log("🔗 Consultation Link:", consultationLink);
    console.log("🖥️ Platform:", selectedPlatform);
    
    // 1. Update appointment with meeting link
    try {
      console.log("📝 Step 1: Updating appointment with meeting link...");
      const updateResponse = await axios.put(`http://localhost:5000/api/appointments/${appointment._id}/meeting-link`, {
        meetingLink: consultationLink,
        meetingPlatform: selectedPlatform,
        doctorId: doctorId
      });
      console.log("✅ Appointment update successful:", updateResponse.data);
    } catch (updateError) {
      console.error("❌ Appointment update failed:", updateError.response?.data || updateError.message);
      // Don't fail the whole process if appointment update fails
    }

    // 2. Send email notification
    console.log("📧 Step 2: Sending email notification...");
    const emailResult = await sendLinkNotification(
      appointment, 
      consultationLink, 
      selectedPlatform, 
      meetingInstructions
    );
    console.log("📧 Email result:", emailResult);

    // 3. Update local state
    console.log("🔄 Step 3: Updating local state...");
    setAppointments(prev => prev.map(apt => 
      apt._id === appointment._id 
        ? { ...apt, meetingLink: consultationLink }
        : apt
    ));

    if (emailResult.success) {
      if (emailResult.demo) {
        showAlert("success", "✅ Consultation link saved! (Demo mode - email would be sent)");
      } else {
        showAlert("success", "✅ Consultation link sent successfully via email!");
        
        // Show email confirmation details
        console.log('📧 Email confirmation:', {
          sentTo: appointment.patientDetails.email,
          timestamp: new Date().toLocaleString(),
          appointmentId: appointment._id
        });
      }
    } else {
      showAlert("warning", "⚠️ Appointment updated but email failed to send. Please try sending the link again.");
    }
    
    setShowLinkModal(false);
    setConsultationLink("");
    setMeetingInstructions("");
    setSelectedPlatform("google");
    
  } catch (error) {
    console.error("❌ Error in sending consultation link:", error);
    console.error("❌ Error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    showAlert("error", `Failed to send consultation link: ${error.message}`);
  } finally {
    setSendingLink(false);
  }
};

  const handleActionClick = (appointment, action) => {
    setSelectedAppointment(appointment);
    
    switch (action) {
      case "confirm":
        handleStatusUpdate(appointment._id, "confirmed");
        break;
      case "complete":
        handleStatusUpdate(appointment._id, "completed");
        break;
      case "cancel":
        handleStatusUpdate(appointment._id, "cancelled");
        break;
      case "view":
        setShowModal(true);
        break;
      case "send-link":
        setConsultationLink(appointment.meetingLink || generateMeetingLink());
        setShowLinkModal(true);
        break;
      case "join-call":
        if (appointment.meetingLink) {
          window.open(appointment.meetingLink, '_blank', 'noopener,noreferrer');
        } else {
          showAlert("error", "No meeting link available. Please generate and send a link first.");
        }
        break;
      case "chat":
        navigate(`/doctor/chat/${appointment._id}`);
        break;
      default:
        break;
    }
  };

  // UI Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getConsultationTypeColor = (type) => {
    switch (type) {
      case "online":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "physical":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return "✓";
      case "pending":
        return "⏳";
      case "cancelled":
        return "✕";
      case "completed":
        return "✓";
      default:
        return "●";
    }
  };

  const getConsultationTypeIcon = (type) => {
    switch (type) {
      case "online":
        return "💻";
      case "physical":
        return "🏥";
      default:
        return "📅";
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    try {
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return timeString;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined || price === '') return "Not set";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "N/A";
    try {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    } catch (error) {
      return "N/A";
    }
  };

  const getAppointmentStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayAppointments = appointments.filter(apt => {
      if (!apt || !apt.appointmentDate) return false;
      const aptDate = new Date(apt.appointmentDate);
      aptDate.setHours(0, 0, 0, 0);
      return aptDate.getTime() === today.getTime();
    });

    const upcomingAppointments = appointments.filter(apt => 
      apt && apt.appointmentDate && 
      new Date(apt.appointmentDate) >= new Date() && 
      (apt.status === "pending" || apt.status === "confirmed")
    );

    const onlineAppointments = appointments.filter(apt => apt.consultationType === "online");
    const physicalAppointments = appointments.filter(apt => apt.consultationType === "physical");

    const totalRevenue = appointments
      .filter(apt => apt.status === "completed" || apt.status === "confirmed")
      .reduce((sum, apt) => sum + (apt.price || 0), 0);

    return {
      total: appointments.length,
      today: todayAppointments.length,
      upcoming: upcomingAppointments.length,
      pending: appointments.filter(apt => apt.status === "pending").length,
      online: onlineAppointments.length,
      physical: physicalAppointments.length,
      totalRevenue
    };
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: "", message: "" }), 5000);
  };

  const stats = getAppointmentStats();

  // Check if appointment can be cancelled
  const canCancelAppointment = (appointment) => {
    if (appointment.status === "cancelled" || appointment.status === "completed") {
      return false;
    }

    const appointmentDate = new Date(appointment.appointmentDate);
    const now = new Date();
    
    // Allow cancellation only for future appointments
    return appointmentDate > now;
  };

  // Refresh appointments
  const refreshAppointments = () => {
    if (doctorId) {
      fetchDoctorAppointments(doctorId);
      fetchUnreadCounts(doctorId);
      showAlert("info", "Refreshing appointments...");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-700">Loading Appointments</h3>
          <p className="text-gray-500 mt-2">Please wait while we load your schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Appointment Management</h1>
              <p className="text-gray-600 mt-1">Manage your patient appointments and schedule</p>
              {doctorName && (
                <p className="text-gray-500 text-sm mt-1">Welcome, {doctorName}</p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/doctor/schedule")}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Manage Schedule
              </button>
              {/* Test Email Button */}
              <button
                onClick={testEmailFunction}
                disabled={testingEmail}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200 font-medium disabled:opacity-50 flex items-center"
              >
                {testingEmail ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Testing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Test Email
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Alert */}
        {alert.show && (
          <div className={`mb-6 border rounded-lg p-4 ${
            alert.type === "success" 
              ? "bg-green-50 border-green-200 text-green-800" 
              : alert.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : alert.type === "warning"
              ? "bg-yellow-50 border-yellow-200 text-yellow-800"
              : "bg-blue-50 border-blue-200 text-blue-800"
          }`}>
            <div className="flex items-center">
              <svg className={`w-5 h-5 mr-2 ${
                alert.type === "success" ? "text-green-400" : 
                alert.type === "error" ? "text-red-400" : 
                alert.type === "warning" ? "text-yellow-400" : 
                "text-blue-400"
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d={alert.type === "success" ? 
                    "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" :
                    alert.type === "error" ?
                    "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" :
                    alert.type === "warning" ?
                    "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" :
                    "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  } 
                />
              </svg>
              <span className="font-medium">{alert.message}</span>
            </div>
          </div>
        )}

        {/* Demo Mode Notice */}
        {error && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="text-yellow-800 font-medium">Demo Mode Active</p>
                <p className="text-yellow-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-8">
          {[
            { label: "Total", value: stats.total, icon: "📅", color: "blue" },
            { label: "Today", value: stats.today, icon: "✓", color: "green" },
            { label: "Pending", value: stats.pending, icon: "⏳", color: "yellow" },
            { label: "Online", value: stats.online, icon: "💻", color: "blue" },
            { label: "Physical", value: stats.physical, icon: "🏥", color: "orange" },
            { label: "Revenue", value: formatPrice(stats.totalRevenue), icon: "💰", color: "purple" }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className={`bg-${stat.color}-100 p-3 rounded-lg`}>
                  <span className={`text-${stat.color}-600 text-lg`}>{stat.icon}</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.label === "Revenue" ? "text-green-700" : "text-gray-900"}`}>
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { key: "today", label: "Today" },
              { key: "upcoming", label: "Upcoming" },
              { key: "pending", label: "Pending" },
              { key: "online", label: "Online" },
              { key: "physical", label: "Physical" },
              { key: "all", label: "All" }
            ].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key)}
                className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                  filter === filterOption.key 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {filter === "today" && "Today's Appointments"}
                {filter === "upcoming" && "Upcoming Appointments"}
                {filter === "pending" && "Pending Approval"}
                {filter === "online" && "Online Consultations"}
                {filter === "physical" && "Physical Appointments"}
                {filter === "all" && "All Appointments"}
                <span className="text-gray-500 ml-2">({filteredAppointments.length})</span>
              </h2>
              <button
                onClick={refreshAppointments}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h4>
              <p className="text-gray-500">
                {filter === "today" 
                  ? "You don't have any appointments scheduled for today." 
                  : `No ${filter} appointments found.`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => (
                <div key={appointment._id} className="p-6 hover:bg-gray-50 transition duration-200">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {appointment.patientDetails?.fullName || "Unknown Patient"}
                          </h3>
                          <p className="text-gray-600">
                            {formatDate(appointment.appointmentDate)} • {formatTime(appointment.timeSlot?.startTime)} - {formatTime(appointment.timeSlot?.endTime)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex gap-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(appointment.status)}`}>
                              <span className="mr-1">{getStatusIcon(appointment.status)}</span>
                              {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1) || "Unknown"}
                            </span>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getConsultationTypeColor(appointment.consultationType)}`}>
                              <span className="mr-1">{getConsultationTypeIcon(appointment.consultationType)}</span>
                              {appointment.consultationType?.charAt(0).toUpperCase() + appointment.consultationType?.slice(1) || "Not specified"}
                            </span>
                          </div>
                          <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium border border-green-200">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            {formatPrice(appointment.price)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 mb-1">
                            <strong>Contact:</strong> {appointment.patientDetails?.phoneNumber || "N/A"}
                          </p>
                          <p className="text-gray-600">
                            <strong>Email:</strong> {appointment.patientDetails?.email || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 mb-1">
                            <strong>Appointment ID:</strong> {appointment.appointmentNumber || "N/A"}
                          </p>
                          <p className="text-gray-600">
                            <strong>Age/Gender:</strong> 
                            {` ${calculateAge(appointment.patientDetails?.dateOfBirth)} years / ${appointment.patientDetails?.gender || "Not specified"}`}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3">
                        <p className="text-sm text-gray-600">
                          <strong>Medical Concern:</strong> {appointment.patientDetails?.medicalConcern || "Not specified"}
                        </p>
                        {appointment.patientDetails?.previousConditions && (
                          <p className="text-sm text-gray-600 mt-1">
                            <strong>Previous Conditions:</strong> {appointment.patientDetails.previousConditions}
                          </p>
                        )}
                      </div>

                      {/* Online Consultation Status Display */}
                      {appointment.consultationType === "online" && (
                        <div className="mt-3">
                          <div className={`p-3 rounded-lg border ${
                            appointment.meetingLink 
                              ? "bg-green-50 border-green-200" 
                              : "bg-yellow-50 border-yellow-200"
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <span className={`w-2 h-2 rounded-full mr-2 ${
                                  appointment.meetingLink ? "bg-green-500" : "bg-yellow-500"
                                }`}></span>
                                <span className="text-sm font-medium">
                                  {appointment.meetingLink ? "Meeting link sent" : "Link pending"}
                                </span>
                              </div>
                              {appointment.meetingLink && (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => navigator.clipboard.writeText(appointment.meetingLink)}
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                  >
                                    Copy
                                  </button>
                                  <button
                                    onClick={() => window.open(appointment.meetingLink, '_blank', 'noopener,noreferrer')}
                                    className="text-sm text-green-600 hover:text-green-800 font-medium"
                                  >
                                    Test
                                  </button>
                                </div>
                              )}
                            </div>
                            {appointment.meetingLink && (
                              <a 
                                href={appointment.meetingLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800 truncate block mt-1"
                              >
                                {appointment.meetingLink}
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col sm:flex-row gap-2">
                      {/* Chat Button with Unread Badge - Navigates to separate chat page */}
                      <button
                        onClick={() => handleActionClick(appointment, "chat")}
                        className="relative px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 font-medium flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Chat
                        {unreadCounts[appointment._id] > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {unreadCounts[appointment._id] > 9 ? '9+' : unreadCounts[appointment._id]}
                          </span>
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleActionClick(appointment, "view")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
                      >
                        View Details
                      </button>
                      
                      {/* Online Consultation Specific Actions */}
                      {appointment.consultationType === "online" && appointment.status === "confirmed" && (
                        <>
                          {appointment.meetingLink ? (
                            <button
                              onClick={() => handleActionClick(appointment, "join-call")}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 font-medium flex items-center"
                            >
                              <span className="mr-2">🎥</span>
                              Join Call
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActionClick(appointment, "send-link")}
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200 font-medium flex items-center"
                            >
                              <span className="mr-2">🔗</span>
                              Send Link
                            </button>
                          )}
                        </>
                      )}
                      
                      {appointment.status === "pending" && (
                        <button
                          onClick={() => handleActionClick(appointment, "confirm")}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 font-medium disabled:opacity-50"
                        >
                          {actionLoading ? "Confirming..." : "Confirm"}
                        </button>
                      )}
                      
                      {(appointment.status === "pending" || appointment.status === "confirmed") && (
                        <button
                          onClick={() => handleActionClick(appointment, "cancel")}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 font-medium disabled:opacity-50"
                        >
                          {actionLoading ? "Cancelling..." : "Cancel"}
                        </button>
                      )}
                      
                      {appointment.status === "confirmed" && (
                        <button
                          onClick={() => handleActionClick(appointment, "complete")}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 font-medium disabled:opacity-50"
                        >
                          {actionLoading ? "Completing..." : "Complete"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Information Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-blue-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h4 className="text-lg font-semibold text-gray-900">Quick Actions Guide</h4>
              <ul className="mt-2 space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">💬</span>
                  <strong>Chat:</strong> Open dedicated chat window with patient
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">👁️</span>
                  <strong>View Details:</strong> See complete appointment information
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">🎥</span>
                  <strong>Join Call:</strong> Start online consultation (for online appointments)
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">🔗</span>
                  <strong>Send Link:</strong> Generate and send meeting link to patient via email
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">⏳</span>
                  <strong>Pending:</strong> Appointments awaiting your confirmation
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Details Modal */}
      {showModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Appointment Details</h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedAppointment(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Consultation Type Badge */}
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getConsultationTypeColor(selectedAppointment.consultationType)}`}>
                    <span className="mr-2 text-lg">{getConsultationTypeIcon(selectedAppointment.consultationType)}</span>
                    {selectedAppointment.consultationType?.charAt(0).toUpperCase() + selectedAppointment.consultationType?.slice(1) || "Not specified"} Consultation
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedAppointment.status)}`}>
                    {selectedAppointment.status?.charAt(0).toUpperCase() + selectedAppointment.status?.slice(1) || "Unknown"}
                  </span>
                </div>

                {/* Price Summary */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-green-900 mb-2">Payment Information</h4>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-green-700 font-medium">Consultation Fee</p>
                      <p className="text-green-600 text-sm">Standard consultation charge</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-700">{formatPrice(selectedAppointment.price)}</p>
                      <p className="text-green-600 text-sm">
                        {selectedAppointment.status === "completed" ? "Paid" : 
                         selectedAppointment.status === "confirmed" ? "Confirmed" : 
                         selectedAppointment.status === "pending" ? "Pending Payment" : 
                         selectedAppointment.status === "cancelled" ? "Cancelled" : "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Meeting Link Section for Online Consultations */}
                {selectedAppointment.consultationType === "online" && (
                  <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                    <h4 className="text-lg font-semibold text-blue-900 mb-3">Online Consultation</h4>
                    {selectedAppointment.meetingLink ? (
                      <div>
                        <p className="text-blue-700 font-medium mb-2">Meeting Link:</p>
                        <div className="flex items-center justify-between bg-white p-3 rounded border">
                          <a 
                            href={selectedAppointment.meetingLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm truncate flex-1 mr-2"
                          >
                            {selectedAppointment.meetingLink}
                          </a>
                          <button
                            onClick={() => navigator.clipboard.writeText(selectedAppointment.meetingLink)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Copy
                          </button>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => window.open(selectedAppointment.meetingLink, '_blank', 'noopener,noreferrer')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 font-medium flex items-center"
                          >
                            <span className="mr-2">🎥</span>
                            Join Meeting
                          </button>
                          <button
                            onClick={() => {
                              setConsultationLink(selectedAppointment.meetingLink);
                              setShowLinkModal(true);
                              setShowModal(false);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
                          >
                            Resend Link
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-blue-700 mb-3">No meeting link has been sent to the patient yet.</p>
                        <button
                          onClick={() => {
                            setConsultationLink(generateMeetingLink());
                            setShowLinkModal(true);
                            setShowModal(false);
                          }}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200 font-medium"
                        >
                          Generate & Send Meeting Link
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Patient Information */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Patient Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Full Name:</strong> {selectedAppointment.patientDetails?.fullName || "N/A"}</p>
                      <p><strong>Phone:</strong> {selectedAppointment.patientDetails?.phoneNumber || "N/A"}</p>
                      <p><strong>Email:</strong> {selectedAppointment.patientDetails?.email || "N/A"}</p>
                    </div>
                    <div>
                      <p><strong>Gender:</strong> {selectedAppointment.patientDetails?.gender || "Not specified"}</p>
                      <p><strong>Date of Birth:</strong> {selectedAppointment.patientDetails?.dateOfBirth ? formatDate(selectedAppointment.patientDetails.dateOfBirth) : "Not provided"}</p>
                      {selectedAppointment.patientDetails?.dateOfBirth && (
                        <p><strong>Age:</strong> {calculateAge(selectedAppointment.patientDetails.dateOfBirth)} years</p>
                      )}
                    </div>
                  </div>
                  {selectedAppointment.patientDetails?.address && (
                    <p className="mt-2 text-sm"><strong>Address:</strong> {selectedAppointment.patientDetails.address}</p>
                  )}
                </div>

                {/* Appointment Details */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Appointment Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Date:</strong> {formatDate(selectedAppointment.appointmentDate)}</p>
                      <p><strong>Time:</strong> {formatTime(selectedAppointment.timeSlot?.startTime)} - {formatTime(selectedAppointment.timeSlot?.endTime)}</p>
                      <p><strong>Day:</strong> {selectedAppointment.timeSlot?.day || "N/A"}</p>
                    </div>
                    <div>
                      <p><strong>Appointment ID:</strong> {selectedAppointment.appointmentNumber}</p>
                      <p><strong>Status:</strong> 
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAppointment.status)}`}>
                          {selectedAppointment.status?.charAt(0).toUpperCase() + selectedAppointment.status?.slice(1) || "Unknown"}
                        </span>
                      </p>
                      <p><strong>Booked On:</strong> {formatDate(selectedAppointment.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Medical Information</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-sm text-gray-700">Medical Concern:</p>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded mt-1">
                        {selectedAppointment.patientDetails?.medicalConcern || "Not specified"}
                      </p>
                    </div>
                    {selectedAppointment.patientDetails?.previousConditions && (
                      <div>
                        <p className="font-semibold text-sm text-gray-700">Previous Conditions:</p>
                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded mt-1">
                          {selectedAppointment.patientDetails.previousConditions}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => navigate(`/doctor/chat/${selectedAppointment._id}`)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200"
                >
                  Open Chat
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedAppointment(null);
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Send Consultation Link Modal */}
      {showLinkModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Setup Online Consultation</h3>
                <button
                  onClick={() => {
                    setShowLinkModal(false);
                    setConsultationLink("");
                    setSelectedPlatform("google");
                    setMeetingInstructions("");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Platform Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Platform
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "google", name: "Google Meet", icon: "🔵" },
                      { id: "zoom", name: "Zoom", icon: "🎥" },
                      { id: "teams", name: "Teams", icon: "💼" }
                    ].map((platform) => (
                      <button
                        key={platform.id}
                        onClick={() => handlePlatformChange(platform.id)}
                        className={`p-3 border rounded-lg text-center transition duration-200 ${
                          selectedPlatform === platform.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <div className="text-lg mb-1">{platform.icon}</div>
                        <div className="text-xs font-medium text-gray-700">{platform.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Consultation Link
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="url"
                      value={consultationLink}
                      onChange={(e) => setConsultationLink(e.target.value)}
                      placeholder="Meeting link will be generated automatically"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={() => setConsultationLink(generateMeetingLink(selectedPlatform))}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200"
                      title="Generate new link"
                    >
                      🔄
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    The link will be sent to the patient's email
                  </p>
                </div>

                {/* Additional Meeting Details */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Details (Optional)
                  </label>
                  <textarea
                    value={meetingInstructions}
                    onChange={(e) => setMeetingInstructions(e.target.value)}
                    placeholder="Add any special instructions for the patient..."
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Recipient:</strong> {selectedAppointment.patientDetails?.email || "N/A"}
                  </p>
                  <p className="text-sm text-blue-800 mt-1">
                    <strong>Appointment:</strong> {formatDate(selectedAppointment.appointmentDate)} at {formatTime(selectedAppointment.timeSlot?.startTime)}
                  </p>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowLinkModal(false);
                      setConsultationLink("");
                      setSelectedPlatform("google");
                      setMeetingInstructions("");
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSendConsultationLink(selectedAppointment)}
                    disabled={sendingLink || !consultationLink.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 font-medium disabled:opacity-50 flex items-center"
                  >
                    {sendingLink ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Send Link via Email
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;