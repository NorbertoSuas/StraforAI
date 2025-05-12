const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { isAdmin } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// Get all HR accounts
router.get('/', isAdmin, async (req, res) => {
    try {
        const hrAccounts = await User.find({ role: 'hr' })
            .select('-password')
            .sort({ lastLogin: -1 });
        res.json(hrAccounts);
    } catch (error) {
        console.error('Error fetching HR accounts:', error);
        res.status(500).json({ message: 'Error fetching HR accounts' });
    }
});

// Delete HR account
router.delete('/:id', isAdmin, async (req, res) => {
    try {
        const account = await User.findById(req.params.id);
        if (!account || account.role !== 'hr') {
            return res.status(404).json({ message: 'HR account not found' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'HR account deleted successfully' });
    } catch (error) {
        console.error('Error deleting HR account:', error);
        res.status(500).json({ message: 'Error deleting HR account' });
    }
});

// Get HR account by ID
router.get('/:id', isAdmin, async (req, res) => {
    try {
        const account = await User.findById(req.params.id).select('-password');
        if (!account || account.role !== 'hr') {
            return res.status(404).json({ message: 'HR account not found' });
        }
        res.json(account);
    } catch (error) {
        console.error('Error fetching HR account:', error);
        res.status(500).json({ message: 'Error fetching HR account' });
    }
});

// Update HR account
router.put('/:id', isAdmin, async (req, res) => {
    try {
        const { firstName, lastName, email, password, location } = req.body;
        
        // Check if account exists and is HR
        const account = await User.findById(req.params.id);
        if (!account || account.role !== 'hr') {
            return res.status(404).json({ message: 'HR account not found' });
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
            email,
            location
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
        console.error('Error updating HR account:', error);
        res.status(500).json({ message: 'Error updating HR account' });
    }
});

module.exports = router; 