const mongoose = require('mongoose');
require('dotenv').config();

async function fixDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Innovation');
        console.log('Connected to MongoDB');

        // Get the users collection
        const usersCollection = mongoose.connection.collection('users');

        // Drop the username index
        await usersCollection.dropIndex('username_1');
        console.log('Successfully dropped username index');

        // List remaining indexes
        const indexes = await usersCollection.indexes();
        console.log('Current indexes:', indexes);

        process.exit(0);
    } catch (error) {
        console.error('Error fixing database:', error);
        if (error.code === 26) {
            console.log('Index not found - database is already fixed');
            process.exit(0);
        }
        process.exit(1);
    }
}

fixDatabase(); 