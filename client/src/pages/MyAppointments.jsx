




// // src/pages/MyAppointments.jsx
// import { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const MyAppointments = () => {
//   const navigate = useNavigate();
//   const [appointments, setAppointments] = useState([]);
//   const [filteredAppointments, setFilteredAppointments] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [filter, setFilter] = useState("all");
//   const [cancellingAppointment, setCancellingAppointment] = useState(null);
//   const [cancelReason, setCancelReason] = useState("");
//   const [showCancelModal, setShowCancelModal] = useState(false);
//   const [alert, setAlert] = useState({ show: false, type: "", message: "" });
//   const [unreadCounts, setUnreadCounts] = useState({}); // Track unread messages per appointment

//   // ✅ CORRECTED: Get logged in user ID from localStorage - Multiple fallbacks
//   const getCurrentUserInfo = () => {
//     // Try multiple possible keys to find user ID
//     const currentUserId = localStorage.getItem('currentUserId');
//     const userId = localStorage.getItem('userId');
//     const userData = localStorage.getItem('user');
    
//     let finalUserId = currentUserId || userId;
    
//     // If still no user ID, try to parse from user object
//     if (!finalUserId && userData) {
//       try {
//         const user = JSON.parse(userData);
//         finalUserId = user._id || user.id;
//       } catch (error) {
//         console.error("Error parsing user data:", error);
//       }
//     }
    
//     // Get user name
//     const userName = localStorage.getItem('userName') || 
//                     (userData ? JSON.parse(userData).name : null) || 
//                     "User";

//     console.log("🔍 User ID Debug:", {
//       currentUserId,
//       userId,
//       finalUserId,
//       userData: userData ? JSON.parse(userData) : null,
//       userName
//     });

//     return {
//       userId: finalUserId,
//       userName: userName
//     };
//   };

//   const { userId: loggedInUserId, userName: loggedInUserName } = getCurrentUserInfo();

//   useEffect(() => {
//     console.log("🔄 Component mounted - Checking authentication");
//     console.log("📝 Final User ID:", loggedInUserId);
//     console.log("🔐 Token exists:", !!localStorage.getItem('token'));
    
//     if (!loggedInUserId) {
//       console.log("❌ No user ID found - showing login required");
//       setError("Please login to view your appointments");
//       setIsLoading(false);
//       return;
//     }
    
//     console.log("✅ User authenticated, fetching appointments...");
//     fetchAppointments();
//   }, [loggedInUserId]);

//   useEffect(() => {
//     filterAppointments();
//   }, [appointments, filter]);

//   // Fetch unread message counts for all appointments
//   const fetchUnreadCounts = async () => {
//     if (!loggedInUserId) return;

//     try {
//       const response = await axios.get(
//         `http://localhost:5000/api/chat/unread/${loggedInUserId}/patient`
//       );
      
//       if (response.data.success) {
//         const counts = {};
//         response.data.chats?.forEach(chat => {
//           counts[chat.appointmentId] = chat.unreadCount;
//         });
//         setUnreadCounts(counts);
//       }
//     } catch (error) {
//       console.error('Error fetching unread counts:', error);
//     }
//   };

//   const fetchAppointments = async () => {
//     try {
//       setIsLoading(true);
//       setError("");

//       console.log("📡 Fetching appointments for user:", loggedInUserId);

//       const token = localStorage.getItem('token');
//       if (!token) {
//         throw new Error("No authentication token found");
//       }

//       const response = await axios.get(
//         `http://localhost:5000/api/appointments/user/${loggedInUserId}`,
//         {
//           timeout: 10000,
//           headers: {
//             'Authorization': `Bearer ${token}`
//           }
//         }
//       );

//       console.log("✅ Appointments API Response:", response.data);

//       if (response.data.success) {
//         const userAppointments = response.data.appointments || [];
//         setAppointments(userAppointments);
        
//         // Fetch unread counts after appointments are loaded
//         await fetchUnreadCounts();
        
//         if (userAppointments.length === 0) {
//           console.log("ℹ️ No appointments found for this user");
//         } else {
//           console.log(`📅 Found ${userAppointments.length} appointments`);
//         }
//       } else {
//         throw new Error(response.data.error || "Failed to fetch appointments");
//       }
//     } catch (error) {
//       console.error("❌ Error fetching appointments:", error);
      
//       // Handle authentication errors
//       if (error.response?.status === 401) {
//         setError("Session expired. Please login again.");
//         // Clear invalid user data
//         localStorage.removeItem('token');
//         localStorage.removeItem('currentUserId');
//         localStorage.removeItem('userId');
//         localStorage.removeItem('user');
//         localStorage.removeItem('userName');
//         setTimeout(() => navigate("/login"), 2000);
//         return;
//       }
      
//       setError(
//         error.response?.data?.error ||
//         error.message ||
//         "Failed to load appointments. Please try again."
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // CANCEL APPOINTMENT FUNCTION
//   const cancelAppointment = async (appointmentId, reason) => {
//     try {
//       setCancellingAppointment(appointmentId);
      
//       console.log(`🗑️ Cancelling appointment ${appointmentId} with reason: ${reason}`);
      
//       const userId = loggedInUserId; // Use the corrected user ID
//       const token = localStorage.getItem('token');
      
//       if (!token) {
//         throw new Error("No authentication token found");
//       }

//       const cancelData = {
//         userId: userId,
//         cancellationReason: reason
//       };

//       const response = await axios.put(
//         `http://localhost:5000/api/appointments/${appointmentId}/cancel`,
//         cancelData,
//         {
//           timeout: 10000,
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`
//           }
//         }
//       );

//       console.log("✅ Cancel API Response:", response.data);

//       if (response.data.success) {
//         // Update local state
//         setAppointments(prevAppointments =>
//           prevAppointments.map(apt =>
//             apt._id === appointmentId
//               ? { 
//                   ...apt, 
//                   status: "cancelled",
//                   cancellationReason: reason,
//                   cancelledAt: new Date().toISOString(),
//                   ...response.data.appointment
//                 }
//               : apt
//           )
//         );

//         showAlert("success", "Appointment cancelled successfully!");
//         closeCancelModal();
        
//       } else {
//         throw new Error(response.data.error || "Failed to cancel appointment");
//       }
//     } catch (error) {
//       console.error("❌ Error cancelling appointment:", error);
      
//       let errorMessage = "Failed to cancel appointment. ";
      
//       if (error.response?.data?.error) {
//         errorMessage += error.response.data.error;
//       } else if (error.response?.status === 403) {
//         errorMessage += "You are not authorized to cancel this appointment.";
//       } else if (error.response?.status === 404) {
//         errorMessage += "Appointment not found.";
//       } else if (error.response?.status === 400) {
//         errorMessage += error.response.data.error || "Bad request.";
//       } else if (error.code === 'ECONNABORTED') {
//         errorMessage += "Request timeout. Please try again.";
//       } else if (error.message.includes("Network Error")) {
//         errorMessage += "Cannot connect to server. Please check if the server is running.";
//       } else {
//         errorMessage += error.message;
//       }
      
//       showAlert("error", errorMessage);
//     } finally {
//       setCancellingAppointment(null);
//     }
//   };

//   // Navigate to chat with doctor
//   const navigateToChat = (appointment) => {
//     if (!appointment?._id) {
//       showAlert("error", "Cannot open chat: Invalid appointment");
//       return;
//     }

//     // Check if appointment is active (not cancelled)
//     if (appointment.status === "cancelled") {
//       showAlert("error", "Cannot chat for cancelled appointments");
//       return;
//     }

//     if (appointment.status === "completed") {
//       showAlert("info", "This appointment is completed. Chat may not be available.");
//     }

//     navigate(`/chat/${appointment._id}`);
//   };

//   // CANCEL MODAL HANDLERS
//   const openCancelModal = (appointment) => {
//     // Basic validation
//     if (appointment.status === "cancelled") {
//       showAlert("error", "This appointment is already cancelled.");
//       return;
//     }

//     if (appointment.status === "completed") {
//       showAlert("error", "This appointment has already been completed.");
//       return;
//     }

//     // Check if appointment is in the past
//     const appointmentDate = new Date(appointment.appointmentDate);
//     const now = new Date();
//     if (appointmentDate < now) {
//       showAlert("error", "Cannot cancel past appointments.");
//       return;
//     }

//     // Check if status allows cancellation
//     if (!["pending", "confirmed"].includes(appointment.status)) {
//       showAlert("error", `Cannot cancel appointment with status: ${appointment.status}`);
//       return;
//     }

//     setCancellingAppointment(appointment);
//     setShowCancelModal(true);
//   };

//   const closeCancelModal = () => {
//     setShowCancelModal(false);
//     setCancellingAppointment(null);
//     setCancelReason("");
//   };

//   const handleCancelConfirm = () => {
//     if (!cancelReason.trim()) {
//       showAlert("error", "Please provide a reason for cancellation.");
//       return;
//     }
//     if (cancellingAppointment && cancellingAppointment._id) {
//       cancelAppointment(cancellingAppointment._id, cancelReason);
//     }
//   };

//   const filterAppointments = () => {
//     const now = new Date();
    
//     let filtered = appointments;
    
//     switch (filter) {
//       case "upcoming":
//         filtered = appointments.filter(apt => 
//           new Date(apt.appointmentDate) >= now && 
//           apt.status !== "cancelled"
//         );
//         break;
//       case "past":
//         filtered = appointments.filter(apt => 
//           new Date(apt.appointmentDate) < now && 
//           apt.status !== "cancelled"
//         );
//         break;
//       case "cancelled":
//         filtered = appointments.filter(apt => apt.status === "cancelled");
//         break;
//       default:
//         filtered = appointments;
//     }
    
//     setFilteredAppointments(filtered);
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "Date not set";
//     return new Date(dateString).toLocaleDateString('en-US', {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     });
//   };

//   const formatTime = (timeString) => {
//     if (!timeString) return "Time not set";
//     if (timeString.includes('AM') || timeString.includes('PM')) {
//       return timeString;
//     }
//     const [hours, minutes] = timeString.split(':');
//     const hour = parseInt(hours);
//     const ampm = hour >= 12 ? 'PM' : 'AM';
//     const formattedHour = hour % 12 || 12;
//     return `${formattedHour}:${minutes} ${ampm}`;
//   };

//   // Check if appointment can be cancelled
//   const canCancelAppointment = (appointment) => {
//     if (appointment.status === "cancelled" || appointment.status === "completed") {
//       return false;
//     }

//     const appointmentDate = new Date(appointment.appointmentDate);
//     const now = new Date();
    
//     // Allow cancellation only for future appointments
//     return appointmentDate > now;
//   };

//   // Check if appointment can use chat
//   const canUseChat = (appointment) => {
//     if (!appointment?._id) return false;
    
//     // Don't show chat for cancelled appointments
//     if (appointment.status === "cancelled") return false;
    
//     // For past appointments, allow chat only if recently completed
//     if (appointment.status === "completed") {
//       const appointmentDate = new Date(appointment.appointmentDate);
//       const now = new Date();
//       const daysSinceAppointment = (now - appointmentDate) / (1000 * 60 * 60 * 24);
      
//       // Allow chat for appointments completed within last 7 days
//       return daysSinceAppointment <= 7;
//     }
    
//     // For upcoming/pending/confirmed appointments
//     return true;
//   };

//   const getStatusBadge = (status) => {
//     const statusConfig = {
//       pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", text: "Pending" },
//       confirmed: { color: "bg-green-100 text-green-800 border-green-200", text: "Confirmed" },
//       cancelled: { color: "bg-red-100 text-red-800 border-red-200", text: "Cancelled" },
//       completed: { color: "bg-blue-100 text-blue-800 border-blue-200", text: "Completed" }
//     };
    
//     const config = statusConfig[status] || statusConfig.pending;
    
//     return (
//       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
//         {config.text}
//       </span>
//     );
//   };

//   const getAppointmentStats = () => {
//     const now = new Date();
    
//     const total = appointments.length;
//     const upcoming = appointments.filter(apt => 
//       new Date(apt.appointmentDate) >= now && 
//       apt.status !== "cancelled"
//     ).length;
//     const past = appointments.filter(apt => 
//       new Date(apt.appointmentDate) < now && 
//       apt.status !== "cancelled"
//     ).length;
//     const cancelled = appointments.filter(apt => apt.status === "cancelled").length;

//     return { total, upcoming, past, cancelled };
//   };

//   const showAlert = (type, message) => {
//     setAlert({ show: true, type, message });
//     setTimeout(() => setAlert({ show: false, type: "", message: "" }), 5000);
//   };

//   const stats = getAppointmentStats();

//   // Cancel Modal Component
//   const CancelModal = () => {
//     if (!showCancelModal || !cancellingAppointment) return null;

//     const isCancelling = cancellingAppointment && typeof cancellingAppointment === 'string';

//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//         <div className="bg-white rounded-2xl max-w-md w-full p-6">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-xl font-semibold text-gray-900">Cancel Appointment</h3>
//             <button
//               onClick={closeCancelModal}
//               className="text-gray-500 hover:text-gray-700"
//               disabled={isCancelling}
//             >
//               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>

//           <div className="mb-4">
//             <p className="text-gray-700 mb-2">
//               Are you sure you want to cancel your appointment with{" "}
//               <strong>Dr. {cancellingAppointment.doctorName}</strong>?
//             </p>
//             <p className="text-sm text-gray-600 mb-4">
//               Scheduled for {formatDate(cancellingAppointment.appointmentDate)} at{" "}
//               {formatTime(cancellingAppointment.timeSlot?.startTime)}
//             </p>
//           </div>

//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Reason for cancellation <span className="text-red-500">*</span>
//             </label>
//             <textarea
//               value={cancelReason}
//               onChange={(e) => setCancelReason(e.target.value)}
//               placeholder="Please provide a reason for cancellation..."
//               rows="3"
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               required
//               disabled={isCancelling}
//             />
//           </div>

//           <div className="flex gap-3">
//             <button
//               onClick={closeCancelModal}
//               className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//               disabled={isCancelling}
//             >
//               Keep Appointment
//             </button>
//             <button
//               onClick={handleCancelConfirm}
//               disabled={!cancelReason.trim() || isCancelling}
//               className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
//             >
//               {isCancelling ? (
//                 <div className="flex items-center justify-center">
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                   Cancelling...
//                 </div>
//               ) : (
//                 "Confirm Cancellation"
//               )}
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // Debug info - remove in production
//   useEffect(() => {
//     console.log("=== LOCALSTORAGE DEBUG INFO ===");
//     console.log("currentUserId:", localStorage.getItem('currentUserId'));
//     console.log("userId:", localStorage.getItem('userId'));
//     console.log("user:", localStorage.getItem('user'));
//     console.log("userName:", localStorage.getItem('userName'));
//     console.log("token:", localStorage.getItem('token'));
//     console.log("=================================");
//   }, []);

//   if (!loggedInUserId) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
//         <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center">
//             <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 max-w-md mx-auto">
//               <svg className="w-16 h-16 text-yellow-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//               </svg>
//               <h3 className="text-xl font-semibold text-yellow-800 mb-2">Login Required</h3>
//               <p className="text-yellow-600 mb-4">Please login to view your appointments</p>
//               <button
//                 onClick={() => navigate("/login")}
//                 className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition duration-200"
//               >
//                 Go to Login
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
//         <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
//             <h3 className="text-xl font-semibold text-gray-700">Loading Your Appointments</h3>
//             <p className="text-gray-500 mt-2">Please wait while we load your appointment history...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
//         <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center">
//             <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
//               <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
//               </svg>
//               <h3 className="text-xl font-semibold text-red-800 mb-2">Error Loading Appointments</h3>
//               <p className="text-red-600 mb-4">{error}</p>
//               <div className="space-y-2">
//                 <button
//                   onClick={fetchAppointments}
//                   className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition duration-200 block w-full"
//                 >
//                   Try Again
//                 </button>
//                 <button
//                   onClick={() => navigate("/doctors")}
//                   className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200 block w-full"
//                 >
//                   Book New Appointment
//                 </button>
//                 <button
//                   onClick={() => navigate("/login")}
//                   className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition duration-200 block w-full"
//                 >
//                   Login Again
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
//       <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Alert */}
//         {alert.show && (
//           <div className={`mb-6 border rounded-lg p-4 ${
//             alert.type === "success" 
//               ? "bg-green-50 border-green-200 text-green-800" 
//               : "bg-red-50 border-red-200 text-red-800"
//           }`}>
//             <div className="flex items-center">
//               <svg className={`w-5 h-5 mr-2 ${
//                 alert.type === "success" ? "text-green-400" : "text-red-400"
//               }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
//                   d={alert.type === "success" ? 
//                     "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" :
//                     "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                   } 
//                 />
//               </svg>
//               <span className="font-medium">{alert.message}</span>
//             </div>
//           </div>
//         )}

//         {/* Header */}
//         <div className="text-center mb-8">
//           <button 
//             onClick={() => navigate(-1)}
//             className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition duration-200"
//           >
//             <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//             </svg>
//             Back
//           </button>
//           <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
//             My Appointments
//           </h1>
//           <p className="text-lg text-gray-600">
//             Welcome back, {loggedInUserName}! Manage your medical appointments
//           </p>
//           <p className="text-sm text-gray-500 mt-2">
//             Chat with your doctor directly from your appointments
//           </p>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
//           <div className="bg-white rounded-xl shadow-lg p-6 text-center">
//             <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
//             <div className="text-sm text-gray-600">Total</div>
//           </div>
//           <div className="bg-white rounded-xl shadow-lg p-6 text-center">
//             <div className="text-2xl font-bold text-green-600">{stats.upcoming}</div>
//             <div className="text-sm text-gray-600">Upcoming</div>
//           </div>
//           <div className="bg-white rounded-xl shadow-lg p-6 text-center">
//             <div className="text-2xl font-bold text-gray-600">{stats.past}</div>
//             <div className="text-sm text-gray-600">Past</div>
//           </div>
//           <div className="bg-white rounded-xl shadow-lg p-6 text-center">
//             <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
//             <div className="text-sm text-gray-600">Cancelled</div>
//           </div>
//         </div>

//         {/* Filter Buttons */}
//         <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
//           <div className="flex flex-wrap gap-2">
//             <button
//               onClick={() => setFilter("all")}
//               className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
//                 filter === "all"
//                   ? "bg-blue-600 text-white"
//                   : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//               }`}
//             >
//               All Appointments
//             </button>
//             <button
//               onClick={() => setFilter("upcoming")}
//               className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
//                 filter === "upcoming"
//                   ? "bg-green-600 text-white"
//                   : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//               }`}
//             >
//               Upcoming
//             </button>
//             <button
//               onClick={() => setFilter("past")}
//               className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
//                 filter === "past"
//                   ? "bg-blue-600 text-white"
//                   : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//               }`}
//             >
//               Past
//             </button>
//             <button
//               onClick={() => setFilter("cancelled")}
//               className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
//                 filter === "cancelled"
//                   ? "bg-red-600 text-white"
//                   : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//               }`}
//             >
//               Cancelled
//             </button>
//           </div>
//         </div>

//         {/* Appointments List */}
//         <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//           {filteredAppointments.length === 0 ? (
//             <div className="text-center py-12">
//               <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//               </svg>
//               <h3 className="text-xl font-semibold text-gray-700 mb-2">No Appointments Found</h3>
//               <p className="text-gray-500 mb-4">
//                 {filter === "all" 
//                   ? "You don't have any appointments yet." 
//                   : `No ${filter} appointments found.`}
//               </p>
//               <div className="space-y-2">
//                 <button
//                   onClick={fetchAppointments}
//                   className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200 mx-2"
//                 >
//                   Refresh
//                 </button>
//                 <button
//                   onClick={() => navigate("/doctors")}
//                   className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-200 mx-2"
//                 >
//                   Book New Appointment
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <div className="divide-y divide-gray-200">
//               {filteredAppointments.map((appointment) => (
//                 <div key={appointment._id} className="p-6 hover:bg-gray-50 transition duration-200">
//                   <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//                     {/* Appointment Details */}
//                     <div className="flex-1">
//                       <div className="flex items-start justify-between mb-3">
//                         <div>
//                           <h3 className="text-lg font-semibold text-gray-900">
//                             Dr. {appointment.doctorName || "Doctor Name Not Available"}
//                           </h3>
//                           <p className="text-gray-600">{appointment.doctorSpecialization || "Specialization not specified"}</p>
//                         </div>
//                         <div className="text-right">
//                           {getStatusBadge(appointment.status || "pending")}
//                           <p className="text-sm text-gray-500 mt-1">
//                             #{appointment.appointmentNumber || "N/A"}
//                           </p>
//                         </div>
//                       </div>

//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//                         <div>
//                           <p className="text-gray-600">Date & Time</p>
//                           <p className="font-semibold text-gray-900">
//                             {formatDate(appointment.appointmentDate)} •{" "}
//                             {formatTime(appointment.timeSlot?.startTime)} -{" "}
//                             {formatTime(appointment.timeSlot?.endTime)}
//                           </p>
//                         </div>
                        
//                         <div>
//                           <p className="text-gray-600">Patient</p>
//                           <p className="font-semibold text-gray-900">
//                             {appointment.patientDetails?.fullName || "Patient name not available"}
//                           </p>
//                           <p className="text-gray-600 text-sm">
//                             {appointment.patientDetails?.phoneNumber || "Phone not available"}
//                           </p>
//                         </div>

//                         {appointment.patientDetails?.medicalConcern && (
//                           <div>
//                             <p className="text-gray-600">Medical Concern</p>
//                             <p className="font-semibold text-gray-900">
//                               {appointment.patientDetails.medicalConcern}
//                             </p>
//                           </div>
//                         )}

//                         <div>
//                           <p className="text-gray-600">Booked On</p>
//                           <p className="font-semibold text-gray-900">
//                             {appointment.createdAt ? new Date(appointment.createdAt).toLocaleDateString() : "Date not available"}
//                           </p>
//                         </div>

//                         {/* Show cancellation reason if cancelled */}
//                         {appointment.status === "cancelled" && appointment.cancellationReason && (
//                           <div className="md:col-span-2">
//                             <p className="text-gray-600">Cancellation Reason</p>
//                             <p className="font-semibold text-red-600">
//                               {appointment.cancellationReason}
//                             </p>
//                             {appointment.cancelledAt && (
//                               <p className="text-xs text-gray-500">
//                                 Cancelled on: {new Date(appointment.cancelledAt).toLocaleString()}
//                               </p>
//                             )}
//                           </div>
//                         )}
//                       </div>
//                     </div>

//                     {/* Action Buttons */}
//                     <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:items-end">
//                       <button
//                         onClick={() => navigate(`/appointments/${appointment._id}`)}
//                         className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
//                       >
//                         View Details
//                       </button>
                      
//                       {/* Chat with Doctor Button */}
//                       {canUseChat(appointment) && (
//                         <button
//                           onClick={() => navigateToChat(appointment)}
//                           className="relative px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 font-medium flex items-center justify-center"
//                         >
//                           <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
//                           </svg>
//                           Chat with Doctor
//                           {unreadCounts[appointment._id] > 0 && (
//                             <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
//                               {unreadCounts[appointment._id] > 9 ? '9+' : unreadCounts[appointment._id]}
//                             </span>
//                           )}
//                         </button>
//                       )}
                      
//                       {/* Cancel Button - Only show for upcoming appointments that can be cancelled */}
//                       {canCancelAppointment(appointment) && (
//                         <button
//                           onClick={() => openCancelModal(appointment)}
//                           disabled={cancellingAppointment === appointment._id}
//                           className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center min-w-[120px]"
//                         >
//                           {cancellingAppointment === appointment._id ? (
//                             <div className="flex items-center justify-center">
//                               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                               Cancelling...
//                             </div>
//                           ) : (
//                             "Cancel Appointment"
//                           )}
//                         </button>
//                       )}

//                       {/* Show message if cannot cancel */}
//                       {!canCancelAppointment(appointment) && appointment.status !== "cancelled" && appointment.status !== "completed" && (
//                         <button
//                           disabled
//                           className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed text-sm"
//                           title="Cannot cancel past appointments"
//                         >
//                           Cannot Cancel
//                         </button>
//                       )}

//                       {/* Chat not available message */}
//                       {!canUseChat(appointment) && appointment.status !== "cancelled" && (
//                         <button
//                           disabled
//                           className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed text-sm"
//                           title={appointment.status === "completed" ? 
//                             "Chat only available for appointments within 7 days of completion" : 
//                             "Chat not available"}
//                         >
//                           Chat Unavailable
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Additional Info Box */}
//         <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
//           <div className="flex items-start">
//             <div className="flex-shrink-0 bg-blue-100 p-3 rounded-lg">
//               <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
//               </svg>
//             </div>
//             <div className="ml-4">
//               <h4 className="text-lg font-semibold text-gray-900">About Chat Feature</h4>
//               <ul className="mt-2 space-y-2 text-sm text-gray-600">
//                 <li className="flex items-start">
//                   <span className="text-green-500 mr-2">✓</span>
//                   Chat with your doctor about your medical concerns
//                 </li>
//                 <li className="flex items-start">
//                   <span className="text-green-500 mr-2">✓</span>
//                   Ask questions about medications and treatment plans
//                 </li>
//                 <li className="flex items-start">
//                   <span className="text-green-500 mr-2">✓</span>
//                   Share documents and reports securely
//                 </li>
//                 <li className="flex items-start">
//                   <span className="text-green-500 mr-2">✓</span>
//                   Real-time messaging with automatic updates
//                 </li>
//                 <li className="text-xs text-gray-500 mt-2">
//                   Note: Chat is available for active appointments and recently completed appointments (within 7 days)
//                 </li>
//               </ul>
//             </div>
//           </div>
//         </div>

