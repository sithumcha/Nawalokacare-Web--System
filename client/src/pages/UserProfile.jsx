

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    gender: 'prefer-not-to-say',
    birthdate: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: 'US',
      zipCode: ''
    }
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
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
      setEditForm({
        username: userObj.username || '',
        email: userObj.email || '',
        gender: userObj.gender || 'prefer-not-to-say',
        birthdate: userObj.birthdate ? userObj.birthdate.split('T')[0] : '',
        address: {
          street: userObj.address?.street || '',
          city: userObj.address?.city || '',
          state: userObj.address?.state || '',
          country: userObj.address?.country || 'US',
          zipCode: userObj.address?.zipCode || ''
        }
      });
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setMessage('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      username: user.username || '',
      email: user.email || '',
      gender: user.gender || 'prefer-not-to-say',
      birthdate: user.birthdate ? user.birthdate.split('T')[0] : '',
      address: {
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        country: user.address?.country || 'US',
        zipCode: user.address?.zipCode || ''
      }
    });
    setMessage('');
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setEditForm(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSaveProfile = async () => {
    setSaveLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user._id,
          username: editForm.username,
          gender: editForm.gender,
          birthdate: editForm.birthdate,
          address: editForm.address
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update local storage and state
        const updatedUser = { ...user, ...data.user };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setMessage('Profile updated successfully!');
        setIsEditing(false);
      } else {
        setMessage(data.message || 'Failed to update profile');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
      console.error('Update profile error:', error);
    } finally {
      setSaveLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading Profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">User Profile</h1>
              <p className="text-gray-600 text-sm">
                {getGreeting()}, <strong>{user?.username}</strong>
              </p>
            </div>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-blue-500 text-2xl font-bold">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user?.username}</h2>
                <p className="text-blue-100">{user?.email}</p>
                <p className="text-sm text-blue-100 mt-1">Member since {new Date().getFullYear()}</p>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              {!isEditing ? (
                <button 
                  onClick={handleEditClick}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold text-sm flex items-center space-x-2"
                >
                  <span>✏️</span>
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button 
                    onClick={handleCancelEdit} 
                    disabled={saveLoading}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold text-sm disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveProfile} 
                    disabled={saveLoading}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold text-sm disabled:opacity-50 flex items-center space-x-2"
                  >
                    {saveLoading ? (
                      <>
                        <span className="animate-spin">⟳</span>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <span>💾</span>
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {message && (
              <div className={`p-4 rounded-lg mb-6 font-semibold ${
                message.includes('successfully') 
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            {!isEditing ? (
              // View Mode
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Basic Information</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                          <span className="font-medium text-gray-700">Username</span>
                          <span className="text-gray-900 font-semibold">{user?.username}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                          <span className="font-medium text-gray-700">Email Address</span>
                          <span className="text-gray-900">{user?.email}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                          <span className="font-medium text-gray-700">Gender</span>
                          <span className="text-gray-900 capitalize">
                            {user?.gender?.replace('-', ' ') || 'Not specified'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                          <span className="font-medium text-gray-700">Date of Birth</span>
                          <span className="text-gray-900">
                            {user?.birthdate ? new Date(user.birthdate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : 'Not provided'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Address Information</h4>
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">Street</span>
                          <span className="text-gray-900 text-right">{user?.address?.street || 'Not provided'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">City</span>
                          <span className="text-gray-900">{user?.address?.city || 'Not provided'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">State/Province</span>
                          <span className="text-gray-900">{user?.address?.state || 'Not provided'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">Zip/Postal Code</span>
                          <span className="text-gray-900">{user?.address?.zipCode || 'Not provided'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">Country</span>
                          <span className="text-gray-900">{user?.address?.country || 'Not provided'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Edit Mode
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Edit Basic Information</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Username *
                        </label>
                        <input
                          type="text"
                          name="username"
                          value={editForm.username}
                          onChange={handleEditChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required
                          placeholder="Enter your username"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={editForm.email}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                          disabled
                        />
                        <p className="text-gray-500 text-xs mt-1 italic">Email address cannot be changed</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Gender
                        </label>
                        <select
                          name="gender"
                          value={editForm.gender}
                          onChange={handleEditChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                          <option value="prefer-not-to-say">Prefer not to say</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          name="birthdate"
                          value={editForm.birthdate}
                          onChange={handleEditChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Edit Address Information</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Street Address
                        </label>
                        <input
                          type="text"
                          name="address.street"
                          value={editForm.address.street}
                          onChange={handleEditChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Enter street address"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            City
                          </label>
                          <input
                            type="text"
                            name="address.city"
                            value={editForm.address.city}
                            onChange={handleEditChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="City"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            State/Province
                          </label>
                          <input
                            type="text"
                            name="address.state"
                            value={editForm.address.state}
                            onChange={handleEditChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="State"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Zip/Postal Code
                          </label>
                          <input
                            type="text"
                            name="address.zipCode"
                            value={editForm.address.zipCode}
                            onChange={handleEditChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Zip Code"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Country
                          </label>
                          <select
                            name="address.country"
                            value={editForm.address.country}
                            onChange={handleEditChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          >
                            <option value="US">United States</option>
                            <option value="CA">Canada</option>
                            <option value="UK">United Kingdom</option>
                            <option value="AU">Australia</option>
                            <option value="IN">India</option>
                            <option value="DE">Germany</option>
                            <option value="FR">France</option>
                            <option value="JP">Japan</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
