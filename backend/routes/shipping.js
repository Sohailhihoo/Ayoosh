const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const bobgo = require('../lib/bobgo');

const ORIGIN = {
  company: process.env.SHIP_FROM_COMPANY || 'Ayoosh Online',
  street: process.env.SHIP_FROM_STREET || '1 Warehouse Rd',
  city: process.env.SHIP_FROM_CITY || 'Johannesburg',
  zip: process.env.SHIP_FROM_ZIP || '2000',
  country: process.env.SHIP_FROM_COUNTRY || 'ZA',
};

// POST /api/shipping/rates
// body: { destination: { street, city, zip, country }, items: [{ productId, quantity }] }
router.post('/rates', async (req, res, next) => {
  try {
    const { destination, items } = req.body;
    if (!destination?.city || !destination?.zip) {
      return res.status(400).json({ success: false, message: 'destination.city and zip are required' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'items required' });
    }

    const ids = items.map(i => i.productId);
    const products = await Product.find({ _id: { $in: ids } }).select('name weight dimensions price');
    const byId = new Map(products.map(p => [String(p._id), p]));

    const parcelItems = items.map(i => {
      const p = byId.get(String(i.productId));
      return {
        description: p?.name || 'item',
        quantity: i.quantity,
        weight: (p?.weight || 500) / 1000, // kg
        length: p?.dimensions?.length || 15,
        width: p?.dimensions?.width || 10,
        height: p?.dimensions?.height || 5,
        value: p?.price || 0,
      };
    });

    const rates = await bobgo.getRates({ origin: ORIGIN, destination, items: parcelItems });
    res.json({ success: true, rates, mock: bobgo.MOCK });
  } catch (err) { next(err); }
});

// POST /api/shipping/shipments
// body: { orderId, service_code }
router.post('/shipments', async (req, res, next) => {
  try {
    const { orderId, service_code } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const payload = {
      service_code,
      origin: ORIGIN,
      destination: {
        name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
        street: order.shippingAddress.street,
        city: order.shippingAddress.city,
        zip: order.shippingAddress.zipCode,
        country: order.shippingAddress.country || 'ZA',
        phone: order.shippingAddress.phone,
        email: order.customerDetails.email,
      },
      reference: order.orderNumber,
      items: order.items.map(i => ({ description: i.name, quantity: i.quantity, value: i.price })),
    };

    const shipment = await bobgo.createShipment(payload);

    order.trackingNumber = shipment.tracking_reference;
    order.carrier = shipment.courier || 'Bob Go';
    order.shippingMethod = 'standard';
    await order.save();

    res.json({ success: true, shipment, mock: bobgo.MOCK });
  } catch (err) { next(err); }
});

// GET /api/shipping/track/:ref
router.get('/track/:ref', async (req, res, next) => {
  try {
    const data = await bobgo.getTracking(req.params.ref);
    res.json({ success: true, tracking: data, mock: bobgo.MOCK });
  } catch (err) { next(err); }
});

// POST /api/shipping/webhook
// Bob Go posts status updates here; map tracking_reference -> order
router.post('/webhook', async (req, res) => {
  try {
    const { tracking_reference, status } = req.body || {};
    if (tracking_reference && status) {
      const order = await Order.findOne({ trackingNumber: tracking_reference });
      if (order) {
        const map = { 'collected': 'shipped', 'in-transit': 'shipped', 'delivered': 'delivered' };
        const next = map[status];
        if (next) await order.updateStatus(next, `Bob Go webhook: ${status}`);
      }
    }
    res.json({ received: true });
  } catch (err) {
    console.error('Bob Go webhook error', err);
    res.status(200).json({ received: true });
  }
});

module.exports = router;
