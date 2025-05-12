const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { isAdmin } = require('../middleware/auth');

// Get all admin accounts
router.get('/', isAdmin, async (req, res) => {
    try {
        const adminAccounts = await User.find({ role: 'admin' })
            .select('-password')
            .sort({ lastLogin: -1 });
        res.json(adminAccounts);
    } catch (error) {
        console.error('Error fetching admin accounts:', error);
        res.status(500).json({ message: 'Error fetching admin accounts' });
    }
});

// Create new admin account
router.post('/', isAdmin, async (req, res) => {
    try {
        const { firstName, lastName, email, password, location } = req.body;
        
        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const newAdmin = new User({
            firstName,
            lastName,
            email,
            password,
            role: 'admin',
            location
        });

        await newAdmin.save();
        
        const adminResponse = { ...newAdmin.toObject() };
        delete adminResponse.password;
        
        res.status(201).json(adminResponse);
    } catch (error) {
        console.error('Error creating admin account:', error);
        res.status(500).json({ message: 'Error creating admin account' });
    }
});

// Update admin account
router.put('/:id', isAdmin, async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        
        // Check if account exists and is admin
        const account = await User.findById(req.params.id);
        if (!account || account.role !== 'admin') {
            return res.status(404).json({ message: 'Admin account not found' });
        }

        // Check if email is being changed and if it's already taken
        if (email !== account.email) {
            const emailExists = await User.findOne({ email, _id: { $ne: req.params.id } });
            if (emailExists) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        // Update the account
        const updateData = {
            firstName,
            lastName,
            email
        };

        // Only update password if provided
        if (password) {
            updateData.password = password;
        }

        const updatedAccount = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).select('-password');

        res.json(updatedAccount);
    } catch (error) {
        console.error('Error updating admin account:', error);
        res.status(500).json({ message: 'Error updating admin account' });
    }
});

// Delete admin account
router.delete('/:id', isAdmin, async (req, res) => {
    try {
        const account = await User.findById(req.params.id);
        if (!account || account.role !== 'admin') {
            return res.status(404).json({ message: 'Admin account not found' });
        }

        // Prevent deleting the last admin account
        const adminCount = await User.countDocuments({ role: 'admin' });
        if (adminCount <= 1) {
            return res.status(400).json({ message: 'Cannot delete the last admin account' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Admin account deleted successfully' });
    } catch (error) {
        console.error('Error deleting admin account:', error);
        res.status(500).json({ message: 'Error deleting admin account' });
    }
});

// Get admin account by ID
router.get('/:id', isAdmin, async (req, res) => {
    try {
        const account = await User.findById(req.params.id).select('-password');
        if (!account || account.role !== 'admin') {
            return res.status(404).json({ message: 'Admin account not found' });
        }
        res.json(account);
    } catch (error) {
        console.error('Error fetching admin account:', error);
        res.status(500).json({ message: 'Error fetching admin account' });
    }
});

module.exports = router; 
module.exports = router; 