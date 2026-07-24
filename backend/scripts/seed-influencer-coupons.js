require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Coupon = require('../models/Coupon');

// One code per influencer: first name (no special chars) + "10"
const codes = [
    'LIHLE10',
    'ESONA10',
    'ONKARABILE10',
    'AMANDA10',
    'TYLERPAIGE10',
    'DANIELLA10',
    'AISHA10',
    'VELOURA10',
];

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);

    const results = [];

    for (const code of codes) {
        try {
            const coupon = await Coupon.findOneAndUpdate(
                { code },
                {
                    code,
                    discountType: 'percentage',
                    amount: 10,
                    usageLimit: null,   // unlimited
                    isActive: true,
                    minOrderAmount: 0,
                    expiryDate: null,
                },
                { upsert: true, new: true }
            );
            results.push({ code: coupon.code, status: 'ok' });
        } catch (e) {
            results.push({ code, status: 'error', error: e.message });
        }
    }

    console.log('\nInfluencer coupon codes:\n');
    results.forEach(r => {
        if (r.status === 'ok') {
            console.log(`  ✓ ${r.code}  →  10% off subtotal`);
        } else {
            console.log(`  ✗ ${r.code}: ${r.error}`);
        }
    });

    await mongoose.disconnect();
}

run().catch(e => { console.error(e.message); process.exit(1); });
