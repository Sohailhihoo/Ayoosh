const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Order = require('../models/Order');

const checkOrders = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const orders = await Order.find().sort({ createdAt: -1 }).limit(5);

        console.log('\n=== LATEST 5 ORDERS ===');
        orders.forEach(o => {
            console.log(`Order: ${o.orderNumber}`);
            console.log(`Status: ${o.status}`);
            console.log(`Payment: ${o.paymentStatus}`);
            console.log(`Total: ${o.total}`);
            console.log(`Created: ${o.createdAt}`);
            if (o.statusHistory.length > 0) {
                console.log('History:', o.statusHistory.map(h => `${h.status} (${h.note})`).join(' -> '));
            }
            console.log('---');
        });

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

checkOrders();
