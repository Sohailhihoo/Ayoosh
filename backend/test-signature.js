const crypto = require('crypto');

// Test data - Sandbox Credentials
const testData = {
    merchant_id: '10045451',
    merchant_key: 'gia49ld4hmf0u',

    // DUMMY VALUES FOR TESTING - THESE DO NOT AFFECT ACTUAL PAYMENTS
    amount: '100.00',
    item_name: 'Test Item',

    // Minimal required fields for PayFast might include these, but for signature check of specific fields we keep them commented or matching user's input
    // return_url: 'https://www.example.com/return',
    // cancel_url: 'https://www.example.com/cancel',
    // notify_url: 'https://www.example.com/notify',
};

const passphrase = ''; // Sandbox usually has no passphrase

// URL encode for PayFast (spaces as +)
function urlencode(str) {
    return encodeURIComponent(str).replace(/%20/g, '+');
}

function generateSignature(data, passphrase) {
    const sortedKeys = Object.keys(data).sort();
    let pfOutput = '';

    for (let key of sortedKeys) {
        if (data[key] !== '' && data[key] !== null && data[key] !== undefined) {
            const value = String(data[key]).trim(); // Trim input
            const encodedValue = urlencode(value);
            pfOutput += `${key}=${encodedValue}&`;
        }
    }

    let getString = pfOutput.slice(0, -1);

    if (passphrase && passphrase.trim() !== '') {
        getString += `&passphrase=${urlencode(passphrase.trim())}`;
    }

    console.log('==========================================');
    console.log('TEST SIGNATURE GENERATION');
    console.log('==========================================');
    console.log('Data Keys:', sortedKeys);
    console.log('Signature String:', getString);
    console.log('Passphrase:', passphrase ? `"${passphrase}"` : 'NONE');
    console.log('');

    const hash = crypto.createHash('md5').update(getString).digest('hex');

    console.log('Generated Signature:', hash);
    console.log('Note: This signature requires specific fields. If you send more fields to PayFast, they MUST be included here.');
    console.log('==========================================');


    return hash;
}

generateSignature(testData, passphrase);
