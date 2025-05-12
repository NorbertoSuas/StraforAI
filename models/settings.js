const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    company: {
        name: { type: String, required: true },
        industry: { type: String, required: true },
        description: { type: String, required: true },
        website: String,
        size: { type: String, required: true }
    },
    linkedin: {
        clientId: {
            type: String,
            trim: true
        },
        clientSecret: {
            type: String,
            trim: true
        },
        redirectUri: {
            type: String,
            trim: true
        }
    },
    occ: {
        apiKey: {
            type: String,
            trim: true
        },
        apiSecret: {
            type: String,
            trim: true
        },
        environment: {
            type: String,
            enum: ['sandbox', 'production'],
            default: 'sandbox'
        }
    },
    userId: { type: String, required: true, unique: true }
}, { timestamps: true });

// Encrypt sensitive data before saving
settingsSchema.pre('save', function(next) {
    if (this.isModified('linkedin.accessToken')) {
        // In a production environment, you should encrypt these values
        // this.linkedin.accessToken = encrypt(this.linkedin.accessToken);
    }
    if (this.isModified('linkedin.refreshToken')) {
        // this.linkedin.refreshToken = encrypt(this.linkedin.refreshToken);
    }
    if (this.isModified('occ.apiKey')) {
        // this.occ.apiKey = encrypt(this.occ.apiKey);
    }
    if (this.isModified('occ.apiSecret')) {
        // this.occ.apiSecret = encrypt(this.occ.apiSecret);
    }
    next();
});

// Ensure only one settings document exists
settingsSchema.statics.findOneOrCreate = async function() {
    const settings = await this.findOne();
    return settings || await this.create({});
};

// Check if the model already exists before defining it
const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);

module.exports = Settings; 