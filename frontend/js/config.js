// API configuration
const API_CONFIG = {
    baseUrl: 'http://localhost:3000'
};

// Export the configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
} else {
    window.API_CONFIG = API_CONFIG;
} 