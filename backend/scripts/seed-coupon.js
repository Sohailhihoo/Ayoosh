const mongoose = require('mongoose');
const Coupon = require('../models/Coupon');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/beauty-store')
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

const createCoupon = async () => {
    try {
        const coupon = await Coupon.findOneAndUpdate(
            { code: 'AYOOSH50' },
            {
                code: 'AYOOSH50',
                discountType: 'free_shipping',
                usageLimit: 50,
                isActive: true,
                amount: 0 // Not used for free shipping, but good to have
            },
            { upsert: true, new: true }
        );
        console.log('✅ Coupon AYOOSH50 created/updated:', coupon);
    } catch (error) {
        console.error('❌ Error creating coupon:', error);
    } finally {
        mongoose.connection.close();
    }
};

createCoupon();
