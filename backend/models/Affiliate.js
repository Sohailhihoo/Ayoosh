const mongoose = require('mongoose');
const crypto = require('crypto');

const affiliateSchema = new mongoose.Schema({
    // Affiliate identity
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    phone: {
        type: String,
        trim: true
    },

    // Linked user account (optional - affiliate may or may not be a customer)
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
        sparse: true,  // sparse unique index — enforces one-affiliate-per-user at DB level
        unique: true,
    },

    // Unique affiliate code used in referral links
    affiliateCode: {
        type: String,
        unique: true,
        uppercase: true,
        trim: true
    },

    // Commission settings
    commissionType: {
        type: String,
        enum: ['percentage', 'fixed'],
        default: 'percentage'
    },
    commissionRate: {
        type: Number,
        required: [true, 'Commission rate is required'],
        min: 0
    },

    // Tracking
    totalClicks: {
        type: Number,
        default: 0
    },
    totalOrders: {
        type: Number,
        default: 0
    },
    totalRevenue: {
        type: Number,
        default: 0
    },
    totalCommission: {
        type: Number,
        default: 0
    },
    paidCommission: {
        type: Number,
        default: 0
    },

    // Cookie duration in days (how long the referral is tracked)
    cookieDuration: {
        type: Number,
        default: 7
    },

    // Payout details
    payoutMethod: {
        type: String,
        enum: ['bank_transfer', 'payfast', 'manual'],
        default: 'manual'
    },
    payoutDetails: {
        bankName: String,
        accountNumber: String,
        branchCode: String,
        accountHolder: String
    },
    minPayoutAmount: {
        type: Number,
        default: 200 // Minimum R200 before payout
    },

    // Status
    status: {
        type: String,
        enum: ['pending', 'approved', 'suspended', 'rejected'],
        default: 'pending'
    },
    approvedAt: Date,
    suspendedAt: Date,
    suspendedReason: String
}, {
    timestamps: true
});

// Generate unique affiliate code before validation
affiliateSchema.pre('validate', function (next) {
    if (!this.affiliateCode) {
        const namePart = this.firstName.substring(0, 3).toUpperCase();
        const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
        this.affiliateCode = `AY-${namePart}-${randomPart}`;
    }
    next();
});

// Virtual: unpaid commission
affiliateSchema.virtual('unpaidCommission').get(function () {
    return this.totalCommission - this.paidCommission;
});

// Virtual: full name
affiliateSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Method: calculate commission for an order
affiliateSchema.methods.calculateCommission = function (orderTotal) {
    if (this.commissionType === 'percentage') {
        return Math.round((orderTotal * this.commissionRate / 100) * 100) / 100;
    }
    return this.commissionRate;
};

// Method: check if affiliate can receive payouts
affiliateSchema.methods.isPayoutEligible = function () {
    return this.status === 'approved' && this.unpaidCommission >= this.minPayoutAmount;
};

// Ensure virtuals are included in JSON
affiliateSchema.set('toJSON', { virtuals: true });
affiliateSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Affiliate', affiliateSchema);
