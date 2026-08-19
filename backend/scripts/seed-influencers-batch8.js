require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const crypto = require('crypto');
const Affiliate = require('../models/Affiliate');

// Notes:
//   Sane Thinasonke Duze    — handle sanelisiwe63; "Sane" is first name; coupon SANE10
//                             (SANELISIWE10 already exists for a different influencer)
//   Tayla Kirsten Alblas    — handle chane_ehlers does not match real name (intentional)
//   _jayden_king_ (Jayden King) — already seeded in batch 7, will be skipped

const influencers = [
    { handle: 'sanelisiwe63',     firstName: 'Sane',          lastName: 'Thinasonke Duze' },
    { handle: 'nicole_tribelhorn', firstName: 'Nicole',        lastName: 'Tribelhorn'      },
    { handle: 'nanettexmeyer',    firstName: 'Nanette',        lastName: 'Meyer'           },
    { handle: '_jayden_king_',    firstName: 'Jayden',         lastName: 'King'            },
    { handle: 'chane_ehlers',     firstName: 'Tayla Kirsten',  lastName: 'Alblas'          },
];

function makeCode(seed) {
    const part = seed.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase();
    const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `AY-${part}-${rand}`;
}

const toEmail = (handle, firstName, lastName) => {
    if (handle) return `${handle.toLowerCase().replace(/[^a-z0-9]/g, '')}@influencer.ayoosh`;
    return `${firstName.toLowerCase()}${lastName.toLowerCase().replace(/[^a-z]/g, '')}@influencer.ayoosh`;
};

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);

    const BASE = 'https://www.ayooshonline.com/products';
    const results = [];

    for (const inf of influencers) {
        const email = toEmail(inf.handle, inf.firstName, inf.lastName);
        const existing = await Affiliate.findOne({ email });
        if (existing) {
            results.push({
                handle: inf.handle || '(none)',
                name: `${inf.firstName} ${inf.lastName}`.trim(),
                code: existing.affiliateCode,
                link: `${BASE}?ref=${existing.affiliateCode}`,
                skipped: true,
            });
            continue;
        }
        const codeSeed = inf.handle || (inf.firstName + inf.lastName);
        const code = makeCode(codeSeed);
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
                handle: inf.handle || '(none)',
                name: `${inf.firstName} ${inf.lastName}`.trim(),
                code: aff.affiliateCode,
                link: `${BASE}?ref=${aff.affiliateCode}`,
            });
        } catch (e) {
            results.push({ handle: inf.handle || '(none)', name: `${inf.firstName} ${inf.lastName}`.trim(), error: e.message });
        }
    }

    console.log('\n====================================');
    console.log('  AYOOSH INFLUENCER AFFILIATE LINKS');
    console.log('         BATCH 8');
    console.log('====================================\n');

    results.forEach(r => {
        if (r.error) {
            console.log(`  ✗ @${r.handle} (${r.name}): ${r.error}`);
        } else if (r.skipped) {
            console.log(`  ~ @${r.handle} (${r.name}) — already exists, skipped`);
            console.log(`    ${r.link}\n`);
        } else {
            console.log(`  @${r.handle} (${r.name})`);
            console.log(`  Code: ${r.code}`);
            console.log(`  Link: ${r.link}\n`);
        }
    });

    const added   = results.filter(r => !r.error && !r.skipped).length;
    const skipped = results.filter(r => r.skipped).length;
    const failed  = results.filter(r => r.error).length;
    console.log(`====================================`);
    console.log(`  Added: ${added} | Skipped (existing): ${skipped} | Failed: ${failed}`);
    console.log(`====================================\n`);

    await mongoose.disconnect();
    process.exit(0);
}

run().catch(e => { console.error(e.message); process.exit(1); });
