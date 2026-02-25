import React, { useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Avatar,
  useTheme,
  alpha,
  Chip,
  Divider,
  Alert,
  Snackbar,
  IconButton
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Send as SendIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  WhatsApp as WhatsAppIcon,
  Map as MapIcon,
  LocalHospital as HospitalIcon
} from '@mui/icons-material';
import axios from 'axios';

const Contact = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Contact information
  const contactInfo = [
    {
      icon: <PhoneIcon />,
      title: 'Phone',
      details: ['+94 11 234 5678', '+94 11 234 5679'],
      subtitle: '24/7 Emergency',
      color: '#2563eb'
    },
    {
      icon: <EmailIcon />,
      title: 'Email',
      details: ['info@medicare.lk', 'appointments@medicare.lk'],
      subtitle: 'Reply within 24h',
      color: '#7c3aed'
    },
    {
      icon: <LocationIcon />,
      title: 'Location',
      details: ['123, Galle Road', 'Colombo 03, Sri Lanka'],
      subtitle: 'Main Branch',
      color: '#16a34a'
    },
    {
      icon: <TimeIcon />,
      title: 'Working Hours',
      details: ['Mon-Fri: 9:00 AM - 6:00 PM', 'Sat: 9:00 AM - 2:00 PM'],
      subtitle: 'Emergency: 24/7',
      color: '#db2777'
    }
  ];

  // Departments
  const departments = [
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Gynecology',
    'Dermatology',
    'Emergency',
    'Pharmacy'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // API call to send message
      await axios.post('http://localhost:5000/api/contact', formData);
      
      setSnackbar({
        open: true,
        message: 'Message sent successfully! We will contact you soon.',
        severity: 'success'
      });
      
      // Clear form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to send message. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: '#0f172a',
          color: 'white',
          py: { xs: 6, md: 8 },
          mb: 4
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', maxWidth: 700, mx: 'auto' }}>
            <Chip
              icon={<HospitalIcon />}
              label="GET IN TOUCH"
              sx={{
                bgcolor: alpha('#fff', 0.1),
                color: 'white',
                border: 'none',
                mb: 3
              }}
            />
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: '2rem', md: '2.5rem' }
              }}
            >
              Contact Us
            </Typography>
            <Typography variant="body1" sx={{ color: alpha('#fff', 0.8), lineHeight: 1.7 }}>
              We're here to help you with any questions or concerns. 
              Reach out to us through any of our channels.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Contact Information Cards */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Grid container spacing={3}>
          {contactInfo.map((info, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 2,
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      bgcolor: alpha(info.color, 0.1),
                      color: info.color,
                      width: 56,
                      height: 56,
                      mx: 'auto',
                      mb: 2
                    }}
                  >
                    {info.icon}
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {info.title}
                  </Typography>
                  {info.details.map((detail, i) => (
                    <Typography key={i} variant="body2" color="text.secondary">
                      {detail}
                    </Typography>
                  ))}
                  <Typography variant="caption" color="primary.main" sx={{ mt: 1, display: 'block' }}>
                    {info.subtitle}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Map & Contact Form */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Grid container spacing={4}>
          {/* Map */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              sx={{
                height: '100%',
                minHeight: 400,
                borderRadius: 2,
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126743.5853220106!2d79.848205!3d6.9270786!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2596d3c3b3c3d%3A0x3c3b3c3b3c3b3c3b!2sColombo!5e0!3m2!1sen!2slk!4v1620000000000!5m2!1sen!2slk"
                width="100%"
                height="100%"
                style={{ border: 0, position: 'absolute', top: 0, left: 0 }}
                allowFullScreen
                loading="lazy"
                title="hospital-location"
              />
            </Paper>
          </Grid>

          {/* Contact Form */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 4, borderRadius: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                Send us a Message
              </Typography>

              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Your Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      multiline
                      rows={4}
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={loading}
                      endIcon={<SendIcon />}
                      sx={{
                        py: 1.5,
                        bgcolor: '#2563eb',
                        '&:hover': { bgcolor: '#1d4ed8' }
                      }}
                    >
                      {loading ? 'Sending...' : 'Send Message'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Departments Section */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Paper sx={{ p: 4, borderRadius: 2, bgcolor: 'white' }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
            Our Departments
          </Typography>
          <Grid container spacing={2}>
            {departments.map((dept, index) => (
              <Grid size={{ xs: 6, sm: 4, md: 3 }} key={index}>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    borderColor: alpha('#2563eb', 0.3),
                    color: 'text.primary',
                    '&:hover': {
                      borderColor: '#2563eb',
                      bgcolor: alpha('#2563eb', 0.05)
                    }
                  }}
                >
                  {dept}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>

      {/* Social Media & CTA */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Paper
          sx={{
            p: 4,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: 'white'
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                Connect With Us
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                Follow us on social media for updates and health tips
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <IconButton sx={{ bgcolor: alpha('#fff', 0.1), color: 'white', '&:hover': { bgcolor: alpha('#fff', 0.2) } }}>
                  <FacebookIcon />
                </IconButton>
                <IconButton sx={{ bgcolor: alpha('#fff', 0.1), color: 'white', '&:hover': { bgcolor: alpha('#fff', 0.2) } }}>
                  <TwitterIcon />
                </IconButton>
                <IconButton sx={{ bgcolor: alpha('#fff', 0.1), color: 'white', '&:hover': { bgcolor: alpha('#fff', 0.2) } }}>
                  <InstagramIcon />
                </IconButton>
                <IconButton sx={{ bgcolor: alpha('#fff', 0.1), color: 'white', '&:hover': { bgcolor: alpha('#fff', 0.2) } }}>
                  <LinkedInIcon />
                </IconButton>
                <IconButton sx={{ bgcolor: alpha('#fff', 0.1), color: 'white', '&:hover': { bgcolor: alpha('#fff', 0.2) } }}>
                  <WhatsAppIcon />
                </IconButton>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }} sx={{ textAlign: { md: 'right' } }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                Emergency?
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                Call our 24/7 emergency hotline
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<PhoneIcon />}
                href="tel:+94112345678"
                sx={{
                  bgcolor: 'white',
                  color: '#2563eb',
                  '&:hover': { bgcolor: alpha('#fff', 0.9) }
                }}
              >
                +94 11 234 5678
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Contact;