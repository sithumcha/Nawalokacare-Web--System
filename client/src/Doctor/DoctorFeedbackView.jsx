// src/pages/doctor/DoctorFeedbackView.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FaStar, FaArrowLeft, FaFilter, FaSort, FaChartBar, FaUser, FaCalendar, FaComment, FaChevronRight } from "react-icons/fa";

const DoctorFeedbackView = () => {
  const navigate = useNavigate();
  const { doctorId } = useParams();
  
  const [doctorData, setDoctorData] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    averageRating: 0,
    totalFeedbacks: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    detailedStats: {
      professionalism: 0,
      waitingTime: 0,
      cleanliness: 0,
      experience: 0
    }
  });
  
  // Filters
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const storedDoctorId = localStorage.getItem("doctorId");

      if (!token || !storedDoctorId) {
        navigate("/doctor/login");
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        // Fetch doctor data
        const doctorResponse = await axios.get(
          `http://localhost:5000/api/doctors/${doctorId || storedDoctorId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setDoctorData(doctorResponse.data);

        // Fetch feedbacks
        await fetchFeedbacks(doctorId || storedDoctorId);

      } catch (error) {
        console.error("Error fetching feedback data:", error);
        setError("Failed to load feedback data. Please try again.");
        
        // Fallback mock data for testing
        setMockData();
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate, doctorId]);

  const fetchFeedbacks = async (id) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/feedbacks/doctor/${id}?page=${currentPage}&limit=${itemsPerPage}&sortBy=${sortBy}`
      );

      if (response.data.success) {
        setFeedbacks(response.data.feedbacks || []);
        setFilteredFeedbacks(response.data.feedbacks || []);
        
        // Update stats
        if (response.data.ratingSummary) {
          setStats(prev => ({
            ...prev,
            averageRating: response.data.ratingSummary.averageRating || 0,
            totalFeedbacks: response.data.ratingSummary.totalFeedbacks || 0
          }));
        }
        
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages || 1);
        }
        
        // Calculate rating distribution
        calculateRatingDistribution(response.data.feedbacks || []);
      }
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      // Continue with mock data if API fails
      setMockData();
    }
  };

  const setMockData = () => {
    const mockFeedbacks = [
      {
        _id: "1",
        patientName: "Sarah Johnson",
        rating: 5,
        review: "Dr. Smith was absolutely amazing! She took the time to listen to all my concerns and explained everything in detail. Very professional and caring.",
        createdAt: "2024-01-15T10:30:00.000Z",
        appointmentDate: "2024-01-14",
        doctorProfessionalism: 5,
        waitingTime: 4,
        facilityCleanliness: 5,
        overallExperience: 5,
        isAnonymous: false
      },
      {
        _id: "2",
        patientName: "Robert Chen",
        rating: 4,
        review: "Good consultation, explained everything clearly. The waiting time was a bit long but overall satisfied with the service.",
        createdAt: "2024-01-10T14:20:00.000Z",
        appointmentDate: "2024-01-09",
        doctorProfessionalism: 4,
        waitingTime: 3,
        facilityCleanliness: 5,
        overallExperience: 4,
        isAnonymous: false
      },
      {
        _id: "3",
        patientName: "Maria Garcia",
        rating: 5,
        review: "Very professional and attentive. The diagnosis was accurate and treatment plan was effective. Highly recommended!",
        createdAt: "2024-01-05T09:15:00.000Z",
        appointmentDate: "2024-01-04",
        doctorProfessionalism: 5,
        waitingTime: 5,
        facilityCleanliness: 4,
        overallExperience: 5,
        isAnonymous: false
      },
      {
        _id: "4",
        patientName: "James Wilson",
        rating: 3,
        review: "Doctor was knowledgeable but seemed rushed. Didn't get to ask all my questions. Waiting area could be cleaner.",
        createdAt: "2024-01-02T16:45:00.000Z",
        appointmentDate: "2023-12-28",
        doctorProfessionalism: 3,
        waitingTime: 2,
        facilityCleanliness: 3,
        overallExperience: 3,
        isAnonymous: false
      },
      {
        _id: "5",
        patientName: "Emma Thompson",
        rating: 5,
        review: "Excellent experience from start to finish. The staff was friendly and Dr. Smith was thorough in her examination.",
        createdAt: "2023-12-28T11:10:00.000Z",
        appointmentDate: "2023-12-27",
        doctorProfessionalism: 5,
        waitingTime: 4,
        facilityCleanliness: 5,
        overallExperience: 5,
        isAnonymous: false
      },
      {
        _id: "6",
        patientName: "Anonymous",
        rating: 4,
        review: "Good doctor, but appointment scheduling could be improved. Had to wait for 30 minutes past my scheduled time.",
        createdAt: "2023-12-25T13:30:00.000Z",
        appointmentDate: "2023-12-24",
        doctorProfessionalism: 4,
        waitingTime: 2,
        facilityCleanliness: 4,
        overallExperience: 4,
        isAnonymous: true
      }
    ];

    setFeedbacks(mockFeedbacks);
    setFilteredFeedbacks(mockFeedbacks);
    
    // Calculate stats from mock data
    const averageRating = mockFeedbacks.reduce((sum, fb) => sum + fb.rating, 0) / mockFeedbacks.length;
    const ratingDist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    mockFeedbacks.forEach(fb => {
      ratingDist[fb.rating] = (ratingDist[fb.rating] || 0) + 1;
    });
    
    setStats({
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalFeedbacks: mockFeedbacks.length,
      ratingDistribution: ratingDist,
      detailedStats: {
        professionalism: 4.3,
        waitingTime: 3.3,
        cleanliness: 4.3,
        experience: 4.3
      }
    });
  };

  const calculateRatingDistribution = (feedbackList) => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    feedbackList.forEach(fb => {
      const rating = Math.round(fb.rating);
      if (rating >= 1 && rating <= 5) {
        distribution[rating]++;
      }
    });
    setStats(prev => ({ ...prev, ratingDistribution: distribution }));
  };

  useEffect(() => {
    // Apply filters
    let result = [...feedbacks];
    
    // Filter by rating
    if (ratingFilter !== "all") {
      const minRating = parseInt(ratingFilter);
      result = result.filter(fb => fb.rating >= minRating);
    }
    
    // Filter by search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(fb => 
        fb.patientName.toLowerCase().includes(term) ||
        fb.review.toLowerCase().includes(term)
      );
    }
    
    // Sort
    result = sortFeedbacks(result, sortBy);
    
    setFilteredFeedbacks(result);
  }, [feedbacks, ratingFilter, sortBy, searchTerm]);

  const sortFeedbacks = (list, sortMethod) => {
    const sorted = [...list];
    switch (sortMethod) {
      case "newest":
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case "oldest":
        return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case "highest":
        return sorted.sort((a, b) => b.rating - a.rating);
      case "lowest":
        return sorted.sort((a, b) => a.rating - b.rating);
      default:
        return sorted;
    }
  };

  const handleViewDetails = (feedback) => {
    setSelectedFeedback(feedback);
    setShowDetailsModal(true);
  };

  const renderStars = (rating, size = "md") => {
    const starSize = size === "sm" ? "w-3 h-3" : size === "lg" ? "w-6 h-6" : "w-4 h-4";
    
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`${starSize} ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className={`ml-2 font-medium ${
          size === "lg" ? "text-lg" : "text-sm"
        }`}>
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  const getRatingPercentage = (rating) => {
    if (stats.totalFeedbacks === 0) return 0;
    return Math.round((stats.ratingDistribution[rating] / stats.totalFeedbacks) * 100);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleBackToDashboard = () => {
    navigate("/doctor/dashboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading feedback data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <button
                onClick={handleBackToDashboard}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition duration-200"
              >
                <FaArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Patient Feedbacks</h1>
                <p className="text-sm text-gray-600">
                  Dr. {doctorData?.firstName} {doctorData?.lastName} • {doctorData?.specialization}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="flex items-center">
                  {renderStars(stats.averageRating, "sm")}
                  <span className="ml-2 text-sm text-gray-600">
                    {stats.totalFeedbacks} reviews
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Average Rating</p>
                  <div className="mt-2">
                    {renderStars(stats.averageRating, "lg")}
                  </div>
                </div>
                <FaChartBar className="w-12 h-12 text-blue-200 opacity-80" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Reviews</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.totalFeedbacks}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    from {stats.totalFeedbacks} patients
                  </p>
                </div>
                <FaComment className="w-12 h-12 text-blue-500 opacity-60" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Detailed Ratings</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Professionalism</span>
                      <span className="text-sm font-medium">{stats.detailedStats.professionalism.toFixed(1)}/5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Waiting Time</span>
                      <span className="text-sm font-medium">{stats.detailedStats.waitingTime.toFixed(1)}/5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Cleanliness</span>
                      <span className="text-sm font-medium">{stats.detailedStats.cleanliness.toFixed(1)}/5</span>
                    </div>
                  </div>
                </div>
                <FaStar className="w-12 h-12 text-yellow-500 opacity-60" />
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center">
                  <div className="flex items-center w-16">
                    {renderStars(rating, "sm")}
                  </div>
                  <div className="flex-1 ml-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-yellow-400 h-2.5 rounded-full" 
                        style={{ width: `${getRatingPercentage(rating)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="ml-4 w-16 text-right">
                    <span className="text-sm font-medium text-gray-900">
                      {stats.ratingDistribution[rating]} ({getRatingPercentage(rating)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                  >
                    <option value="all">All Ratings</option>
                    <option value="5">5 Stars Only</option>
                    <option value="4">4+ Stars</option>
                    <option value="3">3+ Stars</option>
                  </select>
                </div>

                <div className="relative">
                  <FaSort className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="highest">Highest Rated</option>
                    <option value="lowest">Lowest Rated</option>
                  </select>
                </div>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Feedback List */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {filteredFeedbacks.length === 0 ? (
              <div className="text-center py-12">
                <FaComment className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No feedbacks found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? "Try changing your search criteria" : "No feedbacks available yet"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredFeedbacks.map((feedback) => (
                  <div 
                    key={feedback._id} 
                    className="p-6 hover:bg-gray-50 transition duration-150 cursor-pointer"
                    onClick={() => handleViewDetails(feedback)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-medium text-sm">
                                {feedback.isAnonymous ? "A" : getInitials(feedback.patientName)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <h4 className="text-sm font-semibold text-gray-900">
                                {feedback.isAnonymous ? "Anonymous Patient" : feedback.patientName}
                              </h4>
                              <span className="ml-2 text-xs text-gray-500">
                                {formatDate(feedback.createdAt)}
                              </span>
                            </div>
                            <div className="mt-1">
                              {renderStars(feedback.rating)}
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 line-clamp-2">
                          {feedback.review}
                        </p>
                        
                        <div className="mt-3 flex items-center text-sm text-gray-500">
                          <FaCalendar className="w-3 h-3 mr-1" />
                          <span>Appointment: {formatDate(feedback.appointmentDate)}</span>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        <FaChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Page <span className="font-medium">{currentPage}</span> of{" "}
                    <span className="font-medium">{totalPages}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Feedback Details Modal */}
      {showDetailsModal && selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Feedback Details</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Patient Info */}
              <div className="flex items-center mb-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {selectedFeedback.isAnonymous ? "A" : getInitials(selectedFeedback.patientName)}
                    </span>
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {selectedFeedback.isAnonymous ? "Anonymous Patient" : selectedFeedback.patientName}
                  </h4>
                  <div className="flex items-center mt-1">
                    {renderStars(selectedFeedback.rating, "lg")}
                  </div>
                </div>
              </div>

              {/* Review Text */}
              <div className="mb-6">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Review</h5>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                  {selectedFeedback.review}
                </p>
              </div>

              {/* Detailed Ratings */}
              <div className="mb-6">
                <h5 className="text-sm font-medium text-gray-700 mb-3">Detailed Ratings</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <span className="text-xs text-gray-600">Doctor Professionalism</span>
                    <div className="flex items-center mt-1">
                      {renderStars(selectedFeedback.doctorProfessionalism, "sm")}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <span className="text-xs text-gray-600">Waiting Time</span>
                    <div className="flex items-center mt-1">
                      {renderStars(selectedFeedback.waitingTime, "sm")}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <span className="text-xs text-gray-600">Facility Cleanliness</span>
                    <div className="flex items-center mt-1">
                      {renderStars(selectedFeedback.facilityCleanliness, "sm")}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <span className="text-xs text-gray-600">Overall Experience</span>
                    <div className="flex items-center mt-1">
                      {renderStars(selectedFeedback.overallExperience, "sm")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="border-t pt-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Appointment Details</h5>
                <div className="flex items-center text-sm text-gray-600">
                  <FaCalendar className="w-4 h-4 mr-2" />
                  <span>{formatDate(selectedFeedback.appointmentDate)}</span>
                  <span className="mx-2">•</span>
                  <FaUser className="w-4 h-4 mr-2" />
                  <span>Dr. {doctorData?.firstName} {doctorData?.lastName}</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function
const getInitials = (name) => {
  if (!name) return 'P';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

export default DoctorFeedbackView;