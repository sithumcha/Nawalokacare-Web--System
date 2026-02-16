import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  alpha,
  useTheme,
  styled,
  Badge,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Checkbox,
  Fab,
  LinearProgress,
  Collapse
} from '@mui/material';
import {
  Search as SearchIcon,
  MedicalServices as MedicalIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Star as StarIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Assignment as AssignmentIcon,
  Receipt as ReceiptIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Today as TodayIcon,
  Event as EventIcon,
  Paid as PaidIcon,
  Chat as ChatIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Info as InfoIcon,
  CloudDownload as CloudDownloadIcon
} from '@mui/icons-material';
import { CSVLink } from 'react-csv';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

// Styled Components
const GradientCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.9)} 0%, ${alpha(theme.palette.primary.dark, 0.9)} 100%)`,
  color: 'white',
  borderRadius: '20px',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[8]
  }
}));

const StyledDoctorCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease-in-out',
  borderRadius: '20px',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  '&:hover': {
    transform: 'translateY(-12px) scale(1.02)',
    boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
    borderColor: alpha(theme.palette.primary.main, 0.4)
  },
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    borderRadius: '20px 20px 0 0'
  }
}));

const StatusBadge = styled(Chip)(({ theme, status }) => ({
  fontWeight: 700,
  minWidth: 110,
  height: 28,
  fontSize: '0.8rem',
  borderRadius: '14px',
  ...(status === 'confirmed' && {
    backgroundColor: alpha(theme.palette.success.main, 0.15),
    color: theme.palette.success.dark,
    border: `2px solid ${alpha(theme.palette.success.main, 0.3)}`,
    boxShadow: `0 2px 8px ${alpha(theme.palette.success.main, 0.2)}`
  }),
  ...(status === 'pending' && {
    backgroundColor: alpha(theme.palette.warning.main, 0.15),
    color: theme.palette.warning.dark,
    border: `2px solid ${alpha(theme.palette.warning.main, 0.3)}`,
    boxShadow: `0 2px 8px ${alpha(theme.palette.warning.main, 0.2)}`
  }),
  ...(status === 'cancelled' && {
    backgroundColor: alpha(theme.palette.error.main, 0.15),
    color: theme.palette.error.dark,
    border: `2px solid ${alpha(theme.palette.error.main, 0.3)}`,
    boxShadow: `0 2px 8px ${alpha(theme.palette.error.main, 0.2)}`
  }),
  ...(status === 'completed' && {
    backgroundColor: alpha(theme.palette.info.main, 0.15),
    color: theme.palette.info.dark,
    border: `2px solid ${alpha(theme.palette.info.main, 0.3)}`,
    boxShadow: `0 2px 8px ${alpha(theme.palette.info.main, 0.2)}`
  })
}));

const FloatingActionButton = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: 30,
  right: 30,
  zIndex: 1000,
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: 'white',
  boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: '0 12px 35px rgba(0,0,0,0.3)'
  },
  transition: 'all 0.3s ease'
}));

const DoctorsAppointmentsPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // State for Doctors
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for Appointments Dialog
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  
  // State for Appointments
  const [allAppointments, setAllAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [error, setError] = useState('');
  
  // Filter State
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    dateRange: 'all',
    consultationType: 'all',
    paymentStatus: 'all',
    sortBy: 'date',
    sortOrder: 'desc',
    minAmount: '',
    maxAmount: ''
  });
  
  // Stats State
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    completed: 0,
    revenue: 0,
    avgRating: 0,
    today: 0,
    upcoming: 0
  });
  
  // Tab State
  const [selectedTab, setSelectedTab] = useState(0);
  
  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Expanded rows for appointment details
  const [expandedRows, setExpandedRows] = useState({});
  
  // Export state
  const [exportData, setExportData] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportRange, setExportRange] = useState('filtered');
  
  // Bulk actions
  const [selectedAppointments, setSelectedAppointments] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  
  // CSV headers
  const csvHeaders = [
    { label: 'Appointment ID', key: 'appointmentNumber' },
    { label: 'Patient Name', key: 'patientDetails.fullName' },
    { label: 'Patient Email', key: 'patientDetails.email' },
    { label: 'Patient Phone', key: 'patientDetails.phoneNumber' },
    { label: 'Doctor Name', key: 'doctorName' },
    { label: 'Specialization', key: 'doctorSpecialization' },
    { label: 'Appointment Date', key: 'appointmentDate' },
    { label: 'Time Slot', key: 'timeSlot' },
    { label: 'Consultation Type', key: 'consultationType' },
    { label: 'Status', key: 'status' },
    { label: 'Fee (₹)', key: 'price' },
    { label: 'Payment Method', key: 'payment.method' },
    { label: 'Payment Status', key: 'payment.status' },
    { label: 'Created At', key: 'createdAt' },
    { label: 'Cancellation Reason', key: 'cancellationReason' },
    { label: 'Medical Concern', key: 'patientDetails.medicalConcern' }
  ];

  // API Configuration
  const API_URL = 'http://localhost:5000/api';

  // Check admin authentication
  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = () => {
    const adminToken = localStorage.getItem('admin_token');
    const adminData = localStorage.getItem('admin');
    
    if (!adminToken || !adminData) {
      navigate('/admin/login');
      return;
    }
    
    fetchDoctors();
  };

  // Fetch all doctors
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch(`${API_URL}/doctors`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        let doctorsData = [];
        
        if (data.success && data.data) {
          doctorsData = data.data;
        } else if (Array.isArray(data)) {
          doctorsData = data;
        }
        
        setDoctors(doctorsData);
        setFilteredDoctors(doctorsData);
      } else {
        throw new Error('Failed to fetch doctors');
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError('Failed to load doctors. Using demo data.');
      const mockDoctors = generateMockDoctors();
      setDoctors(mockDoctors);
      setFilteredDoctors(mockDoctors);
    } finally {
      setLoading(false);
    }
  };

  // Filter doctors based on search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredDoctors(doctors);
    } else {
      const filtered = doctors.filter(doctor =>
        `${doctor.firstName || ''} ${doctor.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.qualification?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDoctors(filtered);
    }
  }, [searchTerm, doctors]);

  // Fetch appointments for selected doctor
  const fetchDoctorAppointments = async () => {
    if (!selectedDoctor) return;

    try {
      setLoadingAppointments(true);
      setError('');
      
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch(`${API_URL}/appointments/doctor/${selectedDoctor._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        let appointmentsData = [];
        
        if (Array.isArray(data)) {
          appointmentsData = data;
        } else if (data.appointments) {
          appointmentsData = data.appointments;
        } else if (data.data) {
          appointmentsData = data.data;
        } else if (data.success && data.data) {
          appointmentsData = data.data;
        }
        
        setAllAppointments(appointmentsData);
        applyFiltersToAppointments(appointmentsData);
        
        // Calculate statistics
        calculateAppointmentStats(appointmentsData);
      } else {
        throw new Error('Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments');
      const mockData = generateMockAppointmentsData(selectedDoctor._id);
      setAllAppointments(mockData.appointments);
      applyFiltersToAppointments(mockData.appointments);
      setStats(mockData.stats);
    } finally {
      setLoadingAppointments(false);
    }
  };

  // Apply filters to appointments
  const applyFiltersToAppointments = (appointments) => {
    let filtered = [...appointments];
    
    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(apt => apt.status === filters.status);
    }
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(apt =>
        apt.patientDetails?.fullName?.toLowerCase().includes(searchLower) ||
        apt.appointmentNumber?.toLowerCase().includes(searchLower) ||
        apt.patientDetails?.phoneNumber?.includes(searchLower) ||
        apt.patientDetails?.email?.toLowerCase().includes(searchLower)
      );
    }
    
    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      switch (filters.dateRange) {
        case 'today':
          filtered = filtered.filter(apt => 
            new Date(apt.appointmentDate).toDateString() === now.toDateString()
          );
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(apt => new Date(apt.appointmentDate) >= weekAgo);
          break;
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          filtered = filtered.filter(apt => new Date(apt.appointmentDate) >= monthAgo);
          break;
      }
    }
    
    // Consultation type filter
    if (filters.consultationType !== 'all') {
      filtered = filtered.filter(apt => apt.consultationType === filters.consultationType);
    }
    
    // Payment status filter
    if (filters.paymentStatus !== 'all') {
      filtered = filtered.filter(apt => apt.payment?.status === filters.paymentStatus);
    }
    
    // Amount range filter
    if (filters.minAmount) {
      filtered = filtered.filter(apt => apt.price >= parseFloat(filters.minAmount));
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(apt => apt.price <= parseFloat(filters.maxAmount));
    }
    
    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'date':
          aValue = new Date(a.appointmentDate);
          bValue = new Date(b.appointmentDate);
          break;
        case 'fee':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'name':
          aValue = a.patientDetails?.fullName?.toLowerCase();
          bValue = b.patientDetails?.fullName?.toLowerCase();
          break;
        default:
          aValue = new Date(a.appointmentDate);
          bValue = new Date(b.appointmentDate);
      }
      
      if (filters.sortOrder === 'desc') {
        return aValue < bValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });
    
    setFilteredAppointments(filtered);
  };

  // Calculate appointment statistics
  const calculateAppointmentStats = (appointments) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    const stats = {
      total: appointments.length,
      confirmed: appointments.filter(a => a.status === 'confirmed').length,
      pending: appointments.filter(a => a.status === 'pending').length,
      cancelled: appointments.filter(a => a.status === 'cancelled').length,
      completed: appointments.filter(a => a.status === 'completed').length,
      revenue: appointments.reduce((sum, apt) => sum + (apt.price || 0), 0),
      avgRating: selectedDoctor?.rating || 0,
      today: appointments.filter(a => 
        new Date(a.appointmentDate).toDateString() === today.toDateString()
      ).length,
      upcoming: appointments.filter(a => 
        new Date(a.appointmentDate) >= tomorrow && 
        ['pending', 'confirmed'].includes(a.status)
      ).length
    };
    
    setStats(stats);
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Apply filters
  const handleApplyFilters = () => {
    applyFiltersToAppointments(allAppointments);
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      status: 'all',
      search: '',
      dateRange: 'all',
      consultationType: 'all',
      paymentStatus: 'all',
      sortBy: 'date',
      sortOrder: 'desc',
      minAmount: '',
      maxAmount: ''
    });
    applyFiltersToAppointments(allAppointments);
  };

  // Handle doctor click
  const handleViewAppointments = (doctor) => {
    setSelectedDoctor(doctor);
    setAppointmentDialogOpen(true);
    handleResetFilters();
    setSelectedTab(0);
    setSelectedAppointments([]);
    
    // Fetch appointments after a short delay
    setTimeout(() => fetchDoctorAppointments(), 100);
  };

  // Handle dialog close
  const handleCloseAppointments = () => {
    setAppointmentDialogOpen(false);
    setSelectedDoctor(null);
    setAllAppointments([]);
    setFilteredAppointments([]);
    setError('');
    setExpandedRows({});
    setSelectedAppointments([]);
  };

  // Toggle row expansion
  const toggleRowExpansion = (appointmentId) => {
    setExpandedRows(prev => ({
      ...prev,
      [appointmentId]: !prev[appointmentId]
    }));
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const minute = parseInt(minutes);
      
      if (isNaN(hour) || isNaN(minute)) return timeString;
      
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
    } catch (error) {
      return timeString;
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircleIcon fontSize="small" sx={{ color: '#10b981' }} />;
      case 'pending':
        return <PendingIcon fontSize="small" sx={{ color: '#f59e0b' }} />;
      case 'cancelled':
        return <CancelIcon fontSize="small" sx={{ color: '#ef4444' }} />;
      case 'completed':
        return <CheckCircleIcon fontSize="small" sx={{ color: '#3b82f6' }} />;
      default:
        return <PendingIcon fontSize="small" />;
    }
  };

  // Prepare export data
  const prepareExportData = () => {
    const dataToExport = exportRange === 'all' ? allAppointments : filteredAppointments;
    
    const formattedData = dataToExport.map(apt => ({
      appointmentNumber: apt.appointmentNumber || 'N/A',
      'patientDetails.fullName': apt.patientDetails?.fullName || 'N/A',
      'patientDetails.email': apt.patientDetails?.email || 'N/A',
      'patientDetails.phoneNumber': apt.patientDetails?.phoneNumber || 'N/A',
      doctorName: `Dr. ${selectedDoctor?.firstName} ${selectedDoctor?.lastName}`,
      doctorSpecialization: selectedDoctor?.specialization || 'N/A',
      appointmentDate: formatDate(apt.appointmentDate),
      timeSlot: `${formatTime(apt.timeSlot?.startTime)} - ${formatTime(apt.timeSlot?.endTime)}`,
      consultationType: apt.consultationType || 'N/A',
      status: apt.status || 'N/A',
      price: apt.price || 0,
      'payment.method': apt.payment?.method || 'N/A',
      'payment.status': apt.payment?.status || 'N/A',
      createdAt: formatDate(apt.createdAt),
      cancellationReason: apt.cancellationReason || '',
      'patientDetails.medicalConcern': apt.patientDetails?.medicalConcern || ''
    }));
    
    return formattedData;
  };

  // Export to CSV
  const handleExportCSV = () => {
    setExportLoading(true);
    const data = prepareExportData();
    setExportData(data);
    setExportLoading(false);
    setExportDialogOpen(false);
    
    setSnackbar({
      open: true,
      message: `Exported ${data.length} appointments to CSV`,
      severity: 'success'
    });
  };

  // Export to Excel
  const handleExportExcel = () => {
    setExportLoading(true);
    const data = prepareExportData();
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Appointments');
    
    const fileName = `appointments_${selectedDoctor?.firstName}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    setExportLoading(false);
    setExportDialogOpen(false);
    
    setSnackbar({
      open: true,
      message: `Exported ${data.length} appointments to Excel`,
      severity: 'success'
    });
  };

  // Handle export
  const handleExport = () => {
    switch (exportFormat) {
      case 'csv':
        handleExportCSV();
        break;
      case 'excel':
        handleExportExcel();
        break;
      default:
        handleExportCSV();
    }
  };

  // Toggle appointment selection
  const toggleAppointmentSelection = (appointmentId) => {
    setSelectedAppointments(prev => 
      prev.includes(appointmentId)
        ? prev.filter(id => id !== appointmentId)
        : [...prev, appointmentId]
    );
  };

  // Handle bulk action
  const handleBulkAction = () => {
    if (!bulkAction || selectedAppointments.length === 0) return;
    
    setSnackbar({
      open: true,
      message: `${bulkAction} action applied to ${selectedAppointments.length} appointments`,
      severity: 'success'
    });
    
    setSelectedAppointments([]);
    setBulkAction('');
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin');
    navigate('/admin/login');
  };

  // Mock data generators
  const generateMockDoctors = () => {
    return [
      {
        _id: '1',
        firstName: 'John',
        lastName: 'Smith',
        specialization: 'Cardiology',
        department: 'Heart Center',
        experience: 15,
        consultationFee: 1500,
        rating: 4.8,
        totalReviews: 124,
        email: 'john.smith@hospital.com',
        phoneNumber: '+91 9876543210',
        totalRevenue: 245000,
        totalAppointments: 163
      },
      {
        _id: '2',
        firstName: 'Sarah',
        lastName: 'Johnson',
        specialization: 'Neurology',
        department: 'Brain & Nerve Center',
        experience: 12,
        consultationFee: 1800,
        rating: 4.9,
        totalReviews: 89,
        email: 'sarah.johnson@hospital.com',
        phoneNumber: '+91 9876543211',
        totalRevenue: 198000,
        totalAppointments: 110
      },
      {
        _id: '3',
        firstName: 'Robert',
        lastName: 'Williams',
        specialization: 'Orthopedics',
        department: 'Bone & Joint Center',
        experience: 20,
        consultationFee: 2000,
        rating: 4.7,
        totalReviews: 156,
        email: 'robert.williams@hospital.com',
        phoneNumber: '+91 9876543212',
        totalRevenue: 312000,
        totalAppointments: 156
      }
    ];
  };

  const generateMockAppointmentsData = (doctorId) => {
    const mockAppointments = [];
    const statuses = ['confirmed', 'pending', 'cancelled', 'completed'];
    const consultationTypes = ['physical', 'online'];
    const patientNames = [
      'John Doe', 'Jane Smith', 'Robert Johnson', 'Emily Williams',
      'Michael Brown', 'Sarah Davis', 'David Wilson', 'Lisa Taylor'
    ];
    
    for (let i = 1; i <= 50; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const date = new Date();
      date.setDate(date.getDate() + Math.floor(Math.random() * 30) - 15);
      
      mockAppointments.push({
        _id: `apt${i}`,
        appointmentNumber: `APT${String(i).padStart(6, '0')}`,
        patientDetails: {
          fullName: patientNames[Math.floor(Math.random() * patientNames.length)],
          phoneNumber: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          email: `patient${i}@example.com`,
          medicalConcern: 'General Checkup'
        },
        appointmentDate: date.toISOString(),
        timeSlot: {
          startTime: `${9 + Math.floor(Math.random() * 8)}:${Math.random() > 0.5 ? '00' : '30'}`,
          endTime: `${10 + Math.floor(Math.random() * 8)}:${Math.random() > 0.5 ? '00' : '30'}`
        },
        consultationType: consultationTypes[Math.floor(Math.random() * consultationTypes.length)],
        status: status,
        price: 1500 + Math.floor(Math.random() * 500),
        payment: {
          method: Math.random() > 0.5 ? 'cash' : 'card',
          status: status === 'cancelled' ? 'refunded' : 'paid'
        },
        createdAt: new Date(date.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        doctorId: doctorId
      });
    }
    
    // Calculate stats
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const stats = {
      total: mockAppointments.length,
      confirmed: mockAppointments.filter(a => a.status === 'confirmed').length,
      pending: mockAppointments.filter(a => a.status === 'pending').length,
      cancelled: mockAppointments.filter(a => a.status === 'cancelled').length,
      completed: mockAppointments.filter(a => a.status === 'completed').length,
      revenue: mockAppointments.reduce((sum, apt) => sum + (apt.price || 0), 0),
      avgRating: 4.7,
      today: mockAppointments.filter(a => 
        new Date(a.appointmentDate).toDateString() === today.toDateString()
      ).length,
      upcoming: mockAppointments.filter(a => 
        new Date(a.appointmentDate) > now && 
        ['pending', 'confirmed'].includes(a.status)
      ).length
    };
    
    return {
      appointments: mockAppointments,
      stats
    };
  };

  // Calculate percentage
  const calculatePercentage = (value, total) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : 0;
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    const statusMap = ['all', 'confirmed', 'pending', 'cancelled', 'completed'];
    handleFilterChange('status', statusMap[newValue]);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Admin Dashboard
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Comprehensive Appointment Management System
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<DashboardIcon />}
              onClick={() => navigate('/admin/dashboard')}
            >
              Dashboard
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <GradientCard>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h2" sx={{ fontWeight: 800 }}>
                      {doctors.length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Doctors
                    </Typography>
                  </Box>
                  <MedicalIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={100} 
                  sx={{ mt: 2, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)' }}
                />
              </CardContent>
            </GradientCard>
          </Grid>
          {/* <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: '20px', position: 'relative', overflow: 'hidden' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h2" sx={{ fontWeight: 800, color: 'success.main' }}>
                      {stats.confirmed}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Confirmed Today
                    </Typography>
                  </Box>
                  <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', opacity: 0.3 }} />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {calculatePercentage(stats.confirmed, stats.total)}% of total
                </Typography>
              </CardContent>
            </Card>
          </Grid> */}
          {/* <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: '20px', position: 'relative', overflow: 'hidden' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h2" sx={{ fontWeight: 800, color: 'warning.main' }}>
                      {stats.upcoming}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Upcoming
                    </Typography>
                  </Box>
                  <CalendarIcon sx={{ fontSize: 48, color: 'warning.main', opacity: 0.3 }} />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Next 7 days
                </Typography>
              </CardContent>
            </Card>
          </Grid> */}
          {/* <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: '20px', position: 'relative', overflow: 'hidden' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h2" sx={{ fontWeight: 800, color: 'info.main' }}>
                      ₹{stats.revenue.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Revenue
                    </Typography>
                  </Box>
                  <PaidIcon sx={{ fontSize: 48, color: 'info.main', opacity: 0.3 }} />
                </Box> 
                 <Typography variant="caption" color="text.secondary">
                  All time earnings
                </Typography>
              </CardContent>
            </Card>
          </Grid> */}
        </Grid>

        {/* Search and Filter Bar */}
        <Card sx={{ borderRadius: '20px', mb: 4, p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="🔍 Search doctors by name, specialization, department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: alpha(theme.palette.primary.main, 0.05)
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchDoctors}
                  disabled={loading}
                  sx={{ borderRadius: '12px' }}
                >
                  Refresh
                </Button>
                <Button
                  variant="contained"
                  startIcon={<FilterIcon />}
                  onClick={() => setExportDialogOpen(true)}
                  sx={{ borderRadius: '12px', background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})` }}
                >
                  Export Tools
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Card>

        {/* Doctors Grid */}
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress size={60} />
          </Box>
        ) : filteredDoctors.length === 0 ? (
          <Box textAlign="center" py={10}>
            <MedicalIcon sx={{ fontSize: 80, color: alpha(theme.palette.text.secondary, 0.3), mb: 2 }} />
            <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
              No doctors found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {searchTerm ? 'Try a different search term' : 'Add doctors to get started'}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredDoctors.map((doctor) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={doctor._id}>
                <StyledDoctorCard>
                  <CardContent>
                    {/* Doctor Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar
                        sx={{
                          width: 70,
                          height: 70,
                          mr: 2,
                          bgcolor: 'primary.main',
                          fontSize: '2rem',
                          border: `3px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      >
                        {doctor.firstName?.charAt(0)}{doctor.lastName?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                          Dr. {doctor.firstName} {doctor.lastName}
                        </Typography>
                        <Chip
                          label={doctor.specialization}
                          color="primary"
                          size="small"
                          sx={{ mt: 1, fontWeight: 600 }}
                        />
                      </Box>
                    </Box>

                    {/* Doctor Stats */}
                    <Grid container spacing={1} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', p: 1, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: '8px' }}>
                          <Typography variant="caption" color="text.secondary">
                            Experience
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {doctor.experience} yrs
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', p: 1, bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: '8px' }}>
                          <Typography variant="caption" color="text.secondary">
                            Rating
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <StarIcon sx={{ fontSize: 14, color: 'warning.main', mr: 0.5 }} />
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {doctor.rating?.toFixed(1)}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', p: 1, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: '8px' }}>
                          <Typography variant="caption" color="text.secondary">
                            Fee
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            ₹{doctor.consultationFee}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', p: 1, bgcolor: alpha(theme.palette.warning.main, 0.05), borderRadius: '8px' }}>
                          <Typography variant="caption" color="text.secondary">
                            Appointments
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {doctor.totalAppointments || 0}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Additional Info */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Department:</strong> {doctor.department}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Email:</strong> {doctor.email}
                      </Typography>
                    </Box>
                  </CardContent>
                  
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<CalendarIcon />}
                      onClick={() => handleViewAppointments(doctor)}
                      sx={{
                        borderRadius: '12px',
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 700,
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      View All Appointments
                    </Button>
                  </CardActions>
                </StyledDoctorCard>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Floating Action Button */}
        <FloatingActionButton onClick={() => setExportDialogOpen(true)}>
          <CloudDownloadIcon />
        </FloatingActionButton>
      </Box>

      {/* Export Dialog */}
      <Dialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '20px' }
        }}
      >
        <DialogTitle sx={{ borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DownloadIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Export Appointments
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Export Format</InputLabel>
                <Select
                  value={exportFormat}
                  label="Export Format"
                  onChange={(e) => setExportFormat(e.target.value)}
                >
                  <MenuItem value="csv">CSV (Excel Compatible)</MenuItem>
                  <MenuItem value="excel">Excel (.xlsx)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Export Range</InputLabel>
                <Select
                  value={exportRange}
                  label="Export Range"
                  onChange={(e) => setExportRange(e.target.value)}
                >
                  <MenuItem value="filtered">Current Filtered Results ({filteredAppointments.length})</MenuItem>
                  <MenuItem value="all">All Appointments ({allAppointments.length})</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ borderRadius: '12px' }}>
                <Typography variant="body2">
                  <strong>Note:</strong> Export will include all appointment details including patient information, medical concerns, and payment details.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <Button onClick={() => setExportDialogOpen(false)} sx={{ borderRadius: '12px' }}>
            Cancel
          </Button>
          {exportFormat === 'csv' && (
            <CSVLink
              data={exportData}
              headers={csvHeaders}
              filename={`appointments_${selectedDoctor?.firstName}_${new Date().toISOString().split('T')[0]}.csv`}
              style={{ textDecoration: 'none' }}
            >
              <Button
                variant="contained"
                onClick={handleExportCSV}
                disabled={exportLoading}
                sx={{ borderRadius: '12px' }}
              >
                {exportLoading ? 'Preparing...' : 'Download CSV'}
              </Button>
            </CSVLink>
          )}
          {exportFormat !== 'csv' && (
            <Button
              variant="contained"
              onClick={handleExport}
              disabled={exportLoading}
              sx={{ borderRadius: '12px' }}
            >
              {exportLoading ? 'Processing...' : `Export to ${exportFormat.toUpperCase()}`}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Appointments Dialog */}
      <Dialog
        open={appointmentDialogOpen}
        onClose={handleCloseAppointments}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: '20px', 
            maxHeight: '90vh',
            minHeight: '80vh'
          }
        }}
      >
        {selectedDoctor && (
          <>
            <DialogTitle sx={{ 
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: alpha(theme.palette.primary.main, 0.04)
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ 
                  mr: 2, 
                  bgcolor: 'primary.main',
                  width: 56,
                  height: 56,
                  border: `3px solid ${alpha(theme.palette.primary.main, 0.2)}`
                }}>
                  {selectedDoctor.firstName?.charAt(0)}{selectedDoctor.lastName?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedDoctor.specialization} • {selectedDoctor.department}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  icon={<StarIcon />}
                  label={`${selectedDoctor.rating?.toFixed(1)}/5`}
                  color="warning"
                  size="small"
                />
                <IconButton onClick={handleCloseAppointments}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
              {/* Advanced Stats */}
              <Box sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  {Object.entries(stats).map(([key, value]) => (
                    <Grid item xs={6} sm={4} md={2.4} key={key}>
                      <Card sx={{ 
                        textAlign: 'center', 
                        p: 2,
                        borderRadius: '12px',
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                      }}>
                        <Typography variant="h4" sx={{ 
                          fontWeight: 800,
                          color: 
                            key === 'total' ? 'primary.main' :
                            key === 'confirmed' ? 'success.main' :
                            key === 'pending' ? 'warning.main' :
                            key === 'cancelled' ? 'error.main' : 
                            key === 'revenue' ? 'info.main' : 'text.primary'
                        }}>
                          {key === 'revenue' ? `₹${value.toLocaleString()}` : value}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                          {key === 'revenue' ? 'Total Revenue' : key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </Typography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Advanced Filters */}
              <Box sx={{ p: 3, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  <FilterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Advanced Filters & Analytics
                </Typography>
                
                <Grid container spacing={2}>
                  {/* Status Tabs */}
                  <Grid item xs={12}>
                    <Tabs value={selectedTab} onChange={handleTabChange} variant="scrollable">
                      <Tab label="All Appointments" />
                      <Tab label={
                        <Badge badgeContent={stats.confirmed} color="success" max={999}>
                          <span>Confirmed</span>
                        </Badge>
                      } />
                      <Tab label={
                        <Badge badgeContent={stats.pending} color="warning" max={999}>
                          <span>Pending</span>
                        </Badge>
                      } />
                      <Tab label={
                        <Badge badgeContent={stats.cancelled} color="error" max={999}>
                          <span>Cancelled</span>
                        </Badge>
                      } />
                      <Tab label={
                        <Badge badgeContent={stats.completed} color="info" max={999}>
                          <span>Completed</span>
                        </Badge>
                      } />
                    </Tabs>
                  </Grid>

                  {/* Search and Quick Filters */}
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      placeholder="Search patients, appointment numbers..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                      size="small"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Date Range</InputLabel>
                      <Select
                        value={filters.dateRange}
                        label="Date Range"
                        onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                      >
                        <MenuItem value="all">All Dates</MenuItem>
                        <MenuItem value="today">Today</MenuItem>
                        <MenuItem value="week">This Week</MenuItem>
                        <MenuItem value="month">This Month</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Consultation Type</InputLabel>
                      <Select
                        value={filters.consultationType}
                        label="Consultation Type"
                        onChange={(e) => handleFilterChange('consultationType', e.target.value)}
                      >
                        <MenuItem value="all">All Types</MenuItem>
                        <MenuItem value="physical">Physical</MenuItem>
                        <MenuItem value="online">Online</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Sort By</InputLabel>
                      <Select
                        value={filters.sortBy}
                        label="Sort By"
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      >
                        <MenuItem value="date">Date</MenuItem>
                        <MenuItem value="fee">Fee</MenuItem>
                        <MenuItem value="name">Patient Name</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Order</InputLabel>
                      <Select
                        value={filters.sortOrder}
                        label="Order"
                        onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                      >
                        <MenuItem value="desc">Newest First</MenuItem>
                        <MenuItem value="asc">Oldest First</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Amount Range */}
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Min Amount (₹)"
                      type="number"
                      value={filters.minAmount}
                      onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                      size="small"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Max Amount (₹)"
                      type="number"
                      value={filters.maxAmount}
                      onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                      size="small"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                    />
                  </Grid>

                  {/* Bulk Actions */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Bulk Action</InputLabel>
                        <Select
                          value={bulkAction}
                          label="Bulk Action"
                          onChange={(e) => setBulkAction(e.target.value)}
                        >
                          <MenuItem value="">Select Action</MenuItem>
                          <MenuItem value="confirm">Confirm Selected</MenuItem>
                          <MenuItem value="cancel">Cancel Selected</MenuItem>
                          <MenuItem value="complete">Mark as Complete</MenuItem>
                          <MenuItem value="export">Export Selected</MenuItem>
                        </Select>
                      </FormControl>
                      <Button
                        variant="contained"
                        onClick={handleBulkAction}
                        disabled={!bulkAction || selectedAppointments.length === 0}
                      >
                        Apply to {selectedAppointments.length} Selected
                      </Button>
                    </Box>
                  </Grid>

                  {/* Action Buttons */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        onClick={handleResetFilters}
                        startIcon={<RefreshIcon />}
                      >
                        Reset All Filters
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleApplyFilters}
                        startIcon={<FilterIcon />}
                      >
                        Apply Filters
                      </Button>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<DownloadIcon />}
                        onClick={() => {
                          setExportFormat('csv');
                          setExportRange('filtered');
                          setExportDialogOpen(true);
                        }}
                      >
                        Export Results
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Appointments Table */}
              <Box sx={{ p: 3 }}>
                {loadingAppointments ? (
                  <Box display="flex" justifyContent="center" py={6}>
                    <CircularProgress />
                  </Box>
                ) : filteredAppointments.length === 0 ? (
                  <Box textAlign="center" py={6}>
                    <AssignmentIcon sx={{ fontSize: 60, color: alpha(theme.palette.text.secondary, 0.3), mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No appointments found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Try adjusting your filters or check back later
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <TableContainer component={Paper} sx={{ 
                      maxHeight: 500,
                      borderRadius: '12px',
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                    }}>
                      <Table stickyHeader>
                        <TableHead>
                          <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                            <TableCell sx={{ fontWeight: 800, width: 50 }}>
                              <Checkbox
                                indeterminate={
                                  selectedAppointments.length > 0 && 
                                  selectedAppointments.length < filteredAppointments.length
                                }
                                checked={selectedAppointments.length === filteredAppointments.length}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedAppointments(filteredAppointments.map(apt => apt._id));
                                  } else {
                                    setSelectedAppointments([]);
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>#</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Appointment Details</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Patient Information</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Date & Time</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Consultation</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Financials</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredAppointments.map((appointment, index) => (
                            <React.Fragment key={appointment._id}>
                              <TableRow hover sx={{ 
                                backgroundColor: selectedAppointments.includes(appointment._id) 
                                  ? alpha(theme.palette.primary.main, 0.08)
                                  : 'inherit'
                              }}>
                                <TableCell>
                                  <Checkbox
                                    checked={selectedAppointments.includes(appointment._id)}
                                    onChange={() => toggleAppointmentSelection(appointment._id)}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" color="text.secondary">
                                    {index + 1}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                                      {appointment.appointmentNumber}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      ID: {appointment._id?.substring(0, 8)}...
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Avatar sx={{ 
                                      mr: 2, 
                                      bgcolor: 'primary.main', 
                                      width: 36, 
                                      height: 36,
                                      border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`
                                    }}>
                                      {appointment.patientDetails?.fullName?.charAt(0) || 'P'}
                                    </Avatar>
                                    <Box>
                                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                        {appointment.patientDetails?.fullName || 'N/A'}
                                      </Typography>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PhoneIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                                        <Typography variant="caption" color="text.secondary">
                                          {appointment.patientDetails?.phoneNumber || 'No phone'}
                                        </Typography>
                                      </Box>
                                      {appointment.patientDetails?.email && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                          <EmailIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                                          <Typography variant="caption" color="text.secondary">
                                            {appointment.patientDetails.email}
                                          </Typography>
                                        </Box>
                                      )}
                                    </Box>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                      {formatDate(appointment.appointmentDate)}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                      <TimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                      <Typography variant="caption" color="text.secondary">
                                        {formatTime(appointment.timeSlot?.startTime)} - {formatTime(appointment.timeSlot?.endTime)}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    icon={appointment.consultationType === 'online' ? '💻' : '🏥'}
                                    label={appointment.consultationType === 'online' ? 'Online' : 'Physical'}
                                    size="small"
                                    color={appointment.consultationType === 'online' ? 'primary' : 'secondary'}
                                    sx={{ fontWeight: 600 }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <StatusBadge
                                    icon={getStatusIcon(appointment.status)}
                                    label={appointment.status?.toUpperCase()}
                                    status={appointment.status}
                                  />
                                  {appointment.cancellationReason && (
                                    <Tooltip title={`Reason: ${appointment.cancellationReason}`}>
                                      <InfoIcon sx={{ ml: 1, fontSize: 16, color: 'error.main', cursor: 'pointer' }} />
                                    </Tooltip>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'success.main' }}>
                                      ₹{appointment.price || 0}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {appointment.payment?.method || 'Cash'} • {appointment.payment?.status || 'Pending'}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Tooltip title="View Details">
                                      <IconButton 
                                        size="small" 
                                        onClick={() => toggleRowExpansion(appointment._id)}
                                        sx={{ 
                                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                          '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.2) }
                                        }}
                                      >
                                        {expandedRows[appointment._id] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Quick Actions">
                                      <IconButton size="small">
                                        <MoreVertIcon />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </TableCell>
                              </TableRow>
                              
                              {/* Expanded Row */}
                              <TableRow>
                                <TableCell colSpan={9} sx={{ py: 0, border: 0 }}>
                                  <Collapse in={expandedRows[appointment._id]} timeout="auto" unmountOnExit>
                                    <Box sx={{ 
                                      p: 3, 
                                      backgroundColor: alpha(theme.palette.primary.main, 0.03),
                                      borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                                    }}>
                                      <Grid container spacing={2}>
                                        <Grid item xs={12} md={6}>
                                          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                                            Patient Medical Information
                                          </Typography>
                                          <Box sx={{ pl: 2 }}>
                                            <Typography variant="body2">
                                              <strong>Medical Concern:</strong> {appointment.patientDetails?.medicalConcern || 'Not specified'}
                                            </Typography>
                                            <Typography variant="body2" sx={{ mt: 1 }}>
                                              <strong>Previous Conditions:</strong> {appointment.patientDetails?.previousConditions || 'None'}
                                            </Typography>
                                            <Typography variant="body2" sx={{ mt: 1 }}>
                                              <strong>Allergies:</strong> {appointment.patientDetails?.allergies || 'None reported'}
                                            </Typography>
                                          </Box>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                                            Appointment Details
                                          </Typography>
                                          <Box sx={{ pl: 2 }}>
                                            <Typography variant="body2">
                                              <strong>Created:</strong> {formatDate(appointment.createdAt)}
                                            </Typography>
                                            <Typography variant="body2" sx={{ mt: 1 }}>
                                              <strong>Last Updated:</strong> {formatDate(appointment.updatedAt || appointment.createdAt)}
                                            </Typography>
                                            {appointment.notes && (
                                              <Typography variant="body2" sx={{ mt: 1 }}>
                                                <strong>Notes:</strong> {appointment.notes}
                                              </Typography>
                                            )}
                                          </Box>
                                        </Grid>
                                        <Grid item xs={12}>
                                          <Box sx={{ display: 'flex', gap: 2, mt: 2, pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                                            <Button size="small" startIcon={<EditIcon />}>
                                              Edit Appointment
                                            </Button>
                                            <Button size="small" startIcon={<ChatIcon />} color="secondary">
                                              Open Chat
                                            </Button>
                                            <Button size="small" startIcon={<ReceiptIcon />} color="success">
                                              Generate Invoice
                                            </Button>
                                            <Button size="small" startIcon={<DeleteIcon />} color="error">
                                              Delete
                                            </Button>
                                          </Box>
                                        </Grid>
                                      </Grid>
                                    </Box>
                                  </Collapse>
                                </TableCell>
                              </TableRow>
                            </React.Fragment>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {/* Summary Footer */}
                    <Box sx={{ 
                      mt: 3, 
                      p: 2, 
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      borderRadius: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Typography variant="body2" color="text.secondary">
                        Showing {filteredAppointments.length} of {allAppointments.length} appointments
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>
                        Total Revenue: ₹{filteredAppointments.reduce((sum, apt) => sum + (apt.price || 0), 0).toLocaleString()}
                      </Typography>
                    </Box>
                  </>
                )}
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {selectedAppointments.length} appointments selected
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button onClick={handleCloseAppointments}>
                    Close
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<RefreshIcon />}
                    onClick={fetchDoctorAppointments}
                    disabled={loadingAppointments}
                  >
                    Refresh
                  </Button>
                </Box>
              </Box>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: '12px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DoctorsAppointmentsPage;