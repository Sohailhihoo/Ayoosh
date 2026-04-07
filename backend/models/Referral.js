const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
    // Which affiliate referred this
    affiliate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Affiliate',
        required: true
    },
    affiliateCode: {
        type: String,
        required: true
    },

    // Click tracking
    ipAddress: String,
    userAgent: String,
    referrerUrl: String,
    landingPage: String,

    // Conversion tracking
    status: {
        type: String,
        enum: ['clicked', 'converted', 'expired'],
        default: 'clicked'
    },

    // Order details (populated when conversion happens)
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        default: null
    },
    orderTotal: {
        type: Number,
        default: 0
    },
    commission: {
        type: Number,
        default: 0
    },

    // Commission payout status
    commissionStatus: {
        type: String,
        enum: ['pending', 'approved', 'paid', 'cancelled'],
        default: 'pending'
    },
    paidAt: Date,

    // Cookie expiry (when this referral attribution expires)
    expiresAt: {
        type: Date,
        required: true
    },

    convertedAt: Date
}, {
    timestamps: true
});

// Index for fast lookups
referralSchema.index({ affiliate: 1, status: 1 });
referralSchema.index({ affiliateCode: 1 });
referralSchema.index({ order: 1 });
referralSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL: auto-delete expired clicks

module.exports = mongoose.model('Referral', referralSchema);
