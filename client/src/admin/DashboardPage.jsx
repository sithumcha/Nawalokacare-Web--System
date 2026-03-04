
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Chip,
  Avatar,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Snackbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Logout as LogoutIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  AdminPanelSettings as SuperAdminIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  Settings as SettingsIcon,
  MedicalServices as DoctorIcon,
  CalendarToday as AppointmentIcon,
  PersonAdd as UserManagementIcon,
  LocalHospital as HospitalIcon,
  List as ListIcon,
  EventAvailable as EventIcon,
  Group as GroupIcon,
  MonetizationOn as RevenueIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Download as DownloadIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';

const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRevenue, setLoadingRevenue] = useState(false);
  const [stats, setStats] = useState({
    totalAdmins: 0,
    activeAdmins: 0,
    superAdmins: 0,
    totalDoctors: 0,
    activeDoctors: 0
  });
  
  // Revenue State
  const [revenue, setRevenue] = useState({
    totalRevenue: 0,
    todayRevenue: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    completedCount: 0,
    pendingCount: 0,
    doctors: [],
    revenueByDoctor: [],
    revenueByMonth: [],
    revenueByType: {
      online: 0,
      physical: 0,
      onlinePercentage: 0,
      physicalPercentage: 0
    }
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [dialogMode, setDialogMode] = useState('view');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'admin',
    isActive: true
  });
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error'
  });
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [revenuePeriod, setRevenuePeriod] = useState('month');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorRevenueDialog, setDoctorRevenueDialog] = useState(false);
  const [downloading, setDownloading] = useState(false);
  
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Create axios instance with token
  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add token interceptor
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      navigate('/admin/login');
    }
    return config;
  }, (error) => {
    return Promise.reject(error);
  });

  // Handle unauthorized responses
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      console.log('API Error:', error.response?.status, error.response?.data);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin');
        setSnackbar({
          open: true,
          message: 'Session expired. Please login again.',
          severity: 'error'
        });
        setTimeout(() => navigate('/admin/login'), 2000);
      }
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('admin_token');
    const storedAdmin = localStorage.getItem('admin');
    
    if (!token) {
      navigate('/admin/login');
      return;
    }

    try {
      const response = await api.get('/admin/profile');
      if (response.data.success) {
        setAdmin(response.data.data);
        localStorage.setItem('admin', JSON.stringify(response.data.data));
        fetchAllAdmins();
        fetchAllDoctors();
        fetchAllRevenue('month');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin');
      navigate('/admin/login');
    }
  };

  const fetchAllAdmins = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Fetching admins...');
      const response = await api.get('/admin/all');
      console.log('Admins response:', response.data);
      
      if (response.data.success) {
        setAdmins(response.data.data || []);
        
        const total = response.data.count || 0;
        const active = response.data.data?.filter(a => a.isActive)?.length || 0;
        const superAdmins = response.data.data?.filter(a => a.role === 'super_admin')?.length || 0;
        
        setStats(prev => ({
          ...prev,
          totalAdmins: total,
          activeAdmins: active,
          superAdmins: superAdmins
        }));
        
        setSnackbar({
          open: true,
          message: 'Admins loaded successfully',
          severity: 'success'
        });
      } else {
        setError(response.data.message || 'Failed to load admins');
        setSnackbar({
          open: true,
          message: response.data.message || 'Failed to load admins',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load admins list';
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch all doctors
  const fetchAllDoctors = async () => {
    try {
      const response = await api.get('/doctors');
      if (response.data) {
        const doctorsList = response.data || [];
        setDoctors(doctorsList);
        setStats(prev => ({
          ...prev,
          totalDoctors: doctorsList.length,
          activeDoctors: doctorsList.filter(d => d.isActive).length
        }));
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  // Fetch all revenue from all doctors
  const fetchAllRevenue = async (period = 'month') => {
    setLoadingRevenue(true);
    try {
      console.log(`📊 Fetching all doctors revenue for period: ${period}`);
      
      const doctorsResponse = await api.get('/doctors');
      const doctorsList = doctorsResponse.data || [];
      
      let totalRevenue = 0;
      let todayRevenue = 0;
      let monthlyRevenue = 0;
      let pendingPayments = 0;
      let completedCount = 0;
      let pendingCount = 0;
      let onlineRevenue = 0;
      let physicalRevenue = 0;
      
      const revenueByDoctor = [];
      
      for (const doctor of doctorsList) {
        try {
          const revenueResponse = await axios.get(
            `${API_URL}/doctors/public/${doctor._id}/revenue?period=${period}`
          );
          
          if (revenueResponse.data.success) {
            const doctorRevenue = revenueResponse.data.summary;
            
            totalRevenue += doctorRevenue.totalRevenue || 0;
            todayRevenue += doctorRevenue.todayRevenue || 0;
            monthlyRevenue += doctorRevenue.monthlyRevenue || 0;
            pendingPayments += doctorRevenue.pendingPayments || 0;
            completedCount += doctorRevenue.completedCount || 0;
            pendingCount += doctorRevenue.pendingCount || 0;
            
            if (revenueResponse.data.breakdown?.byType) {
              onlineRevenue += revenueResponse.data.breakdown.byType.online || 0;
              physicalRevenue += revenueResponse.data.breakdown.byType.physical || 0;
            }
            
            revenueByDoctor.push({
              doctorId: doctor._id,
              doctorName: `Dr. ${doctor.firstName || ''} ${doctor.lastName || ''}`.trim(),
              specialization: doctor.specialization || 'N/A',
              ...doctorRevenue
            });
          }
        } catch (err) {
          console.log(`Error fetching revenue for doctor ${doctor._id}:`, err.message);
        }
      }
      
      revenueByDoctor.sort((a, b) => b.totalRevenue - a.totalRevenue);
      
      setRevenue({
        totalRevenue,
        todayRevenue,
        monthlyRevenue,
        pendingPayments,
        completedCount,
        pendingCount,
        doctors: doctorsList,
        revenueByDoctor,
        revenueByType: {
          online: onlineRevenue,
          physical: physicalRevenue,
          onlinePercentage: totalRevenue > 0 ? Math.round((onlineRevenue / totalRevenue) * 100) : 0,
          physicalPercentage: totalRevenue > 0 ? Math.round((physicalRevenue / totalRevenue) * 100) : 0
        }
      });
      
    } catch (error) {
      console.error('Error fetching all revenue:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch revenue data',
        severity: 'error'
      });
    } finally {
      setLoadingRevenue(false);
    }
  };

  // ✅ Excel Download Function
  const downloadRevenueExcel = () => {
    setDownloading(true);
    try {
      // Create workbook
      const wb = XLSX.utils.book_new();

      // 1. Summary Sheet
      const summaryData = [
        ['REVENUE SUMMARY REPORT'],
        ['Generated On', new Date().toLocaleString()],
        ['Period', revenuePeriod.toUpperCase()],
        ['Generated By', admin?.name || 'Admin'],
        [],
        ['Metric', 'Amount (LKR)', 'Count'],
        ['Total Revenue', revenue.totalRevenue, revenue.completedCount],
        ['Today\'s Revenue', revenue.todayRevenue, '-'],
        ['Monthly Revenue', revenue.monthlyRevenue, '-'],
        ['Pending Payments', revenue.pendingPayments, revenue.pendingCount],
        ['Online Revenue', revenue.revenueByType.online, '-'],
        ['Physical Revenue', revenue.revenueByType.physical, '-']
      ];
      
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

      // 2. Revenue by Type Sheet
      const typeData = [
        ['REVENUE BY CONSULTATION TYPE'],
        [],
        ['Type', 'Revenue (LKR)', 'Percentage'],
        ['Online', revenue.revenueByType.online, `${revenue.revenueByType.onlinePercentage}%`],
        ['Physical', revenue.revenueByType.physical, `${revenue.revenueByType.physicalPercentage}%`],
        [],
        ['TOTAL', revenue.totalRevenue, '100%']
      ];
      
      const typeSheet = XLSX.utils.aoa_to_sheet(typeData);
      XLSX.utils.book_append_sheet(wb, typeSheet, 'By Type');

      // 3. Doctors Revenue Sheet
      const doctorsData = [
        ['DOCTORS REVENUE BREAKDOWN'],
        [],
        ['Doctor Name', 'Specialization', 'Total Revenue', 'Today', 'Monthly', 'Pending', 'Completed', 'Pending Appts']
      ];
      
      revenue.revenueByDoctor.forEach(doc => {
        doctorsData.push([
          doc.doctorName,
          doc.specialization,
          doc.totalRevenue || 0,
          doc.todayRevenue || 0,
          doc.monthlyRevenue || 0,
          doc.pendingPayments || 0,
          doc.completedCount || 0,
          doc.pendingCount || 0
        ]);
      });

      // Add totals row
      doctorsData.push([]);
      doctorsData.push([
        'TOTAL',
        '-',
        revenue.totalRevenue,
        revenue.todayRevenue,
        revenue.monthlyRevenue,
        revenue.pendingPayments,
        revenue.completedCount,
        revenue.pendingCount
      ]);
      
      const doctorsSheet = XLSX.utils.aoa_to_sheet(doctorsData);
      XLSX.utils.book_append_sheet(wb, doctorsSheet, 'Doctors Revenue');

      // 4. Statistics Sheet
      const statsData = [
        ['SYSTEM STATISTICS'],
        [],
        ['Metric', 'Value'],
        ['Total Doctors', stats.totalDoctors],
        ['Active Doctors', stats.activeDoctors],
        ['Total Admins', stats.totalAdmins],
        ['Active Admins', stats.activeAdmins],
        ['Super Admins', stats.superAdmins],
        ['Completed Appointments', revenue.completedCount],
        ['Pending Appointments', revenue.pendingCount],
        ['Average per Doctor', revenue.totalDoctors > 0 ? revenue.totalRevenue / revenue.totalDoctors : 0]
      ];
      
      const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
      XLSX.utils.book_append_sheet(wb, statsSheet, 'Statistics');

      // Download the file
      const fileName = `Revenue_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      setSnackbar({
        open: true,
        message: 'Revenue report downloaded successfully!',
        severity: 'success'
      });
      
    } catch (error) {
      console.error('Error downloading Excel:', error);
      setSnackbar({
        open: true,
        message: 'Failed to download revenue report',
        severity: 'error'
      });
    } finally {
      setDownloading(false);
    }
  };

  // ✅ Download Doctor's Individual Report
  const downloadDoctorRevenueExcel = (doctor) => {
    try {
      const wb = XLSX.utils.book_new();

      const doctorData = [
        [`DOCTOR REVENUE REPORT - ${doctor.doctorName}`],
        ['Generated On', new Date().toLocaleString()],
        ['Period', revenuePeriod.toUpperCase()],
        ['Specialization', doctor.specialization],
        [],
        ['Metric', 'Amount (LKR)'],
        ['Total Revenue', doctor.totalRevenue || 0],
        ['Today\'s Revenue', doctor.todayRevenue || 0],
        ['Monthly Revenue', doctor.monthlyRevenue || 0],
        ['Pending Payments', doctor.pendingPayments || 0],
        [],
        ['Appointments', 'Count'],
        ['Completed Appointments', doctor.completedCount || 0],
        ['Pending Appointments', doctor.pendingCount || 0]
      ];
      
      const sheet = XLSX.utils.aoa_to_sheet(doctorData);
      XLSX.utils.book_append_sheet(wb, sheet, 'Doctor Revenue');

      const fileName = `${doctor.doctorName.replace(/\s+/g, '_')}_Revenue_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      setSnackbar({
        open: true,
        message: `${doctor.doctorName}'s report downloaded!`,
        severity: 'success'
      });
      
    } catch (error) {
      console.error('Error downloading doctor report:', error);
      setSnackbar({
        open: true,
        message: 'Failed to download doctor report',
        severity: 'error'
      });
    }
  };

  const handleViewDoctorRevenue = (doctor) => {
    setSelectedDoctor(doctor);
    setDoctorRevenueDialog(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin');
    setSnackbar({
      open: true,
      message: 'Logged out successfully',
      severity: 'success'
    });
    setTimeout(() => navigate('/admin/login'), 1000);
  };

  const handleViewAdmin = (admin) => {
    setSelectedAdmin(admin);
    setDialogMode('view');
    setOpenDialog(true);
  };

  const handleEditAdmin = (admin) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive
    });
    setDialogMode('edit');
    setOpenDialog(true);
  };

  const handleCreateAdmin = () => {
    navigate('/admin/register');
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm('Are you sure you want to deactivate this admin?')) return;
    
    try {
      const response = await api.put(`/admin/${adminId}/status`, { isActive: false });
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Admin deactivated successfully',
          severity: 'success'
        });
        fetchAllAdmins();
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to deactivate admin',
        severity: 'error'
      });
    }
  };

  const handleActivateAdmin = async (adminId) => {
    try {
      const response = await api.put(`/admin/${adminId}/status`, { isActive: true });
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Admin activated successfully',
          severity: 'success'
        });
        fetchAllAdmins();
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to activate admin',
        severity: 'error'
      });
    }
  };

  const handleDialogSubmit = async () => {
    try {
      if (dialogMode === 'edit' && selectedAdmin) {
        const response = await api.put(`/admin/${selectedAdmin._id}`, formData);
        if (response.data.success) {
          setSnackbar({
            open: true,
            message: 'Admin updated successfully',
            severity: 'success'
          });
          fetchAllAdmins();
          setOpenDialog(false);
        }
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Operation failed',
        severity: 'error'
      });
    }
  };

  const handleChangeRole = async (adminId, newRole) => {
    try {
      const response = await api.put(`/admin/${adminId}/role`, { role: newRole });
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: `Role changed to ${newRole}`,
          severity: 'success'
        });
        fetchAllAdmins();
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to change role',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleNavigation = (path, menuName) => {
    setActiveMenu(menuName);
    navigate(path);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (!admin) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" flexDirection="column">
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading admin data...
        </Typography>
      </Box>
    );
  }

  // Menu items configuration
  const menuItems = [
    {
      name: 'dashboard',
      label: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/admin/dashboard'
    },
    {
      name: 'doctors',
      label: 'Doctor Management',
      icon: <DoctorIcon />,
      subItems: [
        { name: 'add-doctor', label: 'Add Doctor', path: '/doctor/register' },
        { name: 'edit-doctors', label: 'Edit Doctors', path: '/editdoctor' }
      ]
    },
    {
      name: 'appointments',
      label: 'Appointment Management',
      icon: <AppointmentIcon />,
      path: '/appointmentsmanagement'
    },
    {
      name: 'users',
      label: 'User Management',
      icon: <UserManagementIcon />,
      subItems: [
        { name: 'view-users', label: 'View Users', path: '/usersmanagement' },
        { name: 'add-user', label: 'Add User', path: '/register' }
      ]
    },
    {
      name: 'revenue',
      label: 'Revenue Overview',
      icon: <RevenueIcon />,
      path: '/admin/revenue'
    },
    {
      name: 'admin-management',
      label: 'Admin Management',
      icon: <PeopleIcon />,
      subItems: [
        { name: 'add-admin', label: 'Add Admin', path: '/admin/register', show: admin.role === 'super_admin' },
        { name: 'view-admins', label: 'View Admins', path: '/admin/admins' }
      ]
    }
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Sidebar */}
      <Paper 
        sx={{ 
          width: 280, 
          p: 2, 
          display: 'flex', 
          flexDirection: 'column',
          borderRadius: 0,
          position: 'fixed',
          height: '100vh',
          overflowY: 'auto'
        }}
        elevation={2}
      >
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="primary" gutterBottom>
            Admin Panel
          </Typography>
          <Chip 
            icon={<PersonIcon />}
            label={admin.name}
            variant="outlined"
            sx={{ mt: 1 }}
          />
          <Chip 
            icon={admin.role === 'super_admin' ? <SuperAdminIcon /> : <PeopleIcon />}
            label={admin.role}
            color={admin.role === 'super_admin' ? 'warning' : 'default'}
            size="small"
            sx={{ mt: 1, ml: 1 }}
          />
        </Box>

        {/* Navigation Menu */}
        <List sx={{ flexGrow: 1 }}>
          {menuItems.map((item) => (
            <React.Fragment key={item.name}>
              {item.subItems ? (
                <>
                  <ListItem 
                    button 
                    selected={activeMenu === item.name}
                    onClick={() => setActiveMenu(item.name)}
                  >
                    <ListItemIcon>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItem>
                  {item.subItems.map((subItem) => (
                    (!subItem.show || subItem.show) && (
                      <ListItem 
                        key={subItem.name}
                        button 
                        sx={{ pl: 4 }}
                        selected={activeMenu === subItem.name}
                        onClick={() => handleNavigation(subItem.path, subItem.name)}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {subItem.name === 'add-doctor' || subItem.name === 'add-admin' || subItem.name === 'add-user' ? 
                            <AddIcon fontSize="small" /> : 
                            subItem.name === 'list-doctors' || subItem.name === 'view-users' || subItem.name === 'view-admins' ? 
                            <ListIcon fontSize="small" /> : 
                            <EditIcon fontSize="small" />
                          }
                        </ListItemIcon>
                        <ListItemText primary={subItem.label} />
                      </ListItem>
                    )
                  ))}
                </>
              ) : (
                <ListItem 
                  button 
                  selected={activeMenu === item.name}
                  onClick={() => handleNavigation(item.path, item.name)}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItem>
              )}
              <Divider sx={{ my: 1 }} />
            </React.Fragment>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        <Button
          startIcon={<LogoutIcon />}
          sx={{ justifyContent: 'flex-start' }}
          color="error"
          onClick={handleLogout}
          fullWidth
        >
          Logout
        </Button>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 3, ml: '280px' }}>
        <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                Admin Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Welcome back, {admin.name}!
              </Typography>
            </Box>
            
            {/* Download Button */}
            <Tooltip title="Download Revenue Report">
              <Button
                variant="contained"
                color="success"
                startIcon={<FileDownloadIcon />}
                onClick={downloadRevenueExcel}
                disabled={downloading || loadingRevenue}
                sx={{ height: 48 }}
              >
                {downloading ? 'Downloading...' : 'Download Report'}
              </Button>
            </Tooltip>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Admins
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalAdmins}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={100} 
                    sx={{ mt: 2 }}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Doctors
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalDoctors}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(stats.activeDoctors / stats.totalDoctors) * 100 || 0} 
                    color="success"
                    sx={{ mt: 2 }}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h4">
                    {formatCurrency(revenue.totalRevenue)}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={100} 
                    color="warning"
                    sx={{ mt: 2 }}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Pending Payments
                  </Typography>
                  <Typography variant="h4">
                    {formatCurrency(revenue.pendingPayments)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {revenue.pendingCount} pending appointments
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Revenue Overview Section */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Revenue Overview
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <select
                  value={revenuePeriod}
                  onChange={(e) => {
                    setRevenuePeriod(e.target.value);
                    fetchAllRevenue(e.target.value);
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ccc'
                  }}
                >
                  <option value="day">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
                <IconButton onClick={() => fetchAllRevenue(revenuePeriod)} title="Refresh">
                  <RefreshIcon />
                </IconButton>
              </Box>
            </Box>

            {loadingRevenue ? (
              <Box display="flex" justifyContent="center" alignItems="center" p={3} flexDirection="column">
                <CircularProgress />
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Loading revenue data...
                </Typography>
              </Box>
            ) : (
              <>
                {/* Revenue Stats */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ bgcolor: 'primary.light', p: 2, borderRadius: 2 }}>
                      <Typography variant="body2" color="white">Today's Revenue</Typography>
                      <Typography variant="h5" color="white" fontWeight="bold">
                        {formatCurrency(revenue.todayRevenue)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ bgcolor: 'success.light', p: 2, borderRadius: 2 }}>
                      <Typography variant="body2" color="white">Monthly Revenue</Typography>
                      <Typography variant="h5" color="white" fontWeight="bold">
                        {formatCurrency(revenue.monthlyRevenue)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ bgcolor: 'warning.light', p: 2, borderRadius: 2 }}>
                      <Typography variant="body2" color="white">Completed</Typography>
                      <Typography variant="h5" color="white" fontWeight="bold">
                        {revenue.completedCount}
                      </Typography>
                      <Typography variant="caption" color="white">appointments</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ bgcolor: 'info.light', p: 2, borderRadius: 2 }}>
                      <Typography variant="body2" color="white">Pending</Typography>
                      <Typography variant="h5" color="white" fontWeight="bold">
                        {revenue.pendingCount}
                      </Typography>
                      <Typography variant="caption" color="white">appointments</Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Revenue by Type */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Revenue by Consultation Type
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Online Consultations</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(revenue.revenueByType.online)}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={revenue.revenueByType.onlinePercentage} 
                        color="primary"
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {revenue.revenueByType.onlinePercentage}% of total
                      </Typography>
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Physical Consultations</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(revenue.revenueByType.physical)}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={revenue.revenueByType.physicalPercentage} 
                        color="success"
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {revenue.revenueByType.physicalPercentage}% of total
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </>
            )}
          </Paper>

          {/* Doctors Revenue Table */}
          <Paper sx={{ p: 2, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Doctors Revenue Breakdown
              </Typography>
              <Tooltip title="Download All Doctors Revenue">
                <IconButton 
                  color="primary" 
                  onClick={downloadRevenueExcel}
                  disabled={downloading}
                >
                  <FileDownloadIcon />
                </IconButton>
              </Tooltip>
            </Box>
            
            {loadingRevenue ? (
              <Box display="flex" justifyContent="center" alignItems="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Doctor</TableCell>
                      <TableCell>Specialization</TableCell>
                      <TableCell align="right">Total Revenue</TableCell>
                      <TableCell align="right">Today</TableCell>
                      <TableCell align="right">Monthly</TableCell>
                      <TableCell align="right">Pending</TableCell>
                      <TableCell align="right">Completed</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {revenue.revenueByDoctor.map((doctor) => (
                      <TableRow key={doctor.doctorId} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                              {doctor.doctorName?.charAt(0) || 'D'}
                            </Avatar>
                            {doctor.doctorName}
                          </Box>
                        </TableCell>
                        <TableCell>{doctor.specialization}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(doctor.totalRevenue)}
                        </TableCell>
                        <TableCell align="right">{formatCurrency(doctor.todayRevenue)}</TableCell>
                        <TableCell align="right">{formatCurrency(doctor.monthlyRevenue)}</TableCell>
                        <TableCell align="right">{formatCurrency(doctor.pendingPayments)}</TableCell>
                        <TableCell align="right">{doctor.completedCount}</TableCell>
                        <TableCell>
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small"
                              onClick={() => handleViewDoctorRevenue(doctor)}
                            >
                              <RevenueIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download Report">
                            <IconButton 
                              size="small"
                              onClick={() => downloadDoctorRevenueExcel(doctor)}
                              color="success"
                            >
                              <FileDownloadIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                    {revenue.revenueByDoctor.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                          <Typography color="text.secondary">
                            No revenue data available
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>

          {/* Quick Actions */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleNavigation('/doctor/register', 'add-doctor')}
                >
                  Add Doctor
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<DoctorIcon />}
                  onClick={() => handleNavigation('/editdoctor', 'edit-doctors')}
                >
                  Edit Doctors
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<EventIcon />}
                  onClick={() => handleNavigation('/admin/appointments', 'appointments')}
                >
                  Appointments
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<GroupIcon />}
                  onClick={() => handleNavigation('/usersmanagement', 'view-users')}
                >
                  User Management
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Admins Table */}
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Admin Management
              </Typography>
              <Box>
                <IconButton onClick={fetchAllAdmins} title="Refresh" disabled={loading}>
                  <RefreshIcon />
                </IconButton>
                {admin.role === 'super_admin' && (
                  <Button
                    startIcon={<AddIcon />}
                    variant="contained"
                    onClick={() => handleNavigation('/admin/register', 'add-admin')}
                  >
                    Add Admin
                  </Button>
                )}
              </Box>
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" p={3} flexDirection="column">
                <CircularProgress />
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Loading admins...
                </Typography>
              </Box>
            ) : admins.length === 0 ? (
              <Box display="flex" justifyContent="center" alignItems="center" p={3} flexDirection="column">
                <PeopleIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No admins found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {error || 'Try adding a new admin or check your permissions.'}
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {admins.map((adminItem) => (
                      <TableRow key={adminItem._id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                              {adminItem.name?.charAt(0) || 'A'}
                            </Avatar>
                            {adminItem.name}
                          </Box>
                        </TableCell>
                        <TableCell>{adminItem.email}</TableCell>
                        <TableCell>
                          <Chip 
                            icon={adminItem.role === 'super_admin' ? <SuperAdminIcon /> : <PeopleIcon />}
                            label={adminItem.role || 'admin'}
                            size="small"
                            color={adminItem.role === 'super_admin' ? 'warning' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            icon={adminItem.isActive ? <UnlockIcon /> : <LockIcon />}
                            label={adminItem.isActive ? 'Active' : 'Inactive'}
                            color={adminItem.isActive ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {adminItem.createdAt ? new Date(adminItem.createdAt).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            size="small" 
                            onClick={() => handleViewAdmin(adminItem)}
                            title="View"
                          >
                            <ViewIcon />
                          </IconButton>
                          {admin.role === 'super_admin' && adminItem._id !== admin._id && (
                            <>
                              <IconButton 
                                size="small" 
                                onClick={() => handleEditAdmin(adminItem)}
                                title="Edit"
                              >
                                <EditIcon />
                              </IconButton>
                              {adminItem.isActive ? (
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => handleDeleteAdmin(adminItem._id)}
                                  title="Deactivate"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              ) : (
                                <IconButton 
                                  size="small" 
                                  color="success"
                                  onClick={() => handleActivateAdmin(adminItem._id)}
                                  title="Activate"
                                >
                                  <LockOpen />
                                </IconButton>
                              )}
                              <IconButton 
                                size="small"
                                onClick={() => handleChangeRole(
                                  adminItem._id, 
                                  adminItem.role === 'super_admin' ? 'admin' : 'super_admin'
                                )}
                                title="Change Role"
                              >
                                <SettingsIcon />
                              </IconButton>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Container>
      </Box>

      {/* View/Edit Admin Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'view' ? 'Admin Details' : 'Edit Admin'}
        </DialogTitle>
        <DialogContent>
          {selectedAdmin && dialogMode === 'view' ? (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedAdmin.name}
              </Typography>
              <Typography color="text.secondary">
                Email: {selectedAdmin.email}
              </Typography>
              <Typography color="text.secondary">
                Role: {selectedAdmin.role}
              </Typography>
              <Typography color="text.secondary">
                Status: {selectedAdmin.isActive ? 'Active' : 'Inactive'}
              </Typography>
              <Typography color="text.secondary">
                Created: {selectedAdmin.createdAt ? new Date(selectedAdmin.createdAt).toLocaleString() : 'N/A'}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                margin="normal"
              />
              <TextField
                select
                fullWidth
                label="Role"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                margin="normal"
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="super_admin">Super Admin</MenuItem>
              </TextField>
              <TextField
                select
                fullWidth
                label="Status"
                value={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
                margin="normal"
              >
                <MenuItem value={true}>Active</MenuItem>
                <MenuItem value={false}>Inactive</MenuItem>
              </TextField>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Cancel
          </Button>
          {dialogMode !== 'view' && (
            <Button onClick={handleDialogSubmit} variant="contained">
              Update
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Doctor Revenue Details Dialog */}
      <Dialog open={doctorRevenueDialog} onClose={() => setDoctorRevenueDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Doctor Revenue Details
        </DialogTitle>
        <DialogContent>
          {selectedDoctor && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedDoctor.doctorName}
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                Specialization: {selectedDoctor.specialization}
              </Typography>
              
              <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, bgcolor: 'primary.light' }}>
                    <Typography variant="body2" color="white">Total Revenue</Typography>
                    <Typography variant="h6" color="white" fontWeight="bold">
                      {formatCurrency(selectedDoctor.totalRevenue)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, bgcolor: 'success.light' }}>
                    <Typography variant="body2" color="white">Monthly Revenue</Typography>
                    <Typography variant="h6" color="white" fontWeight="bold">
                      {formatCurrency(selectedDoctor.monthlyRevenue)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, bgcolor: 'warning.light' }}>
                    <Typography variant="body2" color="white">Today's Revenue</Typography>
                    <Typography variant="h6" color="white" fontWeight="bold">
                      {formatCurrency(selectedDoctor.todayRevenue)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, bgcolor: 'info.light' }}>
                    <Typography variant="body2" color="white">Pending Payments</Typography>
                    <Typography variant="h6" color="white" fontWeight="bold">
                      {formatCurrency(selectedDoctor.pendingPayments)}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Typography variant="body1" gutterBottom>
                  Appointment Statistics
                </Typography>
                <Box sx={{ display: 'flex', gap: 4 }}>
                  <Box>
                    <Typography variant="h6">{selectedDoctor.completedCount}</Typography>
                    <Typography variant="body2" color="text.secondary">Completed</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6">{selectedDoctor.pendingCount}</Typography>
                    <Typography variant="body2" color="text.secondary">Pending</Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<FileDownloadIcon />}
                  onClick={() => {
                    downloadDoctorRevenueExcel(selectedDoctor);
                    setDoctorRevenueDialog(false);
                  }}
                >
                  Download Report
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDoctorRevenueDialog(false)} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>

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
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboard;