const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const multer = require('multer');
const settingsRoutes = require('./routes/settings');
const adminAccountsRoutes = require('./routes/admin-accounts');
const userRoutes = require('./routes/user');
const fs = require('fs');
const CandidateMatcher = require('./AI_model/CandidateMatcher');
const { router: authRoutes } = require('./routes/auth');
const hrAccountRoutes = require('./routes/hr-accounts');
const countriesRoutes = require('./routes/countries');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
    origin: true,  // Allow all origins during development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    optionsSuccessStatus: 200
}));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// MongoDB connection with retry logic
const MONGODB_URI = 'mongodb://127.0.0.1:27017/Innovation';
const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000; // 5 seconds

// Create resumes directory if it doesn't exist
const resumesDir = path.join(__dirname, 'frontend', 'resumes');
if (!fs.existsSync(resumesDir)) {
    fs.mkdirSync(resumesDir, { recursive: true });
}

// Define Schemas
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
    current_position: String,
    hiring_feedback: String,
    ai_feedback_analysis: { type: mongoose.Schema.Types.Mixed }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

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

// Initialize models
const Vacancy = mongoose.model('Vacancy', vacancySchema);
const Candidate = mongoose.model('Candidate', candidateSchema);

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'frontend', 'resumes'))
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `resume_${uniqueSuffix}${ext}`);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.pdf', '.doc', '.docx'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/hr-accounts', hrAccountRoutes);
app.use('/api/admin-accounts', adminAccountsRoutes);
app.use('/api/countries', countriesRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/user', userRoutes);

// Resume upload endpoint
app.post('/api/candidates/upload', upload.single('resume'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Return the path of the uploaded file
        res.json({
            path: req.file.filename,
            message: 'Resume uploaded successfully'
        });
    } catch (error) {
        console.error('Error uploading resume:', error);
        res.status(500).json({ 
            error: 'Error uploading resume',
            details: error.message 
        });
    }
});

// Countries endpoint
app.get('/api/countries', (req, res) => {
    const countries = [
        "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
        "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina",
        "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic",
        "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Democratic Republic of the Congo",
        "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia",
        "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala",
        "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
        "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia",
        "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives",
        "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro",
        "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea",
        "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines",
        "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
        "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia",
        "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden",
        "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia",
        "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
        "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
    ];
    res.json(countries);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.json({
        status: 'ok',
        mongodb: mongoStatus,
        timestamp: new Date()
    });
});

// Vacancies endpoints
app.get('/api/vacancies', async (req, res) => {
    try {
        const {
            department,
            location,
            type,
            salaryMin,
            salaryMax,
            skills,
            search
        } = req.query;

        // Build MongoDB query
        const query = {};
        if (department) query.department = department;
        if (location) query.location = location;
        if (type) query.type = type;
        if (salaryMin || salaryMax) {
            query['salary_range.min'] = salaryMin ? { $gte: Number(salaryMin) } : { $exists: true };
            query['salary_range.max'] = salaryMax ? { ...query['salary_range.min'], $lte: Number(salaryMax) } : query['salary_range.min'];
        }
        if (skills) {
            // skills can be comma-separated
            const skillsArr = Array.isArray(skills) ? skills : skills.split(',');
            query.skills_required = { $all: skillsArr };
        }
        if (search) {
            const regex = new RegExp(search, 'i');
            query.$or = [
                { title: regex },
                { department: regex },
                { location: regex },
                { description: regex }
            ];
        }

        const vacancies = await Vacancy.find(query);
        res.json(vacancies);
    } catch (error) {
        console.error('Error fetching vacancies:', error);
        res.status(500).json({ error: 'Error fetching vacancies' });
    }
});

