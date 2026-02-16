import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, Clock, Heart, Pill, FileText, Bell, Settings, LogOut, TrendingUp, Activity, Users } from 'lucide-react';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [appointments, setAppointments] = useState([]);
  const [healthData, setHealthData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    loadDashboardData();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/login');
      return;
    }

    try {
      const userObj = JSON.parse(userData);
      setUser(userObj);
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = () => {
    // Mock data
    const mockAppointments = [
      { id: 1, doctor: 'Dr. Sarah Johnson', specialty: 'Cardiology', date: 'Today', time: '10:30 AM', status: 'confirmed', avatar: '👩‍⚕️' },
      { id: 2, doctor: 'Dr. Michael Chen', specialty: 'Dermatology', date: 'Tomorrow', time: '2:00 PM', status: 'confirmed', avatar: '👨‍⚕️' },
      { id: 3, doctor: 'Dr. Robert Wilson', specialty: 'Neurology', date: 'Jan 25', time: '11:15 AM', status: 'pending', avatar: '👨‍⚕️' },
    ];

    const mockHealthData = {
      heartRate: { value: 72, unit: 'BPM', status: 'normal', trend: 'down' },
      bloodPressure: { value: '120/80', unit: 'mmHg', status: 'normal' },
      sleep: { value: 7.5, unit: 'hours', status: 'good' },
      steps: { value: 8452, unit: 'steps', status: 'good' },
      calories: { value: 2350, unit: 'kcal', status: 'normal' }
    };

    setAppointments(mockAppointments);
    setHealthData(mockHealthData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getHealthStatusColor = (status) => {
    switch(status) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'normal': return 'text-yellow-600 bg-yellow-50';
      case 'warning': return 'text-orange-600 bg-orange-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">HealthCare Pro</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-500 hover:text-gray-700 relative">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <Settings className="w-6 h-6" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {getGreeting()}, {user?.username}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's your health overview for {formatDate(new Date().toISOString())}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{user?.username}</h3>
                <p className="text-gray-500 text-sm mt-1">Premium Member</p>
                <div className="mt-3 px-4 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                  Health Score: 92%
                </div>
              </div>

              <nav className="space-y-2">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: <Activity className="w-5 h-5" /> },
                  { id: 'appointments', label: 'Appointments', icon: <Calendar className="w-5 h-5" /> },
                  { id: 'doctors', label: 'Find Doctors', icon: <Users className="w-5 h-5" /> },
                  { id: 'medications', label: 'Medications', icon: <Pill className="w-5 h-5" /> },
                  { id: 'records', label: 'Health Records', icon: <FileText className="w-5 h-5" /> },
                  { id: 'profile', label: 'My Profile', icon: <User className="w-5 h-5" /> },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 border border-blue-100'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>

              <button
                onClick={handleLogout}
                className="w-full mt-6 flex items-center justify-center space-x-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-red-100"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
              <h3 className="font-bold text-lg mb-4">Weekly Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Appointments</span>
                  <span className="font-bold">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Steps</span>
                  <span className="font-bold">58,416</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Sleep Avg</span>
                  <span className="font-bold">7.2h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Water Intake</span>
                  <span className="font-bold">2.1L</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* Health Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(healthData).map(([key, data]) => (
                    <div key={key} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-xl ${getHealthStatusColor(data.status)}`}>
                          {key === 'heartRate' && <Heart className="w-6 h-6" />}
                          {key === 'bloodPressure' && <Activity className="w-6 h-6" />}
                          {key === 'sleep' && <Clock className="w-6 h-6" />}
                          {key === 'steps' && <TrendingUp className="w-6 h-6" />}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getHealthStatusColor(data.status)}`}>
                          {data.status.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-gray-500 text-sm font-medium mb-2">
                        {key.replace(/([A-Z])/g, ' $1').toUpperCase()}
                      </h3>
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-gray-900">{data.value}</span>
                        <span className="text-gray-500 ml-2">{data.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Upcoming Appointments */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-gray-900">Upcoming Appointments</h2>
                      <button className="text-blue-600 hover:text-blue-700 font-medium">
                        View All →
                      </button>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {appointments.map((appointment) => (
                      <div key={appointment.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="text-2xl">{appointment.avatar}</div>
                            <div>
                              <h4 className="font-bold text-gray-900">{appointment.doctor}</h4>
                              <p className="text-gray-600 text-sm">{appointment.specialty}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">{appointment.date} at {appointment.time}</span>
                            </div>
                            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                              appointment.status === 'confirmed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {appointment.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <Users className="w-8 h-8" />
                      <span className="text-2xl">👨‍⚕️</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2">Find Doctors</h3>
                    <p className="text-blue-100 mb-4">Book appointments with specialists</p>
                    <button className="w-full bg-white text-blue-600 font-medium py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors">
                      Browse Doctors
                    </button>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <Pill className="w-8 h-8" />
                      <span className="text-2xl">💊</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2">Medications</h3>
                    <p className="text-purple-100 mb-4">View your prescriptions</p>
                    <button className="w-full bg-white text-purple-600 font-medium py-2 px-4 rounded-lg hover:bg-purple-50 transition-colors">
                      Check Medications
                    </button>
                  </div>

                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <FileText className="w-8 h-8" />
                      <span className="text-2xl">📋</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2">Health Records</h3>
                    <p className="text-green-100 mb-4">Access your medical history</p>
                    <button className="w-full bg-white text-green-600 font-medium py-2 px-4 rounded-lg hover:bg-green-50 transition-colors">
                      View Records
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appointments' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">My Appointments</h2>
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-3xl">{appointment.avatar}</div>
                          <div>
                            <h4 className="font-bold text-gray-900">{appointment.doctor}</h4>
                            <p className="text-gray-600">{appointment.specialty}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="flex items-center text-sm text-gray-500">
                                <Calendar className="w-4 h-4 mr-1" />
                                {appointment.date}
                              </span>
                              <span className="flex items-center text-sm text-gray-500">
                                <Clock className="w-4 h-4 mr-1" />
                                {appointment.time}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            appointment.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {appointment.status}
                          </span>
                          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
                            Reschedule
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="font-medium text-gray-700">Full Name</span>
                        <span className="text-gray-900 font-medium">{user?.username}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="font-medium text-gray-700">Email</span>
                        <span className="text-gray-900">{user?.email}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="font-medium text-gray-700">Member Since</span>
                        <span className="text-gray-900">January 2024</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="font-medium text-gray-700">Health Plan</span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                          Premium
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Stats</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">Health Score</span>
                          <span className="text-sm font-medium text-blue-600">92%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">Appointment Attendance</span>
                          <span className="text-sm font-medium text-green-600">100%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">Medication Adherence</span>
                          <span className="text-sm font-medium text-yellow-600">85%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;