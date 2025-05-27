const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const Settings = require('../models/Settings');

// Get user settings
router.get('/', verifyToken, async (req, res) => {
    try {
        const settings = await Settings.findOne({ userId: req.user.id });
        if (!settings) {
            return res.status(404).json({ error: 'Settings not found' });
        }
        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Error fetching settings' });
    }
});

// Update company settings
router.post('/company', verifyToken, async (req, res) => {
    try {
        const { name, industry, size, location } = req.body;

        const settings = await Settings.findOneAndUpdate(
            { userId: req.user.id },
            {
                $set: {
                    company: {
                        name,
                        industry,
                        size,
                        location
                    }
                }
            },
            { new: true, upsert: true }
        );

        res.json(settings);
    } catch (error) {
        console.error('Error updating company settings:', error);
        res.status(500).json({ error: 'Error updating company settings' });
    }
});

// Get API configurations
router.get('/api-config', isAdmin, async (req, res) => {
    try {
        const settings = await Settings.findOne() || new Settings();
        res.json({
            // Return only non-API related settings
            theme: settings.theme || 'light',
            notifications: settings.notifications || true
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ message: 'Error fetching settings' });
    }
});

// Update LinkedIn configuration
router.post('/linkedin-config', isAdmin, async (req, res) => {
    try {
        const { clientId, clientSecret, redirectUri } = req.body;

        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
        }

        settings.linkedin = {
            clientId,
            clientSecret,
            redirectUri
        };

        await settings.save();
        res.json({ message: 'LinkedIn configuration updated successfully' });
    } catch (error) {
        console.error('Error updating LinkedIn configuration:', error);
        res.status(500).json({ message: 'Error updating LinkedIn configuration' });
    }
});

// Update OCC configuration
router.post('/occ-config', isAdmin, async (req, res) => {
    try {
        const { apiKey, apiSecret, environment } = req.body;

        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
        }

        settings.occ = {
            apiKey,
            apiSecret,
            environment
        };

        await settings.save();
        res.json({ message: 'OCC configuration updated successfully' });
    } catch (error) {
        console.error('Error updating OCC configuration:', error);
        res.status(500).json({ message: 'Error updating OCC configuration' });
    }
});

module.exports = router; 