//         {/* Refresh Button */}
//         <div className="text-center mt-6">
//           <button
//             onClick={fetchAppointments}
//             className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition duration-200"
//           >
//             Refresh Appointments
//           </button>
//         </div>
//       </div>

//       {/* Cancel Confirmation Modal */}
//       <CancelModal />
//     </div>
//   );
// };

// export default MyAppointments;



















// // src/pages/MyAppointments.jsx
// import { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { FaStar, FaComment, FaEye, FaEdit, FaTrash, FaCheckCircle } from "react-icons/fa";

// const MyAppointments = () => {
//   const navigate = useNavigate();
//   const [appointments, setAppointments] = useState([]);
//   const [filteredAppointments, setFilteredAppointments] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [filter, setFilter] = useState("all");
//   const [cancellingAppointment, setCancellingAppointment] = useState(null);
//   const [cancelReason, setCancelReason] = useState("");
//   const [showCancelModal, setShowCancelModal] = useState(false);
//   const [alert, setAlert] = useState({ show: false, type: "", message: "" });
//   const [unreadCounts, setUnreadCounts] = useState({});
  
//   // Feedback States
//   const [showFeedbackModal, setShowFeedbackModal] = useState(false);
//   const [selectedAppointment, setSelectedAppointment] = useState(null);
//   const [feedbackData, setFeedbackData] = useState({
//     rating: 0,
//     review: "",
//     doctorProfessionalism: 5,
//     waitingTime: 5,
//     facilityCleanliness: 5,
//     overallExperience: 5
//   });
//   const [userFeedbacks, setUserFeedbacks] = useState({}); // Store feedbacks by appointment ID
//   const [showFeedbackDetails, setShowFeedbackDetails] = useState({}); // Track which feedback details are open
//   const [isEditingFeedback, setIsEditingFeedback] = useState(false);
//   const [editingFeedbackId, setEditingFeedbackId] = useState(null);

//   // ✅ CORRECTED: Get logged in user ID from localStorage
//   const getCurrentUserInfo = () => {
//     const currentUserId = localStorage.getItem('currentUserId');
//     const userId = localStorage.getItem('userId');
//     const userData = localStorage.getItem('user');
    
//     let finalUserId = currentUserId || userId;
    
//     if (!finalUserId && userData) {
//       try {
//         const user = JSON.parse(userData);
//         finalUserId = user._id || user.id;
//       } catch (error) {
//         console.error("Error parsing user data:", error);
//       }
//     }
    
//     const userName = localStorage.getItem('userName') || 
//                     (userData ? JSON.parse(userData).name : null) || 
//                     "User";

//     return {
//       userId: finalUserId,
//       userName: userName
//     };
//   };

//   const { userId: loggedInUserId, userName: loggedInUserName } = getCurrentUserInfo();

//   useEffect(() => {
//     if (!loggedInUserId) {
//       setError("Please login to view your appointments");
//       setIsLoading(false);
//       return;
//     }
    
//     fetchAppointments();
//   }, [loggedInUserId]);

//   useEffect(() => {
//     filterAppointments();
//   }, [appointments, filter]);

//   // Fetch appointments and feedbacks
//   const fetchAppointments = async () => {
//     try {
//       setIsLoading(true);
//       setError("");

//       const token = localStorage.getItem('token');
//       if (!token) {
//         throw new Error("No authentication token found");
//       }

//       // Fetch appointments
//       const appointmentsResponse = await axios.get(
//         `http://localhost:5000/api/appointments/user/${loggedInUserId}`,
//         {
//           headers: { 'Authorization': `Bearer ${token}` }
//         }
//       );

//       if (appointmentsResponse.data.success) {
//         const userAppointments = appointmentsResponse.data.appointments || [];
//         setAppointments(userAppointments);
        
//         // Fetch feedbacks for each appointment
//         await fetchAllFeedbacks(userAppointments);
        
//         // Fetch unread counts
//         await fetchUnreadCounts();
//       }
//     } catch (error) {
//       console.error("❌ Error fetching data:", error);
//       setError(
//         error.response?.data?.error ||
//         error.message ||
//         "Failed to load appointments. Please try again."
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Fetch feedbacks for all appointments
//   const fetchAllFeedbacks = async (appointmentsList) => {
//     try {
//       const token = localStorage.getItem('token');
//       if (!token || !loggedInUserId) return;

//       const feedbacksMap = {};
      
//       for (const appointment of appointmentsList) {
//         if (appointment.status === "completed") {
//           try {
//             const response = await axios.get(
//               `http://localhost:5000/api/feedbacks/appointment/${appointment._id}/user/${loggedInUserId}`,
//               { headers: { 'Authorization': `Bearer ${token}` } }
//             );
            
//             if (response.data.success && response.data.feedback) {
//               feedbacksMap[appointment._id] = response.data.feedback;
//             }
//           } catch (error) {
//             // No feedback exists yet, which is fine
//             console.log(`No feedback for appointment ${appointment._id}:`, error.message);
//           }
//         }
//       }
      
//       setUserFeedbacks(feedbacksMap);
//     } catch (error) {
//       console.error("Error fetching feedbacks:", error);
//     }
//   };

//   // Fetch unread message counts
//   const fetchUnreadCounts = async () => {
//     if (!loggedInUserId) return;

//     try {
//       const response = await axios.get(
//         `http://localhost:5000/api/chat/unread/${loggedInUserId}/patient`
//       );
      
//       if (response.data.success) {
//         const counts = {};
//         response.data.chats?.forEach(chat => {
//           counts[chat.appointmentId] = chat.unreadCount;
//         });
//         setUnreadCounts(counts);
//       }
//     } catch (error) {
//       console.error('Error fetching unread counts:', error);
//     }
//   };

//   // Cancel Appointment Function
//   const cancelAppointment = async (appointmentId, reason) => {
//     try {
//       setCancellingAppointment(appointmentId);
      
//       const token = localStorage.getItem('token');
//       if (!token) throw new Error("No authentication token found");

//       const cancelData = {
//         userId: loggedInUserId,
//         cancellationReason: reason
//       };

//       const response = await axios.put(
//         `http://localhost:5000/api/appointments/${appointmentId}/cancel`,
//         cancelData,
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`
//           }
//         }
//       );

//       if (response.data.success) {
//         setAppointments(prevAppointments =>
//           prevAppointments.map(apt =>
//             apt._id === appointmentId
//               ? { 
//                   ...apt, 
//                   status: "cancelled",
//                   cancellationReason: reason,
//                   cancelledAt: new Date().toISOString(),
//                   ...response.data.appointment
//                 }
//               : apt
//           )
//         );

//         showAlert("success", "Appointment cancelled successfully!");
//         closeCancelModal();
//       }
//     } catch (error) {
//       console.error("❌ Error cancelling appointment:", error);
//       showAlert("error", error.response?.data?.error || "Failed to cancel appointment");
//     } finally {
//       setCancellingAppointment(null);
//     }
//   };

//   // Feedback Functions
//   const openFeedbackModal = (appointment, existingFeedback = null) => {
//     setSelectedAppointment(appointment);
    
//     if (existingFeedback) {
//       // Edit existing feedback
//       setFeedbackData({
//         rating: existingFeedback.rating,
//         review: existingFeedback.review || "",
//         doctorProfessionalism: existingFeedback.doctorProfessionalism || 5,
//         waitingTime: existingFeedback.waitingTime || 5,
//         facilityCleanliness: existingFeedback.facilityCleanliness || 5,
//         overallExperience: existingFeedback.overallExperience || 5
//       });
//       setIsEditingFeedback(true);
//       setEditingFeedbackId(existingFeedback._id);
//     } else {
//       // New feedback
//       setFeedbackData({
//         rating: 0,
//         review: "",
//         doctorProfessionalism: 5,
//         waitingTime: 5,
//         facilityCleanliness: 5,
//         overallExperience: 5
//       });
//       setIsEditingFeedback(false);
//       setEditingFeedbackId(null);
//     }
    
//     setShowFeedbackModal(true);
//   };

//   const closeFeedbackModal = () => {
//     setShowFeedbackModal(false);
//     setSelectedAppointment(null);
//     setFeedbackData({
//       rating: 0,
//       review: "",
//       doctorProfessionalism: 5,
//       waitingTime: 5,
//       facilityCleanliness: 5,
//       overallExperience: 5
//     });
//     setIsEditingFeedback(false);
//     setEditingFeedbackId(null);
//   };

//   const handleFeedbackSubmit = async () => {
//     try {
//       if (!feedbackData.rating || feedbackData.rating < 1) {
//         showAlert("error", "Please provide a rating");
//         return;
//       }

//       if (!feedbackData.review.trim()) {
//         showAlert("error", "Please write a review");
//         return;
//       }

//       const token = localStorage.getItem('token');
//       if (!token) throw new Error("No authentication token found");

//       const feedbackPayload = {
//         appointmentId: selectedAppointment._id,
//         doctorId: selectedAppointment.doctorId,
//         patientId: loggedInUserId,
//         patientName: loggedInUserName,
//         doctorName: selectedAppointment.doctorName,
//         rating: feedbackData.rating,
//         review: feedbackData.review,
//         doctorProfessionalism: feedbackData.doctorProfessionalism,
//         waitingTime: feedbackData.waitingTime,
//         facilityCleanliness: feedbackData.facilityCleanliness,
//         overallExperience: feedbackData.overallExperience
//       };

//       let response;
      
//       if (isEditingFeedback && editingFeedbackId) {
//         // Update existing feedback
//         response = await axios.put(
//           `http://localhost:5000/api/feedbacks/${editingFeedbackId}`,
//           feedbackPayload,
//           { headers: { 'Authorization': `Bearer ${token}` } }
//         );
//       } else {
//         // Create new feedback
//         response = await axios.post(
//           'http://localhost:5000/api/feedbacks',
//           feedbackPayload,
//           { headers: { 'Authorization': `Bearer ${token}` } }
//         );
//       }

