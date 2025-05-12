const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Error fetching user profile' });
    }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
    try {
        const { firstName, lastName, location } = req.body;
        
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.firstName = firstName;
        user.lastName = lastName;
        user.location = location;

        await user.save();
        
        const updatedUser = await User.findById(req.user.id).select('-password');
        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Error updating user profile' });
    }
});

// Get user connections
router.get('/connections', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('connections');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.connections || {});
    } catch (error) {
        console.error('Error fetching user connections:', error);
        res.status(500).json({ message: 'Error fetching user connections' });
    }
});

// Connect LinkedIn account
router.post('/connections/linkedin', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Here you would implement the LinkedIn OAuth flow
        // For now, we'll just update the connection status
        user.connections = user.connections || {};
        user.connections.linkedin = {
            connected: true,
            profileName: req.body.profileName,
            profileId: req.body.profileId
        };

        await user.save();
        res.json(user.connections.linkedin);
    } catch (error) {
        console.error('Error connecting LinkedIn account:', error);
        res.status(500).json({ message: 'Error connecting LinkedIn account' });
    }
});

// Disconnect LinkedIn account
router.delete('/connections/linkedin', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.connections) {
            user.connections.linkedin = {
                connected: false
            };
            await user.save();
        }

        res.json({ message: 'LinkedIn account disconnected successfully' });
    } catch (error) {
        console.error('Error disconnecting LinkedIn account:', error);
        res.status(500).json({ message: 'Error disconnecting LinkedIn account' });
    }
});

// Connect OCC Mundial account
router.post('/connections/occ', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { email, password } = req.body;

        // Here you would implement the OCC Mundial authentication
        // For now, we'll just update the connection status
        user.connections = user.connections || {};
        user.connections.occ = {
            connected: true,
            email: email
        };

        await user.save();
        res.json(user.connections.occ);
    } catch (error) {
        console.error('Error connecting OCC Mundial account:', error);
        res.status(500).json({ message: 'Error connecting OCC Mundial account' });
    }
});

// Disconnect OCC Mundial account
router.delete('/connections/occ', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.connections) {
            user.connections.occ = {
                connected: false
            };
            await user.save();
        }

        res.json({ message: 'OCC Mundial account disconnected successfully' });
    } catch (error) {
        console.error('Error disconnecting OCC Mundial account:', error);
        res.status(500).json({ message: 'Error disconnecting OCC Mundial account' });
    }
});

module.exports = router; 