require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const crypto = require('crypto');
const Affiliate = require('../models/Affiliate');

const influencers = [
    { handle: 'megmegmegannn', firstName: 'Megan',       lastName: 'Neethling' },
    { handle: 'kisha_126',     firstName: 'Mwila',       lastName: '-' },
    { handle: 'sbongakonke_23',firstName: 'Sbongakonke', lastName: '-' },
];

// Email helper (must match the one used in the loop below)
const toEmail = handle => `${handle.toLowerCase().replace(/[^a-z0-9]/g, '')}@influencer.ayoosh`;

function makeCode(handle) {
    const part = handle.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase();
    const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `AY-${part}-${rand}`;
}

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);

    const BASE = 'https://www.ayooshonline.com/products';
    const results = [];

    // Add the 3 new influencers
    for (const inf of influencers) {
        const code = makeCode(inf.handle);
        const email = toEmail(inf.handle);
        const existing = await Affiliate.findOne({ email });
        if (existing) {
            results.push({
                handle: inf.handle,
                name: `${inf.firstName} ${inf.lastName}`.trim(),
                code: existing.affiliateCode,
                link: `${BASE}?ref=${existing.affiliateCode}`,
            });
            continue;
        }
        try {
            const aff = await Affiliate.create({
                firstName: inf.firstName,
                lastName: inf.lastName,
                email,
                affiliateCode: code,
                commissionRate: 5,
                commissionType: 'percentage',
                status: 'approved',
                approvedAt: new Date(),
            });
            results.push({
                handle: inf.handle,
                name: `${inf.firstName} ${inf.lastName}`.trim(),
                code: aff.affiliateCode,
                link: `${BASE}?ref=${aff.affiliateCode}`,
            });
        } catch (e) {
            results.push({ handle: inf.handle, name: `${inf.firstName} ${inf.lastName}`.trim(), error: e.message });
        }
    }

    // Update Kokeletso's real name (already seeded in batch 2 as "K Okeletsoo")
    const kokeletso = await Affiliate.findOneAndUpdate(
        { email: 'kokeletsoo@influencer.ayoosh' },
        { firstName: 'Kokeletso', lastName: 'Rangwaga' },
        { new: true }
    );
    if (kokeletso) {
        results.push({
            handle: 'k.okeletsoo',
            name: 'Kokeletso Rangwaga (updated)',
            code: kokeletso.affiliateCode,
            link: `${BASE}?ref=${kokeletso.affiliateCode}`,
        });
    } else {
        results.push({ handle: 'k.okeletsoo', name: 'Kokeletso Rangwaga', error: 'Existing record not found — may need manual update' });
    }

    console.log('\n====================================');
    console.log('  AYOOSH INFLUENCER AFFILIATE LINKS');
    console.log('         BATCH 3');
    console.log('====================================\n');

    results.forEach(r => {
        if (r.error) {
            console.log(`  ✗ @${r.handle} (${r.name}): ${r.error}`);
        } else {
            console.log(`  @${r.handle} (${r.name})`);
            console.log(`  Code: ${r.code}`);
            console.log(`  Link: ${r.link}\n`);
        }
    });

    const added = results.filter(r => !r.error).length;
    const failed = results.filter(r => r.error).length;
    console.log(`====================================`);
    console.log(`  Added/Updated: ${added} | Failed/Skipped: ${failed}`);
    console.log(`====================================\n`);

    await mongoose.disconnect();
    process.exit(0);
}

run().catch(e => { console.error(e.message); process.exit(1); });