// Create a new vacancy
app.post('/api/vacancies', async (req, res) => {
    try {
        // Validate required fields
        const requiredFields = [
            'title',
            'department',
            'location',
            'type',
            'description',
            'requirements',
            'responsibilities',
            'skills_required',
            'experience_level',
            'salary_range'
        ];
        
        const missingFields = requiredFields.filter(field => {
            if (field === 'salary_range') {
                return !(req.body[field] && req.body[field].min && req.body[field].max && req.body[field].currency);
            }
            return !req.body[field];
        });
        
        // Additional check for skills_required being a non-empty array
        if (!Array.isArray(req.body.skills_required) || req.body.skills_required.length === 0 || req.body.skills_required.every(skill => !skill.trim())) {
            missingFields.push('skills_required');
        }
        
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                error: 'Missing required fields', 
                fields: missingFields,
                receivedData: req.body
            });
        }

        // Create vacancy object with default company name
        const vacancyData = {
            ...req.body,
            company: 'Tech Mahindra', // Default company name
            status: 'Active',
            created_by: 'HR Admin', // You might want to get this from authenticated user session
            benefits: Array.isArray(req.body.benefits) ? req.body.benefits : [],
            remote_option: req.body.remote_option || false,
            application_deadline: req.body.application_deadline || null,
            external_postings: {
                linkedin: req.body.external_postings?.linkedin || false,
                occ: req.body.external_postings?.occ || false
            }
        };

        // Create and save the new vacancy
        const vacancy = new Vacancy(vacancyData);
        await vacancy.save();

        // Handle external postings if requested
        if (req.body.external_postings) {
            if (req.body.external_postings.linkedin) {
                // Implement LinkedIn posting logic
                console.log('LinkedIn posting requested');
            }
            if (req.body.external_postings.occ) {
                // Implement OCC Mundial posting logic
                console.log('OCC Mundial posting requested');
            }
        }

        res.status(201).json(vacancy);
    } catch (error) {
        console.error('Error creating vacancy:', error);
        res.status(500).json({ 
            error: 'Error creating vacancy', 
            details: error.message,
            receivedData: req.body
        });
    }
});

// Get top candidates for a specific vacancy
app.get('/api/vacancies/:id/top-candidates', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            throw new Error('MongoDB is not connected. Please try again later.');
        }

        const vacancy = await Vacancy.findById(req.params.id);
        if (!vacancy) {
            return res.status(404).json({ error: 'Vacancy not found' });
        }

        const candidates = await Candidate.find({ 
            applied_for: req.params.id
        });

        // Initialize the AI model
        const matcher = new CandidateMatcher();

        // Calculate match scores for all candidates
        const candidatesWithScores = await Promise.all(candidates.map(async (candidate) => {
            let match_score = 0;
            try {
                const matchResult = await matcher.match_candidate(
                    {
                        id: candidate._id,
                        description: candidate.current_position || '',
                        skills: candidate.skills || '',
                        experience: candidate.experience ? candidate.experience.toString() : '',
                        education: candidate.education || ''
                    },
                    {
                        id: vacancy._id,
                        description: vacancy.description || '',
                        skills: Array.isArray(vacancy.skills_required) ? vacancy.skills_required.join(', ') : '',
                        experience: vacancy.experience_level || '',
                        education: vacancy.requirements || ''
                    }
                );
                if (typeof matchResult.match_score === 'number' && !isNaN(matchResult.match_score)) {
                    match_score = matchResult.match_score;
                }
            } catch (e) {
                match_score = 0;
            }
            return {
                ...candidate.toObject(),
                match_score
            };
        }));

        // Sort candidates by match score
        candidatesWithScores.sort((a, b) => b.match_score - a.match_score);

        // Get top 30% of candidates
        const topCount = Math.ceil(candidatesWithScores.length * 0.3);
        const topCandidates = candidatesWithScores.slice(0, topCount);

        res.json(topCandidates);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching top candidates', details: err.message });
    }
});

