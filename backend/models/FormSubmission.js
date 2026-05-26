const mongoose = require('mongoose');

const formSubmissionSchema = new mongoose.Schema(
    {
        name:          { type: String, required: true, trim: true, maxlength: 200 },
        email:         { type: String, required: true, trim: true, maxlength: 320 },
        contact:       { type: String, trim: true, maxlength: 20 },
        handle:        { type: String, trim: true, maxlength: 100 },
        offersConsent: { type: Boolean, default: false },
        termsConsent:  { type: Boolean, default: false },
        message:       { type: String, trim: true, maxlength: 5000 },
    },
    { timestamps: true }
);

module.exports = mongoose.model('FormSubmission', formSubmissionSchema);
