const mongoose = require('mongoose');

const newsletterConnection = require('../config/newsletterDB');

const newsletterSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    isSubscribed: {
        type: Boolean,
        default: true
    },
    source: {
        type: String,
        default: 'popup'
    }
}, { timestamps: true });

module.exports = newsletterConnection.model('Newsletter', newsletterSchema);
