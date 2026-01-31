const mongoose = require('mongoose');
const Order = require('../models/Order');
require('dotenv').config();

async function testPayFast() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/beauty-store');

        console.log("Finding pending order...");
        const order = await Order.findOne({ paymentStatus: 'pending' });

        if (!order) {
            console.log("No pending order found to test.");
            process.exit(0);
        }

        console.log(`Testing with Order ID: ${order._id}`);

        // Use native fetch
        const response = await fetch('http://localhost:5000/api/payfast/initiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: order._id })
        });

        const data = await response.json();
        console.log("Status:", response.status);
        if (response.ok) {
            console.log("SUCCESS");
            console.log("PayFast URL:", data.payfastUrl);
            console.log("Data:", data.paymentData);
        } else {
            console.log("FAILED");
            console.log(data);
        }

    } catch (err) {
        console.error("Test Error:", err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

testPayFast();