//       if (response.data.success) {
//         // Update local state
//         setUserFeedbacks(prev => ({
//           ...prev,
//           [selectedAppointment._id]: response.data.feedback
//         }));

//         showAlert("success", 
//           isEditingFeedback 
//             ? "Feedback updated successfully!" 
//             : "Thank you for your feedback!"
//         );
//         closeFeedbackModal();
//       }
//     } catch (error) {
//       console.error("❌ Error submitting feedback:", error);
//       showAlert("error", error.response?.data?.error || "Failed to submit feedback");
//     }
//   };

//   const deleteFeedback = async (appointmentId, feedbackId) => {
//     if (!window.confirm("Are you sure you want to delete this feedback?")) return;

//     try {
//       const token = localStorage.getItem('token');
//       if (!token) throw new Error("No authentication token found");

//       const response = await axios.delete(
//         `http://localhost:5000/api/feedbacks/${feedbackId}`,
//         { headers: { 'Authorization': `Bearer ${token}` } }
//       );

//       if (response.data.success) {
//         // Remove from local state
//         setUserFeedbacks(prev => {
//           const newFeedbacks = { ...prev };
//           delete newFeedbacks[appointmentId];
//           return newFeedbacks;
//         });

//         showAlert("success", "Feedback deleted successfully!");
//       }
//     } catch (error) {
//       console.error("❌ Error deleting feedback:", error);
//       showAlert("error", error.response?.data?.error || "Failed to delete feedback");
//     }
//   };

//   const toggleFeedbackDetails = (appointmentId) => {
//     setShowFeedbackDetails(prev => ({
//       ...prev,
//       [appointmentId]: !prev[appointmentId]
//     }));
//   };

//   // Navigate to chat
//   const navigateToChat = (appointment) => {
//     if (!appointment?._id) {
//       showAlert("error", "Cannot open chat: Invalid appointment");
//       return;
//     }

//     if (appointment.status === "cancelled") {
//       showAlert("error", "Cannot chat for cancelled appointments");
//       return;
//     }

//     navigate(`/chat/${appointment._id}`);
//   };

//   // Filter appointments
//   const filterAppointments = () => {
//     const now = new Date();
    
//     let filtered = appointments;
    
//     switch (filter) {
//       case "upcoming":
//         filtered = appointments.filter(apt => 
//           new Date(apt.appointmentDate) >= now && 
//           apt.status !== "cancelled"
//         );
//         break;
//       case "past":
//         filtered = appointments.filter(apt => 
//           new Date(apt.appointmentDate) < now && 
//           apt.status !== "cancelled"
//         );
//         break;
//       case "cancelled":
//         filtered = appointments.filter(apt => apt.status === "cancelled");
//         break;
//       case "completed":
//         filtered = appointments.filter(apt => apt.status === "completed");
//         break;
//       default:
//         filtered = appointments;
//     }
    
//     setFilteredAppointments(filtered);
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "Date not set";
//     return new Date(dateString).toLocaleDateString('en-US', {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     });
//   };

//   const formatTime = (timeString) => {
//     if (!timeString) return "Time not set";
//     if (timeString.includes('AM') || timeString.includes('PM')) {
//       return timeString;
//     }
//     const [hours, minutes] = timeString.split(':');
//     const hour = parseInt(hours);
//     const ampm = hour >= 12 ? 'PM' : 'AM';
//     const formattedHour = hour % 12 || 12;
//     return `${formattedHour}:${minutes} ${ampm}`;
//   };

//   const canCancelAppointment = (appointment) => {
//     if (appointment.status === "cancelled" || appointment.status === "completed") {
//       return false;
//     }

//     const appointmentDate = new Date(appointment.appointmentDate);
//     const now = new Date();
//     return appointmentDate > now;
//   };

//   const canUseChat = (appointment) => {
//     if (!appointment?._id) return false;
//     if (appointment.status === "cancelled") return false;
    
//     if (appointment.status === "completed") {
//       const appointmentDate = new Date(appointment.appointmentDate);
//       const now = new Date();
//       const daysSinceAppointment = (now - appointmentDate) / (1000 * 60 * 60 * 24);
//       return daysSinceAppointment <= 7;
//     }
    
//     return true;
//   };

//   const canGiveFeedback = (appointment) => {
//     // Only completed appointments can receive feedback
//     return appointment.status === "completed";
//   };

//   const getStatusBadge = (status) => {
//     const statusConfig = {
//       pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", text: "Pending" },
//       confirmed: { color: "bg-green-100 text-green-800 border-green-200", text: "Confirmed" },
//       cancelled: { color: "bg-red-100 text-red-800 border-red-200", text: "Cancelled" },
//       completed: { color: "bg-blue-100 text-blue-800 border-blue-200", text: "Completed" }
//     };
    
//     const config = statusConfig[status] || statusConfig.pending;
    
//     return (
//       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
//         {config.text}
//       </span>
//     );
//   };

//   const getAppointmentStats = () => {
//     const now = new Date();
    
//     const total = appointments.length;
//     const upcoming = appointments.filter(apt => 
//       new Date(apt.appointmentDate) >= now && 
//       apt.status !== "cancelled"
//     ).length;
//     const past = appointments.filter(apt => 
//       new Date(apt.appointmentDate) < now && 
//       apt.status !== "cancelled"
//     ).length;
//     const cancelled = appointments.filter(apt => apt.status === "cancelled").length;
//     const completed = appointments.filter(apt => apt.status === "completed").length;
//     const withFeedback = Object.keys(userFeedbacks).length;

//     return { total, upcoming, past, cancelled, completed, withFeedback };
//   };

//   const showAlert = (type, message) => {
//     setAlert({ show: true, type, message });
//     setTimeout(() => setAlert({ show: false, type: "", message: "" }), 5000);
//   };

//   const openCancelModal = (appointment) => {
//     if (appointment.status === "cancelled") {
//       showAlert("error", "This appointment is already cancelled.");
//       return;
//     }

//     if (appointment.status === "completed") {
//       showAlert("error", "This appointment has already been completed.");
//       return;
//     }

//     const appointmentDate = new Date(appointment.appointmentDate);
//     const now = new Date();
//     if (appointmentDate < now) {
//       showAlert("error", "Cannot cancel past appointments.");
//       return;
//     }

//     if (!["pending", "confirmed"].includes(appointment.status)) {
//       showAlert("error", `Cannot cancel appointment with status: ${appointment.status}`);
//       return;
//     }

//     setCancellingAppointment(appointment);
//     setShowCancelModal(true);
//   };

//   const closeCancelModal = () => {
//     setShowCancelModal(false);
//     setCancellingAppointment(null);
//     setCancelReason("");
//   };

//   const handleCancelConfirm = () => {
//     if (!cancelReason.trim()) {
//       showAlert("error", "Please provide a reason for cancellation.");
//       return;
//     }
//     if (cancellingAppointment && cancellingAppointment._id) {
//       cancelAppointment(cancellingAppointment._id, cancelReason);
//     }
//   };

//   const stats = getAppointmentStats();

//   // Render Stars for Rating
//   const renderStars = (rating) => {
//     return (
//       <div className="flex items-center">
//         {[1, 2, 3, 4, 5].map((star) => (
//           <FaStar
//             key={star}
//             className={`w-4 h-4 ${
//               star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
//             }`}
//           />
//         ))}
//       </div>
//     );
//   };

//   // Render Rating Input
//   const renderRatingInput = (label, value, onChange) => {
//     return (
//       <div className="mb-4">
//         <label className="block text-sm font-medium text-gray-700 mb-2">
//           {label}
//         </label>
//         <div className="flex items-center space-x-1">
//           {[1, 2, 3, 4, 5].map((star) => (
//             <button
//               key={star}
//               type="button"
//               onClick={() => onChange(star)}
//               className="focus:outline-none"
//             >
//               <FaStar
//                 className={`w-8 h-8 ${
//                   star <= value ? 'text-yellow-400 fill-current' : 'text-gray-300'
//                 } hover:text-yellow-500 transition-colors`}
//               />
//             </button>
//           ))}
//           <span className="ml-2 text-gray-600 font-medium">{value}/5</span>
//         </div>
//       </div>
//     );
//   };

//   // Cancel Modal Component
//   const CancelModal = () => {
//     if (!showCancelModal || !cancellingAppointment) return null;

//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//         <div className="bg-white rounded-2xl max-w-md w-full p-6">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-xl font-semibold text-gray-900">Cancel Appointment</h3>
//             <button onClick={closeCancelModal} className="text-gray-500 hover:text-gray-700">
//               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>

//           <div className="mb-4">
//             <p className="text-gray-700 mb-2">
//               Are you sure you want to cancel your appointment with{" "}
//               <strong>Dr. {cancellingAppointment.doctorName}</strong>?
//             </p>
//             <p className="text-sm text-gray-600 mb-4">
//               Scheduled for {formatDate(cancellingAppointment.appointmentDate)} at{" "}
//               {formatTime(cancellingAppointment.timeSlot?.startTime)}
//             </p>
//           </div>

//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Reason for cancellation <span className="text-red-500">*</span>
//             </label>
//             <textarea
//               value={cancelReason}
//               onChange={(e) => setCancelReason(e.target.value)}
//               placeholder="Please provide a reason for cancellation..."
//               rows="3"
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               required
//             />
//           </div>

//           <div className="flex gap-3">
//             <button
//               onClick={closeCancelModal}
//               className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-700 transition duration-200"
//             >
//               Keep Appointment
//             </button>
//             <button
//               onClick={handleCancelConfirm}
//               disabled={!cancelReason.trim()}
//               className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
//             >
//               Confirm Cancellation
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // Feedback Modal Component
//   const FeedbackModal = () => {
//     if (!showFeedbackModal || !selectedAppointment) return null;

//     const feedback = userFeedbacks[selectedAppointment._id];

//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//         <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
//           <div className="flex items-center justify-between mb-6">
//             <h3 className="text-xl font-semibold text-gray-900">
//               {isEditingFeedback ? "Edit Your Feedback" : "Share Your Experience"}
//             </h3>
//             <button onClick={closeFeedbackModal} className="text-gray-500 hover:text-gray-700">
//               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>

//           <div className="mb-6">
//             <div className="bg-blue-50 p-4 rounded-lg mb-4">
//               <h4 className="font-medium text-gray-900 mb-1">Appointment Details</h4>
//               <p className="text-sm text-gray-600">
//                 Dr. {selectedAppointment.doctorName} • {selectedAppointment.doctorSpecialization}
//               </p>
//               <p className="text-sm text-gray-600">
//                 {formatDate(selectedAppointment.appointmentDate)} at{" "}
//                 {formatTime(selectedAppointment.timeSlot?.startTime)}
//               </p>
//             </div>

//             {/* Overall Rating */}
//             {renderRatingInput("Overall Rating", feedbackData.rating, (rating) =>
//               setFeedbackData(prev => ({ ...prev, rating }))
//             )}

//             {/* Detailed Ratings */}
//             <div className="space-y-4">
//               {renderRatingInput("Doctor Professionalism", feedbackData.doctorProfessionalism, (value) =>
//                 setFeedbackData(prev => ({ ...prev, doctorProfessionalism: value }))
//               )}
              
//               {renderRatingInput("Waiting Time", feedbackData.waitingTime, (value) =>
//                 setFeedbackData(prev => ({ ...prev, waitingTime: value }))
//               )}
              
//               {renderRatingInput("Facility Cleanliness", feedbackData.facilityCleanliness, (value) =>
//                 setFeedbackData(prev => ({ ...prev, facilityCleanliness: value }))
//               )}
              
//               {renderRatingInput("Overall Experience", feedbackData.overallExperience, (value) =>
//                 setFeedbackData(prev => ({ ...prev, overallExperience: value }))
//               )}
//             </div>

//             {/* Review Text */}
//             <div className="mb-6">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Your Review <span className="text-red-500">*</span>
//               </label>
//               <textarea
//                 value={feedbackData.review}
//                 onChange={(e) => setFeedbackData(prev => ({ ...prev, review: e.target.value }))}
//                 placeholder="Share your experience with the doctor and hospital..."
//                 rows="4"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 required
//               />
//             </div>
//           </div>

//           <div className="flex gap-3">
//             <button
//               onClick={closeFeedbackModal}
//               className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-700 transition duration-200"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleFeedbackSubmit}
//               disabled={!feedbackData.rating || !feedbackData.review.trim()}
//               className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
//             >
//               {isEditingFeedback ? "Update Feedback" : "Submit Feedback"}
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // Feedback Card Component
//   const FeedbackCard = ({ appointment, feedback }) => {
//     const isDetailsOpen = showFeedbackDetails[appointment._id] || false;

//     return (
//       <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mt-4 border border-green-200">
//         <div className="flex items-center justify-between mb-3">
//           <div className="flex items-center">
//             <FaComment className="text-green-600 mr-2" />
//             <h4 className="font-semibold text-gray-900">Your Feedback</h4>
//           </div>
//           <div className="flex items-center space-x-2">
//             <button
//               onClick={() => openFeedbackModal(appointment, feedback)}
//               className="text-blue-600 hover:text-blue-800"
//               title="Edit feedback"
//             >
//               <FaEdit className="w-4 h-4" />
//             </button>
//             <button
//               onClick={() => deleteFeedback(appointment._id, feedback._id)}
//               className="text-red-600 hover:text-red-800"
//               title="Delete feedback"
//             >
//               <FaTrash className="w-4 h-4" />
//             </button>
//             <button
//               onClick={() => toggleFeedbackDetails(appointment._id)}
//               className="text-gray-600 hover:text-gray-800"
//               title={isDetailsOpen ? "Hide details" : "View details"}
//             >
//               <FaEye className="w-4 h-4" />
//             </button>
//           </div>
//         </div>

//         <div className="flex items-center justify-between mb-2">
//           <div className="flex items-center">
//             {renderStars(feedback.rating)}
//             <span className="ml-2 text-sm font-medium text-gray-700">
//               {feedback.rating}/5
//             </span>
//           </div>
//           <span className="text-xs text-gray-500">
//             {new Date(feedback.createdAt).toLocaleDateString()}
//           </span>
//         </div>

//         <p className="text-gray-700 mb-3">{feedback.review}</p>