// Get candidates for a specific vacancy
app.get('/api/vacancies/:id/candidates', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            throw new Error('MongoDB is not connected. Please try again later.');
        }

        const { id } = req.params;
        
        let candidates = await Candidate.find({ applied_for: id })
            .select('first_name last_name email phone location linkedin experience skills status hiring_feedback feedback_timestamp resume ai_feedback_analysis education current_position')
            .sort({ applied_at: -1 });

        // Fetch the vacancy for AI analysis
        const vacancy = await Vacancy.findById(id);
        if (!vacancy) {
            return res.status(404).json({ error: 'Vacancy not found' });
        }

        // Initialize the AI model
        const matcher = new CandidateMatcher();
        // Analyze and update candidates missing ai_feedback_analysis.match_score
        for (const candidate of candidates) {
            if (!candidate.ai_feedback_analysis || typeof candidate.ai_feedback_analysis.match_score !== 'number') {
                try {
                    const matchResult = matcher.match_candidate(
                        {
                            id: candidate._id,
                            description: candidate.current_position || '',
                            skills: candidate.skills || '',
                            experience: candidate.experience ? candidate.experience.toString() : '',
                            education: candidate.education || ''
                        },
                        {
                            id: vacancy._id,
                            description: vacancy.description || '',
                            skills: Array.isArray(vacancy.skills_required) ? vacancy.skills_required.join(', ') : '',
                            experience: vacancy.experience_level || '',
                            education: vacancy.requirements || ''
                        }
                    );
                    candidate.ai_feedback_analysis = {
                        match_score: matchResult.match_score,
                        match_level: matchResult.match_details.match_level,
                        recommendation: matchResult.match_details.recommendation,
                        summary: matchResult.match_details.summary || '',
                        generated_at: new Date()
                    };
                    await candidate.save();
                } catch (e) {
                    // If AI analysis fails, skip and leave as is
                    console.error(`AI analysis failed for candidate ${candidate._id}:`, e);
                }
            }
        }

        // Refetch candidates to include updated ai_feedback_analysis
        candidates = await Candidate.find({ applied_for: id })
            .select('first_name last_name email phone location linkedin experience skills status hiring_feedback feedback_timestamp resume ai_feedback_analysis education current_position')
            .sort({ applied_at: -1 });

        // Add feedback status information
        const candidatesWithFeedbackStatus = candidates.map(candidate => ({
            ...candidate.toObject(),
            needs_feedback: candidate.status === 'accepted' && !candidate.hiring_feedback
        }));

        res.json(candidatesWithFeedbackStatus);
    } catch (err) {
        console.error('Error fetching candidates:', err);
        res.status(500).json({ 
            error: 'Error fetching candidates',
            details: err.message 
        });
    }
});

// Get all candidates
app.get('/api/candidates', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            throw new Error('MongoDB is not connected. Please try again later.');
        }

        const candidates = await Candidate.find()
            .select('first_name last_name email phone linkedin experience education location skills status resume current_position applied_for applied_at')
            .populate('applied_for', 'title');

        // Debug logging
        console.log('Candidates from database:', candidates.map(c => ({
            name: `${c.first_name} ${c.last_name}`,
            applied_at: c.applied_at,
            applied_at_type: typeof c.applied_at
        })));

        // Ensure dates are properly formatted
        const formattedCandidates = candidates.map(candidate => ({
            ...candidate.toObject(),
            applied_at: candidate.applied_at ? new Date(candidate.applied_at).toISOString() : new Date().toISOString()
        }));

        console.log(`Successfully fetched ${candidates.length} candidates`);
        res.json(formattedCandidates);
    } catch (err) {
        console.error('Error fetching all candidates:', err);
        res.status(500).json({ 
            error: 'Error fetching candidates',
            details: err.message 
        });
    }
});

// Create a new candidate
app.post('/api/candidates', upload.single('resume'), async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            throw new Error('MongoDB is not connected. Please try again later.');
        }

        // Validate required fields
        const requiredFields = [
            'first_name',
            'last_name',
            'email',
            'phone',
            'experience',
            'education',
            'location',
            'skills',
            'applied_for'
        ];

        // For multipart/form-data, fields are in req.body
        const missingFields = requiredFields.filter(field => !req.body[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                error: 'Missing required fields', 
                fields: missingFields,
                receivedData: req.body
            });
        }

        // Create candidate data with applied_at date
        const candidateData = {
            ...req.body,
            applied_at: req.body.applied_at ? new Date(req.body.applied_at) : new Date()
        };
        // If a file was uploaded, set resume to the filename
        if (req.file) {
            candidateData.resume = req.file.filename;
        }

        // Create and save the new candidate
        const candidate = new Candidate(candidateData);
        await candidate.save();

        // Populate the applied_for field before sending response
        const populatedCandidate = await Candidate.findById(candidate._id)
            .populate('applied_for', 'title');

        console.log(`Successfully created candidate: ${candidate.first_name} ${candidate.last_name} with applied_at: ${candidate.applied_at}`);
        res.status(201).json(populatedCandidate);
    } catch (err) {
        console.error('Error creating candidate:', err);
        res.status(500).json({ 
            error: 'Error creating candidate',
            details: err.message,
            receivedData: req.body
        });
    }
});

