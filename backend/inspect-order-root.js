const mongoose = require('mongoose');
require('dotenv').config();
const Order = require('./models/Order');

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
            console.log('PaymentStatus:', order.paymentStatus);
            console.log('CustomerDetails:', order.customerDetails);
            console.log('Total:', order.total);
        }
    } catch (error) {
        console.error(error);
    } finally {
        mongoose.connection.close();
    }
};

inspect();
