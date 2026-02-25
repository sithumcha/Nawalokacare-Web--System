import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Divider,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Rating,
  IconButton,
  useTheme,
  alpha,
  Fade,
  Grow,
  Zoom
} from '@mui/material';
import {
  LocalHospital as HospitalIcon,
  MedicalServices as MedicalIcon,
  People as PeopleIcon,
  Star as StarIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  Verified as VerifiedIcon,
  ArrowForward as ArrowForwardIcon,
  FormatQuote as FormatQuoteIcon,
  ImageNotSupported as ImageNotSupportedIcon,
  EmojiEvents as EmojiEventsIcon,
  ThumbUp as ThumbUpIcon
} from '@mui/icons-material';
import axios from 'axios';
import { Link } from 'react-router-dom';

const About = () => {
  const theme = useTheme();
  const [doctors, setDoctors] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackSummary, setFeedbackSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbacksLoading, setFeedbacksLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  const API_URL = 'http://localhost:5000/api';

  // Demo testimonials (fallback data)
  const demoTestimonials = [
    {
      _id: 'demo1',
      patientName: 'Michael Chen',
      rating: 5,
      review: 'Exceptional care and professional staff. The doctors are highly knowledgeable and compassionate.',
      doctorName: 'Dr. John Smith',
      createdAt: new Date('2024-02-15').toISOString()
    },
    {
      _id: 'demo2',
      patientName: 'Sarah Williams',
      rating: 5,
      review: 'State-of-the-art facilities and amazing doctors. I received the best treatment possible.',
      doctorName: 'Dr. Sarah Johnson',
      createdAt: new Date('2024-02-10').toISOString()
    },
    {
      _id: 'demo3',
      patientName: 'David Kumar',
      rating: 4,
      review: 'The medical team went above and beyond. Grateful for their dedication and expertise.',
      doctorName: 'Dr. Robert Williams',
      createdAt: new Date('2024-02-05').toISOString()
    }
  ];

  // Demo summary data
  const demoSummary = {
    averageRating: 4.8,
    totalFeedbacks: 150,
    ratingDistribution: {
      '5': 90,
      '4': 40,
      '3': 15,
      '2': 3,
      '1': 2
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchFeedbacks();
    fetchFeedbackSummary();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/doctors`);
      
      const doctorsData = response.data.data || response.data;
      // Limit to first 4 doctors
      setDoctors(doctorsData.slice(0, 4));
      setError(null);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Unable to load team members');
      
      // Fallback doctors data (only 4)
      setDoctors([
        {
          _id: 1,
          firstName: 'John',
          lastName: 'Smith',
          specialization: 'Cardiology',
          department: 'Heart Center',
          experience: 15,
          rating: 4.8,
          email: 'john.smith@medicare.com',
          profilePicture: null
        },
        {
          _id: 2,
          firstName: 'Sarah',
          lastName: 'Johnson',
          specialization: 'Neurology',
          department: 'Brain Institute',
          experience: 12,
          rating: 4.9,
          email: 'sarah.johnson@medicare.com',
          profilePicture: null
        },
        {
          _id: 3,
          firstName: 'Robert',
          lastName: 'Williams',
          specialization: 'Orthopedics',
          department: 'Bone Center',
          experience: 20,
          rating: 4.7,
          email: 'robert.williams@medicare.com',
          profilePicture: null
        },
        {
          _id: 4,
          firstName: 'Emily',
          lastName: 'Davis',
          specialization: 'Pediatrics',
          department: 'Child Care',
          experience: 10,
          rating: 4.9,
          email: 'emily.davis@medicare.com',
          profilePicture: null
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      setFeedbacksLoading(true);
      const response = await axios.get(`${API_URL}/feedbacks?limit=6`);
      
      const feedbacksData = response.data.data || response.data;
      const feedbackList = Array.isArray(feedbacksData) ? feedbacksData : 
                          (feedbacksData.feedbacks || feedbacksData.results || []);
      
      if (feedbackList.length > 0) {
        setFeedbacks(feedbackList.slice(0, 6));
      } else {
        setFeedbacks(demoTestimonials);
      }
    } catch (err) {
      console.error('Error fetching feedbacks, using demo data:', err);
      setFeedbacks(demoTestimonials);
    } finally {
      setFeedbacksLoading(false);
    }
  };

  const fetchFeedbackSummary = async () => {
    try {
      setSummaryLoading(true);
      const response = await axios.get(`${API_URL}/feedbacks/summary`);
      
      if (response.data.success && response.data.summary) {
        setFeedbackSummary(response.data.summary);
      } else {
        setFeedbackSummary(demoSummary);
      }
    } catch (err) {
      console.error('Error fetching feedback summary, using demo data:', err);
      setFeedbackSummary(demoSummary);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleImageError = (doctorId) => {
    setImageErrors(prev => ({
      ...prev,
      [doctorId]: true
    }));
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;
  };

  const getAvatarColor = (name) => {
    const colors = ['#2563eb', '#7c3aed', '#16a34a', '#db2777', '#ea580c', '#0284c7'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Statistics with real data
  const stats = [
    { 
      value: doctors.length + '+', 
      label: 'Expert Doctors', 
      icon: <MedicalIcon />,
      color: '#2563eb',
      description: 'Specialized professionals'
    },
    { 
      value: feedbackSummary?.totalFeedbacks ? `${feedbackSummary.totalFeedbacks}+` : '5000+', 
      label: 'Patient Reviews', 
      icon: <PeopleIcon />,
      color: '#7c3aed',
      description: 'Trusted by thousands'
    },
    { 
      value: '15+', 
      label: 'Years Experience', 
      icon: <StarIcon />,
      color: '#16a34a',
      description: 'Excellence in healthcare'
    },
    { 
      value: feedbackSummary?.averageRating ? feedbackSummary.averageRating.toFixed(1) : '4.8', 
      label: 'Average Rating', 
      icon: <ThumbUpIcon />,
      color: '#db2777',
      description: 'Out of 5 stars'
    }
  ];

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={60} thickness={4} sx={{ color: '#2563eb' }} />
        <Typography variant="body1" color="text.secondary">
          Loading our medical team...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Hero Section - New gradient */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          color: 'white',
          pt: { xs: 8, md: 12 },
          pb: { xs: 12, md: 16 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            opacity: 0.1,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Fade in timeout={1000}>
            <Box sx={{ textAlign: 'center' }}>
              <Chip
                icon={<HospitalIcon />}
                label="Est. 2010"
                sx={{
                  bgcolor: alpha('#fff', 0.1),
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                  mb: 3,
                  '& .MuiChip-icon': { color: 'white' }
                }}
              />
              
              <Typography
                variant="h1"
                component="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '4rem' },
                  fontWeight: 800,
                  mb: 2,
                  background: 'linear-gradient(135deg, #fff 0%, #dbeafe 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                About MediCare
              </Typography>
              
              <Typography
                variant="h5"
                component="p"
                sx={{
                  maxWidth: 800,
                  mx: 'auto',
                  color: alpha('#fff', 0.9),
                  mb: 4,
                  lineHeight: 1.6
                }}
              >
                Providing world-class healthcare with compassion, innovation, and excellence.
                Your health is our mission, your trust is our reward.
              </Typography>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Statistics Section - New colors */}
      <Container maxWidth="lg" sx={{ mt: { xs: -6, md: -8 }, mb: 8, position: 'relative' }}>
        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Grow in timeout={(index + 1) * 300}>
                <Paper
                  elevation={4}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    bgcolor: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 8,
                      borderColor: stat.color
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: `linear-gradient(90deg, ${stat.color}, ${alpha(stat.color, 0.5)})`
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(stat.color, 0.1),
                        color: stat.color,
                        width: 56,
                        height: 56
                      }}
                    >
                      {stat.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 800, color: stat.color }}>
                        {String(stat.value)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                        {stat.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" component="p">
                        {stat.description}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grow>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Rating Summary Section - New gradient */}
      {feedbackSummary && feedbackSummary.ratingDistribution && (
        <Container maxWidth="lg" sx={{ mb: 6 }}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 4,
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              color: 'white'
            }}
          >
            <Grid container spacing={4} alignItems="center">
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h2" component="div" sx={{ fontWeight: 800 }}>
                    {String(feedbackSummary.averageRating?.toFixed(1) || '4.8')}
                  </Typography>
                  <Rating 
                    value={feedbackSummary.averageRating || 4.8} 
                    readOnly 
                    sx={{ 
                      mb: 1,
                      '& .MuiRating-icon': { color: 'white' }
                    }} 
                  />
                  <Typography variant="body2" component="p">
                    Based on {String(feedbackSummary.totalFeedbacks || 0)} reviews
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 8 }}>
                <Box sx={{ px: 2 }}>
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = feedbackSummary.ratingDistribution?.[star] || 0;
                    const percentage = feedbackSummary.totalFeedbacks > 0 
                      ? (count / feedbackSummary.totalFeedbacks) * 100 
                      : 0;
                    
                    return (
                      <Box key={star} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ minWidth: 30 }}>
                          {star}★
                        </Typography>
                        <Box sx={{ flex: 1, mx: 2 }}>
                          <Box
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: alpha('#fff', 0.2),
                              position: 'relative',
                              overflow: 'hidden'
                            }}
                          >
                            <Box
                              sx={{
                                width: `${percentage}%`,
                                height: '100%',
                                bgcolor: 'white',
                                borderRadius: 4
                              }}
                            />
                          </Box>
                        </Box>
                        <Typography variant="body2" sx={{ minWidth: 40 }}>
                          {String(count)}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      )}

      {/* Doctors Team Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Chip
            label="Our Medical Team"
            sx={{
              bgcolor: alpha('#2563eb', 0.1),
              color: '#2563eb',
              fontWeight: 600,
              mb: 2
            }}
          />
          <Typography variant="h3" component="h2" sx={{ fontWeight: 800, mb: 2, color: '#0f172a' }}>
            Meet Our Specialists
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
            Our team of highly qualified and experienced doctors is dedicated to providing
            the best possible care for you and your family.
          </Typography>
        </Box>

        {error && (
          <Alert severity="info" sx={{ mb: 4, borderRadius: 3 }}>
            {error} - Showing our featured doctors
          </Alert>
        )}

        <Grid container spacing={4}>
          {doctors.map((doctor, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={doctor._id}>
              <Grow in timeout={(index + 1) * 300}>
                <Card
                  sx={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 12,
                      border: '1px solid #2563eb',
                      '& .doctor-image': {
                        transform: 'scale(1.05)'
                      }
                    }
                  }}
                >
                  {/* Doctor Image */}
                  <Box
                    sx={{
                      height: 280,
                      bgcolor: getAvatarColor(doctor.firstName),
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {doctor.profilePicture && !imageErrors[doctor._id] ? (
                      <img
                        src={`http://localhost:5000/${doctor.profilePicture}`}
                        alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                        className="doctor-image"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.5s ease'
                        }}
                        onError={() => handleImageError(doctor._id)}
                      />
                    ) : (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%'
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 120,
                            height: 120,
                            bgcolor: 'white',
                            color: getAvatarColor(doctor.firstName),
                            fontSize: 48,
                            fontWeight: 600,
                            border: '4px solid rgba(37, 99, 235, 0.3)'
                          }}
                        >
                          {getInitials(doctor.firstName, doctor.lastName)}
                        </Avatar>
                      </Box>
                    )}

                    {/* Verified Badge */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        bgcolor: 'white',
                        borderRadius: 20,
                        px: 1.5,
                        py: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        boxShadow: 2
                      }}
                    >
                      <VerifiedIcon sx={{ fontSize: 16, color: '#2563eb' }} />
                      <Typography variant="caption" component="span" sx={{ fontWeight: 600 }}>
                        Verified
                      </Typography>
                    </Box>

                    {/* Social Icons */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 16,
                        left: 16,
                        right: 16,
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 1
                      }}
                    >
                      <IconButton size="small" sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#f0f0f0' } }}>
                        <LinkedInIcon sx={{ fontSize: 18, color: '#0077b5' }} />
                      </IconButton>
                      <IconButton size="small" sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#f0f0f0' } }}>
                        <TwitterIcon sx={{ fontSize: 18, color: '#1DA1F2' }} />
                      </IconButton>
                      <IconButton size="small" sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#f0f0f0' } }}>
                        <FacebookIcon sx={{ fontSize: 18, color: '#4267B2' }} />
                      </IconButton>
                    </Box>
                  </Box>

                  <CardContent sx={{ p: 3, flexGrow: 1 }}>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 700, mb: 0.5, color: '#0f172a' }}>
                      Dr. {doctor.firstName} {doctor.lastName}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                      <MedicalIcon sx={{ fontSize: 16, color: '#2563eb' }} />
                      <Typography variant="body2" color="primary.main" component="span" sx={{ fontWeight: 600, color: '#2563eb' }}>
                        {doctor.specialization || 'Medical Specialist'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                      <WorkIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary" component="p">
                        {doctor.experience ? `${doctor.experience}+ years` : '10+ years experience'}
                      </Typography>
                    </Box>

                    {doctor.department && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <SchoolIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary" component="p">
                          {doctor.department}
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Rating value={doctor.rating || 4.5} size="small" readOnly precision={0.5} />
                        <Typography variant="caption" component="span" sx={{ ml: 0.5, color: 'text.secondary' }}>
                          ({String(doctor.rating || 4.5)})
                        </Typography>
                      </Box>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        sx={{ 
                          borderRadius: 2,
                          borderColor: '#2563eb',
                          color: '#2563eb',
                          '&:hover': {
                            borderColor: '#1d4ed8',
                            backgroundColor: alpha('#2563eb', 0.04)
                          }
                        }}
                      >
                        Book
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Testimonials Section - New dark background */}
      <Box sx={{ bgcolor: '#0f172a', py: 8, mt: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Chip
              label="Patient Stories"
              sx={{
                bgcolor: alpha('#2563eb', 0.2),
                color: 'white',
                border: '1px solid rgba(37, 99, 235, 0.3)',
                mb: 2
              }}
            />
            <Typography variant="h3" component="h2" sx={{ fontWeight: 800, color: 'white', mb: 2 }}>
              What Our Patients Say
            </Typography>
            <Typography variant="body1" sx={{ color: alpha('#fff', 0.7), maxWidth: 700, mx: 'auto' }}>
              Real feedback from patients who experienced our care and compassion.
            </Typography>
          </Box>

          {feedbacksLoading ? (
            <Box sx={{ width: '100%', py: 4 }}>
              <Box sx={{ width: '100%', height: 8, bgcolor: alpha('#fff', 0.1), borderRadius: 4 }}>
                <Box sx={{ width: '50%', height: '100%', bgcolor: '#2563eb', borderRadius: 4 }} />
              </Box>
              <Typography sx={{ textAlign: 'center', color: 'white', mt: 2 }}>
                Loading patient stories...
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={4}>
              {feedbacks.slice(0, 3).map((feedback, index) => (
                <Grid size={{ xs: 12, md: 4 }} key={feedback._id || index}>
                  <Zoom in style={{ transitionDelay: `${index * 200}ms` }}>
                    <Card
                      sx={{
                        bgcolor: alpha('#fff', 0.05),
                        backdropFilter: 'blur(10px)',
                        color: 'white',
                        borderRadius: 4,
                        p: 3,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        border: '1px solid rgba(37, 99, 235, 0.2)',
                        transition: 'transform 0.3s',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          bgcolor: alpha('#2563eb', 0.1),
                          borderColor: '#2563eb'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <FormatQuoteIcon sx={{ fontSize: 40, color: alpha('#2563eb', 0.5) }} />
                        <Rating value={feedback.rating || 5} size="small" readOnly />
                      </Box>
                      
                      <Typography variant="body1" sx={{ mb: 3, color: alpha('#fff', 0.9), flexGrow: 1 }}>
                        "{feedback.review || feedback.content || feedback.message || 'Great experience!'}"
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: getAvatarColor(feedback.patientName || 'Patient'),
                            width: 48,
                            height: 48,
                            border: '2px solid #2563eb'
                          }}
                        >
                          {(feedback.patientName || 'P').charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" component="div" sx={{ fontWeight: 600 }}>
                            {feedback.patientName || 'Anonymous Patient'}
                          </Typography>
                          <Typography variant="caption" component="p" sx={{ color: alpha('#fff', 0.6) }}>
                            {feedback.doctorName ? `Patient of ${feedback.doctorName}` : 'Patient'}
                          </Typography>
                          <Typography variant="caption" component="p" sx={{ color: alpha('#fff', 0.4) }}>
                            {formatDate(feedback.createdAt || feedback.date)}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      {/* Mission & Vision Section - New gradients */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: 'white'
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <HospitalIcon sx={{ fontSize: 60, mb: 2, opacity: 0.9 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
                  Our Mission
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.8, opacity: 0.9 }}>
                  To provide accessible, high-quality healthcare services to every patient 
                  with compassion, respect, and excellence. We are committed to improving 
                  the health and well-being of our community through innovative medical 
                  practices and patient-centered care.
                </Typography>
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -20,
                  right: -20,
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  bgcolor: alpha('#fff', 0.1),
                  zIndex: 0
                }}
              />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                color: 'white'
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <EmojiEventsIcon sx={{ fontSize: 60, mb: 2, opacity: 0.9 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
                  Our Vision
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.8, opacity: 0.9 }}>
                  To be the leading healthcare provider in the region, recognized for clinical 
                  excellence, innovative treatments, and exceptional patient experiences. 
                  We envision a healthier community through preventive care and advanced 
                  medical solutions.
                </Typography>
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -20,
                  right: -20,
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  bgcolor: alpha('#fff', 0.1),
                  zIndex: 0
                }}
              />
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Contact Section - New colors */}
      <Box sx={{ bgcolor: '#f8fafc', py: 8 }}>
        <Container maxWidth="lg">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 6 },
              borderRadius: 4,
              bgcolor: 'white',
              boxShadow: '0 10px 40px rgba(37, 99, 235, 0.1)'
            }}
          >
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: alpha('#2563eb', 0.1), color: '#2563eb', width: 56, height: 56 }}>
                    <PhoneIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary" component="p">Call Us 24/7</Typography>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>+94 11 234 5678</Typography>
                    <Typography variant="caption" component="p" color="text.secondary">Emergency: +94 11 234 5679</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: alpha('#7c3aed', 0.1), color: '#7c3aed', width: 56, height: 56 }}>
                    <EmailIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary" component="p">Email Us</Typography>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>Nawalokacare.lk</Typography>
                    <Typography variant="caption" component="p" color="text.secondary">nawalokacare.lk</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: alpha('#16a34a', 0.1), color: '#16a34a', width: 56, height: 56 }}>
                    <LocationIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary" component="p">Visit Us</Typography>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>123, Galle Road</Typography>
                    <Typography variant="caption" component="p" color="text.secondary">Colombo 03, Sri Lanka</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>

      {/* CTA Section - New gradient */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
          py: 8,
          color: 'white'
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h3" component="h2" sx={{ fontWeight: 800, mb: 2 }}>
            Ready to Experience Quality Healthcare?
          </Typography>
          <Typography variant="h6" component="p" sx={{ mb: 4, opacity: 0.9 }}>
            Book your appointment today and take the first step towards better health.
          </Typography>
          <Button
            component={Link}
            to="/appointment"
            variant="contained"
            size="large"
            sx={{
              bgcolor: 'white',
              color: '#2563eb',
              px: 6,
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 600,
              borderRadius: 3,
              '&:hover': {
                bgcolor: alpha('#fff', 0.9),
                transform: 'scale(1.05)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Book an Appointment
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default About;