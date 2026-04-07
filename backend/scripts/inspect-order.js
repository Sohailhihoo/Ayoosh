const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const Order = require('../models/Order');

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to DB'))
    .catch(err => { console.error('DB Error', err); process.exit(1); });

const inspect = async () => {
    try {
        const orderNumber = 'ORD-2602-8129';
        const order = await Order.findOne({ orderNumber });

        if (!order) {
            console.log('Order not found!');
        } else {
            console.log('Order Found:');
            console.log(JSON.stringify(order, null, 2));
            console.log('-----------------------------------');
            console.log('Customer Details:', order.customerDetails);
        }
    } catch (error) {
        console.error(error);
    } finally {
        mongoose.connection.close();
    }
};

inspect();
