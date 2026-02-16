const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Public routes
router.post('/register', adminController.register);
router.post('/login', adminController.login);

// Protected routes
router.get('/profile', adminController.getProfile);              // GET own profile
router.put('/profile', adminController.updateProfile);          // UPDATE own profile
router.get('/all', adminController.getAllAdmins);               // GET all admins
router.get('/:id', adminController.getAdminById);               // GET admin by ID
router.put('/:id', adminController.updateAdminById);            // UPDATE admin by ID
router.put('/:id/status', adminController.changeAdminStatus);   // CHANGE status
router.post('/logout', adminController.logout);                 // LOGOUT

module.exports = router;