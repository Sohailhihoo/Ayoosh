const axios = require('axios');
const crypto = require('crypto');
const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const Order = require('../models/Order');

// Connect to DB to get an order
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to DB'))
    .catch(err => { console.error('DB Error', err); process.exit(1); });

const generateSignature = (data, passphrase = null) => {
    let pfOutput = '';
    const sortedKeys = Object.keys(data).sort();
    for (let key of sortedKeys) {
        if (data[key] !== '' && data[key] !== null && data[key] !== undefined) {
            let value = String(data[key]).trim(); // Plain value for simulation if sending form-url-encoded?
            // Wait, if we send as standard form-urlencoded body, axios handles encoding.
            // But the signature MUST be calculated on the generated string.
            // Let's use the EXACT logic from PayfastController to be consistent with what we expect.

            value = encodeURIComponent(value).replace(/%20/g, '+');
            pfOutput += `${key}=${value}&`;
        }
    }
    let getString = pfOutput.slice(0, -1);
    if (passphrase && passphrase.trim() !== '') {
        let pfPass = encodeURIComponent(passphrase.trim()).replace(/%20/g, '+');
        getString += `&passphrase=${pfPass}`;
    }
    return crypto.createHash('md5').update(getString).digest('hex');
};

const simulate = async () => {
    try {
        // Find the latest pending order
        const order = await Order.findOne({ paymentStatus: 'pending' }).sort({ createdAt: -1 });

        if (!order) {
            console.log('No pending orders found to test.');
            process.exit(0);
        }

        console.log(`Testing with Order: ${order.orderNumber} (${order._id})`);
        console.log(`Total: ${order.total}`);

        // Construct PayFast payload
        const pfData = {
            m_payment_id: order._id.toString(),
            pf_payment_id: '169000' + Math.floor(Math.random() * 10000),
            payment_status: 'COMPLETE',
            item_name: `Order ${order.orderNumber}`,
            item_description: 'Simulation Test',
            amount_gross: order.total.toFixed(2),
            amount_fee: '-2.00',
            amount_net: (order.total - 2).toFixed(2),
            custom_str1: '',
            custom_str2: '',
            custom_str3: '',
            custom_str4: '',
            custom_str5: '',
            custom_int1: '',
            custom_int2: '',
            custom_int3: '',
            custom_int4: '',
            custom_int5: '',
            name_first: order.customerDetails?.firstName || 'Test',
            name_last: order.customerDetails?.lastName || 'User',
            email_address: order.customerDetails?.email || 'test@example.com',
            merchant_id: process.env.PAYFAST_SANDBOX_MERCHANT_ID,
            signature: ''
        };

        // Remove empty fields (PayFast rule)
        Object.keys(pfData).forEach(key => {
            if (pfData[key] === '') delete pfData[key];
        });

        // Determine Passphrase
        const passphrase = process.env.PAYFAST_SANDBOX === 'true'
            ? process.env.PAYFAST_SANDBOX_PASSPHRASE
            : process.env.PAYFAST_PASSPHRASE;

        // Generate Signature
        pfData.signature = generateSignature(pfData, passphrase);
        console.log('Generated Simulation Signature:', pfData.signature);
        console.log('Passphrase used:', passphrase || 'None');

        // Send Request
        // We use URLSearchParams to send as application/x-www-form-urlencoded
        const params = new URLSearchParams();
        Object.keys(pfData).forEach(key => params.append(key, pfData[key]));

        const url = `${process.env.BACKEND_URL}/api/payfast/notify`;
        console.log(`Sending POST to: ${url}`);

        const response = await axios.post(url, params);
        console.log('Response Status:', response.status);
        console.log('Response Data:', response.data);

        if (response.status === 200) {
            console.log('SUCCESS! ITN Processed.');
        } else {
            console.log('FAILED (Non-200 Response)');
        }

    } catch (error) {
        console.error('Simulation Error:', error.response ? error.response.data : error.message);
    } finally {
        await mongoose.connection.close();
    }
};

simulate();
