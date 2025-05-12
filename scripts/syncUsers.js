const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function syncUsers() {
    try {
        // Connect to MongoDB using the existing Innovation database
        await mongoose.connect('mongodb://127.0.0.1:27017/Innovation');
        console.log('Connected to MongoDB');

        // Clear existing users
        await User.deleteMany({});
        console.log('Cleared existing users');

        // Create users
        const users = [
            {
                firstName: 'Norberto',
                lastName: 'Suaste',
                email: 'norberto.suaste@outlook.com',
                password: '3088785Nsh',
                role: 'admin',
                location: {
                    city: 'Monterrey',
                    country: 'Mexico'
                }
            },
            {
                firstName: 'HR',
                lastName: 'Admin',
                email: 'hradmin@tecmahindra.com',
                password: 'hradmin123',
                role: 'hr',
                location: {
                    city: 'Monterrey',
                    country: 'Mexico'
                }
            }
        ];

        // Insert users
        for (const userData of users) {
            const user = new User(userData);
            await user.save();
            console.log(`Created user: ${userData.email}`);
        }

        console.log('Successfully synced users');
        process.exit(0);
    } catch (error) {
        console.error('Error syncing users:', error);
        process.exit(1);
    }
}

syncUsers(); 