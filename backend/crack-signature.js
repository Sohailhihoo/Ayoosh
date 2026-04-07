const crypto = require('crypto');

const target = 'b8052f2099458fa62988c0dd8878dcf4'; // The hash from your logs

const baseData = {
    merchant_id: '10045451',
    merchant_key: 'gia49ld4hmf0u',
    // We will guess these:
    // amount: '67.83',
    // item_name: 'Order ORD-2602-5745',
    // item_description: '1 item(s) from Ayoosh Online',

    // Constant-ish
    cell_number: '0821234567',
    custom_str1: '69805a7cd3da1b12a66bca5f',
    custom_str2: 'ORD-2602-5745',
    email_address: 'productionm478@gmail.com',
    m_payment_id: '69805a7cd3da1b12a66bca5f',
    name_first: 'Muhammad',
    name_last: 'Sohail', // Assuming from previous context
    notify_url: 'https://labially-savorier-kyra.ngrok-free.dev/api/payfast/notify',
    return_url: 'http://localhost:3000/order-confirmation?orderId=69805a7cd3da1b12a66bca5f&status=success',
    cancel_url: 'http://localhost:3000/checkout?cancelled=true&orderId=69805a7cd3da1b12a66bca5f'
};

const amounts = ['67.83', '100.00', '67.00'];
const descriptions = [
    '1 item(s) from Ayoosh Online',
    '2 item(s) from Ayoosh Online',
    'Test order from integration',
    'Order Test Item'
];
const itemNames = ['Order ORD-2602-5745', 'Order TEST-1234'];
const names = ['Sohail', 'Khan', 'User']; // Guessing last name

function generate(data) {
    const sortedKeys = Object.keys(data).sort();
    let pfOutput = '';
    for (let key of sortedKeys) {
        if (data[key] !== '') {
            let val = String(data[key]).trim();
            val = encodeURIComponent(val).replace(/%20/g, '+');
            pfOutput += `${key}=${val}&`;
        }
    }
    let getString = pfOutput.slice(0, -1);
    // No passphrase
    return crypto.createHash('md5').update(getString).digest('hex');
}

console.log('Cracking signature...');

amounts.forEach(amt => {
    itemNames.forEach(iName => {
        descriptions.forEach(desc => {
            const d = {
                ...baseData,
                amount: amt,
                item_name: iName,
                item_description: desc
            };
            const sig = generate(d);
            if (sig === target) {
                console.log('MATCH FOUND!');
                console.log(d);
            }
        });
    });
});
console.log('Done.');
