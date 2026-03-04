const Admin = require('../models/Admin');
const { generateToken, verifyToken } = require('../utils/tokenUtils');

// Register
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if exists
        const adminExists = await Admin.findOne({ email });
        if (adminExists) {
            return res.status(400).json({
                success: false,
                message: 'Admin already exists'
            });
        }

        // Create admin
        const admin = await Admin.create({
            name,
            email,
            password
        });

        // Generate token
        const token = generateToken(admin._id);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find admin
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(admin._id);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};


exports.getAllAdmins = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        // Remove super admin check - allow all admins
        // const requestingAdmin = await Admin.findById(decoded.id);
        // if (!requestingAdmin) {
        //     return res.status(404).json({
        //         success: false,
        //         message: 'Admin not found'
        //     });
        // }
        
        // // Only super_admin can get all admins
        // if (requestingAdmin.role !== 'super_admin') {
        //     return res.status(403).json({
        //         success: false,
        //         message: 'Access denied. Super admin only.'
        //     });
        // }

        const admins = await Admin.find().select('-password');
        
        res.status(200).json({
            success: true,
            count: admins.length,
            data: admins
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// ======================
// GET ADMIN BY ID
// ======================
exports.getAdminById = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const { id } = req.params;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        // Verify token
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        // Find requesting admin
        const requestingAdmin = await Admin.findById(decoded.id);
        if (!requestingAdmin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        // Check permissions - allow if same admin or super admin
        if (id !== decoded.id && requestingAdmin.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Find admin by ID
        const admin = await Admin.findById(id).select('-password');
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        res.json({
            success: true,
            data: admin
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// ======================
// GET PROFILE (Current Admin)
// ======================
exports.getProfile = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        // Verify token
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        // Find admin
        const admin = await Admin.findById(decoded.id).select('-password');
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        res.json({
            success: true,
            data: admin
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// ======================
// UPDATE PROFILE (Current Admin)
// ======================
exports.updateProfile = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const { name, email } = req.body;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        // Verify token
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        // Update admin
        const admin = await Admin.findByIdAndUpdate(
            decoded.id,
            { name, email },
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: admin
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// ======================
// UPDATE ADMIN BY ID (Super Admin Only)
// ======================
exports.updateAdminById = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const { id } = req.params;
        const updateData = req.body;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        // Verify token
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        // Find requesting admin
        const requestingAdmin = await Admin.findById(decoded.id);
        if (!requestingAdmin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        // Check if super admin
        if (requestingAdmin.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Super admin only.'
            });
        }

        // Don't allow password update through this route
        if (updateData.password) {
            delete updateData.password;
        }

        // Update admin by ID
        const admin = await Admin.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        res.json({
            success: true,
            message: 'Admin updated successfully',
            data: admin
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// ======================
// CHANGE ADMIN STATUS (Activate/Deactivate)
// ======================
exports.changeAdminStatus = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const { id } = req.params;
        const { isActive } = req.body;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        // Verify token
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        // Find requesting admin
        const requestingAdmin = await Admin.findById(decoded.id);
        if (!requestingAdmin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        // Check if super admin
        if (requestingAdmin.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Super admin only.'
            });
        }

        // Cannot change own status
        if (id === decoded.id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot change your own status'
            });
        }

        // Update status
        const admin = await Admin.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        ).select('-password');

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        res.json({
            success: true,
            message: `Admin ${isActive ? 'activated' : 'deactivated'} successfully`,
            data: admin
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// ======================
// LOGOUT
// ======================
exports.logout = (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
};