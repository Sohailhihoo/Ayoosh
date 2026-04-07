const crypto = require('crypto');

const target = '3ca7fb55f081caaa1e2550624f03ef20';

const baseData = {
    merchant_id: '10045451',
    merchant_key: 'gia49ld4hmf0u',
    amount: '67.83',
    item_name: 'Order TEST-1234'
};

const passphrases = ['', 'password', 'sandbox', 'test'];
const itemNames = ['Order TEST-1234', 'Order+TEST-1234', 'Order%20TEST-1234'];

function generate(data, passphrase) {
    const sortedKeys = Object.keys(data).sort();
    let pfOutput = '';
    for (let key of sortedKeys) {
        if (data[key] !== '') {
            let val = String(data[key]).trim();
            // Try standard encoding
            val = encodeURIComponent(val).replace(/%20/g, '+');
            pfOutput += `${key}=${val}&`;
        }
    }
    let getString = pfOutput.slice(0, -1);
    if (passphrase) {
        getString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
    }
    return crypto.createHash('md5').update(getString).digest('hex');
}

console.log('Searching for:', target);

passphrases.forEach(pass => {
    itemNames.forEach(name => {
        const d = { ...baseData, item_name: name };
        const sig = generate(d, pass);
        if (sig === target) {
            console.log('FOUND MATCH!');
            console.log('Passphrase:', pass);
            console.log('Item Name:', name);
        }
    });
});
console.log('Done.');
