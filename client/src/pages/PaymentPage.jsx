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

  useEffect(() => {
    // Initialize user ID from localStorage
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

        console.warn("No user ID found. User might need to log in.");
        setUserId(null);
      } catch (error) {
        console.error("Error getting user ID from storage:", error);
        setUserId(null);
      }
    };

    getUserFromStorage();

    // Get appointment data from navigation state
    const data = location.state?.appointmentData;
    const doctorData = location.state?.doctor;
    
    if (data && doctorData) {
      setAppointmentData(data);
      setDoctor(doctorData);
      setPaymentMethod(data.paymentMethod || "card");
      setIsLoading(false);
    } else {
      // If no data in state, redirect back to booking
      setError("Appointment data not found. Please start over.");
      setTimeout(() => {
        navigate(`/book/${id}`);
      }, 3000);
    }
  }, [location.state, id, navigate]);

  // Fixed: Proper cursor position handling for formatted inputs
  const handleCardNumberChange = (e) => {
    const input = e.target;
    const cursorPosition = input.selectionStart;
    
    // Get raw value without spaces
    let value = input.value.replace(/\s+/g, '');
    
    // Only allow numbers
    value = value.replace(/[^0-9]/g, '');
    
    // Limit to 16 digits
    value = value.substring(0, 16);
    
    // Format with spaces every 4 digits
    const formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    // Calculate new cursor position
    let newCursorPosition = cursorPosition;
    
    // If we added a space before the cursor, move cursor forward
    if (formattedValue.length > input.value.length && cursorPosition > 0) {
      const addedChars = formattedValue.length - input.value.length;
      newCursorPosition = cursorPosition + addedChars;
    }
    // If we removed characters, adjust cursor position
    else if (formattedValue.length < input.value.length) {
      const removedChars = input.value.length - formattedValue.length;
      newCursorPosition = Math.max(0, cursorPosition - removedChars);
    }
    
    setPaymentDetails(prev => ({
      ...prev,
      cardNumber: formattedValue
    }));
    
    // Set cursor position after state update
    setTimeout(() => {
      if (cardNumberRef.current) {
        cardNumberRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
    
    if (paymentError) setPaymentError("");
  };

  // Fixed: Proper cursor position handling for expiry date
  const handleExpiryDateChange = (e) => {
    const input = e.target;
    const cursorPosition = input.selectionStart;
    
    let value = input.value.replace(/\D/g, '');
    
    // Limit to 4 digits
    value = value.substring(0, 4);
    
    // Format as MM/YY
    let formattedValue = value;
    if (value.length >= 2) {
      formattedValue = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    
    // Calculate new cursor position
    let newCursorPosition = cursorPosition;
    
    // If we added a slash before the cursor, move cursor forward
    if (formattedValue.length > input.value.length && cursorPosition >= 2) {
      newCursorPosition = cursorPosition + 1;
    }
    // If we removed characters, adjust cursor position
    else if (formattedValue.length < input.value.length && cursorPosition > 2) {
      newCursorPosition = cursorPosition - 1;
    }
    
    setPaymentDetails(prev => ({
      ...prev,
      expiryDate: formattedValue
    }));
    
    // Set cursor position after state update
    setTimeout(() => {
      if (expiryDateRef.current) {
        expiryDateRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
    
    if (paymentError) setPaymentError("");
  };

  // Regular input change handler for other fields
  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    
    // For CVV, only allow numbers and limit to 4 digits
    if (name === 'cvv') {
      const numericValue = value.replace(/\D/g, '').substring(0, 4);
      setPaymentDetails(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setPaymentDetails(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear any previous payment errors when user starts typing
    if (paymentError) setPaymentError("");
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
      if (!paymentDetails.cardHolder) {
        setPaymentError("Please enter card holder name");
        return false;
      }
    } else if (paymentMethod === 'upi') {
      if (!paymentDetails.upiId || !paymentDetails.upiId.includes('@')) {
        setPaymentError("Please enter a valid UPI ID");
        return false;
      }
    } else if (paymentMethod === 'insurance') {
      if (!paymentDetails.insuranceProvider) {
        setPaymentError("Please enter insurance provider");
        return false;
      }
      if (!paymentDetails.insuranceId) {
        setPaymentError("Please enter insurance ID");
        return false;
      }
    }
    return true;
  };

  // Process payment and book appointment
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
      // Simulate API call to payment gateway
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate 90% success rate
          if (Math.random() > 0.1) {
            resolve();
          } else {
            reject(new Error("Payment processing failed. Please try again."));
          }
        }, 3000);
      });

      // Payment successful, now book the appointment
      const appointmentPayload = {
        userId: userId,
        doctorId: id,
        doctorName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
        doctorSpecialization: doctor.specialization,
        patientDetails: appointmentData.patientDetails,
        appointmentDate: appointmentData.appointmentDate,
        timeSlot: appointmentData.timeSlot,
        timeSlotId: appointmentData.timeSlotId,
        appointmentNumber: appointmentData.appointmentNumber,
        consultationFee: doctor.price,
        payment: {
          method: paymentMethod,
          amount: doctor.price,
          status: 'paid',
          transactionId: `TXN${Date.now()}`,
          details: paymentDetails
        }
      };

      console.log('Booking appointment with payment:', appointmentPayload);

      const response = await axios.post(
        "http://localhost:5000/api/appointments",
        appointmentPayload,
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 201) {
        setPaymentSuccess(true);
        return true;
      } else {
        throw new Error("Failed to book appointment after payment.");
      }

    } catch (error) {
      console.error("Error processing payment and booking:", error);
      
      if (error.response?.status === 409) {
        setPaymentError("This time slot is no longer available. Please go back and choose another slot.");
      } else if (error.response?.status === 400) {
        setPaymentError("Invalid appointment data. Please start over.");
      } else {
        setPaymentError(error.message || "Payment processing failed. Please try again.");
      }
      return false;
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    const success = await processPaymentAndBook();
    
    if (success) {
      // Navigate to confirmation page with updated appointment data
      navigate("/appointment-confirmation", {
        state: {
          appointment: {
            ...appointmentData,
            payment: {
              method: paymentMethod,
              amount: doctor.price,
              status: 'paid',
              transactionId: `TXN${Date.now()}`,
              details: paymentDetails
            }
          },
          doctor,
          paymentSuccess: true
        }
      });
    }
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
          required
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
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CVV <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="cvv"
            value={paymentDetails.cvv}
            onChange={handlePaymentInputChange}
            placeholder="123"
            maxLength={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            required
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Holder Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="cardHolder"
          value={paymentDetails.cardHolder}
          onChange={handlePaymentInputChange}
          placeholder="John Doe"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          required
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
          type="text"
          name="upiId"
          value={paymentDetails.upiId}
          onChange={handlePaymentInputChange}
          placeholder="yourname@upi"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          required
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
          type="text"
          name="insuranceProvider"
          value={paymentDetails.insuranceProvider}
          onChange={handlePaymentInputChange}
          placeholder="e.g., Blue Cross, Aetna, etc."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Insurance ID <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="insuranceId"
          value={paymentDetails.insuranceId}
          onChange={handlePaymentInputChange}
          placeholder="Your insurance identification number"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Policy Number
        </label>
        <input
          type="text"
          name="policyNumber"
          value={paymentDetails.policyNumber}
          onChange={handlePaymentInputChange}
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
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
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
                  </div>

                  {/* Payment Form */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    {paymentMethod === 'card' && <CreditCardForm />}
                    {paymentMethod === 'upi' && <UPIForm />}
                    {paymentMethod === 'insurance' && <InsuranceForm />}
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
                      Processing Payment...
                    </div>
                  ) : (
                    `Pay ${formatPrice(doctor.price)} Now`
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