// Update candidate status
app.put('/api/candidates/:id/status', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            throw new Error('MongoDB is not connected. Please try again later.');
        }

        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        const validStatuses = ['pending', 'interview', 'accepted', 'rejected'];
        if (!validStatuses.includes(status.toLowerCase())) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        const candidate = await Candidate.findByIdAndUpdate(
            id,
            { status: status.toLowerCase() },
            { new: true }
        );

        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log(`Successfully updated status for candidate ${id} to ${status}`);
        res.json(candidate);
    } catch (err) {
        console.error('Error updating candidate status:', err);
        res.status(500).json({ 
            error: 'Error updating candidate status',
            details: err.message 
        });
    }
});

// Update candidate hiring feedback
app.put('/api/candidates/:id/feedback', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            throw new Error('MongoDB is not connected. Please try again later.');
        }

        const { id } = req.params;
        const { hiring_feedback, ai_insights } = req.body;

        if (!hiring_feedback) {
            return res.status(400).json({ error: 'Hiring feedback is required' });
        }

        // First check if the candidate exists and is accepted
        const candidate = await Candidate.findById(id);
        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        if (candidate.status !== 'accepted') {
            return res.status(400).json({ error: 'Feedback can only be provided for accepted candidates' });
        }

        // Update the candidate with feedback
        const updatedCandidate = await Candidate.findByIdAndUpdate(
            id,
            { 
                hiring_feedback, 
                ai_insights,
                feedback_timestamp: new Date()
            },
            { new: true }
        ).populate('applied_for', 'title');

        console.log(`Successfully updated hiring feedback for candidate ${id}`);
        res.json(updatedCandidate);
    } catch (err) {
        console.error('Error updating candidate hiring feedback:', err);
        res.status(500).json({ 
            error: 'Error updating candidate hiring feedback',
            details: err.message 
        });
    }
});

// Delete a vacancy and its associated candidates
app.delete('/api/vacancies/:id', async (req, res) => {
    try {
        const vacancyId = req.params.id;

        // First, delete all candidates associated with this vacancy
        await Candidate.deleteMany({ applied_for: vacancyId });

        // Then delete the vacancy
        const deletedVacancy = await Vacancy.findByIdAndDelete(vacancyId);

        if (!deletedVacancy) {
            return res.status(404).json({ error: 'Vacancy not found' });
        }

        res.json({ message: 'Vacancy and associated candidates deleted successfully' });
    } catch (error) {
        console.error('Error deleting vacancy:', error);
        res.status(500).json({ error: 'Error deleting vacancy', details: error.message });
    }
});

// Get recent activity
app.get('/api/dashboard/activity', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            throw new Error('MongoDB is not connected. Please try again later.');
        }

        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        const sevenDaysAhead = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));

        // Get candidates with their applied_for vacancy populated
        const candidates = await Candidate.find({
            applied_at: {
                $gte: sevenDaysAgo,
                $lte: sevenDaysAhead
            }
        })
        .populate('applied_for', 'title')
        .sort({ applied_at: -1 })
        .limit(10);

        const activities = candidates.map(candidate => {
            if (!candidate.applied_at) return null;
            
            const appliedDate = new Date(candidate.applied_at);
            const isUpcoming = appliedDate > now;
            return {
                type: isUpcoming ? 'upcoming' : 'application',
                description: `${candidate.first_name} ${candidate.last_name} ${isUpcoming ? 'will apply' : 'applied'} for ${candidate.applied_for?.title || 'Unknown Position'}`,
                timestamp: candidate.applied_at,
                icon: isUpcoming ? 'bi-calendar-plus' : 'bi-file-earmark-text'
            };
        }).filter(activity => activity !== null);

        res.json(activities);
    } catch (error) {
        console.error('Error fetching recent activity:', error);
        res.status(500).json({ 
            error: 'Error fetching recent activity',
            details: error.message 
        });
    }
});

