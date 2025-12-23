const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

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
router.post('/', optionalAuth, async (req, res) => {
  try {
    const {
      customerDetails,
      shippingAddress,
      billingAddress,
      paymentMethod,
      shippingMethod = 'standard',
      customerNote
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

    // Get cart (user or guest)
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

    // Verify stock and build order items with snapshots
    const orderItems = [];
    for (const item of cart.items) {
      const product = item.product;

      if (!product || product.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: `Product "${item.product?.name || 'Unknown'}" is not available`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Only ${product.stock} available.`
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images?.[0] || null,  // Snapshot of product image
        sku: item.variant?.sku || product.sku,
        variant: item.variant,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity
      });
    }

    // Calculate shipping cost based on method
    const shippingCosts = {
      standard: 5.99,
      express: 12.99,
      overnight: 24.99,
      pickup: 0
    };

    const shippingCost = shippingCosts[shippingMethod] || 5.99;
    const taxRate = 0.08; // 8% tax
    const tax = Math.round(cart.subtotal * taxRate * 100) / 100;

    // Build customer details (from user or request body)
    const orderCustomerDetails = userId && req.user ? {
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      phone: req.user.phone
    } : customerDetails;

    // Create order
    const order = await Order.create({
      user: userId || null,
      guestSessionId: !userId ? sessionId : null,
      customerDetails: orderCustomerDetails,
      items: orderItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      subtotal: cart.subtotal,
      shippingCost,
      tax,
      discount: cart.discountAmount,
      couponCode: cart.couponCode,
      total: cart.subtotal + shippingCost + tax - cart.discountAmount,
      paymentMethod,
      shippingMethod,
      customerNote,
      statusHistory: [{
        status: 'pending',
        note: 'Order created'
      }]
    });

    // Update product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity, soldCount: item.quantity }
      });
    }

    // Clear cart
    await cart.clearCart();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        total: order.total,
        paymentMethod: order.paymentMethod
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
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
