const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);

  const coupons = await Coupon.find().lean();
  console.log('=== COUPONS ===');
  coupons.forEach(c => console.log(JSON.stringify({ code: c.code, discountType: c.discountType, amount: c.amount, isActive: c.isActive })));

  const discountOrders = await Order.find({ discount: { $gt: 0 } }).lean();
  console.log('\n=== ORDERS WITH DISCOUNT > 0 ===');
  console.log('Count:', discountOrders.length);
  discountOrders.forEach(o => console.log(JSON.stringify({
    orderNumber: o.orderNumber, discount: o.discount, couponCode: o.couponCode, total: o.total
  })));

  const recent = await Order.find().sort({ createdAt: -1 }).limit(5).lean();
  console.log('\n=== LAST 5 ORDERS ===');
  recent.forEach(o => console.log(JSON.stringify({
    orderNumber: o.orderNumber,
    subtotal: o.subtotal,
    shipping: o.shippingCost,
    tax: o.tax,
    discount: o.discount,
    couponCode: o.couponCode,
    total: o.total
  })));

  process.exit(0);
}
check().catch(e => { console.error(e.message); process.exit(1); });
