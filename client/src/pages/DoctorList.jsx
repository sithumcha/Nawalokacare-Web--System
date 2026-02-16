





// import { useState, useEffect } from "react";
// import axios from "axios";
// import { Link } from "react-router-dom";

// const DoctorList = () => {
//   const [doctors, setDoctors] = useState([]);
//   const [filteredDoctors, setFilteredDoctors] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedSpecialization, setSelectedSpecialization] = useState("");
//   const [selectedDepartment, setSelectedDepartment] = useState("");
//   const [selectedConsultationType, setSelectedConsultationType] = useState(""); // New filter
//   const [currentPage, setCurrentPage] = useState(1);
//   const [doctorsPerPage] = useState(8);

//   // Fetch all doctors
//   useEffect(() => {
//     const fetchDoctors = async () => {
//       try {
//         setIsLoading(true);
//         setError(null);
//         const res = await axios.get("http://localhost:5000/api/doctors");
//         setDoctors(res.data);
//         setFilteredDoctors(res.data);
//       } catch (error) {
//         console.error("Error fetching doctors:", error);
//         setError("Failed to load doctors. Please try again later.");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchDoctors();
//   }, []);

//   // Filter doctors based on search and filters
//   useEffect(() => {
//     let results = doctors;

//     if (searchTerm) {
//       const term = searchTerm.toLowerCase();
//       results = results.filter(
//         (doctor) =>
//           doctor.firstName?.toLowerCase().includes(term) ||
//           doctor.lastName?.toLowerCase().includes(term) ||
//           doctor.specialization?.toLowerCase().includes(term) ||
//           doctor.department?.toLowerCase().includes(term)
//       );
//     }

//     if (selectedSpecialization) {
//       results = results.filter(
//         (doctor) => doctor.specialization === selectedSpecialization
//       );
//     }

//     if (selectedDepartment) {
//       results = results.filter(
//         (doctor) => doctor.department === selectedDepartment
//       );
//     }

//     if (selectedConsultationType) {
//       results = results.filter((doctor) => {
//         // Check if doctor has available time slots of the selected consultation type
//         return doctor.availableTimeSlots?.some(
//           (slot) => slot.consultationType === selectedConsultationType
//         );
//       });
//     }

//     setFilteredDoctors(results);
//     setCurrentPage(1); // Reset to first page when filters change
//   }, [searchTerm, selectedSpecialization, selectedDepartment, selectedConsultationType, doctors]);

//   // Get unique specializations, departments, and consultation types for filters
//   const specializations = [...new Set(doctors.map(doc => doc.specialization).filter(Boolean))];
//   const departments = [...new Set(doctors.map(doc => doc.department).filter(Boolean))];
  
//   // Get available consultation types from doctors' time slots
//   const consultationTypes = [...new Set(
//     doctors.flatMap(doctor => 
//       doctor.availableTimeSlots?.map(slot => slot.consultationType) || []
//     )
//   )].filter(Boolean);

//   // Reset all filters
//   const resetFilters = () => {
//     setSearchTerm("");
//     setSelectedSpecialization("");
//     setSelectedDepartment("");
//     setSelectedConsultationType("");
//   };

//   // Calculate paginated results
//   const indexOfLastDoctor = currentPage * doctorsPerPage;
//   const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
//   const currentDoctors = filteredDoctors.slice(indexOfFirstDoctor, indexOfLastDoctor);

//   // Handle page change
//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   // Total pages
//   const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);

//   // Format price for display
//   const formatPrice = (price) => {
//     if (price === null || price === undefined || price === '') return "Free";
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'USD'
//     }).format(price);
//   };

