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
  FaMapMarkerAlt
} from "react-icons/fa";

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [doctorsCount, setDoctorsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchServicesData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch doctors count
        const doctorsRes = await axios.get("http://localhost:5000/api/doctors");
        setDoctorsCount(doctorsRes.data.length || 0);
        
        // Set services data (could also fetch from API)
        const servicesData = getServicesData(doctorsRes.data);
        setServices(servicesData);
      } catch (error) {
        console.error("Error fetching services data:", error);
        // Use fallback data
        setServices(getFallbackServicesData());
      } finally {
        setIsLoading(false);
      }
    };

    fetchServicesData();
  }, []);

  const getServicesData = (doctors) => {
    // Count doctors by specialization
    const specCounts = {};
    doctors.forEach(doctor => {
      const spec = doctor.specialization || "General";
      specCounts[spec] = (specCounts[spec] || 0) + 1;
    });

    return [
      {
        id: 1,
        title: "Cardiology",
        description: "Comprehensive heart care including diagnosis, treatment, and prevention of cardiovascular diseases.",
        icon: <FaHeartbeat className="text-3xl text-red-500" />,
        color: "from-red-50 to-red-100",
        borderColor: "border-red-200",
        doctors: specCounts["Cardiologist"] || 12,
        features: ["ECG Monitoring", "Echocardiography", "Angioplasty", "Stress Test"],
        priceRange: "$150 - $300",
        duration: "30-60 mins",
        available: true
      },
      {
        id: 2,
        title: "Neurology",
        description: "Specialized care for disorders of the nervous system including brain and spinal cord.",
        icon: <FaBrain className="text-3xl text-purple-500" />,
        color: "from-purple-50 to-purple-100",
        borderColor: "border-purple-200",
        doctors: specCounts["Neurologist"] || 8,
        features: ["EEG Testing", "MRI Scan", "Nerve Conduction", "Brain Mapping"],
        priceRange: "$180 - $350",
        duration: "45-90 mins",
        available: true
      },
      {
        id: 3,
        title: "Dentistry",
        description: "Complete dental care including preventive, cosmetic, and restorative treatments.",
        icon: <FaTooth className="text-3xl text-blue-500" />,
        color: "from-blue-50 to-blue-100",
        borderColor: "border-blue-200",
        doctors: specCounts["Dentist"] || 15,
        features: ["Teeth Cleaning", "Root Canal", "Dental Implants", "Braces"],
        priceRange: "$80 - $500",
        duration: "20-120 mins",
        available: true
      },
      {
        id: 4,
        title: "Ophthalmology",
        description: "Eye care services including vision testing, surgery, and treatment of eye diseases.",
        icon: <FaEye className="text-3xl text-green-500" />,
        color: "from-green-50 to-green-100",
        borderColor: "border-green-200",
        doctors: specCounts["Ophthalmologist"] || 7,
        features: ["Eye Exam", "LASIK Surgery", "Cataract Surgery", "Glaucoma Care"],
        priceRange: "$100 - $250",
        duration: "30-60 mins",
        available: true
      },
      {
        id: 5,
        title: "Pediatrics",
        description: "Healthcare for infants, children, and adolescents including preventive care and treatment.",
        icon: <FaBaby className="text-3xl text-pink-500" />,
        color: "from-pink-50 to-pink-100",
        borderColor: "border-pink-200",
        doctors: specCounts["Pediatrician"] || 14,
        features: ["Vaccinations", "Growth Monitoring", "Child Nutrition", "Development Checks"],
        priceRange: "$90 - $180",
        duration: "20-45 mins",
        available: true
      },
      {
        id: 6,
        title: "Orthopedics",
        description: "Treatment of musculoskeletal system including bones, joints, ligaments, and muscles.",
        icon: <FaBone className="text-3xl text-yellow-500" />,
        color: "from-yellow-50 to-yellow-100",
        borderColor: "border-yellow-200",
        doctors: specCounts["Orthopedic"] || 10,
        features: ["Joint Replacement", "Fracture Care", "Sports Medicine", "Physical Therapy"],
        priceRange: "$120 - $400",
        duration: "30-90 mins",
        available: true
      },
      {
        id: 7,
        title: "General Medicine",
        description: "Primary healthcare for common illnesses, preventive care, and health maintenance.",
        icon: <FaStethoscope className="text-3xl text-indigo-500" />,
        color: "from-indigo-50 to-indigo-100",
        borderColor: "border-indigo-200",
        doctors: specCounts["General Physician"] || 20,
        features: ["Health Checkup", "Disease Prevention", "Chronic Care", "Vaccinations"],
        priceRange: "$60 - $150",
        duration: "15-30 mins",
        available: true
      },
      {
        id: 8,
        title: "Dermatology",
        description: "Skin care including treatment of skin diseases, cosmetic procedures, and skin cancer screening.",
        icon: <FaUserMd className="text-3xl text-teal-500" />,
        color: "from-teal-50 to-teal-100",
        borderColor: "border-teal-200",
        doctors: specCounts["Dermatologist"] || 9,
        features: ["Skin Cancer Screening", "Acne Treatment", "Laser Therapy", "Cosmetic Procedures"],
        priceRange: "$100 - $300",
        duration: "20-60 mins",
        available: true
      }
    ];
  };

  const getFallbackServicesData = () => {
    return [
      {
        id: 1,
        title: "Cardiology",
        description: "Comprehensive heart care including diagnosis, treatment, and prevention of cardiovascular diseases.",
        icon: <FaHeartbeat className="text-3xl text-red-500" />,
        color: "from-red-50 to-red-100",
        borderColor: "border-red-200",
        doctors: 12,
        features: ["ECG Monitoring", "Echocardiography", "Angioplasty", "Stress Test"],
        priceRange: "$150 - $300",
        duration: "30-60 mins",
        available: true
      },
      {
        id: 2,
        title: "Neurology",
        description: "Specialized care for disorders of the nervous system including brain and spinal cord.",
        icon: <FaBrain className="text-3xl text-purple-500" />,
        color: "from-purple-50 to-purple-100",
        borderColor: "border-purple-200",
        doctors: 8,
        features: ["EEG Testing", "MRI Scan", "Nerve Conduction", "Brain Mapping"],
        priceRange: "$180 - $350",
        duration: "45-90 mins",
        available: true
      },
      {
        id: 3,
        title: "Dentistry",
        description: "Complete dental care including preventive, cosmetic, and restorative treatments.",
        icon: <FaTooth className="text-3xl text-blue-500" />,
        color: "from-blue-50 to-blue-100",
        borderColor: "border-blue-200",
        doctors: 15,
        features: ["Teeth Cleaning", "Root Canal", "Dental Implants", "Braces"],
        priceRange: "$80 - $500",
        duration: "20-120 mins",
        available: true
      },
      {
        id: 4,
        title: "Ophthalmology",
        description: "Eye care services including vision testing, surgery, and treatment of eye diseases.",
        icon: <FaEye className="text-3xl text-green-500" />,
        color: "from-green-50 to-green-100",
        borderColor: "border-green-200",
        doctors: 7,
        features: ["Eye Exam", "LASIK Surgery", "Cataract Surgery", "Glaucoma Care"],
        priceRange: "$100 - $250",
        duration: "30-60 mins",
        available: true
      },
      {
        id: 5,
        title: "Pediatrics",
        description: "Healthcare for infants, children, and adolescents including preventive care and treatment.",
        icon: <FaBaby className="text-3xl text-pink-500" />,
        color: "from-pink-50 to-pink-100",
        borderColor: "border-pink-200",
        doctors: 14,
        features: ["Vaccinations", "Growth Monitoring", "Child Nutrition", "Development Checks"],
        priceRange: "$90 - $180",
        duration: "20-45 mins",
        available: true
      },
      {
        id: 6,
        title: "Orthopedics",
        description: "Treatment of musculoskeletal system including bones, joints, ligaments, and muscles.",
        icon: <FaBone className="text-3xl text-yellow-500" />,
        color: "from-yellow-50 to-yellow-100",
        borderColor: "border-yellow-200",
        doctors: 10,
        features: ["Joint Replacement", "Fracture Care", "Sports Medicine", "Physical Therapy"],
        priceRange: "$120 - $400",
        duration: "30-90 mins",
        available: true
      },
      {
        id: 7,
        title: "General Medicine",
        description: "Primary healthcare for common illnesses, preventive care, and health maintenance.",
        icon: <FaStethoscope className="text-3xl text-indigo-500" />,
        color: "from-indigo-50 to-indigo-100",
        borderColor: "border-indigo-200",
        doctors: 20,
        features: ["Health Checkup", "Disease Prevention", "Chronic Care", "Vaccinations"],
        priceRange: "$60 - $150",
        duration: "15-30 mins",
        available: true
      },
      {
        id: 8,
        title: "Dermatology",
        description: "Skin care including treatment of skin diseases, cosmetic procedures, and skin cancer screening.",
        icon: <FaUserMd className="text-3xl text-teal-500" />,
        color: "from-teal-50 to-teal-100",
        borderColor: "border-teal-200",
        doctors: 9,
        features: ["Skin Cancer Screening", "Acne Treatment", "Laser Therapy", "Cosmetic Procedures"],
        priceRange: "$100 - $300",
        duration: "20-60 mins",
        available: true
      }
    ];
  };

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
      title: "Home Visit",
      description: "Doctor visits your home for consultation and basic medical care.",
      icon: <FaMapMarkerAlt className="text-3xl text-purple-600" />,
      features: ["Convenient", "Personalized Care", "Reduced Travel", "Family Consultation"]
    }
  ];

  const tabs = [
    { id: "all", name: "All Services", count: services.length },
    { id: "popular", name: "Most Popular", count: 4 },
    { id: "specialized", name: "Specialized Care", count: 5 },
    { id: "online", name: "Available Online", count: 6 }
  ];

  const filteredServices = services.filter(service => {
    if (activeTab === "all") return true;
    if (activeTab === "popular") 
      return ["Cardiology", "Dentistry", "General Medicine", "Pediatrics"].includes(service.title);
    if (activeTab === "specialized") 
      return ["Neurology", "Ophthalmology", "Orthopedics", "Dermatology"].includes(service.title);
    if (activeTab === "online") 
      return service.available;
    return true;
  });

  const stats = [
    { number: doctorsCount || 95, label: "Expert Doctors", icon: <FaUserMd /> },
    { number: 24, label: "Service Categories", icon: <FaStethoscope /> },
    { number: "5000+", label: "Happy Patients", icon: <FaHeartbeat /> },
    { number: "98%", label: "Satisfaction Rate", icon: <FaStar /> }
  ];

  const processSteps = [
    {
      step: 1,
      title: "Choose Service",
      description: "Select from our comprehensive range of medical services"
    },
    {
      step: 2,
      title: "Select Doctor",
      description: "Pick a specialist based on availability and expertise"
    },
    {
      step: 3,
      title: "Book Appointment",
      description: "Choose your preferred date, time, and consultation type"
    },
    {
      step: 4,
      title: "Get Treatment",
      description: "Receive professional medical care and follow-up"
    }
  ];

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
              Comprehensive healthcare services delivered by expert medical professionals. 
              From routine checkups to specialized treatments, we provide quality care for all your health needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/doctors"
                className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold rounded-xl text-blue-600 bg-white hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
              >
                <FaUserMd className="mr-3" />
                Find a Doctor
              </Link>
              <Link
                to="/appointments"
                className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold rounded-xl border-2 border-white text-white hover:bg-white/10 transition-all duration-300"
              >
                <FaCalendarCheck className="mr-3" />
                Book Appointment
              </Link>
            </div>
          </div>
        </div>
        
        {/* Wave SVG */}
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
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-shadow duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 text-2xl mb-4">
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Tabs */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our <span className="text-blue-600">Medical Services</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              We offer a wide range of medical services to meet all your healthcare needs. 
              Each service is provided by certified specialists using advanced medical technology.
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

          {/* Services Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredServices.map((service) => (
                <div 
                  key={service.id} 
                  className={`bg-gradient-to-br ${service.color} rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border ${service.borderColor} group`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div className="bg-white p-3 rounded-xl shadow-sm">
                        {service.icon}
                      </div>
                      <div className="text-right">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/80 text-sm font-semibold text-gray-700">
                          <FaUserMd className="mr-1" />
                          {service.doctors} Doctors
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-6">
                      {service.description}
                    </p>
                    
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
                        to={`/doctors?specialization=${service.title}`}
                        className="block w-full bg-white text-blue-600 text-center py-3 rounded-xl font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-all duration-300"
                      >
                        View Doctors
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
              Choose the consultation method that works best for you. We offer multiple ways to connect with our doctors.
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

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How Our <span className="text-blue-600">Service Works</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Simple steps to get the medical care you need
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <div key={step.step} className="relative">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-2xl font-bold mb-6 relative z-10">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < processSteps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-3/4 w-full h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold rounded-xl text-blue-600 border-2 border-blue-600 hover:bg-blue-50 transition-all duration-300"
            >
              Get Started Today
            </Link>
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
                  We provide 24/7 emergency medical services. Our emergency department is equipped with state-of-the-art facilities and staffed by experienced emergency medicine specialists.
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
              Our team of healthcare professionals is ready to help you. Book an appointment today and take the first step towards better health.
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
            <p className="text-blue-100 text-sm mt-8">
              Available for both online and in-person consultations
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;