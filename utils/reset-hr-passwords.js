const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/innovation';

// HR accounts to reset
const hrAccounts = [
    {
        email: 'rayado39@gmail.com',
        password: 'hr123456'
    },
    {
        email: 'al03085094@tecmilenio.mx',
        password: 'hr123456'
    }
];

async function resetPasswords() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Reset passwords for each HR account
        for (const account of hrAccounts) {
            const hashedPassword = await bcrypt.hash(account.password, 10);
            const user = await User.findOneAndUpdate(
                { email: account.email },
                { 
                    $set: { 
                        password: hashedPassword,
                        active: true
                    } 
                },
                { new: true }
            );
            
            if (user) {
                console.log(`Password reset successful for ${account.email}`);
                console.log(`New password: ${account.password}`);
            } else {
                console.log(`User not found: ${account.email}`);
            }
        }

        console.log('\nAll HR account passwords have been reset.');
        console.log('You can now log in with these credentials:');
        hrAccounts.forEach(account => {
            console.log(`\nEmail: ${account.email}`);
            console.log(`Password: ${account.password}`);
        });

    } catch (error) {
        console.error('Error resetting passwords:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

// Run the password reset
resetPasswords(); 