//   // Get consultation type availability for a doctor
//   const getConsultationTypes = (doctor) => {
//     const types = new Set();
//     doctor.availableTimeSlots?.forEach(slot => {
//       if (slot.consultationType) {
//         types.add(slot.consultationType);
//       }
//     });
//     return Array.from(types);
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center">
//             <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
//             <p className="mt-4 text-gray-600 text-lg">Loading our medical team...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto mt-8">
//             <div className="text-red-500 text-6xl mb-4">⚠️</div>
//             <h3 className="text-2xl font-bold text-gray-900 mb-3">Unable to Load Doctors</h3>
//             <p className="text-gray-600 mb-6">{error}</p>
//             <button
//               onClick={() => window.location.reload()}
//               className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-md"
//             >
//               Try Again
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Header */}
//         <div className="text-center mb-12">
//           <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
//             Our Medical Team
//           </h1>
//           <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
//             Meet our team of experienced healthcare professionals dedicated to your well-being
//           </p>
//         </div>

//         {/* Search and Filters */}
//         <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
//           <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
//             {/* Search Input */}
//             <div className="lg:col-span-2">
//               <label htmlFor="search" className="block text-sm font-semibold text-gray-700 mb-2">
//                 Search Doctors
//               </label>
//               <div className="relative">
//                 <input
//                   type="text"
//                   id="search"
//                   placeholder="Search by name, specialization..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//                 />
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                   </svg>
//                 </div>
//               </div>
//             </div>

//             {/* Specialization Filter */}
//             <div>
//               <label htmlFor="specialization" className="block text-sm font-semibold text-gray-700 mb-2">
//                 Specialization
//               </label>
//               <select
//                 id="specialization"
//                 value={selectedSpecialization}
//                 onChange={(e) => setSelectedSpecialization(e.target.value)}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//               >
//                 <option value="">All Specializations</option>
//                 {specializations.map((spec) => (
//                   <option key={spec} value={spec}>
//                     {spec}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Department Filter */}
//             <div>
//               <label htmlFor="department" className="block text-sm font-semibold text-gray-700 mb-2">
//                 Department
//               </label>
//               <select
//                 id="department"
//                 value={selectedDepartment}
//                 onChange={(e) => setSelectedDepartment(e.target.value)}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//               >
//                 <option value="">All Departments</option>
//                 {departments.map((dept) => (
//                   <option key={dept} value={dept}>
//                     {dept}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Consultation Type Filter */}
//             <div>
//               <label htmlFor="consultationType" className="block text-sm font-semibold text-gray-700 mb-2">
//                 Consultation Type
//               </label>
//               <select
//                 id="consultationType"
//                 value={selectedConsultationType}
//                 onChange={(e) => setSelectedConsultationType(e.target.value)}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//               >
//                 <option value="">All Types</option>
//                 {consultationTypes.map((type) => (
//                   <option key={type} value={type}>
//                     {type === 'physical' ? '🏥 Physical' : '💻 Online'}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {/* Filter Results and Reset */}
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-6 gap-3">
//             <p className="text-gray-600 font-medium">
//               Showing <span className="text-blue-600 font-bold">{currentDoctors.length}</span> of{" "}
//               <span className="text-blue-600 font-bold">{filteredDoctors.length}</span> doctors
//             </p>
//             {(searchTerm || selectedSpecialization || selectedDepartment || selectedConsultationType) && (
//               <button
//                 onClick={resetFilters}
//                 className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200"
//               >
//                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//                 </svg>
//                 Reset Filters
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Doctors Grid */}
//         {currentDoctors.length === 0 ? (
//           <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
//             <div className="text-gray-400 text-8xl mb-6">🔍</div>
//             <h3 className="text-2xl font-bold text-gray-900 mb-3">No Doctors Found</h3>
//             <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
//               Try adjusting your search criteria or reset the filters to see all available doctors.
//             </p>
//             <button
//               onClick={resetFilters}
//               className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-md"
//             >
//               Clear All Filters
//             </button>
//           </div>
//         ) : (
//           <>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
//               {currentDoctors.map((doctor) => (
//                 <DoctorCard 
//                   key={doctor._id} 
//                   doctor={doctor} 
//                   formatPrice={formatPrice}
//                   getConsultationTypes={getConsultationTypes}
//                 />
//               ))}
//             </div>

