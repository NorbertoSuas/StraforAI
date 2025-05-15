const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/Innovation';

const candidateSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    status: String,
    hiring_feedback: String,
    applied_for: mongoose.Schema.Types.ObjectId
}, { collection: 'candidates' });

const Candidate = mongoose.model('Candidate', candidateSchema);

async function checkFeedbackForVacancy(vacancyId) {
    await mongoose.connect(MONGODB_URI);
    const candidates = await Candidate.find({ applied_for: vacancyId });
    console.log(`Candidates for vacancy ${vacancyId}:`);
    candidates.forEach(c => {
        console.log(`- ${c.first_name} ${c.last_name} | Status: ${c.status} | Feedback: ${c.hiring_feedback ? '✅' : '❌'}`);
    });
    await mongoose.disconnect();
}

// Usage: node utils/check-feedback.js <vacancyId>
if (require.main === module) {
    const vacancyId = process.argv[2];
    if (!vacancyId) {
        console.error('Usage: node utils/check-feedback.js <vacancyId>');
        process.exit(1);
    }
    checkFeedbackForVacancy(vacancyId).catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
} 