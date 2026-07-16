require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const crypto = require('crypto');
const Affiliate = require('../models/Affiliate');

// Skipped from PDF:
//   megmegmegannn (Megan Neethling) — already added in batch 3
//   Simmy                           — no IG handle / no last name
//   Amanda Nyaba                    — no IG handle (possible duplicate of _quinvee05)

const influencers = [
    { handle: 'nthabiseng_a.m',      firstName: 'Nthabiseng Anita', lastName: 'Molemoh' },
    { handle: 'precious__laka',      firstName: 'Precious Laka',    lastName: 'Laka' },
    { handle: 'nolubabalo_sodladla', firstName: 'Nolubabalo',       lastName: 'Sodladla' },
    { handle: 'anreathequeen',       firstName: 'Anrea Scott',      lastName: 'September' },
    { handle: 'zarziiie',            firstName: 'Zara Leah',        lastName: 'Smit' },
    { handle: 'mihlalii_matyantya',  firstName: 'Mihlali',          lastName: 'Matyantya' },
    { handle: 'miss.jugar',          firstName: 'Rheah',            lastName: 'Jugar' },
    { handle: '_quinvee05',          firstName: 'Amanda Vee',       lastName: 'Nyaba' },
    { handle: 'rolenenaffouj',       firstName: 'Rolene',           lastName: 'Naffouj' },
    { handle: 'sanelisiwe_jaca',     firstName: 'Sanelisiwe',       lastName: 'Jaca' },
    { handle: 'kirsty_ackermann',    firstName: 'Kirsty',           lastName: 'Ackermann' },
];

function makeCode(handle) {
    const part = handle.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase();
    const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `AY-${part}-${rand}`;
}

const toEmail = handle => `${handle.toLowerCase().replace(/[^a-z0-9]/g, '')}@influencer.ayoosh`;

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);

    const BASE = 'https://www.ayooshonline.com/products';
    const results = [];

    for (const inf of influencers) {
        const email = toEmail(inf.handle);
        const existing = await Affiliate.findOne({ email });
        if (existing) {
            results.push({
                handle: inf.handle,
                name: `${inf.firstName} ${inf.lastName}`.trim(),
                code: existing.affiliateCode,
                link: `${BASE}?ref=${existing.affiliateCode}`,
                skipped: true,
            });
            continue;
        }
        const code = makeCode(inf.handle);
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

    console.log('\n====================================');
    console.log('  AYOOSH INFLUENCER AFFILIATE LINKS');
    console.log('         BATCH 4');
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
