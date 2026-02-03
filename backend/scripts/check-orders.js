const mongoose = require('mongoose');
require('dotenv').config();
const Order = require('../models/Order');
const User = require('../models/User');

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        const userCount = await User.countDocuments();
        console.log(`\n👥 Total Users: ${userCount}`);
        if (userCount > 0) {
            const users = await User.find().select('firstName email role').lean();
            users.forEach(u => console.log(`   - ${u.role}: ${u.email} (${u.firstName})`));
        } else {
            console.log('   (No users found)');
        }

        const orderCount = await Order.countDocuments();
        console.log(`\n📦 Total Orders: ${orderCount}`);

        if (orderCount > 0) {
            const orders = await Order.find().populate('user', 'email').limit(3).lean();
            orders.forEach(o => {
                console.log(`   - ${o.orderNumber}: ${o.total} (${o.status}) - User: ${o.user ? o.user.email : 'Unassigned/Guest'}`);
            });
        } else {
            console.log('   (No orders found)');
        }
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