//         {isDetailsOpen && (
//           <div className="bg-white rounded-lg p-4 mt-3">
//             <h5 className="font-medium text-gray-900 mb-3">Detailed Ratings</h5>
//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <span className="text-sm text-gray-600">Doctor Professionalism</span>
//                 <div className="flex items-center">
//                   {renderStars(feedback.doctorProfessionalism)}
//                   <span className="ml-2 text-sm font-medium">{feedback.doctorProfessionalism}/5</span>
//                 </div>
//               </div>
//               <div>
//                 <span className="text-sm text-gray-600">Waiting Time</span>
//                 <div className="flex items-center">
//                   {renderStars(feedback.waitingTime)}
//                   <span className="ml-2 text-sm font-medium">{feedback.waitingTime}/5</span>
//                 </div>
//               </div>
//               <div>
//                 <span className="text-sm text-gray-600">Facility Cleanliness</span>
//                 <div className="flex items-center">
//                   {renderStars(feedback.facilityCleanliness)}
//                   <span className="ml-2 text-sm font-medium">{feedback.facilityCleanliness}/5</span>
//                 </div>
//               </div>
//               <div>
//                 <span className="text-sm text-gray-600">Overall Experience</span>
//                 <div className="flex items-center">
//                   {renderStars(feedback.overallExperience)}
//                   <span className="ml-2 text-sm font-medium">{feedback.overallExperience}/5</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   if (!loggedInUserId) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
//         <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center">
//             <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 max-w-md mx-auto">
//               <h3 className="text-xl font-semibold text-yellow-800 mb-2">Login Required</h3>
//               <p className="text-yellow-600 mb-4">Please login to view your appointments</p>
//               <button
//                 onClick={() => navigate("/login")}
//                 className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition duration-200"
//               >
//                 Go to Login
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
//         <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
//             <h3 className="text-xl font-semibold text-gray-700">Loading Your Appointments</h3>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
//         <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center">
//             <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
//               <h3 className="text-xl font-semibold text-red-800 mb-2">Error Loading Appointments</h3>
//               <p className="text-red-600 mb-4">{error}</p>
//               <div className="space-y-2">
//                 <button
//                   onClick={fetchAppointments}
//                   className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition duration-200 block w-full"
//                 >
//                   Try Again
//                 </button>
//                 <button
//                   onClick={() => navigate("/doctors")}
//                   className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200 block w-full"
//                 >
//                   Book New Appointment
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
//       <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Alert */}
//         {alert.show && (
//           <div className={`mb-6 border rounded-lg p-4 ${
//             alert.type === "success" 
//               ? "bg-green-50 border-green-200 text-green-800" 
//               : "bg-red-50 border-red-200 text-red-800"
//           }`}>
//             <div className="flex items-center">
//               <FaCheckCircle className={`w-5 h-5 mr-2 ${
//                 alert.type === "success" ? "text-green-400" : "text-red-400"
//               }`} />
//               <span className="font-medium">{alert.message}</span>
//             </div>
//           </div>
//         )}

//         {/* Header */}
//         <div className="text-center mb-8">
//           <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
//             My Appointments
//           </h1>
//           <p className="text-lg text-gray-600">
//             Welcome back, {loggedInUserName}! Manage your medical appointments and share feedback
//           </p>
//         </div>

//         {/* Stats Cards - Now includes feedback stats */}
//         <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
//           <div className="bg-white rounded-xl shadow-lg p-4 text-center">
//             <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
//             <div className="text-sm text-gray-600">Total</div>
//           </div>
//           <div className="bg-white rounded-xl shadow-lg p-4 text-center">
//             <div className="text-2xl font-bold text-green-600">{stats.upcoming}</div>
//             <div className="text-sm text-gray-600">Upcoming</div>
//           </div>
//           <div className="bg-white rounded-xl shadow-lg p-4 text-center">
//             <div className="text-2xl font-bold text-purple-600">{stats.completed}</div>
//             <div className="text-sm text-gray-600">Completed</div>
//           </div>
//           <div className="bg-white rounded-xl shadow-lg p-4 text-center">
//             <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
//             <div className="text-sm text-gray-600">Cancelled</div>
//           </div>
//           <div className="bg-white rounded-xl shadow-lg p-4 text-center">
//             <div className="text-2xl font-bold text-yellow-600">{stats.withFeedback}</div>
//             <div className="text-sm text-gray-600">With Feedback</div>
//           </div>
//           <div className="bg-white rounded-xl shadow-lg p-4 text-center">
//             <div className="text-2xl font-bold text-indigo-600">
//               {stats.completed > 0 ? Math.round((stats.withFeedback / stats.completed) * 100) : 0}%
//             </div>
//             <div className="text-sm text-gray-600">Feedback Rate</div>
//           </div>
//         </div>

//         {/* Filter Buttons - Added Completed filter */}
//         <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
//           <div className="flex flex-wrap gap-2">
//             {["all", "upcoming", "past", "completed", "cancelled"].map((filterOption) => (
//               <button
//                 key={filterOption}
//                 onClick={() => setFilter(filterOption)}
//                 className={`px-4 py-2 rounded-lg font-medium transition duration-200 capitalize ${
//                   filter === filterOption
//                     ? filterOption === "cancelled" 
//                       ? "bg-red-600 text-white"
//                       : filterOption === "completed"
//                       ? "bg-purple-600 text-white"
//                       : "bg-blue-600 text-white"
//                     : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                 }`}
//               >
//                 {filterOption === "all" ? "All Appointments" : filterOption}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Appointments List */}
//         <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//           {filteredAppointments.length === 0 ? (
//             <div className="text-center py-12">
//               <h3 className="text-xl font-semibold text-gray-700 mb-2">No Appointments Found</h3>
//               <p className="text-gray-500 mb-4">
//                 {filter === "all" 
//                   ? "You don't have any appointments yet." 
//                   : `No ${filter} appointments found.`}
//               </p>
//               <button
//                 onClick={() => navigate("/doctors")}
//                 className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-200"
//               >
//                 Book New Appointment
//               </button>
//             </div>
//           ) : (
//             <div className="divide-y divide-gray-200">
//               {filteredAppointments.map((appointment) => {
//                 const hasFeedback = userFeedbacks[appointment._id];
//                 const isCompleted = appointment.status === "completed";
                
//                 return (
//                   <div key={appointment._id} className="p-6 hover:bg-gray-50 transition duration-200">
//                     <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//                       {/* Appointment Details */}
//                       <div className="flex-1">
//                         <div className="flex items-start justify-between mb-3">
//                           <div>
//                             <h3 className="text-lg font-semibold text-gray-900">
//                               Dr. {appointment.doctorName || "Doctor Name Not Available"}
//                             </h3>
//                             <p className="text-gray-600">{appointment.doctorSpecialization}</p>
//                           </div>
//                           <div className="text-right">
//                             {getStatusBadge(appointment.status || "pending")}
//                             <p className="text-sm text-gray-500 mt-1">
//                               #{appointment.appointmentNumber || "N/A"}
//                             </p>
//                           </div>
//                         </div>

//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//                           <div>
//                             <p className="text-gray-600">Date & Time</p>
//                             <p className="font-semibold text-gray-900">
//                               {formatDate(appointment.appointmentDate)} •{" "}
//                               {formatTime(appointment.timeSlot?.startTime)}
//                             </p>
//                           </div>
                          
//                           <div>
//                             <p className="text-gray-600">Patient</p>
//                             <p className="font-semibold text-gray-900">
//                               {appointment.patientDetails?.fullName || "Patient name not available"}
//                             </p>
//                           </div>
//                         </div>

//                         {/* Show existing feedback or feedback button */}
//                         {isCompleted && (
//                           <div className="mt-4">
//                             {hasFeedback ? (
//                               <FeedbackCard appointment={appointment} feedback={hasFeedback} />
//                             ) : (
//                               <button
//                                 onClick={() => openFeedbackModal(appointment)}
//                                 className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
//                               >
//                                 <FaStar className="mr-2" />
//                                 Share Your Experience
//                               </button>
//                             )}
//                           </div>
//                         )}
//                       </div>

//                       {/* Action Buttons */}
//                       <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:items-end">
//                         <button
//                           onClick={() => navigate(`/appointments/${appointment._id}`)}
//                           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
//                         >
//                           View Details
//                         </button>
                        
//                         {/* Chat Button */}
//                         {canUseChat(appointment) && (
//                           <button
//                             onClick={() => navigateToChat(appointment)}
//                             className="relative px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 font-medium flex items-center justify-center"
//                           >
//                             <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
//                             </svg>
//                             Chat
//                             {unreadCounts[appointment._id] > 0 && (
//                               <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
//                                 {unreadCounts[appointment._id] > 9 ? '9+' : unreadCounts[appointment._id]}
//                               </span>
//                             )}
//                           </button>
//                         )}
                        
//                         {/* Cancel Button */}
//                         {canCancelAppointment(appointment) && (
//                           <button
//                             onClick={() => openCancelModal(appointment)}
//                             className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
//                           >
//                             Cancel
//                           </button>
//                         )}

//                         {/* Feedback Button for completed appointments without feedback */}
//                         {isCompleted && !hasFeedback && (
//                           <button
//                             onClick={() => openFeedbackModal(appointment)}
//                             className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition duration-200"
//                           >
//                             <FaStar className="inline-block mr-2" />
//                             Give Feedback
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>

//         {/* Feedback Info Box */}
//         <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
//           <div className="flex items-start">
//             <div className="flex-shrink-0 bg-green-100 p-3 rounded-lg">
//               <FaStar className="w-6 h-6 text-green-600" />
//             </div>
//             <div className="ml-4">
//               <h4 className="text-lg font-semibold text-gray-900">About Feedback System</h4>
//               <ul className="mt-2 space-y-2 text-sm text-gray-600">
//                 <li className="flex items-start">
//                   <FaCheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
//                   <span>Share your experience to help improve healthcare services</span>
//                 </li>
//                 <li className="flex items-start">
//                   <FaCheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
//                   <span>Rate doctors and facilities to help other patients</span>
//                 </li>
//                 <li className="flex items-start">
//                   <FaCheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
//                   <span>Your feedback is anonymous to the doctor</span>
//                 </li>
//                 <li className="flex items-start">
//                   <FaCheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
//                   <span>You can edit or delete your feedback anytime</span>
//                 </li>
//               </ul>
//             </div>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex flex-wrap gap-3 mt-6">
//           <button
//             onClick={fetchAppointments}
//             className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200"
//           >
//             Refresh
//           </button>
//           <button
//             onClick={() => navigate("/doctors")}
//             className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
//           >
//             Book New Appointment
//           </button>
//           {stats.completed > stats.withFeedback && (
//             <button
//               onClick={() => {
//                 const appointmentWithoutFeedback = appointments.find(
//                   apt => apt.status === "completed" && !userFeedbacks[apt._id]
//                 );
//                 if (appointmentWithoutFeedback) {
//                   openFeedbackModal(appointmentWithoutFeedback);
//                 }
//               }}
//               className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition duration-200"
//             >
//               Give Missing Feedback ({stats.completed - stats.withFeedback})
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Modals */}
//       <CancelModal />
//       <FeedbackModal />
//     </div>
//   );
// };

// export default MyAppointments;



































// wada karana eka 

// // src/pages/MyAppointments.jsx
// import { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { FaStar, FaComment, FaEye, FaEdit, FaTrash, FaCheckCircle } from "react-icons/fa";

// const MyAppointments = () => {
//   const navigate = useNavigate();
//   const [appointments, setAppointments] = useState([]);
//   const [filteredAppointments, setFilteredAppointments] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [filter, setFilter] = useState("all");
//   const [cancellingAppointment, setCancellingAppointment] = useState(null);
//   const [cancelReason, setCancelReason] = useState("");
//   const [showCancelModal, setShowCancelModal] = useState(false);
//   const [alert, setAlert] = useState({ show: false, type: "", message: "" });
//   const [unreadCounts, setUnreadCounts] = useState({});
  
//   // Feedback States
//   const [showFeedbackModal, setShowFeedbackModal] = useState(false);
//   const [selectedAppointment, setSelectedAppointment] = useState(null);
//   const [feedbackData, setFeedbackData] = useState({
//     rating: 0,
//     review: "",
//     doctorProfessionalism: 5,
//     waitingTime: 5,
//     facilityCleanliness: 5,
//     overallExperience: 5
//   });
//   const [userFeedbacks, setUserFeedbacks] = useState({}); // Store feedbacks by appointment ID
//   const [showFeedbackDetails, setShowFeedbackDetails] = useState({}); // Track which feedback details are open
//   const [isEditingFeedback, setIsEditingFeedback] = useState(false);
//   const [editingFeedbackId, setEditingFeedbackId] = useState(null);

//   // ✅ FIXED: Get logged in user ID and Name properly
//   const getCurrentUserInfo = () => {
//     console.log('🔍 Getting current user info from localStorage...');
    
//     // Check all possible localStorage keys
//     const currentUserId = localStorage.getItem('currentUserId');
//     const userId = localStorage.getItem('userId');
//     const userData = localStorage.getItem('user');
//     const token = localStorage.getItem('token');
    
//     let finalUserId = currentUserId || userId;
    
//     // Try to get user name from multiple sources
//     let finalUserName = localStorage.getItem('userName') || '';
    
//     if (!finalUserName && userData) {
//       try {
//         const user = JSON.parse(userData);
//         console.log('📊 Parsed user data:', user);
        
//         // Try different field names that might contain the name
//         finalUserName = user.name || user.fullName || user.username || 
//                        (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : null) ||
//                        user.firstName || user.email || "User";
        
//         finalUserId = user._id || user.id || finalUserId;
        
//         // Save to localStorage for future use
//         if (finalUserName && finalUserName !== "User") {
//           localStorage.setItem('userName', finalUserName);
//         }
//         if (finalUserId && !currentUserId && !userId) {
//           localStorage.setItem('currentUserId', finalUserId);
//         }
//       } catch (error) {
//         console.error("Error parsing user data:", error);
//       }
//     }
    
//     // Fallback - try to get from token or other sources
//     if (!finalUserName || finalUserName === "User") {
//       const userNameFromToken = localStorage.getItem('userNameFromToken');
//       if (userNameFromToken) {
//         finalUserName = userNameFromToken;
//       }
//     }
    
//     // Final fallback
//     if (!finalUserName || finalUserName === "User") {
//       finalUserName = "Patient User";
//       console.log('⚠️ Using fallback user name');
//     }
    
//     if (!finalUserId) {
//       console.log('❌ No user ID found in localStorage');
//       // Try to get from token or other auth systems
//       const authData = localStorage.getItem('auth');
//       if (authData) {
//         try {
//           const auth = JSON.parse(authData);
//           finalUserId = auth.userId || auth.id || finalUserId;
//         } catch (e) {
//           console.error("Error parsing auth data:", e);
//         }
//       }
//     }
    
//     console.log('✅ User Info - ID:', finalUserId, 'Name:', finalUserName);
    
//     return {
//       userId: finalUserId,
//       userName: finalUserName
//     };
//   };

//   const { userId: loggedInUserId, userName: loggedInUserName } = getCurrentUserInfo();

//   useEffect(() => {
//     if (!loggedInUserId) {
//       setError("Please login to view your appointments");
//       setIsLoading(false);
//       return;
//     }
    
//     fetchAppointments();
    
//     // Fetch user profile to ensure we have the name
//     fetchUserProfile();
//   }, [loggedInUserId]);

//   useEffect(() => {
//     filterAppointments();
//   }, [appointments, filter]);

//   // Fetch user profile to get name
//   const fetchUserProfile = async () => {
//     const token = localStorage.getItem('token');
//     if (!token || !loggedInUserId) return;
    
//     try {
//       console.log('👤 Fetching user profile for ID:', loggedInUserId);
      
//       const response = await axios.get(
//         `http://localhost:5000/api/users/${loggedInUserId}`,
//         {
//           headers: { 'Authorization': `Bearer ${token}` }
//         }
//       );
      
//       if (response.data.success) {
//         const user = response.data.user;
//         console.log('✅ User profile fetched:', user);
        
//         // Save user data to localStorage
//         const userName = user.name || user.fullName || user.username || 
//                         (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : null) ||
//                         user.firstName || user.email || "User";
        
//         localStorage.setItem('userName', userName);
//         localStorage.setItem('user', JSON.stringify(user));
        
//         console.log('🔄 Updated user name in localStorage:', userName);
//       }
//     } catch (error) {
//       console.error('Error fetching user profile:', error);
//       // If API fails, use what's already in localStorage
//       console.log('Using existing localStorage data');
//     }
//   };

//   // Fetch appointments and feedbacks
//   const fetchAppointments = async () => {
//     try {
//       setIsLoading(true);
//       setError("");

//       const token = localStorage.getItem('token');
//       if (!token) {
//         throw new Error("No authentication token found");
//       }

//       // Fetch appointments
//       const appointmentsResponse = await axios.get(
//         `http://localhost:5000/api/appointments/user/${loggedInUserId}`,
//         {
//           headers: { 'Authorization': `Bearer ${token}` }
//         }
//       );

//       if (appointmentsResponse.data.success) {
//         const userAppointments = appointmentsResponse.data.appointments || [];
//         console.log('📅 Appointments fetched:', userAppointments.length);
//         setAppointments(userAppointments);
        
//         // Fetch feedbacks for each appointment
//         await fetchAllFeedbacks(userAppointments);
        
//         // Fetch unread counts
//         await fetchUnreadCounts();
//       }
//     } catch (error) {
//       console.error("❌ Error fetching data:", error);
//       setError(
//         error.response?.data?.error ||
//         error.message ||
//         "Failed to load appointments. Please try again."
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Fetch feedbacks for all appointments
//   const fetchAllFeedbacks = async (appointmentsList) => {
//     try {
//       const token = localStorage.getItem('token');
//       if (!token || !loggedInUserId) return;

//       const feedbacksMap = {};
      
