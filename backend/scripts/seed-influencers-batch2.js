require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const crypto = require('crypto');
const Affiliate = require('../models/Affiliate');

const influencers = [
    { handle: 'nathaniel_mpofu',           firstName: 'Nathaniel',    lastName: 'Mpofu' },
    { handle: 'karabo_kza',                 firstName: 'Karabo',       lastName: 'Kza' },
    { handle: 'jus.lihle',                  firstName: 'Jus',          lastName: 'Lihle' },
    { handle: 'tylerpaigenefdt_',           firstName: 'Tyler-Paige',  lastName: 'Nefdt' },
    { handle: 'healthylivingwithdaniella',  firstName: 'Daniella',     lastName: 'Healthy' },
    { handle: 'esona',                      firstName: 'Esona',        lastName: 'Influencer' },
    { handle: 'ashleygrupping',             firstName: 'Ashley',       lastName: 'Grupping' },
    { handle: 'amanda_surname',             firstName: 'Amanda',       lastName: 'Surname' },
    { handle: 'brownn.skinned',             firstName: 'Brownn',       lastName: 'Skinned' },
    { handle: 'melis_heyns',               firstName: 'Melis',        lastName: 'Heyns' },
    { handle: 'the_good_gut_guru',          firstName: 'The',          lastName: 'GoodGutGuru' },
    { handle: 'julipoeli_official',         firstName: 'Juli',         lastName: 'Poeli' },
    { handle: 'sayla.thompson',             firstName: 'Sayla',        lastName: 'Thompson' },
    { handle: 'justsim',                    firstName: 'Just',         lastName: 'Sim' },
    { handle: 'bianca_rentzke',             firstName: 'Bianca',       lastName: 'Rentzke' },
    { handle: 'owethu_ngobese',             firstName: 'Owethu',       lastName: 'Ngobese' },
    { handle: 'storm.hannam',               firstName: 'Storm',        lastName: 'Hannam' },
    { handle: 'agirlnamedcassidy',          firstName: 'Cassidy',      lastName: 'AGirlNamed' },
    { handle: 'lexaraegorlei',              firstName: 'Lexa',         lastName: 'Raegorlei' },
    { handle: 'oratilemororo',              firstName: 'Oratile',      lastName: 'Mororo' },
    { handle: 'xoxavier',                   firstName: 'Xavier',       lastName: 'Xo' },
    { handle: 'kylaamy',                    firstName: 'Kyla',         lastName: 'Amy' },
    { handle: 'calistastylista',            firstName: 'Calista',      lastName: 'Stylista' },
    { handle: 'talisha.grobler',            firstName: 'Talisha',      lastName: 'Grobler' },
    { handle: 'chey_gooderson',             firstName: 'Chey',         lastName: 'Gooderson' },
    { handle: 'mila_goussard',              firstName: 'Mila',         lastName: 'Goussard' },
    { handle: 'king_collette',              firstName: 'Collette',     lastName: 'King' },
    { handle: 'flawlessmakeup_by_donique',  firstName: 'Donique',      lastName: 'Flawless' },
    { handle: 'thedurbanmakeupartist',      firstName: 'Durban',       lastName: 'MakeupArtist' },
    { handle: 'gwendalyn_huang',            firstName: 'Gwendalyn',    lastName: 'Huang' },
    { handle: 'yourdesigner.yvndz',         firstName: 'Yvndz',        lastName: 'YourDesigner' },
    { handle: 'theskinfairy_nin',           firstName: 'Nin',          lastName: 'TheSkinFairy' },
    { handle: 'done_menezes__gous',         firstName: 'Done',         lastName: 'MenezesGous' },
    { handle: 'ashh_cliff',                 firstName: 'Ash',          lastName: 'Cliff' },
    { handle: 'kirsty.smit_',              firstName: 'Kirsty',       lastName: 'Smit' },
    { handle: 'k_malatsi',                  firstName: 'K',            lastName: 'Malatsi' },
    { handle: 'kgosi_i',                    firstName: 'Kgosi',        lastName: 'I' },
    { handle: 'k.okeletsoo',                firstName: 'K',            lastName: 'Okeletsoo' },
    { handle: 'keamogetswe_eee',            firstName: 'Keamogetswe',  lastName: 'Eee' },
    { handle: 'mpumemsomi',                 firstName: 'Mpume',        lastName: 'Msomi' },
    { handle: 'saffatash',                  firstName: 'Saffa',        lastName: 'Tash' },
    { handle: 'zecktello_',                 firstName: 'Zecktello',    lastName: 'Influencer' },
    { handle: 'mamello__ponoane',           firstName: 'Mamello',      lastName: 'Ponoane' },
    { handle: 'trentrowe',                  firstName: 'Trent',        lastName: 'Rowe' },
    { handle: 'mosalakaem',                 firstName: 'Mosala',       lastName: 'Kaem' },
    { handle: 'sylvia_visagie',             firstName: 'Sylvia',       lastName: 'Visagie' },
];

function makeCode(handle) {
    const part = handle.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase();
    const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `AY-${part}-${rand}`;
}

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);

    const BASE = 'https://www.ayooshonline.com/products';
    const results = [];

    for (const inf of influencers) {
        const code = makeCode(inf.handle);
        const email = `${inf.handle.toLowerCase().replace(/[^a-z0-9]/g, '')}@influencer.ayoosh`;
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
                name: `${inf.firstName} ${inf.lastName}`,
                code: aff.affiliateCode,
                link: `${BASE}?ref=${aff.affiliateCode}`,
            });
        } catch (e) {
            results.push({ handle: inf.handle, name: `${inf.firstName} ${inf.lastName}`, error: e.message });
        }
    }

    console.log('\n====================================');
    console.log('  AYOOSH INFLUENCER AFFILIATE LINKS');
    console.log('====================================\n');

    results.forEach(r => {
        if (r.error) {
            console.log(`  ✗ @${r.handle}: ${r.error}`);
        } else {
            console.log(`  @${r.handle} (${r.code})`);
            console.log(`    ${r.link}\n`);
        }
    });

    const added = results.filter(r => !r.error).length;
    const failed = results.filter(r => r.error).length;
    console.log(`====================================`);
    console.log(`  Added: ${added} | Failed/Skipped: ${failed}`);
    console.log(`====================================\n`);

    await mongoose.disconnect();
    process.exit(0);
}

run().catch(e => { console.error(e.message); process.exit(1); });
