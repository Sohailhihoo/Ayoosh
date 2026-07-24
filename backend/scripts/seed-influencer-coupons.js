require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Coupon = require('../models/Coupon');

// 10% discount code for every influencer — name + "10"
// Duplicates resolved: Amanda Majola=AMANDA10, Amanda Vee=AMANDAVEE10;
//                      Kirsty Smit=KIRSTY10, Kirsty Ackermann=KIRSTYA10
const codes = [
    'LIHLE10',
    'ESONA10',
    'ONKARABILE10',
    'AMANDA10',
    'TYLERPAIGE10',
    'DANIELLA10',
    'NATHANIEL10',
    'KARABO10',
    'JUS10',
    'ASHLEY10',
    'BROWNN10',
    'MELIS10',
    'GOODGUTGURU10',
    'JULI10',
    'SAYLA10',
    'JUSTSIM10',
    'BIANCA10',
    'OWETHU10',
    'STORM10',
    'CASSIDY10',
    'LEXA10',
    'ORATILE10',
    'XAVIER10',
    'KYLA10',
    'CALISTA10',
    'TALISHA10',
    'CHEY10',
    'MILA10',
    'COLLETTE10',
    'DONIQUE10',
    'DURBAN10',
    'GWENDALYN10',
    'YVNDZ10',
    'NIN10',
    'DONE10',
    'ASH10',
    'KIRSTY10',
    'KMALATSI10',
    'KGOSI10',
    'KOKELETSO10',
    'KEAMO10',
    'MPUME10',
    'SAFFA10',
    'ZECKTELLO10',
    'MAMELLO10',
    'TRENT10',
    'MOSALA10',
    'SYLVIA10',
    'MEGAN10',
    'MWILA10',
    'SBONGA10',
    'NTHABISENG10',
    'PRECIOUS10',
    'NOLUBABALO10',
    'ANREA10',
    'ZARA10',
    'MIHLALI10',
    'RHEAH10',
    'AMANDAVEE10',
    'ROLENE10',
    'SANELISIWE10',
    'KIRSTYA10',
    'AISHA10',
    'VELOURA10',
];

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);

    const results = [];

    for (const code of codes) {
        try {
            await Coupon.findOneAndUpdate(
                { code },
                {
                    code,
                    discountType: 'percentage',
                    amount: 10,
                    usageLimit: null,
                    isActive: true,
                    minOrderAmount: 0,
                    expiryDate: null,
                },
                { upsert: true, new: true }
            );
            results.push({ code, status: 'ok' });
        } catch (e) {
            results.push({ code, status: 'error', error: e.message });
        }
    }

    console.log('\nInfluencer coupon codes:\n');
    results.forEach(r => {
        if (r.status === 'ok') {
            console.log(`  ✓ ${r.code}`);
        } else {
            console.log(`  ✗ ${r.code}: ${r.error}`);
        }
    });
    console.log(`\n${results.filter(r => r.status === 'ok').length}/${results.length} codes created/updated.`);

    await mongoose.disconnect();
}

run().catch(e => { console.error(e.message); process.exit(1); });