//       for (const appointment of appointmentsList) {
//         if (appointment.status === "completed") {
//           try {
//             const response = await axios.get(
//               `http://localhost:5000/api/feedbacks/appointment/${appointment._id}/user/${loggedInUserId}`,
//               { headers: { 'Authorization': `Bearer ${token}` } }
//             );
            
//             if (response.data.success && response.data.feedback) {
//               feedbacksMap[appointment._id] = response.data.feedback;
//             }
//           } catch (error) {
//             // No feedback exists yet, which is fine
//             console.log(`No feedback for appointment ${appointment._id}:`, error.message);
//           }
//         }
//       }
      
//       setUserFeedbacks(feedbacksMap);
//     } catch (error) {
//       console.error("Error fetching feedbacks:", error);
//     }
//   };

//   // Fetch unread message counts
//   const fetchUnreadCounts = async () => {
//     if (!loggedInUserId) return;

//     try {
//       const response = await axios.get(
//         `http://localhost:5000/api/chat/unread/${loggedInUserId}/patient`
//       );
      
//       if (response.data.success) {
//         const counts = {};
//         response.data.chats?.forEach(chat => {
//           counts[chat.appointmentId] = chat.unreadCount;
//         });
//         setUnreadCounts(counts);
//       }
//     } catch (error) {
//       console.error('Error fetching unread counts:', error);
//     }
//   };

//   // Cancel Appointment Function
//   const cancelAppointment = async (appointmentId, reason) => {
//     try {
//       setCancellingAppointment(appointmentId);
      
//       const token = localStorage.getItem('token');
//       if (!token) throw new Error("No authentication token found");

//       const cancelData = {
//         userId: loggedInUserId,
//         cancellationReason: reason
//       };

//       const response = await axios.put(
//         `http://localhost:5000/api/appointments/${appointmentId}/cancel`,
//         cancelData,
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`
//           }
//         }
//       );

//       if (response.data.success) {
//         setAppointments(prevAppointments =>
//           prevAppointments.map(apt =>
//             apt._id === appointmentId
//               ? { 
//                   ...apt, 
//                   status: "cancelled",
//                   cancellationReason: reason,
//                   cancelledAt: new Date().toISOString(),
//                   ...response.data.appointment
//                 }
//               : apt
//           )
//         );

//         showAlert("success", "Appointment cancelled successfully!");
//         closeCancelModal();
//       }
//     } catch (error) {
//       console.error("❌ Error cancelling appointment:", error);
//       showAlert("error", error.response?.data?.error || "Failed to cancel appointment");
//     } finally {
//       setCancellingAppointment(null);
//     }
//   };

//   // Feedback Functions
//   const openFeedbackModal = (appointment, existingFeedback = null) => {
//     console.log('=== OPENING FEEDBACK MODAL ===');
//     console.log('Appointment ID:', appointment._id);
//     console.log('Current loggedInUserName:', loggedInUserName);
//     console.log('LocalStorage userName:', localStorage.getItem('userName'));
//     console.log('Patient details:', appointment.patientDetails);
//     console.log('=============================');
    
//     setSelectedAppointment(appointment);
    
//     if (existingFeedback) {
//       // Edit existing feedback
//       setFeedbackData({
//         rating: existingFeedback.rating,
//         review: existingFeedback.review || "",
//         doctorProfessionalism: existingFeedback.doctorProfessionalism || 5,
//         waitingTime: existingFeedback.waitingTime || 5,
//         facilityCleanliness: existingFeedback.facilityCleanliness || 5,
//         overallExperience: existingFeedback.overallExperience || 5
//       });
//       setIsEditingFeedback(true);
//       setEditingFeedbackId(existingFeedback._id);
//     } else {
//       // New feedback
//       setFeedbackData({
//         rating: 0,
//         review: "",
//         doctorProfessionalism: 5,
//         waitingTime: 5,
//         facilityCleanliness: 5,
//         overallExperience: 5
//       });
//       setIsEditingFeedback(false);
//       setEditingFeedbackId(null);
//     }
    
//     setShowFeedbackModal(true);
//   };

//   const closeFeedbackModal = () => {
//     setShowFeedbackModal(false);
//     setSelectedAppointment(null);
//     setFeedbackData({
//       rating: 0,
//       review: "",
//       doctorProfessionalism: 5,
//       waitingTime: 5,
//       facilityCleanliness: 5,
//       overallExperience: 5
//     });
//     setIsEditingFeedback(false);
//     setEditingFeedbackId(null);
//   };

//   // ✅ FIXED: Handle Feedback Submission with proper patient name
//   const handleFeedbackSubmit = async () => {
//     try {
//       console.log('🚀 Starting feedback submission...');
      
//       if (!feedbackData.rating || feedbackData.rating < 1) {
//         showAlert("error", "Please provide a rating");
//         return;
//       }

//       if (!feedbackData.review.trim()) {
//         showAlert("error", "Please write a review");
//         return;
//       }

//       const token = localStorage.getItem('token');
//       if (!token) {
//         showAlert("error", "Please login to submit feedback");
//         return;
//       }

//       // 🔥 IMPORTANT: Get patient name properly - MULTIPLE SOURCES
//       const getPatientName = () => {
//         console.log('🔍 Getting patient name for feedback submission...');
        
//         // Source 1: Use loggedInUserName if available and valid
//         if (loggedInUserName && loggedInUserName !== "User" && loggedInUserName !== "Patient User") {
//           console.log('✅ Using loggedInUserName:', loggedInUserName);
//           return loggedInUserName;
//         }
        
//         // Source 2: Check localStorage userName
//         const localStorageName = localStorage.getItem('userName');
//         if (localStorageName && localStorageName !== "User" && localStorageName !== "Patient User") {
//           console.log('✅ Using localStorage userName:', localStorageName);
//           return localStorageName;
//         }
        
//         // Source 3: Parse user data from localStorage
//         const userData = localStorage.getItem('user');
//         if (userData) {
//           try {
//             const user = JSON.parse(userData);
//             const nameFromUser = user.name || user.fullName || user.username || 
//                                 (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : null) ||
//                                 user.firstName;
//             if (nameFromUser && nameFromUser !== "User") {
//               console.log('✅ Using name from parsed user data:', nameFromUser);
//               return nameFromUser;
//             }
//           } catch (error) {
//             console.error("Error parsing user data:", error);
//           }
//         }
        
//         // Source 4: Check appointment data
//         if (selectedAppointment?.patientDetails?.fullName) {
//           console.log('✅ Using name from appointment:', selectedAppointment.patientDetails.fullName);
//           return selectedAppointment.patientDetails.fullName;
//         }
        
//         if (selectedAppointment?.patientDetails?.name) {
//           console.log('✅ Using name from appointment.patientDetails.name:', selectedAppointment.patientDetails.name);
//           return selectedAppointment.patientDetails.name;
//         }
        
//         if (selectedAppointment?.patientName) {
//           console.log('✅ Using name from appointment.patientName:', selectedAppointment.patientName);
//           return selectedAppointment.patientName;
//         }
        
//         // Source 5: Email from localStorage
//         const userEmail = localStorage.getItem('userEmail') || localStorage.getItem('email');
//         if (userEmail) {
//           const nameFromEmail = userEmail.split('@')[0];
//           console.log('✅ Using name from email:', nameFromEmail);
//           return nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
//         }
        
//         // Final fallback - but ensure it's a proper name
//         console.log('⚠️ Using fallback patient name');
//         return "Patient";
//       };

//       const patientName = getPatientName();
//       console.log('🎯 FINAL patient name for submission:', patientName);
//       console.log('📝 Appointment ID:', selectedAppointment._id);
//       console.log('👤 Doctor ID:', selectedAppointment.doctorId);
//       console.log('🆔 Patient ID:', loggedInUserId);

//       const feedbackPayload = {
//         appointmentId: selectedAppointment._id,
//         doctorId: selectedAppointment.doctorId,
//         patientId: loggedInUserId,
//         patientName: patientName, // THIS IS THE CRITICAL FIELD
//         doctorName: selectedAppointment.doctorName || "Doctor",
//         rating: feedbackData.rating,
//         review: feedbackData.review,
//         doctorProfessionalism: feedbackData.doctorProfessionalism || 5,
//         waitingTime: feedbackData.waitingTime || 5,
//         facilityCleanliness: feedbackData.facilityCleanliness || 5,
//         overallExperience: feedbackData.overallExperience || 5
//       };

//       console.log('📦 Complete feedback payload:', JSON.stringify(feedbackPayload, null, 2));

//       let response;
      
//       if (isEditingFeedback && editingFeedbackId) {
//         // Update existing feedback
//         console.log('✏️ Updating existing feedback:', editingFeedbackId);
//         response = await axios.put(
//           `http://localhost:5000/api/feedbacks/${editingFeedbackId}`,
//           feedbackPayload,
//           { 
//             headers: { 
//               'Authorization': `Bearer ${token}`,
//               'Content-Type': 'application/json'
//             } 
//           }
//         );
//       } else {
//         // Create new feedback
//         console.log('🆕 Creating new feedback');
//         response = await axios.post(
//           'http://localhost:5000/api/feedbacks',
//           feedbackPayload,
//           { 
//             headers: { 
//               'Authorization': `Bearer ${token}`,
//               'Content-Type': 'application/json'
//             } 
//           }
//         );
//       }

//       console.log('📨 API Response:', response.data);

//       if (response.data.success) {
//         console.log('✅ Feedback submitted successfully!');
//         console.log('📊 Returned feedback data:', response.data.feedback);
        
//         // Update local state
//         setUserFeedbacks(prev => ({
//           ...prev,
//           [selectedAppointment._id]: response.data.feedback
//         }));

//         showAlert("success", 
//           isEditingFeedback 
//             ? "Feedback updated successfully!" 
//             : "Thank you for your feedback!"
//         );
//         closeFeedbackModal();
        
//         // Refresh appointments after a delay
//         setTimeout(() => {
//           fetchAppointments();
//         }, 1500);
//       } else {
//         console.error('❌ API returned success: false', response.data);
//         showAlert("error", response.data.error || "Failed to submit feedback");
//       }
//     } catch (error) {
//       console.error("❌ Error submitting feedback:", error);
//       console.error("Error response data:", error.response?.data);
//       console.error("Error status:", error.response?.status);
//       console.error("Error message:", error.message);
      
//       let errorMessage = "Failed to submit feedback. Please try again.";
      
//       if (error.response?.data?.error) {
//         errorMessage = error.response.data.error;
//       } else if (error.message) {
//         errorMessage = error.message;
//       }
      
//       showAlert("error", errorMessage);
//     }
//   };

//   const deleteFeedback = async (appointmentId, feedbackId) => {
//     if (!window.confirm("Are you sure you want to delete this feedback?")) return;

//     try {
//       const token = localStorage.getItem('token');
//       if (!token) throw new Error("No authentication token found");

//       const response = await axios.delete(
//         `http://localhost:5000/api/feedbacks/${feedbackId}`,
//         { 
//           headers: { 
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           },
//           data: { patientId: loggedInUserId }
//         }
//       );

//       if (response.data.success) {
//         // Remove from local state
//         setUserFeedbacks(prev => {
//           const newFeedbacks = { ...prev };
//           delete newFeedbacks[appointmentId];
//           return newFeedbacks;
//         });

//         showAlert("success", "Feedback deleted successfully!");
//       }
//     } catch (error) {
//       console.error("❌ Error deleting feedback:", error);
//       showAlert("error", error.response?.data?.error || "Failed to delete feedback");
//     }
//   };

//   const toggleFeedbackDetails = (appointmentId) => {
//     setShowFeedbackDetails(prev => ({
//       ...prev,
//       [appointmentId]: !prev[appointmentId]
//     }));
//   };

//   // Navigate to chat
//   const navigateToChat = (appointment) => {
//     if (!appointment?._id) {
//       showAlert("error", "Cannot open chat: Invalid appointment");
//       return;
//     }

//     if (appointment.status === "cancelled") {
//       showAlert("error", "Cannot chat for cancelled appointments");
//       return;
//     }

//     navigate(`/chat/${appointment._id}`);
//   };

//   // Filter appointments
//   const filterAppointments = () => {
//     const now = new Date();
    
//     let filtered = appointments;
    
//     switch (filter) {
//       case "upcoming":
//         filtered = appointments.filter(apt => 
//           new Date(apt.appointmentDate) >= now && 
//           apt.status !== "cancelled"
//         );
//         break;
//       case "past":
//         filtered = appointments.filter(apt => 
//           new Date(apt.appointmentDate) < now && 
//           apt.status !== "cancelled"
//         );
//         break;
//       case "cancelled":
//         filtered = appointments.filter(apt => apt.status === "cancelled");
//         break;
//       case "completed":
//         filtered = appointments.filter(apt => apt.status === "completed");
//         break;
//       default:
//         filtered = appointments;
//     }
    
//     setFilteredAppointments(filtered);
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "Date not set";
//     return new Date(dateString).toLocaleDateString('en-US', {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     });
//   };

//   const formatTime = (timeString) => {
//     if (!timeString) return "Time not set";
//     if (timeString.includes('AM') || timeString.includes('PM')) {
//       return timeString;
//     }
//     const [hours, minutes] = timeString.split(':');
//     const hour = parseInt(hours);
//     const ampm = hour >= 12 ? 'PM' : 'AM';
//     const formattedHour = hour % 12 || 12;
//     return `${formattedHour}:${minutes} ${ampm}`;
//   };

//   const canCancelAppointment = (appointment) => {
//     if (appointment.status === "cancelled" || appointment.status === "completed") {
//       return false;
//     }

//     const appointmentDate = new Date(appointment.appointmentDate);
//     const now = new Date();
//     return appointmentDate > now;
//   };

//   const canUseChat = (appointment) => {
//     if (!appointment?._id) return false;
//     if (appointment.status === "cancelled") return false;
    
//     if (appointment.status === "completed") {
//       const appointmentDate = new Date(appointment.appointmentDate);
//       const now = new Date();
//       const daysSinceAppointment = (now - appointmentDate) / (1000 * 60 * 60 * 24);
//       return daysSinceAppointment <= 7;
//     }
    
//     return true;
//   };

//   const canGiveFeedback = (appointment) => {
//     // Only completed appointments can receive feedback
//     return appointment.status === "completed";
//   };

//   const getStatusBadge = (status) => {
//     const statusConfig = {
//       pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", text: "Pending" },
//       confirmed: { color: "bg-green-100 text-green-800 border-green-200", text: "Confirmed" },
//       cancelled: { color: "bg-red-100 text-red-800 border-red-200", text: "Cancelled" },
//       completed: { color: "bg-blue-100 text-blue-800 border-blue-200", text: "Completed" }
//     };
    
//     const config = statusConfig[status] || statusConfig.pending;
    
//     return (
//       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
//         {config.text}
//       </span>
//     );
//   };

//   const getAppointmentStats = () => {
//     const now = new Date();
    
//     const total = appointments.length;
//     const upcoming = appointments.filter(apt => 
//       new Date(apt.appointmentDate) >= now && 
//       apt.status !== "cancelled"
//     ).length;
//     const past = appointments.filter(apt => 
//       new Date(apt.appointmentDate) < now && 
//       apt.status !== "cancelled"
//     ).length;
//     const cancelled = appointments.filter(apt => apt.status === "cancelled").length;
//     const completed = appointments.filter(apt => apt.status === "completed").length;
//     const withFeedback = Object.keys(userFeedbacks).length;

//     return { total, upcoming, past, cancelled, completed, withFeedback };
//   };

//   const showAlert = (type, message) => {
//     setAlert({ show: true, type, message });
//     setTimeout(() => setAlert({ show: false, type: "", message: "" }), 5000);
//   };

//   const openCancelModal = (appointment) => {
//     if (appointment.status === "cancelled") {
//       showAlert("error", "This appointment is already cancelled.");
//       return;
//     }

//     if (appointment.status === "completed") {
//       showAlert("error", "This appointment has already been completed.");
//       return;
//     }

//     const appointmentDate = new Date(appointment.appointmentDate);
//     const now = new Date();
//     if (appointmentDate < now) {
//       showAlert("error", "Cannot cancel past appointments.");
//       return;
//     }

//     if (!["pending", "confirmed"].includes(appointment.status)) {
//       showAlert("error", `Cannot cancel appointment with status: ${appointment.status}`);
//       return;
//     }

//     setCancellingAppointment(appointment);
//     setShowCancelModal(true);
//   };

//   const closeCancelModal = () => {
//     setShowCancelModal(false);
//     setCancellingAppointment(null);
//     setCancelReason("");
//   };

//   const handleCancelConfirm = () => {
//     if (!cancelReason.trim()) {
//       showAlert("error", "Please provide a reason for cancellation.");
//       return;
//     }
//     if (cancellingAppointment && cancellingAppointment._id) {
//       cancelAppointment(cancellingAppointment._id, cancelReason);
//     }
//   };

//   const stats = getAppointmentStats();

//   // Render Stars for Rating
//   const renderStars = (rating) => {
//     return (
//       <div className="flex items-center">
//         {[1, 2, 3, 4, 5].map((star) => (
//           <FaStar
//             key={star}
//             className={`w-4 h-4 ${
//               star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
//             }`}
//           />
//         ))}
//       </div>
//     );
//   };

