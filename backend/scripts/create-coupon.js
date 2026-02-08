require('dotenv').config();
const mongoose = require('mongoose');
const Coupon = require('../models/Coupon');

const createCoupon = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const couponCode = 'AYOOSH50';

        // Check if exists
        const existing = await Coupon.findOne({ code: couponCode });
        if (existing) {
            console.log(`Coupon ${couponCode} already exists:`, existing);
            // Optional: Update it to ensure it's free shipping
            existing.discountType = 'free_shipping';
            existing.isActive = true;
            existing.usageLimit = 50; // First 50 customers
            await existing.save();
            console.log('Updated existing coupon to Free Shipping');
        } else {
            const newCoupon = await Coupon.create({
                code: couponCode,
                discountType: 'free_shipping',
                amount: 0, // Not used for free shipping
                usageLimit: 50,
                isActive: true,
                minOrderAmount: 0
            });
            console.log('Created new coupon:', newCoupon);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createCoupon();
