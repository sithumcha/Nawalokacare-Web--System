


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
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
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




















// src/pages/MyAppointments.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
  const [unreadCounts, setUnreadCounts] = useState({}); // Track unread messages per appointment

  // ✅ CORRECTED: Get logged in user ID from localStorage - Multiple fallbacks
  const getCurrentUserInfo = () => {
    // Try multiple possible keys to find user ID
    const currentUserId = localStorage.getItem('currentUserId');
    const userId = localStorage.getItem('userId');
    const userData = localStorage.getItem('user');
    
    let finalUserId = currentUserId || userId;
    
    // If still no user ID, try to parse from user object
    if (!finalUserId && userData) {
      try {
        const user = JSON.parse(userData);
        finalUserId = user._id || user.id;
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
    
    // Get user name
    const userName = localStorage.getItem('userName') || 
                    (userData ? JSON.parse(userData).name : null) || 
                    "User";

    console.log("🔍 User ID Debug:", {
      currentUserId,
      userId,
      finalUserId,
      userData: userData ? JSON.parse(userData) : null,
      userName
    });

    return {
      userId: finalUserId,
      userName: userName
    };
  };

  const { userId: loggedInUserId, userName: loggedInUserName } = getCurrentUserInfo();

  useEffect(() => {
    console.log("🔄 Component mounted - Checking authentication");
    console.log("📝 Final User ID:", loggedInUserId);
    console.log("🔐 Token exists:", !!localStorage.getItem('token'));
    
    if (!loggedInUserId) {
      console.log("❌ No user ID found - showing login required");
      setError("Please login to view your appointments");
      setIsLoading(false);
      return;
    }
    
    console.log("✅ User authenticated, fetching appointments...");
    fetchAppointments();
  }, [loggedInUserId]);

  useEffect(() => {
    filterAppointments();
  }, [appointments, filter]);

  // Fetch unread message counts for all appointments
  const fetchUnreadCounts = async () => {
    if (!loggedInUserId) return;

    try {
      const response = await axios.get(
        `http://localhost:5000/api/chat/unread/${loggedInUserId}/patient`
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

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      setError("");

      console.log("📡 Fetching appointments for user:", loggedInUserId);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        `http://localhost:5000/api/appointments/user/${loggedInUserId}`,
        {
          timeout: 10000,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log("✅ Appointments API Response:", response.data);

      if (response.data.success) {
        const userAppointments = response.data.appointments || [];
        setAppointments(userAppointments);
        
        // Fetch unread counts after appointments are loaded
        await fetchUnreadCounts();
        
        if (userAppointments.length === 0) {
          console.log("ℹ️ No appointments found for this user");
        } else {
          console.log(`📅 Found ${userAppointments.length} appointments`);
        }
      } else {
        throw new Error(response.data.error || "Failed to fetch appointments");
      }
    } catch (error) {
      console.error("❌ Error fetching appointments:", error);
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        setError("Session expired. Please login again.");
        // Clear invalid user data
        localStorage.removeItem('token');
        localStorage.removeItem('currentUserId');
        localStorage.removeItem('userId');
        localStorage.removeItem('user');
        localStorage.removeItem('userName');
        setTimeout(() => navigate("/login"), 2000);
        return;
      }
      
      setError(
        error.response?.data?.error ||
        error.message ||
        "Failed to load appointments. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // CANCEL APPOINTMENT FUNCTION
  const cancelAppointment = async (appointmentId, reason) => {
    try {
      setCancellingAppointment(appointmentId);
      
      console.log(`🗑️ Cancelling appointment ${appointmentId} with reason: ${reason}`);
      
      const userId = loggedInUserId; // Use the corrected user ID
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error("No authentication token found");
      }

      const cancelData = {
        userId: userId,
        cancellationReason: reason
      };

      const response = await axios.put(
        `http://localhost:5000/api/appointments/${appointmentId}/cancel`,
        cancelData,
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log("✅ Cancel API Response:", response.data);

      if (response.data.success) {
        // Update local state
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
        
      } else {
        throw new Error(response.data.error || "Failed to cancel appointment");
      }
    } catch (error) {
      console.error("❌ Error cancelling appointment:", error);
      
      let errorMessage = "Failed to cancel appointment. ";
      
      if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else if (error.response?.status === 403) {
        errorMessage += "You are not authorized to cancel this appointment.";
      } else if (error.response?.status === 404) {
        errorMessage += "Appointment not found.";
      } else if (error.response?.status === 400) {
        errorMessage += error.response.data.error || "Bad request.";
      } else if (error.code === 'ECONNABORTED') {
        errorMessage += "Request timeout. Please try again.";
      } else if (error.message.includes("Network Error")) {
        errorMessage += "Cannot connect to server. Please check if the server is running.";
      } else {
        errorMessage += error.message;
      }
      
      showAlert("error", errorMessage);
    } finally {
      setCancellingAppointment(null);
    }
  };

  // Navigate to chat with doctor
  const navigateToChat = (appointment) => {
    if (!appointment?._id) {
      showAlert("error", "Cannot open chat: Invalid appointment");
      return;
    }

    // Check if appointment is active (not cancelled)
    if (appointment.status === "cancelled") {
      showAlert("error", "Cannot chat for cancelled appointments");
      return;
    }

    if (appointment.status === "completed") {
      showAlert("info", "This appointment is completed. Chat may not be available.");
    }

    navigate(`/chat/${appointment._id}`);
  };

  // CANCEL MODAL HANDLERS
  const openCancelModal = (appointment) => {
    // Basic validation
    if (appointment.status === "cancelled") {
      showAlert("error", "This appointment is already cancelled.");
      return;
    }

    if (appointment.status === "completed") {
      showAlert("error", "This appointment has already been completed.");
      return;
    }

    // Check if appointment is in the past
    const appointmentDate = new Date(appointment.appointmentDate);
    const now = new Date();
    if (appointmentDate < now) {
      showAlert("error", "Cannot cancel past appointments.");
      return;
    }

    // Check if status allows cancellation
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

  // Check if appointment can use chat
  const canUseChat = (appointment) => {
    if (!appointment?._id) return false;
    
    // Don't show chat for cancelled appointments
    if (appointment.status === "cancelled") return false;
    
    // For past appointments, allow chat only if recently completed
    if (appointment.status === "completed") {
      const appointmentDate = new Date(appointment.appointmentDate);
      const now = new Date();
      const daysSinceAppointment = (now - appointmentDate) / (1000 * 60 * 60 * 24);
      
      // Allow chat for appointments completed within last 7 days
      return daysSinceAppointment <= 7;
    }
    
    // For upcoming/pending/confirmed appointments
    return true;
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

    return { total, upcoming, past, cancelled };
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: "", message: "" }), 5000);
  };

  const stats = getAppointmentStats();

  // Cancel Modal Component
  const CancelModal = () => {
    if (!showCancelModal || !cancellingAppointment) return null;

    const isCancelling = cancellingAppointment && typeof cancellingAppointment === 'string';

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Cancel Appointment</h3>
            <button
              onClick={closeCancelModal}
              className="text-gray-500 hover:text-gray-700"
              disabled={isCancelling}
            >
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
              disabled={isCancelling}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={closeCancelModal}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isCancelling}
            >
              Keep Appointment
            </button>
            <button
              onClick={handleCancelConfirm}
              disabled={!cancelReason.trim() || isCancelling}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {isCancelling ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Cancelling...
                </div>
              ) : (
                "Confirm Cancellation"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Debug info - remove in production
  useEffect(() => {
    console.log("=== LOCALSTORAGE DEBUG INFO ===");
    console.log("currentUserId:", localStorage.getItem('currentUserId'));
    console.log("userId:", localStorage.getItem('userId'));
    console.log("user:", localStorage.getItem('user'));
    console.log("userName:", localStorage.getItem('userName'));
    console.log("token:", localStorage.getItem('token'));
    console.log("=================================");
  }, []);

  if (!loggedInUserId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 max-w-md mx-auto">
              <svg className="w-16 h-16 text-yellow-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
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
            <p className="text-gray-500 mt-2">Please wait while we load your appointment history...</p>
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
              <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-xl font-semibold text-red-800 mb-2">Error Loading Appointments</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <div className="space-y-2">
                <button
                  onClick={fetchAppointments}
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
                <button
                  onClick={() => navigate("/login")}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition duration-200 block w-full"
                >
                  Login Again
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
              <svg className={`w-5 h-5 mr-2 ${
                alert.type === "success" ? "text-green-400" : "text-red-400"
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d={alert.type === "success" ? 
                    "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" :
                    "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  } 
                />
              </svg>
              <span className="font-medium">{alert.message}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            My Appointments
          </h1>
          <p className="text-lg text-gray-600">
            Welcome back, {loggedInUserName}! Manage your medical appointments
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Chat with your doctor directly from your appointments
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.upcoming}</div>
            <div className="text-sm text-gray-600">Upcoming</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.past}</div>
            <div className="text-sm text-gray-600">Past</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
            <div className="text-sm text-gray-600">Cancelled</div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Appointments
            </button>
            <button
              onClick={() => setFilter("upcoming")}
              className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                filter === "upcoming"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter("past")}
              className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                filter === "past"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Past
            </button>
            <button
              onClick={() => setFilter("cancelled")}
              className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                filter === "cancelled"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Cancelled
            </button>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Appointments Found</h3>
              <p className="text-gray-500 mb-4">
                {filter === "all" 
                  ? "You don't have any appointments yet." 
                  : `No ${filter} appointments found.`}
              </p>
              <div className="space-y-2">
                <button
                  onClick={fetchAppointments}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200 mx-2"
                >
                  Refresh
                </button>
                <button
                  onClick={() => navigate("/doctors")}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-200 mx-2"
                >
                  Book New Appointment
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => (
                <div key={appointment._id} className="p-6 hover:bg-gray-50 transition duration-200">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Appointment Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Dr. {appointment.doctorName || "Doctor Name Not Available"}
                          </h3>
                          <p className="text-gray-600">{appointment.doctorSpecialization || "Specialization not specified"}</p>
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
                            {formatTime(appointment.timeSlot?.startTime)} -{" "}
                            {formatTime(appointment.timeSlot?.endTime)}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-gray-600">Patient</p>
                          <p className="font-semibold text-gray-900">
                            {appointment.patientDetails?.fullName || "Patient name not available"}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {appointment.patientDetails?.phoneNumber || "Phone not available"}
                          </p>
                        </div>

                        {appointment.patientDetails?.medicalConcern && (
                          <div>
                            <p className="text-gray-600">Medical Concern</p>
                            <p className="font-semibold text-gray-900">
                              {appointment.patientDetails.medicalConcern}
                            </p>
                          </div>
                        )}

                        <div>
                          <p className="text-gray-600">Booked On</p>
                          <p className="font-semibold text-gray-900">
                            {appointment.createdAt ? new Date(appointment.createdAt).toLocaleDateString() : "Date not available"}
                          </p>
                        </div>

                        {/* Show cancellation reason if cancelled */}
                        {appointment.status === "cancelled" && appointment.cancellationReason && (
                          <div className="md:col-span-2">
                            <p className="text-gray-600">Cancellation Reason</p>
                            <p className="font-semibold text-red-600">
                              {appointment.cancellationReason}
                            </p>
                            {appointment.cancelledAt && (
                              <p className="text-xs text-gray-500">
                                Cancelled on: {new Date(appointment.cancelledAt).toLocaleString()}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:items-end">
                      <button
                        onClick={() => navigate(`/appointments/${appointment._id}`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                      >
                        View Details
                      </button>
                      
                      {/* Chat with Doctor Button */}
                      {canUseChat(appointment) && (
                        <button
                          onClick={() => navigateToChat(appointment)}
                          className="relative px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 font-medium flex items-center justify-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          Chat with Doctor
                          {unreadCounts[appointment._id] > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {unreadCounts[appointment._id] > 9 ? '9+' : unreadCounts[appointment._id]}
                            </span>
                          )}
                        </button>
                      )}
                      
                      {/* Cancel Button - Only show for upcoming appointments that can be cancelled */}
                      {canCancelAppointment(appointment) && (
                        <button
                          onClick={() => openCancelModal(appointment)}
                          disabled={cancellingAppointment === appointment._id}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center min-w-[120px]"
                        >
                          {cancellingAppointment === appointment._id ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Cancelling...
                            </div>
                          ) : (
                            "Cancel Appointment"
                          )}
                        </button>
                      )}

                      {/* Show message if cannot cancel */}
                      {!canCancelAppointment(appointment) && appointment.status !== "cancelled" && appointment.status !== "completed" && (
                        <button
                          disabled
                          className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed text-sm"
                          title="Cannot cancel past appointments"
                        >
                          Cannot Cancel
                        </button>
                      )}

                      {/* Chat not available message */}
                      {!canUseChat(appointment) && appointment.status !== "cancelled" && (
                        <button
                          disabled
                          className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed text-sm"
                          title={appointment.status === "completed" ? 
                            "Chat only available for appointments within 7 days of completion" : 
                            "Chat not available"}
                        >
                          Chat Unavailable
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Additional Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-blue-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="ml-4">
              <h4 className="text-lg font-semibold text-gray-900">About Chat Feature</h4>
              <ul className="mt-2 space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Chat with your doctor about your medical concerns
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Ask questions about medications and treatment plans
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Share documents and reports securely
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Real-time messaging with automatic updates
                </li>
                <li className="text-xs text-gray-500 mt-2">
                  Note: Chat is available for active appointments and recently completed appointments (within 7 days)
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="text-center mt-6">
          <button
            onClick={fetchAppointments}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition duration-200"
          >
            Refresh Appointments
          </button>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <CancelModal />
    </div>
  );
};

export default MyAppointments;