//   // Render Rating Input
//   const renderRatingInput = (label, value, onChange) => {
//     return (
//       <div className="mb-4">
//         <label className="block text-sm font-medium text-gray-700 mb-2">
//           {label}
//         </label>
//         <div className="flex items-center space-x-1">
//           {[1, 2, 3, 4, 5].map((star) => (
//             <button
//               key={star}
//               type="button"
//               onClick={() => onChange(star)}
//               className="focus:outline-none"
//             >
//               <FaStar
//                 className={`w-8 h-8 ${
//                   star <= value ? 'text-yellow-400 fill-current' : 'text-gray-300'
//                 } hover:text-yellow-500 transition-colors`}
//               />
//             </button>
//           ))}
//           <span className="ml-2 text-gray-600 font-medium">{value}/5</span>
//         </div>
//       </div>
//     );
//   };

//   // Cancel Modal Component
//   const CancelModal = () => {
//     if (!showCancelModal || !cancellingAppointment) return null;

//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//         <div className="bg-white rounded-2xl max-w-md w-full p-6">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-xl font-semibold text-gray-900">Cancel Appointment</h3>
//             <button onClick={closeCancelModal} className="text-gray-500 hover:text-gray-700">
//               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>

//           <div className="mb-4">
//             <p className="text-gray-700 mb-2">
//               Are you sure you want to cancel your appointment with{" "}
//               <strong>Dr. {cancellingAppointment.doctorName}</strong>?
//             </p>
//             <p className="text-sm text-gray-600 mb-4">
//               Scheduled for {formatDate(cancellingAppointment.appointmentDate)} at{" "}
//               {formatTime(cancellingAppointment.timeSlot?.startTime)}
//             </p>
//           </div>

//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Reason for cancellation <span className="text-red-500">*</span>
//             </label>
//             <textarea
//               value={cancelReason}
//               onChange={(e) => setCancelReason(e.target.value)}
//               placeholder="Please provide a reason for cancellation..."
//               rows="3"
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               required
//             />
//           </div>

//           <div className="flex gap-3">
//             <button
//               onClick={closeCancelModal}
//               className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-700 transition duration-200"
//             >
//               Keep Appointment
//             </button>
//             <button
//               onClick={handleCancelConfirm}
//               disabled={!cancelReason.trim()}
//               className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
//             >
//               Confirm Cancellation
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // Feedback Modal Component - UPDATED to show patient name
//   const FeedbackModal = () => {
//     if (!showFeedbackModal || !selectedAppointment) return null;

//     const feedback = userFeedbacks[selectedAppointment._id];
    
//     // Get patient name for display
//     const getDisplayPatientName = () => {
//       if (loggedInUserName && loggedInUserName !== "User" && loggedInUserName !== "Patient User") {
//         return loggedInUserName;
//       }
      
//       const localStorageName = localStorage.getItem('userName');
//       if (localStorageName && localStorageName !== "User" && localStorageName !== "Patient User") {
//         return localStorageName;
//       }
      
//       if (selectedAppointment?.patientDetails?.fullName) {
//         return selectedAppointment.patientDetails.fullName;
//       }
      
//       return "You";
//     };
    
//     const displayPatientName = getDisplayPatientName();

//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//         <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
//           <div className="flex items-center justify-between mb-6">
//             <h3 className="text-xl font-semibold text-gray-900">
//               {isEditingFeedback ? "Edit Your Feedback" : "Share Your Experience"}
//             </h3>
//             <button onClick={closeFeedbackModal} className="text-gray-500 hover:text-gray-700">
//               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>

//           <div className="mb-6">
//             <div className="bg-blue-50 p-4 rounded-lg mb-4">
//               <h4 className="font-medium text-gray-900 mb-1">Appointment Details</h4>
//               <p className="text-sm text-gray-600">
//                 <strong>Patient:</strong> {displayPatientName}
//               </p>
//               <p className="text-sm text-gray-600">
//                 <strong>Doctor:</strong> Dr. {selectedAppointment.doctorName} • {selectedAppointment.doctorSpecialization}
//               </p>
//               <p className="text-sm text-gray-600">
//                 <strong>Date & Time:</strong> {formatDate(selectedAppointment.appointmentDate)} at{" "}
//                 {formatTime(selectedAppointment.timeSlot?.startTime)}
//               </p>
//             </div>

//             {/* Overall Rating */}
//             {renderRatingInput("Overall Rating", feedbackData.rating, (rating) =>
//               setFeedbackData(prev => ({ ...prev, rating }))
//             )}

//             {/* Detailed Ratings */}
//             <div className="space-y-4">
//               {renderRatingInput("Doctor Professionalism", feedbackData.doctorProfessionalism, (value) =>
//                 setFeedbackData(prev => ({ ...prev, doctorProfessionalism: value }))
//               )}
              
//               {renderRatingInput("Waiting Time", feedbackData.waitingTime, (value) =>
//                 setFeedbackData(prev => ({ ...prev, waitingTime: value }))
//               )}
              
//               {renderRatingInput("Facility Cleanliness", feedbackData.facilityCleanliness, (value) =>
//                 setFeedbackData(prev => ({ ...prev, facilityCleanliness: value }))
//               )}
              
//               {renderRatingInput("Overall Experience", feedbackData.overallExperience, (value) =>
//                 setFeedbackData(prev => ({ ...prev, overallExperience: value }))
//               )}
//             </div>

//             {/* Review Text */}
//             <div className="mb-6">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Your Review <span className="text-red-500">*</span>
//               </label>
//               <textarea
//                 value={feedbackData.review}
//                 onChange={(e) => setFeedbackData(prev => ({ ...prev, review: e.target.value }))}
//                 placeholder={`Share your experience with Dr. ${selectedAppointment.doctorName}...`}
//                 rows="4"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 required
//               />
//               <p className="text-xs text-gray-500 mt-1">
//                 Your feedback will help improve healthcare services for everyone.
//               </p>
//             </div>
//           </div>

//           <div className="flex gap-3">
//             <button
//               onClick={closeFeedbackModal}
//               className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-700 transition duration-200"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleFeedbackSubmit}
//               disabled={!feedbackData.rating || !feedbackData.review.trim()}
//               className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
//             >
//               {isEditingFeedback ? "Update Feedback" : "Submit Feedback"}
//             </button>
//           </div>
          
//           <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
//             <p className="text-xs text-yellow-700">
//               <strong>Note:</strong> Your name ({displayPatientName}) will be sent with this feedback to help doctors identify patients.
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // Feedback Card Component
//   const FeedbackCard = ({ appointment, feedback }) => {
//     const isDetailsOpen = showFeedbackDetails[appointment._id] || false;

//     return (
//       <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mt-4 border border-green-200">
//         <div className="flex items-center justify-between mb-3">
//           <div className="flex items-center">
//             <FaComment className="text-green-600 mr-2" />
//             <h4 className="font-semibold text-gray-900">Your Feedback</h4>
//           </div>
//           <div className="flex items-center space-x-2">
//             <button
//               onClick={() => openFeedbackModal(appointment, feedback)}
//               className="text-blue-600 hover:text-blue-800"
//               title="Edit feedback"
//             >
//               <FaEdit className="w-4 h-4" />
//             </button>
//             <button
//               onClick={() => deleteFeedback(appointment._id, feedback._id)}
//               className="text-red-600 hover:text-red-800"
//               title="Delete feedback"
//             >
//               <FaTrash className="w-4 h-4" />
//             </button>
//             <button
//               onClick={() => toggleFeedbackDetails(appointment._id)}
//               className="text-gray-600 hover:text-gray-800"
//               title={isDetailsOpen ? "Hide details" : "View details"}
//             >
//               <FaEye className="w-4 h-4" />
//             </button>
//           </div>
//         </div>

//         <div className="flex items-center justify-between mb-2">
//           <div className="flex items-center">
//             {renderStars(feedback.rating)}
//             <span className="ml-2 text-sm font-medium text-gray-700">
//               {feedback.rating}/5
//             </span>
//           </div>
//           <span className="text-xs text-gray-500">
//             {new Date(feedback.createdAt).toLocaleDateString()}
//           </span>
//         </div>

//         <p className="text-gray-700 mb-3">{feedback.review}</p>

//         {isDetailsOpen && (
//           <div className="bg-white rounded-lg p-4 mt-3">
//             <h5 className="font-medium text-gray-900 mb-3">Detailed Ratings</h5>
//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <span className="text-sm text-gray-600">Doctor Professionalism</span>
//                 <div className="flex items-center">
//                   {renderStars(feedback.doctorProfessionalism)}
//                   <span className="ml-2 text-sm font-medium">{feedback.doctorProfessionalism}/5</span>
//                 </div>
//               </div>
//               <div>
//                 <span className="text-sm text-gray-600">Waiting Time</span>
//                 <div className="flex items-center">
//                   {renderStars(feedback.waitingTime)}
//                   <span className="ml-2 text-sm font-medium">{feedback.waitingTime}/5</span>
//                 </div>
//               </div>
//               <div>
//                 <span className="text-sm text-gray-600">Facility Cleanliness</span>
//                 <div className="flex items-center">
//                   {renderStars(feedback.facilityCleanliness)}
//                   <span className="ml-2 text-sm font-medium">{feedback.facilityCleanliness}/5</span>
//                 </div>
//               </div>
//               <div>
//                 <span className="text-sm text-gray-600">Overall Experience</span>
//                 <div className="flex items-center">
//                   {renderStars(feedback.overallExperience)}
//                   <span className="ml-2 text-sm font-medium">{feedback.overallExperience}/5</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   if (!loggedInUserId) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
//         <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center">
//             <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 max-w-md mx-auto">
//               <h3 className="text-xl font-semibold text-yellow-800 mb-2">Login Required</h3>
//               <p className="text-yellow-600 mb-4">Please login to view your appointments</p>
//               <button
//                 onClick={() => navigate("/login")}
//                 className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition duration-200"
//               >
//                 Go to Login
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
//         <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
//             <h3 className="text-xl font-semibold text-gray-700">Loading Your Appointments</h3>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
//         <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center">
//             <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
//               <h3 className="text-xl font-semibold text-red-800 mb-2">Error Loading Appointments</h3>
//               <p className="text-red-600 mb-4">{error}</p>
//               <div className="space-y-2">
//                 <button
//                   onClick={fetchAppointments}
//                   className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition duration-200 block w-full"
//                 >
//                   Try Again
//                 </button>
//                 <button
//                   onClick={() => navigate("/doctors")}
//                   className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200 block w-full"
//                 >
//                   Book New Appointment
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
//       <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Alert */}
//         {alert.show && (
//           <div className={`mb-6 border rounded-lg p-4 ${
//             alert.type === "success" 
//               ? "bg-green-50 border-green-200 text-green-800" 
//               : "bg-red-50 border-red-200 text-red-800"
//           }`}>
//             <div className="flex items-center">
//               <FaCheckCircle className={`w-5 h-5 mr-2 ${
//                 alert.type === "success" ? "text-green-400" : "text-red-400"
//               }`} />
//               <span className="font-medium">{alert.message}</span>
//             </div>
//           </div>
//         )}

//         {/* Header */}
//         <div className="text-center mb-8">
//           <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
//             My Appointments
//           </h1>
//           <p className="text-lg text-gray-600">
//             Welcome back, {loggedInUserName}! Manage your medical appointments and share feedback
//           </p>
//         </div>

//         {/* Stats Cards - Now includes feedback stats */}
//         <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
//           <div className="bg-white rounded-xl shadow-lg p-4 text-center">
//             <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
//             <div className="text-sm text-gray-600">Total</div>
//           </div>
//           <div className="bg-white rounded-xl shadow-lg p-4 text-center">
//             <div className="text-2xl font-bold text-green-600">{stats.upcoming}</div>
//             <div className="text-sm text-gray-600">Upcoming</div>
//           </div>
//           <div className="bg-white rounded-xl shadow-lg p-4 text-center">
//             <div className="text-2xl font-bold text-purple-600">{stats.completed}</div>
//             <div className="text-sm text-gray-600">Completed</div>
//           </div>
//           <div className="bg-white rounded-xl shadow-lg p-4 text-center">
//             <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
//             <div className="text-sm text-gray-600">Cancelled</div>
//           </div>
//           <div className="bg-white rounded-xl shadow-lg p-4 text-center">
//             <div className="text-2xl font-bold text-yellow-600">{stats.withFeedback}</div>
//             <div className="text-sm text-gray-600">With Feedback</div>
//           </div>
//           <div className="bg-white rounded-xl shadow-lg p-4 text-center">
//             <div className="text-2xl font-bold text-indigo-600">
//               {stats.completed > 0 ? Math.round((stats.withFeedback / stats.completed) * 100) : 0}%
//             </div>
//             <div className="text-sm text-gray-600">Feedback Rate</div>
//           </div>
//         </div>

//         {/* Filter Buttons - Added Completed filter */}
//         <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
//           <div className="flex flex-wrap gap-2">
//             {["all", "upcoming", "past", "completed", "cancelled"].map((filterOption) => (
//               <button
//                 key={filterOption}
//                 onClick={() => setFilter(filterOption)}
//                 className={`px-4 py-2 rounded-lg font-medium transition duration-200 capitalize ${
//                   filter === filterOption
//                     ? filterOption === "cancelled" 
//                       ? "bg-red-600 text-white"
//                       : filterOption === "completed"
//                       ? "bg-purple-600 text-white"
//                       : "bg-blue-600 text-white"
//                     : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                 }`}
//               >
//                 {filterOption === "all" ? "All Appointments" : filterOption}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Appointments List */}
//         <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//           {filteredAppointments.length === 0 ? (
//             <div className="text-center py-12">
//               <h3 className="text-xl font-semibold text-gray-700 mb-2">No Appointments Found</h3>
//               <p className="text-gray-500 mb-4">
//                 {filter === "all" 
//                   ? "You don't have any appointments yet." 
//                   : `No ${filter} appointments found.`}
//               </p>
//               <button
//                 onClick={() => navigate("/doctors")}
//                 className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-200"
//               >
//                 Book New Appointment
//               </button>
//             </div>
//           ) : (
//             <div className="divide-y divide-gray-200">
//               {filteredAppointments.map((appointment) => {
//                 const hasFeedback = userFeedbacks[appointment._id];
//                 const isCompleted = appointment.status === "completed";
                
//                 return (
//                   <div key={appointment._id} className="p-6 hover:bg-gray-50 transition duration-200">
//                     <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//                       {/* Appointment Details */}
//                       <div className="flex-1">
//                         <div className="flex items-start justify-between mb-3">
//                           <div>
//                             <h3 className="text-lg font-semibold text-gray-900">
//                               Dr. {appointment.doctorName || "Doctor Name Not Available"}
//                             </h3>
//                             <p className="text-gray-600">{appointment.doctorSpecialization}</p>
//                           </div>
//                           <div className="text-right">
//                             {getStatusBadge(appointment.status || "pending")}
//                             <p className="text-sm text-gray-500 mt-1">
//                               #{appointment.appointmentNumber || "N/A"}
//                             </p>
//                           </div>
//                         </div>

//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//                           <div>
//                             <p className="text-gray-600">Date & Time</p>
//                             <p className="font-semibold text-gray-900">
//                               {formatDate(appointment.appointmentDate)} •{" "}
//                               {formatTime(appointment.timeSlot?.startTime)}
//                             </p>
//                           </div>
                          
//                           <div>
//                             <p className="text-gray-600">Patient</p>
//                             <p className="font-semibold text-gray-900">
//                               {appointment.patientDetails?.fullName || loggedInUserName || "Patient"}
//                             </p>
//                           </div>
//                         </div>

//                         {/* Show existing feedback or feedback button */}
//                         {isCompleted && (
//                           <div className="mt-4">
//                             {hasFeedback ? (
//                               <FeedbackCard appointment={appointment} feedback={hasFeedback} />
//                             ) : (
//                               <button
//                                 onClick={() => openFeedbackModal(appointment)}
//                                 className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
//                               >
//                                 <FaStar className="mr-2" />
//                                 Share Your Experience
//                               </button>
//                             )}
//                           </div>
//                         )}
//                       </div>

//                       {/* Action Buttons */}
//                       <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:items-end">
//                         <button
//                           onClick={() => navigate(`/appointments/${appointment._id}`)}
//                           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
//                         >
//                           View Details
//                         </button>
                        
//                         {/* Chat Button */}
//                         {canUseChat(appointment) && (
//                           <button
//                             onClick={() => navigateToChat(appointment)}
//                             className="relative px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 font-medium flex items-center justify-center"
//                           >
//                             <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
//                             </svg>
//                             Chat
//                             {unreadCounts[appointment._id] > 0 && (
//                               <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
//                                 {unreadCounts[appointment._id] > 9 ? '9+' : unreadCounts[appointment._id]}
//                               </span>
//                             )}
//                           </button>
//                         )}
                        
