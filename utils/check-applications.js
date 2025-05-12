const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Innovation';

// Define the Vacancy schema
const vacancySchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    requirements: { type: String, required: true },
    responsibilities: { type: String, required: true },
    skills_required: [String],
    experience_level: { type: String, required: true },
    salary_range: {
        min: Number,
        max: Number,
        currency: { type: String, default: 'MXN' }
    },
    benefits: [String],
    application_deadline: Date,
    remote_option: { type: Boolean, default: false },
    status: { type: String, default: 'Active' },
    external_postings: {
        linkedin: { type: String },
        occ: { type: String }
    },
    created_by: { type: String, required: true },
    department: { type: String, required: true }
}, { timestamps: true });

// Define the Candidate schema
const candidateSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    linkedin: { type: String },
    experience: { type: Number, required: true },
    education: { type: String, required: true },
    location: { type: String, required: true },
    skills: { type: String, required: true },
    resume: { type: String },
    status: { type: String, default: 'Pending' },
    applied_at: { type: Date, default: Date.now },
    applied_for: { type: mongoose.Schema.Types.ObjectId, ref: 'Vacancy', required: true },
    current_position: String
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Initialize models
const Vacancy = mongoose.model('Vacancy', vacancySchema);
const Candidate = mongoose.model('Candidate', candidateSchema);

async function checkApplications() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get all candidates
        const candidates = await Candidate.find().populate('applied_for', 'title');
        console.log(`Total candidates in database: ${candidates.length}`);

        // Get current date and calculate date ranges
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        const sevenDaysAhead = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));

        console.log('\nDate ranges:');
        console.log(`Now: ${now.toISOString()}`);
        console.log(`7 days ago: ${sevenDaysAgo.toISOString()}`);
        console.log(`7 days ahead: ${sevenDaysAhead.toISOString()}`);

        // Log all candidates with their applied_at dates
        console.log('\nAll candidates:');
        candidates.forEach(candidate => {
            console.log(`- ${candidate.first_name} ${candidate.last_name}`);
            console.log(`  Applied at: ${candidate.applied_at ? new Date(candidate.applied_at).toISOString() : 'No date'}`);
        });

        // Filter recent and upcoming applications
        const recentAndUpcoming = candidates.filter(candidate => {
            if (!candidate.applied_at) {
                console.log(`Candidate ${candidate._id} has no applied_at date`);
                return false;
            }
            const appliedDate = new Date(candidate.applied_at);
            const isRecent = appliedDate >= sevenDaysAgo && appliedDate <= now;
            const isUpcoming = appliedDate > now && appliedDate <= sevenDaysAhead;
            if (isRecent) console.log(`Found recent application: ${candidate.first_name} ${candidate.last_name}`);
            if (isUpcoming) console.log(`Found upcoming application: ${candidate.first_name} ${candidate.last_name}`);
            return isRecent || isUpcoming;
        });

        console.log('\nRecent and upcoming applications:');
        recentAndUpcoming.forEach(candidate => {
            console.log(`- ${candidate.first_name} ${candidate.last_name}`);
            console.log(`  Applied for: ${candidate.applied_for?.title || 'Unknown Position'}`);
            console.log(`  Applied at: ${new Date(candidate.applied_at).toISOString()}`);
            console.log(`  Status: ${candidate.status}`);
        });

        console.log(`\nTotal recent and upcoming applications: ${recentAndUpcoming.length}`);

    } catch (error) {
        console.error('Error checking applications:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

// Run the check
checkApplications(); 