import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const PaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [appointmentData, setAppointmentData] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardHolder: "",
    upiId: "",
    insuranceProvider: "",
    insuranceId: "",
    policyNumber: ""
  });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  // User ID state
  const [userId, setUserId] = useState(null);

  // Refs for cursor position
  const cardNumberRef = useRef(null);
  const expiryDateRef = useRef(null);
  const cardHolderRef = useRef(null);
  const cvvRef = useRef(null);
  const upiIdRef = useRef(null);
  const insuranceProviderRef = useRef(null);
  const insuranceIdRef = useRef(null);
  const policyNumberRef = useRef(null);

  useEffect(() => {
    const getUserFromStorage = () => {
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          if (user && user._id) {
            setUserId(user._id);
            return;
          }
        }

        const currentUserId = localStorage.getItem("currentUserId");
        if (currentUserId) {
          setUserId(currentUserId);
          return;
        }

        setUserId(null);
      } catch (error) {
        console.error("Error getting user ID:", error);
        setUserId(null);
      }
    };

    getUserFromStorage();

    const data = location.state?.appointmentData;
    const doctorData = location.state?.doctor;
    
    if (data && doctorData) {
      setAppointmentData(data);
      setDoctor(doctorData);
      setPaymentMethod(data.paymentMethod || "card");
      setIsLoading(false);
      
      console.log('Appointment Data:', data);
      console.log('Doctor Data:', doctorData);
    } else {
      setError("Appointment data not found. Please start over.");
      setTimeout(() => {
        navigate(`/book/${id}`);
      }, 3000);
    }
  }, [location.state, id, navigate]);

  // Card Number Change
  const handleCardNumberChange = (e) => {
    const input = e.target;
    let rawValue = input.value.replace(/\s+/g, '').replace(/[^0-9]/g, '');
    rawValue = rawValue.substring(0, 16);
    const formattedValue = rawValue.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    setPaymentDetails(prev => ({
      ...prev,
      cardNumber: formattedValue
    }));
    
    setTimeout(() => {
      if (cardNumberRef.current) {
        cardNumberRef.current.focus();
        cardNumberRef.current.setSelectionRange(formattedValue.length, formattedValue.length);
      }
    }, 10);
    
    if (paymentError) setPaymentError("");
  };

  // Expiry Date Change
  const handleExpiryDateChange = (e) => {
    const input = e.target;
    let rawValue = input.value.replace(/\D/g, '');
    rawValue = rawValue.substring(0, 4);
    
    let formattedValue = rawValue;
    if (rawValue.length >= 2) {
      formattedValue = rawValue.substring(0, 2) + '/' + rawValue.substring(2, 4);
    }
    
    setPaymentDetails(prev => ({
      ...prev,
      expiryDate: formattedValue
    }));
    
    setTimeout(() => {
      if (expiryDateRef.current) {
        expiryDateRef.current.focus();
        expiryDateRef.current.setSelectionRange(formattedValue.length, formattedValue.length);
      }
    }, 10);
    
    if (paymentError) setPaymentError("");
  };

  // CVV Change
  const handleCvvChange = (e) => {
    const input = e.target;
    let value = input.value.replace(/\D/g, '').substring(0, 4);
    
    setPaymentDetails(prev => ({
      ...prev,
      cvv: value
    }));
    
    setTimeout(() => {
      if (cvvRef.current) {
        cvvRef.current.focus();
        cvvRef.current.setSelectionRange(value.length, value.length);
      }
    }, 10);
    
    if (paymentError) setPaymentError("");
  };

  // Card Holder Change
  const handleCardHolderChange = (e) => {
    const input = e.target;
    const value = input.value;
    
    setPaymentDetails(prev => ({
      ...prev,
      cardHolder: value
    }));
    
    setTimeout(() => {
      if (cardHolderRef.current) {
        cardHolderRef.current.focus();
        cardHolderRef.current.setSelectionRange(value.length, value.length);
      }
    }, 10);
  };

  // UPI ID Change
  const handleUpiIdChange = (e) => {
    const input = e.target;
    const value = input.value;
    
    setPaymentDetails(prev => ({
      ...prev,
      upiId: value
    }));
    
    setTimeout(() => {
      if (upiIdRef.current) {
        upiIdRef.current.focus();
        upiIdRef.current.setSelectionRange(value.length, value.length);
      }
    }, 10);
  };

  // Insurance Provider Change
  const handleInsuranceProviderChange = (e) => {
    const input = e.target;
    const value = input.value;
    
    setPaymentDetails(prev => ({
      ...prev,
      insuranceProvider: value
    }));
    
    setTimeout(() => {
      if (insuranceProviderRef.current) {
        insuranceProviderRef.current.focus();
        insuranceProviderRef.current.setSelectionRange(value.length, value.length);
      }
    }, 10);
  };

  // Insurance ID Change
  const handleInsuranceIdChange = (e) => {
    const input = e.target;
    const value = input.value;
    
    setPaymentDetails(prev => ({
      ...prev,
      insuranceId: value
    }));
    
    setTimeout(() => {
      if (insuranceIdRef.current) {
        insuranceIdRef.current.focus();
        insuranceIdRef.current.setSelectionRange(value.length, value.length);
      }
    }, 10);
  };

  // Policy Number Change
  const handlePolicyNumberChange = (e) => {
    const input = e.target;
    const value = input.value;
    
    setPaymentDetails(prev => ({
      ...prev,
      policyNumber: value
    }));
    
    setTimeout(() => {
      if (policyNumberRef.current) {
        policyNumberRef.current.focus();
        policyNumberRef.current.setSelectionRange(value.length, value.length);
      }
    }, 10);
  };

  // Validate payment details
  const validatePaymentDetails = () => {
    if (paymentMethod === 'card') {
      const rawCardNumber = paymentDetails.cardNumber.replace(/\s/g, '');
      
      if (!rawCardNumber || rawCardNumber.length !== 16) {
        setPaymentError("Please enter a valid 16-digit card number");
        return false;
      }
      if (!paymentDetails.expiryDate || paymentDetails.expiryDate.length !== 5) {
        setPaymentError("Please enter a valid expiry date (MM/YY)");
        return false;
      }
      if (!paymentDetails.cvv || (paymentDetails.cvv.length !== 3 && paymentDetails.cvv.length !== 4)) {
        setPaymentError("Please enter a valid CVV (3 or 4 digits)");
        return false;
      }
      if (!paymentDetails.cardHolder || paymentDetails.cardHolder.trim() === '') {
        setPaymentError("Please enter card holder name");
        return false;
      }
    } else if (paymentMethod === 'upi') {
      if (!paymentDetails.upiId || !paymentDetails.upiId.includes('@')) {
        setPaymentError("Please enter a valid UPI ID");
        return false;
      }
    } else if (paymentMethod === 'insurance') {
      if (!paymentDetails.insuranceProvider || paymentDetails.insuranceProvider.trim() === '') {
        setPaymentError("Please enter insurance provider");
        return false;
      }
      if (!paymentDetails.insuranceId || paymentDetails.insuranceId.trim() === '') {
        setPaymentError("Please enter insurance ID");
        return false;
      }
    }
    return true;
  };

  // Process payment and book
