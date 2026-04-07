const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/beauty-store';

console.log('Connecting to:', uri);

mongoose.connect(uri)
    .then(async () => {
        console.log('✅ Connected');

        try {
            const orderPath = path.join(__dirname, 'models', 'Order.js');
            console.log('Loading Order model from:', orderPath);
            const Order = require(orderPath);

            const count = await Order.countDocuments();
            console.log('Total Orders:', count);

            const pending = await Order.countDocuments({ status: 'pending' });
            console.log('Pending Order Status:', pending);

            const paid = await Order.countDocuments({ paymentStatus: 'paid' });
            console.log('Paid Payment Status:', paid);

            const recent = await Order.find().sort({ createdAt: -1 }).limit(5).lean();
            console.log('Recent Orders (Top 5):');
            recent.forEach(o => {
                console.log(`- ${o.orderNumber || o._id}: Status="${o.status}", Payment="${o.paymentStatus}", Total=${o.total}, Created=${o.createdAt}`);
            });

        } catch (e) {
            console.error('Error querying orders:', e);
        }

        mongoose.connection.close();
    })
    .catch(err => {
        console.error('❌ Connection error:', err);
        process.exit(1);
    });
