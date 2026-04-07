const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const Order = require('../models/Order');

async function viewOrders() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB\n');

  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .lean();

  if (orders.length === 0) {
    console.log('No orders found.');
    process.exit(0);
  }

  console.log(`=== ${orders.length} ORDER(S) FOUND ===\n`);

  orders.forEach((order, i) => {
    console.log(`--- Order ${i + 1} ---`);
    console.log(`Order Number:    ${order.orderNumber}`);
    console.log(`Date:            ${new Date(order.createdAt).toLocaleString()}`);
    console.log(`Status:          ${order.status}`);
    console.log(`Payment Status:  ${order.paymentStatus}`);
    console.log(`Payment Method:  ${order.paymentMethod}`);
    console.log(`Total:           R ${order.total?.toFixed(2)}`);

    // Customer Details
    const cd = order.customerDetails || {};
    console.log(`\n  Customer:`);
    console.log(`    Name:    ${cd.firstName || ''} ${cd.lastName || ''}`);
    console.log(`    Email:   ${cd.email || 'N/A'}`);
    console.log(`    Phone:   ${cd.phone || 'N/A'}`);

    // Shipping Address
    const sa = order.shippingAddress || {};
    console.log(`\n  Shipping Address:`);
    console.log(`    Name:    ${sa.firstName || ''} ${sa.lastName || ''}`);
    console.log(`    Street:  ${sa.street || 'N/A'}`);
    console.log(`    City:    ${sa.city || 'N/A'}`);
    console.log(`    State:   ${sa.state || 'N/A'}`);
    console.log(`    Zip:     ${sa.zipCode || 'N/A'}`);
    console.log(`    Country: ${sa.country || 'N/A'}`);
    console.log(`    Phone:   ${sa.phone || 'N/A'}`);

    // Items
    console.log(`\n  Items:`);
    (order.items || []).forEach(item => {
      console.log(`    - ${item.name} x${item.quantity} @ R${item.price?.toFixed(2)} = R${item.total?.toFixed(2)}`);
    });

    console.log('\n' + '='.repeat(50) + '\n');
  });

  process.exit(0);
}

viewOrders().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