// Process payment and book
const processPaymentAndBook = async () => {
  if (!validatePaymentDetails()) {
    return false;
  }

  if (!userId) {
    setPaymentError("Please log in to complete payment.");
    return false;
  }

  setIsProcessingPayment(true);
  setPaymentError("");

  try {
    console.log('🔍 AppointmentData:', appointmentData);
    console.log('🔍 consultationType from appointmentData:', appointmentData?.consultationType);
    console.log('🔍 timeSlot from appointmentData:', appointmentData?.timeSlot);

    // Prepare appointment payload - FIXED: consultationType from appointmentData
    const appointmentPayload = {
      userId: userId,
      doctorId: id,
      doctorName: `Dr. ${doctor?.firstName || ''} ${doctor?.lastName || ''}`.trim(),
      doctorSpecialization: doctor?.specialization || '',
      consultationType: appointmentData?.consultationType || appointmentData?.timeSlot?.consultationType || 'physical', // FIXED: Get consultationType from correct place
      price: doctor?.price || 0,
      patientDetails: {
        fullName: appointmentData?.patientDetails?.fullName || '',
        email: appointmentData?.patientDetails?.email || '',
        phoneNumber: appointmentData?.patientDetails?.phoneNumber || '',
        medicalConcern: appointmentData?.patientDetails?.medicalConcern || ''
      },
      appointmentDate: appointmentData?.appointmentDate || new Date().toISOString(),
      timeSlot: {
        day: appointmentData?.timeSlot?.day || new Date(appointmentData?.appointmentDate).toLocaleDateString('en-US', { weekday: 'long' }) || '',
        startTime: appointmentData?.timeSlot?.startTime || '',
        endTime: appointmentData?.timeSlot?.endTime || '',
        consultationType: appointmentData?.timeSlot?.consultationType || appointmentData?.consultationType || 'physical'
      },
      timeSlotId: appointmentData?.timeSlotId || '',
      appointmentNumber: String(appointmentData?.appointmentNumber || `APT${Date.now()}`),
      payment: {
        method: paymentMethod,
        amount: doctor?.price || 0,
        status: paymentMethod === 'cash' ? 'pending' : 'paid',
        transactionId: paymentMethod === 'cash' ? `CASH${Date.now()}` : `TXN${Date.now()}`,
        details: paymentMethod === 'cash' ? {} : paymentDetails
      }
    };

    console.log('📤 Sending appointment payload:', JSON.stringify(appointmentPayload, null, 2));

    const response = await axios.post(
      "http://localhost:5000/api/appointments",
      appointmentPayload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Response:', response.data);

    if (response.status === 201 || response.status === 200) {
      setPaymentSuccess(true);
      navigate("/appointment-confirmation", {
        state: {
          appointment: appointmentPayload,
          doctor,
          paymentSuccess: true
        }
      });
      return true;
    } else {
      throw new Error("Failed to book appointment");
    }

  } catch (error) {
    console.error('❌ Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    let errorMessage = "Payment processing failed. Please try again.";
    
    if (error.response?.status === 409) {
      errorMessage = "This time slot is no longer available. Please go back and choose another slot.";
    } else if (error.response?.status === 400) {
      errorMessage = error.response.data?.error || "Invalid appointment data. Please check all fields.";
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    setPaymentError(errorMessage);
    return false;
  } finally {
    setIsProcessingPayment(false);
  }
};

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    await processPaymentAndBook();
  };

  const handleBackToBooking = () => {
    navigate(`/book/${id}`, { 
      state: { 
        selectedSlot: appointmentData?.timeSlot,
        patientDetails: appointmentData?.patientDetails 
      } 
    });
  };

  // Payment Method Components
  const CreditCardForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Number <span className="text-red-500">*</span>
        </label>
        <input
          ref={cardNumberRef}
          type="text"
          name="cardNumber"
          value={paymentDetails.cardNumber}
          onChange={handleCardNumberChange}
          placeholder="1234 5678 9012 3456"
          maxLength={19}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          required={paymentMethod === 'card'}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expiry Date <span className="text-red-500">*</span>
          </label>
          <input
            ref={expiryDateRef}
            type="text"
            name="expiryDate"
            value={paymentDetails.expiryDate}
            onChange={handleExpiryDateChange}
            placeholder="MM/YY"
            maxLength={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            required={paymentMethod === 'card'}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CVV <span className="text-red-500">*</span>
          </label>
          <input
            ref={cvvRef}
            type="text"
            name="cvv"
            value={paymentDetails.cvv}
            onChange={handleCvvChange}
            placeholder="123"
            maxLength={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            required={paymentMethod === 'card'}
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Holder Name <span className="text-red-500">*</span>
        </label>
        <input
          ref={cardHolderRef}
          type="text"
          name="cardHolder"
          value={paymentDetails.cardHolder}
          onChange={handleCardHolderChange}
          placeholder="John Doe"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          required={paymentMethod === 'card'}
        />
      </div>
      
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <span>Secure SSL encrypted payment</span>
      </div>
    </div>
  );

  const UPIForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          UPI ID <span className="text-red-500">*</span>
        </label>
        <input
          ref={upiIdRef}
          type="text"
          name="upiId"
          value={paymentDetails.upiId}
          onChange={handleUpiIdChange}
          placeholder="yourname@upi"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          required={paymentMethod === 'upi'}
        />
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          You will be redirected to your UPI app to complete the payment.
        </p>
      </div>
    </div>
  );

  const InsuranceForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Insurance Provider <span className="text-red-500">*</span>
        </label>
        <input
          ref={insuranceProviderRef}
          type="text"
          name="insuranceProvider"
          value={paymentDetails.insuranceProvider}
          onChange={handleInsuranceProviderChange}
          placeholder="e.g., Blue Cross, Aetna, etc."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          required={paymentMethod === 'insurance'}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Insurance ID <span className="text-red-500">*</span>
        </label>
        <input
          ref={insuranceIdRef}
          type="text"
          name="insuranceId"
          value={paymentDetails.insuranceId}
          onChange={handleInsuranceIdChange}
          placeholder="Your insurance identification number"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          required={paymentMethod === 'insurance'}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Policy Number
        </label>
        <input
          ref={policyNumberRef}
          type="text"
          name="policyNumber"
          value={paymentDetails.policyNumber}
          onChange={handlePolicyNumberChange}
          placeholder="Policy number (if different)"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
        />
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-700">
          Note: Insurance claims are subject to verification and approval. You may be responsible for any uncovered amounts.
        </p>
      </div>
    </div>
  );

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined || price === '') return "Free";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-700">Loading Payment</h3>
          <p className="text-gray-500 mt-2">Please wait while we load your appointment details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
            <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-xl font-semibold text-red-800 mb-2">Error Loading Payment</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate(`/doctors/${id}`)}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition duration-200"
            >
              Back to Doctor
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!appointmentData || !doctor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
            <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-xl font-semibold text-red-800 mb-2">Appointment Not Found</h3>
            <p className="text-red-600 mb-4">Please go back and book your appointment first.</p>
            <button
              onClick={() => navigate(`/doctors/${id}`)}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition duration-200"
            >
              Back to Doctor
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <button 
            onClick={handleBackToBooking}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Booking
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Complete Payment
          </h1>
          <p className="text-lg text-gray-600">
            Secure payment for your appointment with Dr. {doctor.firstName} {doctor.lastName}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                {/* Payment Method Selection */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Select Payment Method</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-4 border rounded-lg text-center transition duration-200 ${
                        paymentMethod === 'card'
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-gray-300 hover:border-blue-300 hover:bg-blue-25'
                      }`}
                    >
                      <svg className="w-8 h-8 mx-auto mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span className="text-sm font-medium">Card</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-4 border rounded-lg text-center transition duration-200 ${
                        paymentMethod === 'upi'
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-gray-300 hover:border-blue-300 hover:bg-blue-25'
                      }`}
                    >
                      <svg className="w-8 h-8 mx-auto mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                      </svg>
                      <span className="text-sm font-medium">UPI</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('insurance')}
                      className={`p-4 border rounded-lg text-center transition duration-200 ${
                        paymentMethod === 'insurance'
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-gray-300 hover:border-blue-300 hover:bg-blue-25'
                      }`}
                    >
                      <svg className="w-8 h-8 mx-auto mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span className="text-sm font-medium">Insurance</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash')}
                      className={`p-4 border rounded-lg text-center transition duration-200 ${
                        paymentMethod === 'cash'
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-gray-300 hover:border-blue-300 hover:bg-blue-25'
                      }`}
                    >
                      <svg className="w-8 h-8 mx-auto mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium">Cash</span>
                    </button>
                  </div>

                  {/* Payment Form */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    {paymentMethod === 'card' && <CreditCardForm />}
                    {paymentMethod === 'upi' && <UPIForm />}
                    {paymentMethod === 'insurance' && <InsuranceForm />}
                    {paymentMethod === 'cash' && (
                      <div className="text-center py-4">
                        <p className="text-gray-600">
                          You will pay {formatPrice(doctor.price)} in cash at the hospital.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Error */}
                {paymentError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="text-red-700">{paymentError}</span>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                >
                  {isProcessingPayment ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Processing...
                    </div>
                  ) : (
                    `Confirm & Pay ${formatPrice(doctor.price)}`
                  )}
                </button>

                {/* Security Badge */}
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>SSL Secure</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      <span>Encrypted</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>PCI Compliant</span>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Appointment Summary</h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  {doctor.profilePicture ? (
                    <img
                      src={`http://localhost:5000/${doctor.profilePicture}`}
                      alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                      className="h-16 w-16 rounded-full object-cover border-2 border-gray-200 mr-4"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-200 mr-4">
                      <svg className="h-8 w-8 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Dr. {doctor.firstName} {doctor.lastName}
                    </h4>
                    <p className="text-blue-600 text-sm">{doctor.specialization}</p>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date</span>
                    <span className="font-semibold">
                      {new Date(appointmentData.appointmentDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time</span>
                    <span className="font-semibold">
                      {formatTime(appointmentData.timeSlot.startTime)} - {formatTime(appointmentData.timeSlot.endTime)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Appointment #</span>
                    <span className="font-semibold">#{appointmentData.appointmentNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Patient</span>
                    <span className="font-semibold">{appointmentData.patientDetails.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Consultation Type</span>
                    <span className="font-semibold capitalize">
                      {appointmentData.timeSlot.consultationType === 'physical' ? '🏥 Physical' : '💻 Online'}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Consultation Fee</span>
                    <span className="text-2xl font-bold text-green-700">{formatPrice(doctor.price)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Payment Method</span>
                    <span className="capitalize">{paymentMethod}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Info */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
              <h4 className="text-lg font-semibold text-yellow-900 mb-3">Payment Security</h4>
              <ul className="text-yellow-800 text-sm space-y-2">
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Your payment information is encrypted and secure
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  We don't store your card details on our servers
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  PCI DSS compliant payment processing
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  24/7 fraud monitoring and protection
                </li>
              </ul>
            </div>

            {/* Contact Support */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <h4 className="text-lg font-semibold text-blue-900 mb-3">Need Help?</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <p>Contact our support team:</p>
                <p className="font-semibold">📞 (555) 123-4567</p>
                <p className="font-semibold">✉️ support@medicare.com</p>
                <p className="text-xs text-blue-600 mt-2">
                  Available 24/7 for payment assistance
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;