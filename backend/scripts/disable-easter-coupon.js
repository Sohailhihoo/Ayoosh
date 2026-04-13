require('dotenv').config();
const mongoose = require('mongoose');
const Coupon = require('../models/Coupon');

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/beauty-store');
        const result = await Coupon.updateMany(
            { code: { $regex: /^AYOOSHEASTER/i } },
            { $set: { isActive: false } }
        );
        console.log(`Deactivated Easter coupons. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
