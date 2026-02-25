import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Chatbot from '../pages/Chatbot';
import { 
  FaStethoscope, 
  FaUserMd, 
  FaPills, 
  FaAmbulance, 
  FaCalendarAlt, 
  FaHeartbeat,
  FaBrain,
  FaBone,
  FaBaby,
  FaTooth,
  FaStar,
  FaClock,
  FaPhoneAlt,
  FaArrowRight,
  FaShieldAlt,
  FaHospital,
  FaUserCheck,
  FaSpinner,
  FaUsers,
  FaCheckCircle,
  FaChevronRight
} from 'react-icons/fa';

const Home = () => {
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 2500,
    satisfactionRate: 98,
    departments: 15
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDoctorIndex, setCurrentDoctorIndex] = useState(0);
  const [isEmergencyHovered, setIsEmergencyHovered] = useState(false);

  // Fetch doctors data
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setIsLoading(true);
        
        // Try to fetch from API
        const response = await axios.get('http://localhost:5000/api/doctors');
        const doctors = response.data;
        
        // Take first 3 doctors as featured
        const featured = doctors.slice(0, 3);
        setFeaturedDoctors(featured);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          totalDoctors: doctors.length,
          departments: Math.max(15, new Set(doctors.map(d => d.department).filter(Boolean)).length)
        }));
        
      } catch (err) {
        console.log('Using fallback data:', err.message);
        // Use fallback data if API fails
        setFeaturedDoctors(getFallbackDoctors());
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Fallback doctors data
  const getFallbackDoctors = () => [
    {
      _id: "1",
      firstName: "Sarah",
      lastName: "Wilson",
      specialization: "Cardiology",
      department: "Cardiology",
      experience: 15,
      rating: 4.9,
      price: 150,
      phoneNumber: "+1 234 567 8900",
      availableTimeSlots: [{ consultationType: 'physical' }, { consultationType: 'online' }],
      profilePicture: null
    },
    {
      _id: "2",
      firstName: "Michael",
      lastName: "Chen",
      specialization: "Neurology",
      department: "Neurology",
      experience: 12,
      rating: 4.8,
      price: 180,
      phoneNumber: "+1 234 567 8901",
      availableTimeSlots: [{ consultationType: 'physical' }],
      profilePicture: null
    },
    {
      _id: "3",
      firstName: "James",
      lastName: "Rodriguez",
      specialization: "Orthopedics",
      department: "Orthopedics",
      experience: 18,
      rating: 4.9,
      price: 200,
      phoneNumber: "+1 234 567 8902",
      availableTimeSlots: [{ consultationType: 'physical' }, { consultationType: 'online' }],
      profilePicture: null
    }
  ];

  const features = [
    {
      icon: <FaUserMd className="text-3xl" />,
      title: 'Expert Doctors',
      description: 'Highly qualified and experienced medical professionals',
      gradient: 'from-blue-500 to-blue-600',
      link: '/doctors'
    },
    {
      icon: <FaStethoscope className="text-3xl" />,
      title: 'Medical Checkups',
      description: 'Comprehensive health screenings and diagnostics',
      gradient: 'from-green-500 to-green-600',
      link: '/services'
    },
    {
      icon: <FaPills className="text-3xl" />,
      title: 'Pharmacy',
      description: 'Complete pharmacy services with genuine medicines',
      gradient: 'from-purple-500 to-purple-600',
      link: '/pharmacy'
    },
    {
      icon: <FaAmbulance className="text-3xl" />,
      title: 'Emergency Care',
      description: '24/7 emergency services with quick response',
      gradient: 'from-red-500 to-red-600',
      link: '/emergency'
    },
    {
      icon: <FaCalendarAlt className="text-3xl" />,
      title: 'Online Booking',
      description: 'Easy appointment scheduling from anywhere',
      gradient: 'from-orange-500 to-orange-600',
      link: '/appointments'
    },
    {
      icon: <FaHeartbeat className="text-3xl" />,
      title: 'Patient Care',
      description: 'Compassionate and personalized healthcare',
      gradient: 'from-pink-500 to-pink-600',
      link: '/services'
    }
  ];

  const services = [
    {
      name: 'Cardiology',
      description: 'Heart care and cardiovascular treatments',
      icon: <FaHeartbeat className="text-3xl" />,
      color: 'text-red-500',
      doctorCount: 12
    },
    {
      name: 'Neurology',
      description: 'Brain and nervous system specialists',
      icon: <FaBrain className="text-3xl" />,
      color: 'text-purple-500',
      doctorCount: 8
    },
    {
      name: 'Orthopedics',
      description: 'Bone and joint treatment',
      icon: <FaBone className="text-3xl" />,
      color: 'text-blue-500',
      doctorCount: 10
    },
    {
      name: 'Pediatrics',
      description: 'Specialized care for children',
      icon: <FaBaby className="text-3xl" />,
      color: 'text-pink-500',
      doctorCount: 15
    },
    {
      name: 'Dermatology',
      description: 'Skin and cosmetic treatments',
      icon: <FaShieldAlt className="text-3xl" />,
      color: 'text-yellow-500',
      doctorCount: 9
    },
    {
      name: 'Dental Care',
      description: 'Complete oral health services',
      icon: <FaTooth className="text-3xl" />,
      color: 'text-green-500',
      doctorCount: 14
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Cardiology Patient",
      content: "The care I received was exceptional. Dr. Wilson was knowledgeable, patient, and took the time to explain everything in detail.",
      rating: 5,
      date: "2 weeks ago"
    },
    {
      name: "Mike Chen",
      role: "Orthopedics Patient",
      content: "From diagnosis to recovery, the entire team provided outstanding support. The online booking system made everything so convenient.",
      rating: 5,
      date: "1 month ago"
    },
    {
      name: "Emily Davis",
      role: "Pediatrics",
      content: "They made my child feel comfortable and safe throughout. The pediatric ward is beautifully designed for kids.",
      rating: 5,
      date: "3 weeks ago"
    }
  ];

  // Auto-rotate featured doctors
  useEffect(() => {
    if (featuredDoctors.length > 0) {
      const interval = setInterval(() => {
        setCurrentDoctorIndex((prev) => (prev + 1) % featuredDoctors.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [featuredDoctors]);

  const formatPrice = (price) => {
    if (!price || price === 0) return "Free";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getAvailableTypes = (doctor) => {
    const types = new Set();
    if (doctor.availableTimeSlots) {
      doctor.availableTimeSlots.forEach(slot => {
        if (slot.consultationType) {
          types.add(slot.consultationType);
        }
      });
    }
    return Array.from(types);
  };

  const currentDoctor = featuredDoctors[currentDoctorIndex] || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-48 translate-y-48"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center bg-blue-800 bg-opacity-50 px-4 py-2 rounded-full mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                <span className="text-sm font-medium">24/7 Emergency Services Available</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Your Health is Our 
                <span className="block text-blue-200 mt-2">Top Priority</span>
              </h1>
              
              <p className="text-xl text-blue-100 mb-8 leading-relaxed max-w-2xl">
                Connect with expert doctors instantly. Book appointments, get consultations, 
                and receive premium healthcare from the comfort of your home.
              </p>

              {/* Quick Appointment Form */}
              <div className="bg-white  bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 mb-8">
                <h3 className=" text-blue-500 text-xl font-semibold mb-4">Book Appointment Quickly</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select className="bg-white bg-opacity-20 border border-blue-300 rounded-lg px-4 py-3 text-blue-700 placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300">
                    <option value="">Select Department</option>
                    <option value="cardiology">Cardiology</option>
                    <option value="neurology">Neurology</option>
                    <option value="orthopedics">Orthopedics</option>
                    <option value="pediatrics">Pediatrics</option>
                    <option value="dermatology">Dermatology</option>
                    <option value="dentistry">Dentistry</option>
                  </select>
                  <input 
                    type="date" 
                    className="bg-white bg-opacity-20 border border-blue-300 rounded-lg px-4 py-3 text-blue-700 placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <Link
                    to="/appointments"
                    className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300 text-center flex items-center justify-center"
                  >
                    <FaCalendarAlt className="mr-2" />
                    Find Doctors
                  </Link>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/appointments"
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 hover:shadow-lg transition-all duration-300 flex items-center"
                >
                  <FaCalendarAlt className="mr-3" />
                  Book Appointment
                </Link>
                <Link
                  to="/list"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 flex items-center"
                >
                  <FaUserMd className="mr-3" />
                  Find Doctors
                </Link>
              </div>
            </div>

            {/* Featured Doctor Card */}
            <div className="relative">
              {isLoading ? (
                <div className="bg-white bg-opacity-20 rounded-3xl p-8 backdrop-blur-sm border border-white border-opacity-30 flex items-center justify-center h-96">
                  <FaSpinner className="animate-spin text-3xl text-white" />
                </div>
              ) : (
                <div className="bg-white bg-opacity-20 rounded-3xl p-8 backdrop-blur-sm border border-white border-opacity-30">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2 text-blue-700">Featured Doctor</h3>
                    <p className="text-blue-200">Available for appointments</p>
                  </div>
                  
                  <div className="bg-white rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center mb-6">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mr-6">
                        {currentDoctor.profilePicture ? (
                          <img 
                            src={`http://localhost:5000/${currentDoctor.profilePicture}`}
                            alt={currentDoctor.firstName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <FaUserMd className="text-4xl text-blue-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold text-gray-900">
                          Dr. {currentDoctor.firstName} {currentDoctor.lastName}
                        </h4>
                        <p className="text-blue-600 font-semibold">
                          {currentDoctor.specialization || "Medical Specialist"}
                        </p>
                        <div className="flex items-center mt-2">
                          <div className="flex text-yellow-400 mr-2">
                            {[...Array(5)].map((_, i) => (
                              <FaStar key={i} className={i < Math.floor(currentDoctor.rating || 4.5) ? "fill-current" : "fill-gray-300"} />
                            ))}
                          </div>
                          <span className="text-gray-600">{currentDoctor.rating || 4.5}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Experience</p>
                        <p className="font-semibold text-blue-700">{currentDoctor.experience || 10}+ years</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Price</p>
                        <p className="font-semibold text-blue-700">{formatPrice(currentDoctor.price)}</p>
                      </div>
                    </div>

                    {/* Consultation Types */}
                    <div className="mb-6">
                      <p className="text-sm text-gray-500 mb-2">Available for:</p>
                      <div className="flex gap-2">
                        {getAvailableTypes(currentDoctor).map((type, idx) => (
                          <span key={idx} className={`px-3 py-1 rounded-full text-xs font-medium ${
                            type === 'physical' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {type === 'physical' ? '🏥 In-Person' : '💻 Online'}
                          </span>
                        ))}
                        {getAvailableTypes(currentDoctor).length === 0 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                            By Appointment
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <Link
                      to={`/doctordetails/${currentDoctor._id}`}
                      className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md"
                    >
                      Book Consultation
                    </Link>
                  </div>

                  {/* Doctor Navigation Dots */}
                  {featuredDoctors.length > 1 && (
                    <div className="flex justify-center mt-6 space-x-2">
                      {featuredDoctors.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentDoctorIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentDoctorIndex ? 'bg-white w-6' : 'bg-white bg-opacity-50'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Stats Badges */}
              <div className="absolute -bottom-4 -left-4 bg-white text-blue-600 p-6 rounded-2xl shadow-2xl border border-gray-200">
                <div className="flex items-center">
                  <FaClock className="text-2xl mr-3 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold">24/7</div>
                    <div className="text-sm font-semibold">Emergency</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-2xl">
                <div className="flex items-center">
                  <FaStar className="text-2xl mr-3" />
                  <div>
                    <div className="text-2xl font-bold">{stats.satisfactionRate}%</div>
                    <div className="text-sm font-semibold">Satisfaction</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div 
              className="text-center p-6 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 border border-gray-100"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                <FaUserMd className="text-2xl" />
              </div>
              <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
                {stats.totalDoctors}+
              </div>
              <div className="text-gray-600 font-semibold">
                Expert Doctors
              </div>
            </div>
            
            <div 
              className="text-center p-6 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 border border-gray-100"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                <FaUsers className="text-2xl" />
              </div>
              <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
                {stats.totalPatients.toLocaleString()}+
              </div>
              <div className="text-gray-600 font-semibold">
                Happy Patients
              </div>
            </div>
            
            <div 
              className="text-center p-6 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 border border-gray-100"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 text-purple-600 mb-4">
                <FaClock className="text-2xl" />
              </div>
              <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
                24/7
              </div>
              <div className="text-gray-600 font-semibold">
                Emergency Services
              </div>
            </div>
            
            <div 
              className="text-center p-6 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 border border-gray-100"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 text-yellow-600 mb-4">
                <FaHospital className="text-2xl" />
              </div>
              <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
                {}15+
              </div>
              <div className="text-gray-600 font-semibold">
                Departments
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Hospital?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We combine medical excellence with compassionate care to provide 
              the best healthcare experience for our patients.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  {feature.description}
                </p>
                <Link
                  to={feature.link}
                  className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700"
                >
                  Learn More
                  <FaChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Specialized Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive healthcare services delivered by specialized medical 
              professionals using the latest technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="group bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-2xl transition-all duration-300"
              >
                <div className={`${service.color} mb-6 transform group-hover:scale-110 transition-transform duration-300`}>
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {service.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {service.description}
                </p>
                <div className="text-sm text-blue-600 mb-6 font-medium">
                  {service.doctorCount} Doctors Available
                </div>
                <Link
                  to={`/doctors?specialization=${service.name.toLowerCase()}`}
                  className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700"
                >
                  Book Appointment
                  <FaChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/services"
              className="inline-flex items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              View All Services
              <FaArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple steps to get the medical care you need
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: 1,
                title: "Find Doctor",
                description: "Search from our database of specialists",
                icon: <FaUserMd className="text-3xl" />
              },
              {
                step: 2,
                title: "Book Appointment",
                description: "Choose date, time and consultation type",
                icon: <FaCalendarAlt className="text-3xl" />
              },
              {
                step: 3,
                title: "Consultation",
                description: "Meet doctor online or in-person",
                icon: <FaStethoscope className="text-3xl" />
              },
              {
                step: 4,
                title: "Get Treatment",
                description: "Receive prescriptions and follow-up care",
                icon: <FaCheckCircle className="text-3xl" />
              }
            ].map((step, index) => (
              <div key={index} className="relative text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-2xl font-bold mb-6 relative z-10">
                  {step.icon}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-sm">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
                {index < 3 && (
                  <div className="hidden md:block absolute top-10 left-3/4 w-full h-0.5 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

     
     

      {/* CTA Section - Home Page Colors */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#2563eb] to-[#1d4ed8]"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#dbeafe] rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#dbeafe] rounded-full translate-y-48 -translate-x-48"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Start Your Health Journey Today
          </h2>
          <p className="text-xl text-[#dbeafe] mb-8">
            Join thousands of patients who trust us for their healthcare needs. 
            Book your appointment today and experience the difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/appointments"
              className="bg-white text-[#2563eb] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#dbeafe] hover:shadow-xl transition-all duration-300 flex items-center justify-center"
            >
              <FaCalendarAlt className="mr-3" />
              Book Appointment
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-[#2563eb] transition-all duration-300 flex items-center justify-center"
            >
              <FaPhoneAlt className="mr-3" />
              Contact Us
            </Link>
          </div>
          <p className="text-[#dbeafe] mt-6">
            Need help? Call us at <span className="font-semibold text-white">1-800-HEALTH</span>
          </p>
        </div>
      </section>
      <Footer />
      <Chatbot/>
    </div>
  );
};

export default Home;