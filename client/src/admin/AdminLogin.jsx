// import React, { useState } from 'react';
// import { 
//   Container, 
//   Paper, 
//   TextField, 
//   Button, 
//   Typography, 
//   Box,
//   Alert,
//   CircularProgress
// } from '@mui/material';
// import { LockOutlined } from '@mui/icons-material';
// import { useNavigate, Link as RouterLink } from 'react-router-dom';
// import axios from 'axios';

// // Separate Link import
// import Link from '@mui/material/Link';

// const AdminLogin = () => {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       const response = await axios.post(`${API_URL}/admin/login`, formData);
      
//       if (response.data.success) {
//         localStorage.setItem('admin_token', response.data.token);
//         localStorage.setItem('admin', JSON.stringify(response.data.admin));
        
//         alert('Login successful! Redirecting to dashboard...');
//         navigate('/admin/dashboard');
//       }
//     } catch (err) {
//       const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
//       setError(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Container component="main" maxWidth="xs">
//       <Box
//         sx={{
//           marginTop: 8,
//           display: 'flex',
//           flexDirection: 'column',
//           alignItems: 'center',
//         }}
//       >
//         <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
//           <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
//             <LockOutlined sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
//             <Typography component="h1" variant="h5">
//               Admin Login
//             </Typography>
//           </Box>

//           {error && (
//             <Alert severity="error" sx={{ mb: 2 }}>
//               {error}
//             </Alert>
//           )}

//           <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
//             <TextField
//               margin="normal"
//               required
//               fullWidth
//               id="email"
//               label="Email Address"
//               name="email"
//               autoComplete="email"
//               autoFocus
//               value={formData.email}
//               onChange={handleChange}
//               disabled={loading}
//             />
//             <TextField
//               margin="normal"
//               required
//               fullWidth
//               name="password"
//               label="Password"
//               type="password"
//               id="password"
//               autoComplete="current-password"
//               value={formData.password}
//               onChange={handleChange}
//               disabled={loading}
//             />
            
//             <Button
//               type="submit"
//               fullWidth
//               variant="contained"
//               sx={{ mt: 3, mb: 2, py: 1.5 }}
//               disabled={loading}
//             >
//               {loading ? (
//                 <CircularProgress size={24} color="inherit" />
//               ) : (
//                 'Sign In'
//               )}
//             </Button>

//             <Box sx={{ textAlign: 'center', mt: 2 }}>
//               <Typography variant="body2">
//                 Don't have an account?{' '}
//                 <Link component={RouterLink} to="/admin/register" sx={{ textDecoration: 'none' }}>
//                   <Typography 
//                     component="span" 
//                     color="primary" 
//                     sx={{ fontWeight: 'bold', cursor: 'pointer' }}
//                   >
//                     Register here
//                   </Typography>
//                 </Link>
//               </Typography>
//             </Box>
//           </Box>
//         </Paper>
//       </Box>
//     </Container>
//   );
// };

// export default AdminLogin;







import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box,
  Alert,
  CircularProgress,
  Link as MuiLink  // Renamed to MuiLink
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/admin/login`, formData);
      
      if (response.data.success) {
        localStorage.setItem('admin_token', response.data.token);
        localStorage.setItem('admin', JSON.stringify(response.data.admin));
        
        // Show success message (better than alert)
        setError('success'); // Temporary use error state for success message
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1500);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Check if it's success
  const isSuccess = error === 'success';

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '60vh'
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            width: '100%',
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Decorative top bar */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: 'linear-gradient(90deg, #1976d2, #9c27b0)'
            }}
          />

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Box
              sx={{
                bgcolor: 'primary.light',
                borderRadius: '50%',
                p: 1,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <LockOutlined sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Typography component="h1" variant="h5" fontWeight="bold">
              Admin Login
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Sign in to access admin panel
            </Typography>
          </Box>

          {error && error !== 'success' && (
            <Alert 
              severity="error" 
              sx={{ mb: 2 }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          {isSuccess && (
            <Alert 
              severity="success" 
              sx={{ mb: 2 }}
            >
              Login successful! Redirecting to dashboard...
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              error={!!error && error.includes('Email')}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              error={!!error && error.includes('Password')}
              variant="outlined"
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 3, 
                mb: 2, 
                py: 1.5,
                fontWeight: 'bold',
                position: 'relative'
              }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign In'
              )}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <MuiLink
                  component={RouterLink}
                  to="/admin/register"
                  sx={{ 
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Register here
                </MuiLink>
              </Typography>
            </Box>

            {/* Forgot password link */}
            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <MuiLink
                component={RouterLink}
                to="/admin/forgot-password"
                sx={{ 
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'primary.main'
                  }
                }}
              >
                Forgot password?
              </MuiLink>
            </Box>
          </Box>
        </Paper>

        {/* Back to home link */}
        <Box sx={{ mt: 2 }}>
          <MuiLink
            component={RouterLink}
            to="/"
            sx={{ 
              textDecoration: 'none',
              color: 'text.secondary',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              '&:hover': {
                color: 'primary.main'
              }
            }}
          >
            ← Back to Home
          </MuiLink>
        </Box>
      </Box>
    </Container>
  );
};

export default AdminLogin;