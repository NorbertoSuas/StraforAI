const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const multer = require('multer');
const { postToAllPlatforms } = require('./services/external-postings');
const settingsRoutes = require('./routes/settings');
const adminIntegrationsRoutes = require('./routes/admin/integrations');
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
app.use('/api/admin/integrations', adminIntegrationsRoutes);
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
        const vacancies = await Vacancy.find();
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
        console.log(`Fetching top candidates for vacancy: ${req.params.id}`);
        
        if (mongoose.connection.readyState !== 1) {
            throw new Error('MongoDB is not connected. Please try again later.');
        }

        // Get the vacancy details
        const vacancy = await Vacancy.findById(req.params.id);
        if (!vacancy) {
            return res.status(404).json({ error: 'Vacancy not found' });
        }

        // Get all candidates for this vacancy
        const candidates = await Candidate.find({ 
            applied_for: req.params.id
        });

        console.log(`Found ${candidates.length} candidates for vacancy`);

        // Initialize the AI model
        const matcher = new CandidateMatcher();
        
        // Calculate match scores for all candidates
        const candidatesWithScores = await Promise.all(candidates.map(async (candidate) => {
            const matchResult = await matcher.match_candidate(
                {
                    id: candidate._id,
                    description: candidate.current_position,
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

            return {
                ...candidate.toObject(),
                match_score: matchResult.match_score
            };
        }));

        // Sort candidates by match score
        candidatesWithScores.sort((a, b) => b.match_score - a.match_score);

        // Get top 30% of candidates
        const topCount = Math.ceil(candidatesWithScores.length * 0.3);
        const topCandidates = candidatesWithScores.slice(0, topCount);

        console.log(`Successfully fetched top ${topCandidates.length} candidates for vacancy ${req.params.id}`);
        res.json(topCandidates);
    } catch (err) {
        console.error('Error fetching top candidates for vacancy:', err);
        res.status(500).json({ 
            error: 'Error fetching top candidates',
            details: err.message 
        });
    }
});

// Get candidates for a specific vacancy
app.get('/api/vacancies/:id/candidates', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            throw new Error('MongoDB is not connected. Please try again later.');
        }

        const candidates = await Candidate.find({ 
            applied_for: req.params.id
        })
        .select('first_name last_name email phone linkedin experience skills status resume')
        .populate('applied_for', 'title');

        console.log(`Successfully fetched ${candidates.length} candidates for vacancy ${req.params.id}`);
        res.json(candidates);
    } catch (err) {
        console.error('Error fetching candidates for vacancy:', err);
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
app.post('/api/candidates', async (req, res) => {
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
            applied_at: req.body.applied_at ? new Date(req.body.applied_at) : new Date() // Use provided date or current date
        };

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

        const candidate = await Candidate.findByIdAndUpdate(
            id,
            { 
                hiring_feedback, 
                ai_insights,
                feedback_timestamp: new Date()
            },
            { new: true }
        ).populate('applied_for', 'title');

        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log(`Successfully updated hiring feedback for candidate ${id}`);
        res.json(candidate);
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

        console.log('Processing feedback for:', { candidateId, vacancyId });

        // Get candidate and vacancy data
        const candidate = await Candidate.findById(candidateId);
        const vacancy = await Vacancy.findById(vacancyId);

        if (!candidate || !vacancy) {
            return res.status(404).json({
                error: 'Not found',
                details: `${!candidate ? 'Candidate' : 'Vacancy'} not found`
            });
        }

        console.log('Found candidate and vacancy:', {
            candidateName: `${candidate.first_name} ${candidate.last_name}`,
            vacancyTitle: vacancy.title
        });

        try {
            // Initialize the AI model
            const matcher = new CandidateMatcher();
            
            // Process the feedback and update the model
            const feedbackAnalysis = matcher.match_candidate(
                {
                    id: candidate._id,
                    description: feedback, // Use the feedback as the main description
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

            console.log('AI analysis completed:', feedbackAnalysis);

            // Extract key insights from the feedback
            const insights = {
                match_score: feedbackAnalysis.match_score,
                match_level: feedbackAnalysis.match_details.match_level,
                recommendation: feedbackAnalysis.match_details.recommendation,
                summary: `Based on the hiring feedback, the candidate shows a ${feedbackAnalysis.match_details.match_level.toLowerCase()} (${Math.round(feedbackAnalysis.match_score * 100)}%) alignment with the position requirements. ${feedbackAnalysis.match_details.recommendation}.`,
                timestamp: new Date(),
                feedback: feedback // Store the original feedback
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

            console.log('Candidate updated with feedback analysis');

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

// Other API endpoints...

// Serve static files AFTER all API routes
app.use(express.static(path.join(__dirname, 'frontend')));

// Catch-all route should be LAST, but only for paths that don't end in .html
app.get('*', (req, res, next) => {
    if (req.path.endsWith('.html')) {
        next();
    } else {
        res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
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