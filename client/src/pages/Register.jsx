
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiCalendar, FiMapPin, FiHome, FiGlobe, FiUserPlus, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: 'prefer-not-to-say',
    birthdate: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: 'Sri Lanka',
      zipCode: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      input:focus, select:focus {
        border-color: #4f46e5 !important;
        box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1) !important;
        outline: none;
      }
      
      .register-button:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(79, 70, 229, 0.6) !important;
      }
      
      a:hover {
        color: #4f46e5 !important;
        text-decoration: underline !important;
      }
    `;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          gender: formData.gender,
          birthdate: formData.birthdate,
          address: formData.address
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.backgroundPattern}></div>
      
      <div style={styles.card}>
        <div style={styles.logoContainer}>
          <div style={styles.logo}>
            <FiUserPlus size={40} color="#4f46e5" />
          </div>
          <h1 style={styles.brandName}>NawalokaCare</h1>
        </div>

        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Join us to access healthcare services</p>
        
        {error && (
          <div style={styles.errorContainer}>
            <FiAlertCircle size={20} style={styles.errorIcon} />
            <span style={styles.errorText}>{error}</span>
          </div>
        )}
        
        {success && (
          <div style={styles.successContainer}>
            <FiCheckCircle size={20} style={styles.successIcon} />
            <span style={styles.successText}>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <FiUser style={styles.inputIcon} />
                Username *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="Enter username"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <FiMail style={styles.inputIcon} />
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="Enter email"
              />
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <FiLock style={styles.inputIcon} />
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
                style={styles.input}
                placeholder="Min. 6 characters"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <FiLock style={styles.inputIcon} />
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="Confirm password"
              />
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <FiUser style={styles.inputIcon} />
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="prefer-not-to-say">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <FiCalendar style={styles.inputIcon} />
                Birthdate
              </label>
              <input
                type="date"
                name="birthdate"
                value={formData.birthdate}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.addressSection}>
            <h3 style={styles.sectionTitle}>
              <FiMapPin style={styles.sectionIcon} />
              Address Information (Optional)
            </h3>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <FiHome style={styles.inputIcon} />
                Street
              </label>
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                style={styles.input}
                placeholder="Street address"
              />
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>City</label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="City"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>State</label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="State"
                />
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Zip Code</label>
                <input
                  type="text"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Zip code"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <FiGlobe style={styles.inputIcon} />
                  Country
                </label>
                <input
                  type="text"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Country"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="register-button"
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {})
            }}
          >
            {loading ? (
              <div style={styles.loader}>
                <div style={styles.spinner}></div>
                <span>Creating Account...</span>
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerLine}></span>
          <span style={styles.dividerText}>OR</span>
          <span style={styles.dividerLine}></span>
        </div>

        <p style={styles.linkText}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>
            Sign in here
          </Link>
        </p>

        <p style={styles.terms}>
          By creating an account, you agree to our{' '}
          <Link to="/terms" style={styles.termsLink}>Terms</Link> and{' '}
          <Link to="/privacy" style={styles.termsLink}>Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden'
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px)',
    backgroundSize: '30px 30px',
    pointerEvents: 'none'
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: '48px',
    borderRadius: '24px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    width: '100%',
    maxWidth: '700px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    position: 'relative',
    zIndex: 1,
    animation: 'slideUp 0.5s ease-out'
  },
  logoContainer: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  logo: {
    display: 'inline-block',
    padding: '12px',
    backgroundColor: '#f5f5f5',
    borderRadius: '16px',
    marginBottom: '16px'
  },
  brandName: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0',
    letterSpacing: '-0.5px'
  },
  title: {
    textAlign: 'center',
    marginBottom: '8px',
    color: '#1e293b',
    fontSize: '32px',
    fontWeight: '700',
    lineHeight: '1.2'
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: '32px',
    color: '#64748b',
    fontSize: '16px',
    lineHeight: '1.5'
  },
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    padding: '14px 16px',
    borderRadius: '12px',
    marginBottom: '24px',
    border: '1px solid #fee2e2'
  },
  successContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#f0fdf4',
    color: '#166534',
    padding: '14px 16px',
    borderRadius: '12px',
    marginBottom: '24px',
    border: '1px solid #dcfce7'
  },
  errorIcon: {
    flexShrink: 0,
    color: '#dc2626'
  },
  successIcon: {
    flexShrink: 0,
    color: '#16a34a'
  },
  errorText: {
    fontSize: '14px',
    fontWeight: '500'
  },
  successText: {
    fontSize: '14px',
    fontWeight: '500'
  },
  form: {
    width: '100%'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px'
  },
  formGroup: {
    marginBottom: '16px',
    flex: 1
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#1e293b',
    fontSize: '14px'
  },
  inputIcon: {
    color: '#4f46e5'
  },
  sectionIcon: {
    color: '#4f46e5',
    marginRight: '8px',
    verticalAlign: 'middle'
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease',
    outline: 'none',
    backgroundColor: '#f8fafc'
  },
  addressSection: {
    marginBottom: '25px',
    padding: '20px',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    backgroundColor: '#f8fafc'
  },
  sectionTitle: {
    marginBottom: '20px',
    color: '#1e293b',
    fontSize: '18px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center'
  },
  button: {
    width: '100%',
    padding: '16px',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '24px',
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(79, 70, 229, 0.4)'
  },
  buttonDisabled: {
    background: '#94a3b8',
    cursor: 'not-allowed',
    boxShadow: 'none'
  },
  loader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px'
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '3px solid #ffffff',
    borderTop: '3px solid transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px'
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#e2e8f0'
  },
  dividerText: {
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '500'
  },
  linkText: {
    textAlign: 'center',
    color: '#1e293b',
    marginBottom: '16px',
    fontSize: '15px'
  },
  link: {
    color: '#4f46e5',
    textDecoration: 'none',
    fontWeight: '700',
    transition: 'color 0.3s ease'
  },
  terms: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: '13px',
    lineHeight: '1.5'
  },
  termsLink: {
    color: '#4f46e5',
    textDecoration: 'none',
    fontWeight: '500'
  }
};

export default Register;