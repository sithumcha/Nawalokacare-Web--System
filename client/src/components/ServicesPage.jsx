import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { 
  FaHeartbeat, 
  FaBrain, 
  FaTooth, 
  FaEye, 
  FaBaby, 
  FaBone, 
  FaStethoscope, 
  FaUserMd, 
  FaCalendarCheck, 
  FaVideo, 
  FaHospital, 
  FaPrescriptionBottleAlt,
  FaClock,
  FaCheckCircle,
  FaStar,
  FaArrowRight,
  FaPhone,
  FaMapMarkerAlt,
  FaSpinner,
  FaUsers,
  FaBriefcaseMedical,
  FaHandsHelping,
  FaProcedures,
  FaAllergies,
  FaLungs,
  FaXRay,
  FaWeight,
  FaFemale,
  FaMale,
  FaUserInjured
} from "react-icons/fa";

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalServices: 0,
    totalPatients: 0,
    satisfactionRate: 98
  });

  const API_URL = "http://localhost:5000/api";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch doctors data
      const doctorsRes = await axios.get(`${API_URL}/doctors`);
      const doctorsData = doctorsRes.data;
      setDoctors(doctorsData);
      
      // Calculate services from doctors data
      const servicesFromDoctors = extractServicesFromDoctors(doctorsData);
      setServices(servicesFromDoctors);

      // Fetch stats or calculate from data
      const calculatedStats = calculateStats(doctorsData, servicesFromDoctors);
      setStats(calculatedStats);

    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Unable to load services data. Please try again later.");
      // Fallback to sample data
      setServices(getFallbackServices());
    } finally {
      setIsLoading(false);
    }
  };

  const extractServicesFromDoctors = (doctorsData) => {
    // Group doctors by specialization to create services
    const servicesMap = {};
    
    doctorsData.forEach(doctor => {
      const specialization = doctor.specialization || "General Medicine";
      const department = doctor.department || "General";
      
      if (!servicesMap[specialization]) {
        servicesMap[specialization] = {
          id: specialization.toLowerCase().replace(/\s+/g, '-'),
          title: specialization,
          description: getServiceDescription(specialization),
          icon: getServiceIcon(specialization),
          color: getServiceColor(specialization),
          borderColor: getBorderColor(specialization),
          doctors: [],
          features: getServiceFeatures(specialization),
          priceRange: getPriceRange(doctorsData, specialization),
          duration: getDuration(specialization),
          available: true,
          department: department,
          consultationTypes: getConsultationTypes(doctor)
        };
      }
      
      servicesMap[specialization].doctors.push({
        id: doctor._id,
        name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
        experience: doctor.experience,
        rating: doctor.rating || 4.5,
        price: doctor.price,
        availableForOnline: doctor.availableTimeSlots?.some(slot => slot.consultationType === 'online') || false
      });
    });

    // Convert to array and add doctor count
    return Object.values(servicesMap).map(service => ({
      ...service,
      doctorCount: service.doctors.length
    }));
  };

  const getServiceIcon = (specialization) => {
    const iconMap = {
      'Cardiology': <FaHeartbeat className="text-3xl text-red-500" />,
      'Neurology': <FaBrain className="text-3xl text-purple-500" />,
      'Dentistry': <FaTooth className="text-3xl text-blue-500" />,
      'Dentist': <FaTooth className="text-3xl text-blue-500" />,
      'Ophthalmology': <FaEye className="text-3xl text-green-500" />,
      'Pediatrics': <FaBaby className="text-3xl text-pink-500" />,
      'Orthopedics': <FaBone className="text-3xl text-yellow-500" />,
      'Orthopedic': <FaBone className="text-3xl text-yellow-500" />,
      'General Medicine': <FaStethoscope className="text-3xl text-indigo-500" />,
      'General Physician': <FaStethoscope className="text-3xl text-indigo-500" />,
      'Dermatology': <FaUserMd className="text-3xl text-teal-500" />,
      'Dermatologist': <FaUserMd className="text-3xl text-teal-500" />,
      'Gynecology': <FaFemale className="text-3xl text-pink-600" />,
      'Psychiatry': <FaBrain className="text-3xl text-purple-600" />,
      'ENT': <FaAllergies className="text-3xl text-orange-500" />,
      'Pulmonology': <FaLungs className="text-3xl text-cyan-500" />,
      'Radiology': <FaXRay className="text-3xl text-gray-500" />,
      'Endocrinology': <FaWeight className="text-3xl text-green-600" />,
      'Urology': <FaMale className="text-3xl text-blue-600" />,
      'Emergency Medicine': <FaUserInjured className="text-3xl text-red-600" />,
      'Surgery': <FaProcedures className="text-3xl text-red-700" />,
      'Physiotherapy': <FaHandsHelping className="text-3xl text-green-700" />
    };
    
    return iconMap[specialization] || <FaBriefcaseMedical className="text-3xl text-gray-500" />;
  };

  const getServiceColor = (specialization) => {
    const colorMap = {
      'Cardiology': 'from-red-50 to-red-100',
      'Neurology': 'from-purple-50 to-purple-100',
      'Dentistry': 'from-blue-50 to-blue-100',
      'Dentist': 'from-blue-50 to-blue-100',
      'Ophthalmology': 'from-green-50 to-green-100',
      'Pediatrics': 'from-pink-50 to-pink-100',
      'Orthopedics': 'from-yellow-50 to-yellow-100',
      'Orthopedic': 'from-yellow-50 to-yellow-100',
      'General Medicine': 'from-indigo-50 to-indigo-100',
      'General Physician': 'from-indigo-50 to-indigo-100',
      'Dermatology': 'from-teal-50 to-teal-100',
      'Dermatologist': 'from-teal-50 to-teal-100',
      'Gynecology': 'from-pink-50 to-rose-100',
      'Psychiatry': 'from-purple-50 to-violet-100',
      'ENT': 'from-orange-50 to-orange-100',
      'Pulmonology': 'from-cyan-50 to-cyan-100',
      'Radiology': 'from-gray-50 to-gray-100',
      'Endocrinology': 'from-green-50 to-emerald-100',
      'Urology': 'from-blue-50 to-indigo-100',
      'Emergency Medicine': 'from-red-50 to-orange-100',
      'Surgery': 'from-red-100 to-red-50',
      'Physiotherapy': 'from-green-50 to-lime-100'
    };
    
    return colorMap[specialization] || 'from-gray-50 to-gray-100';
  };

  const getBorderColor = (specialization) => {
    const borderMap = {
      'Cardiology': 'border-red-200',
      'Neurology': 'border-purple-200',
      'Dentistry': 'border-blue-200',
      'Ophthalmology': 'border-green-200',
      'Pediatrics': 'border-pink-200',
      'Orthopedics': 'border-yellow-200',
      'General Medicine': 'border-indigo-200',
      'Dermatology': 'border-teal-200'
    };
    
    return borderMap[specialization] || 'border-gray-200';
  };

  const getServiceDescription = (specialization) => {
    const descriptionMap = {
      'Cardiology': 'Specialized care for heart and cardiovascular system diseases including diagnosis and treatment.',
      'Neurology': 'Treatment and management of disorders affecting the nervous system, brain, and spinal cord.',
      'Dentistry': 'Complete dental care services including preventive, cosmetic, and surgical treatments.',
      'Ophthalmology': 'Comprehensive eye care including vision correction, surgery, and treatment of eye diseases.',
      'Pediatrics': 'Healthcare services for infants, children, and adolescents focusing on growth and development.',
      'Orthopedics': 'Treatment of musculoskeletal system including bones, joints, muscles, and ligaments.',
      'General Medicine': 'Primary healthcare for common illnesses, preventive care, and chronic disease management.',
      'Dermatology': 'Diagnosis and treatment of skin conditions, hair disorders, and cosmetic skin procedures.',
      'Gynecology': 'Women\'s health services including reproductive health, pregnancy care, and gynecological surgery.',
      'Psychiatry': 'Mental health care including diagnosis, therapy, and medication management for psychological disorders.',
      'ENT': 'Treatment of ear, nose, and throat disorders including hearing and balance problems.',
      'Pulmonology': 'Care for respiratory system diseases including asthma, COPD, and lung infections.',
      'Radiology': 'Diagnostic imaging services including X-rays, CT scans, MRI, and ultrasound.',
      'Endocrinology': 'Treatment of hormonal disorders including diabetes, thyroid problems, and metabolic issues.',
      'Urology': 'Care for urinary tract and male reproductive system disorders.',
      'Emergency Medicine': 'Immediate medical care for acute illnesses and injuries requiring urgent attention.',
      'Surgery': 'Surgical procedures for various medical conditions including minimally invasive and major surgeries.',
      'Physiotherapy': 'Rehabilitation services to restore movement and function after injury or illness.'
    };
    
    return descriptionMap[specialization] || `Professional ${specialization.toLowerCase()} services provided by certified specialists.`;
  };

  const getServiceFeatures = (specialization) => {
    const featuresMap = {
      'Cardiology': ['ECG Monitoring', 'Echocardiography', 'Angioplasty', 'Stress Test', 'Holter Monitoring'],
      'Neurology': ['EEG Testing', 'MRI Scan', 'Nerve Conduction', 'Brain Mapping', 'EMG'],
      'Dentistry': ['Teeth Cleaning', 'Root Canal', 'Dental Implants', 'Braces', 'Teeth Whitening'],
      'Ophthalmology': ['Eye Exam', 'LASIK Surgery', 'Cataract Surgery', 'Glaucoma Care', 'Retina Care'],
      'Pediatrics': ['Vaccinations', 'Growth Monitoring', 'Child Nutrition', 'Development Checks', 'Newborn Care'],
      'Orthopedics': ['Joint Replacement', 'Fracture Care', 'Sports Medicine', 'Physical Therapy', 'Arthroscopy'],
      'General Medicine': ['Health Checkup', 'Disease Prevention', 'Chronic Care', 'Vaccinations', 'Lab Tests'],
      'Dermatology': ['Skin Cancer Screening', 'Acne Treatment', 'Laser Therapy', 'Cosmetic Procedures', 'Biopsy']
    };
    
    return featuresMap[specialization] || ['Consultation', 'Diagnosis', 'Treatment Planning', 'Follow-up Care'];
  };

  const getPriceRange = (doctors, specialization) => {
    const specializedDoctors = doctors.filter(doc => 
      doc.specialization === specialization && doc.price
    );
    
    if (specializedDoctors.length === 0) return "$100 - $300";
    
    const prices = specializedDoctors.map(d => d.price).filter(p => p > 0);
    if (prices.length === 0) return "$100 - $300";
    
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    return `$${minPrice} - $${maxPrice}`;
  };

  const getDuration = (specialization) => {
    const durationMap = {
      'Cardiology': '30-60 mins',
      'Neurology': '45-90 mins',
      'Dentistry': '20-120 mins',
      'Ophthalmology': '30-60 mins',
      'Pediatrics': '20-45 mins',
      'Orthopedics': '30-90 mins',
      'General Medicine': '15-30 mins',
      'Dermatology': '20-60 mins'
    };
    
    return durationMap[specialization] || '30-60 mins';
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

  const calculateStats = (doctorsData, servicesData) => {
    return {
      totalDoctors: doctorsData.length,
      totalServices: servicesData.length,
      totalPatients: 2500 + Math.floor(Math.random() * 1000), // Mock patient count
      satisfactionRate: 95 + Math.floor(Math.random() * 4)
    };
  };

  const getFallbackServices = () => {
    return [
      {
        id: 'cardiology',
        title: 'Cardiology',
        description: 'Specialized care for heart and cardiovascular system diseases.',
        icon: <FaHeartbeat className="text-3xl text-red-500" />,
        color: 'from-red-50 to-red-100',
        borderColor: 'border-red-200',
        doctorCount: 5,
        features: ['ECG Monitoring', 'Echocardiography', 'Angioplasty'],
        priceRange: '$150 - $300',
        duration: '30-60 mins',
        available: true,
        department: 'Cardiology',
        consultationTypes: ['physical', 'online']
      }
    ];
  };

  const tabs = [
    { id: "all", name: "All Services", count: services.length },
    { id: "popular", name: "Most Popular", count: Math.min(6, services.length) },
    { id: "specialized", name: "Specialized Care", count: Math.min(8, services.length) },
    { id: "online", name: "Available Online", count: services.filter(s => s.consultationTypes?.includes('online')).length }
  ];

  const filteredServices = services.filter(service => {
    if (activeTab === "all") return true;
    if (activeTab === "popular") 
      return ["Cardiology", "Dentistry", "General Medicine", "Pediatrics", "Orthopedics", "Dermatology"].includes(service.title);
    if (activeTab === "specialized") 
      return ["Neurology", "Ophthalmology", "Cardiology", "Orthopedics"].includes(service.title);
    if (activeTab === "online") 
      return service.consultationTypes?.includes('online');
    return true;
  });

  const consultationTypes = [
    {
      id: 1,
      title: "In-Person Consultation",
      description: "Visit our hospital or clinic for face-to-face consultation with doctors.",
      icon: <FaHospital className="text-3xl text-blue-600" />,
      features: ["Physical Examination", "Lab Tests", "Immediate Care", "Personal Attention"]
    },
    {
      id: 2,
      title: "Online Consultation",
      description: "Consult with doctors from the comfort of your home via video call.",
      icon: <FaVideo className="text-3xl text-green-600" />,
      features: ["Video Call", "Digital Prescription", "Remote Monitoring", "Flexible Timing"]
    },
    {
      id: 3,
      title: "Emergency Care",
      description: "24/7 emergency medical services for urgent health conditions.",
      icon: <FaUserInjured className="text-3xl text-red-600" />,
      features: ["Immediate Response", "Emergency Room", "Critical Care", "Ambulance Service"]
    }
  ];

  const formatPrice = (price) => {
    if (!price || price === 0) return "Free";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const ServiceCard = ({ service }) => (
    <div className={`bg-gradient-to-br ${service.color} rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border ${service.borderColor} group`}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="bg-white p-3 rounded-xl shadow-sm">
            {service.icon}
          </div>
          <div className="text-right">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/80 text-sm font-semibold text-gray-700">
              <FaUserMd className="mr-1" />
              {service.doctorCount} {service.doctorCount === 1 ? 'Doctor' : 'Doctors'}
            </div>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
          {service.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          {service.description}
        </p>
        
        {service.department && (
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              {service.department}
            </span>
          </div>
        )}
        
        {/* Features */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Services Include:</h4>
          <div className="flex flex-wrap gap-2">
            {service.features.slice(0, 3).map((feature, index) => (
              <span 
                key={index} 
                className="inline-block px-3 py-1 bg-white/60 rounded-full text-xs text-gray-700 border border-white"
              >
                {feature}
              </span>
            ))}
            {service.features.length > 3 && (
              <span className="inline-block px-3 py-1 bg-white/60 rounded-full text-xs text-gray-700 border border-white">
                +{service.features.length - 3} more
              </span>
            )}
          </div>
        </div>
        
        {/* Consultation Types */}
        {service.consultationTypes && service.consultationTypes.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2">
              {service.consultationTypes.includes('physical') && (
                <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                  <FaHospital className="mr-1" /> In-Person
                </span>
              )}
              {service.consultationTypes.includes('online') && (
                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  <FaVideo className="mr-1" /> Online
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Price and Duration */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-sm text-gray-600">Starting from</div>
            <div className="text-lg font-bold text-gray-900">{service.priceRange}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Duration</div>
            <div className="text-lg font-semibold text-gray-900 flex items-center">
              <FaClock className="mr-2 text-blue-500" />
              {service.duration}
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            to={`/doctors?specialization=${encodeURIComponent(service.title)}`}
            className="block w-full bg-white text-blue-600 text-center py-3 rounded-xl font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-all duration-300"
          >
            View {service.doctorCount} Doctors
          </Link>
          <Link
            to="/appointments"
            className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform group-hover:scale-105"
          >
            Book Appointment
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-indigo-700 pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Our Medical <span className="text-blue-200">Services</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-10">
              Professional healthcare services delivered by {stats.totalDoctors} expert doctors across {stats.totalServices} specialties.
              Quality medical care for all your health needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/doctors"
                className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold rounded-xl text-blue-600 bg-white hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
              >
                <FaUserMd className="mr-3" />
                Browse {stats.totalDoctors} Doctors
              </Link>
              <a
                href="#services"
                className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold rounded-xl border-2 border-white text-white hover:bg-white/10 transition-all duration-300"
              >
                <FaArrowRight className="mr-3" />
                Explore Services
              </a>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#ffffff" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,170.7C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 -mt-20 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-shadow duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 text-2xl mb-4">
                <FaUserMd />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{stats.totalDoctors}</div>
              <div className="text-gray-600 font-medium">Expert Doctors</div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-shadow duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 text-2xl mb-4">
                <FaBriefcaseMedical />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{stats.totalServices}</div>
              <div className="text-gray-600 font-medium">Medical Services</div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-shadow duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 text-purple-600 text-2xl mb-4">
                <FaUsers />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{stats.totalPatients}+</div>
              <div className="text-gray-600 font-medium">Happy Patients</div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-shadow duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 text-yellow-600 text-2xl mb-4">
                <FaStar />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{stats.satisfactionRate}%</div>
              <div className="text-gray-600 font-medium">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our <span className="text-blue-600">Medical Services</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              We offer {stats.totalServices} specialized medical services provided by our team of {stats.totalDoctors} expert doctors.
            </p>
          </div>

          {/* Tabs Navigation */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:shadow-md"
                }`}
              >
                {tab.name}
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  activeTab === tab.id ? "bg-white/20" : "bg-gray-100"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <FaSpinner className="animate-spin text-4xl text-blue-600 mb-4" />
              <p className="text-gray-600">Loading services from database...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-yellow-50 rounded-2xl border border-yellow-200">
              <div className="text-6xl mb-6">⚠️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Services</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={fetchData}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <div className="text-6xl mb-6">🏥</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Services Found</h3>
              <p className="text-gray-600 mb-6">Please check back later for available services.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Consultation Types */}
      <section className="py-16 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Consultation <span className="text-blue-600">Options</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Multiple ways to connect with our healthcare professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {consultationTypes.map((type) => (
              <div key={type.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 group hover:border-blue-200">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 text-3xl mb-6">
                  {type.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{type.title}</h3>
                <p className="text-gray-600 mb-6">{type.description}</p>
                
                <div className="space-y-3 mb-8">
                  {type.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-gray-700">
                      <FaCheckCircle className="text-green-500 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Link
                  to="/appointments"
                  className="inline-flex items-center justify-center w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 group-hover:scale-105"
                >
                  Book Now
                  <FaArrowRight className="ml-2" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Services */}
      <section className="py-16 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Emergency <span className="text-red-600">Medical Services</span>
                </h2>
                <p className="text-gray-600 text-lg mb-8">
                  Available 24/7 for urgent medical conditions. Our emergency department is fully equipped and staffed by experienced emergency medicine specialists.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
                      <FaClock className="text-xl text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">24/7 Availability</h4>
                      <p className="text-gray-600">Emergency services available round the clock</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                      <FaUserMd className="text-xl text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Emergency Specialists</h4>
                      <p className="text-gray-600">Certified emergency medicine doctors</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                      <FaHospital className="text-xl text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Advanced Facilities</h4>
                      <p className="text-gray-600">Modern equipment and emergency rooms</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="tel:+1234567890"
                    className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 transition-all duration-300"
                  >
                    <FaPhone className="mr-3" />
                    Call Emergency: (123) 456-7890
                  </a>
                  <Link
                    to="/emergency"
                    className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold rounded-xl border-2 border-red-600 text-red-600 hover:bg-red-50 transition-all duration-300"
                  >
                    Emergency Info
                  </Link>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl p-8">
                  <div className="text-center">
                    <div className="text-6xl mb-6">🚑</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Emergency Hotline</h3>
                    <div className="text-3xl font-bold text-red-600 mb-6">(123) 456-7890</div>
                    <p className="text-gray-600 mb-8">
                      Available 24 hours a day, 7 days a week for emergency medical assistance
                    </p>
                    <div className="text-sm text-gray-500">
                      <FaCheckCircle className="inline-block text-green-500 mr-2" />
                      Immediate response guaranteed
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-center shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Need Medical Assistance?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Our team of {stats.totalDoctors} healthcare professionals across {stats.totalServices} specialties is ready to help you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/appointments"
                className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold rounded-xl text-blue-600 bg-white hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
              >
                <FaCalendarCheck className="mr-3" />
                Book Appointment
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold rounded-xl border-2 border-white text-white hover:bg-white/10 transition-all duration-300"
              >
                <FaPhone className="mr-3" />
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;