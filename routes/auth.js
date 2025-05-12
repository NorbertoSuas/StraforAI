const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { verifyToken, isAdmin } = require('../middleware/auth');
require('dotenv').config();

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for:', email);
        
        if (!email || !password) {
            console.log('Missing credentials');
            return res.status(400).json({ 
                message: 'Missing credentials',
                details: 'Both email and password are required'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            console.log('User not found:', email);
            return res.status(401).json({ 
                message: 'Invalid credentials',
                details: 'Email or password is incorrect'
            });
        }

        console.log('User found:', {
            email: user.email,
            role: user.role,
            active: user.active
        });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Invalid password for:', email);
            return res.status(401).json({ 
                message: 'Invalid credentials',
                details: 'Email or password is incorrect'
            });
        }

        // Update lastLogin and loggedOut status
        await User.findOneAndUpdate(
            { _id: user._id },
            { 
                $set: { 
                    lastLogin: new Date(),
                    loggedOut: false
                }
            },
            { 
                new: true,
                runValidators: false
            }
        );

        const token = jwt.sign(
            { 
                id: user._id,
                email: user.email,
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('Login successful for:', email);
        res.json({
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            },
            message: 'Login successful'
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'An error occurred during login',
            details: error.message || 'Please try again later'
        });
    }
});

// Register route (protected for admin only)
router.post('/register', isAdmin, async (req, res) => {
    try {
        const { firstName, lastName, email, password, role, location } = req.body;
        console.log('Registration attempt for:', email);

        // Validate all required fields
        const requiredFields = ['firstName', 'lastName', 'email', 'password', 'role'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                details: `Missing fields: ${missingFields.join(', ')}`
            });
        }

        // Validate location object for HR role
        if (role === 'hr') {
            if (!location || typeof location !== 'object') {
                return res.status(400).json({ 
                    message: 'Invalid location format',
                    details: 'Location must be an object with country and city'
                });
            }
            
            if (!location.country || !location.city) {
                return res.status(400).json({ 
                    message: 'Missing location information',
                    details: 'Country and city are required for HR accounts'
                });
            }
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                message: 'Invalid email format',
                details: 'Please enter a valid email address'
            });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({ 
                message: 'Invalid password',
                details: 'Password must be at least 6 characters long'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                message: 'Email already registered',
                details: 'Please use a different email address'
            });
        }

        // Create new user
        const user = new User({
            firstName,
            lastName,
            email,
            password,
            role,
            location: role === 'hr' ? location : undefined
        });

        await user.save();
        console.log('Registration successful for:', email);

        // Create JWT token
        const token = jwt.sign(
            { 
                id: user._id,
                email: user.email,
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Send response
        res.status(201).json({
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            },
            message: 'User registered successfully'
        });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Validation error', 
                details: Object.values(error.errors).map(err => err.message).join(', ')
            });
        }
        res.status(500).json({ 
            message: 'An error occurred during registration',
            details: error.message
        });
    }
});

// Get list of countries (no auth required)
router.get('/countries', (req, res) => {
    const countries = [
        "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
        "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina",
        "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic",
        "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Democratic Republic of the Congo",
        "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia",
        "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala",
        "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
        "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia",
        "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives",
        "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro",
        "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea",
        "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines",
        "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines",
        "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia",
        "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden",
        "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia",
        "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
        "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
    ];
    res.json(countries);
});

// Logout route
router.post('/logout', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Update lastLogin and set loggedOut status
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { 
                $set: { 
                    loggedOut: true
                }
            },
            { 
                new: true,
                runValidators: false
            }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ 
            message: 'Logged out successfully',
            status: 'logged_out'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ 
            message: 'An error occurred during logout',
            details: error.message || 'Please try again later'
        });
    }
});

// Test route to verify the router is working
router.get('/test', (req, res) => {
    res.json({ message: 'Auth router is working' });
});

module.exports = {
    router,
    verifyToken,
    isAdmin
}; 