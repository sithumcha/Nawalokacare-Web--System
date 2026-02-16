const jwt = require('jsonwebtoken');

const generateToken = (adminId) => {
    return jwt.sign(
        { id: adminId },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

module.exports = {
    generateToken,
    verifyToken
};