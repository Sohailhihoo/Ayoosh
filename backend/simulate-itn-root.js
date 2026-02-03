const axios = require('axios');
const crypto = require('crypto');
const mongoose = require('mongoose');
require('dotenv').config();
const Order = require('./models/Order');

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to DB'))
    .catch(err => { console.error('DB Error', err); process.exit(1); });

const generateSignature = (data, passphrase = null) => {
    let pfOutput = '';
    const sortedKeys = Object.keys(data).sort();
    for (let key of sortedKeys) {
        if (data[key] !== '' && data[key] !== null && data[key] !== undefined) {
            let value = String(data[key]).trim();
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
        const order = await Order.findOne({ orderNumber: 'ORD-2602-8129' });

        if (!order) {
            console.log('Order ORD-2602-8129 not found!');
            process.exit(0);
        }

        console.log(`Testing with Order: ${order.orderNumber}`);
        console.log(`Customer:`, order.customerDetails);

        const pfData = {
            m_payment_id: order._id.toString(),
            pf_payment_id: '169999',
            payment_status: 'COMPLETE',
            item_name: `Order ${order.orderNumber}`,
            item_description: 'Simulation Test',
            amount_gross: order.total.toFixed(2),
            amount_fee: '-2.00',
            amount_net: (order.total - 2).toFixed(2),
            name_first: order.customerDetails?.firstName || '',
            name_last: order.customerDetails?.lastName || '',
            email_address: order.customerDetails?.email || '',
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

        // Send Request
        const params = new URLSearchParams();
        Object.keys(pfData).forEach(key => params.append(key, pfData[key]));

        const url = `${process.env.BACKEND_URL}/api/payfast/notify`;
        console.log(`Sending POST to: ${url}`);

        const response = await axios.post(url, params);
        console.log('Response Status:', response.status);

        if (response.status === 200) {
            console.log('SUCCESS! ITN Processed.');
        } else {
            console.log('FAILED');
        }

    } catch (error) {
        console.error('Simulation Error:', error.response ? error.response.data : error.message);
    } finally {
        await mongoose.connection.close();
    }
};

simulate();