//             {/* Pagination Controls */}
//             {filteredDoctors.length > doctorsPerPage && (
//               <div className="flex justify-center mt-12">
//                 <nav className="flex items-center space-x-2">
//                   <button
//                     onClick={() => paginate(Math.max(1, currentPage - 1))}
//                     disabled={currentPage === 1}
//                     className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
//                   >
//                     Previous
//                   </button>
                  
//                   {[...Array(totalPages).keys()].map((pageNumber) => (
//                     <button
//                       key={pageNumber}
//                       onClick={() => paginate(pageNumber + 1)}
//                       className={`px-4 py-2 border rounded-lg transition-all duration-200 ${
//                         currentPage === pageNumber + 1
//                           ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md"
//                           : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
//                       }`}
//                     >
//                       {pageNumber + 1}
//                     </button>
//                   ))}
                  
//                   <button
//                     onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
//                     disabled={currentPage === totalPages}
//                     className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
//                   >
//                     Next
//                   </button>
//                 </nav>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// // Enhanced Doctor Card Component with Consultation Types
// const DoctorCard = ({ doctor, formatPrice, getConsultationTypes }) => {
//   const [imageError, setImageError] = useState(false);
//   const consultationTypes = getConsultationTypes(doctor);

//   const getConsultationTypeColor = (type) => {
//     const colors = {
//       physical: "bg-orange-100 text-orange-800 border-orange-200",
//       online: "bg-cyan-100 text-cyan-800 border-cyan-200"
//     };
//     return colors[type] || "bg-gray-100 text-gray-800 border-gray-200";
//   };

//   return (
//     <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:transform hover:-translate-y-2">
//       {/* Profile Image */}
//       <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-100 overflow-hidden">
//         {doctor.profilePicture && !imageError ? (
//           <img
//             src={`http://localhost:5000/${doctor.profilePicture}`}
//             alt={`${doctor.firstName} ${doctor.lastName}`}
//             className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//             onError={() => setImageError(true)}
//           />
//         ) : (
//           <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
//             <span className="text-white text-4xl font-bold">
//               {doctor.firstName?.[0]}{doctor.lastName?.[0]}
//             </span>
//           </div>
//         )}
        
//         {/* Specialization Badge */}
//         <div className="absolute top-4 left-4">
//           <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
//             {doctor.specialization || "General"}
//           </span>
//         </div>

//         {/* Price Badge */}
//         <div className="absolute top-4 right-4">
//           <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
//             {formatPrice(doctor.price)}
//           </span>
//         </div>
//       </div>

//       {/* Doctor Information */}
//       <div className="p-6">
//         <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
//           Dr. {doctor.firstName} {doctor.lastName}
//         </h3>
        
//         <p className="text-gray-600 mb-3 flex items-center text-sm">
//           <svg className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
//             <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
//           </svg>
//           {doctor.department || "Medical Department"}
//         </p>

//         {/* Consultation Type Availability */}
//         {consultationTypes.length > 0 && (
//           <div className="mb-3">
//             <p className="text-sm font-semibold text-gray-700 mb-2">Available for:</p>
//             <div className="flex flex-wrap gap-2">
//               {consultationTypes.map((type) => (
//                 <span
//                   key={type}
//                   className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getConsultationTypeColor(type)}`}
//                 >
//                   {type === 'physical' ? '🏥 Physical' : '💻 Online'}
//                 </span>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Price Display */}
//         <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
//           <div className="flex items-center justify-between">
//             <span className="text-sm font-semibold text-gray-700">Consultation Fee:</span>
//             <span className="text-lg font-bold text-green-700">
//               {formatPrice(doctor.price)}
//             </span>
//           </div>
//           <p className="text-xs text-gray-500 mt-1">Per session</p>
//         </div>

//         <div className="space-y-2 mb-6">
//           {doctor.phoneNumber && (
//             <p className="text-gray-500 text-sm flex items-center">
//               <svg className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
//                 <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
//               </svg>
//               {doctor.phoneNumber}
//             </p>
//           )}
          
