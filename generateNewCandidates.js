const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const { PDFDocument } = require('pdf-lib');

// MongoDB connection
const MONGODB_URI = 'mongodb://localhost:27017/Innovation';

// Sample data arrays
const firstNames = ['John', 'Emma', 'Michael', 'Sophia', 'William', 'Olivia', 'James', 'Ava', 'Alexander', 'Isabella'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
const locations = [
    'Mexico City - Mexico',
    'Guadalajara - Mexico',
    'Monterrey - Mexico',
    'Toronto - Canada',
    'Vancouver - Canada',
    'New York - United States',
    'Los Angeles - United States',
    'Chicago - United States'
];

// Define new vacancies
const newVacancies = [
    {
        title: 'Full Stack Developer',
        company: 'Tech Mahindra',
        location: 'Mexico City - Mexico',
        type: 'Full-time',
        description: 'We are looking for a Full Stack Developer to join our dynamic development team. The ideal candidate will be responsible for developing and maintaining both front-end and back-end applications.',
        requirements: 'Bachelor\'s degree in Computer Science or related field, 3+ years of full stack development experience',
        responsibilities: 'Develop scalable web applications, collaborate with cross-functional teams, implement security measures, optimize application performance',
        skills_required: [
            'React',
            'Node.js',
            'MongoDB',
            'TypeScript',
            'AWS',
            'Docker',
            'REST APIs',
            'Git'
        ],
        experience_level: 'Mid-Senior Level',
        salary_range: {
            min: 70000,
            max: 100000,
            currency: 'MXN'
        },
        benefits: ['Health Insurance', 'Remote Work', 'Professional Development', 'Gym Membership'],
        application_deadline: new Date('2024-05-30'),
        remote_option: true,
        status: 'Active',
        created_by: 'HR Admin',
        department: 'Technology'
    },
    {
        title: 'Data Scientist',
        company: 'Tech Mahindra',
        location: 'Guadalajara - Mexico',
        type: 'Full-time',
        description: 'Seeking a Data Scientist to help drive data-driven decisions through advanced analytics and machine learning solutions.',
        requirements: 'Master\'s degree in Data Science, Statistics, or related field, 2+ years experience with ML and statistical modeling',
        responsibilities: 'Develop ML models, perform statistical analysis, create data visualizations, present insights to stakeholders',
        skills_required: [
            'Python',
            'Machine Learning',
            'SQL',
            'TensorFlow',
            'Data Visualization',
            'Statistical Analysis',
            'Big Data',
            'Jupyter'
        ],
        experience_level: 'Mid Level',
        salary_range: {
            min: 65000,
            max: 95000,
            currency: 'MXN'
        },
        benefits: ['Health Insurance', 'Flexible Hours', 'Learning Budget', 'Home Office Allowance'],
        application_deadline: new Date('2024-05-30'),
        remote_option: true,
        status: 'Active',
        created_by: 'HR Admin',
        department: 'Data Science'
    },
    {
        title: 'DevOps Engineer',
        company: 'Tech Mahindra',
        location: 'Monterrey - Mexico',
        type: 'Full-time',
        description: 'Looking for a DevOps Engineer to help streamline our development and deployment processes while maintaining system reliability.',
        requirements: 'Bachelor\'s degree in Computer Science or equivalent, 4+ years of DevOps experience',
        responsibilities: 'Manage CI/CD pipelines, maintain cloud infrastructure, implement security best practices, automate processes',
        skills_required: [
            'Kubernetes',
            'AWS',
            'Jenkins',
            'Terraform',
            'Docker',
            'Linux',
            'Python',
            'Shell Scripting'
        ],
        experience_level: 'Senior Level',
        salary_range: {
            min: 75000,
            max: 110000,
            currency: 'MXN'
        },
        benefits: ['Health Insurance', 'Life Insurance', 'Performance Bonus', 'Remote Work'],
        application_deadline: new Date('2024-05-30'),
        remote_option: true,
        status: 'Active',
        created_by: 'HR Admin',
        department: 'Infrastructure'
    },
    {
        title: 'UI/UX Designer',
        company: 'Tech Mahindra',
        location: 'Mexico City - Mexico',
        type: 'Full-time',
        description: 'We are seeking a talented UI/UX Designer to create intuitive and engaging user experiences for our digital products.',
        requirements: 'Bachelor\'s degree in Design or related field, 3+ years of UI/UX design experience',
        responsibilities: 'Create wireframes and prototypes, conduct user research, design user interfaces, collaborate with development team',
        skills_required: [
            'Figma',
            'Adobe XD',
            'User Research',
            'Prototyping',
            'Information Architecture',
            'Visual Design',
            'Design Systems',
            'Usability Testing'
        ],
        experience_level: 'Mid Level',
        salary_range: {
            min: 60000,
            max: 85000,
            currency: 'MXN'
        },
        benefits: ['Health Insurance', 'Creative Suite License', 'Training Budget', 'Flexible Schedule'],
        application_deadline: new Date('2024-05-30'),
        remote_option: true,
        status: 'Active',
        created_by: 'HR Admin',
        department: 'Design'
    },
    {
        title: 'Project Manager',
        company: 'Tech Mahindra',
        location: 'Guadalajara - Mexico',
        type: 'Full-time',
        description: 'Seeking an experienced Project Manager to lead and deliver complex technology projects.',
        requirements: 'Bachelor\'s degree in Business or Technology field, PMP certification, 5+ years of project management experience',
        responsibilities: 'Lead project planning and execution, manage stakeholder relationships, track project progress, manage risks',
        skills_required: [
            'Agile Methodologies',
            'JIRA',
            'Risk Management',
            'Budgeting',
            'Stakeholder Management',
            'MS Project',
            'Team Leadership',
            'Scrum'
        ],
        experience_level: 'Senior Level',
        salary_range: {
            min: 80000,
            max: 120000,
            currency: 'MXN'
        },
        benefits: ['Health Insurance', 'Performance Bonus', 'Leadership Training', 'Remote Work'],
        application_deadline: new Date('2024-05-30'),
        remote_option: true,
        status: 'Active',
        created_by: 'HR Admin',
        department: 'Project Management'
    }
];

const educationLevels = [
    'Bachelor in Accounting, NYU',
    'Master in Finance, Columbia',
    'Bachelor in Business Administration, Wharton',
    'Master in Marketing, Northwestern',
    'Bachelor in Sales Management, Harvard',
    'Master in Business Analytics, MIT'
];

const experiences = {
    'Full Stack Developer': { min: 3, max: 8 },
    'Data Scientist': { min: 2, max: 7 },
    'DevOps Engineer': { min: 4, max: 10 },
    'UI/UX Designer': { min: 3, max: 8 },
    'Project Manager': { min: 5, max: 12 },
    'Senior Accountant': { min: 5, max: 15 },
    'Sales Manager': { min: 4, max: 12 },
    'Marketing Specialist': { min: 3, max: 10 }
};

// Candidate Schema
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
    resume: { type: String, required: true },
    status: { type: String, default: 'Pending' },
    applied_at: { type: Date, default: Date.now },
    vacancy: { type: String, required: true },
    applied_for: { type: mongoose.Schema.Types.ObjectId, ref: 'Vacancy', required: true },
    source: { type: String, required: true }
}, { timestamps: true });

