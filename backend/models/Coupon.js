const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Coupon code is required'],
        unique: true,
        uppercase: true,
        trim: true
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed', 'free_shipping'],
        required: true
    },
    amount: {
        type: Number,
        required: function () { return this.discountType !== 'free_shipping'; },
        default: 0
    },
    usageLimit: {
        type: Number,
        default: null // null means unlimited
    },
    usedCount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    expiryDate: {
        type: Date,
        default: null
    },
    minOrderAmount: {
        type: Number,
        default: 0
    },
    freeShipping: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Method to check if coupon is valid
couponSchema.methods.isValid = function (subtotal = 0) {
    if (!this.isActive) return false;
    if (this.usageLimit !== null && this.usedCount >= this.usageLimit) return false;
    if (this.expiryDate && new Date() > this.expiryDate) return false;
    if (this.minOrderAmount > 0 && subtotal < this.minOrderAmount) return false;
    return true;
};

module.exports = mongoose.model('Coupon', couponSchema);
