const mongoose = require('mongoose');

// One document per paid order — commission record, not click record.
// Unique index on `order` is the idempotency guard: a duplicate-key error
// (E11000) on insert means commission was already credited → safe to ignore.
const referralSchema = new mongoose.Schema({
    affiliate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Affiliate',
        required: true
    },
    affiliateCode: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        unique: true   // idempotency guard — E11000 on duplicate = already credited
    },
    // 5% of (order subtotal − coupon discount), excluding shipping
    orderAmount: {
        type: Number,
        required: true
    },
    commissionAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'paid', 'void'],
        default: 'pending'
    },
    paidAt: Date,
    voidReason: String,
}, { timestamps: true });

referralSchema.index({ affiliate: 1, status: 1 });
referralSchema.index({ affiliateCode: 1 });
referralSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Referral', referralSchema);
