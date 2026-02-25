import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  TextField,
  Button,
  Stack,
  alpha,
  useTheme
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  YouTube as YouTubeIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Send as SendIcon,
  LocalHospital as HospitalIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  // Quick links
  const quickLinks = [
    { title: 'Home', path: '/home' },
    { title: 'About Us', path: '/about' },
    { title: 'Doctors', path: '/list' },
    { title: 'Services', path: '/services' },
    { title: 'Contact', path: '/contact' },
    { title: 'Appointments', path: '/appointments' }
  ];

  // Services
  const services = [
    { title: 'Cardiology', path: '/services/cardiology' },
    { title: 'Neurology', path: '/services/neurology' },
    { title: 'Orthopedics', path: '/services/orthopedics' },
    { title: 'Pediatrics', path: '/services/pediatrics' },
    { title: 'Emergency Care', path: '/emergency' },
    { title: 'Pharmacy', path: '/pharmacy' }
  ];

  // Contact info
  const contactInfo = [
    { icon: <PhoneIcon />, text: '+94 11 234 5678', subtext: '24/7 Emergency' },
    { icon: <EmailIcon />, text: 'Nawalokacare.lk', subtext: 'appointments@medicare.lk' },
    { icon: <LocationIcon />, text: '123, Galle Road', subtext: 'Colombo 03, Sri Lanka' },
    { icon: <TimeIcon />, text: 'Mon-Fri: 9am-6pm', subtext: 'Sat: 9am-2pm' }
  ];

  // Social media
  const socialMedia = [
    { icon: <FacebookIcon />, url: 'https://facebook.com', color: '#1877f2' },
    { icon: <TwitterIcon />, url: 'https://twitter.com', color: '#1da1f2' },
    { icon: <InstagramIcon />, url: 'https://instagram.com', color: '#e4405f' },
    { icon: <LinkedInIcon />, url: 'https://linkedin.com', color: '#0a66c2' },
    { icon: <YouTubeIcon />, url: 'https://youtube.com', color: '#ff0000' }
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#0f172a',
        color: 'white',
        pt: { xs: 6, md: 8 },
        pb: 3,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        {/* Main Footer Content */}
        <Grid container spacing={4}>
          {/* About Section */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <HospitalIcon sx={{ fontSize: 32, color: '#2563eb' }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Nawaloka Care
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: alpha('#fff', 0.7), mb: 2, lineHeight: 1.7 }}>
              Providing world-class healthcare with compassion and excellence. 
              Your health is our mission, your trust is our reward.
            </Typography>
            
            {/* Newsletter Signup */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Subscribe to Newsletter
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  placeholder="Your email"
                  variant="outlined"
                  sx={{
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      bgcolor: alpha('#fff', 0.1),
                      color: 'white',
                      '& fieldset': { borderColor: alpha('#fff', 0.2) },
                      '&:hover fieldset': { borderColor: alpha('#fff', 0.3) }
                    }
                  }}
                />
                <Button
                  variant="contained"
                  sx={{
                    minWidth: 45,
                    bgcolor: '#2563eb',
                    '&:hover': { bgcolor: '#1d4ed8' }
                  }}
                >
                  <SendIcon sx={{ fontSize: 18 }} />
                </Button>
              </Box>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Quick Links
            </Typography>
            <Stack spacing={1}>
              {quickLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.path}
                  underline="none"
                  sx={{
                    color: alpha('#fff', 0.7),
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    '&:hover': { color: '#2563eb', transform: 'translateX(5px)' },
                    transition: 'all 0.3s'
                  }}
                >
                  <ArrowForwardIcon sx={{ fontSize: 14 }} />
                  {link.title}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Services */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Our Services
            </Typography>
            <Grid container spacing={1}>
              {services.map((service, index) => (
                <Grid size={{ xs: 6 }} key={index}>
                  <Link
                    href={service.path}
                    underline="none"
                    sx={{
                      color: alpha('#fff', 0.7),
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      '&:hover': { color: '#2563eb' },
                      transition: 'color 0.3s'
                    }}
                  >
                    • {service.title}
                  </Link>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Contact Info */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Contact Us
            </Typography>
            <Stack spacing={2}>
              {contactInfo.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1.5 }}>
                  <Box sx={{ color: '#2563eb', mt: 0.5 }}>{item.icon}</Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                      {item.text}
                    </Typography>
                    <Typography variant="caption" sx={{ color: alpha('#fff', 0.5) }}>
                      {item.subtext}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Grid>
        </Grid>

        {/* Divider */}
        <Divider sx={{ my: 4, borderColor: alpha('#fff', 0.1) }} />

        {/* Bottom Bar */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2
        }}>
          {/* Copyright */}
          <Typography variant="body2" sx={{ color: alpha('#fff', 0.5) }}>
            © {currentYear} Nawaloka Care Hospital. All rights reserved.
          </Typography>

          {/* Social Media Icons */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {socialMedia.map((social, index) => (
              <IconButton
                key={index}
                component="a"
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  bgcolor: alpha('#fff', 0.05),
                  color: alpha('#fff', 0.7),
                  width: 36,
                  height: 36,
                  '&:hover': {
                    bgcolor: social.color,
                    color: 'white',
                    transform: 'translateY(-3px)'
                  },
                  transition: 'all 0.3s'
                }}
              >
                {social.icon}
              </IconButton>
            ))}
          </Box>

          {/* Legal Links */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link
              href="/privacy"
              underline="hover"
              sx={{ color: alpha('#fff', 0.5), fontSize: '0.8rem' }}
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              underline="hover"
              sx={{ color: alpha('#fff', 0.5), fontSize: '0.8rem' }}
            >
              Terms of Use
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;