const Candidate = mongoose.model('Candidate', candidateSchema);

// Define Vacancy Schema
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

const Vacancy = mongoose.model('Vacancy', vacancySchema);

// Function to generate a random resume PDF
async function generateResume(candidateInfo) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const { width, height } = page.getSize();
    
    page.drawText(`${candidateInfo.first_name} ${candidateInfo.last_name}`, {
        x: 50,
        y: height - 50,
        size: 20
    });
    
    page.drawText(`Email: ${candidateInfo.email}`, {
        x: 50,
        y: height - 80,
        size: 12
    });
    
    page.drawText(`Phone: ${candidateInfo.phone}`, {
        x: 50,
        y: height - 100,
        size: 12
    });
    
    page.drawText(`Position: ${candidateInfo.vacancy}`, {
        x: 50,
        y: height - 120,
        size: 12
    });
    
    page.drawText(`Education: ${candidateInfo.education}`, {
        x: 50,
        y: height - 140,
        size: 12
    });
    
    page.drawText(`Experience: ${candidateInfo.experience} years`, {
        x: 50,
        y: height - 180,
        size: 12
    });
    
    page.drawText(`Skills: ${candidateInfo.skills}`, {
        x: 50,
        y: height - 220,
        size: 12
    });
    
    return await pdfDoc.save();
}

