



import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock, FiLogIn, FiAlertCircle } from 'react-icons/fi';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
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
      
      input:focus {
        border-color: #4f46e5 !important;
        box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1) !important;
        background-color: white !important;
        outline: none;
      }
      
      .login-button:hover {
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
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Clear field error when user types
    if (fieldErrors[e.target.name]) {
      setFieldErrors(prev => ({
        ...prev,
        [e.target.name]: ''
      }));
    }
    // Clear general error when user types
    if (error) setError('');
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setError('');
    setFieldErrors({});
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        const previousUserId = localStorage.getItem('currentUserId');
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('currentUserId', data.user._id);
        localStorage.setItem('userName', data.user.name);
        
        if (previousUserId && previousUserId !== data.user._id) {
          localStorage.setItem('lastLoggedOutUserId', previousUserId);
        }
        
        navigate('/home');
      } else {
        // Handle "Invalid credentials" error
        const errorMsg = data.message || '';
        
        if (errorMsg.toLowerCase().includes('invalid credentials') || 
            errorMsg.toLowerCase().includes('invalid email or password')) {
          
          setError('Invalid email or password. Please check your credentials and try again.');
          
          // Don't specify which field is wrong for security reasons
          setFieldErrors({
            email: ' ',
            password: ' '
          });
        }
        // Handle other specific errors
        else if (errorMsg.toLowerCase().includes('not found') || 
                 errorMsg.toLowerCase().includes('does not exist')) {
          setError('Account not found. Please check your email or create a new account.');
          setFieldErrors({ email: ' ' });
        }
        else if (errorMsg.toLowerCase().includes('password')) {
          setError('Incorrect password. Please try again.');
          setFieldErrors({ password: ' ' });
        }
        else {
          setError(errorMsg || 'Login failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check your connection and try again.');
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
            <FiLogIn size={40} color="#4f46e5" />
          </div>
          <h1 style={styles.brandName}>NawalokaCare</h1>
        </div>

        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.subtitle}>Please enter your details to sign in</p>
        
        {error && (
          <div style={styles.errorContainer}>
            <FiAlertCircle size={20} style={styles.errorIcon} />
            <span style={styles.errorText}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <FiMail style={styles.inputIcon} />
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                ...styles.input,
                ...(fieldErrors.email ? styles.inputError : {})
              }}
              placeholder="Enter your email"
            />
            {fieldErrors.email && fieldErrors.email.trim() && (
              <span style={styles.fieldError}>{fieldErrors.email}</span>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              <FiLock style={styles.inputIcon} />
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                ...styles.input,
                ...(fieldErrors.password ? styles.inputError : {})
              }}
              placeholder="Enter your password"
            />
            {fieldErrors.password && fieldErrors.password.trim() && (
              <span style={styles.fieldError}>{fieldErrors.password}</span>
            )}
          </div>

          <div style={styles.forgotPassword}>
            <Link to="/forgot-password" style={styles.forgotLink}>
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-button"
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {})
            }}
          >
            {loading ? (
              <div style={styles.loader}>
                <div style={styles.spinner}></div>
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerLine}></span>
          <span style={styles.dividerText}>OR</span>
          <span style={styles.dividerLine}></span>
        </div>

        <p style={styles.linkText}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.link}>
            Create an account
          </Link>
        </p>

        <p style={styles.terms}>
          By signing in, you agree to our{' '}
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
    maxWidth: '440px',
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
  errorIcon: {
    flexShrink: 0,
    color: '#dc2626'
  },
  errorText: {
    fontSize: '14px',
    fontWeight: '500'
  },
  fieldError: {
    color: '#dc2626',
    fontSize: '12px',
    marginTop: '4px',
    display: 'block'
  },
  form: {
    width: '100%'
  },
  formGroup: {
    marginBottom: '20px'
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
  input: {
    width: '100%',
    padding: '14px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '16px',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease',
    outline: 'none',
    backgroundColor: '#f8fafc'
  },
  inputError: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2'
  },
  forgotPassword: {
    textAlign: 'right',
    marginBottom: '24px'
  },
  forgotLink: {
    color: '#4f46e5',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
    transition: 'color 0.3s ease'
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

export default Login;

