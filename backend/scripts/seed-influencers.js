require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Affiliate = require('../models/Affiliate');

const influencers = [
    { firstName: 'Lihle',       lastName: 'Ngcethane',  code: 'LIHLE10'       },
    { firstName: 'Esona',       lastName: 'Vinqishe',   code: 'ESONA10'       },
    { firstName: 'Onkarabile',  lastName: 'Kgomo',      code: 'ONKARABILE10'  },
    { firstName: 'Amanda',      lastName: 'Majola',     code: 'AMANDA10'      },
    { firstName: 'Tyler-Paige', lastName: 'Nefdt',      code: 'TYLERPAIGE10'  },
    { firstName: 'Daniella',    lastName: 'Lagerwey',   code: 'DANIELLA10'    },
    { firstName: 'Aisha',       lastName: 'Joosub',     code: 'FOUNDER10'     },  // @ayooshonthego
    { firstName: 'Veloura',     lastName: 'Fabric',     code: 'VELOURA10'     },  // @Velourafabric
];

const BASE = 'https://www.ayooshonline.com/products';

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);

    const results = [];

    for (const inf of influencers) {
        const email = `${inf.firstName.toLowerCase().replace(/[^a-z]/g, '')}.${inf.lastName.toLowerCase()}@influencer.ayoosh`;
        try {
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
            results.push({
                name: `${inf.firstName} ${inf.lastName}`,
                code: aff.affiliateCode,
                link: `${BASE}?ref=${aff.affiliateCode}`,
            });
        } catch (e) {
            results.push({ name: `${inf.firstName} ${inf.lastName}`, error: e.message });
        }
    }

    console.log('\nAffiliate links:\n');
    results.forEach(r => {
        if (r.error) {
            console.log(`  ✗ ${r.name}: ${r.error}`);
        } else {
            console.log(`  ${r.name}  (${r.code})`);
            console.log(`    ${r.link}\n`);
        }
    });

    await mongoose.disconnect();
}

run().catch(e => { console.error(e.message); process.exit(1); });
