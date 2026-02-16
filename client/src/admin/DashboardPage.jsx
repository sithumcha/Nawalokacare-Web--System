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
  Divider
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
  Group as GroupIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAdmins: 0,
    activeAdmins: 0,
    superAdmins: 0
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
      // Verify token by fetching profile
      const response = await api.get('/admin/profile');
      if (response.data.success) {
        setAdmin(response.data.data);
        localStorage.setItem('admin', JSON.stringify(response.data.data));
        fetchAllAdmins();
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
        
        setStats({
          totalAdmins: total,
          activeAdmins: active,
          superAdmins: superAdmins
        });
        
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

  // Navigation handlers
  const handleNavigation = (path, menuName) => {
    setActiveMenu(menuName);
    navigate(path);
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
        // { name: 'list-doctors', label: 'View All Doctors', path: '/editdoctor' },
        { name: 'edit-doctors', label: 'Edit Doctors', path: '/editdoctor' }
      ]
    },
    {
      name: 'appointments',
      label: 'Appointment Management',
      icon: <AppointmentIcon />,
      path: '/admin/appointments'
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
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Admin Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome back, {admin.name}!
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
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
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Active Admins
                  </Typography>
                  <Typography variant="h4">
                    {stats.activeAdmins}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(stats.activeAdmins / stats.totalAdmins) * 100 || 0} 
                    color="success"
                    sx={{ mt: 2 }}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Super Admins
                  </Typography>
                  <Typography variant="h4">
                    {stats.superAdmins}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(stats.superAdmins / stats.totalAdmins) * 100 || 0} 
                    color="warning"
                    sx={{ mt: 2 }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

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
                  onClick={() => handleNavigation('/admin/doctors/add', 'add-doctor')}
                >
                  Add Doctor
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<DoctorIcon />}
                  onClick={() => handleNavigation('/admin/doctors', 'list-doctors')}
                >
                  View Doctors
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
                  onClick={() => handleNavigation('/admin/users', 'view-users')}
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

      {/* View/Edit Dialog */}
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