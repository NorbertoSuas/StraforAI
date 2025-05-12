const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function createAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Innovation');
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'norberto.suaste@outlook.com' });
        if (existingAdmin) {
            console.log('Admin account already exists');
            process.exit(0);
        }

        // Create admin user
        const admin = new User({
            firstName: 'Norberto',
            lastName: 'Suaste',
            email: 'norberto.suaste@outlook.com',
            password: '3088785Nsh',
            role: 'admin',
            location: {
                city: 'Monterrey',
                country: 'Mexico'
            }
        });

        await admin.save();
        console.log('Admin account created successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin account:', error);
        process.exit(1);
    }
}

createAdmin(); 