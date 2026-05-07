const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: 1,
        max: 5
    },
    title: {
        type: String,
        trim: true
    },
    review: {
        type: String,
        required: [true, 'Review text is required'],
        trim: true
    },
    page: {
        type: String,
        enum: ['suncream', 'sunglasses', 'general', null],
        default: null
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true });

reviewSchema.index({ status: 1, page: 1 });
reviewSchema.index({ status: 1, productId: 1 });

module.exports = mongoose.model('Review', reviewSchema);
