const express = require('express');
const router = express.Router();
const Settings = require('../../models/settings');
const LinkedIn = require('node-linkedin');
const { isAdmin } = require('../../middleware/auth');
const axios = require('axios');

// Initialize LinkedIn
const linkedin = new LinkedIn(
    process.env.LINKEDIN_CLIENT_ID,
    process.env.LINKEDIN_CLIENT_SECRET,
    process.env.LINKEDIN_REDIRECT_URI
);

// Get integration settings
router.get('/', isAdmin, async (req, res) => {
    try {
        const settings = await Settings.findOne();
        
        // Remove sensitive data before sending to client
        const safeSettings = {
            linkedin: {
                connected: settings?.linkedin?.connected || false,
                email: settings?.linkedin?.email,
                companyPages: settings?.linkedin?.companyPages || [],
                selectedCompanyPage: settings?.linkedin?.selectedCompanyPage
            },
            occ: {
                connected: settings?.occ?.connected || false,
                companyId: settings?.occ?.companyId
            }
        };

        res.json(safeSettings);
    } catch (error) {
        console.error('Error fetching integration settings:', error);
        res.status(500).json({ error: 'Error fetching integration settings' });
    }
});

// LinkedIn OAuth callback
router.get('/linkedin/callback', isAdmin, async (req, res) => {
    try {
        const { code } = req.query;
        const { accessToken, refreshToken, expiresIn } = await linkedin.getAccessToken(code);
        
        const profile = await linkedin.people.me();
        
        await Settings.findOneAndUpdate(
            {},
            {
                $set: {
                    'linkedin.connected': true,
                    'linkedin.accessToken': accessToken,
                    'linkedin.refreshToken': refreshToken,
                    'linkedin.expiresAt': new Date(Date.now() + expiresIn * 1000),
                    'linkedin.email': profile.emailAddress
                }
            },
            { upsert: true }
        );

        res.redirect('/admin/integrations');
    } catch (error) {
        console.error('Error connecting LinkedIn:', error);
        res.status(500).json({ error: 'Error connecting LinkedIn' });
    }
});

// Disconnect LinkedIn
router.post('/linkedin/disconnect', isAdmin, async (req, res) => {
    try {
        await Settings.findOneAndUpdate(
            {},
            {
                $set: {
                    'linkedin.connected': false,
                    'linkedin.accessToken': null,
                    'linkedin.refreshToken': null,
                    'linkedin.email': null,
                    'linkedin.companyPages': [],
                    'linkedin.selectedCompanyPage': null
                }
            }
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error disconnecting LinkedIn:', error);
        res.status(500).json({ error: 'Error disconnecting LinkedIn' });
    }
});

// Update LinkedIn company page selection
router.post('/linkedin/company', isAdmin, async (req, res) => {
    try {
        const { companyPageId } = req.body;

        await Settings.findOneAndUpdate(
            {},
            { $set: { 'linkedin.selectedCompanyPage': companyPageId } }
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating LinkedIn company page:', error);
        res.status(500).json({ error: 'Error updating LinkedIn company page' });
    }
});

// Save OCC credentials
router.post('/occ', isAdmin, async (req, res) => {
    try {
        const { apiKey, apiSecret, companyId } = req.body;

        // Validate credentials with OCC API
        try {
            const response = await axios.post(`${process.env.OCC_API_URL}/auth/validate`, {
                apiKey,
                apiSecret
            });

            if (!response.data.valid) {
                throw new Error('Invalid OCC credentials');
            }
        } catch (error) {
            throw new Error('Failed to validate OCC credentials');
        }

        await Settings.findOneAndUpdate(
            {},
            {
                $set: {
                    'occ.connected': true,
                    'occ.apiKey': apiKey,
                    'occ.apiSecret': apiSecret,
                    'occ.companyId': companyId
                }
            },
            { upsert: true }
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error saving OCC credentials:', error);
        res.status(500).json({ error: 'Error saving OCC credentials' });
    }
});

// Disconnect OCC
router.post('/occ/disconnect', isAdmin, async (req, res) => {
    try {
        await Settings.findOneAndUpdate(
            {},
            {
                $set: {
                    'occ.connected': false,
                    'occ.apiKey': null,
                    'occ.apiSecret': null,
                    'occ.companyId': null
                }
            }
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error disconnecting OCC:', error);
        res.status(500).json({ error: 'Error disconnecting OCC' });
    }
});

module.exports = router; 