//           {doctor.gender && (
//             <p className="text-gray-500 text-sm flex items-center">
//               <svg className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
//               </svg>
//               {doctor.gender}
//             </p>
//           )}

//           {doctor.experience && (
//             <p className="text-gray-500 text-sm flex items-center">
//               <svg className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
//               </svg>
//               {doctor.experience} years experience
//             </p>
//           )}
//         </div>

//         {/* View Details Button */}
//         <Link
//           to={`/doctordetails/${doctor._id}`}
//           className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform group-hover:scale-105 shadow-md hover:shadow-lg"
//         >
//           View Profile & Book
//         </Link>
//       </div>
//     </div>
//   );
// };

// export default DoctorList;












// src/pages/DoctorList.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaStar, FaStarHalfAlt, FaRegStar, FaComment, FaUsers, FaAward } from "react-icons/fa";

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedConsultationType, setSelectedConsultationType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [doctorsPerPage] = useState(8);
  
  const [doctorFeedbacks, setDoctorFeedbacks] = useState({});
  const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await axios.get("http://localhost:5000/api/doctors");
        setDoctors(res.data);
        setFilteredDoctors(res.data);
        
        await fetchDoctorsFeedback(res.data);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        setError("Failed to load doctors. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const fetchDoctorsFeedback = async (doctorsList) => {
    try {
      setIsLoadingFeedbacks(true);
      const feedbackMap = {};
      
      const feedbackPromises = doctorsList.map(async (doctor) => {
        try {
          const response = await axios.get(
            `http://localhost:5000/api/feedbacks/doctor/${doctor._id}`
          );
          
          if (response.data.success) {
            const feedbacks = response.data.feedbacks || [];
            
            if (feedbacks.length > 0) {
              const totalRating = feedbacks.reduce((sum, fb) => sum + fb.rating, 0);
              const averageRating = totalRating / feedbacks.length;
              
              const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
              feedbacks.forEach(fb => {
                ratingCounts[fb.rating]++;
              });
              
              const latestReviews = feedbacks
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 2);
              
              feedbackMap[doctor._id] = {
                averageRating: parseFloat(averageRating.toFixed(1)),
                totalReviews: feedbacks.length,
                ratingCounts,
                latestReviews,
                feedbacks
              };
            } else {
              feedbackMap[doctor._id] = {
                averageRating: 0,
                totalReviews: 0,
                ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                latestReviews: [],
                feedbacks: []
              };
            }
          }
        } catch (error) {
          console.error(`Error fetching feedback for doctor ${doctor._id}:`, error);
          feedbackMap[doctor._id] = {
            averageRating: 0,
            totalReviews: 0,
            ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            latestReviews: [],
            feedbacks: []
          };
        }
      });
      
      await Promise.all(feedbackPromises);
      setDoctorFeedbacks(feedbackMap);
    } catch (error) {
      console.error("Error fetching doctors feedback:", error);
    } finally {
      setIsLoadingFeedbacks(false);
    }
  };

  useEffect(() => {
    let results = doctors;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        (doctor) =>
          doctor.firstName?.toLowerCase().includes(term) ||
          doctor.lastName?.toLowerCase().includes(term) ||
          doctor.specialization?.toLowerCase().includes(term) ||
          doctor.department?.toLowerCase().includes(term)
      );
    }

    if (selectedSpecialization) {
      results = results.filter(
        (doctor) => doctor.specialization === selectedSpecialization
      );
    }

    if (selectedDepartment) {
      results = results.filter(
        (doctor) => doctor.department === selectedDepartment
      );
    }

    if (selectedConsultationType) {
      results = results.filter((doctor) => {
        return doctor.availableTimeSlots?.some(
          (slot) => slot.consultationType === selectedConsultationType
        );
      });
    }

    setFilteredDoctors(results);
    setCurrentPage(1);
  }, [searchTerm, selectedSpecialization, selectedDepartment, selectedConsultationType, doctors]);

  const specializations = [...new Set(doctors.map(doc => doc.specialization).filter(Boolean))];
  const departments = [...new Set(doctors.map(doc => doc.department).filter(Boolean))];
  
  const consultationTypes = [...new Set(
    doctors.flatMap(doctor => 
      doctor.availableTimeSlots?.map(slot => slot.consultationType) || []
    )
  )].filter(Boolean);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedSpecialization("");
    setSelectedDepartment("");
    setSelectedConsultationType("");
  };

  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = filteredDoctors.slice(indexOfFirstDoctor, indexOfLastDoctor);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);

  const formatPrice = (price) => {
    if (price === null || price === undefined || price === '') return "Free";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getConsultationTypes = (doctor) => {
    const types = new Set();
    doctor.availableTimeSlots?.forEach(slot => {
      if (slot.consultationType) {
        types.add(slot.consultationType);
      }
    });
    return Array.from(types);
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} className="w-4 h-4 text-yellow-400 fill-current" />
        ))}
        {hasHalfStar && <FaStarHalfAlt className="w-4 h-4 text-yellow-400" />}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar key={`empty-${i}`} className="w-4 h-4 text-yellow-400" />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 text-lg">Loading our medical team...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto mt-8">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Unable to Load Doctors</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-md"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Our Medical Team
          </h1>
          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Meet our team of experienced healthcare professionals dedicated to your well-being
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm">
              <FaUsers className="text-blue-500 mr-2" />
              <span className="text-sm font-medium">{doctors.length} Doctors</span>
            </div>
            <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm">
              <FaComment className="text-green-500 mr-2" />
              <span className="text-sm font-medium">
                {Object.values(doctorFeedbacks).reduce((sum, fb) => sum + fb.totalReviews, 0)} Reviews
              </span>
            </div>
            <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm">
              <FaAward className="text-yellow-500 mr-2" />
              <span className="text-sm font-medium">Verified Professionals</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <label htmlFor="search" className="block text-sm font-semibold text-gray-700 mb-2">
                Search Doctors
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  placeholder="Search by name, specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="specialization" className="block text-sm font-semibold text-gray-700 mb-2">
                Specialization
              </label>
              <select
                id="specialization"
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">All Specializations</option>
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-semibold text-gray-700 mb-2">
                Department
              </label>
              <select
                id="department"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="consultationType" className="block text-sm font-semibold text-gray-700 mb-2">
                Consultation Type
              </label>
              <select
                id="consultationType"
                value={selectedConsultationType}
                onChange={(e) => setSelectedConsultationType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">All Types</option>
                {consultationTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === 'physical' ? '🏥 Physical' : '💻 Online'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-6 gap-3">
            <p className="text-gray-600 font-medium">
              Showing <span className="text-blue-600 font-bold">{currentDoctors.length}</span> of{" "}
              <span className="text-blue-600 font-bold">{filteredDoctors.length}</span> doctors
            </p>
            {(searchTerm || selectedSpecialization || selectedDepartment || selectedConsultationType) && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {currentDoctors.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="text-gray-400 text-8xl mb-6">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Doctors Found</h3>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              Try adjusting your search criteria or reset the filters to see all available doctors.
            </p>
            <button
              onClick={resetFilters}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-md"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {currentDoctors.map((doctor) => (
                <DoctorCard 
                  key={doctor._id} 
                  doctor={doctor} 
                  formatPrice={formatPrice}
                  getConsultationTypes={getConsultationTypes}
                  feedbackStats={doctorFeedbacks[doctor._id]}
                  isLoadingFeedbacks={isLoadingFeedbacks}
                  renderStars={renderStars}
                />
              ))}
            </div>

            {filteredDoctors.length > doctorsPerPage && (
              <div className="flex justify-center mt-12">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
                  >
                    Previous
                  </button>
                  
                  {[...Array(totalPages).keys()].map((pageNumber) => (
                    <button
                      key={pageNumber}
                      onClick={() => paginate(pageNumber + 1)}
                      className={`px-4 py-2 border rounded-lg transition-all duration-200 ${
                        currentPage === pageNumber + 1
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {pageNumber + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const DoctorCard = ({ 
  doctor, 
  formatPrice, 
  getConsultationTypes, 
  feedbackStats, 
  isLoadingFeedbacks,
  renderStars 
}) => {
  const [imageError, setImageError] = useState(false);
  const consultationTypes = getConsultationTypes(doctor);

  const getConsultationTypeColor = (type) => {
    const colors = {
      physical: "bg-orange-100 text-orange-800 border-orange-200",
      online: "bg-cyan-100 text-cyan-800 border-cyan-200"
    };
    return colors[type] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const hasFeedback = feedbackStats && feedbackStats.totalReviews > 0;
  
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:transform hover:-translate-y-2">
      <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-100 overflow-hidden">
        {doctor.profilePicture && !imageError ? (
          <img
            src={`http://localhost:5000/${doctor.profilePicture}`}
            alt={`${doctor.firstName} ${doctor.lastName}`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <span className="text-white text-4xl font-bold">
              {doctor.firstName?.[0]}{doctor.lastName?.[0]}
            </span>
          </div>
        )}
        
        <div className="absolute top-4 left-4">
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
            {doctor.specialization || "General"}
          </span>
        </div>

        {hasFeedback && (
          <div className="absolute top-4 right-4 flex items-center bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
            <FaStar className="w-3 h-3 text-yellow-400 fill-current mr-1" />
            <span className="text-xs font-bold text-gray-900">
              {feedbackStats.averageRating.toFixed(1)}
            </span>
          </div>
        )}

        <div className="absolute bottom-4 right-4">
          <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
            {formatPrice(doctor.price)}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
          Dr. {doctor.firstName} {doctor.lastName}
        </h3>
        
        <p className="text-gray-600 mb-3 flex items-center text-sm">
          <svg className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
          </svg>
          {doctor.department || "Medical Department"}
        </p>

        {isLoadingFeedbacks ? (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="animate-pulse flex items-center">
              <div className="h-4 bg-gray-200 rounded w-24 mr-2"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        ) : hasFeedback ? (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="flex items-center mr-2">
                  {renderStars(feedbackStats.averageRating)}
                  <span className="ml-2 text-sm font-bold text-gray-900">
                    {feedbackStats.averageRating.toFixed(1)}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  ({feedbackStats.totalReviews} review{feedbackStats.totalReviews !== 1 ? 's' : ''})
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 italic">
              No reviews yet. Be the first to share your experience!
            </p>
          </div>
        )}

        {consultationTypes.length > 0 && (
          <div className="mb-3">
            <p className="text-sm font-semibold text-gray-700 mb-2">Available for:</p>
            <div className="flex flex-wrap gap-2">
              {consultationTypes.map((type) => (
                <span
                  key={type}
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getConsultationTypeColor(type)}`}
                >
                  {type === 'physical' ? '🏥 Physical' : '💻 Online'}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Consultation Fee:</span>
            <span className="text-lg font-bold text-green-700">
              {formatPrice(doctor.price)}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Per session</p>
        </div>

        <div className="space-y-2 mb-6">
          {doctor.phoneNumber && (
            <p className="text-gray-500 text-sm flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
              </svg>
              {doctor.phoneNumber}
            </p>
          )}
          
          {doctor.gender && (
            <p className="text-gray-500 text-sm flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
              </svg>
              {doctor.gender}
            </p>
          )}

          {doctor.experience && (
            <p className="text-gray-500 text-sm flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
              </svg>
              {doctor.experience} years experience
            </p>
          )}
        </div>

        <Link
          to={`/doctordetails/${doctor._id}`}
          className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform group-hover:scale-105 shadow-md hover:shadow-lg"
        >
          View Profile & Book
        </Link>
      </div>
    </div>
  );
};

export default DoctorList;