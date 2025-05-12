const jwt = require('jsonwebtoken');
require('dotenv').config();

// Verify JWT token middleware
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Get token from Bearer header

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Ensure the user object has the same structure as when created
        req.user = {
            id: decoded.id, // Match the token payload structure
            email: decoded.email,
            role: decoded.role
        };
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user && req.user.role === 'admin') {
            next();
        } else {
            res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }
    });
};

// Check if user is HR
const isHR = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user && (req.user.role === 'hr' || req.user.role === 'admin')) {
            next();
        } else {
            res.status(403).json({ message: 'Access denied. HR privileges required.' });
        }
    });
};

module.exports = {
    verifyToken,
    isAdmin,
    isHR
}; 