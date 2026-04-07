const mongoose = require('mongoose');
require('dotenv').config();

const MAIN_URI = process.env.MONGODB_URI;

// Replace database name 'Ayoosh' with 'AyooshNewsletter'
// Logic: Find the database name segment in the URI and replace it.
// URI format: ...mongodb.net/DatabaseName?appName...
// If no database name is explicit, we append /AyooshNewsletter

let NEWSLETTER_URI;

if (MAIN_URI.includes('.net/')) {
    NEWSLETTER_URI = MAIN_URI.replace(/\.net\/[^\?]+/, '.net/AyooshNewsletter');
} else {
    // Fallback for local or other formats, assume it works or just append
    NEWSLETTER_URI = MAIN_URI.replace(/\/([^/?]+)(\?|$)/, '/AyooshNewsletter$2');
}

console.log('🔌 Connecting to Newsletter Database...');

const newsletterConnection = mongoose.createConnection(NEWSLETTER_URI);

newsletterConnection.on('connected', () => {
    console.log('✅ Connected to Newsletter Database');
});

newsletterConnection.on('error', (err) => {
    console.error('❌ Newsletter Database connection error:', err);
});

module.exports = newsletterConnection;