// AI feedback processing endpoint
app.post('/api/ai/process-feedback', async (req, res) => {
    try {
        // Check MongoDB connection
        if (mongoose.connection.readyState !== 1) {
            throw new Error('MongoDB is not connected. Please try again later.');
        }

        const { candidateId, feedback, vacancyId } = req.body;

        if (!candidateId || !feedback || !vacancyId) {
            return res.status(400).json({
                error: 'Missing required fields',
                details: 'candidateId, feedback, and vacancyId are required'
            });
        }

        // Verify candidate exists and is accepted
        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        if (candidate.status !== 'accepted') {
            return res.status(400).json({ error: 'Feedback can only be processed for accepted candidates' });
        }

        const vacancy = await Vacancy.findById(vacancyId);
        if (!vacancy) {
            return res.status(404).json({ error: 'Vacancy not found' });
        }

        try {
            // Initialize the AI model
            const matcher = new CandidateMatcher();
            
            // Process the feedback and update the model
            const feedbackAnalysis = matcher.match_candidate(
                {
                    id: candidate._id,
                    description: feedback,
                    skills: candidate.skills,
                    experience: candidate.experience.toString(),
                    education: candidate.education
                },
                {
                    id: vacancy._id,
                    description: vacancy.description,
                    skills: vacancy.skills_required.join(', '),
                    experience: vacancy.experience_level,
                    education: vacancy.requirements
                }
            );

            // Extract key insights from the feedback
            const insights = {
                match_score: feedbackAnalysis.match_score,
                match_level: feedbackAnalysis.match_details.match_level,
                recommendation: feedbackAnalysis.match_details.recommendation,
                summary: `Based on the hiring feedback, the candidate shows a ${feedbackAnalysis.match_details.match_level.toLowerCase()} (${Math.round(feedbackAnalysis.match_score * 100)}%) alignment with the position requirements. ${feedbackAnalysis.match_details.recommendation}.`,
                timestamp: new Date(),
                feedback: feedback
            };

            // Update candidate record with feedback insights
            const updatedCandidate = await Candidate.findByIdAndUpdate(
                candidateId,
                {
                    $set: {
                        'hiring_feedback': feedback,
                        'ai_feedback_analysis': insights,
                        'feedback_timestamp': new Date()
                    }
                },
                { new: true }
            ).populate('applied_for', 'title');

            if (!updatedCandidate) {
                throw new Error('Failed to update candidate with feedback analysis');
            }

            res.json({ 
                success: true,
                insights,
                candidate: updatedCandidate
            });

        } catch (aiError) {
            console.error('AI processing error:', aiError);
            throw new Error(`AI processing failed: ${aiError.message}`);
        }

    } catch (error) {
        console.error('Error processing AI feedback:', error);
        res.status(500).json({
            error: 'Error processing feedback',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Analytics endpoints
app.get('/api/dashboard/application-trends', async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const candidates = await Candidate.find({
            applied_at: { $gte: thirtyDaysAgo }
        }).sort({ applied_at: 1 });

        // Group applications by date
        const applicationsByDate = {};
        candidates.forEach(candidate => {
            const date = candidate.applied_at.toISOString().split('T')[0];
            if (!applicationsByDate[date]) {
                applicationsByDate[date] = {
                    applications: 0,
                    interviews: 0
                };
            }
            applicationsByDate[date].applications++;
            if (candidate.status === 'interview') {
                applicationsByDate[date].interviews++;
            }
        });

        // Convert to array format for the chart
        const trends = Object.entries(applicationsByDate).map(([date, data]) => ({
            date,
            ...data
        }));

        res.json(trends);
    } catch (error) {
        console.error('Error fetching application trends:', error);
        res.status(500).json({ error: 'Error fetching application trends' });
    }
});

app.get('/api/dashboard/department-stats', async (req, res) => {
    try {
        const vacancies = await Vacancy.find();
        const departmentStats = {};

        // Count applications by department
        for (const vacancy of vacancies) {
            const candidates = await Candidate.countDocuments({ applied_for: vacancy._id });
            if (!departmentStats[vacancy.department]) {
                departmentStats[vacancy.department] = 0;
            }
            departmentStats[vacancy.department] += candidates;
        }

        // Convert to array format for the pie chart
        const stats = Object.entries(departmentStats).map(([name, value]) => ({
            name,
            value
        }));

        res.json(stats);
    } catch (error) {
        console.error('Error fetching department stats:', error);
        res.status(500).json({ error: 'Error fetching department stats' });
    }
});

// Report generation endpoint
app.get('/api/dashboard/generate-report', async (req, res) => {
    try {
        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument();

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=recruitment-report.pdf');

        // Pipe the PDF to the response
        doc.pipe(res);

        // Add content to the PDF
        doc.fontSize(25).text('Recruitment Report', { align: 'center' });
        doc.moveDown();

        // Get statistics
        const totalVacancies = await Vacancy.countDocuments();
        const activeVacancies = await Vacancy.countDocuments({ status: 'Active' });
        const totalCandidates = await Candidate.countDocuments();
        const interviewedCandidates = await Candidate.countDocuments({ status: 'interview' });
        const hiredCandidates = await Candidate.countDocuments({ status: 'accepted' });

        // Add statistics to the report
        doc.fontSize(16).text('Overview', { underline: true });
        doc.moveDown();
        doc.fontSize(12).text(`Total Vacancies: ${totalVacancies}`);
        doc.text(`Active Vacancies: ${activeVacancies}`);
        doc.text(`Total Candidates: ${totalCandidates}`);
        doc.text(`Interviewed Candidates: ${interviewedCandidates}`);
        doc.text(`Hired Candidates: ${hiredCandidates}`);
        doc.moveDown();

        // Add department statistics
        doc.fontSize(16).text('Department Statistics', { underline: true });
        doc.moveDown();

        const vacancies = await Vacancy.find();
        for (const vacancy of vacancies) {
            const candidates = await Candidate.countDocuments({ applied_for: vacancy._id });
            doc.fontSize(12).text(`${vacancy.department}: ${candidates} applications`);
        }

        // Add recent activity
        doc.moveDown();
        doc.fontSize(16).text('Recent Activity', { underline: true });
        doc.moveDown();

        const recentCandidates = await Candidate.find()
            .sort({ applied_at: -1 })
            .limit(10)
            .populate('applied_for');

        for (const candidate of recentCandidates) {
            doc.fontSize(12).text(
                `${candidate.first_name} ${candidate.last_name} applied for ${candidate.applied_for.title} on ${candidate.applied_at.toLocaleDateString()}`
            );
        }

        // Finalize the PDF
        doc.end();
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ error: 'Error generating report' });
    }
});

// Other API endpoints...

// Serve static files AFTER all API routes
app.use(express.static(path.join(__dirname, 'frontend')));

// Catch-all route should be LAST, but only for paths that don't end in .html
app.get('*', (req, res, next) => {
    if (req.path.endsWith('.html')) {
        next();
    } else {
        res.sendFile(path.join(__dirname, 'frontend', 'dashboard.html'));
    }
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Express error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
});

// Start MongoDB connection
connectWithRetry();

// Start the server only after successful database connection
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB successfully');
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});

async function connectWithRetry(retryCount = 0) {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB successfully');
        
        // Create indexes after successful connection
        await Promise.all([
            Candidate.createIndexes(),
            Vacancy.createIndexes()
        ]);
        console.log('Database indexes created successfully');
        
    } catch (err) {
        console.error('MongoDB connection error:', err);
        if (retryCount < MAX_RETRIES) {
            console.log(`Retrying connection in ${RETRY_INTERVAL/1000} seconds... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
            setTimeout(() => connectWithRetry(retryCount + 1), RETRY_INTERVAL);
        } else {
            console.error('Max retry attempts reached. Please check if MongoDB is installed and running.');
            process.exit(1);
        }
    }
} 