function generateRandomCandidate(vacancy) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
    const phone = `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`;
    const location = locations[Math.floor(Math.random() * locations.length)];
    const education = educationLevels[Math.floor(Math.random() * educationLevels.length)];
    const experience = Math.floor(Math.random() * (experiences[vacancy.title].max - experiences[vacancy.title].min + 1)) + experiences[vacancy.title].min;
    const linkedin = `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`;
    const isFromOCC = Math.random() > 0.5;
    
    // Get position-specific skills from the vacancy
    const positionSkills = vacancy.skills_required;
    const numSkills = Math.floor(Math.random() * 3) + 4; // 4-6 skills
    
    // Randomly select multiple skills without duplicates
    const shuffledSkills = [...positionSkills].sort(() => Math.random() - 0.5);
    const selectedSkills = shuffledSkills.slice(0, numSkills);
    const skills = selectedSkills.join(', ');

    return {
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone,
        location: location,
        education: education,
        experience: experience,
        skills: skills,
        linkedin: linkedin,
        vacancy: vacancy.title,
        applied_for: vacancy._id,
        status: 'Pending',
        source: isFromOCC ? 'OCC' : 'Direct Application'
    };
}

async function main() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Create resumes directory if it doesn't exist
        const resumesDir = path.join(__dirname, 'frontend', 'resumes');
        await fs.mkdir(resumesDir, { recursive: true });

        // First, create the new vacancies if they don't exist
        console.log('Creating new vacancies...');
        for (const vacancy of newVacancies) {
            const existingVacancy = await Vacancy.findOne({ title: vacancy.title });
            if (!existingVacancy) {
                const newVacancy = new Vacancy(vacancy);
                await newVacancy.save();
                console.log(`Created vacancy: ${vacancy.title}`);
            } else {
                console.log(`Vacancy ${vacancy.title} already exists`);
            }
        }

        // Get all active vacancies
        console.log('\nFetching all active vacancies...');
        const activeVacancies = await Vacancy.find({ status: 'Active' });
        console.log(`Found ${activeVacancies.length} active vacancies`);

        // Delete existing candidates
        console.log('\nDeleting existing candidates...');
        await Candidate.deleteMany({});

        // Generate 80 candidates and assign them to random vacancies
        const candidates = [];
        console.log('\nGenerating 80 candidates...');
        
        for (let i = 0; i < 80; i++) {
            // Randomly select a vacancy
            const randomVacancy = activeVacancies[Math.floor(Math.random() * activeVacancies.length)];
            const candidate = generateRandomCandidate(randomVacancy);
            const resumePdf = await generateResume(candidate);
            const resumeFilename = `${candidate.first_name}_${candidate.last_name}_resume.pdf`;
            const resumePath = path.join(resumesDir, resumeFilename);
            await fs.writeFile(resumePath, resumePdf);
            candidate.resume = resumeFilename;
            candidates.push(candidate);
            console.log(`Generated candidate ${i + 1}/80 for ${randomVacancy.title}`);
        }

        // Save candidates to database
        await Candidate.insertMany(candidates);
        console.log(`\nSuccessfully generated ${candidates.length} candidates`);
        
        // Print distribution of candidates per vacancy
        console.log('\nCandidate distribution per vacancy:');
        for (const vacancy of activeVacancies) {
            const count = candidates.filter(c => c.vacancy === vacancy.title).length;
            console.log(`${vacancy.title}: ${count} candidates`);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

// Add 5 more accurate candidates to each existing active vacancy
async function addMoreCandidatesToEachVacancy() {
    await mongoose.connect(MONGODB_URI);
    const resumesDir = path.join(__dirname, 'frontend', 'resumes');
    await fs.mkdir(resumesDir, { recursive: true });

    const activeVacancies = await Vacancy.find({ status: 'Active' });

    for (const vacancy of activeVacancies) {
        for (let i = 0; i < 5; i++) {
            const candidate = generateRandomCandidate(vacancy);
            const resumePdf = await generateResume(candidate);
            const resumeFilename = `${candidate.first_name}_${candidate.last_name}_resume.pdf`;
            const resumePath = path.join(resumesDir, resumeFilename);
            await fs.writeFile(resumePath, resumePdf);
            candidate.resume = resumeFilename;
            await Candidate.create(candidate);
            console.log(`Added candidate ${candidate.first_name} ${candidate.last_name} to ${vacancy.title}`);
        }
    }
    console.log('Added 5 new candidates to each vacancy.');
    process.exit(0);
}

// Uncomment the following line to run the function:
addMoreCandidatesToEachVacancy();

main(); 