//                         {/* Cancel Button */}
//                         {canCancelAppointment(appointment) && (
//                           <button
//                             onClick={() => openCancelModal(appointment)}
//                             className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
//                           >
//                             Cancel
//                           </button>
//                         )}

//                         {/* Feedback Button for completed appointments without feedback */}
//                         {isCompleted && !hasFeedback && (
//                           <button
//                             onClick={() => openFeedbackModal(appointment)}
//                             className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition duration-200"
//                           >
//                             <FaStar className="inline-block mr-2" />
//                             Give Feedback
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>

//         {/* Feedback Info Box */}
//         <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
//           <div className="flex items-start">
//             <div className="flex-shrink-0 bg-green-100 p-3 rounded-lg">
//               <FaStar className="w-6 h-6 text-green-600" />
//             </div>
//             <div className="ml-4">
//               <h4 className="text-lg font-semibold text-gray-900">About Feedback System</h4>
//               <ul className="mt-2 space-y-2 text-sm text-gray-600">
//                 <li className="flex items-start">
//                   <FaCheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
//                   <span>Share your experience to help improve healthcare services</span>
//                 </li>
//                 <li className="flex items-start">
//                   <FaCheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
//                   <span>Rate doctors and facilities to help other patients</span>
//                 </li>
//                 <li className="flex items-start">
//                   <FaCheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
//                   <span>Your feedback is anonymous to the doctor</span>
//                 </li>
//                 <li className="flex items-start">
//                   <FaCheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
//                   <span>You can edit or delete your feedback anytime</span>
//                 </li>
//               </ul>
//             </div>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex flex-wrap gap-3 mt-6">
//           <button
//             onClick={fetchAppointments}
//             className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200"
//           >
//             Refresh
//           </button>
//           <button
//             onClick={() => navigate("/doctors")}
//             className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
//           >
//             Book New Appointment
//           </button>
//           {stats.completed > stats.withFeedback && (
//             <button
//               onClick={() => {
//                 const appointmentWithoutFeedback = appointments.find(
//                   apt => apt.status === "completed" && !userFeedbacks[apt._id]
//                 );
//                 if (appointmentWithoutFeedback) {
//                   openFeedbackModal(appointmentWithoutFeedback);
//                 }
//               }}
//               className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition duration-200"
//             >
//               Give Missing Feedback ({stats.completed - stats.withFeedback})
//             </button>
//           )}
          
//           {/* Debug Button */}
//           {/* <button
//             onClick={() => {
//               console.log('=== DEBUG INFO ===');
//               console.log('loggedInUserId:', loggedInUserId);
//               console.log('loggedInUserName:', loggedInUserName);
//               console.log('LocalStorage userName:', localStorage.getItem('userName'));
//               console.log('LocalStorage user:', localStorage.getItem('user'));
//               console.log('All localStorage items:');
//               for (let i = 0; i < localStorage.length; i++) {
//                 const key = localStorage.key(i);
//                 console.log(`${key}: ${localStorage.getItem(key)}`);
//               }
//               console.log('========================');
//             }}
//             className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200 text-sm"
//           >
//             Debug Info
//           </button> */}
//         </div>
//       </div>

//       {/* Modals */}
//       <CancelModal />
//       <FeedbackModal />
//     </div>
//   );
// };

// export default MyAppointments;














// src/pages/MyAppointments.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaStar, FaComment, FaEye, FaEdit, FaTrash, FaCheckCircle } from "react-icons/fa";

const MyAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [cancellingAppointment, setCancellingAppointment] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });
  const [unreadCounts, setUnreadCounts] = useState({});
  
  // Feedback States
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [feedbackData, setFeedbackData] = useState({
    rating: 0,
    review: "",
    doctorProfessionalism: 5,
    waitingTime: 5,
    facilityCleanliness: 5,
    overallExperience: 5
  });
  const [userFeedbacks, setUserFeedbacks] = useState({}); // Store feedbacks by appointment ID
  const [showFeedbackDetails, setShowFeedbackDetails] = useState({}); // Track which feedback details are open
  const [isEditingFeedback, setIsEditingFeedback] = useState(false);
  const [editingFeedbackId, setEditingFeedbackId] = useState(null);
  
  // User states
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [loggedInUserName, setLoggedInUserName] = useState("Patient User");

  // ✅ FIXED: Get logged in user ID and Name properly
  const getCurrentUserInfo = () => {
    console.log('🔍 Getting current user info from localStorage...');
    
    // Check all possible localStorage keys for user ID
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    let userId = null;
    let userName = "Patient User";
    
    // First, try to parse user data from 'user' key
    if (userData) {
      try {
        const user = JSON.parse(userData);
        console.log('📊 Parsed user data:', user);
        
        // Extract user ID
        userId = user._id || user.id || user.userId || 
                 localStorage.getItem('currentUserId') || 
                 localStorage.getItem('userId');
        
        // Extract user name
        userName = user.name || user.fullName || user.username || 
                  (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : null) ||
                  user.firstName || user.email?.split('@')[0] || "Patient User";
        
        console.log('✅ Extracted from user data - ID:', userId, 'Name:', userName);
      } catch (error) {
        console.error("❌ Error parsing user data:", error);
      }
    }
    
    // If no user data found, check other localStorage keys
    if (!userId) {
      userId = localStorage.getItem('currentUserId') || 
               localStorage.getItem('userId') ||
               localStorage.getItem('user_id');
    }
    
    if (!userName || userName === "Patient User") {
      userName = localStorage.getItem('userName') || 
                 localStorage.getItem('fullName') ||
                 localStorage.getItem('name') ||
                 "Patient User";
    }
    
    console.log('🎯 Final user info - ID:', userId, 'Name:', userName);
    
    return {
      userId,
      userName
    };
  };

  useEffect(() => {
    const { userId, userName } = getCurrentUserInfo();
    
    if (!userId) {
      setError("Please login to view your appointments");
      setIsLoading(false);
      return;
    }
    
    // Store the user ID and name in state
    setLoggedInUserId(userId);
    setLoggedInUserName(userName);
    
    // If we don't have a proper name, fetch user profile
    if (!userName || userName === "Patient User") {
      fetchUserProfile(userId);
    } else {
      // Save the name to localStorage for future use
      localStorage.setItem('userName', userName);
    }
    
    fetchAppointments(userId);
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, filter]);

  // Fetch user profile to get name
  const fetchUserProfile = async (userId) => {
    const token = localStorage.getItem('token');
    if (!token || !userId) {
      console.log('❌ No token or userId for profile fetch');
      return;
    }
    
    try {
      console.log('👤 Fetching user profile for ID:', userId);
      
      const response = await axios.get(
        `http://localhost:5000/api/users/${userId}`,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        const user = response.data.user;
        console.log('✅ User profile fetched:', user);
        
        // Extract user name with multiple fallbacks
        const userName = user.name || user.fullName || user.username || 
                        (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : null) ||
                        user.firstName || user.email?.split('@')[0] || "Patient User";
        
        // Save user data to localStorage
        localStorage.setItem('userName', userName);
        localStorage.setItem('user', JSON.stringify(user));
        
        console.log('🔄 Updated user name in localStorage:', userName);
        
        // Update the state
        setLoggedInUserName(userName);
      }
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      console.log('Using existing localStorage data');
      
      // If API fails, check if there's an email in localStorage
      const userEmail = localStorage.getItem('userEmail') || localStorage.getItem('email');
      if (userEmail) {
        const nameFromEmail = userEmail.split('@')[0];
        const capitalized = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
        localStorage.setItem('userName', capitalized);
        setLoggedInUserName(capitalized);
        console.log('📧 Using email to create username:', capitalized);
      }
    }
  };

  // Fetch appointments and feedbacks
  const fetchAppointments = async (userId) => {
    try {
      setIsLoading(true);
      setError("");

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("No authentication token found");
      }

      if (!userId) {
        throw new Error("User ID not available");
      }

      console.log('📅 Fetching appointments for user:', userId);
      
      // Fetch appointments
      const appointmentsResponse = await axios.get(
        `http://localhost:5000/api/appointments/user/${userId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (appointmentsResponse.data.success) {
        const userAppointments = appointmentsResponse.data.appointments || [];
        console.log('✅ Appointments fetched:', userAppointments.length);
        setAppointments(userAppointments);
        
        // Fetch feedbacks for each appointment
        await fetchAllFeedbacks(userAppointments, userId);
        
        // Fetch unread counts
        await fetchUnreadCounts(userId);
      }
    } catch (error) {
      console.error("❌ Error fetching data:", error);
      setError(
        error.response?.data?.error ||
        error.message ||
        "Failed to load appointments. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch feedbacks for all appointments
  const fetchAllFeedbacks = async (appointmentsList, userId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !userId) return;

      const feedbacksMap = {};
      
      for (const appointment of appointmentsList) {
        if (appointment.status === "completed") {
          try {
            const response = await axios.get(
              `http://localhost:5000/api/feedbacks/appointment/${appointment._id}/user/${userId}`,
              { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
            if (response.data.success && response.data.feedback) {
              feedbacksMap[appointment._id] = response.data.feedback;
            }
          } catch (error) {
            // No feedback exists yet, which is fine
            console.log(`No feedback for appointment ${appointment._id}:`, error.message);
          }
        }
      }
      
      setUserFeedbacks(feedbacksMap);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
    }
  };

  // Fetch unread message counts
  const fetchUnreadCounts = async (userId) => {
    if (!userId) return;

    try {
      const response = await axios.get(
        `http://localhost:5000/api/chat/unread/${userId}/patient`
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

  // Cancel Appointment Function
  const cancelAppointment = async (appointmentId, reason) => {
    try {
      setCancellingAppointment(appointmentId);
      
      const token = localStorage.getItem('token');
      if (!token) throw new Error("No authentication token found");

      const cancelData = {
        userId: loggedInUserId,
        cancellationReason: reason
      };

      const response = await axios.put(
        `http://localhost:5000/api/appointments/${appointmentId}/cancel`,
        cancelData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setAppointments(prevAppointments =>
          prevAppointments.map(apt =>
            apt._id === appointmentId
              ? { 
                  ...apt, 
                  status: "cancelled",
                  cancellationReason: reason,
                  cancelledAt: new Date().toISOString(),
                  ...response.data.appointment
                }
              : apt
          )
        );

        showAlert("success", "Appointment cancelled successfully!");
        closeCancelModal();
      }
    } catch (error) {
      console.error("❌ Error cancelling appointment:", error);
      showAlert("error", error.response?.data?.error || "Failed to cancel appointment");
    } finally {
      setCancellingAppointment(null);
    }
  };

  // Feedback Functions
  const openFeedbackModal = (appointment, existingFeedback = null) => {
    console.log('=== OPENING FEEDBACK MODAL ===');
    console.log('Appointment ID:', appointment._id);
    console.log('Current loggedInUserName:', loggedInUserName);
    console.log('LocalStorage userName:', localStorage.getItem('userName'));
    console.log('Patient details:', appointment.patientDetails);
    console.log('=============================');
    
    setSelectedAppointment(appointment);
    
    if (existingFeedback) {
      // Edit existing feedback
      setFeedbackData({
        rating: existingFeedback.rating,
        review: existingFeedback.review || "",
        doctorProfessionalism: existingFeedback.doctorProfessionalism || 5,
        waitingTime: existingFeedback.waitingTime || 5,
        facilityCleanliness: existingFeedback.facilityCleanliness || 5,
        overallExperience: existingFeedback.overallExperience || 5
      });
      setIsEditingFeedback(true);
      setEditingFeedbackId(existingFeedback._id);
    } else {
      // New feedback
      setFeedbackData({
        rating: 0,
        review: "",
        doctorProfessionalism: 5,
        waitingTime: 5,
        facilityCleanliness: 5,
        overallExperience: 5
      });
      setIsEditingFeedback(false);
      setEditingFeedbackId(null);
    }
    
    setShowFeedbackModal(true);
  };

  const closeFeedbackModal = () => {
    setShowFeedbackModal(false);
    setSelectedAppointment(null);
    setFeedbackData({
      rating: 0,
      review: "",
      doctorProfessionalism: 5,
      waitingTime: 5,
      facilityCleanliness: 5,
      overallExperience: 5
    });
    setIsEditingFeedback(false);
    setEditingFeedbackId(null);
  };

  // ✅ FIXED: Handle Feedback Submission with proper patient name
  const handleFeedbackSubmit = async () => {
    try {
      console.log('🚀 Starting feedback submission...');
      
      if (!feedbackData.rating || feedbackData.rating < 1) {
        showAlert("error", "Please provide a rating");
        return;
      }

      if (!feedbackData.review.trim()) {
        showAlert("error", "Please write a review");
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        showAlert("error", "Please login to submit feedback");
        return;
      }

      if (!loggedInUserId) {
        showAlert("error", "User not identified. Please login again.");
        return;
      }

      // Create a proper patient name - with multiple fallbacks
      const getPatientName = () => {
        // Use the current user name first
        if (loggedInUserName && loggedInUserName !== "Patient User") {
          return loggedInUserName;
        }
        
        // Check appointment data
        if (selectedAppointment?.patientDetails?.fullName) {
          return selectedAppointment.patientDetails.fullName;
        }
        
        if (selectedAppointment?.patientDetails?.name) {
          return selectedAppointment.patientDetails.name;
        }
        
        if (selectedAppointment?.patientName) {
          return selectedAppointment.patientName;
        }
        
        // Use email as last resort
        const userEmail = localStorage.getItem('userEmail') || localStorage.getItem('email');
        if (userEmail) {
          const nameFromEmail = userEmail.split('@')[0];
          return nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
        }
        
        return "Patient";
      };

      const patientName = getPatientName();
      console.log('🎯 FINAL patient name for submission:', patientName);
      console.log('📝 Using User ID:', loggedInUserId);
      console.log('📝 Appointment ID:', selectedAppointment._id);

      const feedbackPayload = {
        appointmentId: selectedAppointment._id,
        doctorId: selectedAppointment.doctorId,
        patientId: loggedInUserId,
        patientName: patientName,
        doctorName: selectedAppointment.doctorName || "Doctor",
        rating: feedbackData.rating,
        review: feedbackData.review,
        doctorProfessionalism: feedbackData.doctorProfessionalism || 5,
        waitingTime: feedbackData.waitingTime || 5,
        facilityCleanliness: feedbackData.facilityCleanliness || 5,
        overallExperience: feedbackData.overallExperience || 5
      };

      console.log('📦 Complete feedback payload:', JSON.stringify(feedbackPayload, null, 2));

      let response;
      
      if (isEditingFeedback && editingFeedbackId) {
        // Update existing feedback
        console.log('✏️ Updating existing feedback:', editingFeedbackId);
        response = await axios.put(
          `http://localhost:5000/api/feedbacks/${editingFeedbackId}`,
          feedbackPayload,
          { 
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            } 
          }
        );
      } else {
        // Create new feedback
        console.log('🆕 Creating new feedback');
        response = await axios.post(
          'http://localhost:5000/api/feedbacks',
          feedbackPayload,
          { 
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            } 
          }
        );
      }

      console.log('📨 API Response:', response.data);

      if (response.data.success) {
        console.log('✅ Feedback submitted successfully!');
        console.log('📊 Returned feedback data:', response.data.feedback);
        
        // Update local state
        setUserFeedbacks(prev => ({
          ...prev,
          [selectedAppointment._id]: response.data.feedback
        }));

        showAlert("success", 
          isEditingFeedback 
            ? "Feedback updated successfully!" 
            : "Thank you for your feedback!"
        );
        closeFeedbackModal();
        
        // Refresh appointments after a delay
        setTimeout(() => {
          fetchAppointments(loggedInUserId);
        }, 1500);
      } else {
        console.error('❌ API returned success: false', response.data);
        showAlert("error", response.data.error || "Failed to submit feedback");
      }
    } catch (error) {
      console.error("❌ Error submitting feedback:", error);
      console.error("Error response data:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Error message:", error.message);
      
      let errorMessage = "Failed to submit feedback. Please try again.";
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showAlert("error", errorMessage);
    }
  };

  const deleteFeedback = async (appointmentId, feedbackId) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("No authentication token found");

      const response = await axios.delete(
        `http://localhost:5000/api/feedbacks/${feedbackId}`,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          data: { patientId: loggedInUserId }
        }
      );

      if (response.data.success) {
        // Remove from local state
        setUserFeedbacks(prev => {
          const newFeedbacks = { ...prev };
          delete newFeedbacks[appointmentId];
          return newFeedbacks;
        });

        showAlert("success", "Feedback deleted successfully!");
      }
    } catch (error) {
      console.error("❌ Error deleting feedback:", error);
      showAlert("error", error.response?.data?.error || "Failed to delete feedback");
    }
  };

  const toggleFeedbackDetails = (appointmentId) => {
    setShowFeedbackDetails(prev => ({
      ...prev,
      [appointmentId]: !prev[appointmentId]
    }));
  };

  // Navigate to chat
  const navigateToChat = (appointment) => {
    if (!appointment?._id) {
      showAlert("error", "Cannot open chat: Invalid appointment");
      return;
    }

    if (appointment.status === "cancelled") {
      showAlert("error", "Cannot chat for cancelled appointments");
      return;
    }

    navigate(`/chat/${appointment._id}`);
  };

  // Filter appointments
  const filterAppointments = () => {
    const now = new Date();
    
    let filtered = appointments;
    
    switch (filter) {
      case "upcoming":
        filtered = appointments.filter(apt => 
          new Date(apt.appointmentDate) >= now && 
          apt.status !== "cancelled"
        );
        break;
      case "past":
        filtered = appointments.filter(apt => 
          new Date(apt.appointmentDate) < now && 
          apt.status !== "cancelled"
        );
        break;
      case "cancelled":
        filtered = appointments.filter(apt => apt.status === "cancelled");
        break;
      case "completed":
        filtered = appointments.filter(apt => apt.status === "completed");
        break;
      default:
        filtered = appointments;
    }
    
    setFilteredAppointments(filtered);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date not set";
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "Time not set";
    if (timeString.includes('AM') || timeString.includes('PM')) {
      return timeString;
    }
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const canCancelAppointment = (appointment) => {
    if (appointment.status === "cancelled" || appointment.status === "completed") {
      return false;
    }

    const appointmentDate = new Date(appointment.appointmentDate);
    const now = new Date();
    return appointmentDate > now;
  };

  const canUseChat = (appointment) => {
    if (!appointment?._id) return false;
    if (appointment.status === "cancelled") return false;
    
    if (appointment.status === "completed") {
      const appointmentDate = new Date(appointment.appointmentDate);
      const now = new Date();
      const daysSinceAppointment = (now - appointmentDate) / (1000 * 60 * 60 * 24);
      return daysSinceAppointment <= 7;
    }
    
    return true;
  };

  const canGiveFeedback = (appointment) => {
    // Only completed appointments can receive feedback
    return appointment.status === "completed";
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", text: "Pending" },
      confirmed: { color: "bg-green-100 text-green-800 border-green-200", text: "Confirmed" },
      cancelled: { color: "bg-red-100 text-red-800 border-red-200", text: "Cancelled" },
      completed: { color: "bg-blue-100 text-blue-800 border-blue-200", text: "Completed" }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getAppointmentStats = () => {
    const now = new Date();
    
    const total = appointments.length;
    const upcoming = appointments.filter(apt => 
      new Date(apt.appointmentDate) >= now && 
      apt.status !== "cancelled"
    ).length;
    const past = appointments.filter(apt => 
      new Date(apt.appointmentDate) < now && 
      apt.status !== "cancelled"
    ).length;
    const cancelled = appointments.filter(apt => apt.status === "cancelled").length;
    const completed = appointments.filter(apt => apt.status === "completed").length;
    const withFeedback = Object.keys(userFeedbacks).length;

    return { total, upcoming, past, cancelled, completed, withFeedback };
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: "", message: "" }), 5000);
  };

  const openCancelModal = (appointment) => {
    if (appointment.status === "cancelled") {
      showAlert("error", "This appointment is already cancelled.");
      return;
    }

    if (appointment.status === "completed") {
      showAlert("error", "This appointment has already been completed.");
      return;
    }

    const appointmentDate = new Date(appointment.appointmentDate);
    const now = new Date();
    if (appointmentDate < now) {
      showAlert("error", "Cannot cancel past appointments.");
      return;
    }

    if (!["pending", "confirmed"].includes(appointment.status)) {
      showAlert("error", `Cannot cancel appointment with status: ${appointment.status}`);
      return;
    }

    setCancellingAppointment(appointment);
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setCancellingAppointment(null);
    setCancelReason("");
  };

  const handleCancelConfirm = () => {
    if (!cancelReason.trim()) {
      showAlert("error", "Please provide a reason for cancellation.");
      return;
    }
    if (cancellingAppointment && cancellingAppointment._id) {
      cancelAppointment(cancellingAppointment._id, cancelReason);
    }
  };

  const stats = getAppointmentStats();

  // Render Stars for Rating
  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  // Render Rating Input
  const renderRatingInput = (label, value, onChange) => {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="focus:outline-none"
            >
              <FaStar
                className={`w-8 h-8 ${
                  star <= value ? 'text-yellow-400 fill-current' : 'text-gray-300'
                } hover:text-yellow-500 transition-colors`}
              />
            </button>
          ))}
          <span className="ml-2 text-gray-600 font-medium">{value}/5</span>
        </div>
      </div>
    );
  };

  // Cancel Modal Component
  const CancelModal = () => {
    if (!showCancelModal || !cancellingAppointment) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Cancel Appointment</h3>
            <button onClick={closeCancelModal} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4">
            <p className="text-gray-700 mb-2">
              Are you sure you want to cancel your appointment with{" "}
              <strong>Dr. {cancellingAppointment.doctorName}</strong>?
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Scheduled for {formatDate(cancellingAppointment.appointmentDate)} at{" "}
              {formatTime(cancellingAppointment.timeSlot?.startTime)}
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for cancellation <span className="text-red-500">*</span>
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Please provide a reason for cancellation..."
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={closeCancelModal}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-700 transition duration-200"
            >
              Keep Appointment
            </button>
            <button
              onClick={handleCancelConfirm}
              disabled={!cancelReason.trim()}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              Confirm Cancellation
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Feedback Modal Component - UPDATED to show patient name
  const FeedbackModal = () => {
    if (!showFeedbackModal || !selectedAppointment) return null;

    const feedback = userFeedbacks[selectedAppointment._id];
    
    // Get patient name for display
    const getDisplayPatientName = () => {
      if (loggedInUserName && loggedInUserName !== "Patient User") {
        return loggedInUserName;
      }
      
      const localStorageName = localStorage.getItem('userName');
      if (localStorageName && localStorageName !== "Patient User") {
        return localStorageName;
      }
      
      if (selectedAppointment?.patientDetails?.fullName) {
        return selectedAppointment.patientDetails.fullName;
      }
      
      return "You";
    };
    
    const displayPatientName = getDisplayPatientName();

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              {isEditingFeedback ? "Edit Your Feedback" : "Share Your Experience"}
            </h3>
            <button onClick={closeFeedbackModal} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-6">
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium text-gray-900 mb-1">Appointment Details</h4>
              <p className="text-sm text-gray-600">
                <strong>Patient:</strong> {displayPatientName}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Doctor:</strong> Dr. {selectedAppointment.doctorName} • {selectedAppointment.doctorSpecialization}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Date & Time:</strong> {formatDate(selectedAppointment.appointmentDate)} at{" "}
                {formatTime(selectedAppointment.timeSlot?.startTime)}
              </p>
            </div>

            {/* Overall Rating */}
            {renderRatingInput("Overall Rating", feedbackData.rating, (rating) =>
              setFeedbackData(prev => ({ ...prev, rating }))
            )}

            {/* Detailed Ratings */}
            <div className="space-y-4">
              {renderRatingInput("Doctor Professionalism", feedbackData.doctorProfessionalism, (value) =>
                setFeedbackData(prev => ({ ...prev, doctorProfessionalism: value }))
              )}
              
              {renderRatingInput("Waiting Time", feedbackData.waitingTime, (value) =>
                setFeedbackData(prev => ({ ...prev, waitingTime: value }))
              )}
              
              {renderRatingInput("Facility Cleanliness", feedbackData.facilityCleanliness, (value) =>
                setFeedbackData(prev => ({ ...prev, facilityCleanliness: value }))
              )}
              
              {renderRatingInput("Overall Experience", feedbackData.overallExperience, (value) =>
                setFeedbackData(prev => ({ ...prev, overallExperience: value }))
              )}
            </div>

            {/* Review Text */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review <span className="text-red-500">*</span>
              </label>
              <textarea
                value={feedbackData.review}
                onChange={(e) => setFeedbackData(prev => ({ ...prev, review: e.target.value }))}
                placeholder={`Share your experience with Dr. ${selectedAppointment.doctorName}...`}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Your feedback will help improve healthcare services for everyone.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={closeFeedbackModal}
              className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-700 transition duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleFeedbackSubmit}
              disabled={!feedbackData.rating || !feedbackData.review.trim()}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {isEditingFeedback ? "Update Feedback" : "Submit Feedback"}
            </button>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <p className="text-xs text-yellow-700">
              <strong>Note:</strong> Your name ({displayPatientName}) will be sent with this feedback to help doctors identify patients.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Feedback Card Component
  const FeedbackCard = ({ appointment, feedback }) => {
    const isDetailsOpen = showFeedbackDetails[appointment._id] || false;

    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mt-4 border border-green-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <FaComment className="text-green-600 mr-2" />
            <h4 className="font-semibold text-gray-900">Your Feedback</h4>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => openFeedbackModal(appointment, feedback)}
              className="text-blue-600 hover:text-blue-800"
              title="Edit feedback"
            >
              <FaEdit className="w-4 h-4" />
            </button>
            <button
              onClick={() => deleteFeedback(appointment._id, feedback._id)}
              className="text-red-600 hover:text-red-800"
              title="Delete feedback"
            >
              <FaTrash className="w-4 h-4" />
            </button>
            <button
              onClick={() => toggleFeedbackDetails(appointment._id)}
              className="text-gray-600 hover:text-gray-800"
              title={isDetailsOpen ? "Hide details" : "View details"}
            >
              <FaEye className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            {renderStars(feedback.rating)}
            <span className="ml-2 text-sm font-medium text-gray-700">
              {feedback.rating}/5
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {new Date(feedback.createdAt).toLocaleDateString()}
          </span>
        </div>

        <p className="text-gray-700 mb-3">{feedback.review}</p>

        {isDetailsOpen && (
          <div className="bg-white rounded-lg p-4 mt-3">
            <h5 className="font-medium text-gray-900 mb-3">Detailed Ratings</h5>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-sm text-gray-600">Doctor Professionalism</span>
                <div className="flex items-center">
                  {renderStars(feedback.doctorProfessionalism)}
                  <span className="ml-2 text-sm font-medium">{feedback.doctorProfessionalism}/5</span>
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Waiting Time</span>
                <div className="flex items-center">
                  {renderStars(feedback.waitingTime)}
                  <span className="ml-2 text-sm font-medium">{feedback.waitingTime}/5</span>
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Facility Cleanliness</span>
                <div className="flex items-center">
                  {renderStars(feedback.facilityCleanliness)}
                  <span className="ml-2 text-sm font-medium">{feedback.facilityCleanliness}/5</span>
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Overall Experience</span>
                <div className="flex items-center">
                  {renderStars(feedback.overallExperience)}
                  <span className="ml-2 text-sm font-medium">{feedback.overallExperience}/5</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!loggedInUserId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-yellow-800 mb-2">Login Required</h3>
              <p className="text-yellow-600 mb-4">Please login to view your appointments</p>
              <button
                onClick={() => navigate("/login")}
                className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition duration-200"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-700">Loading Your Appointments</h3>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-red-800 mb-2">Error Loading Appointments</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <div className="space-y-2">
                <button
                  onClick={() => fetchAppointments(loggedInUserId)}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition duration-200 block w-full"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate("/doctors")}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200 block w-full"
                >
                  Book New Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Alert */}
        {alert.show && (
          <div className={`mb-6 border rounded-lg p-4 ${
            alert.type === "success" 
              ? "bg-green-50 border-green-200 text-green-800" 
              : "bg-red-50 border-red-200 text-red-800"
          }`}>
            <div className="flex items-center">
              <FaCheckCircle className={`w-5 h-5 mr-2 ${
                alert.type === "success" ? "text-green-400" : "text-red-400"
              }`} />
              <span className="font-medium">{alert.message}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            My Appointments
          </h1>
          <p className="text-lg text-gray-600">
            Welcome back, {loggedInUserName}! Manage your medical appointments and share feedback
          </p>
        </div>

        {/* Stats Cards - Now includes feedback stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.upcoming}</div>
            <div className="text-sm text-gray-600">Upcoming</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
            <div className="text-sm text-gray-600">Cancelled</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.withFeedback}</div>
            <div className="text-sm text-gray-600">With Feedback</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {stats.completed > 0 ? Math.round((stats.withFeedback / stats.completed) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">Feedback Rate</div>
          </div>
        </div>

        {/* Filter Buttons - Added Completed filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-wrap gap-2">
            {["all", "upcoming", "past", "completed", "cancelled"].map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-4 py-2 rounded-lg font-medium transition duration-200 capitalize ${
                  filter === filterOption
                    ? filterOption === "cancelled" 
                      ? "bg-red-600 text-white"
                      : filterOption === "completed"
                      ? "bg-purple-600 text-white"
                      : "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {filterOption === "all" ? "All Appointments" : filterOption}
              </button>
            ))}
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Appointments Found</h3>
              <p className="text-gray-500 mb-4">
                {filter === "all" 
                  ? "You don't have any appointments yet." 
                  : `No ${filter} appointments found.`}
              </p>
              <button
                onClick={() => navigate("/doctors")}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-200"
              >
                Book New Appointment
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => {
                const hasFeedback = userFeedbacks[appointment._id];
                const isCompleted = appointment.status === "completed";
                
                return (
                  <div key={appointment._id} className="p-6 hover:bg-gray-50 transition duration-200">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Appointment Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Dr. {appointment.doctorName || "Doctor Name Not Available"}
                            </h3>
                            <p className="text-gray-600">{appointment.doctorSpecialization}</p>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(appointment.status || "pending")}
                            <p className="text-sm text-gray-500 mt-1">
                              #{appointment.appointmentNumber || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Date & Time</p>
                            <p className="font-semibold text-gray-900">
                              {formatDate(appointment.appointmentDate)} •{" "}
                              {formatTime(appointment.timeSlot?.startTime)}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-gray-600">Patient</p>
                            <p className="font-semibold text-gray-900">
                              {appointment.patientDetails?.fullName || loggedInUserName || "Patient"}
                            </p>
                          </div>
                        </div>

                        {/* Show existing feedback or feedback button */}
                        {isCompleted && (
                          <div className="mt-4">
                            {hasFeedback ? (
                              <FeedbackCard appointment={appointment} feedback={hasFeedback} />
                            ) : (
                              <button
                                onClick={() => openFeedbackModal(appointment)}
                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
                              >
                                <FaStar className="mr-2" />
                                Share Your Experience
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:items-end">
                        <button
                          onClick={() => navigate(`/appointments/${appointment._id}`)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                        >
                          View Details
                        </button>
                        
                        {/* Chat Button */}
                        {canUseChat(appointment) && (
                          <button
                            onClick={() => navigateToChat(appointment)}
                            className="relative px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 font-medium flex items-center justify-center"
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
                        )}
                        
                        {/* Cancel Button */}
                        {canCancelAppointment(appointment) && (
                          <button
                            onClick={() => openCancelModal(appointment)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
                          >
                            Cancel
                          </button>
                        )}

                        {/* Feedback Button for completed appointments without feedback */}
                        {isCompleted && !hasFeedback && (
                          <button
                            onClick={() => openFeedbackModal(appointment)}
                            className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition duration-200"
                          >
                            <FaStar className="inline-block mr-2" />
                            Give Feedback
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Feedback Info Box */}
        <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-green-100 p-3 rounded-lg">
              <FaStar className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h4 className="text-lg font-semibold text-gray-900">About Feedback System</h4>
              <ul className="mt-2 space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Share your experience to help improve healthcare services</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Rate doctors and facilities to help other patients</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Your feedback is anonymous to the doctor</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>You can edit or delete your feedback anytime</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={() => fetchAppointments(loggedInUserId)}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200"
          >
            Refresh
          </button>
          <button
            onClick={() => navigate("/doctors")}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
          >
            Book New Appointment
          </button>
          {stats.completed > stats.withFeedback && (
            <button
              onClick={() => {
                const appointmentWithoutFeedback = appointments.find(
                  apt => apt.status === "completed" && !userFeedbacks[apt._id]
                );
                if (appointmentWithoutFeedback) {
                  openFeedbackModal(appointmentWithoutFeedback);
                }
              }}
              className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition duration-200"
            >
              Give Missing Feedback ({stats.completed - stats.withFeedback})
            </button>
          )}
          
          {/* Debug Button - Uncomment if needed */}
          {/* <button
            onClick={() => {
              console.log('=== DEBUG INFO ===');
              console.log('loggedInUserId:', loggedInUserId);
              console.log('loggedInUserName:', loggedInUserName);
              console.log('LocalStorage userName:', localStorage.getItem('userName'));
              console.log('LocalStorage user:', localStorage.getItem('user'));
              console.log('All localStorage items:');
              for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                console.log(`${key}: ${localStorage.getItem(key)}`);
              }
              console.log('========================');
            }}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200 text-sm"
          >
            Debug Info
          </button> */}
        </div>
      </div>

      {/* Modals */}
      <CancelModal />
      <FeedbackModal />
    </div>
  );
};

export default MyAppointments;