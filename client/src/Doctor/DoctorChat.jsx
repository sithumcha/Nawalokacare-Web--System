import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const DoctorChat = () => {
  const navigate = useNavigate();
  const { appointmentId } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPolling, setIsPolling] = useState(false);
  const [lastMessageId, setLastMessageId] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const messagesEndRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  // Initialize component
  useEffect(() => {
    const doctorId = localStorage.getItem("doctorId");
    const doctorName = localStorage.getItem("doctorName");
    
    if (!doctorId) {
      navigate("/doctor/login");
      return;
    }
    
    setDoctor({
      id: doctorId,
      name: doctorName || "Dr. Apsara Chanuka"
    });
    
    if (appointmentId) {
      loadAppointmentAndMessages(appointmentId, doctorId);
    } else {
      navigate("/doctor/appointments");
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [navigate, appointmentId]);

  // Load appointment and messages
  const loadAppointmentAndMessages = async (aptId, doctorId) => {
    try {
      setIsLoading(true);
      
      // Load appointment details
      const appointmentResponse = await axios.get(
        `http://localhost:5000/api/appointments/${aptId}`
      );
      
      if (appointmentResponse.data) {
        setAppointment(appointmentResponse.data);
        setPatientDetails(appointmentResponse.data.patientDetails || {});
      }

      // Load messages
      const messagesResponse = await axios.get(
        `http://localhost:5000/api/chat/messages/${aptId}`,
        { params: { userId: doctorId } }
      );

      if (messagesResponse.data.success) {
        const fetchedMessages = messagesResponse.data.messages || [];
        setMessages(fetchedMessages);
        
        if (fetchedMessages.length > 0) {
          setLastMessageId(fetchedMessages[fetchedMessages.length - 1]._id);
        }
        
        // Mark messages as read
        await markMessagesAsRead(aptId, doctorId);
      }

      // Start polling for new messages
      startPolling(aptId, doctorId);

    } catch (error) {
      console.error("Error loading chat:", error);
      setError("Failed to load chat. Please try again.");
      
      // Fallback to demo data
      setAppointment(generateMockAppointment());
      setPatientDetails(generateMockPatient());
      setMessages(generateSampleMessages());
    } finally {
      setIsLoading(false);
      setTimeout(() => scrollToBottom(), 100);
    }
  };

  // Start polling for new messages
  const startPolling = useCallback((appointmentId, doctorId) => {
    // Clear any existing polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    setIsPolling(true);
    
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const params = { userId: doctorId, userType: 'doctor' };
        if (lastMessageId) {
          params.lastMessageId = lastMessageId;
        } else {
          params.lastCheck = Date.now() - 10000; // Last 10 seconds
        }
        
        const response = await axios.get(
          `http://localhost:5000/api/chat/poll/${appointmentId}`,
          { params }
        );
        
        if (response.data.success && response.data.hasNew) {
          const newMessages = response.data.messages || [];
          if (newMessages.length > 0) {
            setMessages(prev => [...prev, ...newMessages]);
            setLastMessageId(newMessages[newMessages.length - 1]._id);
            scrollToBottom();
            
            // Mark as read
            await markMessagesAsRead(appointmentId, doctorId);
          }
        }
      } catch (error) {
        console.error('Error polling for messages:', error);
      }
    }, 3000); // Poll every 3 seconds
  }, [lastMessageId]);

  // Stop polling
  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsPolling(false);
  };

  // Mark messages as read
  const markMessagesAsRead = async (appointmentId, doctorId) => {
    try {
      await axios.post('http://localhost:5000/api/chat/mark-read', {
        appointmentId,
        userId: doctorId,
        userType: 'doctor'
      });
      
      // Update unread counts globally
      await fetchUnreadCounts(doctorId);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Fetch unread counts
  const fetchUnreadCounts = async (doctorId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/chat/unread/${doctorId}/doctor`
      );
      
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

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !appointment || !doctor) return;

    const messageData = {
      appointmentId: appointment._id,
      senderId: doctor.id,
      senderType: "doctor",
      receiverId: appointment.patientDetails?._id || "patient_id",
      receiverType: "patient",
      content: newMessage.trim()
    };

    setSendingMessage(true);
    try {
      // Optimistically add message to UI
      const tempMessage = {
        ...messageData,
        _id: `temp_${Date.now()}`,
        timestamp: new Date().toISOString(),
        read: false
      };
      
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage("");
      scrollToBottom();

      // Send message via HTTP
      const response = await axios.post(
        'http://localhost:5000/api/chat/send',
        messageData
      );

      if (response.data.success) {
        // Replace temp message with real message
        setMessages(prev => 
          prev.map(msg => 
            msg._id === tempMessage._id ? response.data.data : msg
          )
        );
        
        // Update last message ID
        setLastMessageId(response.data.data._id);
      } else {
        throw new Error('Failed to send message');
      }

    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => !msg._id?.startsWith('temp_')));
    } finally {
      setSendingMessage(false);
    }
  };

  // Generate mock data for demo
  const generateMockAppointment = () => ({
    _id: appointmentId,
    appointmentNumber: "APT-202412-0001",
    doctorId: doctor?.id || "doctor_123",
    doctorName: doctor?.name || "Dr. Apsara Chanuka",
    doctorSpecialization: "Neurology",
    patientDetails: {
      _id: "patient_123",
      fullName: "John Doe"
    },
    appointmentDate: new Date().toISOString(),
    status: "confirmed",
    consultationType: "online"
  });

  const generateMockPatient = () => ({
    _id: "patient_123",
    fullName: "John Doe",
    email: "john@example.com",
    phoneNumber: "+1234567890",
    dateOfBirth: "1985-03-15",
    gender: "male",
    address: "123 Main Street, City, State",
    medicalConcern: "Headaches and migraine consultation",
    previousConditions: "Occasional migraines"
  });

  const generateSampleMessages = () => [
    {
      _id: "msg_1",
      appointmentId: appointmentId,
      senderId: "patient_123",
      senderType: "patient",
      receiverId: doctor?.id || "doctor_123",
      receiverType: "doctor",
      content: "Hello Doctor, I have a question about my appointment",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: true
    },
    {
      _id: "msg_2",
      appointmentId: appointmentId,
      senderId: doctor?.id || "doctor_123",
      senderType: "doctor",
      receiverId: "patient_123",
      receiverType: "patient",
      content: "How can I help you today?",
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      read: true
    },
    {
      _id: "msg_3",
      appointmentId: appointmentId,
      senderId: "patient_123",
      senderType: "patient",
      receiverId: doctor?.id || "doctor_123",
      receiverType: "doctor",
      content: "I'm feeling better, but still have some headaches",
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      read: true
    }
  ];

  // Helper functions
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    try {
      return new Date(timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
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

  const handleBackToAppointments = () => {
    navigate("/doctor/appointments");
  };

  const handleCallPatient = () => {
    if (patientDetails?.phoneNumber) {
      window.open(`tel:${patientDetails.phoneNumber}`);
    } else {
      alert("Patient's contact number is not available");
    }
  };

  const handleViewAppointmentDetails = () => {
    if (appointment) {
      navigate(`/doctor/appointments/${appointment._id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-700">Loading Chat</h3>
          <p className="text-gray-500 mt-2">Please wait while we load your conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={handleBackToAppointments}
                className="mr-4 p-2 rounded-full hover:bg-gray-100"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Chat with Patient</h1>
                <p className="text-gray-600 text-sm">
                  Appointment: {appointment?.appointmentNumber || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p className="font-semibold text-gray-900">{doctor?.name || "Doctor"}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
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

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Patient Info & Details Sidebar */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
              {/* Patient Profile */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-blue-600">👤</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">
                      {patientDetails?.fullName || "Patient"}
                    </h3>
                    <p className="text-gray-600">
                      {patientDetails?.gender || "Not specified"} • {calculateAge(patientDetails?.dateOfBirth)} years
                    </p>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Appointment Status:</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        appointment?.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        appointment?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        appointment?.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {appointment?.status?.charAt(0).toUpperCase() + appointment?.status?.slice(1) || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {patientDetails?.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {patientDetails.email}
                    </div>
                  )}
                  {patientDetails?.phoneNumber && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {patientDetails.phoneNumber}
                    </div>
                  )}
                </div>
              </div>

              {/* Appointment Details */}
              <div className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Appointment Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{formatDate(appointment?.appointmentDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">
                      {formatTime(appointment?.timeSlot?.startTime)} - {formatTime(appointment?.timeSlot?.endTime)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">
                      {appointment?.consultationType === 'online' ? 'Online Consultation' : 
                       appointment?.consultationType === 'physical' ? 'Physical Visit' : 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Appointment ID:</span>
                    <span className="font-medium">{appointment?.appointmentNumber || 'N/A'}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 space-y-3">
                  <button
                    onClick={handleCallPatient}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 font-medium flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Call Patient
                  </button>
                  <button
                    onClick={handleViewAppointmentDetails}
                    className="w-full px-4 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition duration-200 font-medium"
                  >
                    View Full Details
                  </button>
                </div>

                {/* Chat Status */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${isPolling ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm font-medium">
                        {isPolling ? 'Live chat active' : 'Chat disconnected'}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Messages auto-refresh every 3 seconds
                  </p>
                </div>
              </div>
            </div>

            {/* Medical Information */}
            {patientDetails?.medicalConcern && (
              <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Medical Information</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Primary Concern:</p>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded mt-1">
                      {patientDetails.medicalConcern}
                    </p>
                  </div>
                  {patientDetails.previousConditions && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Previous Conditions:</p>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded mt-1">
                        {patientDetails.previousConditions}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Prescription Templates */}
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Quick Responses</h4>
              <div className="space-y-2">
                <button
                  onClick={() => setNewMessage("Please take your medication as prescribed.")}
                  className="w-full text-left px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition duration-200 text-sm"
                >
                  Take medication as prescribed
                </button>
                <button
                  onClick={() => setNewMessage("Please schedule a follow-up appointment.")}
                  className="w-full text-left px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition duration-200 text-sm"
                >
                  Schedule follow-up
                </button>
                <button
                  onClick={() => setNewMessage("Please get the recommended tests done.")}
                  className="w-full text-left px-3 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition duration-200 text-sm"
                >
                  Get recommended tests
                </button>
              </div>
            </div>
          </div>

          {/* Chat Window */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-200px)]">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-lg text-blue-600">👤</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-900">
                      {patientDetails?.fullName || "Patient"}
                    </h3>
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${isPolling ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-xs text-gray-500">
                        {isPolling ? 'Online' : 'Offline'} • Patient
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCallPatient}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                    title="Call Patient"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                    title="Print Chat"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No messages yet</h3>
                    <p className="text-gray-500 text-center max-w-md">
                      Start the conversation with your patient. Discuss treatment plans, answer questions, or provide medical advice.
                    </p>
                    <button
                      onClick={() => setNewMessage("Hello, how can I help you today?")}
                      className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition duration-200 text-sm font-medium"
                    >
                      Use sample message
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Date Separator */}
                    <div className="text-center">
                      <span className="inline-block px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                        {formatDate(appointment?.appointmentDate)}
                      </span>
                    </div>

                    {messages.map((message) => (
                      <div
                        key={message._id}
                        className={`flex ${message.senderType === "doctor" ? "justify-end" : "justify-start"}`}
                      >
                        <div className="max-w-xs lg:max-w-md">
                          <div
                            className={`rounded-2xl px-4 py-2 ${
                              message.senderType === "doctor"
                                ? "bg-blue-600 text-white rounded-br-none"
                                : "bg-gray-200 text-gray-800 rounded-bl-none"
                            }`}
                          >
                            <p className="text-sm break-words">{message.content}</p>
                            <div
                              className={`flex justify-between items-center mt-1 ${
                                message.senderType === "doctor"
                                  ? "text-blue-200"
                                  : "text-gray-500"
                              }`}
                            >
                              <span className="text-xs">
                                {formatTime(message.timestamp)}
                              </span>
                              {message._id?.startsWith('temp_') && (
                                <span className="text-xs ml-2">Sending...</span>
                              )}
                            </div>
                          </div>
                          {message.senderType === "doctor" && (
                            <p className="text-xs text-blue-600 mt-1 ml-1 text-right">
                              You
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex space-x-2">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Type your message here... Press Enter to send, Shift+Enter for new line"
                    rows="2"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none resize-none"
                    disabled={sendingMessage}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sendingMessage || !newMessage.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[44px]"
                  >
                    {sendingMessage ? (
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    Medical conversations are private and secure
                  </p>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${isPolling ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-xs text-gray-500">
                      Auto-refresh: {isPolling ? 'ON' : 'OFF'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setNewMessage("How are you feeling today?")}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200 text-sm"
              >
                How are you feeling?
              </button>
              <button
                onClick={() => setNewMessage("Are you experiencing any side effects?")}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200 text-sm"
              >
                Any side effects?
              </button>
              <button
                onClick={() => setNewMessage("Please take your medication with food.")}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200 text-sm"
              >
                Take with food
              </button>
              <button
                onClick={() => setNewMessage("When is your next appointment?")}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200 text-sm"
              >
                Next appointment?
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Helper function to calculate age
  function calculateAge(dateOfBirth) {
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
  }
};

export default DoctorChat;