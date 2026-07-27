const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { voidAffiliateCommission } = require('../utils/affiliateCommission');
const bobgo = require('../lib/bobgo');

const SHIP_FROM = {
  company: process.env.SHIP_FROM_COMPANY || 'Ayoosh Online',
  street: process.env.SHIP_FROM_STREET || '1 Warehouse Rd',
  city: process.env.SHIP_FROM_CITY || 'Johannesburg',
  zip: process.env.SHIP_FROM_ZIP || '2000',
  country: process.env.SHIP_FROM_COUNTRY || 'ZA',
};

// @route   GET /api/orders
// @desc    Get user's orders (customer) or all orders (admin)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sort = '-createdAt' } = req.query;

    const query = req.user.role === 'admin' ? {} : { user: req.user._id };
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'firstName lastName email')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Order.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const query = { _id: req.params.id };

    // Non-admin can only see their own orders
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    const order = await Order.findOne(query)
      .populate('user', 'firstName lastName email phone')
      .populate('items.product', 'name images slug');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/orders/number/:orderNumber
// @desc    Get order by order number
// @access  Public (with session) or Private
router.get('/number/:orderNumber', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'];
    const query = { orderNumber: req.params.orderNumber };

    // Admin can see any order
    if (req.user?.role === 'admin') {
      // No additional filter
    } else if (userId) {
      // Authenticated user - must own the order
      query.user = userId;
    } else if (sessionId) {
      // Guest - must match session ID
      query.guestSessionId = sessionId;
    } else {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const order = await Order.findOne(query)
      .populate('user', 'firstName lastName email phone')
      .populate('items.product', 'name images slug');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/orders
// @desc    Create a new order (supports guest and authenticated users)
// @access  Public (with session) or Private
// Uses MongoDB transactions to prevent race conditions on inventory
router.post('/', optionalAuth, async (req, res) => {
  const {
    customerDetails,
    shippingAddress,
    billingAddress,
    paymentMethod,
    shippingMethod = 'standard',
    shippingService,
    customerNote,
    couponCode: bodyCouponCode,
  } = req.body;

  const userId = req.user?._id;
  const sessionId = req.headers['x-session-id'];

  // Validate required fields for guests
  if (!userId && !customerDetails?.email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required for guest checkout'
    });
  }

  // Get cart (user or guest) - before transaction
  let cart;
  if (userId) {
    cart = await Cart.findOne({ user: userId }).populate('items.product');
  } else if (sessionId) {
    cart = await Cart.findOne({ sessionId }).populate('items.product');
  }

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Cart is empty'
    });
  }

  // Validate products are active before starting transaction
  for (const item of cart.items) {
    if (!item.product || item.product.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Product "${item.product?.name || 'Unknown'}" is not available`
      });
    }
  }

  // Transaction removed for standalone MongoDB compatibility
  // const session = await mongoose.startSession();
  // session.startTransaction();

  try {
    // ── Phase 1: validate inputs and fetch shipping BEFORE touching inventory ──
    // Any rejection here costs nothing — no stock has been decremented yet.

    const allFreeShipping = cart.items.every(item => item.product.freeShipping === true);

    let shippingCost = 0;
    if (!allFreeShipping) {
      if (!shippingAddress?.city || !shippingAddress?.zipCode) {
        return res.status(400).json({
          success: false,
          message: 'Shipping address must include city and postal code'
        });
      }
      let ratesFetched = false;
      try {
        const dest = {
          street: shippingAddress.street || '',
          city: shippingAddress.city,
          zip: shippingAddress.zipCode,
          country: 'ZA',
        };
        const parcelItems = cart.items.map(item => ({
          description: item.product.name,
          quantity: item.quantity,
          weight: 0.5,
          length: 15, width: 10, height: 5,
          value: item.product.price,
        }));
        const rates = await bobgo.getRates({ origin: SHIP_FROM, destination: dest, items: parcelItems });
        if (rates.length > 0) {
          const serviceCode = shippingService?.service_code;
          const matched = serviceCode ? rates.find(r => r.service_code === serviceCode) : null;
          shippingCost = (matched || rates[0]).total_price;
          ratesFetched = true;
        }
      } catch (bobgoErr) {
        console.error('[Orders] Bob Go rate fetch failed:', bobgoErr.message);
      }
      // Fail closed — never silently give free shipping to a paid-shipping cart
      if (!ratesFetched) {
        return res.status(503).json({
          success: false,
          message: 'Unable to calculate shipping at this time. Please try again in a moment.'
        });
      }
    }
    if (shippingCost < 0) shippingCost = 0;

    // ── Phase 2: atomically decrement stock (after all input validation passes) ──
    const orderItems = [];

    // Use for...of loop - correctly awaits each async operation sequentially
    for (const item of cart.items) {
      const product = item.product;

      // Atomic check-and-decrement within transaction
      // Only updates if stock >= requested quantity (prevents overselling)
      const updated = await Product.findOneAndUpdate(
        {
          _id: product._id,
          stock: { $gte: item.quantity }
        },
        {
          $inc: {
            stock: -item.quantity,
            soldCount: item.quantity
          }
        },
        { new: true }
      );

      // If ANY product fails, throw error → entire transaction rolls back
      if (!updated) {
        throw new Error(`Insufficient stock for "${product.name}". Please refresh the page.`);
      }

      // Use live catalog price — never trust the cart snapshot price
      const authorizedPrice = item.variant
        ? (updated.variants?.find(v => v.sku === item.variant?.sku)?.price ?? updated.price)
        : updated.price;

      // Build order item snapshot
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images?.[0]?.url || product.images?.[0] || null,
        sku: item.variant?.sku || product.sku,
        variant: item.variant,
        quantity: item.quantity,
        price: authorizedPrice,
        total: authorizedPrice * item.quantity
      });
    }
    const tax = 0;

    // Recompute subtotal from server-verified prices
    const serverSubtotal = orderItems.reduce((sum, i) => sum + i.total, 0);

    // Build customer details (from user or request body)
    const orderCustomerDetails = userId && req.user ? {
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      phone: req.user.phone
    } : customerDetails;

    // Apply coupon discount if present
    let discountAmount = 0;
    let couponCode = cart.couponCode || bodyCouponCode;

    if (couponCode) {
      const Coupon = require('../models/Coupon');
      const coupon = await Coupon.findOne({ code: couponCode, isActive: true });

      if (coupon && coupon.isValid(serverSubtotal)) {
        if (coupon.discountType === 'free_shipping') {
          discountAmount = shippingCost;
        } else if (coupon.discountType === 'fixed') {
          discountAmount = coupon.amount;
        } else if (coupon.discountType === 'percentage') {
          discountAmount = (serverSubtotal * coupon.amount) / 100;
        }

        // Also waive shipping if the coupon has freeShipping flag
        if (coupon.freeShipping && coupon.discountType !== 'free_shipping') {
          discountAmount += shippingCost;
        }

        // Ensure discount doesn't exceed total
        const grossTotal = serverSubtotal + shippingCost;
        if (discountAmount > grossTotal) {
          discountAmount = grossTotal;
        }

        // Increment usage
        await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
      } else {
        // Invalid/expired coupon — ignore silently
        couponCode = null;
        discountAmount = 0;
      }
    }

    // All stock updates succeeded → Create order within same transaction
    const order = await Order.create([{
      user: userId || null,
      guestSessionId: !userId ? sessionId : null,
      customerDetails: orderCustomerDetails,
      items: orderItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      subtotal: serverSubtotal,
      shippingCost,
      tax,
      discount: discountAmount,
      couponCode: couponCode,
      total: serverSubtotal + shippingCost + tax - discountAmount,
      paymentMethod,
      shippingMethod,
      shippingService: shippingService || undefined,
      carrier: shippingService?.courier,
      customerNote,
      statusHistory: [{
        status: 'pending',
        note: 'Order created'
      }]
    }]);

    // Clear cart within transaction
    await Cart.findByIdAndUpdate(
      cart._id,
      { items: [], subtotal: 0, discountAmount: 0, couponCode: null }
    );

    // await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        orderId: order[0]._id,
        orderNumber: order[0].orderNumber,
        total: order[0].total,
        paymentMethod: order[0].paymentMethod
      }
    });

  } catch (error) {
    // await session.abortTransaction();

    res.status(400).json({
      success: false,
      message: error.message
    });

  } finally {
    // session.endSession();
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.put('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, note, trackingNumber, carrier } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update tracking info if shipping
    if (status === 'shipped') {
      if (trackingNumber) order.trackingNumber = trackingNumber;
      if (carrier) order.carrier = carrier;
    }

    await order.updateStatus(status, note, req.user._id);

    // Void affiliate commission on cancellation or return
    if (status === 'cancelled' || status === 'returned') {
      voidAffiliateCommission(order._id, `Order ${status}`).catch(() => {});
    }

    res.json({
      success: true,
      message: 'Order status updated',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check ownership
    if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Check if cancellable
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, soldCount: -item.quantity }
      });
    }

    await order.updateStatus('cancelled', req.body.reason || 'Cancelled by user', req.user._id);

    // Void any pending affiliate commission for this order (fire-and-forget)
    voidAffiliateCommission(order._id, 'Order cancelled').catch(() => {});

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/orders/stats
// @desc    Get order statistics
// @access  Private/Admin
router.get('/admin/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalOrders,
      todayOrders,
      monthOrders,
      pendingOrders,
      totalRevenue,
      monthRevenue
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.countDocuments({ createdAt: { $gte: thisMonth } }),
      Order.countDocuments({ status: 'pending' }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: thisMonth } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        todayOrders,
        monthOrders,
        pendingOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthRevenue: monthRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
