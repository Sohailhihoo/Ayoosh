require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const crypto = require('crypto');
const Affiliate = require('../models/Affiliate');

const influencers = [
    { firstName: 'Lihle',       lastName: 'Ngcethane' },
    { firstName: 'Esona',       lastName: 'Vinqishe' },
    { firstName: 'Onkarabile',  lastName: 'Kgomo' },
    { firstName: 'Amanda',      lastName: 'Majola' },
    { firstName: 'Tyler-Paige', lastName: 'Nefdt' },
    { firstName: 'Daniella',    lastName: 'Lagerwey' },
];

function makeCode(firstName) {
    const namePart = firstName.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
    const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `AY-${namePart}-${rand}`;
}

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);

    const BASE = 'https://www.ayooshonline.com/products';
    const results = [];

    for (const inf of influencers) {
        const code = makeCode(inf.firstName);
        const email = `${inf.firstName.toLowerCase().replace(/[^a-z]/g, '')}.${inf.lastName.toLowerCase()}@influencer.ayoosh`;
        try {
            const aff = await Affiliate.create({
                ...inf,
                email,
                affiliateCode: code,
                commissionRate: 5,
                commissionType: 'percentage',
                status: 'approved',
                approvedAt: new Date(),
            });
            results.push({
                name: `${inf.firstName} ${inf.lastName}`,
                code: aff.affiliateCode,
                link: `${BASE}?ref=${aff.affiliateCode}`,
            });
        } catch (e) {
            results.push({ name: `${inf.firstName} ${inf.lastName}`, error: e.message });
        }
    }

    console.log('\nAffiliate links created:\n');
    results.forEach(r => {
        if (r.error) {
            console.log(`  ✗ ${r.name}: ${r.error}`);
        } else {
            console.log(`  ${r.name} (${r.code})`);
            console.log(`    ${r.link}\n`);
        }
    });

    await mongoose.disconnect();
}

run().catch(e => { console.error(e.message); process.exit(1); });
