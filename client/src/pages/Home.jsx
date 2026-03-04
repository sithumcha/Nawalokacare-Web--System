

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
  FaChevronRight,
  FaQuoteRight,
  FaMapMarkerAlt,
  FaAward,
  FaVideo,
  FaHandHoldingHeart,
  FaMicroscope,
  FaLaptopMedical
} from 'react-icons/fa';

const Home = () => {
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 2500,
    satisfactionRate: 98,
    departments: 15,
    experience: 25
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDoctorIndex, setCurrentDoctorIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // Mouse move effect for 3D parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch doctors data
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setIsLoading(true);
        
        const response = await axios.get('http://localhost:5000/api/doctors');
        const doctors = response.data;
        
        const featured = doctors.slice(0, 3);
        setFeaturedDoctors(featured);
        
        setStats(prev => ({
          ...prev,
          totalDoctors: doctors.length,
          departments: Math.max(15, new Set(doctors.map(d => d.department).filter(Boolean)).length)
        }));
        
      } catch (err) {
        console.log('Using fallback data:', err.message);
        setFeaturedDoctors(getFallbackDoctors());
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Auto-rotate featured doctors
  useEffect(() => {
    if (featuredDoctors.length > 0) {
      const interval = setInterval(() => {
        setCurrentDoctorIndex((prev) => (prev + 1) % featuredDoctors.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [featuredDoctors]);

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
      profilePicture: null,
      education: "Harvard Medical School",
      languages: ["English", "Spanish"]
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
      profilePicture: null,
      education: "Johns Hopkins University",
      languages: ["English", "Mandarin"]
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
      profilePicture: null,
      education: "Stanford University",
      languages: ["English", "Spanish"]
    }
  ];

  const features = [
    {
      icon: <FaUserMd className="text-3xl" />,
      title: 'Expert Doctors',
      description: 'Highly qualified specialists with 15+ years experience',
      gradient: 'from-blue-600 to-cyan-500',
      stats: '50+ Specialists',
      link: '/doctors'
    },
    {
      icon: <FaStethoscope className="text-3xl" />,
      title: 'Medical Checkups',
      description: 'Comprehensive health screenings and diagnostics',
      gradient: 'from-green-600 to-emerald-500',
      stats: 'Advanced Tech',
      link: '/services'
    },
    {
      icon: <FaPills className="text-3xl" />,
      title: 'Pharmacy',
      description: '24/7 pharmacy services with genuine medicines',
      gradient: 'from-purple-600 to-pink-500',
      stats: '100% Genuine',
      link: '/pharmacy'
    },
    {
      icon: <FaAmbulance className="text-3xl" />,
      title: 'Emergency Care',
      description: 'Immediate response within minutes, 24/7 available',
      gradient: 'from-red-600 to-orange-500',
      stats: '< 10 mins',
      link: '/emergency'
    },
    {
      icon: <FaCalendarAlt className="text-3xl" />,
      title: 'Online Booking',
      description: 'Easy appointment scheduling from anywhere',
      gradient: 'from-orange-500 to-yellow-500',
      stats: '24/7 Available',
      link: '/appointments'
    },
    {
      icon: <FaHeartbeat className="text-3xl" />,
      title: 'Patient Care',
      description: 'Compassionate and personalized healthcare',
      gradient: 'from-pink-500 to-rose-500',
      stats: '98% Satisfied',
      link: '/services'
    }
  ];

  const services = [
    {
      name: 'Cardiology',
      description: 'Heart care and cardiovascular treatments',
      icon: <FaHeartbeat className="text-3xl" />,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      doctorCount: 12,
      equipment: 'MRI, CT Scan'
    },
    {
      name: 'Neurology',
      description: 'Brain and nervous system specialists',
      icon: <FaBrain className="text-3xl" />,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      doctorCount: 8,
      equipment: 'EEG, EMG'
    },
    {
      name: 'Orthopedics',
      description: 'Bone and joint treatment',
      icon: <FaBone className="text-3xl" />,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      doctorCount: 10,
      equipment: 'X-Ray, Arthroscopy'
    },
    {
      name: 'Pediatrics',
      description: 'Specialized care for children',
      icon: <FaBaby className="text-3xl" />,
      color: 'text-pink-500',
      bgColor: 'bg-pink-50',
      doctorCount: 15,
      equipment: 'Child-friendly'
    },
    {
      name: 'Dermatology',
      description: 'Skin and cosmetic treatments',
      icon: <FaShieldAlt className="text-3xl" />,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      doctorCount: 9,
      equipment: 'Laser, Dermoscopy'
    },
    {
      name: 'Dental Care',
      description: 'Complete oral health services',
      icon: <FaTooth className="text-3xl" />,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      doctorCount: 14,
      equipment: '3D Imaging'
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Cardiology Patient",
      content: "The care I received was exceptional. Dr. Wilson was knowledgeable, patient, and took the time to explain everything in detail.",
      rating: 5,
      date: "2 weeks ago",
      location: "Colombo"
    },
    {
      name: "Mike Chen",
      role: "Orthopedics Patient",
      content: "From diagnosis to recovery, the entire team provided outstanding support. The online booking system made everything so convenient.",
      rating: 5,
      date: "1 month ago",
      location: "Kandy"
    },
    {
      name: "Emily Davis",
      role: "Pediatrics",
      content: "They made my child feel comfortable and safe throughout. The pediatric ward is beautifully designed for kids.",
      rating: 5,
      date: "3 weeks ago",
      location: "Galle"
    }
  ];

  const departments = [
    { name: 'Cardiology', icon: <FaHeartbeat />, count: 12 },
    { name: 'Neurology', icon: <FaBrain />, count: 8 },
    { name: 'Orthopedics', icon: <FaBone />, count: 10 },
    { name: 'Pediatrics', icon: <FaBaby />, count: 15 },
    { name: 'Dermatology', icon: <FaShieldAlt />, count: 9 },
    { name: 'Dental', icon: <FaTooth />, count: 14 }
  ];

  const achievements = [
    { year: '2023', title: 'Best Hospital Award', description: 'Sri Lanka Medical Council' },
    { year: '2022', title: 'Patient Safety Award', description: 'WHO Recognition' },
    { year: '2021', title: 'Excellence in Healthcare', description: 'Ministry of Health' },
    { year: '2020', title: 'Innovation in Medicine', description: 'Medical Association' }
  ];

  const formatPrice = (price) => {
    if (!price || price === 0) return "Free";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white overflow-x-hidden">
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(1); opacity: 0.5; }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse 3s ease-in-out infinite;
        }
        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          background-size: 1000px 100%;
          animation: shimmer 3s infinite;
        }
        .animate-rotate {
          animation: rotate 20s linear infinite;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .glass-effect {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }
        .text-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .card-3d {
          transform-style: preserve-3d;
          perspective: 1000px;
        }
        .card-3d:hover {
          transform: rotateX(5deg) rotateY(5deg);
        }
      `}</style>

      {/* Navbar */}
      <Navbar />

      {/* Hero Section - 3D Modern Design */}
      <section className="relative min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-float animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-float animation-delay-4000"></div>
        </div>

        {/* 3D Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full backdrop-blur-3xl animate-float"
            style={{
              transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
              transition: 'transform 0.1s ease-out'
            }}
          ></div>
          <div 
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full backdrop-blur-3xl animate-float"
            style={{
              transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)`,
              transition: 'transform 0.1s ease-out'
            }}
          ></div>
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)',
          backgroundSize: '50px 50px'
        }}></div>

        {/* 3D Rotating Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 border-2 border-white/20 rounded-full animate-rotate"></div>
        <div className="absolute bottom-20 left-20 w-48 h-48 border-2 border-white/10 rounded-full animate-rotate animation-delay-2000"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column */}
            <div className="space-y-8 animate-fadeInUp">
              {/* Trust Badge */}
              <div className="inline-flex items-center glass-effect px-6 py-3 rounded-full border border-white/30 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <FaShieldAlt className="text-green-400 mr-2 animate-pulse" />
                <span className="text-sm font-medium">Sri Lanka's Most Trusted Hospital • 25+ Years</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  NawalokaCare
                </span>
                <br />
                <span className="relative inline-block mt-4">
                  <span className="relative z-10 bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent text-6xl sm:text-7xl lg:text-8xl">
                    Healing
                  </span>
                  <span className="absolute -bottom-2 left-0 w-full h-4 bg-gradient-to-r from-yellow-300/30 to-red-300/30 blur-xl"></span>
                </span>
                <br />
                <span className="relative inline-block mt-2">
                  <span className="relative z-10 bg-gradient-to-r from-green-300 via-blue-300 to-purple-300 bg-clip-text text-transparent text-5xl sm:text-6xl lg:text-7xl">
                    with Innovation
                  </span>
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-300/20 to-purple-300/20 blur-2xl"></div>
                </span>
              </h1>

              <p className="text-xl text-blue-100 leading-relaxed max-w-2xl">
                Experience world-class healthcare with cutting-edge technology and compassionate care. 
                Your journey to better health starts here at Sri Lanka's premier medical institution.
              </p>

              {/* Quick Appointment Form */}
              {/* <div className="glass-effect rounded-2xl p-8 transform hover:scale-105 transition-all duration-500">
                <h3 className="text-2xl font-semibold mb-6 flex items-center">
                  <FaCalendarAlt className="mr-3 text-yellow-300" />
                  Quick Appointment
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select 
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                  >
                    <option value="" className="text-gray-900">Select Department</option>
                    {departments.map((dept, idx) => (
                      <option key={idx} value={dept.name.toLowerCase()} className="text-gray-900">
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                  />
                  <Link
                    to="/appointments"
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 text-center flex items-center justify-center transform hover:scale-105"
                  >
                    <FaCalendarAlt className="mr-2" />
                    Find Doctors
                  </Link>
                </div>
              </div> */}

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/list"
                  className="group relative px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-semibold text-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 transform hover:scale-105"
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  <span className="relative z-10 flex items-center">
                    <FaCalendarAlt className="mr-3 group-hover:rotate-12 transition-transform" />
                    Find Specialists
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                
                {/* <Link
                  to="/list"
                  className="group px-8 py-4 glass-effect border-2 border-white/30 text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-300 hover:-translate-y-1 transform hover:scale-105 flex items-center"
                >
                  <FaVideo className="mr-3 group-hover:scale-110 transition-transform" />
                  Find Specialists
                </Link> */}
              </div>

              {/* Emergency Badge */}
              <div className="flex items-center space-x-4 pt-4">
                <div className="flex items-center bg-red-500/20 backdrop-blur-md px-4 py-2 rounded-full border border-red-500/30 hover:bg-red-500/30 transition-all transform hover:scale-105">
                  <FaAmbulance className="text-red-400 mr-2 animate-pulse" />
                  <span className="text-sm font-medium">24/7 Emergency: <span className="text-white font-bold text-lg">1990</span></span>
                </div>
                <div className="flex items-center bg-green-500/20 backdrop-blur-md px-4 py-2 rounded-full border border-green-500/30 hover:bg-green-500/30 transition-all transform hover:scale-105">
                  <FaClock className="text-green-400 mr-2 animate-pulse" />
                  <span className="text-sm font-medium">Instant Response</span>
                </div>
              </div>
            </div>

            {/* Right Column - 3D Doctor Card */}
            <div className="relative animate-fadeInUp">
              {isLoading ? (
                <div className="glass-effect rounded-3xl p-12 flex items-center justify-center h-[600px]">
                  <FaSpinner className="animate-spin text-4xl text-white/50" />
                </div>
              ) : (
                <div 
                  className="relative transform-gpu transition-all duration-300 hover:scale-105 card-3d"
                  style={{
                    transform: `perspective(1000px) rotateY(${mousePosition.x}deg) rotateX(${-mousePosition.y}deg)`,
                  }}
                >
                  {/* 3D Card Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl"></div>
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl opacity-30 blur-xl"></div>
                  
                  {/* Card Content */}
                  <div className="relative p-8">
                    {/* Featured Badge */}
                    <div className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full font-semibold shadow-2xl animate-pulse transform hover:scale-110 transition-transform z-20">
                      ⭐ Featured Doctor
                    </div>

                    {/* Doctor Profile */}
                    <div className="text-center mb-8">
                      <div className="relative inline-block mb-6 group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-75 group-hover:opacity-100 blur transition-all"></div>
                        <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-1">
                          <div className="w-full h-full rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center overflow-hidden">
                            {currentDoctor.profilePicture ? (
                              <img 
                                src={`http://localhost:5000/${currentDoctor.profilePicture}`}
                                alt={currentDoctor.firstName}
                                className="w-full h-full rounded-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : (
                              <FaUserMd className="text-5xl text-white transform group-hover:scale-110 transition-transform" />
                            )}
                          </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white animate-pulse"></div>
                      </div>

                      <h3 className="text-3xl font-bold text-white mb-2">
                        Dr. {currentDoctor.firstName} {currentDoctor.lastName}
                      </h3>
                      <p className="text-xl text-blue-200 mb-4">
                        {currentDoctor.specialization || "Medical Specialist"}
                      </p>

                      {/* Rating */}
                      <div className="flex items-center justify-center mb-6">
                        <div className="flex text-yellow-400 mr-2">
                          {[...Array(5)].map((_, i) => (
                            <FaStar key={i} className={i < Math.floor(currentDoctor.rating || 4.5) ? "fill-current animate-pulse" : "fill-gray-400"} />
                          ))}
                        </div>
                        <span className="text-white font-semibold text-lg">{currentDoctor.rating || 4.5}</span>
                        <span className="text-blue-200 ml-2">(124 reviews)</span>
                      </div>

                      {/* Quick Info */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="glass-effect p-4 rounded-xl transform hover:scale-105 transition-all duration-300">
                          <FaClock className="text-blue-300 mx-auto mb-2 text-2xl" />
                          <p className="text-sm text-blue-200">Experience</p>
                          <p className="text-lg font-semibold text-white">{currentDoctor.experience || 10}+ years</p>
                        </div>
                        <div className="glass-effect p-4 rounded-xl transform hover:scale-105 transition-all duration-300">
                          <FaAward className="text-purple-300 mx-auto mb-2 text-2xl" />
                          <p className="text-sm text-blue-200">Consultation</p>
                          <p className="text-lg font-semibold text-white">{formatPrice(currentDoctor.price)}</p>
                        </div>
                      </div>

                      {/* Education */}
                      <div className="glass-effect p-4 rounded-xl mb-6">
                        <p className="text-sm text-blue-200 mb-2">Education</p>
                        <p className="text-white font-medium">{currentDoctor.education || "Harvard Medical School"}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {(currentDoctor.languages || ["English", "Sinhala"]).map((lang, idx) => (
                            <span key={idx} className="px-2 py-1 bg-white/10 rounded-full text-xs text-white">
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Availability */}
                      <div className="glass-effect p-4 rounded-xl mb-6">
                        <p className="text-sm text-blue-200 mb-3">Available for:</p>
                        <div className="flex justify-center gap-3">
                          {getAvailableTypes(currentDoctor).map((type, idx) => (
                            <span key={idx} className={`px-4 py-2 rounded-full text-sm font-medium transform hover:scale-105 transition-all ${
                              type === 'physical' 
                                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' 
                                : 'bg-green-500/20 text-green-300 border border-green-500/30'
                            }`}>
                              {type === 'physical' ? '🏥 In-Person' : '💻 Online'}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Book Button */}
                      <Link
                        to={`/doctordetails/${currentDoctor._id}`}
                        className="block w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 hover:scale-105 relative overflow-hidden group"
                      >
                        <span className="relative z-10">Book Consultation Now</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Doctor Navigation Dots */}
              {featuredDoctors.length > 1 && (
                <div className="flex justify-center mt-8 space-x-2">
                  {featuredDoctors.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentDoctorIndex(index)}
                      className={`h-2 rounded-full transition-all duration-300 transform hover:scale-150 ${
                        index === currentDoctorIndex 
                          ? 'w-8 bg-white' 
                          : 'w-2 bg-white/30 hover:bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #2563eb 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: <FaHospital className="text-4xl" />, value: '25+', label: 'Years of Excellence', color: 'from-blue-400 to-blue-600' },
              { icon: <FaUserMd className="text-4xl" />, value: stats.totalDoctors + '+', label: 'Expert Doctors', color: 'from-purple-400 to-purple-600' },
              { icon: <FaUsers className="text-4xl" />, value: '50k+', label: 'Happy Patients', color: 'from-pink-400 to-pink-600' },
              { icon: <FaAward className="text-4xl" />, value: '98%', label: 'Satisfaction Rate', color: 'from-green-400 to-green-600' }
            ].map((stat, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-8 text-center transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 shadow-xl hover:shadow-2xl card-3d"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl"></div>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-30 blur transition-all duration-500"></div>
                
                <div className="relative">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${stat.color} text-white mb-6 mx-auto group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 shadow-lg`}>
                    {stat.icon}
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{stat.value}</div>
                  <div className="text-gray-600 font-medium group-hover:text-gray-900 transition-colors">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #7c3aed 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 animate-fadeInUp">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Why Choose{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                NawalokaCare?
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience healthcare reimagined with cutting-edge technology and compassionate care
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 overflow-hidden card-3d"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} style={{ padding: '2px' }}>
                  <div className="absolute inset-0 bg-white rounded-2xl"></div>
                </div>

                <div className="relative p-8">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${feature.gradient} text-white mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg`}>
                    {feature.icon}
                  </div>

                  <div className="absolute top-6 right-6 bg-gray-100 px-3 py-1 rounded-full text-sm font-semibold text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">
                    {feature.stats}
                  </div>

                  <h3 className="text-2xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {feature.description}
                  </p>

                  <Link
                    to={feature.link}
                    className="inline-flex items-center text-blue-600 font-semibold group-hover:text-blue-700"
                  >
                    Learn More
                    <FaArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full filter blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2 animate-float"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-100 rounded-full filter blur-3xl opacity-30 translate-x-1/2 translate-y-1/2 animate-float animation-delay-2000"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 animate-fadeInUp">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Our{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Specialized Services
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive healthcare solutions delivered by expert specialists using advanced technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 overflow-hidden border-2 border-transparent hover:border-blue-500 card-3d"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative p-8">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl ${service.bgColor} ${service.color} mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg`}>
                    {service.icon}
                  </div>

                  <div className="absolute top-6 right-6 bg-gray-100 px-3 py-1 rounded-full text-xs font-semibold text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">
                    {service.equipment}
                  </div>

                  <h3 className="text-2xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {service.description}
                  </p>

                  <div className="flex items-center text-sm text-blue-600 mb-6">
                    <FaUserMd className="mr-2" />
                    {service.doctorCount} Specialists Available
                  </div>

                  <Link
                    to={`/doctors?specialization=${service.name.toLowerCase()}`}
                    className="inline-flex items-center text-blue-600 font-semibold group-hover:text-blue-700"
                  >
                    Book Appointment
                    <FaChevronRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12 animate-fadeInUp">
            <Link
              to="/services"
              className="group inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:-translate-y-1 hover:scale-105 transition-all duration-300"
            >
              View All Services
              <FaArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fadeInUp">
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
              <div key={index} className="relative text-center group">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-2xl font-bold mb-6 relative z-10 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                  {step.icon}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-sm">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{step.title}</h3>
                <p className="text-gray-600 group-hover:text-gray-900 transition-colors">{step.description}</p>
                {index < 3 && (
                  <div className="hidden md:block absolute top-10 left-3/4 w-full h-0.5 bg-gradient-to-r from-blue-400 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fadeInUp">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Patients Say
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real stories from patients who experienced our care
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`transition-all duration-1000 transform ${
                  index === activeTestimonial 
                    ? 'opacity-100 translate-x-0 scale-100' 
                    : 'opacity-0 translate-x-full scale-95 absolute top-0 left-0'
                }`}
              >
                <div className="bg-white rounded-2xl shadow-2xl p-12 relative overflow-hidden group hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 card-3d">
                  <FaQuoteRight className="absolute top-8 right-8 text-6xl text-blue-100 group-hover:text-blue-200 transition-colors" />

                  <div className="flex text-yellow-400 mb-6 text-2xl">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <FaStar key={i} className="animate-pulse" />
                    ))}
                  </div>

                  <p className="text-xl text-gray-700 leading-relaxed mb-8">
                    "{testimonial.content}"
                  </p>

                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <h4 className="text-xl font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-gray-600">{testimonial.role}</p>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <FaMapMarkerAlt className="mr-1" />
                        {testimonial.location}
                        <span className="mx-2">•</span>
                        <FaClock className="mr-1" />
                        {testimonial.date}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`h-2 rounded-full transition-all duration-300 transform hover:scale-150 ${
                    index === activeTestimonial 
                      ? 'w-8 bg-blue-600' 
                      : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fadeInUp">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Achievements
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Recognitions that reflect our commitment to excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className="relative bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-l-4 border-blue-500"
              >
                <div className="text-3xl font-bold text-blue-600 mb-2">{achievement.year}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{achievement.title}</h3>
                <p className="text-gray-600 text-sm">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          backgroundSize: '60px 60px'
        }}></div>
        
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl font-bold text-white mb-8 animate-fadeInUp">
            Ready to Transform Your{' '}
            <span className="text-yellow-300">Healthcare Experience?</span>
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto animate-fadeInUp">
            Join thousands of patients who have already chosen NawalokaCare for their healthcare needs. 
            Experience the difference of quality care.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fadeInUp">
            <Link
              to="/appointments"
              className="group relative px-10 py-5 bg-white text-blue-600 rounded-xl font-semibold text-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 transform hover:scale-105"
            >
              <span className="relative z-10 flex items-center">
                <FaCalendarAlt className="mr-3 group-hover:rotate-12 transition-transform" />
                Book Appointment Now
              </span>
            </Link>
            
            <Link
              to="/contact"
              className="group px-10 py-5 bg-transparent border-2 border-white text-white rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 transform hover:scale-105 flex items-center justify-center"
            >
              <FaPhoneAlt className="mr-3 group-hover:scale-110 transition-transform" />
              Contact Our Team
            </Link>
          </div>

          <div className="mt-8 text-blue-200 flex items-center justify-center space-x-4 animate-fadeInUp">
            <span className="inline-flex items-center">
              <FaClock className="mr-2 animate-pulse" />
              24/7 Emergency Support
            </span>
            <span className="text-white font-bold text-2xl">1990</span>
          </div>
        </div>
      </section>

      <Footer />
      <Chatbot />
    </div>
  );
};

export default Home;