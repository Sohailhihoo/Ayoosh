require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Affiliate = require('../models/Affiliate');
const Coupon = require('../models/Coupon');

const influencers = [
    { firstName: 'Aisha',   lastName: 'Joosub', handle: '@ayooshonthego', code: 'FOUNDER10' },
    { firstName: 'Veloura', lastName: 'Fabric',  handle: '@velourafabric', code: 'VELOURA10' },
];

const BASE = 'https://www.ayooshonline.com/products';

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);

    for (const inf of influencers) {
        const email = `${inf.firstName.toLowerCase()}.${inf.lastName.toLowerCase()}@influencer.ayoosh`;

        // Affiliate record
        const aff = await Affiliate.findOneAndUpdate(
            { affiliateCode: inf.code },
            {
                firstName: inf.firstName,
                lastName: inf.lastName,
                email,
                affiliateCode: inf.code,
                commissionRate: 5,
                commissionType: 'percentage',
                status: 'approved',
                approvedAt: new Date(),
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Coupon code
        await Coupon.findOneAndUpdate(
            { code: inf.code },
            { code: inf.code, discountType: 'percentage', amount: 10, usageLimit: null, isActive: true, minOrderAmount: 0, expiryDate: null },
            { upsert: true, new: true }
        );

        console.log(`✓ ${inf.firstName} ${inf.lastName}  (${inf.handle})`);
        console.log(`    Affiliate code : ${aff.affiliateCode}`);
        console.log(`    Referral link  : ${BASE}?ref=${aff.affiliateCode}`);
        console.log(`    Coupon code    : ${inf.code}\n`);
    }

    await mongoose.disconnect();
}

run().catch(e => { console.error(e.message); process.exit(1); });
