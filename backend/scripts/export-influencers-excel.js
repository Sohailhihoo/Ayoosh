require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const XLSX = require('xlsx');
const path = require('path');
const Affiliate = require('../models/Affiliate');

const HANDLE_MAP = {
    // Batch 1
    'lihle.ngcethane':           '@lihle.ngcethane',
    'esonavinqishe':             '@esona.vinqishe',
    'onkarabilekgomo':           '@onkarabile_kgomo',
    'amandamajola':              '@amanda.majola',
    'tylerpaigenefdt':           '@tylerpaigenefdt_',
    'healthylivingwithdaniella': '@healthylivingwithdaniella',
    // Batch 2
    'nathanielmpofu':            '@nathaniel_mpofu',
    'karabokza':                 '@karabo_kza',
    'juslihle':                  '@jus.lihle',
    'ashleygrupping':            '@ashleygrupping',
    'browwnskinned':             '@brownn.skinned',
    'melisheyns':                '@melis_heyns',
    'thegoodgutguru':            '@the_good_gut_guru',
    'julipoelihofficial':        '@julipoeli_official',
    'saylathompson':             '@sayla.thompson',
    'justsim':                   '@justsim',
    'biancarentzke':             '@bianca_rentzke',
    'owethungobese':             '@owethu_ngobese',
    'stormhannam':               '@storm.hannam',
    'agirlnamedcassidy':         '@agirlnamedcassidy',
    'lexaraegorlei':             '@lexaraegorlei',
    'oratilemororo':             '@oratilemororo',
    'xoxavier':                  '@xoxavier',
    'kylaamy':                   '@kylaamy',
    'calistastylista':           '@calistastylista',
    'talishagrobler':            '@talisha.grobler',
    'cheygooderson':             '@chey_gooderson',
    'milagoussard':              '@mila_goussard',
    'kingcollette':              '@king_collette',
    'flawlessmakeupbydonique':   '@flawlessmakeup_by_donique',
    'thedurbanmakeupartist':     '@thedurbanmakeupartist',
    'gwendalynhuang':            '@gwendalyn_huang',
    'yourdesigneryvndz':         '@yourdesigner.yvndz',
    'theskinfairymin':           '@theskinfairy_nin',
    'donemenezesgous':           '@done_menezes__gous',
    'ashhcliff':                 '@ashh_cliff',
    'kirstysmit':                '@kirsty.smit_',
    'kmalatsi':                  '@k_malatsi',
    'kgosii':                    '@kgosi_i',
    'kokeletsoo':                '@k.okeletsoo',
    'keamogetsweee':             '@keamogetswe_eee',
    'mpumemsomi':                '@mpumemsomi',
    'saffatash':                 '@saffatash',
    'zecktello':                 '@zecktello_',
    'mamelloponoane':            '@mamello__ponoane',
    'trentrowe':                 '@trentrowe',
    'mosalakaem':                '@mosalakaem',
    'sylviavisagie':             '@sylvia_visagie',
    // Batch 3
    'megmegmegannn':             '@megmegmegannn',
    'kisha':                     '@kisha_126',
    'sbongakonke':               '@sbongakonke_23',
};

function handleFromEmail(email) {
    const key = email.replace('@influencer.ayoosh', '');
    return HANDLE_MAP[key] || `@${key}`;
}

function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
}

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);

    const affiliates = await Affiliate.find({ email: /@influencer\.ayoosh$/ })
        .sort({ createdAt: 1 })
        .lean();

    const BASE = 'https://www.ayooshonline.com/products';

    const rows = affiliates.map((a, i) => ({
        '#': i + 1,
        'Instagram Handle': handleFromEmail(a.email),
        'First Name': a.firstName,
        'Last Name': a.lastName || '',
        'Affiliate Code': a.affiliateCode,
        'Referral Link': `${BASE}?ref=${a.affiliateCode}`,
        'Commission Rate': `${a.commissionRate}%`,
        'Status': a.status.charAt(0).toUpperCase() + a.status.slice(1),
        'Date Added': formatDate(a.createdAt),
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);

    // Column widths
    ws['!cols'] = [
        { wch: 4 },   // #
        { wch: 30 },  // Instagram Handle
        { wch: 16 },  // First Name
        { wch: 16 },  // Last Name
        { wch: 18 },  // Affiliate Code
        { wch: 60 },  // Referral Link
        { wch: 14 },  // Commission Rate
        { wch: 12 },  // Status
        { wch: 14 },  // Date Added
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Influencers');

    const outPath = path.join(__dirname, '../../influencer-affiliate-links.xlsx');
    XLSX.writeFile(wb, outPath);

    console.log(`\n✓ Exported ${rows.length} influencers to influencer-affiliate-links.xlsx\n`);

    await mongoose.disconnect();
    process.exit(0);
}

run().catch(e => { console.error(e.message); process.exit(1); });
